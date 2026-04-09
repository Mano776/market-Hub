import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Search, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { auth } from '../../lib/firebase.js';
import { signOut } from 'firebase/auth';
import { cn } from '../../lib/utils.js';

export default function Navbar({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <ShoppingCart className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">MarketHub</span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-full text-sm transition-all"
              />
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/cart" className="relative text-gray-600 hover:text-indigo-600 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">0</span>
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-end">
                  <Link 
                    to="/dashboard"
                    className="text-sm font-bold text-gray-900 hover:text-indigo-600 transition-colors"
                  >
                    {user.name || 'Account'}
                  </Link>
                  <span className={cn(
                    "text-[10px] uppercase tracking-widest font-extrabold px-1.5 py-0.5 rounded",
                    user.role === 'admin' ? "bg-red-100 text-red-600" :
                    user.role === 'vendor' ? "bg-purple-100 text-purple-600" :
                    "bg-blue-100 text-blue-600"
                  )}>
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-indigo-600">Login</Link>
                <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "md:hidden bg-white border-t border-gray-100 transition-all duration-300 overflow-hidden",
        isOpen ? "max-h-64" : "max-h-0"
      )}>
        <div className="px-4 py-4 space-y-4">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full px-4 py-2 bg-gray-100 rounded-lg text-sm"
          />
          <div className="flex flex-col space-y-3">
            <Link to="/cart" className="text-gray-700 font-medium">Cart</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-700 font-medium">Dashboard</Link>
                <button onClick={handleLogout} className="text-red-600 font-medium text-left">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 font-medium">Login</Link>
                <Link to="/register" className="text-indigo-600 font-medium">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
