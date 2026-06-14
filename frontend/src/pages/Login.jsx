import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('Email:', email);
    console.log('Password:', password);

    try {
      const { data, isMock } = await apiService.login(email, password);
      console.log('Login response received. isMock:', isMock, 'email:', data.email);
      
      // Store token and user details in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem(
        'user',
        JSON.stringify({
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
        })
      );

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.log('axios error response:', err.response);
      console.error('API Error:', err);

      let errMsg = 'Login failed. Please check your connection and try again.';

      if (err.response) {
        // Extract the exact backend error message
        let rawErr = err.response.data?.message || err.response.data?.error || err.response.data;
        if (rawErr) {
          if (typeof rawErr === 'object') {
            errMsg = JSON.stringify(rawErr);
          } else {
            errMsg = rawErr;
          }
        } else {
          errMsg = `Server Error (${err.response.status}).`;
        }
      } else if (err.message) {
        errMsg = err.message;
      }

      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '80vh',
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: 'white',
        padding: '2.5rem 2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.75rem', fontWeight: 'bold' }}>
            Welcome Back
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
            Sign in to access your EMS dashboard
          </p>
          {import.meta.env.DEV && (
            <p style={{ margin: '0.5rem 0 0 0', color: '#475569', fontSize: '0.85rem' }}>
              Dev credentials: <strong>admin@ems.com / password123</strong> or <strong>persistence.admin@ems.local / Password123!</strong>
            </p>
          )}
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            color: '#991b1b',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
            border: '1px solid #fca5a5',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label htmlFor="email" style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
              disabled={loading}
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                backgroundColor: loading ? '#f8fafc' : 'white',
                color: 'black',
                caretColor: 'black'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
            />
          </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label htmlFor="password" style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              disabled={loading}
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                backgroundColor: loading ? '#f8fafc' : 'white',
                color: 'black',
                caretColor: 'black'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.75rem',
              backgroundColor: loading ? '#93c5fd' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
              transition: 'background-color 0.2s, transform 0.1s',
              marginTop: '0.5rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)'
            }}
            onMouseOver={(e) => {
              if (!loading) e.target.style.backgroundColor = '#1d4ed8';
            }}
            onMouseOut={(e) => {
              if (!loading) e.target.style.backgroundColor = '#2563eb';
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
