import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

const ProductCard = ({ product }) => {
    const addToCart = useCartStore(state => state.addToCart);

    const imageUrl = product.image 
        ? (product.image.startsWith('http') || product.image.startsWith('/assets') 
            ? product.image 
            : `/${product.image}`) 
        : 'https://via.placeholder.com/300x300?text=No+Image';

    return (
        <div style={{ 
            background: '#fff', 
            border: '1px solid #eee', 
            borderRadius: '8px', 
            padding: '20px', 
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        }}>
            {/* Wrap the image and text in a Link so it is clickable */}
            <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <img 
                    src={imageUrl} 
                    alt={product.name} 
                    style={{ width: '100%', height: '200px', objectFit: 'contain', marginBottom: '15px' }} 
                />
                <h3 style={{ fontSize: '18px', color: '#333', marginBottom: '10px', transition: 'color 0.2s' }}
                    onMouseOver={(e) => e.target.style.color = 'var(--primary-orange)'}
                    onMouseOut={(e) => e.target.style.color = '#333'}
                >
                    {product.name}
                </h3>
            </Link>
            
            <div>
                <p style={{ color: 'var(--primary-orange, #f57224)', fontWeight: 'bold', fontSize: '20px', marginBottom: '5px' }}>
                    ৳ {product.price.toLocaleString()}
                </p>
                <p style={{ fontSize: '12px', color: '#777', marginBottom: '15px' }}>
                    Condition: {product.condition_type} | Stock: {product.stock}
                </p>
                
                <button 
                    onClick={() => addToCart(product)}
                    style={{ 
                        width: '100%', 
                        padding: '12px', 
                        background: '#343a40', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'background 0.3s'
                    }}
                    onMouseOver={(e) => e.target.style.background = 'var(--primary-orange, #f57224)'}
                    onMouseOut={(e) => e.target.style.background = '#343a40'}
                >
                    Add to Cart
                </button>
            </div>
        </div>
    );
};

export default ProductCard;