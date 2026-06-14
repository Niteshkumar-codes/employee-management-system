(async ()=>{
  const base='http://localhost:5000/api';
  try{
    let r = await fetch(base+'/auth/login',{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email:'employee@ems.com', password:'password123'})});
    const empLogin = await r.json();
    const token = empLogin.token;
    console.log('EMP login', r.status);
    const payload = { date: new Date().toISOString(), checkOut: new Date().toISOString(), status: 'Present' };
    r = await fetch(base+'/attendance', { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
    const body = await r.text();
    console.log('POST /attendance (checkout)', r.status, body);
  } catch (e) { console.error(e); process.exit(1); }
})();
