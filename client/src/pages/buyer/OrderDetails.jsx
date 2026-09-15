import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import Badge from '../../components/Badge';
import { ArrowLeft, MapPin, Phone, Package, Truck, CreditCard, CheckCircle, Printer } from 'lucide-react';

export default function OrderDetails() {
  const { id } = useParams();
  const location = useLocation();
  const justPlaced = location.state?.justPlaced;
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiRequest(`/orders/${id}`);
        if (res.success) setOrder(res.order);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!order) return (
    <div className="max-w-xl mx-auto py-20 text-center">
      <p className="text-slate-500">Order not found.</p>
      <Link to="/buyer/orders" className="mt-4 inline-block text-emerald-700 font-bold text-sm">← Back to Orders</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Success Banner */}
      {justPlaced && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center space-x-3">
          <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-bold text-emerald-900 text-sm">Order Placed Successfully!</p>
            <p className="text-xs text-emerald-700">Your order <span className="font-mono font-bold">{order.order_number}</span> has been received by the farmer.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/buyer/orders" className="flex items-center space-x-1 text-xs text-slate-500 hover:text-emerald-700 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders</span>
          </Link>
          <h1 className="text-xl font-extrabold text-slate-900">Order {order.order_number}</h1>
          <p className="text-xs text-slate-400 mt-1">{new Date(order.created_at).toLocaleString()}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge status={order.status} />
          <button onClick={() => window.print()} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl">
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Items */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Package className="w-4 h-4 text-emerald-600" />
            <span>Ordered Items</span>
          </h3>
          <div className="space-y-4">
            {(order.items || []).map((item) => (
              <div key={item.id} className="flex items-center space-x-4">
                <img src={item.image_url} alt={item.product_name} className="w-14 h-14 rounded-xl object-cover border border-slate-100 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">{item.product_name}</p>
                  <p className="text-xs text-slate-500">Farmer: {item.farmer_name} | {item.farm_name}</p>
                  <p className="text-xs text-slate-400">{item.quantity} {item.unit} × {Number(item.unit_price).toLocaleString()} FCFA</p>
                </div>
                <p className="font-extrabold text-emerald-800 text-sm flex-shrink-0">
                  {Number(item.subtotal).toLocaleString()} FCFA
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
            <span className="font-bold text-slate-800">Total Amount</span>
            <span className="text-xl font-black text-emerald-800">{Number(order.total_amount).toLocaleString()} FCFA</span>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>Delivery Details</span>
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500">Delivery Address</p>
                <p className="font-semibold text-slate-800">{order.delivery_address}, {order.delivery_city}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Recipient Phone</p>
                <p className="font-semibold text-slate-800">{order.delivery_phone}</p>
              </div>
            </div>
            {order.tracking_code && (
              <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-xs text-slate-500">Tracking Code</p>
                <p className="font-mono font-bold text-emerald-800">{order.tracking_code}</p>
                <div className="mt-1">
                  <Badge status={order.delivery_status || 'Pending'} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Payment Details</span>
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Status</span>
              <Badge status={order.payment_status} />
            </div>
            {order.payment_method && (
              <div className="flex justify-between">
                <span className="text-slate-500">Method</span>
                <span className="font-semibold text-slate-800">{order.payment_method?.replace(/_/g, ' ')}</span>
              </div>
            )}
            {order.transaction_ref && (
              <div className="flex justify-between">
                <span className="text-slate-500">Reference</span>
                <span className="font-mono text-xs font-bold text-slate-800">{order.transaction_ref}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Total Paid</span>
              <span className="font-extrabold text-emerald-800">{Number(order.total_amount).toLocaleString()} FCFA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
