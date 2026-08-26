async function testSignup() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teamName: 'Theorem Titans',
        password: 'Password123!',
        role: 'team'
      })
    });
    const data = await res.json();
    console.log('Status Code:', res.status);
    console.log('Response Payload:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Test failed:', err);
  }
}

testSignup();
