import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaUser } from 'react-icons/fa';

import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

const Navbar = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);

    const { cart, fetchCart } = useCartStore();
    const cartCount = cart?.reduce((total, item) => total + item.quantity, 0) || 0;
    const { user } = useAuthStore();

    useEffect(() => {
        if (user) {
            fetchCart();
        }
    }, [user, fetchCart]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            navigate('/products');
        }
    };

    return (
        <>
            <style>{`
                .modern-navbar {
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 5%;
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
                    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                }
                .modern-navbar.scrolled {
                    padding: 12px 5%;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
                    background: rgba(255, 255, 255, 0.95);
                }
                
                /* Layout Sections */
                .nav-left {
                    flex: 1;
                    display: flex;
                    justify-content: flex-start;
                }
                .search-container {
                    flex: 0 1 500px;
                    position: relative;
                }
                .nav-right {
                    flex: 1;
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                    gap: 40px; /* Space between text links and icons */
                }

                .nav-logo img {
                    height: 40px;
                    transition: transform 0.3s ease;
                }
                .nav-logo:hover img {
                    transform: scale(1.05);
                }
                
                .search-bar {
                    width: 100%;
                    padding: 12px 45px 12px 20px;
                    border-radius: 30px;
                    border: 2px solid transparent;
                    background: #f0f2f5;
                    font-size: 14px;
                    transition: all 0.3s ease;
                    outline: none;
                }
                .search-bar:focus {
                    background: #fff;
                    border-color: var(--primary-orange, #f57224);
                    box-shadow: 0 4px 15px rgba(245, 114, 36, 0.15);
                    transform: scale(1.02);
                }
                .search-btn {
                    position: absolute;
                    right: 15px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: #888;
                    cursor: pointer;
                    font-size: 16px;
                    transition: color 0.3s ease, transform 0.3s ease;
                    display: flex;
                }
                .search-bar:focus + .search-btn {
                    color: var(--primary-orange, #f57224);
                    transform: translateY(-50%) scale(1.1);
                }
                
                .nav-links {
                    display: flex;
                    gap: 30px;
                    list-style: none;
                    margin: 0;
                    padding: 0;
                }
                .nav-links a {
                    text-decoration: none;
                    color: #333;
                    font-weight: 600;
                    font-size: 16px;
                    position: relative;
                    padding: 5px 0;
                    transition: color 0.3s ease;
                }
                .nav-links a:hover {
                    color: var(--primary-orange, #f57224);
                }
                .nav-links a::after {
                    content: '';
                    position: absolute;
                    width: 0;
                    height: 2px;
                    bottom: 0;
                    left: 0;
                    background-color: var(--primary-orange, #f57224);
                    transition: width 0.3s ease;
                    border-radius: 2px;
                }
                .nav-links a:hover::after {
                    width: 100%;
                }
                
                .nav-icons {
                    display: flex;
                    align-items: center;
                    gap: 25px;
                }
                .icon-btn {
                    position: relative;
                    color: #444;
                    font-size: 20px;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    text-decoration: none;
                }
                .icon-btn:hover {
                    color: var(--primary-orange, #f57224);
                    transform: translateY(-3px);
                }
                .cart-badge {
                    position: absolute;
                    top: -8px;
                    right: -12px;
                    background: var(--primary-orange, #f57224);
                    color: white;
                    font-size: 11px;
                    font-weight: bold;
                    height: 18px;
                    min-width: 18px;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 4px;
                    box-shadow: 0 3px 6px rgba(245, 114, 36, 0.4);
                    border: 2px solid #fff;
                    animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                @keyframes popIn {
                    0% { transform: scale(0); }
                    100% { transform: scale(1); }
                }
            `}</style>

            <header>
                <nav className={`modern-navbar ${isScrolled ? 'scrolled' : ''}`}>
                    
                    {/* Left: Logo */}
                    <div className="nav-left">
                        <Link to="/" className="nav-logo">
                            <img src="/assets/images/TechTown Logo1.png" alt="TechTown Logo" />
                        </Link>
                    </div>

                    {/* Center: Search Bar */}
                    <div className="search-container">
                        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', width: '100%', position: 'relative' }}>
                            <input
                                type="text"
                                name="search"
                                className="search-bar"
                                placeholder="Search for smartphones, laptops..."
                                autoComplete="off"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button type="submit" className="search-btn" title="Search">
                                <FaSearch />
                            </button>
                        </form>
                    </div>

                    {/* Right: Links and Icons Grouped */}
                    <div className="nav-right">
                        <ul className="nav-links">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/products">Shop</Link></li>
                        </ul>

                        <div className="nav-icons">
                            <Link to="/cart" className="icon-btn" title="View Cart">
                                <FaShoppingCart />
                                {cartCount > 0 && (
                                    <span className="cart-badge" key={cartCount}>
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            {user ? (
                                <Link to="/profile" className="icon-btn" title="My Account">
                                    <FaUser />
                                </Link>
                            ) : (
                                <Link to="/login" className="icon-btn" title="Login / Register">
                                    <FaUser />
                                </Link>
                            )}
                        </div>
                    </div>
                    
                </nav>
            </header>
        </>
    );
};

export default Navbar;