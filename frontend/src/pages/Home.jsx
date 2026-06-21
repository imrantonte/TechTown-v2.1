import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProductStore } from '../store/productStore';
import { FaMobileAlt, FaLaptop, FaCamera, FaStopwatch, FaHeadphones, FaArrowRight, FaShieldAlt, FaTruck } from 'react-icons/fa';
const Home = () => {
    const { products, fetchProducts, isLoading } = useProductStore();

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const safeProducts = products || [];
    const smartphones = safeProducts.filter(p => p.category === 'Smartphones').slice(0, 5);
    const laptops = safeProducts.filter(p => p.category === 'Laptops').slice(0, 5);
    const watches = safeProducts.filter(p => p.category === 'Smart Watches').slice(0, 5);
    const tablets = safeProducts.filter(p => p.category === 'Tablets').slice(0, 5);
    const monitors = safeProducts.filter(p => p.category === 'Monitors').slice(0, 5);

    const categories = [
        { name: 'Phones', icon: <FaMobileAlt size={18} />, link: '/products?category=Smartphones' },
        { name: 'Laptops', icon: <FaLaptop size={18} />, link: '/products?category=Laptops' },
        { name: 'Cameras', icon: <FaCamera size={18} />, link: '/products?category=Cameras' },
        { name: 'Watches', icon: <FaStopwatch size={18} />, link: '/products?category=Smart Watches' },
        { name: 'Accessories', icon: <FaHeadphones size={18} />, link: '/products?category=Accessories' }
    ];

    return (
        <div style={{
            backgroundColor: '#f8fafc',
            minHeight: '100vh',
            paddingBottom: '80px',
            borderTop: '1px solid #eee'
        }}>

            {/* ========================================================= */}
            {/* CINEMATIC HERO SECTION (Custom Background) */}
            {/* ========================================================= */}
            <div style={{ maxWidth: '1280px', margin: '30px auto 0', padding: '0 20px' }}>
                <div style={{
                    position: 'relative',
                    backgroundImage: `url('/assets/images/hero-bg.png')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '24px',
                    minHeight: '480px',
                    display: 'flex',
                    alignItems: 'center',
                    overflow: 'hidden',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
                }}>
                    {/* Gradient Overlay to ensure text readability over your custom image */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to right, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.6) 50%, rgba(15, 23, 42, 0.1) 100%)',
                        zIndex: 1
                    }}></div>

                    {/* Hero Content */}
                    <div style={{ position: 'relative', zIndex: 2, padding: '0 60px', maxWidth: '700px' }}>
                        <div style={{
                            display: 'inline-block',
                            padding: '6px 14px',
                            background: 'rgba(245, 114, 36, 0.2)',
                            border: '1px solid rgba(245, 114, 36, 0.3)',
                            color: '#f57224',
                            borderRadius: '30px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            marginBottom: '24px',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            backdropFilter: 'blur(4px)'
                        }}>
                            Bangladesh's Prime Scam Tech Hub
                        </div>

                        <h1 style={{ fontSize: '52px', fontWeight: 'bold', color: '#ffffff', lineHeight: '1.15', marginBottom: '20px' }}>
                            Downgrade Your Tech <br /> Lifestyle Today.
                        </h1>

                        <p style={{ fontSize: '18px', color: '#cbd5e1', marginBottom: '40px', lineHeight: '1.6', maxWidth: '550px' }}>
                            Shop the latest smartphones, premium laptops, and authentic smart wearables from verified scammers, I mean sellers across the country.
                        </p>

                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <Link to="/products" style={{
                                background: 'var(--primary-orange, #f57224)',
                                color: '#fff',
                                padding: '16px 36px',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                fontSize: '16px',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 8px 20px rgba(245, 114, 36, 0.4)'
                            }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 25px rgba(245, 114, 36, 0.5)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(245, 114, 36, 0.4)'; }}
                            >
                                Start Browsing <FaArrowRight size={14} />
                            </Link>

                            <div style={{ display: 'flex', gap: '25px', marginLeft: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', fontSize: '14px', fontWeight: 'bold' }}>
                                    <FaShieldAlt color="var(--primary-orange, #f57224)" size={18} /> Verified Sellers
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', fontSize: '14px', fontWeight: 'bold' }}>
                                    <FaTruck color="var(--primary-orange, #f57224)" size={18} /> Fast Delivery
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================================= */}
            {/* FLOATING CATEGORY PILLS */}
            {/* ========================================================= */}
            <div style={{ maxWidth: '1280px', margin: '40px auto 60px', padding: '0 20px' }}>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {categories.map((cat, idx) => (
                        <Link key={idx} to={cat.link} style={{
                            background: '#ffffff',
                            padding: '16px 32px',
                            borderRadius: '50px',
                            textDecoration: 'none',
                            color: '#334155',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            fontWeight: 'bold',
                            fontSize: '15px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                            border: '1px solid transparent'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 12px 25px rgba(245, 114, 36, 0.15)';
                                e.currentTarget.style.color = 'var(--primary-orange, #f57224)';
                                e.currentTarget.style.borderColor = 'rgba(245, 114, 36, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
                                e.currentTarget.style.color = '#334155';
                                e.currentTarget.style.borderColor = 'transparent';
                            }}
                        >
                            <span style={{ color: 'inherit', transition: 'color 0.3s ease' }}>{cat.icon}</span>
                            {cat.name}
                        </Link>
                    ))}
                </div>
            </div>

            {/* ========================================================= */}
            {/* PRODUCT GRIDS (Matches the 5-item layout you liked) */}
            {/* ========================================================= */}
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
                <Section title="Latest Smartphones" category="Smartphones" products={smartphones} isLoading={isLoading} />
                <Section title="Premium Ultrabooks" category="Laptops" products={laptops} isLoading={isLoading} />
                {watches.length > 0 && <Section title="Smart Wearables" category="Smart Watches" products={watches} isLoading={isLoading} />}
            </div>
        </div>
    );
};

// =========================================================
// REUSABLE SECTION COMPONENT 
// =========================================================
const Section = ({ title, category, products, isLoading }) => (
    <div style={{ marginBottom: '60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '25px' }}>
            <h2 style={{ fontSize: '22px', margin: 0, fontWeight: 'bold', color: '#222' }}>{title}</h2>
            <Link to={`/products?category=${category}`} style={{ color: 'var(--primary-orange, #f57224)', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', transition: '0.2s' }}>
                View all
            </Link>
        </div>
        {isLoading ? (
            <p style={{ color: '#777' }}>Loading inventory...</p>
        ) : (
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '20px'
            }}>
                {products.length > 0 ? products.map(p => <ProductCard key={p._id} product={p} />) : <p style={{ color: '#999' }}>No items found.</p>}
            </div>
        )}
    </div>
);

// =========================================================
// RETAIL PRODUCT CARD
// =========================================================
const ProductCard = ({ product }) => (
    <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '14px',
            border: '1px solid #f1f5f9',
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)'
        }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(0, 0, 0, 0.08)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.02)'; e.currentTarget.style.borderColor = '#f1f5f9'; }}
        >
            <div style={{
                height: '200px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                padding: '15px',
                position: 'relative'
            }}>
                <img src={product.image?.startsWith('http') || product.image?.startsWith('/assets') ? product.image : `/${product.image}`}
                    alt={product.name}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', mixBlendMode: 'multiply', transition: 'transform 0.3s ease' }}
                    onError={(e) => e.target.src = '/assets/images/TechTown Logo1.png'}
                />

                {product.stock <= 0 && (
                    <span style={{
                        position: 'absolute', top: '12px', right: '12px', background: '#ef4444', color: '#fff', fontSize: '9px', fontWeight: 'bold', padding: '4px 6px', borderRadius: '4px', zIndex: 20, textTransform: 'uppercase', letterSpacing: '0.5px'
                    }}>
                        Out of Stock
                    </span>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between', padding: '0 4px' }}>
                <div>
                    <p style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#777', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {product.category}
                    </p>
                    <h4 style={{
                        margin: '0 0 12px 0', fontSize: '15px', fontWeight: 'bold', color: '#222', lineHeight: '1.4',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', minHeight: '42px'
                    }}>
                        {product.name}
                    </h4>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: 'var(--primary-orange, #f57224)' }}>
                        ৳ {product.price.toLocaleString()}
                    </p>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#222' }}>
                        <FaArrowRight size={12} />
                    </div>
                </div>
            </div>
        </div>
    </Link>
);

export default Home;