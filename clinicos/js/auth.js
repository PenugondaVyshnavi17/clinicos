// ============================================================
// AUTH.JS — Signup, Login, Forgot Password
// ============================================================

function initAuth() {
  const session = getSession();
  const page = document.body.dataset.page;

  if (page === 'signup' || page === 'login') {
    if (session) {
      window.location.href = 'index.html';
      return;
    }
  } else {
    if (!session) {
      window.location.href = 'login.html';
      return;
    }
  }

  if (page === 'signup') initSignup();
  if (page === 'login')  initLogin();
}

// ---------- SIGNUP ----------

function initSignup() {
  const form = document.getElementById('signupForm');
  form.addEventListener('submit', handleSignup);

  document.getElementById('togglePassword').addEventListener('click', () => {
    const input = document.getElementById('password');
    const icon  = document.getElementById('togglePassword');
    if (input.type === 'password') {
      input.type = 'text';
      icon.textContent = '🙈';
    } else {
      input.type = 'password';
      icon.textContent = '👁️';
    }
  });

  document.getElementById('toggleConfirm').addEventListener('click', () => {
    const input = document.getElementById('confirmPassword');
    const icon  = document.getElementById('toggleConfirm');
    if (input.type === 'password') {
      input.type = 'text';
      icon.textContent = '🙈';
    } else {
      input.type = 'password';
      icon.textContent = '👁️';
    }
  });
}

function handleSignup(e) {
  e.preventDefault();
  clearErrors();

  const name     = document.getElementById('fullName').value.trim();
  const phone    = document.getElementById('phone').value.trim();
  const email    = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;
  const confirm  = document.getElementById('confirmPassword').value;

  let valid = true;

  if (name.length < 3) {
    showError('fullName', 'Enter your full name (at least 3 characters)');
    valid = false;
  }
  if (!/^[6-9]\d{9}$/.test(phone)) {
    showError('phone', 'Enter a valid 10-digit Indian mobile number');
    valid = false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError('email', 'Enter a valid email address');
    valid = false;
  }
  if (password.length < 6) {
    showError('password', 'Password must be at least 6 characters');
    valid = false;
  }
  if (password !== confirm) {
    showError('confirmPassword', 'Passwords do not match');
    valid = false;
  }
  if (findDoctorByEmail(email)) {
    showError('email', 'This email is already registered');
    valid = false;
  }
  if (findDoctorByPhone(phone)) {
    showError('phone', 'This phone number is already registered');
    valid = false;
  }
  if (!valid) return;

  const doctor = { id: generateId('dr'), name, phone, email, password, createdAt: new Date().toISOString() };
  saveDoctor(doctor);

  showToast('Account created! Please log in.', 'success');
  setTimeout(() => window.location.href = 'login.html', 1200);
}

// ---------- LOGIN ----------

function initLogin() {
  // Populate specialisation dropdown
  const sel = document.getElementById('specialisation');
  SPECIALISATIONS.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s;
    opt.textContent = s;
    sel.appendChild(opt);
  });

  document.getElementById('loginForm').addEventListener('submit', handleLogin);

  document.getElementById('toggleLoginPassword').addEventListener('click', () => {
    const input = document.getElementById('loginPassword');
    const icon  = document.getElementById('toggleLoginPassword');
    if (input.type === 'password') {
      input.type = 'text';
      icon.textContent = '🙈';
    } else {
      input.type = 'password';
      icon.textContent = '👁️';
    }
  });

  document.getElementById('forgotPasswordLink').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('forgotSection').classList.remove('hidden');
  });

  document.getElementById('backToLogin').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('forgotSection').classList.add('hidden');
    document.getElementById('loginSection').classList.remove('hidden');
  });

  document.getElementById('forgotForm').addEventListener('submit', handleForgotPassword);
}

function handleLogin(e) {
  e.preventDefault();
  clearErrors();

  const email          = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password       = document.getElementById('loginPassword').value;
  const specialisation = document.getElementById('specialisation').value;
  const hospital       = document.getElementById('hospitalName').value.trim();

  let valid = true;

  if (!email) { showError('loginEmail', 'Enter your email'); valid = false; }
  if (!password) { showError('loginPassword', 'Enter your password'); valid = false; }
  if (!specialisation) { showError('specialisation', 'Select your specialisation'); valid = false; }
  if (!hospital) { showError('hospitalName', 'Enter your hospital / clinic name'); valid = false; }
  if (!valid) return;

  const doctor = findDoctorByEmail(email);
  if (!doctor || doctor.password !== password) {
    showError('loginPassword', 'Incorrect email or password');
    return;
  }

  // Save specialisation + hospital to session (can vary per login)
  const sessionData = { ...doctor, specialisation, hospital };
  setSession(sessionData);
  seedData(); // seed sample data on first ever login

  showToast(`Welcome back, Dr. ${doctor.name.split(' ')[0]}!`, 'success');
  setTimeout(() => window.location.href = 'index.html', 1000);
}

function handleForgotPassword(e) {
  e.preventDefault();
  clearErrors();

  const email    = document.getElementById('resetEmail').value.trim().toLowerCase();
  const password = document.getElementById('newPassword').value;
  const confirm  = document.getElementById('confirmNewPassword').value;

  let valid = true;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError('resetEmail', 'Enter a valid email address');
    valid = false;
  }
  if (password.length < 6) {
    showError('newPassword', 'Password must be at least 6 characters');
    valid = false;
  }
  if (password !== confirm) {
    showError('confirmNewPassword', 'Passwords do not match');
    valid = false;
  }
  if (!valid) return;

  const success = updateDoctorPassword(email, password);
  if (!success) {
    showError('resetEmail', 'No account found with this email');
    return;
  }

  showToast('Password reset! Please log in.', 'success');
  setTimeout(() => {
    document.getElementById('forgotSection').classList.add('hidden');
    document.getElementById('loginSection').classList.remove('hidden');
  }, 1500);
}

// ---------- Shared Helpers ----------

function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.add('input-error');
  const err = document.createElement('span');
  err.className = 'field-error';
  err.textContent = message;
  field.parentNode.appendChild(err);
}

function clearErrors() {
  document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
  document.querySelectorAll('.field-error').forEach(el => el.remove());
}

function showToast(message, type = 'success') {
  let toast = document.getElementById('authToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'authToast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `auth-toast auth-toast-${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

document.addEventListener('DOMContentLoaded', initAuth);
