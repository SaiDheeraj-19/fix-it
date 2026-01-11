
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Header from './components/Header';
import BentoGrid from './components/BentoGrid';
import CartDrawer from './components/CartDrawer';
import CheckoutForm from './components/CheckoutForm';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import QuoteModal from './components/QuoteModal';
import ModelSelectorModal from './components/ModelSelectorModal';
import ProductDetailModal from './components/ProductDetailModal';
import FloatingCart from './components/FloatingCart';
import ServicesPage from './components/ServicesPage';
import HomePage from './components/HomePage';
import StorePage from './components/StorePage';
import Footer from './components/Footer';
import Logo from './components/Logo';
import { CartItem, Product, Order, Category } from './types';
import { PRODUCTS } from './constants';
import { syncOrderToDb, fetchOrdersFromDb, updateOrderStatusInDb, fetchProductsFromDb, deleteOrderFromDb, subscribeToOrders } from './supabase';

// Helper component to fix navigation scroll issue
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('fixit_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('fixit_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('fixit_admin_session') === 'active';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProductForQuote, setSelectedProductForQuote] = useState<Product | null>(null);
  const [selectedProductForModel, setSelectedProductForModel] = useState<Product | null>(null);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);

  const arrivalsRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    let subscription: any;

    const loadData = async () => {
      // Fetch Products
      const dbProducts = await fetchProductsFromDb();
      if (dbProducts && dbProducts.length > 0) {
        setProducts(dbProducts);
      }

      // Fetch Orders if Admin
      if (isAdminLoggedIn) {
        const fetchAndSetOrders = async () => {
          const dbOrders = await fetchOrdersFromDb();
          if (dbOrders) {
            setOrders(dbOrders);
            localStorage.setItem('fixit_orders', JSON.stringify(dbOrders));
          }
        };

        await fetchAndSetOrders();

        subscription = subscribeToOrders(() => {
          fetchAndSetOrders();
        });
      }
    };
    loadData();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [isAdminLoggedIn]);

  useEffect(() => {
    localStorage.setItem('fixit_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('fixit_orders', JSON.stringify(orders));
  }, [orders]);

  const handleLogin = (password: string) => {
    if (password === 'dinesh@fixit') {
      setIsAdminLoggedIn(true);
      localStorage.setItem('fixit_admin_session', 'active');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('fixit_admin_session');
  };

  const addToCart = (product: Product, quantity: number, phoneDetails?: string, quotedPrice?: number) => {
    setCart(prev => {
      const existingKey = product.id + (phoneDetails || '');
      const existing = prev.find(item => (item.id + (item.phoneDetails || '')) === existingKey);

      if (existing) {
        return prev.map(item =>
          (item.id + (item.phoneDetails || '')) === existingKey
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity, phoneDetails, quotedPrice }];
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (uniqueId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if ((item.id + (item.phoneDetails || '')) === uniqueId) {
        const newQty = Math.max(1, Math.min(10, item.quantity + delta));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleAddToCartRequest = (product: Product, quantity: number) => {
    if (product.isModelRequired || product.isUniversalModel) {
      setSelectedProductForModel(product);
      return;
    }

    if (product.isContactOnly) {
      const msg = encodeURIComponent(`Hi Fix It, I'm interested in the ${product.name}.`);
      window.open(`https://wa.me/919182919360?text=${msg}`, '_blank');
      return;
    }

    if (product.isQuoteRequired) {
      setSelectedProductForQuote(product);
    } else {
      addToCart(product, quantity);
    }
  };

  const removeFromCart = (uniqueId: string) => {
    setCart(prev => prev.filter(item => (item.id + (item.phoneDetails || '')) !== uniqueId));
  };

  const clearCart = () => setCart([]);

  const createOrder = async (orderData: Omit<Order, 'id' | 'timestamp' | 'status'>): Promise<Order> => {
    const newOrder: Order = {
      ...orderData,
      id: `FIX-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      timestamp: Date.now(),
      status: 'Pending'
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    await syncOrderToDb(newOrder);
    return newOrder;
  };

  const handleUpdateOrderStatus = async (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    await updateOrderStatusInDb(id, status);
  };

  const handleDeleteOrder = async (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
    await deleteOrderFromDb(id);
  };

  const getItemPrice = (item: CartItem) => item.quotedPrice || item.price || 0;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (getItemPrice(item) * item.quantity), 0);

  const filteredProducts = products.filter(p => {
    const isService = p.isQuoteRequired;
    if (isService) return false;

    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const repairServices = products.filter(p => p.isQuoteRequired);

  const scrollToArrivals = () => {
    arrivalsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const categories: (Category | 'All')[] = [
    'All', 'AirPods', 'Chargers', 'Cables', 'Skins', 'ScreenGuards', 'Speakers', 'Neckbands', 'WiredAudio'
  ];

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen bg-black text-white pb-32">
        {location.pathname !== '/' && (
          <Header
            isAdminLoggedIn={isAdminLoggedIn}
            onLogout={handleLogout}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/store" element={
            <StorePage
              products={products}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              searchQuery={searchQuery}
              onAddToCart={handleAddToCartRequest}
              onViewDetails={setSelectedProductForDetail}
            />
          } />
          <Route path="/repairs" element={<ServicesPage services={repairServices} onSelect={(service) => handleAddToCartRequest(service, 1)} />} />
          <Route path="/admin" element={isAdminLoggedIn ? <AdminDashboard orders={orders} onLogout={handleLogout} onUpdateStatus={handleUpdateOrderStatus} onDeleteOrder={handleDeleteOrder} /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={isAdminLoggedIn ? <Navigate to="/admin" replace /> : <AdminLogin onLogin={handleLogin} />} />
        </Routes>
        {!isAdminLoggedIn && location.pathname !== '/login' && location.pathname !== '/' && <Footer />}
        {location.pathname !== '/' && <FloatingCart count={totalItems} onClick={() => setIsCartOpen(true)} />}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cart}
          onRemove={removeFromCart}
          onUpdateQuantity={updateCartQuantity}
          onProceed={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
        />
        {isCheckoutOpen && <CheckoutForm onClose={() => setIsCheckoutOpen(false)} onSubmit={createOrder} total={totalPrice} items={cart} />}
        {selectedProductForQuote && <QuoteModal
          product={selectedProductForQuote}
          onClose={() => setSelectedProductForQuote(null)}
          onConfirm={(details, price) => {
            addToCart(selectedProductForQuote, 1, details, price);
            setSelectedProductForQuote(null);
          }}
        />}
        {selectedProductForModel && <ModelSelectorModal
          product={selectedProductForModel}
          onClose={() => setSelectedProductForModel(null)}
          onConfirm={(model) => {
            addToCart(selectedProductForModel, 1, model);
            setSelectedProductForModel(null);
          }}
        />}
        {selectedProductForDetail && <ProductDetailModal
          product={selectedProductForDetail}
          onClose={() => setSelectedProductForDetail(null)}
          onAddToCart={(quantity) => handleAddToCartRequest(selectedProductForDetail, quantity)}
        />}
      </div >
    </>
  );
};

export default App;