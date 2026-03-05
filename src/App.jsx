import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutGrid, Package, History, Settings, Plus, Minus, Trash2,
  Search, CreditCard, CheckCircle, Clock, Store, ShoppingCart,
  Download, Upload, Printer, Smartphone, Menu, X, Tag
} from 'lucide-react';

// Default Demo Data
const DEFAULT_PRODUCTS = [
  { id: 'p1', name: 'Espresso', price: 3.50, category: 'Coffee', stock: 100 },
  { id: 'p2', name: 'Latte', price: 4.50, category: 'Coffee', stock: 100 },
  { id: 'p3', name: 'Croissant', price: 2.75, category: 'Pastry', stock: 30 },
  { id: 'p4', name: 'Avocado Toast', price: 8.50, category: 'Food', stock: 15 },
];

const DEFAULT_SETTINGS = {
  storeName: 'LocalPOS',
  currencySymbol: '$',
  taxRate: 8.0,
};

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('pos');
  const [notification, setNotification] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core Data State
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Load Data on Mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('omni_products');
    const savedTransactions = localStorage.getItem('omni_transactions');
    const savedSettings = localStorage.getItem('omni_settings');

    if (savedProducts) setProducts(JSON.parse(savedProducts));
    else setProducts(DEFAULT_PRODUCTS);

    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));

    if (savedSettings) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
  }, []);

  // Persist Data on Change
  useEffect(() => {
    if (products.length > 0) localStorage.setItem('omni_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('omni_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('omni_settings', JSON.stringify(settings));
  }, [settings]);

  // Global Helpers
  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const formatMoney = (amount) => {
    return `${settings.currencySymbol}${parseFloat(amount).toFixed(2)}`;
  };

  // Mobile Navigation Helper
  const navItems = [
    { id: 'pos', icon: <LayoutGrid size={24} />, label: 'Register' },
    { id: 'inventory', icon: <Package size={24} />, label: 'Inventory' },
    { id: 'transactions', icon: <History size={24} />, label: 'History' },
    { id: 'settings', icon: <Settings size={24} />, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">

      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex w-20 lg:w-64 bg-slate-900 text-white flex-col transition-all duration-300 z-20">
        <div className="p-4 lg:p-6 flex items-center justify-center lg:justify-start space-x-3 border-b border-slate-800">
          <div className="bg-blue-600 p-2 rounded-xl">
            <Store size={24} className="text-white" />
          </div>
          <span className="font-bold text-xl hidden lg:block tracking-tight truncate">
            {settings.storeName}
          </span>
        </div>

        <nav className="flex-1 py-6 flex flex-col gap-2 px-3 lg:px-4">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-3 p-3 lg:px-4 lg:py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="mx-auto lg:mx-0">{item.icon}</div>
              <span className="hidden lg:block font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800 text-center text-slate-500 text-xs hidden lg:block">
          Offline Mode Active
        </div>
      </aside>

      {/* --- MOBILE TOP BAR --- */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white flex items-center justify-between px-4 z-30 shadow-md">
        <div className="flex items-center space-x-2">
          <Store size={20} className="text-blue-400" />
          <span className="font-bold text-lg truncate max-w-[150px]">{settings.storeName}</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-white">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* --- MOBILE DROPDOWN MENU --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-slate-900/95 backdrop-blur-sm z-30 p-4">
          <nav className="flex flex-col gap-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                className={`flex items-center space-x-4 p-4 rounded-xl w-full text-left transition-colors ${
                  activeTab === item.id ? 'bg-blue-600 text-white' : 'text-slate-300 active:bg-slate-800'
                }`}
              >
                {item.icon}
                <span className="font-bold text-lg">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col relative w-full h-full pt-16 md:pt-0 overflow-hidden">
        {activeTab === 'pos' && (
          <POSView
            products={products}
            cart={cart}
            setCart={setCart}
            transactions={transactions}
            setTransactions={setTransactions}
            formatMoney={formatMoney}
            notify={notify}
            settings={settings}
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
            settings={settings}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            setSettings={setSettings}
            products={products}
            setProducts={setProducts}
            transactions={transactions}
            setTransactions={setTransactions}
            notify={notify}
          />
        )}

        {/* Global Toast Notification */}
        {notification && (
          <div className="fixed bottom-20 md:bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center space-x-2 animate-bounce z-50 whitespace-nowrap">
            <CheckCircle size={18} className="text-emerald-400" />
            <span className="font-medium text-sm">{notification}</span>
          </div>
        )}
      </main>
    </div>
  );
}

// ============================================================================
// 🛒 POINT OF SALE VIEW (Highly Responsive)
// ============================================================================
const POSView = ({ products, cart, setCart, setTransactions, formatMoney, notify, settings }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isCartOpenMobile, setIsCartOpenMobile] = useState(false);

  const categories = ['All', ...new Set(products.map(p => p.category))];
  const [activeCategory, setActiveCategory] = useState('All');

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { product, qty: 1 }];
    });
    notify(`Added ${product.name}`);
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === id) {
        return { ...item, qty: Math.max(0, item.qty + delta) };
      }
      return item;
    }).filter(item => item.qty > 0));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const discountAmount = subtotal * (discount / 100);
  const taxableAmount = subtotal - discountAmount;
  const tax = taxableAmount * (settings.taxRate / 100);
  const total = taxableAmount + tax;

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const newTransaction = {
      id: `TRX-${Date.now()}`,
      created_at: new Date().toISOString(),
      items: cart,
      subtotal,
      discount: discountAmount,
      tax,
      total,
      taxRate: settings.taxRate
    };

    setTransactions(prev => [newTransaction, ...prev]);
    setCart([]);
    setDiscount(0);
    setIsCartOpenMobile(false);
    notify(`Payment of ${formatMoney(total)} successful!`);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex h-full w-full flex-col lg:flex-row bg-gray-50 relative">
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="p-4 bg-white border-b border-gray-200 shadow-sm z-10 flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-colors ${
                  activeCategory === cat ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pb-24 lg:pb-4">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white p-3 lg:p-4 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-400 transition-all text-left flex flex-col justify-between active:scale-95 h-32 lg:h-40"
              >
                <div>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md mb-2 inline-block truncate max-w-full">
                    {product.category}
                  </span>
                  <h3 className="font-bold text-gray-800 line-clamp-2 text-sm lg:text-base leading-tight">{product.name}</h3>
                </div>
                <div className="mt-2 text-lg lg:text-xl font-bold text-slate-900">
                  {formatMoney(product.price)}
                </div>
              </button>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-400 flex flex-col items-center">
                <Package size={48} className="mb-4 opacity-20" />
                <p>No products found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-40">
        <button
          onClick={() => setIsCartOpenMobile(true)}
          className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold text-lg flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <ShoppingCart size={24} />
            <span>View Order ({cart.reduce((sum, item) => sum + item.qty, 0)})</span>
          </div>
          <span>{formatMoney(total)}</span>
        </button>
      </div>

      <div className={`
        fixed inset-0 lg:static lg:inset-auto z-50 lg:z-10
        w-full lg:w-96 bg-white border-l border-gray-200 flex flex-col h-full shadow-2xl lg:shadow-none
        transition-transform duration-300 transform
        ${isCartOpenMobile ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
      `}>
        <div className="p-4 lg:p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            Current Order
            <span className="ml-3 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
              {cart.reduce((sum, item) => sum + item.qty, 0)} items
            </span>
          </h2>
          <button
            className="lg:hidden p-2 text-gray-500 hover:bg-gray-200 rounded-full"
            onClick={() => setIsCartOpenMobile(false)}
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <ShoppingCart size={48} className="text-gray-200" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-50 p-3 rounded-xl border border-gray-100 gap-3">
                <div className="flex-1 pr-2">
                  <h4 className="font-semibold text-gray-800 leading-tight">{item.product.name}</h4>
                  <div className="text-sm text-blue-600 font-medium">{formatMoney(item.product.price)}</div>
                </div>

                <div className="flex items-center space-x-3 bg-white border border-gray-200 rounded-lg p-1 self-start sm:self-auto shadow-sm">
                  <button onClick={() => updateQty(item.product.id, -1)} className="p-2 hover:bg-gray-100 rounded-md text-gray-600 active:bg-gray-200">
                    {item.qty === 1 ? <Trash2 size={16} className="text-red-500" /> : <Minus size={16} />}
                  </button>
                  <span className="w-6 text-center font-bold">{item.qty}</span>
                  <button onClick={() => updateQty(item.product.id, 1)} className="p-2 hover:bg-gray-100 rounded-md text-gray-600 active:bg-gray-200">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 lg:p-6 bg-slate-50 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
            <div className="flex items-center text-gray-500 text-sm font-medium">
              <Tag size={16} className="mr-2" /> Discount %
            </div>
            <input
              type="number"
              min="0" max="100"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="w-16 text-right font-bold text-gray-900 focus:outline-none"
            />
          </div>

          <div className="space-y-1 mb-4 text-sm font-medium">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-500">
                <span>Discount ({discount}%)</span>
                <span>-{formatMoney(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-500">
              <span>Tax ({settings.taxRate}%)</span>
              <span>{formatMoney(tax)}</span>
            </div>
            <div className="flex justify-between text-2xl font-bold text-slate-900 pt-3 border-t border-gray-200 mt-2">
              <span>Total</span>
              <span>{formatMoney(total)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-all active:scale-95 ${
              cart.length === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-[0_4px_20px_rgba(37,99,235,0.4)]'
            }`}
          >
            <CreditCard size={20} />
            <span>Charge {formatMoney(total)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 📦 INVENTORY VIEW
// ============================================================================
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
    if(window.confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="p-4 lg:p-8 h-full overflow-y-auto bg-gray-50">
      <div className="max-w-5xl mx-auto space-y-6 lg:space-y-8">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-500 mt-1 text-sm lg:text-base">Manage your offline-first product catalog.</p>
        </div>

        <div className="bg-white p-4 lg:p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-lg mb-4 text-gray-800">Add New Product</h3>
          <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-3 lg:gap-4">
            <input
              type="text" placeholder="Product Name" required
              value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
            <input
              type="text" placeholder="Category (e.g. Food)" required
              value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}
              className="w-full md:w-48 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
            <input
              type="number" step="0.01" placeholder="Price" required
              value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})}
              className="w-full md:w-32 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
            <button type="submit" className="bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 flex items-center justify-center space-x-2 font-medium">
              <Plus size={18} /> <span>Add</span>
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left hidden md:table">
            <thead className="bg-slate-50 border-b border-gray-200">
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
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-bold">{p.category}</span>
                  </td>
                  <td className="p-4 font-bold text-gray-900">{formatMoney(p.price)}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="md:hidden divide-y divide-gray-100">
            {products.map(p => (
              <div key={p.id} className="p-4 flex justify-between items-center">
                <div>
                  <div className="font-bold text-gray-900">{p.name}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-xs font-bold mr-2">{p.category}</span>
                    {formatMoney(p.price)}
                  </div>
                </div>
                <button onClick={() => handleDelete(p.id)} className="text-red-400 p-2 bg-red-50 rounded-lg">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <div className="p-8 text-center text-gray-400">No products in inventory.</div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 📜 TRANSACTIONS VIEW
// ============================================================================
const TransactionsView = ({ transactions, formatMoney, settings }) => {
  const printReceipt = (trx) => {
    const receiptContent = `
      ${settings.storeName}
      ---------------------------
      Receipt ID: ${trx.id}
      Date: ${new Date(trx.created_at).toLocaleString()}
      ---------------------------
      ${trx.items.map(i => `${i.qty}x ${i.product.name} - ${settings.currencySymbol}${(i.product.price * i.qty).toFixed(2)}`).join('\n      ')}
      ---------------------------
      Subtotal: ${settings.currencySymbol}${trx.subtotal.toFixed(2)}
      Discount: -${settings.currencySymbol}${trx.discount?.toFixed(2) || '0.00'}
      Tax (${trx.taxRate}%): ${settings.currencySymbol}${trx.tax.toFixed(2)}
      TOTAL: ${settings.currencySymbol}${trx.total.toFixed(2)}
      ---------------------------
      Thank you for your business!
    `;
    alert(receiptContent);
  };

  return (
    <div className="p-4 lg:p-8 h-full overflow-y-auto bg-gray-50">
      <div className="max-w-5xl mx-auto space-y-6 lg:space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Sales History</h2>
            <p className="text-gray-500 mt-1 text-sm lg:text-base">{transactions.length} total transactions recorded.</p>
          </div>
        </div>

        <div className="space-y-4">
          {transactions.map(t => (
            <div key={t.id} className="bg-white p-4 lg:p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-mono text-sm font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">{t.id}</span>
                  <span className="text-gray-400 text-sm flex items-center"><Clock size={14} className="mr-1"/> {new Date(t.created_at).toLocaleDateString()} {new Date(t.created_at).toLocaleTimeString()}</span>
                </div>
                <div className="text-gray-700 font-medium">
                  {t.items.map(item => `${item.qty}x ${item.product.name}`).join(', ')}
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end md:space-x-6 border-t md:border-t-0 pt-3 md:pt-0">
                <div className="text-right">
                  <div className="text-xs text-gray-500">Total Paid</div>
                  <div className="text-xl font-bold text-slate-900">{formatMoney(t.total)}</div>
                </div>
                <button
                  onClick={() => printReceipt(t)}
                  className="bg-blue-50 text-blue-600 hover:bg-blue-100 p-3 rounded-xl transition-colors flex items-center"
                >
                  <Printer size={18} />
                </button>
              </div>
            </div>
          ))}

          {transactions.length === 0 && (
            <div className="bg-white p-12 text-center rounded-2xl border border-gray-200">
              <History size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-500 text-lg">No transactions yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ⚙️ SETTINGS & IMPORT/EXPORT VIEW
// ============================================================================
const SettingsView = ({ settings, setSettings, products, setProducts, transactions, setTransactions, notify }) => {
  const fileInputRef = useRef(null);

  const handleSettingChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: name === 'taxRate' ? parseFloat(value) || 0 : value
    }));
  };

  const handleExport = () => {
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      settings,
      products,
      transactions
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `LocalPOS_Backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    notify("System data exported successfully.");
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);

        if (importedData.products && Array.isArray(importedData.products)) {
          if(window.confirm("Warning: Importing data will overwrite your current products, settings, and transactions. Proceed?")) {
            setProducts(importedData.products);
            if (importedData.transactions) setTransactions(importedData.transactions);
            if (importedData.settings) setSettings({ ...DEFAULT_SETTINGS, ...importedData.settings });

            notify("Data successfully restored from backup!");
          }
        } else {
          alert("Invalid backup file structure.");
        }
      } catch (error) {
        alert("Error reading file. Please ensure it is a valid LocalPOS JSON backup.");
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  return (
    <div className="p-4 lg:p-8 h-full overflow-y-auto bg-gray-50">
      <div className="max-w-3xl mx-auto space-y-6 lg:space-y-8">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">System Configuration</h2>
          <p className="text-gray-500 mt-1 text-sm lg:text-base">Manage store details and data backups.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-slate-900 mb-6 border-b pb-2">Store Preferences</h3>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Store Name</label>
              <input
                type="text" name="storeName"
                value={settings.storeName} onChange={handleSettingChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-5">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Currency Symbol</label>
                <select
                  name="currencySymbol"
                  value={settings.currencySymbol} onChange={handleSettingChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="$">$ (USD/CAD/AUD)</option>
                  <option value="₱">₱ (PHP)</option>
                  <option value="€">€ (EUR)</option>
                  <option value="£">£ (GBP)</option>
                  <option value="¥">¥ (JPY/CNY)</option>
                  <option value="₹">₹ (INR)</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Default Tax Rate (%)</label>
                <input
                  type="number" name="taxRate" step="0.1" min="0"
                  value={settings.taxRate} onChange={handleSettingChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-slate-900 mb-6 border-b pb-2">Data Management</h3>
          <p className="text-sm text-gray-500 mb-6">
            Because this app stores data locally on this specific device, use these tools to move your inventory and sales data to a new tablet, phone, or computer.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleExport}
              className="flex-1 bg-slate-900 text-white p-4 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center space-x-2 font-bold shadow-md"
            >
              <Download size={20} />
              <span>Export Database (JSON)</span>
            </button>

            <input
              type="file"
              accept=".json"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImport}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-blue-50 text-blue-700 border border-blue-200 p-4 rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2 font-bold shadow-sm"
            >
              <Upload size={20} />
              <span>Import Database</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
