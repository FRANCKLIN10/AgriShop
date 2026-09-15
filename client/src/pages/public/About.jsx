import React from 'react';
import { Award, Code, Database, Shield, Users, Wheat, ShoppingBag, Truck, ShieldCheck, GitBranch, Server, Layout } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-full text-xs font-bold text-emerald-800">
          <Award className="w-4 h-4" />
          <span>Final Year Project — IAI Cameroon Software Engineering Level 2</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Project Documentation & Architecture
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl mx-auto">
          Design and Implementation of an Agricultural Product Marketing Platform — A complete, production-grade web application built according to formal UML specification.
        </p>
      </div>

      {/* Project Overview */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
        <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Project Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-600 leading-relaxed">
          <div>
            <p><span className="font-bold text-slate-800">Title:</span> Design and Implementation of an Agricultural Product Marketing Platform</p>
            <p className="mt-2"><span className="font-bold text-slate-800">Institution:</span> IAI Cameroon (Institut Africain d'Informatique)</p>
            <p className="mt-2"><span className="font-bold text-slate-800">Level:</span> Software Engineering — Level 2 Final Year Project</p>
            <p className="mt-2"><span className="font-bold text-slate-800">Year:</span> Academic Year 2025–2026</p>
          </div>
          <div>
            <p><span className="font-bold text-slate-800">Architecture:</span> Full-Stack REST API + React SPA</p>
            <p className="mt-2"><span className="font-bold text-slate-800">Database:</span> Relational SQLite (ACID, FK-enforced, WAL mode)</p>
            <p className="mt-2"><span className="font-bold text-slate-800">Backend:</span> Node.js + Express.js (No-build server)</p>
            <p className="mt-2"><span className="font-bold text-slate-800">Frontend:</span> React 18 + Vite + Tailwind CSS + Lucide Icons</p>
          </div>
        </div>
      </div>

      {/* 5 Actors */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
        <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">System Actors (UML)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Users, color: 'blue', title: 'USER', desc: 'Authenticated base actor. Manages profile, views notifications, and accesses public catalogue.' },
            { icon: ShoppingBag, color: 'emerald', title: 'SELLER / BUYER', desc: 'Places orders, selects payment methods (MTN MoMo, Orange Money, Card), tracks purchases and reviews order history.' },
            { icon: Wheat, color: 'amber', title: 'FARMER', desc: 'After admin validation, publishes products, manages inventory, receives and processes incoming orders.' },
            { icon: Truck, color: 'indigo', title: 'DELIVERY SERVICE', desc: 'Views delivery requests, accepts pickups, advances delivery status, logs completion history.' },
            { icon: ShieldCheck, color: 'purple', title: 'ADMINISTRATOR', desc: 'Validates farmers, manages all users/products/categories, monitors transactions, views dashboard analytics.' },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className={`p-5 rounded-2xl border bg-${color}-50/40 border-${color}-100 space-y-3`}>
              <div className={`w-10 h-10 rounded-xl bg-${color}-100 text-${color}-700 flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 15 Use Cases */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
        <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">15 Core Use Cases Implemented</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { num: '01', name: 'Authenticate', desc: 'JWT-based login, registration, session validation for all 5 roles.' },
            { num: '02', name: 'Manage Profile', desc: 'View, edit personal info, upload avatar, change password.' },
            { num: '03', name: 'Browse & Search Product', desc: 'Filterable catalogue with search, category, price, location, sort.' },
            { num: '04', name: 'Manage Product', desc: 'Farmers publish, edit, delete, and toggle availability of produce.' },
            { num: '05', name: 'Manage Inventory', desc: 'Stock levels, restock, low-stock alerts, auto-deduction on order.' },
            { num: '06', name: 'Place Order', desc: 'Cart → checkout → atomic stock deduction → payment → delivery record.' },
            { num: '07', name: 'View Orders', desc: 'Buyers see their orders; farmers see incoming orders for their farm.' },
            { num: '08', name: 'View Order History', desc: 'Searchable & filterable history with status, payments, and delivery.' },
            { num: '09', name: 'Make Payment', desc: 'MTN MoMo, Orange Money, Card, Cash-on-Delivery simulation.' },
            { num: '10', name: 'View Delivery Request', desc: 'Delivery portal showing pending dispatch pool from farms.' },
            { num: '11', name: 'Update Delivery Status', desc: 'Couriers progress from Assigned → In Transit → Delivered.' },
            { num: '12', name: 'View Delivery History', desc: 'Completed and failed delivery records for the logistics portal.' },
            { num: '13', name: 'Manage User', desc: 'Admin searches, activates/deactivates, changes roles, deletes users.' },
            { num: '14', name: 'Validate Farmer', desc: 'Admin reviews and approves/rejects pending farmer applications.' },
            { num: '15', name: 'Monitor Transaction', desc: 'Admin audits all payment records, volumes, and methods.' },
          ].map(({ num, name, desc }) => (
            <div key={num} className="flex items-start space-x-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs font-black text-emerald-600 bg-emerald-50 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0">{num}</span>
              <div>
                <h4 className="text-xs font-bold text-slate-900">{name}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technology Stack */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
        <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Technology Stack</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm font-bold text-slate-800">
              <Server className="w-4 h-4 text-emerald-600" />
              <span>Backend</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>• Node.js 26 (built-in SQLite)</li>
              <li>• Express.js 4 (REST API)</li>
              <li>• bcryptjs (password hashing)</li>
              <li>• jsonwebtoken (JWT sessions)</li>
              <li>• multer (file uploads)</li>
              <li>• CORS, dotenv</li>
            </ul>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm font-bold text-slate-800">
              <Layout className="w-4 h-4 text-blue-600" />
              <span>Frontend</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>• React 18 + Vite</li>
              <li>• React Router DOM v6</li>
              <li>• Tailwind CSS 3</li>
              <li>• Lucide React (icons)</li>
              <li>• Context API (state management)</li>
              <li>• LocalStorage (cart persistence)</li>
            </ul>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm font-bold text-slate-800">
              <Database className="w-4 h-4 text-purple-600" />
              <span>Database</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>• SQLite (node:sqlite built-in)</li>
              <li>• 11 Normalized Tables</li>
              <li>• Foreign Key Constraints</li>
              <li>• ACID Transactions</li>
              <li>• WAL Mode (durability)</li>
              <li>• Indexed for performance</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Test Credentials */}
      <div className="bg-emerald-900 text-white rounded-3xl p-8 space-y-6">
        <h2 className="text-xl font-bold border-b border-emerald-800 pb-4">Academic Defence Test Credentials</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { role: 'ADMINISTRATOR', email: 'admin@agrishop.cm', pass: 'Admin@12345', color: 'purple' },
            { role: 'FARMER (Approved)', email: 'farmer.buea@agrishop.cm', pass: 'Farmer@12345', color: 'emerald' },
            { role: 'FARMER (Pending)', email: 'farmer.new@agrishop.cm', pass: 'Farmer@12345', color: 'amber' },
            { role: 'BUYER', email: 'buyer.douala@agrishop.cm', pass: 'Buyer@12345', color: 'blue' },
            { role: 'DELIVERY SERVICE', email: 'delivery.express@agrishop.cm', pass: 'Delivery@12345', color: 'indigo' },
          ].map(({ role, email, pass }) => (
            <div key={role} className="bg-emerald-800/60 border border-emerald-700/40 rounded-2xl p-4 space-y-1">
              <p className="text-xs font-black text-emerald-300">{role}</p>
              <p className="text-[11px] text-white font-mono">{email}</p>
              <p className="text-[11px] text-emerald-200 font-mono">{pass}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
