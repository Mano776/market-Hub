import React, { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase.js';
import { toast } from 'react-hot-toast';
import { CreditCard, Truck, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({ street: '', city: '', zip: '' });

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);

    try {
      // Group items by vendor
      const vendorItems = {};
      cart.forEach(item => {
        if (!vendorItems[item.vendorId]) vendorItems[item.vendorId] = [];
        vendorItems[item.vendorId].push(item);
      });

      // Create orders for each vendor
      const orderPromises = Object.entries(vendorItems).map(async ([vendorId, items]) => {
        const vendorTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const commission = vendorTotal * 0.1; // 10% commission

        return addDoc(collection(db, 'orders'), {
          customerId: auth.currentUser?.uid,
          vendorId,
          items,
          totalAmount: vendorTotal,
          commissionAmount: commission,
          vendorEarnings: vendorTotal - commission,
          status: 'pending',
          shippingAddress: {
            ...address,
            name: auth.currentUser.displayName || 'Customer'
          },
          createdAt: new Date().toISOString()
        });
      });

      await Promise.all(orderPromises);
      
      toast.success('Order placed successfully!');
      clearCart();
      navigate('/orders');
    } catch (error) {
      toast.error('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Shipping Form */}
        <form onSubmit={handleCheckout} className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 text-indigo-600">
              <Truck className="w-6 h-6" />
              <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
            </div>
            
            <div className="space-y-4">
              <input 
                type="text" placeholder="Street Address" required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={address.street} onChange={e => setAddress({...address, street: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="text" placeholder="City" required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  value={address.city} onChange={e => setAddress({...address, city: e.target.value})}
                />
                <input 
                  type="text" placeholder="ZIP Code" required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  value={address.zip} onChange={e => setAddress({...address, zip: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 text-indigo-600">
              <CreditCard className="w-6 h-6" />
              <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
            </div>
            <div className="p-4 border-2 border-indigo-600 bg-indigo-50 rounded-2xl flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-6 bg-indigo-600 rounded mr-3"></div>
                <span className="font-bold text-gray-900">Stripe Checkout</span>
              </div>
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center shadow-lg shadow-indigo-200 disabled:opacity-50"
          >
            {loading ? 'Processing...' : `Pay ₹${total.toFixed(2)}`}
            {!loading && <ArrowRight className="ml-2 w-5 h-5" />}
          </button>
        </form>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
            <div className="divide-y divide-gray-100">
              {cart.map((item) => (
                <div key={item.id} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-gray-100 flex justify-between text-xl">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-extrabold text-indigo-600">₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
