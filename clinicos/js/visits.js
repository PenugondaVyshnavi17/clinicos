// ============================================================
// VISITS.JS — Register Patient + Record Visit
// ============================================================

// ---------- REGISTER ----------

function initRegister() {
  const form = document.getElementById('registerForm');
  if (form._initialized) return;
  form._initialized = true;
  form.addEventListener('submit', handleRegister);
}

function handleRegister(e) {
  e.preventDefault();
  clearRegisterErrors();

  const session = getSession();
  const name    = document.getElementById('regName').value.trim();
  const phone   = document.getElementById('regPhone').value.trim();
  const age     = document.getElementById('regAge').value.trim();
  const gender  = document.getElementById('regGender').value;
  const blood   = document.getElementById('regBlood').value;

  let valid = true;

  if (name.length < 2) { showRegError('regName', 'Enter patient name'); valid = false; }
  if (!/^[6-9]\d{9}$/.test(phone)) { showRegError('regPhone', 'Enter valid 10-digit mobile number'); valid = false; }
  if (!age || age < 0 || age > 120) { showRegError('regAge', 'Enter valid age (0–120)'); valid = false; }
  if (!gender) { showRegError('regGender', 'Select gender'); valid = false; }
  if (!blood)  { showRegError('regBlood', 'Select blood group'); valid = false; }
  if (!valid) return;

  if (findPatientByPhone(phone, session.email)) {
    showRegError('regPhone', 'A patient with this phone number is already registered under your account');
    return;
  }

  const patient = {
    id: generateId('pt'),
    name, phone, age: parseInt(age), gender, bloodGroup: blood,
    doctorEmail: session.email,
    createdAt: new Date().toISOString().split('T')[0]
  };

  savePatient(patient);
  showAppToast(`Patient ${name} registered successfully!`, 'success');
  e.target.reset();
}

function showRegError(fieldId, msg) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.add('input-error');
  const err = document.createElement('span');
  err.className = 'field-error';
  err.textContent = msg;
  field.parentNode.appendChild(err);
}

function clearRegisterErrors() {
  document.querySelectorAll('#registerForm .input-error').forEach(el => el.classList.remove('input-error'));
  document.querySelectorAll('#registerForm .field-error').forEach(el => el.remove());
}

// ---------- RECORD VISIT ----------

let selectedVisitPatient = null;
let selectedSymptoms     = new Set();
let prescriptionRows     = [];

function initVisit() {
  const panel = document.getElementById('tab-visit');
  if (panel._initialized) return;
  panel._initialized = true;

  // Patient search
  const searchInput = document.getElementById('visitPatientSearch');
  const results     = document.getElementById('visitPatientResults');

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) { results.innerHTML = ''; results.classList.add('hidden'); return; }

    const session  = getSession();
    const patients = getDoctorPatients(session.email).filter(
      p => p.name.toLowerCase().includes(q) || p.phone.includes(q)
    );

    if (patients.length === 0) {
      results.innerHTML = '<div class="dropdown-empty">No patients found</div>';
      results.classList.remove('hidden');
    } else {
      results.innerHTML = patients.slice(0, 6).map(p => `
        <div class="dropdown-item" onclick="selectVisitPatient('${p.phone}')">
          <strong>${p.name}</strong> <span class="dropdown-phone">${p.phone}</span>
        </div>
      `).join('');
      results.classList.remove('hidden');
    }
  });

  // Set today's date
  document.getElementById('visitDate').value = new Date().toISOString().split('T')[0];

  // Render symptom chips
  renderSymptomChips();

  // Render medicine selector
  renderMedicineSelector();

  // Form submit
  document.getElementById('visitForm').addEventListener('submit', handleSaveVisit);
}

function selectVisitPatient(phone) {
  const session = getSession();
  const patient = findPatientByPhone(phone, session.email);
  if (!patient) return;

  selectedVisitPatient = patient;
  document.getElementById('visitPatientSearch').value = patient.name + ' — ' + patient.phone;
  document.getElementById('visitPatientResults').classList.add('hidden');

  const info = document.getElementById('selectedPatientInfo');
  info.innerHTML = `
    <div class="selected-patient-card">
      <div class="spc-avatar">${patient.name.charAt(0)}</div>
      <div class="spc-details">
        <div class="spc-name">${patient.name}</div>
        <div class="spc-meta">${patient.age}y · ${patient.gender} · ${patient.bloodGroup}</div>
      </div>
      <div class="spc-visits">${getPatientVisits(phone, session.email).length} past visits</div>
    </div>
  `;
  info.classList.remove('hidden');
}

function renderSymptomChips() {
  const container = document.getElementById('symptomChips');
  container.innerHTML = SYMPTOMS.map(s => `
    <button type="button" class="symptom-chip" data-sym="${s}" onclick="toggleSymptom(this, '${s}')">${s}</button>
  `).join('');
}

function toggleSymptom(btn, sym) {
  if (selectedSymptoms.has(sym)) {
    selectedSymptoms.delete(sym);
    btn.classList.remove('selected');
  } else {
    selectedSymptoms.add(sym);
    btn.classList.add('selected');
  }
}

function renderMedicineSelector() {
  const container = document.getElementById('prescriptionBuilder');
  container.innerHTML = `
    <div class="rx-add-row">
      <select id="rxMedicine" class="rx-input">
        <option value="">Select medicine</option>
        ${MEDICINES.map(m => `<option value="${m.name}">${m.name} (${m.type})</option>`).join('')}
      </select>
      <select id="rxDosage" class="rx-input">
        <option value="">Dosage</option>
      </select>
      <select id="rxFreq" class="rx-input">
        <option value="">Frequency</option>
        <option>Once daily</option>
        <option>Twice daily</option>
        <option>Thrice daily</option>
        <option>Once daily (empty stomach)</option>
        <option>Once weekly</option>
        <option>As needed</option>
      </select>
      <input id="rxDuration" class="rx-input" type="text" placeholder="Duration (e.g. 5 days)" />
      <button type="button" class="btn-add-rx" onclick="addPrescriptionRow()">+ Add</button>
    </div>
    <div id="rxRows"></div>
  `;

  document.getElementById('rxMedicine').addEventListener('change', function() {
    const med = MEDICINES.find(m => m.name === this.value);
    const dosageSel = document.getElementById('rxDosage');
    dosageSel.innerHTML = '<option value="">Dosage</option>';
    if (med) {
      med.dosages.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d; opt.textContent = d;
        dosageSel.appendChild(opt);
      });
    }
  });
}

function addPrescriptionRow() {
  const medicine = document.getElementById('rxMedicine').value;
  const dosage   = document.getElementById('rxDosage').value;
  const freq     = document.getElementById('rxFreq').value;
  const duration = document.getElementById('rxDuration').value.trim();

  if (!medicine || !dosage || !freq || !duration) {
    showAppToast('Fill all prescription fields before adding', 'error');
    return;
  }

  const row = { id: generateId('rx'), medicine, dosage, freq, duration };
  prescriptionRows.push(row);
  renderRxRows();

  // Reset
  document.getElementById('rxMedicine').value  = '';
  document.getElementById('rxDosage').innerHTML = '<option value="">Dosage</option>';
  document.getElementById('rxFreq').value     = '';
  document.getElementById('rxDuration').value  = '';
}

function renderRxRows() {
  const container = document.getElementById('rxRows');
  if (prescriptionRows.length === 0) { container.innerHTML = ''; return; }
  container.innerHTML = `
    <table class="rx-table">
      <thead><tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th></th></tr></thead>
      <tbody>
        ${prescriptionRows.map(r => `
          <tr>
            <td>${r.medicine}</td>
            <td>${r.dosage}</td>
            <td>${r.freq}</td>
            <td>${r.duration}</td>
            <td><button type="button" class="btn-remove-rx" onclick="removeRxRow('${r.id}')">✕</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function removeRxRow(id) {
  prescriptionRows = prescriptionRows.filter(r => r.id !== id);
  renderRxRows();
}

function handleSaveVisit(e) {
  e.preventDefault();

  if (!selectedVisitPatient) {
    showAppToast('Please select a patient first', 'error');
    return;
  }
  const diagnosis = document.getElementById('visitDiagnosis').value.trim();
  if (!diagnosis) {
    showAppToast('Please enter a diagnosis', 'error');
    return;
  }
  if (selectedSymptoms.size === 0) {
    showAppToast('Please select at least one symptom', 'error');
    return;
  }

  const session     = getSession();
  const date        = document.getElementById('visitDate').value;
  const extraSym    = document.getElementById('extraSymptoms').value.trim();
  const notes       = document.getElementById('visitNotes').value.trim();

  const visit = {
    id: generateId('v'),
    patientPhone: selectedVisitPatient.phone,
    patientName:  selectedVisitPatient.name,
    doctorEmail:  session.email,
    date,
    symptoms:     Array.from(selectedSymptoms),
    extraSymptoms: extraSym,
    diagnosis,
    prescription: [...prescriptionRows],
    notes
  };

  saveVisit(visit);
  showAppToast(`Visit recorded for ${selectedVisitPatient.name}`, 'success');

  // Reset
  selectedVisitPatient = null;
  selectedSymptoms     = new Set();
  prescriptionRows     = [];
  document.getElementById('visitPatientSearch').value = '';
  document.getElementById('selectedPatientInfo').classList.add('hidden');
  document.getElementById('visitDiagnosis').value = '';
  document.getElementById('extraSymptoms').value = '';
  document.getElementById('visitNotes').value = '';
  document.getElementById('visitDate').value = new Date().toISOString().split('T')[0];
  renderSymptomChips();
  renderRxRows();
}
