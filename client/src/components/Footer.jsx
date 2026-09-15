import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Heart, Shield, Award, MapPin, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Project Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                AGRI<span className="text-emerald-400">SHOP</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              An enterprise-grade agricultural product marketing platform connecting local farmers directly with commercial buyers, supported by integrated logistics and administrative oversight.
            </p>
            <div className="pt-2 flex items-center space-x-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-3 py-2 rounded-xl w-fit">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>IAI Cameroon • Software Engineering Level 2 Final Project</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link></li>
              <li><Link to="/products" className="hover:text-emerald-400 transition-colors">Product Catalogue</Link></li>
              <li><Link to="/about" className="hover:text-emerald-400 transition-colors">UML & Architecture</Link></li>
              <li><Link to="/cart" className="hover:text-emerald-400 transition-colors">Shopping Cart</Link></li>
            </ul>
          </div>

          {/* Supported Roles */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Portals</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Farmer Hub</Link></li>
              <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Buyer Portal</Link></li>
              <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Delivery Hub</Link></li>
              <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Admin Console</Link></li>
            </ul>
          </div>

          {/* Agricultural Hubs in Cameroon */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Agri Hubs</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center space-x-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-400" /><span>Buea & Penja (Spices & Tubers)</span></li>
              <li className="flex items-center space-x-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-400" /><span>Foumbot & West (Vegetables)</span></li>
              <li className="flex items-center space-x-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-400" /><span>Ndop & Bamenda (Rice & Tubers)</span></li>
              <li className="flex items-center space-x-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-400" /><span>Littoral & South (Plantains & Palm Oil)</span></li>
              <li className="flex items-center space-x-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-400" /><span>Ngaoundere (Dairy & Livestock)</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 AGRISHOP Cameroon. Designed & implemented for IAI Cameroon Academic Defence.</p>
          <div className="mt-4 sm:mt-0 flex items-center space-x-4">
            <span className="flex items-center space-x-1 text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>ACID Relational Architecture</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
