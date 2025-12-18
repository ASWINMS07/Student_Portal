🎓 Student Portal
Prerequisite Document
📌 Project Overview

The Student Portal is a web-based academic management system developed using the MERN stack (MongoDB, Express.js, React.js, Node.js).
It provides a centralized platform for students and administrators to manage academic information digitally, improving transparency, efficiency, and accessibility.

The portal supports role-based access, ensuring students and admins have clearly separated responsibilities.

🔐 User Authentication System

Secure Registration: Students and admins can register using validated credentials

Role-Based Login: Users select role (Student / Admin) during authentication

JWT Authentication: Token-based authentication for secure sessions

Password Protection: Encrypted password storage using bcrypt

Session Management: Protected routes and secure logout functionality

🧑‍🎓 Student Dashboard

After login, students are redirected to their personalized dashboard where they can:

View and update personal profile details

Track subject-wise attendance

View semester-wise marks and grades

Check fee payment status

Access enrolled course details

View weekly timetable

Students have view-only access to academic records and cannot modify system-assigned data.

📋 Student Profile Management

View personal details such as name, email, department, and student ID

Update editable information like contact details

Student role and ID are protected and cannot be modified

📊 Attendance Management

Subject-wise attendance percentage display

Overall attendance summary

Read-only access for students

Attendance data assigned and updated by Admin

📝 Marks & Grades Section

Semester-wise academic performance

Subject-wise internal and external marks

Total marks and grades

Automatically updated based on admin entries

💰 Fees Status Tracking

Semester-wise fee details

Paid and pending fee status

Due dates and payment information

Data managed by admin and visible to students

📚 Courses Information

List of enrolled courses

Course code and course name

Credit details

Faculty information (if available)

🗓️ Timetable Management

Weekly class schedule

Day-wise subject allocation

Period and timing details

Clean grid-based layout for easy reference

🧑‍💼 Admin Dashboard

Admins have a dedicated dashboard with full system control, including:

Viewing all registered students

Managing student profiles

Assigning and updating attendance

Entering and modifying marks

Managing fee details

Monitoring academic data centrally

🛠️ Admin Academic Controls

Attendance Assignment: Update subject-wise attendance

Marks Management: Enter and edit exam marks and grades

Fees Management: Update payment status and semester details

Real-Time Sync: All updates reflect instantly in student dashboards

🔄 Data Consistency & CRUD Operations

Centralized data storage for student records

Proper CRUD operations for student data

Duplicate registrations prevented

Admin updates directly modify shared data source

Student dashboards fetch real-time updated data

🎨 User Interface & Experience

Clean and modern UI using Tailwind CSS

Fully responsive design (mobile, tablet, desktop)

Role-based dashboards with clear navigation

Consistent design language across pages

🔐 Security Features

JWT-based authentication

Role-based access control

Protected API routes

Input validation on forms

Secure handling of user data

🧱 Technical Architecture
Frontend (React.js)

Component-based architecture

React Hooks for state management

React Router for navigation

Tailwind CSS for styling

Form validation and error handling

Backend (Node.js & Express.js)

RESTful API structure

Authentication middleware

Role-based authorization

Centralized data handling

Database (MongoDB)

User schema with role separation

Student profile schema

Academic records schema (attendance, marks, fees)

Optimized data retrieval and updates

⚙️ Development Environment

Local development setup using npm

MongoDB local database (DB-ready architecture)

Environment variable configuration

Modular service-based architecture

🚀 Future Enhancements

Cloud database integration

Email notifications

Analytics dashboard

Audit logs for admin actions

Deployment to production servers

👨‍🎓 Student Details

Name: Aswin M S
Department: CSE (Cyber Security)
