import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  LayoutGrid,
  Package,
  History,
  Wifi,
  WifiOff,
  Plus,
  Minus,
  Trash2,
  Search,
  CreditCard,
  Cloud,
  CheckCircle,
  Clock,
  Store
} from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DEFAULT_PRODUCTS = [
{ id: 'p1', name: 'Espresso', price: 3.50, category: 'Coffee', stock: 100 },
{ id: 'p2', name: 'Latte', price: 4.50, category: 'Coffee', stock: 100 },
{ id: 'p3', name: 'Cappuccino', price: 4.25, category: 'Coffee', stock: 80 },
{ id: 'p4', name: 'Croissant', price: 2.75, category: 'Pastry', stock: 30 },
{ id: 'p5', name: 'Blueberry Muffin', price: 3.00, category: 'Pastry', stock: 25 },
{ id: 'p6', name: 'Avocado Toast', price: 8.50, category: 'Food', stock: 15 },
];

export default function App() {
const [activeTab, setActiveTab] = useState('pos');
const [isOnline, setIsOnline] = useState(true);
const [notification, setNotification] = useState(null);

// Core State
const [products, setProducts] = useState([]);
const [cart, setCart] = useState([]);
const [transactions, setTransactions] = useState([]);
const [syncing, setSyncing] = useState(false);

// Initialize Data (Offline First)
useEffect(() => {
// Check network status
setIsOnline(navigator.onLine);
const handleOnline = () => setIsOnline(true);
const handleOffline = () => setIsOnline(false);
window.addEventListener('online', handleOnline);
window.addEventListener('offline', handleOffline);

// Load Local Data
const savedProducts = localStorage.getItem('pos_products');
const savedTransactions = localStorage.getItem('pos_transactions');
if (savedProducts) {
  setProducts(JSON.parse(savedProducts));
} else {
  setProducts(DEFAULT_PRODUCTS);
}
if (savedTransactions) {
  setTransactions(JSON.parse(savedTransactions));
}
return () => {
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
};
}, []);

// Persist State Changes
useEffect(() => {
if (products.length > 0) localStorage.setItem('pos_products', JSON.stringify(products));
}, [products]);

useEffect(() => {
localStorage.setItem('pos_transactions', JSON.stringify(transactions));
}, [transactions]);

const notify = (msg) => {
setNotification(msg);
setTimeout(() => setNotification(null), 3000);
};

// --- SUPABASE SYNC LOGIC ---
const syncToSupabase = async () => {
  if (!isOnline) {
    notify("Cannot sync while offline.");
    return;
  }

  setSyncing(true);

  try {
    const unsynced = transactions.filter(t => !t.synced);
    if (unsynced.length === 0) {
      setSyncing(false);
      return;
    }

    const dataToInsert = unsynced.map(({ synced, subtotal, ...rest }) => rest);

    const { error } = await supabase.from('transactions').insert(dataToInsert);

    if (error) {
      console.error('Supabase Sync Error:', error);
      notify(`Sync failed: ${error.message}`);
    } else {
      const syncedIds = new Set(unsynced.map(t => t.id));
      setTransactions(prev => prev.map(t =>
        syncedIds.has(t.id) ? { ...t, synced: true } : t
      ));
      notify("Successfully synced with cloud!");
    }
  } catch (err) {
    console.error('Unexpected Sync Error:', err);
    notify("An unexpected error occurred during sync.");
  } finally {
    setSyncing(false);
  }
};

const formatMoney = (amount) =>
new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

return (
<div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
  {/* Sidebar Navigation */}
  <aside className="w-20 md:w-64 bg-slate-900 text-white flex flex-col transition-all duration-300">
    <div className="p-4 md:p-6 flex items-center justify-center md:justify-start space-x-3 border-b border-slate-800">
      <div className="bg-blue-600 p-2 rounded-xl">
        <Store size={24} className="text-white" />
      </div>
      <span className="font-bold text-xl hidden md:block tracking-tight">CloudPOS</span>
    </div>

    <nav className="flex-1 py-6 flex flex-col gap-2 px-3 md:px-4">
      <NavItem
        icon={<LayoutGrid size={20} />} label="Point of Sale"
        active={activeTab === 'pos'} onClick={() => setActiveTab('pos')}
      />
      <NavItem
        icon={<Package size={20} />} label="Inventory"
        active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')}
      />
      <NavItem
        icon={<History size={20} />} label="Transactions"
        active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')}
      />
    </nav>
    {/* Network Status Indicator */}
    <div className="p-4 border-t border-slate-800">
      <div className={`flex items-center justify-center md:justify-start space-x-3 p-3 rounded-xl transition-colors ${isOnline ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
        {isOnline ? <Wifi size={20} /> : <WifiOff size={20} />}
        <span className="hidden md:block font-medium text-sm">
          {isOnline ? 'System Online' : 'Offline Mode'}
        </span>
      </div>
    </div>
  </aside>
  {/* Main Content Area */}
  <main className="flex-1 flex flex-col overflow-hidden relative">
    {activeTab === 'pos' && (
      <POSView
        products={products}
        cart={cart}
        setCart={setCart}
        transactions={transactions}
        setTransactions={setTransactions}
        formatMoney={formatMoney}
        notify={notify}
      />
    )}
    {activeTab === 'inventory' && (
      <InventoryView
        products={products}
        setProducts={setProducts}
        formatMoney={formatMoney}
        notify={notify}
      />
    )}
    {activeTab === 'transactions' && (
      <TransactionsView
        transactions={transactions}
        formatMoney={formatMoney}
        syncToSupabase={syncToSupabase}
        syncing={syncing}
        isOnline={isOnline}
      />
    )}
    {/* Global Toast Notification */}
    {notification && (
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center space-x-2 animate-bounce">
        <CheckCircle size={18} className="text-emerald-400" />
        <span className="font-medium text-sm">{notification}</span>
      </div>
    )}
  </main>
</div>
);
}

// -----------------------------------------------------------------------------
// UI COMPONENTS
// -----------------------------------------------------------------------------

const NavItem = ({ icon, label, active, onClick }) => (
<button
onClick={onClick}
className={`flex items-center space-x-3 p-3 md:px-4 md:py-3 rounded-xl transition-all duration-200 ${ active  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'  : 'text-slate-400 hover:bg-slate-800 hover:text-white' }`}
>
<div className="mx-auto md:mx-0">{icon}</div>
<span className="hidden md:block font-medium">{label}</span>
</button>
);

// --- POS VIEW ---
const POSView = ({ products, cart, setCart, setTransactions, formatMoney, notify }) => {
const [searchQuery, setSearchQuery] = useState('');

const addToCart = (product) => {
setCart(prev => {
const existing = prev.find(item => item.product.id === product.id);
if (existing) {
return prev.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item);
}
return [...prev, { product, qty: 1 }];
});
};

const updateQty = (id, delta) => {
setCart(prev => prev.map(item => {
if (item.product.id === id) {
return { ...item, qty: Math.max(0, item.qty + delta) };
}
return item;
}).filter(item => item.qty > 0));
};

const clearCart = () => setCart([]);

const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
const tax = subtotal * 0.08; // 8% tax rate
const total = subtotal + tax;

const handleCheckout = () => {
if (cart.length === 0) return;

const newTransaction = {
  id: `TRX-${Date.now()}`,
  created_at: new Date().toISOString(),
  items: cart,
  subtotal,
  tax,
  total,
  synced: false // Crucial for offline-first logic
};
setTransactions(prev => [newTransaction, ...prev]);
setCart([]);
notify(`Payment of ${formatMoney(total)} successful!`);
};

const filteredProducts = products.filter(p =>
p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
p.category.toLowerCase().includes(searchQuery.toLowerCase())
);

return (
<div className="flex h-full flex-col lg:flex-row">
  <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-800">Products</h2>
      <div className="relative w-64">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
      </div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-24 lg:pb-0">
      {filteredProducts.map(product => (
        <button
          key={product.id}
          onClick={() => addToCart(product)}
          className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all text-left flex flex-col justify-between active:scale-95"
        >
          <div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md mb-2 inline-block">
              {product.category}
            </span>
            <h3 className="font-bold text-gray-800 line-clamp-2">{product.name}</h3>
          </div>
          <div className="mt-4 text-lg font-bold text-gray-900">
            {formatMoney(product.price)}
          </div>
        </button>
      ))}
      {filteredProducts.length === 0 && (
        <div className="col-span-full py-12 text-center text-gray-400">
          No products found matching "{searchQuery}"
        </div>
      )}
    </div>
  </div>
  {/* Current Order Pane */}
  <div className="w-full lg:w-96 bg-white border-l border-gray-200 flex flex-col h-full shadow-xl z-10">
    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
      <h2 className="text-xl font-bold text-gray-800">Current Order</h2>
      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-semibold">
        {cart.reduce((sum, item) => sum + item.qty, 0)} Items
      </span>
    </div>
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {cart.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
          <Package size={48} className="text-gray-200" />
          <p>Your cart is empty</p>
        </div>
      ) : (
        cart.map(item => (
          <div key={item.product.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">{item.product.name}</h4>
              <div className="text-sm text-gray-500">{formatMoney(item.product.price)}</div>
            </div>

            <div className="flex items-center space-x-3 bg-white border border-gray-200 rounded-lg p-1">
              <button onClick={() => updateQty(item.product.id, -1)} className="p-1 hover:bg-gray-100 rounded-md text-gray-600">
                {item.qty === 1 ? <Trash2 size={16} className="text-red-500" /> : <Minus size={16} />}
              </button>
              <span className="w-6 text-center font-semibold text-sm">{item.qty}</span>
              <button onClick={() => updateQty(item.product.id, 1)} className="p-1 hover:bg-gray-100 rounded-md text-gray-600">
                <Plus size={16} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
    {/* Checkout Section */}
    <div className="p-6 bg-gray-50 border-t border-gray-200">
      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-gray-500">
          <span>Subtotal</span>
          <span>{formatMoney(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Tax (8%)</span>
          <span>{formatMoney(tax)}</span>
        </div>
        <div className="flex justify-between text-2xl font-bold text-gray-900 pt-2 border-t border-gray-200 mt-2">
          <span>Total</span>
          <span>{formatMoney(total)}</span>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={cart.length === 0}
        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-all ${
          cart.length === 0
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30'
        }`}
      >
        <CreditCard size={20} />
        <span>Pay {formatMoney(total)}</span>
      </button>
    </div>
  </div>
</div>
);
};

// --- INVENTORY VIEW ---
const InventoryView = ({ products, setProducts, formatMoney, notify }) => {
const [newItem, setNewItem] = useState({ name: '', price: '', category: '' });

const handleAdd = (e) => {
e.preventDefault();
if (!newItem.name || !newItem.price || !newItem.category) return;

const product = {
  id: `P-${Date.now()}`,
  name: newItem.name,
  price: parseFloat(newItem.price),
  category: newItem.category,
  stock: 100
};
setProducts([product, ...products]);
setNewItem({ name: '', price: '', category: '' });
notify("Product added to inventory.");
};

const handleDelete = (id) => {
setProducts(products.filter(p => p.id !== id));
};

return (
<div className="p-6 md:p-8 h-full overflow-y-auto bg-slate-50">
  <div className="max-w-4xl mx-auto space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-3xl font-bold text-gray-900">Inventory Management</h2>
    </div>
    {/* Add Product Form */}
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      <h3 className="font-semibold text-lg mb-4 text-gray-800">Add New Product</h3>
      <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4">
        <input
          type="text" placeholder="Product Name" required
          value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text" placeholder="Category (e.g. Food)" required
          value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}
          className="w-full md:w-48 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number" step="0.01" placeholder="Price" required
          value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})}
          className="w-full md:w-32 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 flex items-center justify-center space-x-2 font-medium">
          <Plus size={18} /> <span>Add</span>
        </button>
      </form>
    </div>
    {/* Product Table */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="p-4 font-semibold text-gray-600">Product Name</th>
            <th className="p-4 font-semibold text-gray-600">Category</th>
            <th className="p-4 font-semibold text-gray-600">Price</th>
            <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map(p => (
            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
              <td className="p-4 font-medium text-gray-800">{p.name}</td>
              <td className="p-4">
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">{p.category}</span>
              </td>
              <td className="p-4 font-semibold text-gray-900">{formatMoney(p.price)}</td>
              <td className="p-4 text-right">
                <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan="4" className="p-8 text-center text-gray-400">No products in inventory.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
</div>
);
};

// --- TRANSACTIONS VIEW ---
const TransactionsView = ({ transactions, formatMoney, syncToSupabase, syncing, isOnline }) => {
const pendingSync = transactions.filter(t => !t.synced).length;

return (
<div className="p-6 md:p-8 h-full overflow-y-auto bg-slate-50">
  <div className="max-w-5xl mx-auto space-y-6">
    {/* Header & Sync Status */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Sales History</h2>
        <p className="text-gray-500 mt-1">View and synchronize your offline transactions.</p>
      </div>
      <div className="flex items-center space-x-4 bg-white p-2 pl-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center space-x-2">
          <Cloud className={pendingSync > 0 ? "text-amber-500" : "text-emerald-500"} size={20} />
          <span className="font-semibold text-gray-700">
            {pendingSync} Pending Sync
          </span>
        </div>
        <button
          onClick={syncToSupabase}
          disabled={syncing || pendingSync === 0 || !isOnline}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
            syncing || pendingSync === 0 || !isOnline
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
          }`}
        >
          {syncing ? (
            <span className="animate-pulse">Syncing...</span>
          ) : (
            <span>Sync to Supabase</span>
          )}
        </button>
      </div>
    </div>
    {/* Transactions Table */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="p-4 font-semibold text-gray-600">Date & Time</th>
            <th className="p-4 font-semibold text-gray-600">Order ID</th>
            <th className="p-4 font-semibold text-gray-600">Summary</th>
            <th className="p-4 font-semibold text-gray-600">Total</th>
            <th className="p-4 font-semibold text-gray-600 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {transactions.map(t => (
            <tr key={t.id} className="hover:bg-gray-50 transition-colors">
              <td className="p-4">
                <div className="text-gray-900 font-medium">{new Date(t.created_at).toLocaleDateString()}</div>
                <div className="text-gray-500 text-sm flex items-center mt-1">
                  <Clock size={12} className="mr-1" />
                  {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </td>
              <td className="p-4 font-mono text-sm text-gray-500">{t.id}</td>
              <td className="p-4 text-sm text-gray-600">
                {t.items.map(item => `${item.qty}x ${item.product.name}`).join(', ')}
              </td>
              <td className="p-4 font-bold text-gray-900">{formatMoney(t.total)}</td>
              <td className="p-4 text-right">
                {t.synced ? (
                  <span className="inline-flex items-center space-x-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-sm font-medium">
                    <CheckCircle size={14} /> <span>Cloud</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-md text-sm font-medium">
                    <Clock size={14} /> <span>Local</span>
                  </span>
                )}
              </td>
            </tr>
          ))}
          {transactions.length === 0 && (
            <tr>
              <td colSpan="5" className="p-12 text-center">
                <History size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-500 text-lg">No transactions yet.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
</div>
);
};