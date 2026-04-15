import React from 'react';
import AdminDashboard from './admin/AdminDashboard.jsx';
import VendorDashboard from './vendor/VendorDashboard.jsx';
import CustomerDashboard from './customer/CustomerDashboard.jsx';

export default function Dashboard({ user }) {
  if (!user) return null;

  return (
    <div className="space-y-6">

      {user.role === 'admin' && <AdminDashboard user={user} />}
      {user.role === 'vendor' && <VendorDashboard user={user} />}
      {user.role === 'customer' && <CustomerDashboard user={user} />}
    </div>
  );
}
