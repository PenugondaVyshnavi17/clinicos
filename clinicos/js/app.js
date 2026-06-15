// ============================================================
// APP.JS — Shell, Navigation, Sidebar
// ============================================================

let MEDICINES = [];
let SYMPTOMS  = [];

async function loadStaticData() {
  try {
    const [mRes, sRes] = await Promise.all([
      fetch('data/medicines.json'),
      fetch('data/symptoms.json')
    ]);
    MEDICINES = await mRes.json();
    SYMPTOMS  = await sRes.json();
  } catch {
    MEDICINES = [];
    SYMPTOMS  = [];
  }
}

function initApp() {
  const session = getSession();
  if (!session) { window.location.href = 'login.html'; return; }

  // Populate sidebar
  document.getElementById('sidebarDoctorName').textContent  = 'Dr. ' + session.name;
  document.getElementById('sidebarSpeciality').textContent  = session.specialisation || 'General Physician';
  document.getElementById('sidebarHospital').textContent    = session.hospital || 'Clinic';

  // Nav
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = link.dataset.tab;
      switchTab(tab);
    });
  });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    clearSession();
    window.location.href = 'login.html';
  });

  // Mobile sidebar toggle
  const toggleBtn = document.getElementById('sidebarToggle');
  const sidebar   = document.getElementById('sidebar');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Close sidebar on tab click (mobile)
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => sidebar.classList.remove('open'));
  });

  loadStaticData().then(() => {
    switchTab('dashboard');
  });
}

function switchTab(tab) {
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const activeLink = document.querySelector(`.nav-link[data-tab="${tab}"]`);
  if (activeLink) activeLink.classList.add('active');

  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('tab-' + tab);
  if (panel) panel.classList.add('active');

  if (tab === 'dashboard') renderDashboard();
  if (tab === 'patients')  renderPatients();
  if (tab === 'register')  initRegister();
  if (tab === 'visit')     initVisit();
}

function showAppToast(message, type = 'success') {
  let toast = document.getElementById('appToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'appToast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className   = `app-toast app-toast-${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3500);
}

document.addEventListener('DOMContentLoaded', initApp);
