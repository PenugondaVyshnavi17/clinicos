// ============================================================
// PATIENTS.JS
// ============================================================

function renderPatients(query = '') {
  const session  = getSession();
  const patients = getDoctorPatients(session.email);
  const q        = query.toLowerCase();

  const filtered = q
    ? patients.filter(p => p.name.toLowerCase().includes(q) || p.phone.includes(q))
    : patients;

  const grid = document.getElementById('patientGrid');

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state">
      <div class="empty-icon">🔍</div>
      <p>${q ? 'No patients found for "' + query + '"' : 'No patients registered yet.'}</p>
    </div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const visits = getPatientVisits(p.phone, session.email);
    const last   = visits[0];
    return `
      <div class="patient-card" onclick="openPatientModal('${p.phone}')">
        <div class="pcard-header">
          <div class="pcard-avatar">${p.name.charAt(0)}</div>
          <div class="pcard-info">
            <div class="pcard-name">${p.name}</div>
            <div class="pcard-phone">📞 ${p.phone}</div>
          </div>
          <div class="pcard-badge">${visits.length} visit${visits.length !== 1 ? 's' : ''}</div>
        </div>
        <div class="pcard-meta">
          <span class="meta-pill">${p.age}y</span>
          <span class="meta-pill">${p.gender}</span>
          <span class="meta-pill blood">${p.bloodGroup}</span>
        </div>
        ${last ? `<div class="pcard-last">Last visit: ${formatDate(last.date)} · ${last.diagnosis}</div>` : '<div class="pcard-last muted">No visits yet</div>'}
      </div>
    `;
  }).join('');
}

function initPatientsSearch() {
  const input = document.getElementById('patientSearch');
  if (input._initialized) return;
  input._initialized = true;
  input.addEventListener('input', () => renderPatients(input.value));
}

function openPatientModal(phone) {
  const session = getSession();
  const patient = findPatientByPhone(phone, session.email);
  const visits  = getPatientVisits(phone, session.email);
  if (!patient) return;

  document.getElementById('modalPatientName').textContent  = patient.name;
  document.getElementById('modalPatientPhone').textContent = patient.phone;
  document.getElementById('modalPatientAge').textContent   = patient.age + ' yrs';
  document.getElementById('modalPatientGender').textContent= patient.gender;
  document.getElementById('modalPatientBlood').textContent = patient.bloodGroup;
  document.getElementById('modalVisitCount').textContent   = visits.length + ' visit' + (visits.length !== 1 ? 's' : '');

  const timeline = document.getElementById('visitTimeline');
  if (visits.length === 0) {
    timeline.innerHTML = '<div class="empty-state"><p>No visits recorded for this patient.</p></div>';
  } else {
    timeline.innerHTML = visits.map((v, i) => `
      <div class="visit-card ${i === 0 ? 'latest' : ''}">
        <div class="vc-header">
          <div class="vc-date">${formatDate(v.date)}</div>
          ${i === 0 ? '<span class="badge-latest">Latest</span>' : ''}
        </div>
        <div class="vc-diagnosis">🩺 ${v.diagnosis}</div>
        <div class="vc-symptoms">
          ${(v.symptoms||[]).map(s => `<span class="symptom-tag">${s}</span>`).join('')}
          ${v.extraSymptoms ? `<span class="symptom-tag extra">${v.extraSymptoms}</span>` : ''}
        </div>
        ${v.prescription && v.prescription.length > 0 ? `
        <div class="vc-rx">
          <div class="rx-title">💊 Prescription</div>
          <table class="rx-table">
            <thead><tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th></tr></thead>
            <tbody>
              ${v.prescription.map(rx => `<tr><td>${rx.medicine}</td><td>${rx.dosage}</td><td>${rx.freq}</td><td>${rx.duration}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>` : ''}
      </div>
    `).join('');
  }

  document.getElementById('patientModal').classList.add('open');
  document.body.classList.add('modal-open');
}

function closePatientModal() {
  document.getElementById('patientModal').classList.remove('open');
  document.body.classList.remove('modal-open');
}

// Called once when patients tab loads
function renderPatients_init() {
  renderPatients();
  initPatientsSearch();
}
