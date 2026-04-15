import React, { useState } from 'react';
import { auth, db } from '../lib/firebase.js';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { User, Mail, Shield, Save, Camera, CheckCircle, Phone, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'motion/react';

export default function Profile({ user }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    role: user?.role || 'customer'
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: formData.name
      });

      // Update Firestore user document
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        name: formData.name,
        phone: formData.phone,
        address: formData.address
      });

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Your Profile</h1>
          <p className="text-gray-500 font-medium text-sm">Manage your personal information and account settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-indigo-100/20 overflow-hidden">
            <div className="h-24 bg-indigo-600"></div>
            <div className="px-8 pb-8">
              <div className="relative -mt-12 mb-6 text-center sm:text-left">
                <div className="w-24 h-24 bg-white rounded-3xl border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden mx-auto sm:mx-0">
                  <span className="text-4xl font-black text-indigo-600 uppercase">
                    {formData.name.charAt(0) || user.email.charAt(0)}
                  </span>
                </div>
                <button className="absolute bottom-0 right-1/2 translate-x-12 sm:right-0 sm:translate-x-0 p-2 bg-white rounded-xl shadow-lg border border-gray-100 text-indigo-600 hover:scale-110 transition-transform">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-2xl font-black text-gray-900 line-clamp-1">{formData.name || 'Set your name'}</h3>
                <p className="text-gray-400 font-medium text-sm">{user.email}</p>
                <div className="pt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.role === 'admin' ? 'bg-red-50 text-red-600 border-red-100' :
                      user.role === 'vendor' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                        'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                    {user.role}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 border border-green-100 text-[10px] font-black uppercase tracking-widest flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" /> Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleUpdate}
            className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 md:p-12 space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2 flex items-center">
                  <User className="w-3 h-3 mr-2 text-indigo-400" /> Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all font-bold text-gray-900"
                />
              </div>
              <div className="space-y-2 opacity-60 font-medium">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2 flex items-center">
                  <Mail className="w-3 h-3 mr-2" /> Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl cursor-not-allowed font-bold text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2 flex items-center">
                  <Phone className="w-3 h-3 mr-2 text-indigo-400" /> Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 00000 00000"
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all font-bold text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2 flex items-center">
                  <MapPin className="w-3 h-3 mr-2 text-indigo-400" /> Physical Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter your address"
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all font-bold text-gray-900"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center disabled:opacity-50 active:scale-95"
              >
                {loading ? 'Saving Changes...' : (
                  <>
                    <Save className="w-4 h-4 mr-3" /> Save Changes
                  </>
                )}
              </button>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
