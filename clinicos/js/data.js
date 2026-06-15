// ============================================================
// DATA.JS — Storage, Auth, Seed Data
// ============================================================

const DOCTORS_KEY   = 'clinicos_doctors';
const SESSION_KEY   = 'clinicos_session';
const PATIENTS_KEY  = 'clinicos_patients';
const VISITS_KEY    = 'clinicos_visits';

// ---------- Auth Helpers ----------

function getDoctors() {
  return JSON.parse(localStorage.getItem(DOCTORS_KEY) || '[]');
}

function saveDoctor(doc) {
  const doctors = getDoctors();
  doctors.push(doc);
  localStorage.setItem(DOCTORS_KEY, JSON.stringify(doctors));
}

function findDoctorByEmail(email) {
  return getDoctors().find(d => d.email.toLowerCase() === email.toLowerCase());
}

function findDoctorByPhone(phone) {
  return getDoctors().find(d => d.phone === phone);
}

function setSession(doctor) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(doctor));
}

function getSession() {
  return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function updateDoctorPassword(email, newPassword) {
  const doctors = getDoctors();
  const idx = doctors.findIndex(d => d.email.toLowerCase() === email.toLowerCase());
  if (idx === -1) return false;
  doctors[idx].password = newPassword;
  localStorage.setItem(DOCTORS_KEY, JSON.stringify(doctors));
  return true;
}

// ---------- Patient Helpers ----------

function getPatients() {
  return JSON.parse(localStorage.getItem(PATIENTS_KEY) || '[]');
}

function getDoctorPatients(doctorEmail) {
  return getPatients().filter(p => p.doctorEmail === doctorEmail);
}

function savePatient(patient) {
  const patients = getPatients();
  patients.push(patient);
  localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
}

function findPatientByPhone(phone, doctorEmail) {
  return getDoctorPatients(doctorEmail).find(p => p.phone === phone);
}

// ---------- Visit Helpers ----------

function getVisits() {
  return JSON.parse(localStorage.getItem(VISITS_KEY) || '[]');
}

function getDoctorVisits(doctorEmail) {
  return getVisits().filter(v => v.doctorEmail === doctorEmail);
}

function getPatientVisits(patientPhone, doctorEmail) {
  return getDoctorVisits(doctorEmail)
    .filter(v => v.patientPhone === patientPhone)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function saveVisit(visit) {
  const visits = getVisits();
  visits.push(visit);
  localStorage.setItem(VISITS_KEY, JSON.stringify(visits));
}

function getVisitsToday(doctorEmail) {
  const today = new Date().toISOString().split('T')[0];
  return getDoctorVisits(doctorEmail).filter(v => v.date === today);
}

function getVisitsThisWeek(doctorEmail) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return getDoctorVisits(doctorEmail).filter(v => new Date(v.date) >= weekAgo);
}

function getVisitsThisMonth(doctorEmail) {
  const now = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth();
  return getDoctorVisits(doctorEmail).filter(v => {
    const d = new Date(v.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

function getTopSymptoms(doctorEmail) {
  const weekVisits = getVisitsThisWeek(doctorEmail);
  const counts = {};
  weekVisits.forEach(v => {
    (v.symptoms || []).forEach(s => { counts[s] = (counts[s] || 0) + 1; });
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
}

// ---------- Seed Data ----------

function seedData() {
  // Only seed if no patients exist
  if (getPatients().length > 0) return;

  const seedEmail = '__seed__@clinicos.demo';

  const patients = [
    { id: 'p1', name: 'Ravi Kumar',       phone: '9876543210', age: 34, gender: 'Male',   bloodGroup: 'B+', doctorEmail: seedEmail, createdAt: '2024-01-05' },
    { id: 'p2', name: 'Priya Sharma',     phone: '9123456789', age: 28, gender: 'Female', bloodGroup: 'A+', doctorEmail: seedEmail, createdAt: '2024-01-08' },
    { id: 'p3', name: 'Arjun Mehta',      phone: '9988776655', age: 52, gender: 'Male',   bloodGroup: 'O+', doctorEmail: seedEmail, createdAt: '2024-01-10' },
    { id: 'p4', name: 'Sunita Rao',       phone: '9871234560', age: 45, gender: 'Female', bloodGroup: 'AB+',doctorEmail: seedEmail, createdAt: '2024-01-12' },
    { id: 'p5', name: 'Kiran Patel',      phone: '9765432109', age: 29, gender: 'Male',   bloodGroup: 'B-', doctorEmail: seedEmail, createdAt: '2024-01-15' },
    { id: 'p6', name: 'Deepa Nair',       phone: '9654321098', age: 38, gender: 'Female', bloodGroup: 'O-', doctorEmail: seedEmail, createdAt: '2024-01-18' },
    { id: 'p7', name: 'Amit Singh',       phone: '9543210987', age: 61, gender: 'Male',   bloodGroup: 'A-', doctorEmail: seedEmail, createdAt: '2024-01-20' },
    { id: 'p8', name: 'Neha Gupta',       phone: '9432109876', age: 23, gender: 'Female', bloodGroup: 'B+', doctorEmail: seedEmail, createdAt: '2024-01-22' },
    { id: 'p9', name: 'Suresh Verma',     phone: '9321098765', age: 47, gender: 'Male',   bloodGroup: 'O+', doctorEmail: seedEmail, createdAt: '2024-01-25' },
    { id: 'p10',name: 'Anita Joshi',      phone: '9210987654', age: 55, gender: 'Female', bloodGroup: 'A+', doctorEmail: seedEmail, createdAt: '2024-01-28' },
    { id: 'p11',name: 'Rahul Desai',      phone: '9109876543', age: 31, gender: 'Male',   bloodGroup: 'AB-',doctorEmail: seedEmail, createdAt: '2024-02-01' },
    { id: 'p12',name: 'Kavitha Reddy',    phone: '8998887776', age: 42, gender: 'Female', bloodGroup: 'B+', doctorEmail: seedEmail, createdAt: '2024-02-03' },
    { id: 'p13',name: 'Mohan Krishnan',   phone: '8887776665', age: 68, gender: 'Male',   bloodGroup: 'O+', doctorEmail: seedEmail, createdAt: '2024-02-05' },
    { id: 'p14',name: 'Lakshmi Iyer',     phone: '8776665554', age: 36, gender: 'Female', bloodGroup: 'A+', doctorEmail: seedEmail, createdAt: '2024-02-07' },
    { id: 'p15',name: 'Vikram Bose',      phone: '8665554443', age: 50, gender: 'Male',   bloodGroup: 'B-', doctorEmail: seedEmail, createdAt: '2024-02-10' }
  ];

  const visits = [
    // Ravi Kumar
    { id:'v1',  patientPhone:'9876543210', patientName:'Ravi Kumar',    doctorEmail:seedEmail, date:'2024-02-10', symptoms:['Fever','Headache'],            diagnosis:'Viral fever',         prescription:[{medicine:'Paracetamol',dosage:'650mg',duration:'5 days',freq:'Twice daily'}] },
    { id:'v2',  patientPhone:'9876543210', patientName:'Ravi Kumar',    doctorEmail:seedEmail, date:'2024-03-15', symptoms:['Cough','Sore Throat'],          diagnosis:'Upper respiratory infection', prescription:[{medicine:'Azithromycin',dosage:'500mg',duration:'3 days',freq:'Once daily'}] },
    { id:'v3',  patientPhone:'9876543210', patientName:'Ravi Kumar',    doctorEmail:seedEmail, date:'2024-05-20', symptoms:['Stomach Pain','Nausea'],        diagnosis:'Gastritis',           prescription:[{medicine:'Omeprazole',dosage:'20mg',duration:'7 days',freq:'Once daily'},{medicine:'Pantoprazole',dosage:'40mg',duration:'7 days',freq:'Twice daily'}] },
    // Priya Sharma
    { id:'v4',  patientPhone:'9123456789', patientName:'Priya Sharma',  doctorEmail:seedEmail, date:'2024-01-20', symptoms:['Skin Rash','Itching'],          diagnosis:'Allergic reaction',   prescription:[{medicine:'Cetirizine',dosage:'10mg',duration:'5 days',freq:'Once daily'}] },
    { id:'v5',  patientPhone:'9123456789', patientName:'Priya Sharma',  doctorEmail:seedEmail, date:'2024-04-10', symptoms:['Fever','Body Pain','Fatigue'],   diagnosis:'Dengue fever (mild)', prescription:[{medicine:'Paracetamol',dosage:'500mg',duration:'5 days',freq:'Thrice daily'}] },
    // Arjun Mehta
    { id:'v6',  patientPhone:'9988776655', patientName:'Arjun Mehta',   doctorEmail:seedEmail, date:'2024-02-01', symptoms:['Chest Pain','Shortness of Breath'], diagnosis:'Hypertension checkup', prescription:[{medicine:'Amlodipine',dosage:'5mg',duration:'30 days',freq:'Once daily'}] },
    { id:'v7',  patientPhone:'9988776655', patientName:'Arjun Mehta',   doctorEmail:seedEmail, date:'2024-04-22', symptoms:['Dizziness','Headache'],          diagnosis:'Hypertension - follow up', prescription:[{medicine:'Losartan',dosage:'50mg',duration:'30 days',freq:'Once daily'},{medicine:'Amlodipine',dosage:'5mg',duration:'30 days',freq:'Once daily'}] },
    // Sunita Rao
    { id:'v8',  patientPhone:'9871234560', patientName:'Sunita Rao',    doctorEmail:seedEmail, date:'2024-02-14', symptoms:['Joint Pain','Back Pain'],        diagnosis:'Rheumatoid arthritis', prescription:[{medicine:'Diclofenac',dosage:'50mg',duration:'10 days',freq:'Twice daily'}] },
    { id:'v9',  patientPhone:'9871234560', patientName:'Sunita Rao',    doctorEmail:seedEmail, date:'2024-05-05', symptoms:['Fatigue','Loss of Appetite'],    diagnosis:'Vitamin D deficiency', prescription:[{medicine:'Vitamin D3',dosage:'60000IU',duration:'12 weeks',freq:'Once weekly'}] },
    // Kiran Patel
    { id:'v10', patientPhone:'9765432109', patientName:'Kiran Patel',   doctorEmail:seedEmail, date:'2024-03-08', symptoms:['Cough','Fever','Fatigue'],       diagnosis:'Bronchitis',          prescription:[{medicine:'Amoxicillin',dosage:'500mg',duration:'7 days',freq:'Thrice daily'}] },
    { id:'v11', patientPhone:'9765432109', patientName:'Kiran Patel',   doctorEmail:seedEmail, date:'2024-05-15', symptoms:['Shortness of Breath'],           diagnosis:'Mild asthma',         prescription:[{medicine:'Salbutamol',dosage:'4mg',duration:'14 days',freq:'Twice daily'},{medicine:'Montelukast',dosage:'10mg',duration:'30 days',freq:'Once daily'}] },
    // Deepa Nair
    { id:'v12', patientPhone:'9654321098', patientName:'Deepa Nair',    doctorEmail:seedEmail, date:'2024-02-28', symptoms:['Nausea','Vomiting','Stomach Pain'], diagnosis:'Gastroenteritis',  prescription:[{medicine:'Metronidazole',dosage:'400mg',duration:'5 days',freq:'Thrice daily'}] },
    { id:'v13', patientPhone:'9654321098', patientName:'Deepa Nair',    doctorEmail:seedEmail, date:'2024-04-18', symptoms:['Headache','Dizziness'],          diagnosis:'Migraine',            prescription:[{medicine:'Ibuprofen',dosage:'400mg',duration:'3 days',freq:'Twice daily'}] },
    // Amit Singh
    { id:'v14', patientPhone:'9543210987', patientName:'Amit Singh',    doctorEmail:seedEmail, date:'2024-01-30', symptoms:['Fatigue','Loss of Appetite'],    diagnosis:'Type 2 Diabetes review', prescription:[{medicine:'Metformin',dosage:'500mg',duration:'30 days',freq:'Twice daily'}] },
    { id:'v15', patientPhone:'9543210987', patientName:'Amit Singh',    doctorEmail:seedEmail, date:'2024-03-25', symptoms:['Body Pain','Fatigue'],           diagnosis:'Diabetic neuropathy', prescription:[{medicine:'Metformin',dosage:'850mg',duration:'30 days',freq:'Twice daily'},{medicine:'Vitamin D3',dosage:'1000IU',duration:'30 days',freq:'Once daily'}] },
    // Neha Gupta
    { id:'v16', patientPhone:'9432109876', patientName:'Neha Gupta',    doctorEmail:seedEmail, date:'2024-02-20', symptoms:['Sore Throat','Cold / Runny Nose','Fever'], diagnosis:'Common cold + pharyngitis', prescription:[{medicine:'Paracetamol',dosage:'500mg',duration:'3 days',freq:'Thrice daily'},{medicine:'Cetirizine',dosage:'10mg',duration:'5 days',freq:'Once daily'}] },
    { id:'v17', patientPhone:'9432109876', patientName:'Neha Gupta',    doctorEmail:seedEmail, date:'2024-05-12', symptoms:['Skin Rash'],                     diagnosis:'Contact dermatitis',  prescription:[{medicine:'Cetirizine',dosage:'10mg',duration:'7 days',freq:'Once daily'}] },
    // Suresh Verma
    { id:'v18', patientPhone:'9321098765', patientName:'Suresh Verma',  doctorEmail:seedEmail, date:'2024-03-01', symptoms:['Chest Pain','Dizziness'],        diagnosis:'Cardiac evaluation needed', prescription:[{medicine:'Atorvastatin',dosage:'20mg',duration:'30 days',freq:'Once daily'},{medicine:'Clopidogrel',dosage:'75mg',duration:'30 days',freq:'Once daily'}] },
    { id:'v19', patientPhone:'9321098765', patientName:'Suresh Verma',  doctorEmail:seedEmail, date:'2024-05-08', symptoms:['Headache','Fatigue'],            diagnosis:'Hyperlipidemia follow up', prescription:[{medicine:'Atorvastatin',dosage:'40mg',duration:'30 days',freq:'Once daily'}] },
    // Anita Joshi
    { id:'v20', patientPhone:'9210987654', patientName:'Anita Joshi',   doctorEmail:seedEmail, date:'2024-02-15', symptoms:['Fatigue','Loss of Appetite'],    diagnosis:'Hypothyroidism',      prescription:[{medicine:'Levothyroxine',dosage:'50mcg',duration:'90 days',freq:'Once daily (empty stomach)'}] },
    { id:'v21', patientPhone:'9210987654', patientName:'Anita Joshi',   doctorEmail:seedEmail, date:'2024-05-01', symptoms:['Body Pain','Fatigue'],           diagnosis:'Hypothyroidism follow up', prescription:[{medicine:'Levothyroxine',dosage:'100mcg',duration:'90 days',freq:'Once daily (empty stomach)'}] },
    // Rahul Desai
    { id:'v22', patientPhone:'9109876543', patientName:'Rahul Desai',   doctorEmail:seedEmail, date:'2024-03-10', symptoms:['Fever','Cough','Body Pain'],     diagnosis:'Influenza',           prescription:[{medicine:'Paracetamol',dosage:'650mg',duration:'5 days',freq:'Thrice daily'},{medicine:'Azithromycin',dosage:'500mg',duration:'3 days',freq:'Once daily'}] },
    { id:'v23', patientPhone:'9109876543', patientName:'Rahul Desai',   doctorEmail:seedEmail, date:'2024-04-30', symptoms:['Stomach Pain','Diarrhoea'],      diagnosis:'IBS flare',           prescription:[{medicine:'Metronidazole',dosage:'400mg',duration:'5 days',freq:'Thrice daily'}] },
    // Kavitha Reddy
    { id:'v24', patientPhone:'8998887776', patientName:'Kavitha Reddy', doctorEmail:seedEmail, date:'2024-02-22', symptoms:['Joint Pain','Skin Rash'],        diagnosis:'Psoriatic arthritis', prescription:[{medicine:'Diclofenac',dosage:'75mg',duration:'14 days',freq:'Twice daily'}] },
    { id:'v25', patientPhone:'8998887776', patientName:'Kavitha Reddy', doctorEmail:seedEmail, date:'2024-04-14', symptoms:['Back Pain','Fatigue'],            diagnosis:'Lumbar spondylosis',  prescription:[{medicine:'Ibuprofen',dosage:'400mg',duration:'7 days',freq:'Twice daily'}] },
    // Mohan Krishnan
    { id:'v26', patientPhone:'8887776665', patientName:'Mohan Krishnan',doctorEmail:seedEmail, date:'2024-02-18', symptoms:['Chest Pain','Shortness of Breath','Dizziness'], diagnosis:'Angina pectoris',  prescription:[{medicine:'Atorvastatin',dosage:'40mg',duration:'30 days',freq:'Once daily'},{medicine:'Clopidogrel',dosage:'75mg',duration:'30 days',freq:'Once daily'}] },
    { id:'v27', patientPhone:'8887776665', patientName:'Mohan Krishnan',doctorEmail:seedEmail, date:'2024-05-18', symptoms:['Headache','Fatigue'],            diagnosis:'Cardiac follow up',   prescription:[{medicine:'Amlodipine',dosage:'10mg',duration:'30 days',freq:'Once daily'}] },
    // Lakshmi Iyer
    { id:'v28', patientPhone:'8776665554', patientName:'Lakshmi Iyer',  doctorEmail:seedEmail, date:'2024-03-05', symptoms:['Nausea','Fatigue','Loss of Appetite'], diagnosis:'Anaemia',         prescription:[{medicine:'Vitamin D3',dosage:'2000IU',duration:'30 days',freq:'Once daily'}] },
    { id:'v29', patientPhone:'8776665554', patientName:'Lakshmi Iyer',  doctorEmail:seedEmail, date:'2024-05-22', symptoms:['Headache','Dizziness'],          diagnosis:'Iron deficiency anaemia follow up', prescription:[{medicine:'Vitamin D3',dosage:'2000IU',duration:'60 days',freq:'Once daily'}] },
    // Vikram Bose
    { id:'v30', patientPhone:'8665554443', patientName:'Vikram Bose',   doctorEmail:seedEmail, date:'2024-03-20', symptoms:['Back Pain','Body Pain'],         diagnosis:'Musculoskeletal pain', prescription:[{medicine:'Diclofenac',dosage:'50mg',duration:'5 days',freq:'Twice daily'},{medicine:'Ibuprofen',dosage:'400mg',duration:'5 days',freq:'Twice daily'}] },
    { id:'v31', patientPhone:'8665554443', patientName:'Vikram Bose',   doctorEmail:seedEmail, date:'2024-05-25', symptoms:['Cough','Cold / Runny Nose'],     diagnosis:'URTI',                prescription:[{medicine:'Azithromycin',dosage:'250mg',duration:'5 days',freq:'Once daily'}] }
  ];

  localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
  localStorage.setItem(VISITS_KEY, JSON.stringify(visits));
}

// ---------- Utils ----------

function generateId(prefix) {
  return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

const SPECIALISATIONS = [
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'ENT Specialist',
  'Gastroenterologist',
  'Gynaecologist',
  'Neurologist',
  'Oncologist',
  'Ophthalmologist',
  'Orthopaedic Surgeon',
  'Paediatrician',
  'Psychiatrist',
  'Pulmonologist',
  'Radiologist',
  'Rheumatologist',
  'Urologist',
  'Endocrinologist',
  'Nephrologist',
  'Haematologist',
  'Anaesthesiologist'
];
