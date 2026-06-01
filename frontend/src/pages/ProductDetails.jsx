import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProductStore } from '../store/productStore';
import { useCartStore } from '../store/cartStore';

const ProductDetails = () => {
    const { id } = useParams(); // Grabs the ID from the URL
    const navigate = useNavigate();
    
    const { products, fetchProducts } = useProductStore();
    const addToCart = useCartStore(state => state.addToCart);

    // If a user lands here directly via a link, we might need to fetch products first
    useEffect(() => {
        if (products.length === 0) {
            fetchProducts();
        }
    }, [products, fetchProducts]);

    const handleBuyNow = () => {
        if (product.stock > 0) {
            addToCart(product);
            navigate('/checkout');
        }
    };

    const product = products.find((p) => p._id === id);

    if (products.length === 0) return <h2 className="text-center mt-60 mb-80">Loading Product...</h2>;
    
    if (!product) {
        return (
            <div className="text-center mt-60 mb-80">
                <h2>Product Not Found</h2>
                <p style={{ marginTop: '15px', marginBottom: '25px' }}>The device you are looking for does not exist or was removed.</p>
                <Link to="/products" style={{ padding: '10px 20px', background: 'var(--primary-orange, #f57224)', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}>
                    Back to Shop
                </Link>
            </div>
        );
    }

    const imageUrl = product.image 
        ? (product.image.startsWith('http') || product.image.startsWith('/assets') 
            ? product.image 
            : `/${product.image}`) 
        : '/assets/images/TechTown Logo1.png';

    return (
        <section className="mt-60 mb-80" style={{ maxWidth: '1000px', margin: '60px auto', padding: '0 20px' }}>
            <Link to="/products" style={{ color: '#777', textDecoration: 'none', marginBottom: '20px', display: 'inline-block' }}>
                &larr; Back to Shop
            </Link>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', background: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                
                {/* Left Side: Image */}
                <div className="flex-center" style={{ background: '#f9f9f9', borderRadius: '8px', padding: '20px' }}>
                    <img src={imageUrl} alt={product.name} style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }} />
                </div>

                {/* Right Side: Details */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#777', letterSpacing: '1px' }}>
                        {product.category}
                    </span>
                    <h1 style={{ fontSize: '32px', margin: '10px 0' }}>{product.name}</h1>
                    
                    <p style={{ fontSize: '28px', color: 'var(--primary-orange, #f57224)', fontWeight: 'bold', margin: '15px 0' }}>
                        ৳ {product.price.toLocaleString()}
                    </p>

                    <div style={{ margin: '20px 0', padding: '15px 0', borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}>
                        <p style={{ margin: '5px 0' }}><strong>Condition:</strong> {product.condition_type}</p>
                        <p style={{ margin: '5px 0' }}>
                            <strong>Availability:</strong> 
                            <span style={{ color: product.stock > 0 ? '#28a745' : '#dc3545', fontWeight: 'bold', marginLeft: '5px' }}>
                                {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                            </span>
                        </p>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <h4 style={{ marginBottom: '10px' }}>Description</h4>
                        <p style={{ color: '#555', lineHeight: '1.6' }}>
                            {product.description || 'No description available for this device.'}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button 
                            onClick={() => addToCart(product)}
                            disabled={product.stock < 1}
                            style={{ 
                                flex: 1, 
                                padding: '15px', 
                                background: product.stock > 0 ? '#343a40' : '#ccc', 
                                color: '#fff', 
                                border: 'none', 
                                borderRadius: '4px', 
                                cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                                fontWeight: 'bold',
                                fontSize: '16px',
                                transition: 'background 0.3s'
                            }}
                            onMouseOver={(e) => { if(product.stock > 0) e.target.style.background = '#23272b'}}
                            onMouseOut={(e) => { if(product.stock > 0) e.target.style.background = '#343a40'}}
                        >
                            Add to Cart
                        </button>

                        <button 
                            onClick={handleBuyNow}
                            disabled={product.stock < 1}
                            style={{ 
                                flex: 1, 
                                padding: '15px', 
                                background: product.stock > 0 ? 'var(--primary-orange, #f57224)' : '#ccc', 
                                color: '#fff', 
                                border: 'none', 
                                borderRadius: '4px', 
                                cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                                fontWeight: 'bold',
                                fontSize: '16px',
                                transition: 'background 0.3s'
                            }}
                            onMouseOver={(e) => { if(product.stock > 0) e.target.style.background = '#e0601b'}}
                            onMouseOut={(e) => { if(product.stock > 0) e.target.style.background = 'var(--primary-orange, #f57224)'}}
                        >
                            {product.stock > 0 ? 'Buy Now' : 'Out of Stock'}
                        </button>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default ProductDetails;