import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import Badge from '../../components/Badge';
import { ShoppingBag, Package, Clock, CheckCircle, Search, Filter } from 'lucide-react';

const STATUS_OPTIONS = ['ALL', 'Pending', 'Accepted', 'Processing', 'Ready for delivery', 'Out for delivery', 'Delivered', 'Cancelled', 'Rejected'];

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (search) params.set('search', search);
      const res = await apiRequest(`/orders/my-orders?${params.toString()}`);
      setOrders(res.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [statusFilter, search]);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'Pending').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">My Orders</h1>
        <p className="text-sm text-slate-500 mt-1">Track all your agricultural produce orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
          <p className="text-2xl font-extrabold text-slate-800">{stats.total}</p>
          <p className="text-xs text-slate-500 mt-1">Total Orders</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm text-center">
          <p className="text-2xl font-extrabold text-amber-600">{stats.pending}</p>
          <p className="text-xs text-slate-500 mt-1">Pending</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm text-center">
          <p className="text-2xl font-extrabold text-emerald-600">{stats.delivered}</p>
          <p className="text-xs text-slate-500 mt-1">Delivered</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === s ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center space-y-3">
          <ShoppingBag className="w-10 h-10 mx-auto text-slate-300" />
          <p className="font-bold text-slate-700">No orders found</p>
          <p className="text-xs text-slate-400">Try a different filter or place your first order.</p>
          <Link to="/products" className="inline-block mt-2 px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold">
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="font-extrabold text-slate-900 text-sm">{order.order_number}</span>
                    <Badge status={order.status} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Ordered: {new Date(order.created_at).toLocaleDateString()} | Payment: <span className="font-semibold">{order.payment_status}</span>
                  </p>
                  {order.tracking_code && (
                    <p className="text-xs text-slate-400">Tracking: <span className="font-mono text-emerald-700">{order.tracking_code}</span></p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-emerald-800 text-base">{Number(order.total_amount).toLocaleString()} FCFA</p>
                  <p className="text-xs text-slate-500">{order.total_items} item(s)</p>
                </div>
              </div>

              {/* Product preview */}
              <div className="mt-4 flex items-center space-x-3 overflow-x-auto pb-1">
                {(order.items || []).slice(0, 4).map((item) => (
                  <img
                    key={item.id}
                    src={item.image_url}
                    alt={item.product_name}
                    title={item.product_name}
                    className="w-10 h-10 rounded-lg object-cover border border-slate-100 flex-shrink-0"
                  />
                ))}
                {(order.items || []).length > 4 && (
                  <span className="text-xs text-slate-400">+{order.items.length - 4} more</span>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
                <Badge status={order.delivery_status || 'Pending'} />
                <Link
                  to={`/buyer/orders/${order.id}`}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
