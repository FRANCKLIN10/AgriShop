import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, ShoppingBag, MapPin } from 'lucide-react';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 text-slate-300 flex items-center justify-center mx-auto">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Your cart is empty</h2>
          <p className="text-sm text-slate-500 mt-2">Browse the marketplace and add fresh agricultural products to your cart.</p>
        </div>
        <Link to="/products" className="inline-flex items-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-md transition-all">
          <ShoppingBag className="w-4 h-4" />
          <span>Browse Marketplace</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Order Cart</h1>
          <p className="text-sm text-slate-500 mt-1">{cartCount} item(s) from Cameroonian farms ready for order</p>
        </div>
        <button onClick={clearCart} className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center space-x-1">
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start space-x-4">
              <img
                src={item.image_url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=150&q=80'}
                alt={item.name}
                className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-slate-100"
              />
              <div className="flex-1 min-w-0 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm truncate">{item.name}</h4>
                <div className="flex items-center space-x-1 text-xs text-slate-500">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span>{item.location}</span>
                </div>
                <p className="text-xs text-slate-500">Farmer: <span className="font-semibold">{item.farmer_name}</span></p>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-2 border border-slate-200 rounded-xl p-0.5 bg-white">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-slate-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= (item.stock_quantity ?? 999)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 disabled:opacity-30"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-400">{item.price.toLocaleString()} × {item.quantity}</p>
                    <p className="font-extrabold text-emerald-800 text-sm">
                      {(item.price * item.quantity).toLocaleString()} FCFA
                    </p>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-28 space-y-5">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">Order Summary</h3>

            <div className="space-y-2 text-sm">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span className="text-slate-600 truncate max-w-[150px]">{item.name} ×{item.quantity}</span>
                  <span className="font-semibold text-slate-800">{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-bold text-slate-800">{cartTotal.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Delivery fee</span>
                <span className="text-emerald-600 font-semibold">Calculated at checkout</span>
              </div>
            </div>

            <div className="bg-emerald-50 rounded-xl p-3.5 border border-emerald-100">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-slate-900">Total</span>
                <span className="text-xl font-black text-emerald-800">{cartTotal.toLocaleString()} FCFA</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-sm shadow-md flex items-center justify-center space-x-2 transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link to="/products" className="block text-center text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
