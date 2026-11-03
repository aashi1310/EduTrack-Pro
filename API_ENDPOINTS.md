# EduTrack Pro — Complete REST API Reference Manual

> **Base URL:** `http://localhost:5000/api`  
> **Protocol:** HTTP/1.1 & JSON  
> **Authentication Header:** `Authorization: Bearer <JWT_TOKEN>`  
> **Global Response Structure:** All responses follow a standardized JSON envelope.

```json
// Standardized Success Response
{
  "success": true,
  "message": "Human-readable status description",
  "data": { ... } | [ ... ] | null,
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}

// Standardized Error Response
{
  "success": false,
  "message": "Error description message",
  "status": 400 | 401 | 403 | 404 | 409 | 500
}
```

---

## Table of Contents
1. [Health & Diagnostics](#1-health--diagnostics)
2. [Authentication Module (`/auth`)](#2-authentication-module-auth)
3. [Dashboard Module (`/dashboard`)](#3-dashboard-module-dashboard)
4. [Students Module (`/students`)](#4-students-module-students)
5. [Faculty Module (`/faculty`)](#5-faculty-module-faculty)
6. [Departments Module (`/departments`)](#6-departments-module-departments)
7. [Courses & Offerings Module (`/courses`)](#7-courses--offerings-module-courses)
8. [Academic Terms Module (`/terms`)](#8-academic-terms-module-terms)
9. [Enrollments Module (`/enrollments`)](#9-enrollments-module-enrollments)
10. [Attendance Module (`/attendance`)](#10-attendance-module-attendance)
11. [Examinations Module (`/exams`)](#11-examinations-module-exams)
12. [Results & Marksheet Module (`/results`)](#12-results--marksheet-module-results)
13. [Academic Analytics Module (`/analytics`)](#13-academic-analytics-module-analytics)
14. [Notifications Module (`/notifications`)](#14-notifications-module-notifications)
15. [Audit Logs Module (`/audit-logs`)](#15-audit-logs-module-audit-logs)
16. [User Profile & Password Module (`/profile`)](#16-user-profile--password-module-profile)

---

## 1. Health & Diagnostics

### `GET /api/health`
Checks the live API status and verifies database connectivity with MySQL.
- **Controller File:** `server/src/routes/index.js`
- **Auth Required:** No (Public endpoint)
- **Role:** All / Unauthenticated
- **Query / Body:** None
- **Response `200 OK`:**
```json
{
  "status": "ONLINE",
  "system": "EduTrack Pro — Academic Management & Analytics Backend",
  "timestamp": "2026-11-03T02:46:00.000Z",
  "database": {
    "connected": true,
    "mysql_version": "8.4.0",
    "server_time": "2026-11-03T02:46:00.000Z"
  }
}
```
- **Response `503 Service Unavailable`:** Database unreachable.

---

## 2. Authentication Module (`/auth`)

### `POST /api/auth/login`
Authenticates user credentials and issues a signed JWT token.
- **Controller File:** `server/src/modules/auth/auth.controller.js` (`login`)
- **Auth Required:** No
- **Role:** Public
- **Request Body:**
```json
{
  "email": "admin@edutrack.edu",
  "password": "Admin@123"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": 1,
      "email": "admin@edutrack.edu",
      "role": "ADMIN",
      "name": "System Administrator",
      "studentId": null,
      "rollNumber": null,
      "facultyId": null,
      "employeeCode": null
    }
  }
}
```
- **Errors:** `400 Bad Request` (Missing fields), `401 Unauthorized` (Invalid credentials), `403 Forbidden` (Account deactivated).

---

### `POST /api/auth/logout`
Invalidates active client-side session and acknowledges logout.
- **Controller File:** `server/src/modules/auth/auth.controller.js` (`logout`)
- **Auth Required:** Yes (`Bearer <token>`)
- **Role:** `ADMIN`, `FACULTY`, `STUDENT`
- **Request Body:** None
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

---

### `GET /api/auth/me`
Retrieves authenticated user profile metadata, role designation, and departmental affiliation.
- **Controller File:** `server/src/modules/auth/auth.controller.js` (`getMe`)
- **Auth Required:** Yes
- **Role:** `ADMIN`, `FACULTY`, `STUDENT`
- **Query / Body:** None
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "userId": 3,
    "email": "student@edutrack.edu",
    "role": "STUDENT",
    "name": "Jane Smith",
    "studentId": 1,
    "rollNumber": "CS2026001",
    "semester": 4,
    "academicStatus": "Active",
    "department": "Computer Science & Engineering",
    "lastLogin": "2026-11-02T18:30:00.000Z"
  }
}
```

---

## 3. Dashboard Module (`/dashboard`)

### `GET /api/dashboard/admin`
Fetches high-level institutional statistics, enrollment trends, grade distributions, and recent audit activity.
- **Controller File:** `server/src/modules/dashboard/dashboard.controller.js` (`getAdminDashboard`)
- **Auth Required:** Yes
- **Role:** `ADMIN`
- **Query Parameters:** `departmentId` *(optional)*, `termId` *(optional)*
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Admin dashboard loaded successfully",
  "data": {
    "statistics": {
      "total_students": 120,
      "total_faculty": 18,
      "total_courses": 32,
      "total_departments": 4,
      "active_offerings": 14,
      "average_attendance": 86.2
    },
    "departmentDistribution": [
      { "department_code": "CSE", "department_name": "Computer Science & Engineering", "student_count": 60 }
    ],
    "gradeDistribution": [
      { "grade": "A+", "description": "Outstanding", "count": 24 }
    ],
    "enrollmentTrends": [
      { "term_code": "FALL26", "term_name": "Fall 2026", "enrolled_students": 115, "total_course_enrollments": 480 }
    ],
    "attendanceTrends": [
      { "attendance_bracket": "90% - 100%", "student_count": 55 }
    ],
    "recentActivities": [
      { "audit_id": 41, "action_type": "LOGIN", "table_name": "users", "record_id": 1, "action_time": "2026-11-03T02:00:00.000Z", "user_email": "admin@edutrack.edu" }
    ],
    "recentStudents": [
      { "student_id": 15, "roll_number": "CS2026015", "full_name": "Alex Carter", "department_code": "CSE", "current_semester": 1, "academic_status": "Active" }
    ]
  }
}
```

---

### `GET /api/dashboard/faculty`
Loads assigned courses, student counts, upcoming exams, and attendance shortage alerts for the logged-in faculty member.
- **Controller File:** `server/src/modules/dashboard/dashboard.controller.js` (`getFacultyDashboard`)
- **Auth Required:** Yes
- **Role:** `FACULTY`, `ADMIN`
- **Query / Body:** None
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Faculty dashboard loaded successfully",
  "data": {
    "statistics": {
      "assigned_courses": 3,
      "total_students_taught": 85,
      "total_sessions_held": 24,
      "pending_evaluations": 1,
      "overall_avg_attendance": 88.5
    },
    "offerings": [
      {
        "offering_id": 1,
        "course_code": "CS101",
        "course_name": "Introduction to Computer Science",
        "section": "A",
        "capacity": 40,
        "enrolled_students": 38,
        "sessions_conducted": 12,
        "avg_course_attendance": 89.2
      }
    ],
    "exams": [
      { "exam_id": 3, "exam_name": "Midterm Examination", "exam_type": "Midterm", "exam_date": "2026-11-15", "status": "Draft", "marks_entered_count": 0 }
    ],
    "atRiskStudents": [
      { "student_id": 12, "roll_number": "CS2026012", "student_name": "David Miller", "course_code": "CS101", "attendance_percentage": 68.4 }
    ]
  }
}
```

---

### `GET /api/dashboard/student`
Fetches individual academic standing, enrolled course metrics, published exam marks, and notifications for the logged-in student.
- **Controller File:** `server/src/modules/dashboard/dashboard.controller.js` (`getStudentDashboard`)
- **Auth Required:** Yes
- **Role:** `STUDENT`, `ADMIN`
- **Query / Body:** None
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Student dashboard loaded successfully",
  "data": {
    "profile": {
      "student_id": 1,
      "roll_number": "CS2026001",
      "student_name": "Jane Smith",
      "department_code": "CSE",
      "department_name": "Computer Science & Engineering",
      "current_semester": 4,
      "academic_status": "Active",
      "cumulative_gpa": 3.85
    },
    "overallMetrics": {
      "overall_attendance": 92.4,
      "enrolled_courses_count": 5,
      "total_term_credits": 18
    },
    "enrolledCourses": [
      { "enrollment_id": 101, "course_code": "CS201", "course_name": "Data Structures", "credits": 4, "section": "A", "instructor": "Dr. Alan Turing", "attendance_percentage": 94.0, "attendance_status": "Normal" }
    ],
    "results": [
      { "result_id": 8, "exam_name": "Midterm Exam", "course_code": "CS201", "marks_obtained": 88.0, "max_marks": 100, "percentage": 88.0, "grade": "A" }
    ],
    "notifications": [
      { "notification_id": 5, "title": "Midterm Exam Published", "message": "Results for CS201 Midterm are out.", "type": "SUCCESS", "is_read": false, "created_at": "2026-11-01T10:00:00.000Z" }
    ]
  }
}
```

---

## 4. Students Module (`/students`)

### `GET /api/students`
Lists students with multi-field search, relational filtering, sorting, and pagination.
- **Controller File:** `server/src/modules/students/student.controller.js` (`getStudents`)
- **Auth Required:** Yes
- **Role:** `ADMIN`, `FACULTY`, `STUDENT`
- **Query Parameters:**
  - `search` *(string)*: Matches roll number, first name, last name, or email.
  - `departmentId` *(number)*: Filter by department ID.
  - `semester` *(number)*: Filter by current semester (1-8).
  - `status` *(string)*: `Active`, `Suspended`, `Graduated`, `Withdrawn`.
  - `page` *(number, default 1)*
  - `limit` *(number, default 10)*
  - `sortBy` *(string)*: `roll_number`, `full_name`, `department_code`, `current_semester`, `academic_status`, `admission_date`.
  - `sortOrder` *(string)*: `ASC` or `DESC`.
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Students retrieved successfully",
  "data": [
    {
      "student_id": 1,
      "roll_number": "CS2026001",
      "full_name": "Jane Smith",
      "email": "student@edutrack.edu",
      "department_id": 1,
      "department_code": "CSE",
      "department_name": "Computer Science & Engineering",
      "current_semester": 4,
      "academic_status": "Active",
      "calculated_gpa": 3.85
    }
  ],
  "pagination": { "total": 120, "page": 1, "limit": 10, "totalPages": 12 }
}
```

---

### `POST /api/students`
Registers a new student profile and provisions a linked user login account inside an atomic transaction.
- **Controller File:** `server/src/modules/students/student.controller.js` (`createStudent`)
- **Auth Required:** Yes
- **Role:** `ADMIN`
- **Request Body:**
```json
{
  "rollNumber": "CS2026050",
  "firstName": "Robert",
  "lastName": "Johnson",
  "email": "r.johnson@edutrack.edu",
  "departmentId": 1,
  "currentSemester": 1,
  "admissionDate": "2026-08-01",
  "dateOfBirth": "2005-04-12",
  "gender": "Male",
  "phone": "+1-555-0192",
  "password": "Password@123"
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Student created successfully",
  "data": { "studentId": 50, "userId": 152 }
}
```

---

### `GET /api/students/:id`
Retrieves a full 360-degree academic profile for a single student including course history, attendance, and exam marks.
- **Controller File:** `server/src/modules/students/student.controller.js` (`getStudentById`)
- **Auth Required:** Yes
- **Role:** `ADMIN`, `FACULTY`, `STUDENT`
- **Path Parameter:** `id` *(Student ID)*
- **Response `200 OK`:** Returns student metadata, enrolled courses list, attendance summary array, and published exam results array.

---

### `PATCH /api/students/:id`
Updates demographic or personal fields of a student.
- **Controller File:** `server/src/modules/students/student.controller.js` (`updateStudent`)
- **Auth Required:** Yes
- **Role:** `ADMIN`
- **Path Parameter:** `id` *(Student ID)*
- **Request Body:**
```json
{
  "firstName": "Robert",
  "lastName": "Johnson Jr.",
  "departmentId": 1,
  "currentSemester": 2,
  "phone": "+1-555-9988",
  "gender": "Male"
}
```
- **Response `200 OK`:** `{ "success": true, "message": "Student updated successfully", "data": null }`

---

### `PATCH /api/students/:id/status`
Updates a student's academic status via stored procedure `sp_update_student_status`.
- **Controller File:** `server/src/modules/students/student.controller.js` (`updateStudentStatus`)
- **Auth Required:** Yes
- **Role:** `ADMIN`
- **Path Parameter:** `id` *(Student ID)*
- **Request Body:**
```json
{
  "status": "Suspended" // Options: "Active", "Suspended", "Graduated", "Withdrawn"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Student academic status updated successfully",
  "data": { "studentId": 50, "newStatus": "Suspended" }
}
```

---

### `GET /api/students/export/csv`
Streams the complete student directory as a formatted RFC 4180 CSV attachment.
- **Controller File:** `server/src/modules/students/student.controller.js` (`exportStudentsCsv`)
- **Auth Required:** Yes
- **Role:** `ADMIN`, `FACULTY`
- **Response:** Content-Type: `text/csv; charset=utf-8` file download.

---

## 5. Faculty Module (`/faculty`)

### `GET /api/faculty`
Lists faculty instructors with department filtering, search, and assigned offering counts.
- **Controller File:** `server/src/modules/faculty/faculty.controller.js` (`getFacultyList`)
- **Auth Required:** Yes
- **Role:** `ADMIN`, `FACULTY`, `STUDENT`
- **Query Parameters:** `departmentId` *(number)*, `search` *(string)*, `status` *(boolean)*
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Faculty list retrieved successfully",
  "data": [
    {
      "faculty_id": 1,
      "employee_code": "FAC001",
      "full_name": "Dr. Alan Turing",
      "email": "faculty@edutrack.edu",
      "department_code": "CSE",
      "designation": "Professor",
      "is_active": 1,
      "assigned_courses_count": 2
    }
  ]
}
```

---

### `POST /api/faculty`
Registers a new faculty instructor and linked user login.
- **Controller File:** `server/src/modules/faculty/faculty.controller.js` (`createFaculty`)
- **Auth Required:** Yes
- **Role:** `ADMIN`
- **Request Body:**
```json
{
  "employeeCode": "FAC019",
  "firstName": "Ada",
  "lastName": "Lovelace",
  "email": "a.lovelace@edutrack.edu",
  "departmentId": 1,
  "designation": "Associate Professor",
  "joiningDate": "2026-09-01",
  "phone": "+1-555-0321",
  "password": "Faculty@123"
}
```
- **Response `201 Created`:** `{ "success": true, "message": "Faculty created successfully", "data": { "facultyId": 19, "userId": 153 } }`

---

### `GET /api/faculty/:id`
Fetches single faculty member record with current course offering allocations.
- **Controller File:** `server/src/modules/faculty/faculty.controller.js` (`getFacultyById`)
- **Auth Required:** Yes
- **Role:** `ADMIN`, `FACULTY`, `STUDENT`
- **Response `200 OK`:** Single faculty profile object + assigned offerings list.

---

### `PATCH /api/faculty/:id`
Updates faculty designation, phone, department, or active status.
- **Controller File:** `server/src/modules/faculty/faculty.controller.js` (`updateFaculty`)
- **Auth Required:** Yes
- **Role:** `ADMIN`
- **Response `200 OK`:** `{ "success": true, "message": "Faculty profile updated successfully", "data": null }`

---

## 6. Departments Module (`/departments`)

### `GET /api/departments`
Lists all academic departments with real-time student, faculty, course counts, and average attendance.
- **Controller File:** `server/src/modules/departments/dept.controller.js` (`getDepartments`)
- **Auth Required:** Yes
- **Role:** `ADMIN`, `FACULTY`, `STUDENT`
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Departments retrieved successfully",
  "data": [
    {
      "department_id": 1,
      "department_code": "CSE",
      "department_name": "Computer Science & Engineering",
      "description": "Department of Computing, AI and Software Engineering",
      "student_count": 60,
      "faculty_count": 8,
      "course_count": 12,
      "avg_attendance": 88.4
    }
  ]
}
```

---

### `POST /api/departments`
Creates a new academic department.
- **Controller File:** `server/src/modules/departments/dept.controller.js` (`createDepartment`)
- **Auth Required:** Yes
- **Role:** `ADMIN`
- **Request Body:**
```json
{
  "departmentCode": "MECH",
  "departmentName": "Mechanical Engineering",
  "description": "Thermodynamics, Robotics and Mechanical Design"
}
```
- **Response `201 Created`:** `{ "success": true, "message": "Department created successfully", "data": { "departmentId": 5 } }`

---

### `PATCH /api/departments/:id`
Updates department name or description.
- **Controller File:** `server/src/modules/departments/dept.controller.js` (`updateDepartment`)
- **Auth Required:** Yes
- **Role:** `ADMIN`
- **Response `200 OK`:** `{ "success": true, "message": "Department updated successfully" }`

---

### `DELETE /api/departments/:id`
Deletes an academic department, provided no dependent students, faculty, or courses exist.
- **Controller File:** `server/src/modules/departments/dept.controller.js` (`deleteDepartment`)
- **Auth Required:** Yes
- **Role:** `ADMIN`
- **Response `200 OK`:** `{ "success": true, "message": "Department deleted successfully" }`
- **Error `400 Bad Request`:** "Cannot delete department: dependent records exist (60 students, 8 faculty, 12 courses)."

---

## 7. Courses & Offerings Module (`/courses`)

### `GET /api/courses`
Lists the master course catalogue with credit and department filtering.
- **Controller File:** `server/src/modules/courses/course.controller.js` (`getCourses`)
- **Auth Required:** Yes
- **Role:** `ADMIN`, `FACULTY`, `STUDENT`
- **Query Parameters:** `departmentId`, `credits`, `search`
- **Response `200 OK`:** Course catalogue array.

---

### `POST /api/courses`
Registers a new course in the curriculum.
- **Controller File:** `server/src/modules/courses/course.controller.js` (`createCourse`)
- **Auth Required:** Yes
- **Role:** `ADMIN`
- **Request Body:**
```json
{
  "courseCode": "CS302",
  "courseName": "Operating Systems",
  "departmentId": 1,
  "credits": 4,
  "description": "Processes, Threads, Concurrency, and Memory Virtualization"
}
```
- **Response `201 Created`:** `{ "success": true, "message": "Course created successfully", "data": { "courseId": 22 } }`

---

### `PATCH /api/courses/:id`
Updates course catalogue attributes.
- **Controller File:** `server/src/modules/courses/course.controller.js` (`updateCourse`)
- **Auth Required:** Yes
- **Role:** `ADMIN`
- **Response `200 OK`:** `{ "success": true, "message": "Course updated successfully" }`

---

### `GET /api/courses/offerings`
Lists term-specific course offerings with section, instructor, capacity, and remaining seat counts.
- **Controller File:** `server/src/modules/courses/course.controller.js` (`getCourseOfferings`)
- **Auth Required:** Yes
- **Role:** `ADMIN`, `FACULTY`, `STUDENT`
- **Query Parameters:** `termId`, `facultyId`, `departmentId`, `status` (`Open`, `Closed`, `Cancelled`)
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Course offerings retrieved successfully",
  "data": [
    {
      "offering_id": 1,
      "course_code": "CS101",
      "course_name": "Introduction to Computer Science",
      "credits": 4,
      "term_code": "FALL26",
      "faculty_name": "Dr. Alan Turing",
      "section": "A",
      "capacity": 40,
      "offering_status": "Open",
      "enrolled_count": 38,
      "available_seats": 2,
      "total_sessions": 12,
      "total_exams": 2
    }
  ]
}
```

---

### `POST /api/courses/offerings`
Opens a new course section offering for a term.
- **Controller File:** `server/src/modules/courses/course.controller.js` (`createCourseOffering`)
- **Auth Required:** Yes
- **Role:** `ADMIN`
- **Request Body:**
```json
{
  "courseId": 1,
  "termId": 1,
  "facultyId": 1,
  "section": "B",
  "capacity": 35
}
```
- **Response `201 Created`:** `{ "success": true, "message": "Course offering created successfully", "data": { "offeringId": 15 } }`

---

### `PATCH /api/courses/offerings/:id`
Updates offering capacity, assigned faculty instructor, section identifier, or offering status.
- **Controller File:** `server/src/modules/courses/course.controller.js` (`updateCourseOffering`)
- **Auth Required:** Yes
- **Role:** `ADMIN`
- **Response `200 OK`:** `{ "success": true, "message": "Course offering updated successfully" }`

---

## 8. Academic Terms Module (`/terms`)

### `GET /api/terms`
Lists all academic terms, dates, active indicators, and enrolled student totals.
- **Controller File:** `server/src/modules/terms/term.controller.js` (`getTerms`)
- **Auth Required:** Yes
- **Role:** `ADMIN`, `FACULTY`, `STUDENT`
- **Response `200 OK`:** Array of academic terms.

---

### `POST /api/terms`
Creates an academic term. If `isActive` is true, automatically deactivates all other terms via transaction.
- **Controller File:** `server/src/modules/terms/term.controller.js` (`createTerm`)
- **Auth Required:** Yes
- **Role:** `ADMIN`
- **Request Body:**
```json
{
  "termCode": "SPRG27",
  "termName": "Spring 2027",
  "academicYear": "2026-2027",
  "semesterType": "Spring",
  "startDate": "2027-01-15",
  "endDate": "2027-05-30",
  "isActive": false
}
```
- **Response `201 Created`:** `{ "success": true, "message": "Academic term created successfully", "data": { "termId": 4 } }`

---

### `PATCH /api/terms/:id`
Updates term metadata or activates/completes a term.
- **Controller File:** `server/src/modules/terms/term.controller.js` (`updateTerm`)
- **Auth Required:** Yes
- **Role:** `ADMIN`
- **Response `200 OK`:** `{ "success": true, "message": "Academic term updated successfully" }`

---

## 9. Enrollments Module (`/enrollments`)

### `GET /api/enrollments`
Retrieves course enrollments. Students are automatically scoped to their own enrollments; Administrators and Faculty can filter by student, offering, or status.
- **Controller File:** `server/src/modules/enrollments/enrollment.controller.js` (`getEnrollments`)
- **Auth Required:** Yes
- **Role:** `ADMIN`, `FACULTY`, `STUDENT`
- **Query Parameters:** `studentId`, `offeringId`, `termId`, `status`
- **Response `200 OK`:** Array of enrollment objects joined with student, course, and attendance data.

---

### `POST /api/enrollments`
Enrolls a student in a course offering using ACID stored procedure `sp_enroll_student` with `SELECT FOR UPDATE` concurrency protection.
- **Controller File:** `server/src/modules/enrollments/enrollment.controller.js` (`enrollStudent`)
- **Auth Required:** Yes
- **Role:** `ADMIN`, `STUDENT`
- **Request Body:**
```json
{
  "studentId": 1, // Optional if role is STUDENT (uses authenticated studentId)
  "offeringId": 1
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Student successfully enrolled in course section",
  "data": { "studentId": 1, "offeringId": 1 }
}
```
- **Errors `400 Bad Request`:** "Section capacity exceeded", "Student is already enrolled", "Offering is not open for enrollment".

---

### `PATCH /api/enrollments/:id/status`
Updates enrollment lifecycle status (`Enrolled`, `Completed`, `Dropped`, `Withdrawn`).
- **Controller File:** `server/src/modules/enrollments/enrollment.controller.js` (`updateEnrollmentStatus`)
- **Auth Required:** Yes
- **Role:** `ADMIN`
- **Request Body:** `{ "status": "Dropped" }`
- **Response `200 OK`:** `{ "success": true, "message": "Enrollment status updated to Dropped" }`

---

## 10. Attendance Module (`/attendance`)

### `GET /api/attendance/sessions`
Retrieves class sessions conducted for a specific course offering.
- **Controller File:** `server/src/modules/attendance/attendance.controller.js` (`getOfferingSessions`)
- **Auth Required:** Yes
- **Role:** `ADMIN`, `FACULTY`, `STUDENT`
- **Query Parameters:** `offeringId` *(required)*
- **Response `200 OK`:** Sessions list with present, absent, late, and excused tallies.

---

### `POST /api/attendance/sessions`
Creates a new scheduled class session for an offering.
- **Controller File:** `server/src/modules/attendance/attendance.controller.js` (`createSession`)
- **Auth Required:** Yes
- **Role:** `FACULTY`, `ADMIN`
- **Request Body:**
```json
{
  "offeringId": 1,
  "sessionDate": "2026-11-03",
  "startTime": "09:00:00",
  "endTime": "10:30:00",
  "topic": "Binary Search Trees & AVL Balancing",
  "roomNumber": "LH-102"
}
```
- **Response `201 Created`:** `{ "success": true, "message": "Class session created successfully", "data": { "sessionId": 25 } }`

---

### `GET /api/attendance/sessions/:id/records`
Fetches all enrolled students and their attendance records for a specific session.
- **Controller File:** `server/src/modules/attendance/attendance.controller.js` (`getSessionAttendance`)
- **Auth Required:** Yes
- **Role:** `FACULTY`, `ADMIN`
- **Path Parameter:** `id` *(Session ID)*
- **Response `200 OK`:** Session details + array of enrolled students with attendance marks.

---

### `POST /api/attendance/sessions/:id/records`
Submits or updates attendance in batch for all students in a session via stored procedure `sp_record_attendance`.
- **Controller File:** `server/src/modules/attendance/attendance.controller.js` (`recordSessionAttendance`)
- **Auth Required:** Yes
- **Role:** `FACULTY`, `ADMIN`
- **Path Parameter:** `id` *(Session ID)*
- **Request Body:**
```json
{
  "records": [
    { "enrollmentId": 101, "status": "Present", "remarks": "On time" },
    { "enrollmentId": 102, "status": "Late", "remarks": "Arrived 15m late" },
    { "enrollmentId": 103, "status": "Absent", "remarks": null }
  ]
}
```
- **Response `200 OK`:** `{ "success": true, "message": "Attendance marked successfully for 3 students" }`

---

### `GET /api/attendance/summary`
Queries pre-compiled view `v_attendance_summary` returning attendance percentages and shortage classifications.
- **Controller File:** `server/src/modules/attendance/attendance.controller.js` (`getAttendanceSummary`)
- **Auth Required:** Yes
- **Role:** `ADMIN`, `FACULTY`, `STUDENT`
- **Query Parameters:** `offeringId`, `studentId`, `termId`, `status` (`Normal` | `Shortage`)
- **Response `200 OK`:** Array of attendance percentage summaries.

---

## 11. Examinations Module (`/exams`)

### `GET /api/exams`
Lists examinations. Students only see `Published` exams; Faculty see exams for their assigned offerings; Admins see all.
- **Controller File:** `server/src/modules/examinations/exam.controller.js` (`getExams`)
- **Auth Required:** Yes
- **Role:** `ADMIN`, `FACULTY`, `STUDENT`
- **Query Parameters:** `offeringId`, `status` (`Draft` | `Published`), `examType`, `facultyId`
- **Response `200 OK`:** Array of examinations with max marks, weightage, and completion counts.

---

### `POST /api/exams`
Creates a new examination in `Draft` status.
- **Controller File:** `server/src/modules/examinations/exam.controller.js` (`createExam`)
- **Auth Required:** Yes
- **Role:** `FACULTY`, `ADMIN`
- **Request Body:**
```json
{
  "offeringId": 1,
  "examName": "Quiz 2 — SQL Joins & Subqueries",
  "examType": "Quiz", // "Quiz", "Midterm", "Final", "Assignment", "Project"
  "examDate": "2026-11-20",
  "maxMarks": 50,
  "weightagePercentage": 15
}
```
- **Response `201 Created`:** `{ "success": true, "message": "Exam created successfully", "data": { "examId": 8 } }`

---

### `PATCH /api/exams/:id`
Updates draft exam details. Blocked if exam is already `Published`.
- **Controller File:** `server/src/modules/examinations/exam.controller.js` (`updateExam`)
- **Auth Required:** Yes
- **Role:** `FACULTY`, `ADMIN`
- **Response `200 OK`:** `{ "success": true, "message": "Exam updated successfully" }`

---

### `POST /api/exams/:id/publish`
Executes stored procedure `sp_publish_exam` to publish grades to students and create in-app notifications.
- **Controller File:** `server/src/modules/examinations/exam.controller.js` (`publishExam`)
- **Auth Required:** Yes
- **Role:** `FACULTY`, `ADMIN`
- **Path Parameter:** `id` *(Exam ID)*
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Exam and results published successfully to students",
  "data": { "examId": 8, "publishedResultsCount": 38 }
}
```

---

### `DELETE /api/exams/:id`
Deletes a draft exam. Published exams cannot be deleted.
- **Controller File:** `server/src/modules/examinations/exam.controller.js` (`deleteExam`)
- **Auth Required:** Yes
- **Role:** `FACULTY`, `ADMIN`
- **Response `200 OK`:** `{ "success": true, "message": "Draft exam deleted successfully" }`

---

## 12. Results & Marksheet Module (`/results`)

### `GET /api/results`
Retrieves exam results across offerings or students.
- **Controller File:** `server/src/modules/results/result.controller.js` (`getResults`)
- **Auth Required:** Yes
- **Role:** `ADMIN`, `FACULTY`, `STUDENT`
- **Query Parameters:** `examId`, `studentId`, `offeringId`, `isPublished`
- **Response `200 OK`:** Array of result records with marks obtained, letter grades, and percentages.

---

### `GET /api/results/exam/:id`
Loads the complete marksheet for an examination for faculty grading.
- **Controller File:** `server/src/modules/results/result.controller.js` (`getExamMarksheet`)
- **Auth Required:** Yes
- **Role:** `FACULTY`, `ADMIN`
- **Path Parameter:** `id` *(Exam ID)*
- **Response `200 OK`:** Exam metadata and student-by-student scores.

---

### `POST /api/results`
Saves or updates marks in batch. Triggers `trg_result_validate_insert` and `trg_result_validate_update` automatically validate scores against `max_marks` and calculate letter grades from `grade_rules`.
- **Controller File:** `server/src/modules/results/result.controller.js` (`saveMarks`)
- **Auth Required:** Yes
- **Role:** `FACULTY`, `ADMIN`
- **Request Body:**
```json
{
  "examId": 8,
  "entries": [
    { "enrollmentId": 101, "marksObtained": 46.5, "remarks": "Excellent analysis" },
    { "enrollmentId": 102, "marksObtained": 38.0, "remarks": "Review normalization" }
  ]
}
```
- **Response `200 OK`:** `{ "success": true, "message": "Marks saved successfully for 2 students" }`

---

### `PATCH /api/results/:id`
Updates an individual student result record.
- **Controller File:** `server/src/modules/results/result.controller.js` (`updateSingleResult`)
- **Auth Required:** Yes
- **Role:** `FACULTY`, `ADMIN`
- **Request Body:** `{ "marksObtained": 48.0, "remarks": "Re-evaluation addition" }`
- **Response `200 OK`:** `{ "success": true, "message": "Result updated successfully" }`

---

### `GET /api/results/student/:id`
Retrieves a student's published results, term report (via `sp_generate_semester_report`), cumulative GPA, and term GPA.
- **Controller File:** `server/src/modules/results/result.controller.js` (`getStudentResults`)
- **Auth Required:** Yes
- **Role:** `ADMIN`, `FACULTY`, `STUDENT`
- **Path Parameter:** `id` *(Student ID)*
- **Query Parameter:** `termId` *(optional)*
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "results": [ ... ],
    "semesterReport": [ ... ],
    "cumulativeGpa": 3.82,
    "termGpa": 3.90
  }
}
```

---

## 13. Academic Analytics Module (`/analytics`)

### `GET /api/analytics/overview`
Institution-wide KPIs, overall pass rate, and top performing courses.
- **Controller File:** `server/src/modules/analytics/analytics.controller.js` (`getAnalyticsOverview`)
- **Auth Required:** Yes
- **Role:** `ADMIN`, `FACULTY`, `STUDENT`
- **Response `200 OK`:** Institutional overview metrics and top courses list.

---

### `GET /api/analytics/departments`
Queries pre-compiled view `v_department_performance`.
- **Controller File:** `server/src/modules/analytics/analytics.controller.js` (`getDepartmentAnalytics`)
- **Auth Required:** Yes
- **Role:** `ADMIN`, `FACULTY`, `STUDENT`
- **Response `200 OK`:** Array of department performance summaries.

---

### `GET /api/analytics/attendance`
Attendance bracket distributions, student shortage rosters (< 75%), and course-level attendance averages.
- **Controller File:** `server/src/modules/analytics/analytics.controller.js` (`getAttendanceAnalytics`)
- **Auth Required:** Yes
- **Role:** `ADMIN`, `FACULTY`, `STUDENT`
- **Response `200 OK`:** Bracket counts, shortage students list, and course attendance averages.

---

### `GET /api/analytics/performance`
Grade point distribution across letter grades (`A+` to `F`) and course offering performance view `v_course_performance`.
- **Controller File:** `server/src/modules/analytics/analytics.controller.js` (`getPerformanceAnalytics`)
- **Auth Required:** Yes
- **Role:** `ADMIN`, `FACULTY`, `STUDENT`
- **Response `200 OK`:** Grade counts array and course performance array.

---

### `GET /api/analytics/rankings`
Computes top student rankings using MySQL Window Functions (`DENSE_RANK() OVER (...)`) for institutional rank and departmental rank.
- **Controller File:** `server/src/modules/analytics/analytics.controller.js` (`getStudentRankings`)
- **Auth Required:** Yes
- **Role:** `ADMIN`, `FACULTY`, `STUDENT`
- **Response `200 OK`:** Top 20 ranked students with cumulative GPAs and rank positions.

---

## 14. Notifications Module (`/notifications`)

### `GET /api/notifications`
Fetches user notifications and unread badge count.
- **Controller File:** `server/src/modules/notifications/notification.controller.js` (`getNotifications`)
- **Auth Required:** Yes
- **Role:** `ADMIN`, `FACULTY`, `STUDENT`
- **Response `200 OK`:** `{ "success": true, "data": { "notifications": [ ... ], "unreadCount": 3 } }`

---

### `PATCH /api/notifications/:id/read`
Marks an individual notification as read.
- **Controller File:** `server/src/modules/notifications/notification.controller.js` (`markAsRead`)
- **Auth Required:** Yes
- **Role:** `ADMIN`, `FACULTY`, `STUDENT`
- **Response `200 OK`:** `{ "success": true, "message": "Notification marked as read" }`

---

### `PATCH /api/notifications/read-all`
Marks all notifications for the authenticated user as read.
- **Controller File:** `server/src/modules/notifications/notification.controller.js` (`markAllAsRead`)
- **Auth Required:** Yes
- **Role:** `ADMIN`, `FACULTY`, `STUDENT`
- **Response `200 OK`:** `{ "success": true, "message": "All notifications marked as read" }`

---

## 15. Audit Logs Module (`/audit-logs`)

### `GET /api/audit-logs`
Queries system-wide audit trail with action type, table, date range filters, and pagination.
- **Controller File:** `server/src/modules/audit/audit.controller.js` (`getAuditLogs`)
- **Auth Required:** Yes
- **Role:** `ADMIN`
- **Query Parameters:** `actionType` (`INSERT` | `UPDATE` | `DELETE` | `LOGIN`), `tableName`, `startDate`, `endDate`, `page`, `limit`
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Audit logs retrieved successfully",
  "data": [
    {
      "audit_id": 88,
      "user_id": 1,
      "user_email": "admin@edutrack.edu",
      "user_role": "ADMIN",
      "action_type": "UPDATE",
      "table_name": "students",
      "record_id": 15,
      "old_values": "{\"academic_status\":\"Active\"}",
      "new_values": "{\"academic_status\":\"Suspended\"}",
      "ip_address": "127.0.0.1",
      "action_time": "2026-11-03T02:30:00.000Z"
    }
  ],
  "pagination": { "total": 88, "page": 1, "limit": 20, "totalPages": 5 }
}
```

---

## 16. User Profile & Password Module (`/profile`)

### `GET /api/profile`
Retrieves detailed profile metadata for the authenticated user.
- **Controller File:** `server/src/modules/profile/profile.controller.js` (`getProfile`)
- **Auth Required:** Yes
- **Role:** `ADMIN`, `FACULTY`, `STUDENT`
- **Response `200 OK`:** Full user profile entity.

---

### `PATCH /api/profile`
Updates contact phone number for student or faculty user.
- **Controller File:** `server/src/modules/profile/profile.controller.js` (`updateProfile`)
- **Auth Required:** Yes
- **Role:** `ADMIN`, `FACULTY`, `STUDENT`
- **Request Body:** `{ "phone": "+1-555-4321" }`
- **Response `200 OK`:** `{ "success": true, "message": "Profile updated successfully" }`

---

### `PATCH /api/profile/password`
Changes account password with verification of current password and bcrypt re-hashing.
- **Controller File:** `server/src/modules/profile/profile.controller.js` (`changePassword`)
- **Auth Required:** Yes
- **Role:** `ADMIN`, `FACULTY`, `STUDENT`
- **Request Body:**
```json
{
  "currentPassword": "OldPassword@123",
  "newPassword": "NewStrongPassword@2026"
}
```
- **Response `200 OK`:** `{ "success": true, "message": "Password updated successfully" }`
- **Error `400 Bad Request`:** "Current password verification failed" or "New password must be at least 6 characters long".
