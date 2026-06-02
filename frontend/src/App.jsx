import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

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
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/products" element={<Products />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/logged-out" element={<LoggedOut />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/product/:id" element={<ProductDetails />} />
        </Routes>
      </main>

      <Footer />
    </>
  );
}

export default App;