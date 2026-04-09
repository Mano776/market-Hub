import React from 'react';
import AdminDashboard from './admin/AdminDashboard.jsx';
import VendorDashboard from './vendor/VendorDashboard.jsx';
import CustomerDashboard from './customer/CustomerDashboard.jsx';

export default function Dashboard({ user }) {
  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-200">
          {user.name?.charAt(0) || 'U'}
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Welcome, {user.name}</h1>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`text-xs uppercase tracking-widest font-black px-2 py-1 rounded-lg ${
              user.role === 'admin' ? "bg-red-100 text-red-600" :
              user.role === 'vendor' ? "bg-purple-100 text-purple-600" :
              "bg-blue-100 text-blue-600"
            }`}>
              {user.role} Account
            </span>
            <span className="text-gray-400 text-xs">•</span>
            <span className="text-gray-500 text-xs font-medium">{user.email}</span>
          </div>
        </div>
      </div>

      {user.role === 'admin' && <AdminDashboard />}
      {user.role === 'vendor' && <VendorDashboard />}
      {user.role === 'customer' && <CustomerDashboard />}
    </div>
  );
}
