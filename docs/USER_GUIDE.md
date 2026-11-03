# EduTrack Pro — User Guide

> Step-by-step guide for all three user roles: Admin, Faculty, and Student.

---

## Getting Started

### Accessing the Application

1. Open your browser and navigate to `http://localhost:5173`
2. You will be redirected to the **Login Page**
3. Enter your email and password
4. You will be automatically redirected to your role-specific dashboard

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@edutrack.edu | Admin@123 |
| **Faculty** | faculty@edutrack.edu | Faculty@123 |
| **Student** | student@edutrack.edu | Student@123 |

---

## 👤 Admin Guide

### Admin Dashboard

After login, the Admin sees a live dashboard with:

- **Total Students** — count of all active registered students
- **Total Faculty** — count of all faculty members
- **Total Departments** — number of academic departments
- **Active Enrollments** — count of current semester enrollments
- **Attendance Rate** — system-wide attendance average
- **Recent Activity** — latest audit log entries

Charts include:
- Department enrollment distribution (bar chart)
- Attendance trends over time (line chart)
- Grade distribution (pie chart)

---

### Student Management

**Location:** Sidebar → Students

#### View Students
- The table shows all students with roll number, name, department, semester, status
- Use the **search bar** to find students by name, roll number, or email
- Filter by **Department**, **Semester**, or **Status** using dropdowns
- Paginate through results using the page controls

#### Add a New Student
1. Click **+ Add Student**
2. Fill in the modal form:
   - Email (must be unique — creates a new login)
   - Temporary Password
   - First Name, Last Name
   - Roll Number (must be unique)
   - Department, Semester
   - Admission Date, Date of Birth, Gender, Phone
3. Click **Create Student**
4. The student can now log in with the provided email and password

#### Edit a Student
1. Click the **Edit** (pencil) icon on any student row
2. Update fields in the modal (email and roll number cannot be changed)
3. Click **Update**

#### Change Academic Status
1. Click the **Status** dropdown on the student row
2. Select: Active / Suspended / Graduated / Withdrawn
3. Confirm — this calls `sp_update_student_status` which logs the change

#### Export Students to CSV
- Click **Export CSV** button at the top right of the student list
- Browser downloads `students_directory.csv` directly from the server

---

### Faculty Management

**Location:** Sidebar → Faculty

#### View Faculty
- Table shows employee ID, name, department, designation
- Search and filter available

#### Add Faculty
1. Click **+ Add Faculty**
2. Fill in: Email, Password, Employee ID, First/Last Name, Department, Designation, Phone, Date of Joining
3. Click **Create Faculty**

#### Edit Faculty
- Click the edit icon → update fields in modal → Save

---

### Department Management

**Location:** Sidebar → Departments

#### View Departments
- Card view showing department code, name, student count, faculty count

#### Add Department
1. Click **+ Add Department**
2. Enter: Department Code (e.g., `CS`), Department Name, optional Description
3. Click **Create**

#### Edit/Delete Department
- Edit: Click the pencil icon on any department card
- Delete: Click the trash icon (only allowed if no students/faculty are assigned — FK constraint enforced)

---

### Course Management

**Location:** Sidebar → Courses

Two tabs: **Course Catalog** and **Course Offerings**

#### Course Catalog
- View all courses with code, name, department, credit hours, type
- Add course: Code, Name, Department, Credit Hours (1–6), Type (Core/Elective/Lab)
- Edit existing courses via edit icon

#### Course Offerings (Sections)
- View offerings: which course, which term, which faculty, section name, capacity, enrolled count
- Add offering: Select Course, Term, Faculty (optional), Section Name, Max Capacity, Schedule details
- Edit offering: Update faculty assignment, schedule, room

---

### Academic Term Management

**Location:** Sidebar → Academic Terms

#### View Terms
- Table shows term code, name, academic year, type, dates, status

#### Add Term
1. Click **+ New Term**
2. Fill in: Term Code (e.g., `FALL2026`), Term Name, Academic Year, Semester Type (Fall/Spring/Summer), Start Date, End Date
3. Toggle **Set as Active** if this should be the current term
4. Click **Create** — if active is set, all other terms are deactivated in a single transaction

#### Edit Term
- Update name, dates, or toggle active/completed status
- **Warning:** Setting a term inactive that has active enrollments may affect student dashboards

---

### Enrollment Management

**Location:** Sidebar → Enrollments

#### View Enrollments
- Filter by student, course offering, term, or status
- Each row shows student name, course, section, term, enrollment date, status

#### Enroll a Student
1. Click **+ Enroll Student**
2. Select: Student, Course Offering (section), Enrollment Date
3. Click **Enroll** — triggers `sp_enroll_student` stored procedure
   - Checks capacity (SELECT FOR UPDATE prevents race conditions)
   - Verifies student is Active and not already enrolled
   - Creates attendance record placeholders automatically

#### Change Enrollment Status
- Click **Status** dropdown → Enrolled / Dropped / Completed / Failed

---

### Attendance Management

**Location:** Sidebar → Attendance

#### Create an Attendance Session
1. Select a **Course Offering** from the dropdown
2. Click **+ New Session**
3. Fill in: Session Date, Session Type (Lecture/Lab/Tutorial), optional Topic Covered
4. Click **Create Session**

#### Record Attendance
1. Click on any session row to open it
2. The attendance sheet shows all enrolled students
3. For each student, select: Present / Absent / Late / Excused
4. Optionally add remarks
5. Click **Save Attendance** — uses `sp_record_attendance_bulk`

---

### Examination Management

**Location:** Sidebar → Examinations

#### Create an Exam
1. Click **+ New Exam**
2. Fill in:
   - Course Offering (section)
   - Exam Name, Exam Type (Quiz/Midterm/Final/Assignment/Lab)
   - Exam Date, Max Marks, Passing Marks, Weightage (%)
3. Click **Create**

#### Publish an Exam
- Click the **Publish** button on an exam row
- Students can see the exam on their dashboard only after publishing

#### Delete an Exam
- Click the trash icon (only allowed for unpublished exams with no results)

---

### Results & Marks Entry

**Location:** Sidebar → Results → Marks Entry

#### Enter Marks for an Exam
1. Navigate to **Marks Entry**
2. Select the **Exam** from the dropdown
3. The marksheet shows all enrolled students with empty marks fields
4. Enter marks for each student (validated against max_marks)
5. Click **Save All Marks** — bulk saves via API
6. Grade letters are automatically computed by `fn_get_grade_letter`

#### View Results
- Navigate to **Results** tab
- Filter by course offering, term, or student
- View per-student marks, grade letters, pass/fail status

---

### Academic Analytics

**Location:** Sidebar → Analytics

Four tabs of real-time analytics:
- **Overview** — system-wide KPIs and trends
- **Departments** — comparison bar chart of avg score per department
- **Attendance** — attendance trend charts, per-department breakdown
- **Performance** — grade distribution pie chart, top performers
- **Rankings** — student performance table ranked by score (DENSE_RANK)

All data is fetched live from MySQL — no hardcoded values.

---

### Audit Logs

**Location:** Sidebar → Audit Logs

- View all system events: logins, student creation, status changes, etc.
- Filter by **user**, **action type**, or **date range**
- Each row shows: timestamp, user email, action, entity affected, IP address
- Paginated (20 per page)

---

### Notifications

**Location:** Sidebar → Notifications (or bell icon in navbar)

- View all notifications sent to your account
- Click **Mark all read** to clear unread count
- Unread notifications shown with blue dot indicator

---

### Profile & Settings

**Location:** Top navbar → Your Name → My Profile / Settings

#### Profile
- View and update: First/Last Name, Phone
- Email cannot be changed (it's the login identifier)

#### Change Password
- Enter Current Password, New Password, Confirm New Password
- Password validated: minimum 8 chars, bcrypt hashed before storing

#### Settings
- System preferences (theme, notifications preferences)

---

## 👨‍🏫 Faculty Guide

### Faculty Dashboard

After login, Faculty sees:

- **My Courses** — sections assigned to them this term
- **Today's Sessions** — attendance sessions due today
- **Upcoming Exams** — exams scheduled for their courses
- **Quick stats** — student count per course, avg attendance

---

### Taking Attendance (Faculty)

1. Navigate to **Attendance** in the sidebar
2. Select your **course section** from the dropdown
3. View existing sessions or click **+ New Session** to create one
4. Click on any session → mark each student Present/Absent/Late/Excused
5. Save

> You can only manage attendance for sections assigned to you.

---

### Entering Marks (Faculty)

1. Navigate to **Marks Entry** in the sidebar
2. Select your **exam** from the dropdown (only your exams shown)
3. Enter marks for each student in the table
4. Click **Save All Marks**

---

### Viewing Results (Faculty)

1. Navigate to **Results** in the sidebar
2. Your course results are shown — filter by exam or student
3. Finalized results (locked) are shown with a lock icon

---

## 🎓 Student Guide

### Student Dashboard

After login, Students see:

- **Enrolled Courses** — all courses enrolled in this term
- **Attendance Summary** — percentage per course with color coding
  - 🟢 ≥75% — Good
  - 🟡 60–74% — At Risk
  - 🔴 <60% — Danger
- **GPA** — computed from all results
- **Upcoming Exams** — scheduled exams for enrolled courses
- **Recent Results** — latest marks received

---

### Viewing My Courses

1. Go to **Dashboard** — enrolled courses are listed in a card grid
2. Each card shows: course name, section, faculty name, schedule, credit hours

---

### Viewing Attendance

1. Navigate to **Attendance** (or view on dashboard)
2. See per-course attendance breakdown:
   - Total sessions held
   - Sessions attended / excused / absent
   - Attendance percentage

> Excused sessions are excluded from the denominator by university policy.

---

### Viewing Results

1. Navigate to **Results** in the sidebar
2. View your exam results per course:
   - Marks obtained vs max marks
   - Grade letter (A+/A/B/C/D/F)
   - Pass/Fail status

---

### Notifications

1. Click the 🔔 bell icon in the top navbar
2. A popover shows recent unread notifications
3. Click **View all notifications** for full list
4. Click **Mark all read** to clear unread count

---

### My Profile

1. Click your name in the top navbar → **My Profile**
2. Update your phone number or personal info
3. Navigate to **Settings** to change your password

---

## 🧭 Navigation Guide

### Sidebar Navigation

The sidebar on the left shows role-specific navigation links. It can be collapsed using the toggle button to give more screen space.

| Role | Available Sections |
|------|--------------------|
| Admin | Dashboard, Students, Faculty, Departments, Courses, Terms, Enrollments, Attendance, Examinations, Results, Analytics, Notifications, Audit Logs, Settings |
| Faculty | Dashboard, Attendance, Marks Entry, Results, Notifications |
| Student | Dashboard, Attendance, Results, Notifications, Profile |

### Breadcrumb Navigation

The top navbar shows your current location as a breadcrumb trail (e.g., `EduTrack > Admin > Students`). Click any segment to navigate back.

### Active Term Pill

The top navbar shows the currently active academic term (e.g., `Fall 2026 (Active)`). This is fetched live from the database.

---

## ⚠️ Common Issues

| Problem | Solution |
|---------|----------|
| Login fails | Verify email/password. Check MySQL is running with seeded data. |
| Dashboard shows empty data | Run `npm run db:migrate` in `/server` then seed with `07_sample_data.sql` |
| Cannot enroll student | Check: student is Active, offering has capacity, not already enrolled |
| Cannot delete department | Move all students/faculty to another department first |
| Session expired message | Log in again — JWT tokens expire after 24 hours |
| CSV export opens blank | Check backend server is running on port 5000 |

