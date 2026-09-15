const db = require('../config/database');

function hasRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // ADMINISTRATOR always has elevated access across modules
    if (req.user.role === 'ADMINISTRATOR' || roles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access forbidden. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}.`
    });
  };
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMINISTRATOR') {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden. Administrator privileges required.'
    });
  }
  next();
}

function requireApprovedFarmer(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  if (req.user.role === 'ADMINISTRATOR') {
    return next();
  }

  if (req.user.role !== 'FARMER') {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden. Only registered farmers can perform this operation.'
    });
  }

  // Check farmer profile validation status
  const profile = db.prepare('SELECT status FROM farmer_profiles WHERE user_id = ?').get(req.user.id);
  if (!profile) {
    return res.status(403).json({
      success: false,
      message: 'Farmer profile not found. Please complete farmer profile registration.'
    });
  }

  if (profile.status !== 'Approved') {
    return res.status(403).json({
      success: false,
      message: `Your farmer account is currently '${profile.status}'. Only validated and approved farmers can publish or manage market products.`
    });
  }

  req.farmerProfile = profile;
  next();
}

module.exports = {
  hasRole,
  requireAdmin,
  requireApprovedFarmer
};
