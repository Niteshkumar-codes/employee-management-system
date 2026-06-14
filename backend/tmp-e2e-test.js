(async ()=>{
  const base='http://localhost:5000/api';
  const fetchOpts = (token) => ({ headers: { 'Content-Type':'application/json', ...(token?{Authorization:`Bearer ${token}`}:{}) } });
  try{
    // Employee login
    let r = await fetch(base+'/auth/login',{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email:'employee@ems.com', password:'password123'})});
    const empLogin = await r.json();
    console.log('EMP login', r.status, JSON.stringify(empLogin));
    const empToken = empLogin.token;

    // Apply leave
    const payloadLeave = { leaveType: 'Sick', startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], reason: 'E2E test leave by script' };
    r = await fetch(base+'/leaves', { method: 'POST', headers: fetchOpts(empToken).headers, body: JSON.stringify(payloadLeave) });
    const leaveBody = await r.text();
    console.log('POST /leaves', r.status, leaveBody);

    // Mark attendance
    const payloadAtt = { date: new Date().toISOString(), checkIn: new Date().toISOString(), status: 'Present' };
    r = await fetch(base+'/attendance', { method: 'POST', headers: fetchOpts(empToken).headers, body: JSON.stringify(payloadAtt) });
    const attBody = await r.text();
    console.log('POST /attendance', r.status, attBody);

    // Admin login
    r = await fetch(base+'/auth/login',{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email:'admin@ems.com', password:'password123'})});
    const adminLogin = await r.json();
    console.log('ADMIN login', r.status, JSON.stringify(adminLogin));
    const adminToken = adminLogin.token;

    // Get leaves
    r = await fetch(base+'/leaves', { method: 'GET', headers: fetchOpts(adminToken).headers });
    const leaves = await r.json();
    console.log('GET /leaves', r.status, JSON.stringify(leaves).slice(0,1000));

    // find our leave by reason
    let leavesArr = leaves.records || leaves;
    const found = leavesArr.find(l => l.reason && l.reason.includes('E2E test leave by script'));
    if (!found) {
      console.log('No matching leave found to approve');
      return;
    }
    const leaveId = found._id;
    // Approve
    r = await fetch(base+`/leaves/${leaveId}/approve`, { method: 'PUT', headers: fetchOpts(adminToken).headers, body: JSON.stringify({}) });
    const approveBody = await r.text();
    console.log('PUT /leaves/'+leaveId+'/approve', r.status, approveBody);

    // Reject (if want) - skip
  } catch (e) { console.error(e); process.exit(1); }
})();
