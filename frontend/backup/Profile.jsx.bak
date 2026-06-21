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

  return (
    <div className="profile-page" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, color: '#0f172a', fontWeight: 'bold' }}>My Profile</h1>
        {isOfflineMode && (
          <span style={{
            backgroundColor: '#fffbeb',
            color: '#b45309',
            border: '1px solid #fef3c7',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: '600'
          }}>
            ⚡ Demo Mode
          </span>
        )}
      </div>
      
      <p style={{ color: '#64748b' }}>View your personal and corporate details.</p>

      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          color: '#991b1b',
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          border: '1px solid #fca5a5',
          marginBottom: '2rem'
        }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
          gap: '1rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #cbd5e1',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ color: '#64748b', margin: 0, fontSize: '1rem', fontWeight: '500' }}>Fetching profile, please wait...</p>
        </div>
      ) : profile ? (
        <div style={{
          marginTop: '2rem',
          padding: '2.5rem 2rem',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          backgroundColor: 'white',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <strong style={{ color: '#475569', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</strong>
              <p style={{ margin: '0.25rem 0 0 0', color: '#0f172a', fontSize: '1.15rem', fontWeight: '600' }}>{profile.name || '--'}</p>
            </div>
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <strong style={{ color: '#475569', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</strong>
              <p style={{ margin: '0.25rem 0 0 0', color: '#0f172a', fontSize: '1.1rem' }}>{profile.email || '--'}</p>
            </div>
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <strong style={{ color: '#475569', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>System Role</strong>
              <p style={{ margin: '0.25rem 0 0 0', color: '#2563eb', fontSize: '1rem', fontWeight: '600', textTransform: 'capitalize' }}>{profile.role || '--'}</p>
            </div>
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <strong style={{ color: '#475569', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department</strong>
              <p style={{ margin: '0.25rem 0 0 0', color: '#0f172a', fontSize: '1rem' }}>{profile.department || (profile.role === 'admin' ? 'Management' : profile.role === 'hr' ? 'HR' : '--')}</p>
            </div>
            <div>
              <strong style={{ color: '#475569', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Designation</strong>
              <p style={{ margin: '0.25rem 0 0 0', color: '#0f172a', fontSize: '1rem' }}>{profile.designation || (profile.role === 'admin' ? 'System Administrator' : profile.role === 'hr' ? 'HR Specialist' : '--')}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Profile;
