# ClinicOS — Clinic Patient Record System

A complete clinic management system for doctors to register patients, record visit details, build prescriptions, and access full patient history.

## 🚀 Features

- **Signup & Login** — Each doctor creates their own account (no API key or backend needed)
- **Doctor profiles** — Specialisation, hospital name shown on login and in the app sidebar
- **Data isolation** — Each doctor sees only their own patients and visits
- **Forgot password** — Reset via registered email address
- **Patient Registration** — Name, phone (unique ID), age, gender, blood group
- **Visit Recording** — Date, symptoms (chip selector + free text), diagnosis, doctor notes
- **Prescription Builder** — Select medicine → dosage → frequency → duration; add multiple rows
- **Patient History** — Full visit history in reverse chronological order with complete prescriptions
- **Dashboard** — Total patients, total visits, visits today, this week, top symptoms chart, recent feed

## 📁 Project Structure

```
clinicos/
├── index.html          ← Main app (dashboard, patients, register, visit tabs)
├── login.html          ← Login page
├── signup.html         ← Signup page
├── css/
│   └── styles.css      ← Full design system (navy + jade palette)
├── js/
│   ├── data.js         ← localStorage helpers, seed data, constants
│   ├── auth.js         ← Signup, login, forgot password logic
│   ├── app.js          ← Shell, sidebar, navigation
│   ├── dashboard.js    ← Metrics and recent feed
│   ├── patients.js     ← Patient grid, search, history modal
│   └── visits.js       ← Register form + visit recording
├── data/
│   ├── medicines.json  ← 20 medicines with dosage options
│   └── symptoms.json   ← 18 common symptoms
└── README.md
```

## 🛠 How to Run Locally

**Option 1 — VS Code Live Server (recommended)**
1. Open the `clinicos/` folder in VS Code
2. Install the **Live Server** extension (ritwickdey.LiveServer)
3. Right-click `index.html` → **Open with Live Server**
4. Browser opens automatically at `http://127.0.0.1:5500/index.html`

**Option 2 — Python HTTP server**
```bash
cd clinicos
python -m http.server 8080
# Open http://localhost:8080/signup.html
```

## 🔑 First Time Use

1. Open `signup.html` → create your doctor account
2. Go to `login.html` → enter email + password + select your specialisation + hospital name
3. Dashboard loads with 15 sample patients and 30+ visits pre-loaded for testing

## ✅ Test Cases

| Test Input | Expected Output |
|---|---|
| Signup with same email twice | "Email already registered" error |
| Signup with invalid phone | "Valid 10-digit number" error |
| Passwords don't match | "Passwords do not match" error |
| Login with wrong password | "Incorrect email or password" error |
| Forgot password with unregistered email | "No account found" error |
| Search "Ravi" in Patients | Shows Ravi Kumar card with 3 visits |
| Click patient card | Modal opens with full visit history |
| Register patient with existing phone | Duplicate phone error shown |
| Record visit without selecting patient | Toast: "Please select a patient first" |
| Record visit without diagnosis | Toast: "Please enter a diagnosis" |
| Record visit without symptoms | Toast: "Please select at least one symptom" |
| Add medicine without all fields | Toast: "Fill all prescription fields" |
| Save valid visit → open patient | Visit appears at top of history |
| Dashboard after recording visit | Visit counts increment |

## 👥 Team Members

- Member 1: _______________
- Member 2: _______________
- Member 3: _______________
- Member 4: _______________
- Member 5: _______________

## 📌 Data Privacy Note

This project uses fictional sample data only. All data is stored in browser localStorage — no data is sent to any server. Do not enter real patient information.
