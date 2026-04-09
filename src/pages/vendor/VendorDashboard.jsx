import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase.js';
import { Plus, Package, DollarSign, List, Trash2, Edit } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function VendorDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: 0, inventory: 0, category: 'Electronics' });

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
      const docRef = await addDoc(collection(db, 'products'), {
        ...newProduct,
        vendorId: auth.currentUser.uid,
        status: 'active',
        createdAt: new Date().toISOString(),
        images: [`https://picsum.photos/seed/${Math.random()}/400/300`]
      });
      setProducts([{ id: docRef.id, ...newProduct, status: 'active' }, ...products]);
      setShowAddModal(false);
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

  if (loading) return <div className="animate-pulse">Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Vendor Overview</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="bg-blue-500 p-3 rounded-2xl text-white"><Package className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Active Products</p>
            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="bg-green-500 p-3 rounded-2xl text-white"><List className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="bg-orange-500 p-3 rounded-2xl text-white"><DollarSign className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Earnings</p>
            <p className="text-2xl font-bold text-gray-900">${orders.reduce((acc, curr) => acc + (curr.vendorEarnings || 0), 0)}</p>
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">My Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img src={product.images?.[0]} className="w-10 h-10 rounded-lg object-cover mr-3" referrerPolicy="no-referrer" />
                      <span className="font-medium text-gray-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-bold">${product.price}</td>
                  <td className="px-6 py-4 text-gray-600">{product.inventory}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit className="w-5 h-5" /></button>
                    <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <input 
                type="text" placeholder="Product Name" required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})}
              />
              <textarea 
                placeholder="Description" required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 h-32"
                value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number" placeholder="Price" required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                />
                <input 
                  type="number" placeholder="Stock" required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newProduct.inventory} onChange={e => setNewProduct({...newProduct, inventory: Number(e.target.value)})}
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
