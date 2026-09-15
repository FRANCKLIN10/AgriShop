import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/Badge';
import { ShoppingBag, Package, CheckCircle, Clock, ArrowRight } from 'lucide-react';

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiRequest('/orders/my-orders?limit=5');
        setOrders(res.orders || []);
      } catch (err) { console.error(err); }
      finally { setIsLoading(false); }
    }
    load();
  }, []);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => ['Pending', 'Accepted', 'Processing'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 rounded-3xl p-8 text-white">
        <div className="flex items-center space-x-4">
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white/40"
          />
          <div>
            <p className="text-emerald-200 text-sm">Welcome back,</p>
            <h1 className="text-2xl font-extrabold">{user?.name}</h1>
            <p className="text-emerald-200 text-xs mt-1">{user?.city} • Buyer Account</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center space-y-1">
          <ShoppingBag className="w-6 h-6 text-emerald-600 mx-auto" />
          <p className="text-2xl font-extrabold text-slate-900">{stats.total}</p>
          <p className="text-xs text-slate-500">Total Orders</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm text-center space-y-1">
          <Clock className="w-6 h-6 text-amber-500 mx-auto" />
          <p className="text-2xl font-extrabold text-amber-600">{stats.pending}</p>
          <p className="text-xs text-slate-500">In Progress</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm text-center space-y-1">
          <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto" />
          <p className="text-2xl font-extrabold text-emerald-700">{stats.delivered}</p>
          <p className="text-xs text-slate-500">Delivered</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { to: '/products', label: 'Browse Marketplace', icon: ShoppingBag, color: 'emerald' },
          { to: '/buyer/orders', label: 'My Orders', icon: Package, color: 'blue' },
          { to: '/buyer/history', label: 'Order History', icon: Clock, color: 'purple' },
          { to: '/profile', label: 'My Profile', icon: CheckCircle, color: 'amber' },
        ].map(({ to, label, icon: Icon, color }) => (
          <Link
            key={to}
            to={to}
            className={`bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center space-y-2 text-center group`}
          >
            <div className={`w-10 h-10 rounded-xl bg-${color}-50 text-${color}-600 flex items-center justify-center group-hover:bg-${color}-100 transition-colors`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-700">{label}</span>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900">Recent Orders</h3>
          <Link to="/buyer/orders" className="text-xs font-bold text-emerald-700 hover:underline flex items-center space-x-1">
            <span>View All</span><ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No orders yet. Start shopping!</p>
            <Link to="/products" className="mt-3 inline-block px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <Link
                key={order.id}
                to={`/buyer/orders/${order.id}`}
                className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <div>
                  <span className="font-bold text-slate-900 text-sm">{order.order_number}</span>
                  <p className="text-xs text-slate-400">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-emerald-800 text-sm">{Number(order.total_amount).toLocaleString()} FCFA</span>
                  <Badge status={order.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
