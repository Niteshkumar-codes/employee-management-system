const BASE = 'http://localhost:5000/api';

const randomSuffix = Date.now();
const payload = {
  employeeId: `EMP${randomSuffix}`,
  name: 'Test Persistence',
  email: `test.persistence.${randomSuffix}@ems.local`,
  phone: '9999999999',
  department: 'Engineering',
  designation: 'Tester',
  salary: 55000,
  joiningDate: new Date().toISOString(),
  status: 'active'
};

const requestJson = async (url, options = {}) => {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(`Request failed ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

const run = async () => {
  try {
    console.log('Registering admin user...');
    try {
      await requestJson(`${BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Persistence Admin',
          email: 'persistence.admin@ems.local',
          password: 'Password123!',
          role: 'admin'
        })
      });
      console.log('Admin user created.');
    } catch (err) {
      if (err.status === 400 && err.data?.message?.includes('User already exists')) {
        console.log('Admin user already exists.');
      } else {
        throw err;
      }
    }

    const login = await requestJson(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'persistence.admin@ems.local', password: 'Password123!' })
    });
    const token = login.token;
    console.log('Logged in, token length:', token?.length);

    console.log('GET /api/employees before create');
    const before = await requestJson(`${BASE}/employees`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Before count:', before.length);

    console.log('Creating employee via POST /api/employees');
    const create = await requestJson(`${BASE}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    console.log('Created employee id:', create._id);

    console.log('GET /api/employees after create');
    const after = await requestJson(`${BASE}/employees`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('After count:', after.length);
    const exists = after.some(e => e.email === payload.email);
    console.log('New record present after create:', exists);

    process.exit(exists ? 0 : 1);
  } catch (err) {
    console.error('API test failed:', err);
    console.error('Error message:', err.message);
    console.error('Error data:', err.data);
    process.exit(1);
  }
};

run();
