import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Page Components
import Home from './pages/Home';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Products from './pages/Products';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import LoggedOut from './pages/LoggedOut';
import Dashboard from './pages/Dashboard';
import ProductDetails from './pages/ProductDetails';
import ChatBot from './components/ChatBot';

// Global Store
import { useAuthStore } from './store/authStore';

function App() {
  const checkAuth = useAuthStore(state => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} />
      <Navbar />

      <main style={{ minHeight: '80vh' }}>
        <Routes>
          {/* Public Routes - Anyone can access */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/products" element={<Products />} />
          <Route path="/register" element={<Register />} />
          <Route path="/logged-out" element={<LoggedOut />} />
          <Route path="/product/:id" element={<ProductDetails />} />

          {/* Protected Routes - Must be logged in */}
          <Route path="/cart" element={
            <ProtectedRoute><Cart /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute><Checkout /></ProtectedRoute>
          } />

          {/* Admin/Seller Only Route */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['admin', 'seller']}>
              <Dashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </main>

      <Footer />
      <ChatBot />
    </>
  );
}

export default App;