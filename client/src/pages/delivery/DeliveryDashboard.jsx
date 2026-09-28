import React from 'react';
import { Truck, MapPinned, Clock3, Navigation, PackageCheck } from 'lucide-react';

const tripStatus = [
  { title: 'Assigned', count: 7, tone: 'bg-amber-100 text-amber-700' },
  { title: 'In transit', count: 12, tone: 'bg-emerald-100 text-emerald-700' },
  { title: 'Delivered', count: 30, tone: 'bg-blue-100 text-blue-700' }
];

const activeTrips = [
  { id: 'TRK-AGRI-7701', route: 'Buea → Yaoundé', eta: '2h 15m', driver: 'Moses Nkwenti', status: 'Vehicle moving', progress: 68 },
  { id: 'TRK-AGRI-6642', route: 'Douala → Bamenda', eta: '1h 04m', driver: 'Adeline Mvondo', status: 'Packing complete', progress: 34 },
  { id: 'TRK-AGRI-8815', route: 'Kano → Abuja', eta: '4h 30m', driver: 'Samuel Adebayo', status: 'On the way', progress: 81 }
];

const trackingSteps = [
  'Order confirmed',
  'Picked up from farm',
  'In transit to hub',
  'Final delivery in progress',
  'Delivered'
];

export default function DeliveryDashboard() {
  return (
    <>
      <style>{`
        @keyframes vehicleMove {
          0% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -18px) scale(1.05); }
          50% { transform: translate(80px, -38px) scale(1.08); }
          75% { transform: translate(120px, -22px) scale(1.05); }
          100% { transform: translate(170px, 8px) scale(1); }
        }

        @keyframes pulseDot {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.18); }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-bold">Logistics</p>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-2">Fleet tracking</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {tripStatus.map((item) => (
            <div key={item.title} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <div className={`w-11 h-11 ${item.tone} rounded-xl flex items-center justify-center mb-4`}>
                {item.title === 'Assigned' ? <Clock3 className="w-5 h-5" /> : item.title === 'In transit' ? <Navigation className="w-5 h-5" /> : <PackageCheck className="w-5 h-5" />}
              </div>
              <p className="text-2xl font-black text-slate-900">{item.count}</p>
              <p className="text-xs text-slate-500 mt-1">{item.title}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Vehicle movement dashboard</h2>
              <p className="text-xs text-slate-500">Real-time route view for active dispatches</p>
            </div>
            <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl text-xs font-bold">
              <MapPinned className="w-4 h-4" />
              <span>Route visible</span>
            </div>
          </div>

          <div className="p-6">
            <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-sky-50 h-72">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(16,185,129,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.18) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="none" aria-label="Delivery route map">
                <path d="M 12 72 Q 45 28, 82 30" fill="none" stroke="#0f766e" strokeWidth="2" strokeDasharray="5 3" />
                <path d="M 20 76 Q 42 60, 64 40" fill="none" stroke="#7c3aed" strokeWidth="1.2" strokeDasharray="3 4" opacity="0.55" />
              </svg>

              <div className="absolute left-[12%] top-[68%] flex flex-col items-center animate-pulse" style={{ animationDuration: '2.5s' }}>
                <div className="w-4 h-4 rounded-full bg-emerald-600 border-2 border-white shadow-lg" />
                <span className="mt-2 text-[10px] font-bold bg-white/90 px-2 py-1 rounded-full text-emerald-700">Origin</span>
              </div>

              <div className="absolute left-[46%] top-[35%] flex flex-col items-center animate-pulse" style={{ animationDuration: '1.8s' }}>
                <div className="w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-lg" />
                <span className="mt-2 text-[10px] font-bold bg-white/90 px-2 py-1 rounded-full text-amber-700">Hub</span>
              </div>

              <div className="absolute left-[82%] top-[28%] flex flex-col items-center animate-pulse" style={{ animationDuration: '2.1s' }}>
                <div className="w-4 h-4 rounded-full bg-sky-600 border-2 border-white shadow-lg" />
                <span className="mt-2 text-[10px] font-bold bg-white/90 px-2 py-1 rounded-full text-sky-700">Destination</span>
              </div>

              <div className="absolute left-[18%] top-[68%] animate-pulse" style={{ animation: 'vehicleMove 4s ease-in-out infinite' }}>
                <div className="relative">
                  <div className="w-5 h-5 rounded-full bg-emerald-700 border-2 border-white shadow-lg" style={{ animation: 'pulseDot 1.2s ease-in-out infinite' }} />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-800/40 blur-[2px]" />
                </div>
              </div>

              <div className="absolute right-4 bottom-4 bg-white/90 rounded-2xl px-3 py-2 shadow-sm border border-slate-100 w-52">
                <p className="text-[11px] text-slate-500">Current movement</p>
                <p className="font-bold text-slate-900">Vehicle en route</p>
                <p className="text-[10px] text-emerald-700 mt-1">Buea → Yaoundé • ETA 2h 15m</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Tracking timeline</h3>
              <span className="text-[11px] font-bold text-emerald-700">Status: In transit</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {trackingSteps.map((step, index) => (
                <div key={step} className={`rounded-2xl border p-3 text-center ${index <= 2 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                  <div className="w-6 h-6 mx-auto mb-2 rounded-full flex items-center justify-center text-[10px] font-black border ${index <= 2 ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-500 border-slate-200'}">
                    {index + 1}
                  </div>
                  <p className="text-[11px] font-bold leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {activeTrips.map((trip) => (
            <div key={trip.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-slate-900">{trip.id}</p>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 rounded-full px-2 py-1">{trip.status}</span>
              </div>
              <p className="text-xs text-slate-500">{trip.route}</p>
              <p className="text-xs text-slate-500 mt-1">Driver: {trip.driver}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>ETA</span>
                <span className="font-bold text-slate-800">{trip.eta}</span>
              </div>
              <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${trip.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
