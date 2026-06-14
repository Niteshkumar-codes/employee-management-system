const base = 'http://localhost:5000/api';
const run = async () => {
  try {
    const loginResp = await fetch(`${base}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'employee@ems.com', password: 'password123' })
    });
    const loginData = await loginResp.json();
    const token = loginData.token;
    const payload = { date: new Date().toISOString(), checkIn: new Date().toISOString(), status: 'Present' };
    const resp = await fetch(`${base}/attendance/mark`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
    console.log('/attendance/mark', resp.status);
    const body = await resp.text();
    console.log('attendance body', body);
  } catch (err) {
    console.error(err);
  }
};
run();
