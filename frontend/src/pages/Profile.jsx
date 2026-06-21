import { useEffect, useState } from 'react';
import { apiService } from '../services/api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const { data, isMock } = await apiService.getProfile();
        setProfile(data);
        setIsOfflineMode(isMock);
      } catch (err) {
        console.error('Profile API Error:', err);
        setError('Failed to load profile details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Dispatch profile update for in-memory global search
  useEffect(() => {
    if (profile) {
      window.dispatchEvent(new CustomEvent('ems-data-profile', { detail: profile }));
    }
  }, [profile]);

  const initials = profile?.name
    ? profile.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
    : 'EM';

  return (
    <div className="section-card" style={{ maxWidth: '720px', margin: '0 auto', padding: '0', overflow: 'hidden', animation: 'fade-in-up 0.4s ease' }}>
      {/* Banner / Header Card */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
        padding: '3rem 2rem',
        textAlign: 'center',
        color: 'white',
        position: 'relative'
      }}>
        {/* Demo badge inside banner */}
        {isOfflineMode && (
          <span className="badge badge--warning" style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', border: '1px solid rgba(245, 158, 11, 0.4)', color: 'white' }}>
            Demo Mode
          </span>
        )}

        {/* Profile Avatar */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          border: '4px solid rgba(255, 255, 255, 0.25)',
          color: 'white',
          fontWeight: 800,
          fontSize: '1.75rem',
          display: 'grid',
          placeItems: 'center',
          margin: '0 auto 1rem',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
        }}>
          {initials}
        </div>
        
        <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{profile?.name || 'EMS Employee'}</h2>
        <p style={{ color: '#c7d2fe', fontSize: '0.9rem', marginTop: '0.25rem', textTransform: 'capitalize', fontWeight: 500 }}>
          {profile?.designation || 'Staff'} · {profile?.department || 'Roster'}
        </p>
      </div>

      <div style={{ padding: '2.5rem 2rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Inspect your verified personal credentials and corporate directory information.
        </p>

        {error && (
          <div className="alert" style={{ marginBottom: '2rem' }}>
            <span>⚠️</span>
            <div>{error}</div>
          </div>
        )}

        {loading ? (
          <div className="dashboard-loading" style={{ border: 'none', boxShadow: 'none', padding: '2rem' }}>
            <div className="spinner" />
            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Loading profile logs...</p>
          </div>
        ) : profile ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem 2.5rem'
          }}>
            {/* Full Name */}
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <strong style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</strong>
              <p style={{ margin: '0.35rem 0 0 0', color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: '600' }}>{profile.name || '--'}</p>
            </div>
            
            {/* Email Address */}
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <strong style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</strong>
              <p style={{ margin: '0.35rem 0 0 0', color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: '500' }}>{profile.email || '--'}</p>
            </div>
            
            {/* System Role */}
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <strong style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>System Role</strong>
              <p style={{ margin: '0.35rem 0 0 0', color: 'var(--primary)', fontSize: '0.95rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{profile.role || '--'}</p>
            </div>
            
            {/* Department */}
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <strong style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department</strong>
              <p style={{ margin: '0.35rem 0 0 0', color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: '600' }}>
                {profile.department || (profile.role === 'admin' ? 'Management' : profile.role === 'hr' ? 'HR' : '--')}
              </p>
            </div>
            
            {/* Designation */}
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <strong style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Designation</strong>
              <p style={{ margin: '0.35rem 0 0 0', color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: '600' }}>
                {profile.designation || (profile.role === 'admin' ? 'System Administrator' : profile.role === 'hr' ? 'HR Specialist' : '--')}
              </p>
            </div>

            {/* Profile ID Status */}
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <strong style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Roster ID</strong>
              <p style={{ margin: '0.35rem 0 0 0', color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
                {profile.employeeId || profile._id || '--'}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Profile;
