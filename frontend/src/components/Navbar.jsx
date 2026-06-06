import { useEffect } from 'react'; // <-- 1. IMPORT useEffect
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaUser, FaSignOutAlt } from 'react-icons/fa';

// Import our new global stores
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

const Navbar = () => {
    const navigate = useNavigate();

    // 2. Destructure both cart AND fetchCart from the store
    const { cart, fetchCart } = useCartStore();
    
    // Ensure cart exists before reducing to prevent crashes
    const cartCount = cart?.reduce((total, item) => total + item.quantity, 0) || 0;

    const { user } = useAuthStore();

    // 3. The exact second the user logs in, fetch their saved cart
    useEffect(() => {
        if (user) {
            fetchCart();
        }
    }, [user, fetchCart]);

    return (
        <header>
            <nav className="navbar">
                <div className="logo">
                    <Link to="/">
                        <img src="/assets/images/TechTown Logo1.png" alt="TechTown Logo" />
                    </Link>
                </div>

                <div className="search-container">
                    <form style={{ display: 'flex', width: '100%', position: 'relative' }}>
                        <input
                            type="text"
                            name="search"
                            className="search-bar"
                            placeholder="Search devices..."
                            autoComplete="off"
                        />
                        <button
                            type="submit"
                            style={{ background: 'none', border: 'none', position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#888' }}
                        >
                            <FaSearch />
                        </button>
                    </form>
                </div>

                <ul className="nav-links">
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/products">Shop</Link></li>
                </ul>

                <div className="nav-icons" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <Link to="/cart" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaShoppingCart />
                        <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--primary-orange)' }}>
                            ({cartCount})
                        </span>
                    </Link>

                    {/* Conditional Rendering: Check if user is logged in */}
                    {user ? (
                        <Link to="/profile" title="My Account" style={{ color: '#333', fontSize: '18px' }}>
                            <FaUser />
                        </Link>
                    ) : (
                        <Link to="/login" title="Login">
                            <FaUser />
                        </Link>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Navbar;