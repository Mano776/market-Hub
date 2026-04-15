/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase.js';
import Navbar from './components/layout/Navbar.jsx';
import Home from './pages/Home.jsx';
import Auth from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Profile from './pages/Profile.jsx';
import BottomNav from './components/layout/BottomNav.jsx';
import { cn } from './lib/utils.js';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({ ...firebaseUser, ...userDoc.data() });
          } else {
            setUser(firebaseUser);
          }
        } catch (error) {
          console.error("Firestore error:", error);
          setUser(firebaseUser); // Fallback to auth user
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isAdminDashboard = user?.role === 'admin' && location.pathname.startsWith('/orders');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {!isAdminDashboard && <Navbar user={user} />}
      <main className={cn(
        "flex-grow container mx-auto px-4 py-8",
        isAdminDashboard ? "pt-0 overflow-x-hidden" : ""
      )}>
        <Routes>
          <Route 
            path="/" 
            element={
              user && (user.role === 'vendor' || user.role === 'admin') ? (
                <Navigate to="/orders" replace />
              ) : (
                <Home user={user} />
              )
            } 
          />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Navigate to="/login" replace />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />

          {/* Unified Orders Route */}
          <Route
            path="/orders/*"
            element={user ? <Dashboard user={user} /> : <Navigate to="/login" />}
          />

          <Route
            path="/checkout"
            element={user ? <Checkout /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={user ? <Profile user={user} /> : <Navigate to="/login" />}
          />
        </Routes>
      </main>
      <Toaster position="bottom-right" />
      {/* Hide global BottomNav for administrative roles as they have their own navigation systems */}
      {user?.role === 'customer' && <BottomNav user={user} />}
    </div>
  );
}
