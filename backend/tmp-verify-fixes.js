(async ()=>{
  const base='http://localhost:5000/api';
  try{
    const loginResp=await fetch(base+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'employee@ems.com',password:'password123'})});
    const loginData=await loginResp.json();
    console.log('/auth/login',loginResp.status, loginData.email || loginData.token ? 'OK' : JSON.stringify(loginData));
    const token = loginData.token;

    const attPayload = { date: new Date().toISOString(), checkIn: new Date().toISOString(), status: 'Present' };
    const attResp = await fetch(base+'/attendance',{method:'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(attPayload)});
    console.log('/attendance', attResp.status);
    console.log('attendance body', await attResp.text());

    // use leave id from earlier test
    const leaveId = '6a2848569a2369a3ae545cb2';
    const approveResp = await fetch(`${base}/leaves/${leaveId}/approve`, { method: 'PUT', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({}) });
    console.log('/leaves/:id/approve', approveResp.status);
    console.log('approve body', await approveResp.text());
  } catch (e){ console.error(e); process.exit(1); }
})();
