const bcrypt = require('bcryptjs');
const { query, transaction } = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/response');
const { logAuditEvent } = require('../../utils/audit');

/**
 * List all students with search, department/status/semester filters, and pagination
 */
async function getStudents(req, res, next) {
  try {
    const {
      search = '',
      departmentId,
      semester,
      status,
      page = 1,
      limit = 10,
      sortBy = 'roll_number',
      sortOrder = 'ASC'
    } = req.query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const params = [];
    const whereClauses = [];

    if (search.trim()) {
      whereClauses.push('(s.roll_number LIKE ? OR s.first_name LIKE ? OR s.last_name LIKE ? OR u.email LIKE ?)');
      const pattern = `%${search.trim()}%`;
      params.push(pattern, pattern, pattern, pattern);
    }

    if (departmentId) {
      whereClauses.push('s.department_id = ?');
      params.push(parseInt(departmentId, 10));
    }

    if (semester) {
      whereClauses.push('s.current_semester = ?');
      params.push(parseInt(semester, 10));
    }

    if (status) {
      whereClauses.push('s.academic_status = ?');
      params.push(status);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Allowed sort columns
    const allowedSortColumns = ['roll_number', 'full_name', 'department_code', 'current_semester', 'academic_status', 'admission_date'];
    const safeSort = allowedSortColumns.includes(sortBy) ? sortBy : 'roll_number';
    const safeOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    // Count Total
    const countSql = `
      SELECT COUNT(*) AS total
      FROM students s
      JOIN users u ON s.user_id = u.user_id
      JOIN departments d ON s.department_id = d.department_id
      ${whereSql}
    `;
    const [countResult] = await query(countSql, params);
    const total = countResult ? countResult.total : 0;

    // Fetch Page Rows from View
    const dataSql = `
      SELECT 
        v.student_id,
        v.user_id,
        v.roll_number,
        v.full_name,
        v.first_name,
        v.last_name,
        v.email,
        v.department_id,
        v.department_code,
        v.department_name,
        v.current_semester,
        v.admission_date,
        v.date_of_birth,
        v.gender,
        v.phone,
        v.academic_status,
        v.total_enrolled_courses,
        fn_student_gpa(v.student_id, NULL) AS calculated_gpa
      FROM v_student_directory v
      JOIN users u ON v.user_id = u.user_id
      JOIN students s ON v.student_id = s.student_id
      ${whereSql}
      ORDER BY ${safeSort} ${safeOrder}
      LIMIT ? OFFSET ?
    `;

    const queryParams = [...params, parseInt(limit, 10), parseInt(offset, 10)];
    const students = await query(dataSql, queryParams);

    return successResponse(
      res,
      students,
      'Students retrieved successfully',
      200,
      {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / parseInt(limit, 10))
      }
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Get Student Details with all 6 Academic Profile Tabs
 */
async function getStudentById(req, res, next) {
  try {
    const studentId = parseInt(req.params.id, 10);

    // 1. Personal & Academic Info
    const students = await query(`
      SELECT 
        v.*,
        fn_student_gpa(v.student_id, NULL) AS cumulative_gpa
      FROM v_student_directory v
      WHERE v.student_id = ?
    `, [studentId]);

    if (!students || students.length === 0) {
      return errorResponse(res, 'Student not found', 404);
    }
    const student = students[0];

    // 2. Enrolled Courses
    const courses = await query(`
      SELECT 
        e.enrollment_id,
        e.offering_id,
        e.enrollment_date,
        e.status AS enrollment_status,
        c.course_code,
        c.course_name,
        c.credits,
        co.section,
        t.term_code,
        t.term_name,
        CONCAT(f.first_name, ' ', f.last_name) AS instructor,
        vas.attendance_percentage,
        vas.attendance_status
      FROM enrollments e
      JOIN course_offerings co ON e.offering_id = co.offering_id
      JOIN courses c ON co.course_id = c.course_id
      JOIN academic_terms t ON co.term_id = t.term_id
      JOIN faculty f ON co.faculty_id = f.faculty_id
      LEFT JOIN v_attendance_summary vas ON e.enrollment_id = vas.enrollment_id
      WHERE e.student_id = ?
      ORDER BY t.start_date DESC, c.course_code;
    `, [studentId]);

    // 3. Attendance Summary across all courses
    const attendanceSummary = await query(`
      SELECT * FROM v_attendance_summary WHERE student_id = ?
    `, [studentId]);

    // 4. Examination Results
    const results = await query(`
      SELECT 
        r.result_id,
        ex.exam_name,
        ex.exam_type,
        ex.exam_date,
        c.course_code,
        c.course_name,
        r.marks_obtained,
        ex.max_marks,
        ROUND((r.marks_obtained / ex.max_marks) * 100, 2) AS percentage,
        r.grade,
        r.remarks,
        r.is_published
      FROM results r
      JOIN exams ex ON r.exam_id = ex.exam_id
      JOIN enrollments e ON r.enrollment_id = e.enrollment_id
      JOIN course_offerings co ON ex.offering_id = co.offering_id
      JOIN courses c ON co.course_id = c.course_id
      WHERE e.student_id = ?
      ORDER BY ex.exam_date DESC;
    `, [studentId]);

    return successResponse(res, {
      student,
      courses,
      attendanceSummary,
      results
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Register New Student: Atomically creates User + Student Profile within a Transaction
 */
async function createStudent(req, res, next) {
  try {
    const {
      email,
      password,
      rollNumber,
      firstName,
      lastName,
      departmentId,
      currentSemester = 1,
      admissionDate,
      dateOfBirth,
      gender = 'Male',
      phone,
      academicStatus = 'Active'
    } = req.body;

    if (!email || !rollNumber || !firstName || !lastName || !departmentId || !admissionDate) {
      return errorResponse(res, 'Please provide all required fields: email, rollNumber, firstName, lastName, departmentId, admissionDate', 400);
    }

    // Check existing email or roll number
    const existing = await query(`
      SELECT 'email' AS duplicate_field FROM users WHERE email = ?
      UNION ALL
      SELECT 'roll_number' AS duplicate_field FROM students WHERE roll_number = ?
    `, [email.trim().toLowerCase(), rollNumber.trim().toUpperCase()]);

    if (existing && existing.length > 0) {
      return errorResponse(res, `Duplicate record found: ${existing[0].duplicate_field} is already registered.`, 409);
    }

    const defaultPassword = password || 'Student@123';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const result = await transaction(async (conn) => {
      // 1. Create User Account (Role ID 3 = STUDENT)
      const [userResult] = await conn.query(`
        INSERT INTO users (email, password_hash, role_id, is_active)
        VALUES (?, ?, 3, TRUE)
      `, [email.trim().toLowerCase(), passwordHash]);

      const userId = userResult.insertId;

      // 2. Create Student Profile
      const [studentResult] = await conn.query(`
        INSERT INTO students (
          user_id, roll_number, first_name, last_name, department_id,
          current_semester, admission_date, date_of_birth, gender, phone, academic_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        userId,
        rollNumber.trim().toUpperCase(),
        firstName.trim(),
        lastName.trim(),
        parseInt(departmentId, 10),
        parseInt(currentSemester, 10),
        admissionDate,
        dateOfBirth || null,
        gender,
        phone || null,
        academicStatus
      ]);

      const studentId = studentResult.insertId;

      // 3. Welcome Notification
      await conn.query(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, 'Welcome to EduTrack Pro', 'Your student account has been created successfully. Welcome to the university portal.', 'general')
      `, [userId]);

      return { userId, studentId };
    });

    await logAuditEvent({
      userId: req.user.userId,
      actionType: 'INSERT',
      tableName: 'students',
      recordId: result.studentId,
      newValues: { rollNumber, firstName, lastName, departmentId, email }
    });

    return successResponse(res, result, 'Student registered successfully', 201);
  } catch (error) {
    next(error);
  }
}

/**
 * Update Student Information
 */
async function updateStudent(req, res, next) {
  try {
    const studentId = parseInt(req.params.id, 10);
    const {
      firstName,
      lastName,
      departmentId,
      currentSemester,
      dateOfBirth,
      gender,
      phone
    } = req.body;

    const [existing] = await query('SELECT * FROM students WHERE student_id = ?', [studentId]);
    if (!existing) {
      return errorResponse(res, 'Student not found', 404);
    }

    await query(`
      UPDATE students
      SET 
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        department_id = COALESCE(?, department_id),
        current_semester = COALESCE(?, current_semester),
        date_of_birth = COALESCE(?, date_of_birth),
        gender = COALESCE(?, gender),
        phone = COALESCE(?, phone),
        updated_at = NOW()
      WHERE student_id = ?
    `, [
      firstName ? firstName.trim() : null,
      lastName ? lastName.trim() : null,
      departmentId ? parseInt(departmentId, 10) : null,
      currentSemester ? parseInt(currentSemester, 10) : null,
      dateOfBirth || null,
      gender || null,
      phone || null,
      studentId
    ]);

    return successResponse(res, null, 'Student information updated successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Update Student Academic Status (Calls Stored Procedure sp_update_student_status)
 */
async function updateStudentStatus(req, res, next) {
  try {
    const studentId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!['Active', 'Suspended', 'Graduated', 'Withdrawn'].includes(status)) {
      return errorResponse(res, 'Invalid academic status. Allowed: Active, Suspended, Graduated, Withdrawn', 400);
    }

    await query('CALL sp_update_student_status(?, ?, ?)', [
      studentId,
      status,
      req.user.userId
    ]);

    return successResponse(res, { studentId, newStatus: status }, 'Student academic status updated successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Export Students to CSV
 */
async function exportStudentsCsv(req, res, next) {
  try {
    const students = await query(`
      SELECT 
        roll_number,
        full_name,
        email,
        department_code,
        current_semester,
        admission_date,
        academic_status,
        overall_avg_score
      FROM v_student_directory
      ORDER BY roll_number ASC
    `);

    let csv = 'Roll Number,Full Name,Email,Department,Semester,Admission Date,Status,Average Score\n';
    students.forEach((s) => {
      csv += `"${s.roll_number}","${s.full_name}","${s.email}","${s.department_code}","${s.current_semester}","${s.admission_date}","${s.academic_status}","${s.overall_avg_score}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="students_directory.csv"');
    return res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  updateStudentStatus,
  exportStudentsCsv
};
