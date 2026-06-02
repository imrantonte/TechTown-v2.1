import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';
import axios from 'axios';

const Login = () => {
    const navigate = useNavigate();
    // FIX: Bring in setUser instead of the non-existent login function
    const setUser = useAuthStore(state => state.setUser);

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // FIX: Make the API call directly here
            const res = await axios.post('/api/auth/login', formData);
            
            // Save the user to global state
            setUser(res.data);
            
            toast.success("Welcome back!");
            navigate('/profile'); // Redirects to your new awesome profile page
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid credentials");
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', backgroundColor: '#f4f6f9', padding: '20px' }}>
            <div style={{ background: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                
                <h2 style={{ color: '#333', marginBottom: '10px', fontSize: '28px' }}>Welcome Back</h2>
                <p style={{ color: '#777', marginBottom: '30px', fontSize: '15px' }}>Login to continue</p>

                <form onSubmit={handleSubmit}>
                    <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555', fontSize: '14px' }}>Email Address</label>
                        <input 
                            type="email" 
                            name="email" 
                            placeholder="name@example.com" 
                            className="auth-input"
                            value={formData.email} 
                            onChange={handleChange} 
                            required 
                            style={{ width: '100%', padding: '14px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }} 
                        />
                    </div>

                    <div style={{ textAlign: 'left', marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555', fontSize: '14px' }}>Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            placeholder="********" 
                            className="auth-input"
                            value={formData.password} 
                            onChange={handleChange} 
                            required 
                            style={{ width: '100%', padding: '14px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }} 
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="auth-btn"
                        style={{ width: '100%', padding: '15px', background: 'var(--primary-orange, #f57224)', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        Login
                    </button>
                </form>

                <p style={{ marginTop: '25px', color: '#777', fontSize: '14px' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--primary-orange, #f57224)', textDecoration: 'none', fontWeight: 'bold' }}>Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;