import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { MapPin, CreditCard, Phone, CheckCircle, AlertCircle, Truck, ShoppingBag } from 'lucide-react';

const PAYMENT_METHODS = [
  { id: 'MTN_MOMO', label: 'MTN Mobile Money', icon: '📱', desc: 'Pay instantly via MTN MoMo' },
  { id: 'ORANGE_MONEY', label: 'Orange Money', icon: '🟠', desc: 'Pay via Orange Money Cameroon' },
  { id: 'CREDIT_CARD', label: 'Visa / Mastercard', icon: '💳', desc: 'Secure card payment' },
  { id: 'CASH_ON_DELIVERY', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when goods arrive' },
];

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    deliveryAddress: user?.address || '',
    deliveryCity: user?.city || 'Yaounde',
    deliveryPhone: user?.phone || '',
    notes: '',
    paymentMethod: 'MTN_MOMO',
    phoneNumber: user?.phone || '',
    lastFourDigits: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.deliveryAddress || !form.deliveryPhone) {
      setError('Please fill in delivery address and phone number.');
      return;
    }

    setIsLoading(true);
    try {
      const orderRes = await apiRequest('/orders', {
        method: 'POST',
        body: {
          items: cartItems.map(item => ({ productId: item.id, quantity: item.quantity })),
          deliveryAddress: form.deliveryAddress,
          deliveryCity: form.deliveryCity,
          deliveryPhone: form.deliveryPhone,
          notes: form.notes,
          paymentMethod: form.paymentMethod,
        }
      });

      if (orderRes.success) {
        clearCart();
        navigate(`/buyer/orders/${orderRes.order.id}`, {
          state: { justPlaced: true, orderNumber: orderRes.order.orderNumber }
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900">Checkout</h1>
        <p className="text-sm text-slate-500 mt-1">Complete your agricultural produce order</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Delivery + Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Details */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center space-x-2 font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span>Delivery Information</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Delivery Address *</label>
                <input
                  name="deliveryAddress"
                  value={form.deliveryAddress}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Rue des Palmiers 14, Akwa"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Delivery City *</label>
                  <select
                    name="deliveryCity"
                    value={form.deliveryCity}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Yaounde">Yaounde</option>
                    <option value="Douala">Douala</option>
                    <option value="Buea">Buea</option>
                    <option value="Bafoussam">Bafoussam</option>
                    <option value="Bamenda">Bamenda</option>
                    <option value="Ngaoundere">Ngaoundere</option>
                    <option value="Kribi">Kribi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Recipient Phone *</label>
                  <input
                    name="deliveryPhone"
                    value={form.deliveryPhone}
                    onChange={handleChange}
                    required
                    placeholder="+237 671 000 111"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Special Instructions (Optional)</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="e.g. Leave at gate, call upon arrival..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center space-x-2 font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span>Payment Method</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center space-x-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      form.paymentMethod === method.id
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={form.paymentMethod === method.id}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-xl">{method.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{method.label}</p>
                      <p className="text-[10px] text-slate-500">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {(form.paymentMethod === 'MTN_MOMO' || form.paymentMethod === 'ORANGE_MONEY') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Mobile Money Number</label>
                  <input
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    placeholder="+237 671 000 111"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Your number is never stored — only a masked reference is kept for auditing.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-28 space-y-4">
              <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3">Order Items</h3>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-500">Qty: {item.quantity} {item.unit}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-800 flex-shrink-0">
                      {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-bold">{cartTotal.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Payment</span>
                  <span className="font-semibold text-emerald-600">
                    {PAYMENT_METHODS.find(m => m.id === form.paymentMethod)?.label}
                  </span>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-xl p-3.5 border border-emerald-100">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 text-sm">Total to Pay</span>
                  <span className="text-lg font-black text-emerald-800">{cartTotal.toLocaleString()} FCFA</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-sm shadow-md flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{isLoading ? 'Placing Order...' : 'Place Order & Pay'}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
