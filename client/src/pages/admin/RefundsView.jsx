import React from 'react';
import { motion } from 'motion/react';
import { Wallet, Percent, AlertCircle, ArrowUpRight, Search, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils.js';

export default function RefundsView() {
  const financialStats = [
    { label: 'Net Earnings', value: '₹0', trend: ' from last month', icon: Wallet, color: 'indigo' },
    { label: 'Total Commission', value: '₹0', trend: ' average rate', icon: Percent, color: 'blue' },
    { label: 'Pending Refunds', value: '0', trend: '₹0 value at risk', icon: AlertCircle, color: 'red' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 pb-12"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Refund & Commission</h2>
        <div className="flex gap-2">
          <button className="p-2 bg-white rounded-xl border border-gray-100 text-gray-400 hover:text-indigo-600 transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 bg-white rounded-xl border border-gray-100 text-gray-400 hover:text-indigo-600 transition-colors">
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Financial Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {financialStats.map((stat, i) => (
          <div key={i} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{stat.label}</p>
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                stat.color === 'indigo' ? "bg-indigo-50 text-indigo-600" :
                  stat.color === 'blue' ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"
              )}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-4xl font-black text-gray-900 mb-2">{stat.value}</h3>
            <p className="text-[10px] font-bold text-gray-400 flex items-center">
              {stat.trend.includes('+') && <ArrowUpRight className="w-3 h-3 mr-1 text-green-500" />}
              {stat.trend}
            </p>
          </div>
        ))}
      </div>

      {/* Refund Requests List */}
      <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Refund Requests</h3>
            <p className="text-sm text-gray-400 font-medium">Manage and review recent product returns</p>
          </div>
          <button className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-6 py-3 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[600px] space-y-1">
            <div className="grid grid-cols-3 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50/50 rounded-2xl mb-4">
              <span>Product</span>
              <span>Customer</span>
              <span className="text-right">Amount</span>
            </div>
          </div>
        </div>
      </div>

      {/* Health & Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[2.5rem] p-10 text-white overflow-hidden relative">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-2">Policy Health</p>
          <h3 className="text-4xl font-black mb-12">Good Standing</h3>
          <div className="h-2 bg-white/20 rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-white w-[92%] rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)]"></div>
          </div>
          <p className="text-[10px] font-medium text-indigo-100 opacity-80 leading-relaxed max-w-[80%]">
            Refund rate is within acceptable marketplace limits (1.2%)
          </p>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        </div>

        <div className="bg-[#E2EFFF] rounded-[2.5rem] p-10">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-8">Refund Trends</p>
          <div className="space-y-6">
            {[
              { label: 'Quality Issues', value: '0' },
              { label: 'Wrong Shipping', value: '0' },
              { label: 'Unsatisfied', value: '0' }
            ].map((trend, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm font-bold text-indigo-900">{trend.label}</span>
                <span className="text-sm font-black text-indigo-900">{trend.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-indigo-200 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Top Reason: Manufacturing Defect</p>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Sales & Commission Breakdown</h3>
            <p className="text-sm text-gray-400 font-medium">Individual transaction history and fees</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-gray-50 transition-all">All Sales</button>
            <button className="px-4 py-2 bg-indigo-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-400">Export</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[500px]">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50">
                <th className="pb-6">Transaction ID</th>
                <th className="pb-6">Date</th>
                <th className="pb-6 text-right">Sale Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">

            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
