import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useProductStore } from '../store/productStore';
import { FaTachometerAlt, FaBoxOpen, FaClipboardList, FaUsers, FaPlus, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';

const Dashboard = () => {
    // GLOBAL STATE & NAVIGATION
    const navigate = useNavigate();
    const { user, isLoading } = useAuthStore();
    const { products, fetchProducts } = useProductStore();

    // LOCAL STATE
    const [activeTab, setActiveTab] = useState('overview');

    // Orders & Sellers State
    const [allOrders, setAllOrders] = useState([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [sellerRequests, setSellerRequests] = useState([]);
    const [isLoadingSellers, setIsLoadingSellers] = useState(false);

    // --- PRODUCT FORM STATE ---
    const [showAddForm, setShowAddForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null); // NEW: Tracks if we are editing an existing product
    
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        category: '',
        stock: '',
        condition_type: 'New',
        image: null 
    });

    // SECURITY & DATA FETCHING
    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                navigate('/login');
            } else if (user.role === 'user') {
                navigate('/profile'); 
            } else {
                fetchProducts(); 
                fetchAllOrders(); 
                if (user.role === 'admin') fetchSellerRequests();
            }
        }
    }, [user, isLoading, navigate, fetchProducts]);

    const fetchSellerRequests = async () => {
        setIsLoadingSellers(true);
        try {
            const res = await axios.get('/api/auth/seller-requests');
            setSellerRequests(res.data);
        } catch (error) {
            console.error("Could not fetch seller requests");
        } finally {
            setIsLoadingSellers(false);
        }
    };

    const handleSellerAction = async (userId, status) => {
        try {
            await axios.put(`/api/auth/${userId}/seller-status`, { status });
            toast.success(`Seller application ${status}`);
            fetchSellerRequests(); 
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update status");
        }
    };

    const fetchAllOrders = async () => {
        setIsLoadingOrders(true);
        try {
            const res = await axios.get('/api/orders');
            const sortedOrders = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setAllOrders(sortedOrders);
        } catch (error) {
            console.error("Could not fetch orders");
        } finally {
            setIsLoadingOrders(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
            toast.success(`Order marked as ${newStatus}`);
            fetchAllOrders(); 
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    // --- FORM ACTIONS ---
    const handleImageChange = (e) => {
        setNewProduct({ ...newProduct, image: e.target.files[0] });
    };

    // NEW: Delete a product
    const handleDeleteProduct = async (productId) => {
        if (window.confirm("Are you sure you want to delete this device? This cannot be undone.")) {
            try {
                await axios.delete(`/api/products/${productId}`);
                toast.success("Device deleted successfully");
                fetchProducts(); // Refresh the table
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to delete device");
            }
        }
    };

    // NEW: Open the edit form and populate the data
    const handleEditClick = (product) => {
        setEditingId(product._id);
        setNewProduct({
            name: product.name,
            price: product.price,
            category: product.category,
            stock: product.stock,
            condition_type: product.condition_type || 'New',
            image: null // Leave empty unless they explicitly select a new photo
        });
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to the form
    };

    // UPGRADED: Handles both POST (Create) and PUT (Update)
    const handleSubmitProduct = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('name', newProduct.name);
        formData.append('price', newProduct.price);
        formData.append('category', newProduct.category);
        formData.append('stock', newProduct.stock);
        formData.append('condition_type', newProduct.condition_type);
        if (newProduct.image) {
            formData.append('image', newProduct.image);
        }

        try {
            if (editingId) {
                // UPDATE
                await axios.put(`/api/products/${editingId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Device updated successfully!");
            } else {
                // CREATE
                await axios.post('/api/products', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Device added successfully!");
            }
            
            // Reset form
            setShowAddForm(false);
            setEditingId(null);
            setNewProduct({ name: '', price: '', category: '', stock: '', condition_type: 'New', image: null });
            fetchProducts(); 
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save device");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div style={{ textAlign: 'center', marginTop: '100px', fontSize: '18px', color: '#555' }}>Loading dashboard...</div>;
    if (!user || user.role === 'user') return null;

    const pendingOrdersCount = allOrders.filter(order => order.status === 'Pending').length;

    return (
        <section className="mt-60 mb-80" style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
                <div>
                    <h2 style={{ margin: 0, color: '#333' }}>
                        {user.role === 'admin' ? 'Admin Command Center' : 'Seller Dashboard'}
                    </h2>
                    <p style={{ color: '#777', margin: '5px 0 0 0' }}>Manage your store, orders, and inventory.</p>
                </div>
                <span style={{ background: user.role === 'admin' ? '#dc3545' : '#17a2b8', color: '#fff', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>
                    {user.role}
                </span>
            </div>

            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

                {/* LEFT SIDEBAR NAVIGATION */}
                <div style={{ flex: '1 1 250px', background: '#fff', borderRadius: '8px', border: '1px solid #eee', overflow: 'hidden' }}>
                    <ul style={{ listStyle: 'none', padding: '0', margin: 0 }}>
                        <li
                            className="sidebar-tab"
                            onClick={() => setActiveTab('overview')}
                            style={{ padding: '15px 25px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', fontWeight: activeTab === 'overview' ? 'bold' : 'normal', background: activeTab === 'overview' ? 'var(--primary-orange, #f57224)' : 'transparent', color: activeTab === 'overview' ? '#fff' : '#555', transition: 'all 0.2s', borderBottom: '1px solid #f9f9f9' }}
                        >
                            <FaTachometerAlt style={{ pointerEvents: 'none' }} /> Overview
                        </li>
                        <li
                            className="sidebar-tab"
                            onClick={() => setActiveTab('products')}
                            style={{ padding: '15px 25px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', fontWeight: activeTab === 'products' ? 'bold' : 'normal', background: activeTab === 'products' ? 'var(--primary-orange, #f57224)' : 'transparent', color: activeTab === 'products' ? '#fff' : '#555', transition: 'all 0.2s', borderBottom: '1px solid #f9f9f9' }}
                        >
                            <FaBoxOpen style={{ pointerEvents: 'none' }} /> Manage Products
                        </li>
                        <li
                            className="sidebar-tab"
                            onClick={() => setActiveTab('orders')}
                            style={{ padding: '15px 25px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', fontWeight: activeTab === 'orders' ? 'bold' : 'normal', background: activeTab === 'orders' ? 'var(--primary-orange, #f57224)' : 'transparent', color: activeTab === 'orders' ? '#fff' : '#555', transition: 'all 0.2s', borderBottom: '1px solid #f9f9f9' }}
                        >
                            <FaClipboardList style={{ pointerEvents: 'none' }} /> Manage Orders
                        </li>
                        {user.role === 'admin' && (
                            <li
                                className="sidebar-tab"
                                onClick={() => setActiveTab('sellers')}
                                style={{ padding: '15px 25px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', fontWeight: activeTab === 'sellers' ? 'bold' : 'normal', background: activeTab === 'sellers' ? 'var(--primary-orange, #f57224)' : 'transparent', color: activeTab === 'sellers' ? '#fff' : '#555', transition: 'all 0.2s' }}
                            >
                                <FaUsers style={{ pointerEvents: 'none' }} /> Seller Requests
                            </li>
                        )}
                    </ul>
                </div>

                {/* RIGHT CONTENT AREA */}
                <div style={{ flex: '1 1 750px', background: '#fff', borderRadius: '8px', border: '1px solid #eee', padding: '40px', minHeight: '600px' }}>

                    {/* --- TAB: OVERVIEW --- */}
                    {activeTab === 'overview' && (
                        <div>
                            <h3 style={{ marginBottom: '25px', color: '#333' }}>Store Overview</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                <div style={{ background: '#fcfcfc', padding: '30px', borderRadius: '8px', textAlign: 'center', border: '1px solid #eee' }}>
                                    <p style={{ fontSize: '42px', fontWeight: 'bold', margin: '0 0 10px 0', color: 'var(--primary-orange, #f57224)' }}>{products.length}</p>
                                    <p style={{ color: '#555', margin: 0, fontSize: '16px' }}>Total Devices Listed</p>
                                </div>
                                <div style={{ background: '#fcfcfc', padding: '30px', borderRadius: '8px', textAlign: 'center', border: '1px solid #eee' }}>
                                    <p style={{ fontSize: '42px', fontWeight: 'bold', margin: '0 0 10px 0', color: pendingOrdersCount > 0 ? '#dc3545' : '#17a2b8' }}>{pendingOrdersCount}</p>
                                    <p style={{ color: '#555', margin: 0, fontSize: '16px' }}>Pending Orders</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: PRODUCTS --- */}
                    {activeTab === 'products' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                <h3 style={{ margin: 0, color: '#333' }}>Inventory Management</h3>
                                <button 
                                    onClick={() => {
                                        setShowAddForm(!showAddForm);
                                        if (editingId) {
                                            setEditingId(null);
                                            setNewProduct({ name: '', price: '', category: '', stock: '', condition_type: 'New', image: null });
                                        }
                                    }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', background: showAddForm ? '#555' : 'var(--primary-orange, #f57224)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    {showAddForm ? <><FaTimes /> Cancel</> : <><FaPlus /> Add New Device</>}
                                </button>
                            </div>

                            {/* ADD/EDIT PRODUCT FORM */}
                            {showAddForm && (
                                <div style={{ background: '#f9f9f9', padding: '25px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '30px' }}>
                                    <h4 style={{ marginTop: 0, marginBottom: '20px' }}>
                                        {editingId ? 'Edit Device' : 'Add a New Device'}
                                    </h4>
                                    <form onSubmit={handleSubmitProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <div style={{ display: 'flex', gap: '15px' }}>
                                            <input type="text" placeholder="Device Name" required value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                                            <input type="number" placeholder="Price (৳)" required value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} style={{ width: '150px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                                        </div>
                                        <div style={{ display: 'flex', gap: '15px' }}>
                                            <select required value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                                                <option value="" disabled>Select Category</option>
                                                <option value="Phones">Phones</option>
                                                <option value="Laptops">Laptops</option>
                                                <option value="Accessories">Accessories</option>
                                            </select>
                                            <input type="number" placeholder="Stock Qty" required value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} style={{ width: '150px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                                        </div>
                                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                            <select value={newProduct.condition_type} onChange={(e) => setNewProduct({...newProduct, condition_type: e.target.value})} style={{ width: '150px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                                                <option value="New">New</option>
                                                <option value="Used">Used</option>
                                            </select>
                                            <input type="file" accept="image/*" onChange={handleImageChange} required={!editingId} style={{ flex: 1, padding: '8px', background: '#fff', border: '1px dashed #ccc', borderRadius: '4px', cursor: 'pointer' }} />
                                        </div>
                                        <button disabled={isSubmitting} type="submit" style={{ padding: '12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: isSubmitting ? 'not-allowed' : 'pointer', marginTop: '10px' }}>
                                            {isSubmitting ? 'Processing...' : (editingId ? 'Update Device' : 'Upload & List Device')}
                                        </button>
                                    </form>
                                </div>
                            )}

                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                                        <th style={{ padding: '15px', color: '#555' }}>Device</th>
                                        <th style={{ padding: '15px', color: '#555' }}>Price</th>
                                        <th style={{ padding: '15px', color: '#555' }}>Stock</th>
                                        <th style={{ padding: '15px', color: '#555', textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product._id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <img
                                                    src={product.image?.startsWith('http') || product.image?.startsWith('/assets') ? product.image : `/${product.image}`}
                                                    alt={product.name}
                                                    style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                                                    onError={(e) => e.target.src = '/assets/images/TechTown Logo1.png'}
                                                />
                                                <span style={{ fontWeight: 'bold', color: '#333' }}>{product.name}</span>
                                            </td>
                                            <td style={{ padding: '15px', color: '#555' }}>৳ {product.price.toLocaleString()}</td>
                                            <td style={{ padding: '15px' }}>
                                                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', background: product.stock > 0 ? '#d4edda' : '#f8d7da', color: product.stock > 0 ? '#155724' : '#721c24' }}>
                                                    {product.stock} left
                                                </span>
                                            </td>
                                            <td style={{ padding: '15px', textAlign: 'center' }}>
                                                {/* THESE BUTTONS ARE NOW OFFICIALLY CONNECTED */}
                                                <button 
                                                    onClick={() => handleEditClick(product)}
                                                    style={{ background: '#343a40', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', marginRight: '5px' }}>
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteProduct(product._id)}
                                                    style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* --- TAB: ORDERS --- */}
                    {activeTab === 'orders' && (
                        <div>
                            <h3 style={{ marginBottom: '25px', color: '#333' }}>Order Management</h3>

                            {isLoadingOrders ? (
                                <p>Loading orders...</p>
                            ) : allOrders.length === 0 ? (
                                <p style={{ color: '#777' }}>No orders have been placed yet.</p>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                                    <thead>
                                        <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                                            <th style={{ padding: '15px 10px', color: '#555' }}>Order ID</th>
                                            <th style={{ padding: '15px 10px', color: '#555' }}>Date</th>
                                            <th style={{ padding: '15px 10px', color: '#555' }}>Customer</th>
                                            <th style={{ padding: '15px 10px', color: '#555' }}>Total</th>
                                            <th style={{ padding: '15px 10px', color: '#555' }}>Status</th>
                                            <th style={{ padding: '15px 10px', color: '#555', textAlign: 'center' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allOrders.map((order) => (
                                            <tr key={order._id} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={{ padding: '15px 10px', fontWeight: 'bold' }}>#{order._id.substring(0, 6).toUpperCase()}</td>
                                                <td style={{ padding: '15px 10px', color: '#777' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                <td style={{ padding: '15px 10px', color: '#333' }}>{order.userId?.name || 'Guest'}</td>                                               <td style={{ padding: '15px 10px', fontWeight: 'bold' }}>৳ {order.total_amount?.toLocaleString()}</td>
                                                <td style={{ padding: '15px 10px' }}>
                                                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', background: order.status === 'Delivered' ? '#d4edda' : (order.status === 'Pending' ? '#fff3cd' : '#e2e3e5'), color: order.status === 'Delivered' ? '#155724' : (order.status === 'Pending' ? '#856404' : '#383d41') }}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '15px 10px', textAlign: 'center' }}>
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '12px', cursor: 'pointer' }}
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Processing">Processing</option>
                                                        <option value="Shipped">Shipped</option>
                                                        <option value="Delivered">Delivered</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* --- TAB: SELLERS --- */}
                    {activeTab === 'sellers' && (
                        <div>
                            <h3 style={{ marginBottom: '25px', color: '#333' }}>Seller Approval System</h3>
                            
                            {isLoadingSellers ? (
                                <p>Loading requests...</p>
                            ) : sellerRequests.length === 0 ? (
                                <p style={{ color: '#777' }}>No pending seller requests at this time.</p>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                                    <thead>
                                        <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                                            <th style={{ padding: '15px 10px', color: '#555' }}>Name</th>
                                            <th style={{ padding: '15px 10px', color: '#555' }}>Email</th>
                                            <th style={{ padding: '15px 10px', color: '#555' }}>Status</th>
                                            <th style={{ padding: '15px 10px', color: '#555', textAlign: 'center' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sellerRequests.map((reqUser) => (
                                            <tr key={reqUser._id} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={{ padding: '15px 10px', fontWeight: 'bold' }}>{reqUser.name}</td>
                                                <td style={{ padding: '15px 10px', color: '#777' }}>{reqUser.email}</td>
                                                <td style={{ padding: '15px 10px' }}>
                                                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', background: '#fff3cd', color: '#856404' }}>
                                                        Pending
                                                    </span>
                                                </td>
                                                <td style={{ padding: '15px 10px', textAlign: 'center' }}>
                                                    <button 
                                                        onClick={() => handleSellerAction(reqUser._id, 'approved')}
                                                        style={{ background: '#28a745', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', marginRight: '5px', fontWeight: 'bold' }}>
                                                        Approve
                                                    </button>
                                                    <button 
                                                        onClick={() => handleSellerAction(reqUser._id, 'rejected')}
                                                        style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                                                        Reject
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </section>
    );
};

export default Dashboard;