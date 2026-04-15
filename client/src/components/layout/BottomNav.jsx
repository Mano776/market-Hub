import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Package, ShoppingCart, User } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function BottomNav({ user }) {
  const location = useLocation();

  const allItems = [
    { label: 'Discover', path: '/', icon: Search, roles: ['customer'] },
    { label: 'Shop', path: '/products', icon: ShoppingBag, roles: ['customer'] },
    { label: 'Orders', path: '/orders', icon: Package, roles: ['customer', 'admin', 'vendor'] },
    { label: 'Cart', path: '/cart', icon: ShoppingCart, roles: ['customer'] },
    { label: 'Account', path: '/profile', icon: User, roles: ['customer', 'admin', 'vendor'] },
  ];

  const navItems = allItems.filter(item => 
    !user || item.roles.includes(user.role || 'customer')
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pt-2 bg-gradient-to-t from-white via-white/80 to-transparent">
      <div className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 px-2 py-2 flex justify-between items-center max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/orders' && location.pathname.startsWith('/orders'));
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.label}
              to={item.path}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-3xl transition-all duration-500",
                isActive ? "bg-[#EFF2FF] text-[#4F46E5] flex-grow justify-center" : "text-gray-400 hover:text-indigo-400"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "fill-current" : "")} />
              {isActive && (
                <span className="text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
