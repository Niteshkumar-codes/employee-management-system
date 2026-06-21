import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import './Login.css';

// Matching Dark-themed SVG Illustration of a professional working on a laptop
const LoginIllustration = () => (
  <svg
    viewBox="0 0 600 500"
    width="100%"
    height="100%"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ filter: 'drop-shadow(0 20px 40px rgba(99, 102, 241, 0.25))' }}
  >
    {/* Glow backings */}
    <circle cx="300" cy="220" r="160" fill="url(#loginGlow)" opacity="0.3" />
    
    {/* Floating elements representing database, lock, key, code */}
    <rect x="120" y="80" width="360" height="240" rx="16" fill="white" fillOpacity="0.03" stroke="white" strokeOpacity="0.08" strokeWidth="1.5" />
    <path d="M120 130 H480 M200 130 V320" stroke="white" strokeOpacity="0.05" strokeWidth="1.5" />

    {/* Developer avatar working */}
    <ellipse cx="300" cy="390" rx="200" ry="20" fill="black" opacity="0.4" />
    
    {/* Workspace Chair */}
    <path d="M230 280 L210 390 H230 L240 280 Z" fill="#0f172a" />
    <rect x="190" y="210" width="70" height="85" rx="12" fill="#1e293b" />
    <rect x="205" y="225" width="40" height="55" rx="6" fill="#334155" />

    {/* Torso & Jacket */}
    <path d="M240 290 C240 270 260 260 290 260 C320 260 340 270 340 290 L330 360 H250 Z" fill="#7c3aed" />
    <path d="M280 260 V310 L260 360 H300 L290 310 Z" fill="#6d28d9" />
    <path d="M285 280 L290 290 L295 280 Z" fill="#06b6d4" />

    {/* Head / Neck */}
    <rect x="278" y="215" width="24" height="20" rx="4" fill="#fed7aa" />
    <path d="M270 170 C270 140 310 140 310 170 C310 180 310 215 290 215 C270 215 270 190 270 170 Z" fill="#fed7aa" />
    {/* Hair */}
    <path d="M270 170 C270 160 280 150 295 150 C310 150 316 160 310 170 C305 162 295 162 290 165 C285 168 278 168 270 170 Z" fill="#1e293b" />

    {/* Desk */}
    <rect x="210" y="340" width="300" height="10" rx="5" fill="#334155" />
    
    {/* Laptop screen with glowing terminal */}
    <path d="M320 340 L330 300 H395 L405 340 Z" fill="#475569" />
    <rect x="337" y="305" width="56" height="28" rx="2" fill="#090d16" stroke="#4f46e5" strokeWidth="1" />
    {/* Glowing text inside laptop terminal */}
    <rect x="343" y="311" width="20" height="3" rx="1" fill="#10b981" />
    <rect x="343" y="318" width="35" height="3" rx="1" fill="#38bdf8" />
    <rect x="343" y="325" width="25" height="3" rx="1" fill="#818cf8" />
    
    <path d="M310 340 H420 L423 345 H307 Z" fill="#64748b" />
    <line x1="335" y1="342" x2="395" y2="342" stroke="#334155" strokeWidth="2" />

    {/* Typing Hands */}
    <path d="M255 310 C270 310 290 328 315 332 L310 338 C290 334 270 318 250 318 Z" fill="#7c3aed" />
    <path d="M315 332 L322 334 L320 338 L312 336 Z" fill="#fed7aa" />
    
    <path d="M325 318 C340 318 350 328 365 332 L360 338 C345 334 335 324 320 324 Z" fill="#7c3aed" />
    <path d="M365 332 L372 334 L370 338 L362 336 Z" fill="#fed7aa" />

    {/* Floating Security Shield / Lock */}
    <g transform="translate(420, 110)">
      <circle cx="20" cy="20" r="20" fill="#06b6d4" fillOpacity="0.15" />
      <path d="M20 10 L28 13 V20 C28 25.5 24.5 29 20 30 C15.5 29 12 25.5 12 20 V13 L20 10 Z" fill="#06b6d4" />
      <path d="M18 17 V21 H22 V17 H18 Z M19 17 H21" stroke="#0f172a" strokeWidth="1.5" />
    </g>

    <g transform="translate(140, 200)">
      <circle cx="20" cy="20" r="20" fill="#4f46e5" fillOpacity="0.15" />
      <path d="M15 25 V18 H25 V25 H15 Z M17 18 V15 C17 13.3 18.3 12 20 12 C21.7 12 23 13.3 23 15 V18" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" />
    </g>

    <defs>
      <radialGradient id="loginGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#818cf8" />
        <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
);

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
    <div className="login-container">
      {/* Left Screen: Login Credentials Form */}
      <div className="login-form-side">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <span>EMS</span>
            </div>
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-subtitle">Sign in to manage your workspace console</p>
            
            {import.meta.env.DEV && (
              <div className="dev-credentials">
                💡 <strong>Credentials:</strong><br />
                Admin: admin@ems.com / password123<br />
                Persistence: persistence.admin@ems.local / Password123!
              </div>
            )}
          </div>

          {error && (
            <div className="login-alert">
              <span>⚠️</span>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                id="email"
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@company.com"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-mini"></span>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center' }}>
            <Link to="/" className="back-to-home">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Right Screen: Core Visual Illustration Graphic */}
      <div className="login-visual-side">
        <div className="visual-content">
          <LoginIllustration />
          <h2 className="visual-title">Enterprise Control Panel</h2>
          <p className="visual-text">
            Monitor real-time workflow stats, approve leaves, manage team member logs, and review directory insights instantly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
