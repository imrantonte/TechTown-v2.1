import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaUserCircle, FaChartPie, FaBox, FaCog, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';

const Profile = () => {
    const navigate = useNavigate();

    // Global Stores
    const { user, logout, checkAuth, isLoading } = useAuthStore();
    const clearLocalCart = useCartStore(state => state.clearLocalCart);

    // Local State
    const [activeTab, setActiveTab] = useState('overview');
    const [orders, setOrders] = useState([]);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || '',
        password: ''
    });

    // SECURITY: Kick to login if not authenticated
    useEffect(() => {
        if (!isLoading && !user) navigate('/login');
    }, [user, isLoading, navigate]);

    // Fetch user's orders
    useEffect(() => {
        const fetchMyOrders = async () => {
            try {
                const res = await axios.get('/api/orders/myorders');
                const sortedOrders = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setOrders(sortedOrders);
            } catch (error) {
                console.error("Could not fetch orders.");
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
            setFormData({ ...formData, password: '' });
            checkAuth();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleLogout = async () => {
        clearLocalCart();
        await logout();
        navigate('/logged-out');
    };

    const handleApplySeller = async () => {
        try {
            await axios.post('/api/auth/apply-seller');
            toast.success("Application submitted successfully!");
            checkAuth(); // Refreshes the user data to show "Pending" status
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to apply");
        }
    };

    if (isLoading) return <div style={{ textAlign: 'center', marginTop: '100px', fontSize: '18px', color: '#555' }}>Loading profile...</div>;
    if (!user) return null;

    const totalSpent = orders
        .filter(order => order.status === 'Delivered')
        .reduce((sum, order) => sum + (order.total_amount || 0), 0);

    const lastOrder = orders.length > 0 ? orders[0] : null;

    return (
        <section className="mt-60 mb-80" style={{ maxWidth: '1100px', margin: '60px auto', padding: '0 20px' }}>
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

                {/* LEFT SIDEBAR */}
                <div style={{ flex: '1 1 250px', background: '#fff', borderRadius: '8px', border: '1px solid #eee', overflow: 'hidden' }}>
                    <div style={{ padding: '30px 20px', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                        <FaUserCircle style={{ fontSize: '60px', color: '#ccc', marginBottom: '15px' }} />
                        <h4 style={{ margin: 0, color: '#333', fontSize: '18px' }}>{user.name}</h4>
                        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#777' }}>{user.email}</p>
                    </div>

                    <ul style={{ listStyle: 'none', padding: '0', margin: 0 }}>
                        <li
                            className="sidebar-tab"
                            onClick={() => { setActiveTab('overview'); setSelectedReceipt(null); }}
                            style={{ padding: '15px 25px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', fontWeight: activeTab === 'overview' ? 'bold' : 'normal', background: activeTab === 'overview' ? 'var(--primary-orange, #f57224)' : 'transparent', color: activeTab === 'overview' ? '#fff' : '#555', transition: 'all 0.2s', borderBottom: '1px solid #f9f9f9' }}
                        >
                            <FaChartPie style={{ pointerEvents: 'none' }} /> Overview
                        </li>
                        <li
                            className="sidebar-tab"
                            onClick={() => { setActiveTab('orders'); setSelectedReceipt(null); }}
                            style={{ padding: '15px 25px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', fontWeight: activeTab === 'orders' ? 'bold' : 'normal', background: activeTab === 'orders' ? 'var(--primary-orange, #f57224)' : 'transparent', color: activeTab === 'orders' ? '#fff' : '#555', transition: 'all 0.2s', borderBottom: '1px solid #f9f9f9' }}
                        >
                            <FaBox style={{ pointerEvents: 'none' }} /> My Orders
                        </li>
                        <li
                            className="sidebar-tab"
                            onClick={() => { setActiveTab('settings'); setSelectedReceipt(null); }}
                            style={{ padding: '15px 25px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', fontWeight: activeTab === 'settings' ? 'bold' : 'normal', background: activeTab === 'settings' ? 'var(--primary-orange, #f57224)' : 'transparent', color: activeTab === 'settings' ? '#fff' : '#555', transition: 'all 0.2s', borderBottom: '1px solid #f9f9f9' }}
                        >
                            <FaCog style={{ pointerEvents: 'none' }} /> Settings
                        </li>

                        {(user.role === 'admin' || user.role === 'seller') && (
                            <li
                                className="sidebar-tab"
                                onClick={() => navigate('/dashboard')}
                                style={{ padding: '15px 25px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', color: '#555', transition: 'all 0.2s', borderBottom: '1px solid #f9f9f9' }}
                            >
                                <FaTachometerAlt style={{ pointerEvents: 'none' }} /> {user.role === 'admin' ? 'Admin Dashboard' : 'Seller Dashboard'}
                            </li>
                        )}

                        <li
                            className="sidebar-tab-logout"
                            onClick={handleLogout}
                            style={{ padding: '15px 25px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', color: '#ff4d4f', transition: 'all 0.2s' }}
                        >
                            <FaSignOutAlt style={{ pointerEvents: 'none' }} /> Logout
                        </li>
                    </ul>
                </div>

                {/* RIGHT CONTENT AREA */}
                <div style={{ flex: '1 1 700px', background: '#fff', borderRadius: '8px', border: '1px solid #eee', padding: '40px', minHeight: '500px' }}>

                    {/* --- TAB: OVERVIEW --- */}
                    {activeTab === 'overview' && (
                        <div>
                            <h3 style={{ marginBottom: '25px', color: '#333' }}>Overview</h3>

                            <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                                <div style={{ flex: 1, background: '#fff', padding: '30px 20px', borderRadius: '10px', textAlign: 'center', border: '1px solid #eaeaea', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                                    <p style={{ fontSize: '36px', fontWeight: 'bold', margin: '0 0 10px 0', color: 'var(--primary-orange, #f57224)', whiteSpace: 'nowrap' }}>
                                        {orders.length}
                                    </p>
                                    <p style={{ color: '#777', margin: 0, fontSize: '15px' }}>Total Orders</p>
                                </div>
                                <div style={{ flex: 1, background: '#fff', padding: '30px 20px', borderRadius: '10px', textAlign: 'center', border: '1px solid #eaeaea', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                                    <p style={{ fontSize: '36px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#333', whiteSpace: 'nowrap' }}>
                                        ৳ {totalSpent.toLocaleString()}
                                    </p>
                                    <p style={{ color: '#777', margin: 0, fontSize: '15px' }}>Total Spent</p>
                                </div>
                                <div style={{ flex: 1, background: '#fff', padding: '30px 20px', borderRadius: '10px', textAlign: 'center', border: '1px solid #eaeaea', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                                    <p style={{ fontSize: '36px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#28a745', whiteSpace: 'nowrap' }}>
                                        Active
                                    </p>
                                    <p style={{ color: '#777', margin: 0, fontSize: '15px' }}>Account Status</p>
                                </div>
                            </div>

                            <h4 style={{ marginBottom: '15px', color: '#333' }}>Recent Activity</h4>
                            {lastOrder ? (
                                <p style={{ color: '#555', fontSize: '16px' }}>
                                    Your last order was on <strong>{new Date(lastOrder.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</strong> for <strong>৳ {lastOrder.total_amount?.toLocaleString() || 0}</strong>.
                                </p>
                            ) : (
                                <p style={{ color: '#555', fontSize: '16px' }}>You have no recent activity.</p>
                            )}

                            {/* --- SELLER APPLICATION BANNER --- */}
                            {user.role !== 'admin' && user.role !== 'seller' && (
                                <div style={{ marginTop: '40px', padding: '20px', background: '#f8f9fa', borderRadius: '8px', border: '1px dashed #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>Become a Seller</h4>
                                        <p style={{ margin: 0, color: '#777', fontSize: '14px' }}>
                                            {user.sellerStatus === 'pending'
                                                ? "Your application is currently under review by our admin team."
                                                : "Start selling your own devices on TechTown today!"}
                                        </p>
                                    </div>
                                    {user.sellerStatus !== 'pending' && (
                                        <button
                                            onClick={handleApplySeller}
                                            style={{ padding: '10px 20px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            Apply Now
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- TAB: MY ORDERS --- */}
                    {activeTab === 'orders' && (
                        <div>
                            <h3 style={{ marginBottom: '25px', color: '#333' }}>My Orders</h3>
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
                                                <span style={{ display: 'inline-block', padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', background: selectedReceipt.status === 'Delivered' ? '#d4edda' : '#fff3cd', color: selectedReceipt.status === 'Delivered' ? '#155724' : '#856404' }}>{selectedReceipt.status}</span>
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
                                                {selectedReceipt.items?.map((item, idx) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                                        <td style={{ padding: '10px 0' }}>{item.name}</td>
                                                        <td>{item.quantity}</td>
                                                        <td style={{ textAlign: 'right' }}>৳ {(item.price * item.quantity).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div style={{ textAlign: 'right', fontSize: '18px', fontWeight: 'bold' }}>
                                            Total Paid: ৳ {selectedReceipt.total_amount?.toLocaleString() || 0}
                                        </div>
                                    </div>
                                </div>
                            ) : (
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
                                                        <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', background: order.status === 'Delivered' ? '#d4edda' : '#fff3cd', color: order.status === 'Delivered' ? '#155724' : '#856404' }}>{order.status}</span>
                                                    </td>
                                                    <td style={{ padding: '15px 10px', textAlign: 'center' }}>
                                                        <button onClick={() => setSelectedReceipt(order)} style={{ background: 'none', color: 'var(--primary-orange, #f57224)', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>View</button>
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
                            <h3 style={{ marginBottom: '25px', color: '#333' }}>Account Settings</h3>
                            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>Full Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>Phone Number</label>
                                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} required style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>Shipping Address</label>
                                    <textarea name="address" value={formData.address} onChange={handleInputChange} rows="3" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', resize: 'vertical' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>Email Address</label>
                                    <input type="email" value={user.email} disabled style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', background: '#f9f9f9', color: '#888', cursor: 'not-allowed', fontSize: '14px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>New Password <span style={{ fontWeight: 'normal', color: '#888' }}>(Leave blank to keep current)</span></label>
                                    <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="********" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }} />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    style={{ padding: '15px', background: 'var(--primary-orange, #f57224)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px' }}
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