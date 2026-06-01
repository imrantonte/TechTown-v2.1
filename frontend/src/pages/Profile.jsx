import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';
import axios from 'axios';

const Profile = () => {
    const navigate = useNavigate();
    const { user, logout, checkAuth } = useAuthStore();

    // Tab State ('overview', 'orders', 'settings')
    const [activeTab, setActiveTab] = useState('overview');

    // Data State
    const [orders, setOrders] = useState([]);
    const [selectedReceipt, setSelectedReceipt] = useState(null); // For the receipt modal
    const [isUpdating, setIsUpdating] = useState(false);

    // Form State for Settings
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || ''
    });

    // SECURITY: Must be logged in
    useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

    // Fetch User's Orders when the component loads
    useEffect(() => {
        const fetchMyOrders = async () => {
            try {
                // Assuming standard REST pattern. We will build this backend route if it doesn't exist yet!
                const res = await axios.get('/api/orders/myorders');
                setOrders(res.data);
            } catch (error) {
                console.error("Could not fetch orders. Backend route may be missing.");
            }
        };
        if (user) fetchMyOrders();
    }, [user]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            await axios.put('/api/users/profile', formData);
            toast.success("Profile updated successfully!");
            checkAuth(); // Refresh global user state
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <section className="mt-60 mb-80" style={{ maxWidth: '1000px', margin: '60px auto', padding: '0 20px' }}>
            <h2 style={{ marginBottom: '30px' }}>My Account</h2>

            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

                {/* LEFT SIDEBAR: Navigation Tabs */}
                <div style={{ flex: '1 1 250px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '20px', background: '#f8f9fa', borderBottom: '1px solid #eee', textAlign: 'center' }}>
                        <div style={{ width: '60px', height: '60px', background: 'var(--primary-orange, #f57224)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', margin: '0 auto 10px auto' }}>
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <h4 style={{ margin: 0 }}>{user.name}</h4>
                        <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#777' }}>{user.email}</p>
                    </div>

                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        <li
                            onClick={() => { setActiveTab('overview'); setSelectedReceipt(null); }}
                            style={{ padding: '15px 20px', cursor: 'pointer', borderBottom: '1px solid #eee', background: activeTab === 'overview' ? '#f1f1f1' : '#fff', fontWeight: activeTab === 'overview' ? 'bold' : 'normal', borderLeft: activeTab === 'overview' ? '4px solid var(--primary-orange, #f57224)' : '4px solid transparent' }}
                        >Overview</li>
                        <li
                            onClick={() => { setActiveTab('orders'); setSelectedReceipt(null); }}
                            style={{ padding: '15px 20px', cursor: 'pointer', borderBottom: '1px solid #eee', background: activeTab === 'orders' ? '#f1f1f1' : '#fff', fontWeight: activeTab === 'orders' ? 'bold' : 'normal', borderLeft: activeTab === 'orders' ? '4px solid var(--primary-orange, #f57224)' : '4px solid transparent' }}
                        >My Orders</li>
                        <li
                            onClick={() => { setActiveTab('settings'); setSelectedReceipt(null); }}
                            style={{ padding: '15px 20px', cursor: 'pointer', borderBottom: '1px solid #eee', background: activeTab === 'settings' ? '#f1f1f1' : '#fff', fontWeight: activeTab === 'settings' ? 'bold' : 'normal', borderLeft: activeTab === 'settings' ? '4px solid var(--primary-orange, #f57224)' : '4px solid transparent' }}
                        >Settings</li>
                        <li
                            onClick={handleLogout}
                            style={{ padding: '15px 20px', cursor: 'pointer', color: '#dc3545' }}
                        >Logout</li>
                    </ul>
                </div>

                {/* RIGHT CONTENT AREA */}
                <div style={{ flex: '1 1 600px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '30px', minHeight: '400px' }}>

                    {/* --- TAB: OVERVIEW --- */}
                    {activeTab === 'overview' && (
                        <div>
                            <h3 style={{ marginBottom: '20px', borderBottom: '2px solid #f4f6f9', paddingBottom: '10px' }}>Dashboard Overview</h3>
                            <p style={{ fontSize: '18px', marginBottom: '20px' }}>Welcome back, <strong>{user.name}</strong>!</p>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', textAlign: 'center', border: '1px solid #eee' }}>
                                    <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>Total Orders</h4>
                                    <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: 'var(--primary-orange, #f57224)' }}>{orders.length}</p>
                                </div>
                                <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', textAlign: 'center', border: '1px solid #eee' }}>
                                    <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>Account Status</h4>
                                    <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#28a745' }}>Active</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: MY ORDERS --- */}
                    {activeTab === 'orders' && (
                        <div>
                            <h3 style={{ marginBottom: '20px', borderBottom: '2px solid #f4f6f9', paddingBottom: '10px' }}>Order History</h3>

                            {/* Receipt View (If a receipt is selected) */}
                            {selectedReceipt ? (
                                <div style={{ animation: 'fadeIn 0.3s' }}>
                                    <button onClick={() => setSelectedReceipt(null)} style={{ background: 'none', border: 'none', color: '#777', cursor: 'pointer', marginBottom: '15px', padding: 0 }}>&larr; Back to Orders</button>
                                    <div style={{ border: '1px solid #eee', padding: '20px', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
                                            <div>
                                                <h4 style={{ margin: '0 0 5px 0' }}>Receipt for Order #{selectedReceipt._id.substring(0, 8).toUpperCase()}</h4>
                                                <p style={{ margin: 0, fontSize: '12px', color: '#777' }}>Placed on: {new Date(selectedReceipt.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{ display: 'inline-block', padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', background: selectedReceipt.status === 'Delivered' ? '#d4edda' : '#fff3cd', color: selectedReceipt.status === 'Delivered' ? '#155724' : '#856404' }}>
                                                    {selectedReceipt.status}
                                                </span>
                                            </div>
                                        </div>

                                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                                    <th style={{ padding: '10px 0' }}>Item</th>
                                                    <th>Qty</th>
                                                    <th style={{ textAlign: 'right' }}>Price</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedReceipt.orderItems.map((item, idx) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                                        <td style={{ padding: '10px 0' }}>{item.name}</td>
                                                        <td>{item.quantity}</td>
                                                        <td style={{ textAlign: 'right' }}>৳ {(item.price * item.quantity).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        <div style={{ textAlign: 'right', fontSize: '18px', fontWeight: 'bold' }}>
                                            Total Paid: ৳ {selectedReceipt.total_amount.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Order List View
                                orders.length === 0 ? (
                                    <p>You have not placed any orders yet.</p>
                                ) : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                                                <th style={{ padding: '15px 10px', color: '#555' }}>Order ID</th>
                                                <th style={{ padding: '15px 10px', color: '#555' }}>Date</th>
                                                <th style={{ padding: '15px 10px', color: '#555' }}>Status</th>
                                                <th style={{ padding: '15px 10px', color: '#555', textAlign: 'center' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map((order) => (
                                                <tr key={order._id} style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{ padding: '15px 10px', fontWeight: 'bold' }}>#{order._id.substring(0, 8).toUpperCase()}</td>
                                                    <td style={{ padding: '15px 10px', color: '#777' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                    <td style={{ padding: '15px 10px' }}>
                                                        <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', background: order.status === 'Delivered' ? '#d4edda' : '#fff3cd', color: order.status === 'Delivered' ? '#155724' : '#856404' }}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '15px 10px', textAlign: 'center' }}>
                                                        <button
                                                            onClick={() => setSelectedReceipt(order)}
                                                            style={{ background: '#343a40', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                                        >View Receipt</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )
                            )}
                        </div>
                    )}

                    {/* --- TAB: SETTINGS --- */}
                    {activeTab === 'settings' && (
                        <div>
                            <h3 style={{ marginBottom: '20px', borderBottom: '2px solid #f4f6f9', paddingBottom: '10px' }}>Account Settings</h3>
                            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Full Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Phone Number</label>
                                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Shipping Address</label>
                                    <textarea name="address" value={formData.address} onChange={handleInputChange} rows="3" placeholder="Enter your default delivery address" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#888' }}>Email Address (Cannot be changed)</label>
                                    <input type="email" value={user.email} disabled style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', background: '#f1f1f1', color: '#888' }} />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    style={{ padding: '12px', background: 'var(--primary-orange, #f57224)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}
                                >
                                    {isUpdating ? 'Saving...' : 'Save Changes'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

            </div>
        </section>
    );
};

export default Profile;