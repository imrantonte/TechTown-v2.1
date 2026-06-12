import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useProductStore } from '../store/productStore';
import { FaArrowRight, FaFilter, FaTimes, FaChevronDown } from 'react-icons/fa';

const Products = () => {
    const { products, fetchProducts, isLoading } = useProductStore();
    const location = useLocation();

    // =========================================================
    // STATE MANAGEMENT 
    // =========================================================
    const [globalSearchQuery, setGlobalSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Default sorting is now our custom category ranking
    const [sortBy, setSortBy] = useState('default');
    const [isSortOpen, setIsSortOpen] = useState(false);

    const [minPriceInput, setMinPriceInput] = useState('');
    const [maxPriceInput, setMaxPriceInput] = useState('');
    const [appliedMinPrice, setAppliedMinPrice] = useState(null);
    const [appliedMaxPrice, setAppliedMaxPrice] = useState(null);

    const [selectedConditions, setSelectedConditions] = useState([]);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);

        const categoryParam = params.get('category');
        if (categoryParam) setSelectedCategory(categoryParam);

        const searchParam = params.get('search');
        if (searchParam) setGlobalSearchQuery(searchParam);
        else setGlobalSearchQuery('');
    }, [location]);

    // =========================================================
    // FILTER MATH & LOGIC
    // =========================================================
    const handleApplyPrice = () => {
        setAppliedMinPrice(minPriceInput ? Number(minPriceInput) : null);
        setAppliedMaxPrice(maxPriceInput ? Number(maxPriceInput) : null);
    };

    const handleConditionToggle = (condition) => {
        setSelectedConditions(prev =>
            prev.includes(condition)
                ? prev.filter(c => c !== condition)
                : [...prev, condition]
        );
    };

    const clearFilters = () => {
        setSelectedCategory('All');
        setMinPriceInput('');
        setMaxPriceInput('');
        setAppliedMinPrice(null);
        setAppliedMaxPrice(null);
        setSelectedConditions([]);
    };

    let filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(globalSearchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        const matchesMinPrice = appliedMinPrice === null || product.price >= appliedMinPrice;
        const matchesMaxPrice = appliedMaxPrice === null || product.price <= appliedMaxPrice;
        const productCondition = product.condition_type || 'New'; 
        const matchesCondition = selectedConditions.length === 0 || selectedConditions.includes(productCondition);
        return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice && matchesCondition;
    });

    // =========================================================
    // THE CUSTOM CATEGORY RANKING DICTIONARY
    // =========================================================
    const categoryRank = {
        'Smartphones': 1,
        'Laptops': 2,
        'Cameras': 3,
        'Smart Watches': 4,
        'Accessories': 5
    };

    if (sortBy === 'default') {
        filteredProducts.sort((a, b) => {
            // Give unknown categories a rank of 99 so they go to the absolute bottom
            const rankA = categoryRank[a.category] || 99;
            const rankB = categoryRank[b.category] || 99;

            if (rankA !== rankB) {
                return rankA - rankB; // Sort by the hierarchical number
            }
            // Tie-breaker: If they are in the same category, sort by newest
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }
    else if (sortBy === 'price_low') filteredProducts.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_high') filteredProducts.sort((a, b) => b.price - a.price);
    else if (sortBy === 'newest') filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const categories = ['All', 'Smartphones', 'Laptops', 'Cameras', 'Smart Watches', 'Accessories'];
    const conditionOptions = ['New', 'Used - Like New', 'Used - Good'];

    const sortOptions = {
        'default': 'Default View',
        'newest': 'Newest Arrivals',
        'price_low': 'Price: Low to High',
        'price_high': 'Price: High to Low'
    };

    // =========================================================
    // RENDER UI
    // =========================================================
    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingTop: '30px', paddingBottom: '60px' }}>

            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px', display: 'flex', gap: '30px', alignItems: 'flex-start' }}>

                {/* ========================================================= */}
                {/* LEFT SIDEBAR (The Filter Engine) */}
                {/* ========================================================= */}
                <div style={{
                    width: '260px',
                    flexShrink: 0,
                    position: 'sticky',
                    top: '20px',
                    background: '#ffffff',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                    ...(window.innerWidth <= 992 && {
                        position: 'fixed', top: 0, left: isMobileSidebarOpen ? 0 : '-100%', height: '100vh', zIndex: 1000, borderRadius: 0, transition: 'left 0.3s ease', overflowY: 'auto'
                    })
                }}>
                    {window.innerWidth <= 992 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Filters</h3>
                            <FaTimes size={20} color="#666" cursor="pointer" onClick={() => setIsMobileSidebarOpen(false)} />
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: '#111' }}>Filters</h3>
                        <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: 'var(--primary-orange, #f57224)', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>Clear All</button>
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#888', fontWeight: 'bold', letterSpacing: '0.5px', marginBottom: '10px' }}>Categories</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    style={{
                                        textAlign: 'left', background: 'none', border: 'none', padding: '6px 0', fontSize: '14px', cursor: 'pointer', fontWeight: selectedCategory === cat ? 'bold' : 'normal',
                                        color: selectedCategory === cat ? 'var(--primary-orange, #f57224)' : '#444',
                                        transition: '0.2s'
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginTop: '25px' }}>
                        <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#888', fontWeight: 'bold', letterSpacing: '0.5px', marginBottom: '10px' }}>Condition</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {conditionOptions.map(cond => (
                                <label key={cond} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#444', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedConditions.includes(cond)}
                                        onChange={() => handleConditionToggle(cond)}
                                        style={{ width: '14px', height: '14px', cursor: 'pointer', accentColor: 'var(--primary-orange, #f57224)' }}
                                    />
                                    {cond}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginTop: '25px' }}>
                        <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#888', fontWeight: 'bold', letterSpacing: '0.5px', marginBottom: '10px' }}>Price Range (৳)</h4>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                            <input type="number" placeholder="Min" value={minPriceInput} onChange={(e) => setMinPriceInput(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }} />
                            <input type="number" placeholder="Max" value={maxPriceInput} onChange={(e) => setMaxPriceInput(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }} />
                        </div>
                        <button onClick={handleApplyPrice} style={{ width: '100%', padding: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontWeight: 'bold', color: '#333', fontSize: '13px', cursor: 'pointer', transition: '0.2s' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#cbd5e1'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}>
                            Apply Range
                        </button>
                    </div>
                </div>

                {isMobileSidebarOpen && window.innerWidth <= 992 && (
                    <div onClick={() => setIsMobileSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }}></div>
                )}

                {/* ========================================================= */}
                {/* RIGHT CONTENT AREA (Compact Header & Grid) */}
                {/* ========================================================= */}
                <div style={{ flex: 1, minWidth: 0 }}>

                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
                        <div>
                            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111', margin: '0 0 4px 0' }}>
                                {selectedCategory === 'All' ? 'All Devices' : selectedCategory}
                            </h1>
                            <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                                {globalSearchQuery && <span style={{ marginRight: '8px', color: 'var(--primary-orange, #f57224)' }}>Searching: "{globalSearchQuery}"</span>}
                                Showing {filteredProducts.length} results
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <button
                                onClick={() => setIsMobileSidebarOpen(true)}
                                style={{ display: window.innerWidth > 992 ? 'none' : 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                <FaFilter size={12} /> Filters
                            </button>

                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setIsSortOpen(!isSortOpen)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px', background: '#fff',
                                        padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0',
                                        cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', color: '#111',
                                        transition: 'border-color 0.2s', outline: 'none'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                                >
                                    <span style={{ color: '#888', fontWeight: 'bold', marginRight: '4px' }}>Sort:</span>
                                    {sortOptions[sortBy]}
                                    <FaChevronDown style={{
                                        color: '#888', fontSize: '10px', marginLeft: '4px', transition: 'transform 0.2s ease',
                                        transform: isSortOpen ? 'rotate(180deg)' : 'rotate(0)'
                                    }} />
                                </button>

                                {isSortOpen && (
                                    <div
                                        style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                                        onClick={() => setIsSortOpen(false)}
                                    ></div>
                                )}

                                {isSortOpen && (
                                    <div style={{
                                        position: 'absolute', top: '100%', right: 0, marginTop: '6px',
                                        background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px',
                                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', zIndex: 50,
                                        width: '180px', overflow: 'hidden'
                                    }}>
                                        {Object.entries(sortOptions).map(([key, label]) => (
                                            <div
                                                key={key}
                                                onClick={() => { setSortBy(key); setIsSortOpen(false); }}
                                                style={{
                                                    padding: '12px 16px', fontSize: '13px', cursor: 'pointer', transition: '0.2s',
                                                    fontWeight: sortBy === key ? 'bold' : 'normal',
                                                    color: sortBy === key ? 'var(--primary-orange, #f57224)' : '#333',
                                                    background: sortBy === key ? '#fff0e6' : '#fff'
                                                }}
                                                onMouseEnter={(e) => { if (sortBy !== key) e.currentTarget.style.background = '#f8fafc' }}
                                                onMouseLeave={(e) => { if (sortBy !== key) e.currentTarget.style.background = '#fff' }}
                                            >
                                                {label}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '80px 0', color: '#666' }}>Scanning inventory...</div>
                    ) : filteredProducts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                            <div style={{ fontSize: '40px', marginBottom: '15px' }}>🔍</div>
                            <h3 style={{ fontSize: '18px', color: '#111', margin: '0 0 8px 0' }}>No matches found</h3>
                            <p style={{ color: '#666', margin: '0 0 20px 0', fontSize: '14px' }}>Try adjusting your filters or search term.</p>
                            <button onClick={clearFilters} style={{ background: 'var(--primary-orange, #f57224)', color: '#fff', padding: '8px 20px', borderRadius: '6px', border: 'none', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
                                Reset Filters
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                            {filteredProducts.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// =========================================================
// RETAIL PRODUCT CARD
// =========================================================
const ProductCard = ({ product }) => (
    <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{
            background: '#ffffff', borderRadius: '12px', padding: '14px', border: '1px solid #f1f5f9',
            transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column', height: '100%',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)'
        }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(0, 0, 0, 0.08)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.02)'; e.currentTarget.style.borderColor = '#f1f5f9'; }}
        >
            <div style={{
                height: '200px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', marginBottom: '16px', padding: '15px', position: 'relative'
            }}>
                <img src={product.image?.startsWith('http') || product.image?.startsWith('/assets') ? product.image : `/${product.image}`}
                    alt={product.name}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', mixBlendMode: 'multiply', transition: 'transform 0.3s ease' }}
                    onError={(e) => e.target.src = '/assets/images/TechTown Logo1.png'}
                />
                {product.stock === 0 ? (
                    <span style={{ position: 'absolute', top: '12px', right: '12px', background: '#ef4444', color: '#fff', fontSize: '9px', fontWeight: 'bold', padding: '4px 6px', borderRadius: '4px', zIndex: 20, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Out of Stock
                    </span>
                ) : product.stock <= 5 ? (
                    <span style={{ position: 'absolute', top: '12px', right: '12px', background: '#f5a623', color: '#fff', fontSize: '9px', fontWeight: 'bold', padding: '4px 6px', borderRadius: '4px', zIndex: 20, textTransform: 'uppercase', letterSpacing: '0.5px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        Low Stock ({product.stock})
                    </span>
                ) : null}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between', padding: '0 4px' }}>
                <div>
                    <p style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#777', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{product.category}</p>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 'bold', color: '#222', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', minHeight: '42px' }}>
                        {product.name}
                    </h4>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: 'var(--primary-orange, #f57224)' }}>৳ {product.price.toLocaleString()}</p>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#222' }}>
                        <FaArrowRight size={12} />
                    </div>
                </div>
            </div>
        </div>
    </Link>
);

export default Products;