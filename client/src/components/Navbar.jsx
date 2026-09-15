import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';
import {
  Sprout,
  ShoppingCart,
  Bell,
  User,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  ChevronDown,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Wheat
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, role, logout } = useAuth();
  const { cartCount } = useCart();
  const { unreadCount, isOpen: notifOpen, setIsOpen: setNotifOpen } = useNotifications();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/login');
  };

  const getDashboardPath = () => {
    switch (role) {
      case 'ADMINISTRATOR':
        return '/admin/dashboard';
      case 'FARMER':
        return '/farmer/dashboard';
      case 'DELIVERY_SERVICE':
        return '/delivery/dashboard';
      case 'SELLER_BUYER':
      case 'USER':
      default:
        return '/buyer/dashboard';
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case 'ADMINISTRATOR':
        return <ShieldCheck className="w-4 h-4 text-purple-600" />;
      case 'FARMER':
        return <Wheat className="w-4 h-4 text-emerald-600" />;
      case 'DELIVERY_SERVICE':
        return <Truck className="w-4 h-4 text-amber-600" />;
      default:
        return <ShoppingBag className="w-4 h-4 text-blue-600" />;
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-2xl bg-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:bg-emerald-800 transition-colors">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-2xl font-extrabold tracking-tight text-emerald-950">AGRI</span>
                <span className="text-2xl font-extrabold tracking-tight text-emerald-600">SHOP</span>
              </div>
              <p className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                IAI Cameroon • SE Level 2
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-semibold transition-colors ${
                isActive('/') ? 'text-emerald-700 font-bold' : 'text-slate-600 hover:text-emerald-600'
              }`}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`text-sm font-semibold transition-colors ${
                isActive('/products') ? 'text-emerald-700 font-bold' : 'text-slate-600 hover:text-emerald-600'
              }`}
            >
              Marketplace
            </Link>
            <Link
              to="/about"
              className={`text-sm font-semibold transition-colors ${
                isActive('/about') ? 'text-emerald-700 font-bold' : 'text-slate-600 hover:text-emerald-600'
              }`}
            >
              About Project
            </Link>

            {/* Quick Access to Actor Dashboard if Authenticated */}
            {isAuthenticated && (
              <Link
                to={getDashboardPath()}
                className="inline-flex items-center space-x-2 text-sm font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200/60 hover:bg-emerald-100/70 transition-all"
              >
                {getRoleIcon()}
                <span>{role.replace('_', ' ')} Portal</span>
              </Link>
            )}
          </div>

          {/* Action Buttons: Cart, Notifications, User Menu */}
          <div className="flex items-center space-x-3">
            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50 transition-colors"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-emerald-600 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Notifications Button */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2.5 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <NotificationDropdown />
              </div>
            )}

            {/* User Profile / Auth State */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                >
                  <img
                    src={user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                    alt={user?.name}
                    className="w-9 h-9 rounded-xl object-cover border border-emerald-200"
                  />
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                      {user?.name?.split(' ')[0]}
                    </p>
                    <p className="text-[10px] font-semibold text-emerald-600 uppercase">
                      {role.replace('_', ' ')}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 hidden lg:block" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                        <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                        <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Role: {role.replace('_', ' ')}
                        </div>
                      </div>

                      <Link
                        to={getDashboardPath()}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>My Dashboard</span>
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile & Settings</span>
                      </Link>

                      {(role === 'USER' || role === 'SELLER_BUYER') && (
                        <Link
                          to="/buyer/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>My Orders</span>
                        </Link>
                      )}

                      {role === 'FARMER' && (
                        <Link
                          to="/farmer/products"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors"
                        >
                          <Wheat className="w-4 h-4" />
                          <span>Manage My Farm Products</span>
                        </Link>
                      )}

                      <div className="my-1 border-t border-slate-100"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-xs font-bold text-slate-700 hover:text-emerald-700 px-3 py-2 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 px-4 py-2 rounded-xl shadow-sm transition-all"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
          >
            Home
          </Link>
          <Link
            to="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
          >
            Marketplace
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
          >
            About Project
          </Link>
          {isAuthenticated && (
            <Link
              to={getDashboardPath()}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-bold text-emerald-700 bg-emerald-50"
            >
              {role.replace('_', ' ')} Dashboard
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
