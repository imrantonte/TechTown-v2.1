import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // FIX: Make the API call directly here
            await axios.post('/api/auth/register', formData);
            
            toast.success("Registration successful! Please log in.");
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', backgroundColor: '#f4f6f9', padding: '40px 20px' }}>
            <div style={{ background: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                
                <h2 style={{ color: '#333', marginBottom: '10px', fontSize: '28px' }}>Create an Account</h2>
                <p style={{ color: '#777', marginBottom: '30px', fontSize: '15px' }}>Join TechTown today</p>

                <form onSubmit={handleSubmit}>
                    <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555', fontSize: '14px' }}>Full Name</label>
                        <input 
                            type="text" 
                            name="name" 
                            placeholder="Ex: Sheikh Abdul Ahad" 
                            className="auth-input"
                            value={formData.name} 
                            onChange={handleChange} 
                            required 
                            style={{ width: '100%', padding: '14px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }} 
                        />
                    </div>

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

                    <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555', fontSize: '14px' }}>Phone Number</label>
                        <input 
                            type="text" 
                            name="phone" 
                            placeholder="019xxxxxxxx" 
                            className="auth-input"
                            value={formData.phone} 
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
                        Sign Up
                    </button>
                </form>

                <p style={{ marginTop: '25px', color: '#777', fontSize: '14px' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary-orange, #f57224)', textDecoration: 'none', fontWeight: 'bold' }}>Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;