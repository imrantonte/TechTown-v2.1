import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';
import axios from 'axios';

const Checkout = () => {
    const navigate = useNavigate();
    const { cart, getCartTotal, clearCart } = useCartStore();
    const { user } = useAuthStore();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        shipping_address: '',
        phone: user?.phone || '', // Auto-fill from profile if available
        payment_method: 'Cash on Delivery' // Standard default for Bangladesh
    });

    // SECURITY: Must be logged in and have items in cart
    useEffect(() => {
        if (!user) {
            toast.error("Please log in to proceed to checkout");
            navigate('/login');
        } else if (cart.length === 0) {
            navigate('/products');
        }
    }, [user, cart, navigate]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const placeOrder = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Format the cart data to match what the backend expects
            const orderItems = cart.map(item => ({
                productId: item._id,
                name: item.name,
                price: item.price, // We send price, but backend will verify it securely!
                quantity: item.quantity,
                image: item.image
            }));

            const orderPayload = {
                orderItems,
                shipping_address: formData.shipping_address,
                phone: formData.phone,
                payment_method: formData.payment_method
            };

            const res = await axios.post('/api/orders', orderPayload);

            toast.success(`Order placed successfully! Order ID: ${res.data._id.substring(0, 8)}`);
            clearCart(); // Empty the Zustand cart state
            navigate('/dashboard'); // Send them to dashboard to view their orders

        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to place order");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Prevent rendering if useEffect is about to redirect
    if (!user || cart.length === 0) return null;

    return (
        <section className="mt-60 mb-80 flex-center" style={{ padding: '0 20px' }}>
            <div style={{ maxWidth: '600px', width: '100%', background: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <h2 className="text-center" style={{ marginBottom: '30px' }}>Checkout</h2>

                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
                    <h4 style={{ marginBottom: '10px' }}>Order Summary</h4>
                    <p>Total Items: {cart.reduce((acc, item) => acc + item.quantity, 0)}</p>
                    <p style={{ fontWeight: 'bold', fontSize: '18px', color: 'var(--primary-orange, #f57224)' }}>
                        Total Amount: ৳ {(getCartTotal() + 120).toLocaleString()} <span style={{ fontSize: '12px', color: '#777' }}>(incl. ৳120 Delivery)</span>
                    </p>
                </div>

                <form onSubmit={placeOrder} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Shipping Address</label>
                        <textarea
                            name="shipping_address"
                            value={formData.shipping_address}
                            onChange={handleInputChange}
                            required
                            rows="3"
                            placeholder="House No, Road No, Area, City"
                            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Contact Phone</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Payment Method</label>
                        <select
                            name="payment_method"
                            value={formData.payment_method}
                            onChange={handleInputChange}
                            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                        >
                            <option value="Cash on Delivery">Cash on Delivery</option>
                            <option value="bKash">bKash (Coming Soon)</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{ width: '100%', padding: '15px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px' }}
                    >
                        {isSubmitting ? 'Processing Order...' : 'Confirm Order'}
                    </button>
                </form>
            </div>
        </section>
    );
};

export default Checkout;