import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase.js';
import { Plus, Trash2, Edit, ShoppingBag, List, User as UserIcon, CheckCircle, Settings, LogOut } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function VendorDashboard({ user }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [view, setView] = useState('orders'); // 'orders', 'products', 'profile'
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: 0, inventory: 0, category: 'Electronics', imageUrl: '' });

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;
      try {
        const productsQ = query(collection(db, 'products'), where('vendorId', '==', auth.currentUser.uid));
        const ordersQ = query(collection(db, 'orders'), where('vendorId', '==', auth.currentUser.uid));
        
        const [productsSnap, ordersSnap] = await Promise.all([getDocs(productsQ), getDocs(ordersQ)]);
        
        setProducts(productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setOrders(ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching vendor data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    try {
      const imageUrl = newProduct.imageUrl || `https://picsum.photos/seed/${Math.random()}/400/300`;
      const docRef = await addDoc(collection(db, 'products'), {
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        inventory: newProduct.inventory,
        category: newProduct.category,
        vendorId: auth.currentUser.uid,
        status: 'active',
        createdAt: new Date().toISOString(),
        images: [imageUrl]
      });
      setProducts([{ id: docRef.id, ...newProduct, images: [imageUrl], status: 'active' }, ...products]);
      setShowAddModal(false);
      setNewProduct({ name: '', description: '', price: 0, inventory: 0, category: 'Electronics', imageUrl: '' });
      toast.success('Product added successfully!');
    } catch (error) {
      toast.error('Failed to add product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(products.filter(p => p.id !== id));
      toast.success('Product deleted');
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  if (loading) return <div className="animate-pulse flex items-center justify-center p-12 text-gray-400">Loading Dashboard...</div>;

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-[600px]">
      {/* Professional Sidebar Navigation */}
      <aside className="w-full md:w-64 space-y-2">
        <div className="px-4 py-4 mb-4">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Vendor Menu</h2>
        </div>
        
        {[
          { id: 'orders', label: 'Order Lists', icon: ShoppingBag },
          { id: 'products', label: 'Vendor Products', icon: List },
          { id: 'profile', label: 'Store Profile', icon: UserIcon },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold transition-all",
              view === item.id 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}

        <div className="pt-8 px-4">
          <button 
            onClick={() => setShowAddModal(true)}
            className="w-full bg-white border-2 border-dashed border-indigo-200 text-indigo-600 px-4 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-indigo-600 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center space-y-2"
          >
            <Plus className="w-6 h-6" />
            <span>Add Product</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {view === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-xl font-bold text-gray-900">Incoming Orders</h2>
                <div className="text-xs font-black text-gray-400 uppercase tracking-widest">{orders.length} total</div>
              </div>
              <div className="overflow-x-auto">
                {orders.length > 0 ? (
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                      <tr>
                        <th className="px-6 py-4">Order ID</th>
                        <th className="px-6 py-4">Items</th>
                        <th className="px-6 py-4">Total</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-gray-500">#{order.id.slice(0, 8)}</td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-sm text-gray-900">{order.items?.length || 0} items</span>
                          </td>
                          <td className="px-6 py-4 font-black text-indigo-600">₹{order.totalAmount?.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                              order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              'bg-indigo-100 text-indigo-700'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-20 text-center space-y-4">
                    <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto" />
                    <p className="text-gray-400 font-medium italic">No orders received yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {view === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-xl font-bold text-gray-900">Your Inventory</h2>
                <div className="text-xs font-black text-gray-400 uppercase tracking-widest">{products.length} products</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Stock</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <img src={product.images?.[0]} className="w-12 h-12 rounded-xl object-cover mr-4 shadow-sm" referrerPolicy="no-referrer" />
                            <span className="font-bold text-gray-900">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-indigo-600 font-black">₹{product.price}</td>
                        <td className="px-6 py-4">
                          <span className={`font-bold ${product.inventory < 10 ? 'text-red-500' : 'text-gray-600'}`}>
                            {product.inventory}
                          </span>
                        </td>
                        <td className="px-6 py-4 space-x-2">
                          <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"><Edit className="w-5 h-5" /></button>
                          <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"><Trash2 className="w-5 h-5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {view === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl"
            >
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="h-32 bg-indigo-600 relative">
                  <div className="absolute -bottom-12 left-8 w-24 h-24 bg-white rounded-3xl border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                    <UserIcon className="w-12 h-12 text-indigo-200" />
                  </div>
                </div>
                <div className="pt-16 p-8 space-y-8">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900">{user.name}</h2>
                    <p className="text-gray-500 font-medium">Verified Vendor Profile</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</p>
                      <p className="font-bold text-gray-900">{user.email}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Status</p>
                      <p className="font-bold text-green-600 uppercase tracking-wide flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" /> {user.status || 'Active'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 flex space-x-4">
                    <button className="flex-1 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center">
                      <Settings className="w-4 h-4 mr-2" /> Edit Profile
                    </button>
                    <button onClick={() => auth.signOut()} className="flex-1 bg-red-50 text-red-600 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all flex items-center justify-center">
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">New Product</h2>
              <p className="text-gray-500 text-sm mt-1">List a new item in your store</p>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">Product Name</label>
                <input 
                  type="text" placeholder="e.g. Vintage Camera" required
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all font-medium"
                  value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">Description</label>
                <textarea 
                  placeholder="Tell customers about this product..." required
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all h-32 resize-none font-medium"
                  value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">Product Image URL</label>
                <input 
                  type="url" placeholder="Paste image link here" required
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all font-medium"
                  value={newProduct.imageUrl} onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">Price (₹)</label>
                  <input 
                    type="number" step="0.01" required
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all font-bold text-indigo-600"
                    value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">Stock</label>
                  <input 
                    type="number" required
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all font-bold text-gray-700"
                    value={newProduct.inventory} onChange={e => setNewProduct({...newProduct, inventory: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="flex space-x-4 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-8 py-4 rounded-2xl font-black text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all uppercase tracking-widest text-xs">Cancel</button>
                <button type="submit" className="flex-1 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">Save Listing</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
