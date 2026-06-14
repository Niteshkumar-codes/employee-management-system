const run = async () => {
  const tests = [
    { email: 'admin@ems.com', password: 'password123' },
    { email: 'persistence.admin@ems.local', password: 'Password123!' }
  ];
  for (const test of tests) {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test)
      });
      const body = await res.text();
      console.log('LOGIN', test.email, res.status, body);
    } catch (err) {
      console.error('ERROR', test.email, err.message);
    }
  }
};
run();
