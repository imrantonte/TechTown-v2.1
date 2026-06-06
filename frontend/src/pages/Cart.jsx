import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { FaTrash } from 'react-icons/fa'; // Importing the trash icon

const Cart = () => {
    // We brought in the new updateQuantity function
    const { cart, removeFromCart, getCartTotal, updateQuantity } = useCartStore();

    if (cart.length === 0) {
        return (
            <div className="text-center mt-60 mb-80">
                <h2>Your Shopping Cart is Empty</h2>
                <Link to="/products" style={{ display: 'inline-block', marginTop: '20px', padding: '10px 20px', background: 'var(--primary-orange, #f57224)', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
                    Continue Shopping
                </Link>
            </div>
        );
    }

    const subtotal = getCartTotal();
    const deliveryFee = 120;
    const total = subtotal + deliveryFee;

    return (
        <section className="mt-60 mb-80" style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px' }}>
            <h2 style={{ marginBottom: '30px', color: '#333' }}>Your Shopping Cart</h2>

            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

                {/* LEFT COLUMN: Cart Table (mimicking your screenshot) */}
                <div style={{ flex: '1 1 65%', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                                <th style={{ padding: '20px', color: '#555' }}>Product</th>
                                <th style={{ padding: '20px', color: '#555' }}>Price</th>
                                <th style={{ padding: '20px', color: '#555' }}>Quantity</th>
                                <th style={{ padding: '20px', color: '#555' }}>Total</th>
                                <th style={{ padding: '20px', color: '#555', textAlign: 'center' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map((item) => (
                                <tr key={item._id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ border: '1px solid #eee', borderRadius: '4px', padding: '5px' }}>
                                            <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                                        </div>
                                        <span style={{ color: '#555' }}>{item.name}</span>
                                    </td>

                                    <td style={{ padding: '20px', color: '#555' }}>
                                        ৳ {item.price.toLocaleString()}
                                    </td>

                                    <td style={{ padding: '20px' }}>
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                                            style={{ width: '60px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'center' }}
                                        />
                                    </td>

                                    <td style={{ padding: '20px', color: '#555' }}>
                                        ৳ {(item.price * item.quantity).toLocaleString()}
                                    </td>

                                    <td style={{ padding: '20px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => removeFromCart(item.productId)}
                                            style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: '18px' }}
                                            title="Remove Item"
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* RIGHT COLUMN: Order Summary Card */}
                <div style={{ flex: '1 1 300px', background: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginBottom: '25px', color: '#333' }}>Order Summary</h3>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#555' }}>
                        <span>Subtotal</span>
                        <span>৳ {subtotal.toLocaleString()}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', color: '#555', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
                        <span>Delivery</span>
                        <span>৳ {deliveryFee}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
                        <span>Total</span>
                        <span>৳ {total.toLocaleString()}</span>
                    </div>

                    <Link to="/checkout" style={{ display: 'block', width: '100%', padding: '15px', background: 'var(--primary-orange, #f57224)', color: '#fff', textDecoration: 'none', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', fontSize: '16px', marginBottom: '15px' }}>
                        Proceed to Checkout
                    </Link>

                    <div style={{ textAlign: 'center' }}>
                        <Link to="/products" style={{ color: '#777', textDecoration: 'none', fontSize: '14px' }}>
                            Continue Shopping
                        </Link>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default Cart;