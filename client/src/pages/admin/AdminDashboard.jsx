import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, where, deleteDoc, getDoc, increment } from 'firebase/firestore';
import { db } from '../../lib/firebase.js';
import {
  Users, ShoppingBag, CheckCircle, XCircle, BarChart3,
  MessageSquare, Star, Wallet, Percent, AlertCircle,
  TrendingUp, ArrowUpRight, ArrowRight, Search, Menu,
  ShoppingCart, ShieldCheck, Clock, Check, Filter,
  Navigation, ListChecks, LayoutDashboard, Receipt, IndianRupee,
  User as UserIcon, LogOut, ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils.js';
import Profile from '../Profile.jsx'; // Reuse existing profile
import RefundsView from './RefundsView.jsx';

export default function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVendors: 0,
    pendingApprovals: 0,
    totalRevenue: 0,
    revenueGrowth: 12.5
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const ordersSnap = await getDocs(collection(db, 'orders'));
        
        const usersData = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const ordersData = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setUsers(usersData);
        
        const totalSales = ordersData.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
        const vendorsCount = usersData.filter((u) => u.role === 'vendor').length;
        const pendingCount = usersData.filter((u) => u.role === 'vendor' && u.status === 'pending').length;

        setStats(prev => ({
          ...prev,
          totalVendors: vendorsCount,
          pendingApprovals: pendingCount,
          totalRevenue: totalSales
        }));
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'refunds', label: 'Refunds', icon: Receipt },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  if (loading && activeTab === 'dashboard') return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse tracking-widest text-[10px] uppercase">Curating Dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans text-[#1A1A1A]">
      {/* Lateral Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-80 bg-white border-r border-gray-100 p-8 sticky top-0 h-screen">
        <div className="mb-12">
          <span className="text-2xl font-black text-indigo-900 tracking-tighter uppercase italic leading-none">
            THE <span className="text-indigo-600">CURATOR</span>
          </span>
          <p className="text-[8px] font-black tracking-[0.3em] text-indigo-300 mt-2 uppercase">Management Suite</p>
        </div>

        <nav className="flex-grow space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] transition-all duration-300 font-bold text-sm uppercase tracking-widest",
                activeTab === item.id
                  ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100"
                  : "text-gray-400 hover:bg-gray-50 hover:text-indigo-600"
              )}
            >
              <item.icon className={cn("w-5 h-5", activeTab === item.id ? "animate-pulse" : "")} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-gray-100">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-3xl">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black uppercase">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="font-black text-xs uppercase tracking-tight text-gray-900 truncate">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-gray-400 font-medium">Platform Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow pb-32 lg:pb-12">
        {/* Mobile Mini Header */}
        <header className="lg:hidden flex justify-between items-center p-6 bg-white border-b border-gray-100 mb-6">
          <span className="text-xl font-black text-indigo-900 tracking-tighter uppercase italic">
            THE <span className="text-indigo-600">CURATOR</span>
          </span>
          <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
            <UserIcon className="w-5 h-5" />
          </div>
        </header>

        <div className="px-6 md:px-12 py-6 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && <DashboardView stats={stats} users={users} />}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Profile user={user} />
              </motion.div>
            )}
            {activeTab === 'orders' && <PlaceholderView title="Order Management" icon={ShoppingBag} />}
            {activeTab === 'refunds' && <RefundsView />}
          </AnimatePresence>
        </div>

        {/* Mobile Lateral Nav (Bottom) */}
        <nav className="lg:hidden fixed bottom-8 left-6 right-6 z-50 bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[2.5rem] shadow-2xl p-2 flex justify-between items-center max-w-lg mx-auto">
          {menuItems.filter(item => !['orders', 'profile'].includes(item.id)).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 rounded-full transition-all duration-500",
                activeTab === item.id ? "bg-indigo-600 text-white flex-grow justify-center" : "text-gray-300"
              )}
            >
              <item.icon className="w-5 h-5" />
              {activeTab === item.id && (
                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              )}
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
}


function DashboardView({ stats, users }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter">Marketplace <span className="text-indigo-600">Pulse</span></h1>
          <p className="text-gray-400 font-medium text-lg mt-2 italic">Real-time platform performance and vendor onboarding.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 font-sans">Live System Feed</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Revenue Hero */}
        <div className="relative overflow-hidden bg-indigo-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-indigo-100 group">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-4">Total Revenue</p>
          <h2 className="text-6xl font-black tracking-tighter mb-8">₹{stats.totalRevenue.toLocaleString()}</h2>
          <div className="flex items-center gap-2 bg-white/10 w-fit px-4 py-2 rounded-full border border-white/20">
            <TrendingUp className="w-4 h-4 text-white" />
            <span className="text-[10px] font-black">+{stats.revenueGrowth}%</span>
          </div>
        </div>

        {/* Vendors Hero */}
        <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <Users className="w-7 h-7" />
            </div>
            <span className="bg-green-50 text-green-600 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">Active Scale</span>
          </div>
          <div>
            <p className="text-5xl font-black text-gray-900 tracking-tighter">{stats.totalVendors}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">Verified Curators</p>
          </div>
        </div>
      </div>

      {/* Vendor Onboarding Section */}
      <div className="pt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h3 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter mb-2">
              Vendor Onboarding
            </h3>
            <p className="text-sm md:text-lg text-gray-500 font-medium max-w-md leading-relaxed">
              Reviewing {stats.pendingApprovals} new applications for the curator program.
            </p>
          </div>
          <button className="flex items-center justify-center gap-3 bg-[#EFF2FF] text-[#4F46E5] px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-indigo-100 active:scale-95 w-full md:w-auto">
            <Filter className="w-4 h-4" />
            Filter Results
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Real Vendor Applications List */}
          {users.filter(u => u.role === 'vendor' && u.status === 'pending').slice(0, 6).map((vendor) => (
            <VendorApplicationRow key={vendor.id} vendor={vendor} />
          ))}

          {/* Empty State */}
          {users.filter(u => u.role === 'vendor' && u.status === 'pending').length === 0 && (
            <div className="col-span-full p-20 bg-white rounded-[3rem] border border-dashed border-gray-200 text-center">
              <ShieldCheck className="w-16 h-16 text-gray-100 mx-auto mb-6" />
              <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-xs">Platform Cleared</p>
              <p className="text-sm text-gray-400 mt-2 font-medium">No pending vendor applications at this time.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function PlaceholderView({ title, icon: Icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center"
    >
      <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-indigo-600 mb-8 border border-indigo-100">
        <Icon className="w-10 h-10" />
      </div>
      <h2 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">{title}</h2>
      <p className="text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">
        We are refining the editorial interface for {title.toLowerCase()}. This section will be available in the next curation cycle.
      </p>
    </motion.div>
  );
}

function VendorApplicationRow({ vendor }) {
  return (
    <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-50 flex items-center justify-between group hover:border-indigo-100 transition-all">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-100 rounded-[1.25rem] flex items-center justify-center font-black text-gray-400 overflow-hidden">
          {vendor.profileImage ? (
            <img src={vendor.profileImage} alt="" className="w-full h-full object-cover" />
          ) : (
            vendor.name?.charAt(0) || 'V'
          )}
        </div>
        <div>
          <h4 className="font-black text-gray-900 uppercase tracking-tight">{vendor.name}</h4>
          <p className="text-xs text-gray-400 font-medium">{vendor.email}</p>
        </div>
      </div>
      <button className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all">
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}

