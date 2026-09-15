import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Sprout,
  LogIn,
  AlertCircle,
  KeyRound,
  Mail,
  ShieldCheck,
  Wheat,
  Truck,
  ShoppingBag,
  Clock
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectAfterLogin = (role) => {
    const from = location.state?.from?.pathname;
    if (from && from !== '/login') {
      navigate(from, { replace: true });
      return;
    }

    switch (role) {
      case 'ADMINISTRATOR':
        navigate('/admin/dashboard');
        break;
      case 'FARMER':
        navigate('/farmer/dashboard');
        break;
      case 'DELIVERY_SERVICE':
        navigate('/delivery/dashboard');
        break;
      case 'SELLER_BUYER':
      case 'USER':
      default:
        navigate('/buyer/dashboard');
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await login(email, password);
      redirectAfterLogin(user.role);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick fill helper for jury evaluation
  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-700 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-700/20">
            <Sprout className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Sign In to AGRISHOP
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Access your agricultural marketplace portal, orders, or farm management.
          </p>
        </div>

        {/* Academic Demo Fast Login Panel */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 shadow-sm space-y-2.5">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Academic Defence Quick Credentials (1-Click Fill)</span>
          </div>
          <p className="text-[11px] text-emerald-700 leading-snug">
            Select an actor profile to automatically populate credentials for testing:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@agrishop.cm', 'Admin@12345')}
              className="px-2 py-1.5 bg-white hover:bg-emerald-100 text-slate-700 rounded-lg text-[11px] font-bold border border-emerald-200 text-left truncate flex items-center space-x-1"
            >
              <ShieldCheck className="w-3 h-3 text-purple-600 flex-shrink-0" />
              <span className="truncate">Administrator</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('farmer.buea@agrishop.cm', 'Farmer@12345')}
              className="px-2 py-1.5 bg-white hover:bg-emerald-100 text-slate-700 rounded-lg text-[11px] font-bold border border-emerald-200 text-left truncate flex items-center space-x-1"
            >
              <Wheat className="w-3 h-3 text-emerald-600 flex-shrink-0" />
              <span className="truncate">Approved Farmer</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('farmer.new@agrishop.cm', 'Farmer@12345')}
              className="px-2 py-1.5 bg-white hover:bg-emerald-100 text-slate-700 rounded-lg text-[11px] font-bold border border-emerald-200 text-left truncate flex items-center space-x-1"
            >
              <Clock className="w-3 h-3 text-amber-600 flex-shrink-0" />
              <span className="truncate">Pending Farmer</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('buyer.douala@agrishop.cm', 'Buyer@12345')}
              className="px-2 py-1.5 bg-white hover:bg-emerald-100 text-slate-700 rounded-lg text-[11px] font-bold border border-emerald-200 text-left truncate flex items-center space-x-1"
            >
              <ShoppingBag className="w-3 h-3 text-blue-600 flex-shrink-0" />
              <span className="truncate">Buyer (Douala)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('delivery.express@agrishop.cm', 'Delivery@12345')}
              className="px-2 py-1.5 bg-white hover:bg-emerald-100 text-slate-700 rounded-lg text-[11px] font-bold border border-emerald-200 text-left truncate flex items-center space-x-1 col-span-2 sm:col-span-1"
            >
              <Truck className="w-3 h-3 text-amber-600 flex-shrink-0" />
              <span className="truncate">Delivery Courier</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. farmer.buea@agrishop.cm"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-emerald-700 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
