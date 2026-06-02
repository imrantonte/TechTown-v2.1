import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const LoggedOut = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Automatically redirect to login after 3 seconds
        const timer = setTimeout(() => {
            navigate('/login');
        }, 3000);

        return () => clearTimeout(timer); // Cleanup timer if component unmounts
    }, [navigate]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', background: '#f4f6f9' }}>
            <h2 style={{ fontSize: '28px', color: '#333', marginBottom: '10px' }}>You have been logged out.</h2>
            <p style={{ color: '#555', fontSize: '16px', marginBottom: '5px' }}>Redirecting you to login...</p>
            <p style={{ color: '#555', fontSize: '16px' }}>
                <Link to="/login" style={{ color: 'var(--primary-orange, #f57224)', textDecoration: 'none' }}>Click here</Link> if you are not redirected automatically.
            </p>
        </div>
    );
};

export default LoggedOut;