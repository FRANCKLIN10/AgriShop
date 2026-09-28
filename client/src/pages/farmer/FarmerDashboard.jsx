import React from 'react';
import { Package, MapPin, TrendingUp, Warehouse, BellRing, ArrowUpRight } from 'lucide-react';

const stats = [
  { label: 'Products listed', value: '24', icon: Package, tone: 'bg-emerald-100 text-emerald-700' },
  { label: 'Inventory value', value: 'FCFA 8.4M', icon: Warehouse, tone: 'bg-blue-100 text-blue-700' },
  { label: 'Incoming orders', value: '9', icon: BellRing, tone: 'bg-amber-100 text-amber-700' },
  { label: 'Avg. growth', value: '+18.4%', icon: TrendingUp, tone: 'bg-violet-100 text-violet-700' }
];

const inventory = [
  { name: 'Foumbot Vine Tomatoes', stock: 45, trend: '+12%', location: 'Foumbot' },
  { name: 'Penja White Pepper', stock: 63, trend: '+8%', location: 'Penja' },
  { name: 'Ndop Rice', stock: 52, trend: '+5%', location: 'Ndop' }
];

const orders = [
  { order: '#ORD-2026-00101', buyer: 'Dr. Kevin Fongang', amount: 'FCFA 29,000', status: 'Pending approval' },
  { order: '#ORD-2026-00106', buyer: 'Amina Jallow', amount: 'FCFA 18,500', status: 'Ready for dispatch' },
  { order: '#ORD-2026-00109', buyer: 'Kwame Osei', amount: 'FCFA 22,100', status: 'Packed and waiting' }
];

export default function FarmerDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-bold">Farmer hub</p>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-2">Farm performance</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className={`w-11 h-11 ${tone} rounded-xl flex items-center justify-center mb-4`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-900">Inventory overview</h2>
            <button className="text-xs font-bold text-emerald-700">Manage stock</button>
          </div>
          <div className="space-y-4">
            {inventory.map((item) => (
              <div key={item.name} className="border border-slate-100 rounded-2xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-slate-900">{item.name}</p>
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 rounded-full px-2 py-1">{item.trend}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{item.location}</span>
                  </span>
                  <span className="font-bold text-slate-800">{item.stock} units</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-900">Incoming customer orders</h2>
            <button className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700">
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.order} className="flex items-center justify-between border border-slate-100 rounded-2xl p-3">
                <div>
                  <p className="font-bold text-slate-900">{order.order}</p>
                  <p className="text-xs text-slate-500">{order.buyer}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">{order.amount}</p>
                  <p className="text-[11px] text-amber-700 bg-amber-50 rounded-full px-2 py-1 inline-block mt-1">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
