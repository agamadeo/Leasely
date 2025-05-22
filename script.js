document.addEventListener('DOMContentLoaded', () => {
  const supabase = window.supabase.createClient(
    'https://yjhcftjzccklarqnnwrd.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaGNmdGp6Y2NrbGFycW5ud3JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NDExNDgsImV4cCI6MjA2MzQxNzE0OH0.LxxUy5J6RqTjk5ZPOzGU47CEsovuKILVAlpspy_o1b0'
  );

  let previousScreen = '';
  let userId = null;

  window.goTo = (id, from) => {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    previousScreen = from;
  };

  window.goBack = () => {
    goTo(previousScreen);
  };

  window.toggleCotenant = () => {
    const cotenantFields = document.getElementById('cotenantFields');
    const addBtn = document.getElementById('addCotenantBtn');
    if (cotenantFields.style.display === 'block') {
      cotenantFields.style.display = 'none';
      addBtn.textContent = '➕ Add Co-Tenant';
    } else {
      cotenantFields.style.display = 'block';
      addBtn.textContent = '➖ Remove Co-Tenant';
    }
  };

  window.signup = async () => {
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPass').value;

    if (!email || !password) {
      alert('Please enter email and password.');
      return;
    }
    if (password.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert(`Signup failed: ${error.message}`);
      return;
    }
    userId = data.user.id;
    alert('Signup successful! Please check your email to confirm.');
    goTo('form', 'signup');
  };

  window.login = async () => {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPass').value;

    if (!email || !password) {
      alert('Please enter email and password.');
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(`Login failed: ${error.message}`);
      return;
    }
    userId = data.user.id;
    goTo('form', 'login');
  };

  window.submitApp = async () => {
    if (!userId) {
      alert('Please log in or sign up first.');
      goTo('welcome');
      return;
    }

    const email = document.getElementById('signupEmail').value || document.getElementById('loginEmail').value;
    const name = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const car = document.getElementById('car').value;
    const pet = document.getElementById('pet').value;
    const comments = document.getElementById('comments').value.trim();
    const cotenantName = document.getElementById('cotenantName').value.trim();
    const cotenantEmail = document.getElementById('cotenantEmail').value.trim();

    if (!email || !name || !phone || !car || !pet || !comments) {
      alert('Please fill out all required fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address (e.g., name@domain.com).');
      return;
    }
    if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      alert('Please enter a valid 10-digit phone number (e.g., 1234567890).');
      return;
    }
    if (cotenantEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cotenantEmail)) {
      alert('Please enter a valid co-tenant email address or leave it blank.');
      return;
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    const { error } = await supabase.from('applications').insert({
      user_id: userId,
      email, name, phone, car, pet, comments,
      cotenant_name: cotenantName || null,
      cotenant_email: cotenantEmail || null
    });

    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Application';

    if (error) {
      alert(`Error: ${error.message}`);
      console.error(error);
    } else {
      goTo('done');
    }
  };
});
