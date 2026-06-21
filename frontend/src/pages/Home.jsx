import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

// Premium SVG Illustration of a professional working on a laptop
const HeroIllustration = () => (
  <svg
    viewBox="0 0 600 500"
    width="100%"
    height="100%"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ filter: 'drop-shadow(0 20px 40px rgba(79, 70, 229, 0.15))' }}
  >
    {/* Background Glows */}
    <circle cx="300" cy="250" r="180" fill="url(#glowGradient)" opacity="0.15" />
    
    {/* Abstract UI and Dashboard Behind */}
    <rect x="80" y="80" width="440" height="280" rx="20" fill="white" fillOpacity="0.04" stroke="white" strokeOpacity="0.08" strokeWidth="2" />
    <circle cx="110" cy="110" r="6" fill="#EF4444" opacity="0.6" />
    <circle cx="126" cy="110" r="6" fill="#F59E0B" opacity="0.6" />
    <circle cx="142" cy="110" r="6" fill="#10B981" opacity="0.6" />
    
    {/* Grid overlay */}
    <path d="M80 140 H520 M180 140 V360 M80 250 H520" stroke="white" strokeOpacity="0.04" strokeWidth="1.5" />
    
    {/* Abstract Charts */}
    <path d="M220 300 L280 230 L340 260 L420 180" stroke="url(#accentGradient)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    <circle cx="420" cy="180" r="6" fill="#06B6D4" />
    <circle cx="280" cy="230" r="4" fill="#7C3AED" />

    {/* Desk / Office elements */}
    <ellipse cx="300" cy="420" rx="250" ry="24" fill="url(#deskGradient)" opacity="0.1" />

    {/* Workspace Chair */}
    <path d="M220 280 L200 420 H220 L230 280 Z" fill="#1E293B" opacity="0.9" />
    <rect x="180" y="220" width="70" height="80" rx="12" fill="#334155" />
    <rect x="195" y="235" width="40" height="50" rx="6" fill="#475569" />

    {/* Developer / Professional Figure */}
    {/* Pants / Legs */}
    <path d="M250 360 L260 410 H290 L275 360 Z" fill="#1E293B" />
    <path d="M285 360 L300 410 H330 L310 360 Z" fill="#1E293B" />
    {/* Shoes */}
    <path d="M260 410 C260 410 250 415 250 418 H295 L290 410 Z" fill="#0F172A" />
    <path d="M300 410 C300 410 290 415 290 418 H335 L330 410 Z" fill="#0F172A" />
    {/* Torso / Jacket */}
    <path d="M230 300 C230 280 250 270 280 270 C310 270 330 280 330 300 L320 370 H240 L230 300 Z" fill="#4F46E5" />
    <path d="M270 270 V320 L250 370 H290 L280 320 Z" fill="#4338CA" /> {/* Vest / Tie highlight */}
    <path d="M275 290 L280 300 L285 290 Z" fill="#06B6D4" /> {/* Smart Badge */}
    
    {/* Head / Neck */}
    <rect x="268" y="220" width="24" height="20" rx="4" fill="#FDBA74" />
    <path d="M260 180 C260 150 300 150 300 180 C300 190 300 225 280 225 C260 225 260 190 260 180 Z" fill="#FDBA74" />
    {/* Hair */}
    <path d="M260 180 C260 170 270 160 285 160 C300 160 306 170 300 180 C295 172 285 172 280 175 C275 178 268 178 260 180 Z" fill="#1E293B" />
    {/* Glasses */}
    <rect x="270" y="185" width="12" height="8" rx="2" fill="none" stroke="#0F172A" strokeWidth="1.5" />
    <rect x="284" y="185" width="12" height="8" rx="2" fill="none" stroke="#0F172A" strokeWidth="1.5" />
    <line x1="282" y1="189" x2="284" y2="189" stroke="#0F172A" strokeWidth="1.5" />

    {/* Desk */}
    <rect x="200" y="350" width="320" height="12" rx="6" fill="#E2E8F0" />
    <rect x="220" y="362" width="15" height="60" fill="#cbd5e1" />
    <rect x="480" y="362" width="15" height="60" fill="#cbd5e1" />

    {/* Laptop on Desk */}
    <path d="M310 350 L320 315 H385 L395 350 Z" fill="#94A3B8" /> {/* Laptop Screen */}
    <rect x="327" y="320" width="56" height="26" rx="2" fill="#0F172A" /> {/* Laptop Display */}
    {/* Small UI lights on laptop display */}
    <rect x="332" y="325" width="15" height="4" rx="1" fill="#7C3AED" />
    <rect x="350" y="325" width="20" height="4" rx="1" fill="#06B6D4" />
    <circle cx="335" cy="336" r="3" fill="#10B981" />
    <circle cx="345" cy="336" r="3" fill="#64748B" />
    <circle cx="355" cy="336" r="3" fill="#64748B" />
    
    <path d="M300 350 H410 L415 355 H295 Z" fill="#cbd5e1" /> {/* Laptop Base */}
    <line x1="330" y1="352" x2="380" y2="352" stroke="#475569" strokeWidth="2" /> {/* Keyboard trace */}

    {/* Hands / Arms typing */}
    <path d="M245 320 C260 320 280 338 305 342 L300 348 C280 344 260 328 240 328 Z" fill="#4F46E5" />
    <path d="M305 342 L312 344 L310 348 L302 346 Z" fill="#FDBA74" /> {/* Left Hand */}
    
    <path d="M315 328 C330 328 340 338 355 342 L350 348 C335 344 325 334 310 334 Z" fill="#4F46E5" />
    <path d="M355 342 L362 344 L360 348 L352 346 Z" fill="#FDBA74" /> {/* Right Hand */}

    {/* Coffee Mug on Desk */}
    <rect x="440" y="328" width="16" height="22" rx="3" fill="#EF4444" />
    <path d="M456 333 C460 333 460 341 456 341" stroke="#EF4444" strokeWidth="2.5" />
    {/* Steam lines */}
    <path d="M444 322 Q446 318 444 314" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M449 324 Q451 320 449 316" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />

    {/* Abstract Floating Tech Elements */}
    {/* Code Brackets */}
    <g transform="translate(130, 160)">
      <path d="M8 0 L0 6 L8 12" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 0 L20 6 L12 12" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
    </g>
    {/* Checkmark Success Bubble */}
    <g transform="translate(450, 240)">
      <circle cx="16" cy="16" r="16" fill="#10B981" fillOpacity="0.2" />
      <circle cx="16" cy="16" r="12" fill="#10B981" />
      <path d="M11 16 L14 19 L21 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>

    {/* Gradients */}
    <defs>
      <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="accentGradient" x1="220" y1="300" x2="420" y2="180">
        <stop offset="0%" stopColor="#7C3AED" />
        <stop offset="50%" stopColor="#4F46E5" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
      <linearGradient id="deskGradient" x1="300" y1="420" x2="300" y2="444">
        <stop offset="0%" stopColor="#000000" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

const Home = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="home-container">
      {/* Landing Navbar */}
      <header className="home-navbar">
        <div className="home-navbar__logo-wrap">
          <div className="home-navbar__logo">
            <span>EMS</span>
          </div>
          <span className="home-navbar__logo-text">Enterprise Portal</span>
        </div>
        <nav className="home-navbar__links">
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="home-navbar__actions">
          <Link to="/login" className="home-navbar__login-btn">
            Login
          </Link>
          <button onClick={handleGetStarted} className="home-navbar__cta-btn">
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero__left">
          {/* Feature Badges */}
          <div className="home-hero__badges">
            <span className="hero-badge hero-badge--primary">
              <span className="hero-badge__dot"></span>
              Employee Management
            </span>
            <span className="hero-badge hero-badge--success">
              <span className="hero-badge__dot"></span>
              Attendance Tracking
            </span>
            <span className="hero-badge hero-badge--accent">
              <span className="hero-badge__dot"></span>
              Leave Management
            </span>
            <span className="hero-badge hero-badge--warning">
              <span className="hero-badge__dot"></span>
              Role-Based Access
            </span>
          </div>

          <h1 className="home-hero__title">
            Smart Employee <br />
            <span className="text-gradient">Management System</span>
          </h1>
          <p className="home-hero__subtitle">
            An all-in-one corporate console to streamline directory tracking, automated check-in/out records, leave request approvals, and administrative analytics within a high-performance visual dashboard.
          </p>

          <div className="home-hero__ctas">
            <button onClick={handleGetStarted} className="btn-hero-primary">
              Get Started Free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <Link to="/login" className="btn-hero-secondary">
              Sign In to System
            </Link>
          </div>
        </div>

        <div className="home-hero__right">
          <div className="illustration-wrapper">
            <HeroIllustration />
            
            {/* Floating Glassmorphism Cards */}
            <div className="floating-card floating-card--employees">
              <div className="floating-card__icon floating-card__icon--blue">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="floating-card__details">
                <span className="floating-card__label">Total Employees</span>
                <span className="floating-card__value">148+</span>
              </div>
            </div>

            <div className="floating-card floating-card--attendance">
              <div className="floating-card__icon floating-card__icon--green">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div className="floating-card__details">
                <span className="floating-card__label">Attendance Rate</span>
                <span className="floating-card__value">98.4%</span>
              </div>
            </div>

            <div className="floating-card floating-card--leaves">
              <div className="floating-card__icon floating-card__icon--amber">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div className="floating-card__details">
                <span className="floating-card__label">Leave Requests</span>
                <span className="floating-card__value">3 Pending</span>
              </div>
            </div>

            <div className="floating-card floating-card--active">
              <div className="floating-card__icon floating-card__icon--purple">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div className="floating-card__details">
                <span className="floating-card__label">Active Workspaces</span>
                <span className="floating-card__value">Live Now</span>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
