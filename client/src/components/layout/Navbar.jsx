import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Search, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { auth } from '../../lib/firebase.js';
import { signOut } from 'firebase/auth';
import { cn } from '../../lib/utils.js';

export default function Navbar({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 relative">
          
          {/* Left Spacer or Menu (Mobile) */}
          <div className="flex-1 flex justify-start">
            <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            {/* Desktop Search - Hidden for Admin & Vendor */}
            {!isAuthPage && user?.role === 'customer' && (
              <div className="hidden md:flex items-center max-w-xs w-full">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-9 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-full text-xs transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Centered Logo */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex items-center">
            <span className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">
              THE <span className="text-indigo-600">CURATOR</span>
            </span>
          </Link>

          {/* Right Nav */}
          <div className="flex-1 flex justify-end items-center space-x-4">
            {user?.role === 'customer' && (
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors group">
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white group-hover:scale-110 transition-transform">
                  0
                </span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center space-x-4">
                {/* Orders / Profile links - Hidden for Admin/Vendor as requested */}
                {user.role === 'customer' && (
                  <div className="hidden md:flex items-center space-x-2">
                    <Link 
                      to="/orders"
                      className="text-xs font-black uppercase tracking-widest text-gray-900 hover:text-indigo-600 transition-colors"
                    >
                      Orders
                    </Link>
                    <span className="text-gray-300">|</span>
                    <Link 
                      to="/profile"
                      className="text-xs font-black uppercase tracking-widest text-gray-900 hover:text-indigo-600 transition-colors"
                    >
                      Profile
                    </Link>
                  </div>
                )}
                
                <div className="flex flex-col items-end">
                  <span className={cn(
                    "text-[10px] uppercase tracking-widest font-extrabold px-1.5 py-0.5 rounded",
                    user.role === 'admin' ? "bg-red-50 text-red-600" :
                    user.role === 'vendor' ? "bg-purple-50 text-purple-600" :
                    "bg-blue-50 text-blue-600"
                  )}>
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-sm">
                Join Us
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "md:hidden bg-white border-t border-gray-100 transition-all duration-300 overflow-hidden",
        isOpen ? "max-h-72" : "max-h-0"
      )}>
        <div className="px-6 py-6 space-y-6">
          {!isAuthPage && user?.role === 'customer' && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl text-xs font-bold"
              />
            </div>
          )}
          
          <div className="flex flex-col space-y-4">
            {user ? (
              <>
                {user.role === 'customer' && (
                  <>
                    <Link to="/orders" className="text-xs font-black uppercase tracking-widest text-gray-900" onClick={() => setIsOpen(false)}>Orders</Link>
                    <Link to="/profile" className="text-xs font-black uppercase tracking-widest text-gray-900" onClick={() => setIsOpen(false)}>Profile</Link>
                  </>
                )}
                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">{user.role} Account</span>
                  <button onClick={handleLogout} className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Logout</button>
                </div>
              </>
            ) : (
              <Link to="/login" className="bg-indigo-600 text-white px-4 py-4 rounded-2xl text-xs font-black text-center uppercase tracking-widest" onClick={() => setIsOpen(false)}>
                Join Us
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
