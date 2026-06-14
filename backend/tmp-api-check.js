const run = async () => {
  const base = 'http://localhost:5000/api';
  try {
    const loginResp = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'persistence.admin@ems.local', password: 'password123' })
    });
    console.log('/auth/login status', loginResp.status);
    const loginData = await loginResp.text();
    console.log('login body', loginData);
  } catch (err) {
    console.error('login error', err);
  }
  try {
    const empsResp = await fetch(`${base}/employees`, { headers: { Authorization: 'Bearer invalidtoken' } });
    console.log('/employees status', empsResp.status);
    const empsData = await empsResp.text();
    console.log('/employees body', empsData);
  } catch (err) {
    console.error('employees error', err);
  }
};
run();
