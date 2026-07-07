# 🎓 Attendance Portal

A cloud-based full-stack Attendance Management System built using **React**, **FastAPI**, and **Neon PostgreSQL**. The application provides secure role-based access for Students and Attendance Representatives, enabling attendance management, timetable viewing, subject-wise analytics, reporting, and OTP-based password recovery.

## 🚀 Live Deployment

- **Frontend:** https://ss2022-attendance-portal.vercel.app
- **Backend:** https://ssattendancetracker.onrender.com

> Replace the above URLs with your deployed application links.

---

## ✨ Features

### 👨‍🎓 Student Portal
- Secure JWT Authentication
- OTP-based Forgot Password via Email
- Subject-wise Attendance Tracking
- Dual Attendance Percentage
  - OD treated as Present
  - OD treated as Absent
- Attendance History
- Static & Actual Timetable
- Weekly Timetable View
- Responsive Dashboard
- Light & Dark Mode

### 👨‍💼 Attendance Representative Portal
- Mark and Update Attendance
- Student Lookup
- Subject-wise Attendance Reports
- Attendance Analytics
- Attendance Shortage Filters
- Search Students by Name or Register Number
- View Student Attendance History
- Responsive Dashboard

### 📚 Academic Features
- Subject Management
- Faculty Management
- Class Management
- Timetable Management
- Attendance Session Management
- Elective Subject Mapping
- Support for Theory, Lab, Elective Theory, Elective Lab, and Activity subjects
- Dynamic attendance calculations

---

## 🛠️ Tech Stack

### Frontend
- React
- React Router
- TanStack Query
- Tailwind CSS
- Axios

### Backend
- FastAPI
- SQLAlchemy
- Alembic
- JWT Authentication
- SMTP Email (OTP)

### Database
- Neon PostgreSQL

### Deployment
- Frontend: Vercel
- Backend: Render
- Database: Neon PostgreSQL

---

## 📂 Project Structure

```text
Attendance-Tracker/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── app/
│   ├── alembic/
│   ├── requirements.txt
│   └── main.py
│
└── README.md
```

---

## 🔐 Authentication

- JWT-based Login
- Role-Based Authorization
- Email OTP Verification
- Secure Password Reset

---

## 📊 Attendance Features

- Subject-wise Attendance
- Attendance History
- Attendance Percentage
- OD Handling
- Attendance Projection
- Lab Double-Hour Support
- Elective Subject Support

---

## 📱 Responsive Design

The application is fully responsive and optimized for:

- Mobile Phones
- Tablets
- Laptops
- Desktop Browsers

Supports both **Light Mode** and **Dark Mode**.

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/<your-username>/Attendance-Tracker.git
cd Attendance-Tracker
```

### Backend

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend

npm install

npm run dev
```

---

## 🌐 Deployment Architecture

```text
Students / Attendance Representatives
                │
                ▼
        Vercel (React)
                │
                ▼
      Render (FastAPI API)
                │
                ▼
     Neon PostgreSQL Database
```

---

## 📄 License

This project is developed for academic purposes at **Coimbatore Institute of Technology (CIT)**.
