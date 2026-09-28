import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Sprout,
  UserPlus,
  AlertCircle,
  Wheat,
  ShoppingBag,
  Truck,
  CheckCircle2
} from 'lucide-react';

export default function Register() {
  const [role, setRole] = useState('USER');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: 'Yaounde',
    address: '',
    // Farmer fields
    farmName: '',
    farmLocation: '',
    farmSize: '',
    nationalId: '',
    specialization: ''
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await register({
        ...formData,
        role
      });

      if (role === 'FARMER') {
        navigate('/farmer/dashboard');
      } else if (role === 'DELIVERY_SERVICE') {
        navigate('/delivery/dashboard');
      } else {
        navigate('/buyer/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-700 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-700/20">
            <Sprout className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Join the AGRISHOP Platform
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Select your platform role and create your authenticated account.
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="bg-slate-100 p-1.5 rounded-2xl grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => setRole('USER')}
            className={`py-3 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 ${
              role === 'USER' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Customer</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('FARMER')}
            className={`py-3 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 ${
              role === 'FARMER' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wheat className="w-4 h-4 text-emerald-600" />
            <span>Farmer / Producer</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('DELIVERY_SERVICE')}
            className={`py-3 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 ${
              role === 'DELIVERY_SERVICE' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-4 h-4 text-amber-600" />
            <span>Logistics Courier</span>
          </button>
        </div>

        {/* Registration Form */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Emmanuel Tanyi"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. emmanuel@gmail.com"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Telephone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+237 671 000 111"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City / Region</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="Yaounde">Yaounde (Centre)</option>
                  <option value="Douala">Douala (Littoral)</option>
                  <option value="Buea">Buea (South West)</option>
                  <option value="Bafoussam">Bafoussam (West)</option>
                  <option value="Bamenda">Bamenda (North West)</option>
                  <option value="Ngaoundere">Ngaoundere (Adamawa)</option>
                  <option value="Kribi">Kribi (South)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Delivery / Street Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. Molyko Street 4 or Rue des Palmiers, Akwa"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Specialized Farmer Fields */}
            {role === 'FARMER' && (
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800">
                  <Wheat className="w-4 h-4 text-emerald-600" />
                  <span>Agricultural Farm Details (For Admin Verification)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Farm / Cooperative Name</label>
                    <input
                      type="text"
                      name="farmName"
                      value={formData.farmName}
                      onChange={handleChange}
                      placeholder="e.g. Mount Fako Green Cooperative"
                      required={role === 'FARMER'}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Farm Location</label>
                    <input
                      type="text"
                      name="farmLocation"
                      value={formData.farmLocation}
                      onChange={handleChange}
                      placeholder="e.g. Buea, South West Region"
                      required={role === 'FARMER'}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Farm Size</label>
                    <input
                      type="text"
                      name="farmSize"
                      value={formData.farmSize}
                      onChange={handleChange}
                      placeholder="e.g. 15 Hectares"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Produce Specialization</label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      placeholder="e.g. Tomatoes, Pepper, Tubers"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-4"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isLoading ? 'Creating Account...' : 'Complete Registration'}</span>
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-emerald-700 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
