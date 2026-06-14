const base = 'http://localhost:5000/api';
const run = async () => {
  try {
    const loginResp = await fetch(`${base}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'employee@ems.com', password: 'password123' })
    });
    console.log('/auth/login', loginResp.status);
    const loginData = await loginResp.json();
    console.log('login body', loginData);
    if (!loginResp.ok) return;
    const token = loginData.token;
    const payload = { leaveType: 'Sick Leave', startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], reason: 'Test leave from script' };
    const resp = await fetch(`${base}/leaves`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
    console.log('/leaves', resp.status);
    const body = await resp.text();
    console.log('leaves body', body);
  } catch (err) {
    console.error(err);
  }
};
run();
