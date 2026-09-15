import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles = [], requireApprovedFarmer = false }) {
  const { user, isAuthenticated, isLoading, role, farmerStatus } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">Checking authorization...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization (ADMINISTRATOR always has access)
  if (allowedRoles.length > 0 && role !== 'ADMINISTRATOR' && !allowedRoles.includes(role)) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-2xl shadow-sm border border-slate-100 text-center">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
        <p className="mt-2 text-sm text-slate-600">
          This portal requires one of the following roles: <span className="font-semibold text-slate-800">{allowedRoles.join(', ')}</span>.
          Your current account role is <span className="font-semibold text-slate-800">{role}</span>.
        </p>
      </div>
    );
  }

  // Check approved farmer requirement
  if (requireApprovedFarmer && role !== 'ADMINISTRATOR' && farmerStatus !== 'Approved') {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-2xl shadow-sm border border-amber-200 text-center">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Farmer Verification Pending</h2>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          Your farmer profile is currently in status: <span className="font-bold text-amber-600">{farmerStatus || 'Pending'}</span>.
          Once the platform administrator verifies your farm credentials, you will be granted full access to publish products and manage inventory.
        </p>
      </div>
    );
  }

  return children;
}
