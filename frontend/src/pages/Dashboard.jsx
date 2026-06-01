import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useProductStore } from '../store/productStore';
import { toast } from 'react-toastify';
import axios from 'axios';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, isLoading: isAuthLoading } = useAuthStore();
    const fetchProducts = useProductStore(state => state.fetchProducts);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageFile, setImageFile] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        category: 'Smartphones',
        price: '',
        stock: '',
        condition_type: 'New'
    });

    // SECURITY: Redirect users who are not logged in
    useEffect(() => {
        if (!isAuthLoading) {
            if (!user) {
                toast.error("You must be logged in to access the dashboard");
                navigate('/login');
            } else if (user.role !== 'admin' && user.role !== 'seller') {
                // If they are just a standard customer, kick them out
                toast.error("Access denied. Seller Dashboard is restricted.");
                navigate('/');
            }
        }
    }, [user, isAuthLoading, navigate]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!imageFile) {
            return toast.error("Please select an image for the product");
        }

        setIsSubmitting(true);

        // We MUST use FormData when uploading files, standard JSON will not work
        const uploadData = new FormData();
        uploadData.append('name', formData.name);
        uploadData.append('category', formData.category);
        uploadData.append('price', formData.price);
        uploadData.append('stock', formData.stock);
        uploadData.append('condition_type', formData.condition_type);
        uploadData.append('image', imageFile); // 'image' matches the name in our Multer backend

        try {
            await axios.post('/api/products', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success("Product successfully added to the store!");

            // Reset the form
            setFormData({ name: '', category: 'Smartphones', price: '', stock: '', condition_type: 'New' });
            setImageFile(null);
            document.getElementById('imageInput').value = ''; // Clear file input UI

            // Tell Zustand to refresh the global product list so it appears on the home page instantly
            fetchProducts();

        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to upload product");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Show nothing while checking authentication or if they don't have access to prevent UI flashing
    if (isAuthLoading || !user || (user.role !== 'admin' && user.role !== 'seller')) return null;

    return (
        <section className="admin-body"></section>
    );

    // Show nothing while checking authentication to prevent UI flashing
    if (isAuthLoading || !user) return null;

    return (
        <section className="admin-body">
            <div className="admin-container">
                <div className="admin-header">
                    <h2>Seller Dashboard</h2>
                    <div className="stat-badge">
                        Logged in as: <strong>{user.name}</strong> ({user.role})
                    </div>
                </div>

                <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginBottom: '20px', borderBottom: '2px solid #f4f6f9', paddingBottom: '10px' }}>
                        Add New Product
                    </h3>

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                        {/* Name */}
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Product Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} placeholder="e.g., iPhone 15 Pro Max" />
                        </div>

                        {/* Category */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Category</label>
                            <select name="category" value={formData.category} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                                <option value="Smartphones">Smartphones</option>
                                <option value="Laptops">Laptops</option>
                                <option value="Gadgets">Gadgets</option>
                                <option value="Accessories">Accessories</option>
                            </select>
                        </div>

                        {/* Condition */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Condition</label>
                            <select name="condition_type" value={formData.condition_type} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                                <option value="New">New</option>
                                <option value="Used">Used</option>
                                <option value="Refurbished">Refurbished</option>
                            </select>
                        </div>

                        {/* Price */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Price (৳)</label>
                            <input type="number" name="price" value={formData.price} onChange={handleInputChange} required min="0" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                        </div>

                        {/* Stock */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Stock Quantity</label>
                            <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required min="1" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                        </div>

                        {/* Image Upload */}
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Product Image</label>
                            <input type="file" id="imageInput" accept="image/jpeg, image/png, image/webp" onChange={handleImageChange} required style={{ width: '100%', padding: '10px', border: '1px dashed #ccc', borderRadius: '4px', background: '#fafafa' }} />
                            <small style={{ color: '#777', marginTop: '5px', display: 'block' }}>Only JPG, PNG, and WEBP formats allowed (Max 5MB). Image will be securely hosted on Cloudinary.</small>
                        </div>

                        {/* Submit Button */}
                        <div style={{ gridColumn: 'span 2' }}>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{ width: '100%', padding: '15px', background: 'var(--primary-orange, #f57224)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
                            >
                                {isSubmitting ? 'Uploading to Cloudinary...' : 'Add Product'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </section>
    );
};

export default Dashboard;