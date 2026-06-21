import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useProductStore } from '../store/productStore';
import { FaTachometerAlt, FaBoxOpen, FaClipboardList, FaUsers, FaPlus, FaTimes, FaImage } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, isLoading } = useAuthStore();
    const { products, fetchProducts } = useProductStore();

    const [activeTab, setActiveTab] = useState('overview');
    const [allOrders, setAllOrders] = useState([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [sellerRequests, setSellerRequests] = useState([]);
    const [isLoadingSellers, setIsLoadingSellers] = useState(false);

    // --- UPGRADED PRODUCT FORM STATE ---
    const [showAddForm, setShowAddForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [imagePreview, setImagePreview] = useState(null); // <-- NEW: Live image preview

    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        category: '',
        stock: '',
        condition_type: 'New',
        description: '', // <-- NEW: Description field
        image: null
    });

    useEffect(() => {
        if (!isLoading) {
            if (!user) navigate('/login');
            else if (user.role === 'user') navigate('/profile');
            else {
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

    // --- UPGRADED IMAGE HANDLING ---
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewProduct({ ...newProduct, image: file });
            setImagePreview(URL.createObjectURL(file)); // Creates a local temporary URL to preview the file instantly
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm("Are you sure you want to delete this device? This cannot be undone.")) {
            try {
                await axios.delete(`/api/products/${productId}`);
                toast.success("Device deleted successfully");
                fetchProducts();
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to delete device");
            }
        }
    };

    const handleEditClick = (product) => {
        setEditingId(product._id);
        setNewProduct({
            name: product.name,
            price: product.price,
            category: product.category || '',
            stock: product.stock,
            condition_type: product.condition_type || 'New',
            description: product.description || '',
            image: null // Require a new upload if they want to change the picture
        });

        // Show the existing image from the database in the preview box
        if (product.image) {
            setImagePreview(product.image.startsWith('http') || product.image.startsWith('/assets') ? product.image : `/${product.image}`);
        }

        setShowAddForm(true);
    };

    const closeAndResetForm = () => {
        setShowAddForm(false);
        setEditingId(null);
        setImagePreview(null);
        setNewProduct({ name: '', price: '', category: '', stock: '', condition_type: 'New', description: '', image: null });
    };

    const handleSubmitProduct = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('name', newProduct.name);
        formData.append('price', newProduct.price);
        formData.append('category', newProduct.category);
        formData.append('stock', newProduct.stock);
        formData.append('condition_type', newProduct.condition_type);
        formData.append('description', newProduct.description); // <-- NOW SAVING DESCRIPTION

        if (newProduct.image) {
            formData.append('image', newProduct.image);
        }

        try {
            if (editingId) {
                await axios.put(`/api/products/${editingId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Device updated successfully!");
            } else {
                await axios.post('/api/products', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Device added successfully!");
            }

            closeAndResetForm();
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

    // --- LOW STOCK ALERT LOGIC ---
    const LOW_STOCK_THRESHOLD = 5;
    const lowStockItems = products.filter(product => product.stock <= LOW_STOCK_THRESHOLD);
    const lowStockCount = lowStockItems.length;

    // Automated Notification Alert
    useEffect(() => {
        if (lowStockCount > 0 && !isLoading) {
            toast.warn(`Alert: ${lowStockCount} items have dropped below 5 units!`, { toastId: 'low-stock' });
        }
    }, [lowStockCount, isLoading]);

    return (
        <section className="mt-60 mb-80" style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px', position: 'relative' }}>

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
                        <li onClick={() => setActiveTab('overview')} style={{ padding: '15px 25px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', fontWeight: activeTab === 'overview' ? 'bold' : 'normal', background: activeTab === 'overview' ? 'var(--primary-orange, #f57224)' : 'transparent', color: activeTab === 'overview' ? '#fff' : '#555', transition: 'all 0.2s', borderBottom: '1px solid #f9f9f9' }}>
                            <FaTachometerAlt /> Overview
                        </li>
                        <li onClick={() => setActiveTab('products')} style={{ padding: '15px 25px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', fontWeight: activeTab === 'products' ? 'bold' : 'normal', background: activeTab === 'products' ? 'var(--primary-orange, #f57224)' : 'transparent', color: activeTab === 'products' ? '#fff' : '#555', transition: 'all 0.2s', borderBottom: '1px solid #f9f9f9' }}>
                            <FaBoxOpen /> Manage Products
                        </li>
                        <li onClick={() => setActiveTab('orders')} style={{ padding: '15px 25px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', fontWeight: activeTab === 'orders' ? 'bold' : 'normal', background: activeTab === 'orders' ? 'var(--primary-orange, #f57224)' : 'transparent', color: activeTab === 'orders' ? '#fff' : '#555', transition: 'all 0.2s', borderBottom: '1px solid #f9f9f9' }}>
                            <FaClipboardList /> Manage Orders
                        </li>
                        {user.role === 'admin' && (
                            <li onClick={() => setActiveTab('sellers')} style={{ padding: '15px 25px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', fontWeight: activeTab === 'sellers' ? 'bold' : 'normal', background: activeTab === 'sellers' ? 'var(--primary-orange, #f57224)' : 'transparent', color: activeTab === 'sellers' ? '#fff' : '#555', transition: 'all 0.2s' }}>
                                <FaUsers /> Seller Requests
                            </li>
                        )}
                    </ul>
                </div>

                {/* RIGHT CONTENT AREA */}
                <div style={{ flex: '1 1 750px', background: '#fff', borderRadius: '8px', border: '1px solid #eee', padding: '40px', minHeight: '600px' }}>
                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div>
                            <h3 style={{ marginBottom: '25px', color: '#333' }}>Store Overview</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                <div style={{ background: '#fcfcfc', padding: '30px', borderRadius: '8px', textAlign: 'center', border: '1px solid #eee' }}>
                                    <p style={{ fontSize: '42px', fontWeight: 'bold', margin: '0 0 10px 0', color: 'var(--primary-orange, #f57224)' }}>{products.length}</p>
                                    <p style={{ color: '#555', margin: 0, fontSize: '16px' }}>Total Devices</p>
                                </div>
                                <div style={{ background: '#fcfcfc', padding: '30px', borderRadius: '8px', textAlign: 'center', border: '1px solid #eee' }}>
                                    <p style={{ fontSize: '42px', fontWeight: 'bold', margin: '0 0 10px 0', color: pendingOrdersCount > 0 ? '#dc3545' : '#17a2b8' }}>{pendingOrdersCount}</p>
                                    <p style={{ color: '#555', margin: 0, fontSize: '16px' }}>Pending Orders</p>
                                </div>
                                {/* NEW: Low Stock Metric Card */}
                                <div style={{ background: lowStockCount > 0 ? '#fff3cd' : '#fcfcfc', padding: '30px', borderRadius: '8px', textAlign: 'center', border: lowStockCount > 0 ? '1px solid #ffeeba' : '1px solid #eee' }}>
                                    <p style={{ fontSize: '42px', fontWeight: 'bold', margin: '0 0 10px 0', color: lowStockCount > 0 ? '#856404' : '#28a745' }}>{lowStockCount}</p>
                                    <p style={{ color: lowStockCount > 0 ? '#856404' : '#555', margin: 0, fontSize: '16px' }}>Low Stock Alerts (&lt; 5)</p>
                                </div>
                            </div>

                            {/* NEW: Actionable Low Stock List */}
                            {lowStockCount > 0 && (
                                <div style={{ marginTop: '30px', padding: '20px', background: '#fffaf0', borderLeft: '4px solid #f5a623', borderRadius: '4px' }}>
                                    <h4 style={{ margin: '0 0 15px 0', color: '#d97706' }}>⚠️ Action Required: Restock Inventory</h4>
                                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#92400e' }}>
                                        {lowStockItems.map(item => (
                                            <li key={item._id} style={{ marginBottom: '8px' }}>
                                                <strong>{item.name}</strong> — <span style={{ fontWeight: 'bold', color: item.stock === 0 ? '#dc3545' : 'inherit' }}>{item.stock === 0 ? 'OUT OF STOCK' : `Only ${item.stock} left`}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* PRODUCTS TAB */}
                    {activeTab === 'products' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                <h3 style={{ margin: 0, color: '#333' }}>Inventory Management</h3>
                                <button onClick={() => setShowAddForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary-orange, #f57224)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    <FaPlus /> Add New Device
                                </button>
                            </div>

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
                                                <img src={product.image?.startsWith('http') || product.image?.startsWith('/assets') ? product.image : `/${product.image}`} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} onError={(e) => e.target.src = '/assets/images/TechTown Logo1.png'} />
                                                <span style={{ fontWeight: 'bold', color: '#333' }}>{product.name}</span>
                                            </td>
                                            <td style={{ padding: '15px', color: '#555' }}>৳ {product.price.toLocaleString()}</td>
                                            <td style={{ padding: '15px' }}>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    background: Number(product.stock) === 0 ? '#f8d7da' : Number(product.stock) <= 5 ? '#fff3cd' : '#d4edda',
                                                    color: Number(product.stock) === 0 ? '#721c24' : Number(product.stock) <= 5 ? '#856404' : '#155724'
                                                }}>
                                                    {Number(product.stock) === 0 ? 'Out of Stock' : Number(product.stock) <= 5 ? `Low Stock (${product.stock})` : `${product.stock} left`}
                                                </span>
                                            </td>
                                            <td style={{ padding: '15px', textAlign: 'center' }}>
                                                <button onClick={() => handleEditClick(product)} style={{ background: '#343a40', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', marginRight: '5px' }}>Edit</button>
                                                <button onClick={() => handleDeleteProduct(product._id)} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ORDERS TAB */}
                    {activeTab === 'orders' && (
                        <div>
                            <h3 style={{ marginBottom: '25px', color: '#333' }}>Order Management</h3>
                            {isLoadingOrders ? <p>Loading orders...</p> : allOrders.length === 0 ? <p style={{ color: '#777' }}>No orders have been placed yet.</p> : (
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
                                                <td style={{ padding: '15px 10px' }}><span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', background: order.status === 'Delivered' ? '#d4edda' : (order.status === 'Pending' ? '#fff3cd' : '#e2e3e5'), color: order.status === 'Delivered' ? '#155724' : (order.status === 'Pending' ? '#856404' : '#383d41') }}>{order.status}</span></td>
                                                <td style={{ padding: '15px 10px', textAlign: 'center' }}>
                                                    <select value={order.status} onChange={(e) => handleStatusChange(order._id, e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '12px', cursor: 'pointer' }}>
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

                    {/* SELLERS TAB */}
                    {activeTab === 'sellers' && (
                        <div>
                            <h3 style={{ marginBottom: '25px', color: '#333' }}>Seller Approval System</h3>
                            {isLoadingSellers ? <p>Loading requests...</p> : sellerRequests.length === 0 ? <p style={{ color: '#777' }}>No pending seller requests at this time.</p> : (
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
                                                <td style={{ padding: '15px 10px' }}><span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', background: '#fff3cd', color: '#856404' }}>Pending</span></td>
                                                <td style={{ padding: '15px 10px', textAlign: 'center' }}>
                                                    <button onClick={() => handleSellerAction(reqUser._id, 'approved')} style={{ background: '#28a745', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', marginRight: '5px', fontWeight: 'bold' }}>Approve</button>
                                                    <button onClick={() => handleSellerAction(reqUser._id, 'rejected')} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Reject</button>
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

            {/* --- UPGRADED MODAL OVERLAY WITH PREVIEW & DESCRIPTION --- */}
            {showAddForm && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(3px)' }}>
                    <div style={{ background: '#fff', padding: '30px 40px', borderRadius: '12px', width: '700px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '25px' }}>
                            <h3 style={{ margin: 0, color: '#333', fontSize: '20px' }}>
                                {editingId ? 'Edit Product Details' : 'Add New Product'}
                            </h3>
                            <button onClick={closeAndResetForm} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#aaa', cursor: 'pointer' }}>
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitProduct} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                            {/* Row 1: Name & Price */}
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <div style={{ flex: 2 }}>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '6px', fontWeight: 'bold' }}>Device Name</label>
                                    <input type="text" placeholder="e.g. iPhone 15 Pro Max" required value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '6px', fontWeight: 'bold' }}>Price (৳)</label>
                                    <input type="number" placeholder="0.00" required value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }} />
                                </div>
                            </div>

                            {/* Row 2: Category & Stock */}
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <div style={{ flex: 2 }}>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '6px', fontWeight: 'bold' }}>Category</label>
                                    <select required value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', background: '#fff' }}>
                                        <option value="" disabled>Select Category</option>
                                        <option value="Smartphones">Smartphones</option>
                                        <option value="Laptops">Laptops</option>
                                        <option value="Cameras">Cameras</option>
                                        <option value="Smart Watches">Smart Watches</option>
                                        <option value="Accessories">Accessories</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '6px', fontWeight: 'bold' }}>Stock Quantity</label>
                                    <input type="number" placeholder="0" required value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }} />
                                </div>
                            </div>

                            {/* Row 3: Condition/Description & Image Upload/Preview */}
                            <div style={{ display: 'flex', gap: '20px' }}>

                                {/* Left Side: Condition & Description */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '6px', fontWeight: 'bold' }}>Condition</label>
                                    <select value={newProduct.condition_type} onChange={(e) => setNewProduct({ ...newProduct, condition_type: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', background: '#fff', marginBottom: '15px' }}>
                                        <option value="New">New</option>
                                        <option value="Used - Like New">Used - Like New</option>
                                        <option value="Used - Good">Used - Good</option>
                                    </select>

                                    <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '6px', fontWeight: 'bold' }}>Product Description</label>
                                    <textarea
                                        required
                                        rows="6"
                                        placeholder="Detailed description of the device..."
                                        value={newProduct.description}
                                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', resize: 'vertical', flex: 1 }}
                                    />
                                </div>

                                {/* Right Side: Image Upload & Preview */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '6px', fontWeight: 'bold' }}>
                                        {editingId ? 'Update Image (Optional)' : 'Device Image'}
                                    </label>

                                    {/* The Image Preview Box */}
                                    <div style={{ flex: 1, border: '1px dashed #ccc', borderRadius: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8f9fa', marginBottom: '10px', overflow: 'hidden', minHeight: '180px' }}>
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        ) : (
                                            <div style={{ textAlign: 'center', color: '#aaa' }}>
                                                <FaImage style={{ fontSize: '40px', marginBottom: '10px' }} />
                                                <p style={{ margin: 0, fontSize: '13px' }}>No image selected</p>
                                            </div>
                                        )}
                                    </div>

                                    <input type="file" accept="image/*" onChange={handleImageChange} required={!editingId} style={{ width: '100%', padding: '9px 12px', background: '#fff', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }} />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '10px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                                <button type="button" onClick={closeAndResetForm} style={{ padding: '12px 24px', background: '#f1f1f1', color: '#333', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                                <button disabled={isSubmitting} type="submit" style={{ padding: '12px 24px', background: 'var(--primary-orange, #f57224)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
                                    {isSubmitting ? 'Saving to Cloudinary...' : (editingId ? 'Save Changes' : 'Publish Product')}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Dashboard;