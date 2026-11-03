-- =============================================================================
-- EDUTRACK PRO — ADVANCED STUDENT ACADEMIC MANAGEMENT & ANALYTICS SYSTEM
-- SCRIPT 07: DETERMINISTIC PRODUCTION-GRADE SAMPLE SEED DATA
-- =============================================================================

USE edutrack;

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. ROLES
-- -----------------------------------------------------------------------------
TRUNCATE TABLE roles;
INSERT INTO roles (role_id, role_name, description) VALUES
(1, 'ADMIN', 'System and Institutional Administrator with full privileges'),
(2, 'FACULTY', 'Academic faculty member with teaching, attendance, and grading privileges'),
(3, 'STUDENT', 'Enrolled student with read-only access to personal academics');

-- -----------------------------------------------------------------------------
-- 2. GRADE RULES
-- -----------------------------------------------------------------------------
TRUNCATE TABLE grade_rules;
INSERT INTO grade_rules (rule_id, grade, min_percentage, max_percentage, grade_point, description) VALUES
(1, 'A+', 90.00, 100.00, 4.00, 'Outstanding Mastery'),
(2, 'A',  80.00, 89.99,  3.70, 'Excellent Comprehension'),
(3, 'B',  70.00, 79.99,  3.00, 'Very Good Competence'),
(4, 'C',  60.00, 69.99,  2.00, 'Satisfactory Knowledge'),
(5, 'D',  50.00, 59.99,  1.00, 'Marginal Pass'),
(6, 'F',  0.00,  49.99,  0.00, 'Failure / Requires Retake');

-- -----------------------------------------------------------------------------
-- 3. DEPARTMENTS
-- -----------------------------------------------------------------------------
TRUNCATE TABLE departments;
INSERT INTO departments (department_id, department_code, department_name, description) VALUES
(1, 'CSE',  'Computer Science & Engineering', 'Core computing, algorithms, systems, and software engineering'),
(2, 'AIDS', 'Artificial Intelligence & Data Science', 'Machine learning, neural architectures, and data engineering'),
(3, 'IT',   'Information Technology', 'Enterprise systems, cloud computing, cyber infrastructure, and web applications'),
(4, 'ECE',  'Electronics & Communication Engineering', 'Embedded systems, signal processing, and telecommunications');

-- -----------------------------------------------------------------------------
-- 4. ACADEMIC TERMS
-- -----------------------------------------------------------------------------
TRUNCATE TABLE academic_terms;
INSERT INTO academic_terms (term_id, term_code, term_name, academic_year, semester_type, start_date, end_date, is_active, is_completed) VALUES
(1, '2026-FALL',   'Fall Semester 2026',   '2026-2027', 'Fall',   '2026-08-15', '2026-12-20', TRUE,  FALSE),
(2, '2026-SPRING', 'Spring Semester 2026', '2025-2026', 'Spring', '2026-01-10', '2026-05-25', FALSE, TRUE),
(3, '2025-FALL',   'Fall Semester 2025',   '2025-2026', 'Fall',   '2025-08-18', '2025-12-22', FALSE, TRUE);

-- -----------------------------------------------------------------------------
-- 5. USERS (Bcrypt Hashes: Admin@123, Faculty@123, Student@123)
-- Admin Hash:   $2a$10$Q1Qaj9Uydx5LX92VF9nuCO6jLer/T5uXEiPSwLUUno92Fiz.YqxEi
-- Faculty Hash: $2a$10$rONMb5E/BN6GeKsF8TnBKu.tgiSKdcpA0dMWLRtHrA7.GK17l2zy2
-- Student Hash: $2a$10$RDch6zOw8vdhZMWaVMNZ8.gXTlxjgmyXEJfU7.So.evllmBs/xkHK
-- -----------------------------------------------------------------------------
TRUNCATE TABLE users;
INSERT INTO users (user_id, email, password_hash, role_id, is_active) VALUES
-- Admin (ID: 1)
(1, 'admin@edutrack.edu', '$2a$10$Q1Qaj9Uydx5LX92VF9nuCO6jLer/T5uXEiPSwLUUno92Fiz.YqxEi', 1, TRUE),

-- Faculty Users (ID: 2 - 7)
(2, 'faculty@edutrack.edu', '$2a$10$rONMb5E/BN6GeKsF8TnBKu.tgiSKdcpA0dMWLRtHrA7.GK17l2zy2', 2, TRUE),
(3, 'hopper@edutrack.edu',  '$2a$10$rONMb5E/BN6GeKsF8TnBKu.tgiSKdcpA0dMWLRtHrA7.GK17l2zy2', 2, TRUE),
(4, 'neumann@edutrack.edu', '$2a$10$rONMb5E/BN6GeKsF8TnBKu.tgiSKdcpA0dMWLRtHrA7.GK17l2zy2', 2, TRUE),
(5, 'lovelace@edutrack.edu','$2a$10$rONMb5E/BN6GeKsF8TnBKu.tgiSKdcpA0dMWLRtHrA7.GK17l2zy2', 2, TRUE),
(6, 'knuth@edutrack.edu',   '$2a$10$rONMb5E/BN6GeKsF8TnBKu.tgiSKdcpA0dMWLRtHrA7.GK17l2zy2', 2, TRUE),
(7, 'shannon@edutrack.edu', '$2a$10$rONMb5E/BN6GeKsF8TnBKu.tgiSKdcpA0dMWLRtHrA7.GK17l2zy2', 2, TRUE),

-- Student Users (ID: 8 - 31)
(8,  'student@edutrack.edu',  '$2a$10$RDch6zOw8vdhZMWaVMNZ8.gXTlxjgmyXEJfU7.So.evllmBs/xkHK', 3, TRUE),
(9,  'alex.r@edutrack.edu',    '$2a$10$RDch6zOw8vdhZMWaVMNZ8.gXTlxjgmyXEJfU7.So.evllmBs/xkHK', 3, TRUE),
(10, 'priya.s@edutrack.edu',   '$2a$10$RDch6zOw8vdhZMWaVMNZ8.gXTlxjgmyXEJfU7.So.evllmBs/xkHK', 3, TRUE),
(11, 'marcus.v@edutrack.edu',  '$2a$10$RDch6zOw8vdhZMWaVMNZ8.gXTlxjgmyXEJfU7.So.evllmBs/xkHK', 3, TRUE),
(12, 'chloe.b@edutrack.edu',   '$2a$10$RDch6zOw8vdhZMWaVMNZ8.gXTlxjgmyXEJfU7.So.evllmBs/xkHK', 3, TRUE),
(13, 'daniel.k@edutrack.edu',  '$2a$10$RDch6zOw8vdhZMWaVMNZ8.gXTlxjgmyXEJfU7.So.evllmBs/xkHK', 3, TRUE),
(14, 'fatima.z@edutrack.edu',  '$2a$10$RDch6zOw8vdhZMWaVMNZ8.gXTlxjgmyXEJfU7.So.evllmBs/xkHK', 3, TRUE),
(15, 'ethan.w@edutrack.edu',   '$2a$10$RDch6zOw8vdhZMWaVMNZ8.gXTlxjgmyXEJfU7.So.evllmBs/xkHK', 3, TRUE),
(16, 'liam.s@edutrack.edu',    '$2a$10$RDch6zOw8vdhZMWaVMNZ8.gXTlxjgmyXEJfU7.So.evllmBs/xkHK', 3, TRUE),
(17, 'olivia.d@edutrack.edu',  '$2a$10$RDch6zOw8vdhZMWaVMNZ8.gXTlxjgmyXEJfU7.So.evllmBs/xkHK', 3, TRUE),
(18, 'noah.g@edutrack.edu',    '$2a$10$RDch6zOw8vdhZMWaVMNZ8.gXTlxjgmyXEJfU7.So.evllmBs/xkHK', 3, TRUE),
(19, 'sophia.m@edutrack.edu',  '$2a$10$RDch6zOw8vdhZMWaVMNZ8.gXTlxjgmyXEJfU7.So.evllmBs/xkHK', 3, TRUE),
(20, 'lucas.b@edutrack.edu',   '$2a$10$RDch6zOw8vdhZMWaVMNZ8.gXTlxjgmyXEJfU7.So.evllmBs/xkHK', 3, TRUE),
(21, 'emma.r@edutrack.edu',    '$2a$10$RDch6zOw8vdhZMWaVMNZ8.gXTlxjgmyXEJfU7.So.evllmBs/xkHK', 3, TRUE),
(22, 'mason.l@edutrack.edu',   '$2a$10$RDch6zOw8vdhZMWaVMNZ8.gXTlxjgmyXEJfU7.So.evllmBs/xkHK', 3, TRUE),
(23, 'isabella.w@edutrack.edu','$2a$10$RDch6zOw8vdhZMWaVMNZ8.gXTlxjgmyXEJfU7.So.evllmBs/xkHK', 3, TRUE),
(24, 'logan.h@edutrack.edu',   '$2a$10$RDch6zOw8vdhZMWaVMNZ8.gXTlxjgmyXEJfU7.So.evllmBs/xkHK', 3, TRUE),
(25, 'mia.c@edutrack.edu',     '$2a$10$RDch6zOw8vdhZMWaVMNZ8.gXTlxjgmyXEJfU7.So.evllmBs/xkHK', 3, TRUE),
(26, 'jackson.l@edutrack.edu', '$2a$10$RDch6zOw8vdhZMWaVMNZ8.gXTlxjgmyXEJfU7.So.evllmBs/xkHK', 3, TRUE),
(27, 'harper.r@edutrack.edu',  '$2a$10$RDch6zOw8vdhZMWaVMNZ8.gXTlxjgmyXEJfU7.So.evllmBs/xkHK', 3, TRUE),
(28, 'benjamin.w@edutrack.edu','$2a$10$RDch6zOw8vdhZMWaVMNZ8.gXTlxjgmyXEJfU7.So.evllmBs/xkHK', 3, TRUE),
(29, 'evelyn.h@edutrack.edu',  '$2a$10$RDch6zOw8vdhZMWaVMNZ8.gXTlxjgmyXEJfU7.So.evllmBs/xkHK', 3, TRUE),
(30, 'james.a@edutrack.edu',   '$2a$10$RDch6zOw8vdhZMWaVMNZ8.gXTlxjgmyXEJfU7.So.evllmBs/xkHK', 3, TRUE),
(31, 'abigail.y@edutrack.edu', '$2a$10$RDch6zOw8vdhZMWaVMNZ8.gXTlxjgmyXEJfU7.So.evllmBs/xkHK', 3, TRUE);

-- -----------------------------------------------------------------------------
-- 6. FACULTY MEMBERS
-- -----------------------------------------------------------------------------
TRUNCATE TABLE faculty;
INSERT INTO faculty (faculty_id, user_id, employee_code, first_name, last_name, department_id, designation, joining_date, phone, is_active) VALUES
(1, 2, 'EMP-CSE-001', 'Alan',    'Turing',     1, 'Professor & Head',        '2018-07-01', '+1-555-0101', TRUE),
(2, 3, 'EMP-CSE-002', 'Grace',   'Hopper',     1, 'Associate Professor',     '2019-08-15', '+1-555-0102', TRUE),
(3, 4, 'EMP-AIDS-001','John',    'von Neumann',2, 'Professor',               '2020-01-10', '+1-555-0103', TRUE),
(4, 5, 'EMP-AIDS-002','Ada',     'Lovelace',   2, 'Assistant Professor',     '2021-06-20', '+1-555-0104', TRUE),
(5, 6, 'EMP-IT-001',  'Donald',  'Knuth',      3, 'Professor',               '2017-09-01', '+1-555-0105', TRUE),
(6, 7, 'EMP-ECE-001', 'Claude',  'Shannon',    4, 'Associate Professor',     '2019-02-14', '+1-555-0106', TRUE);

-- -----------------------------------------------------------------------------
-- 7. STUDENTS (24 Students across CSE, AIDS, IT, ECE)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE students;
INSERT INTO students (student_id, user_id, roll_number, first_name, last_name, department_id, current_semester, admission_date, date_of_birth, gender, phone, academic_status) VALUES
(1,  8,  'CS2023001', 'Sarah',    'Jenkins',   1, 5, '2023-08-20', '2004-03-12', 'Female', '+1-555-0201', 'Active'),
(2,  9,  'CS2023002', 'Alex',     'Rivera',    1, 5, '2023-08-20', '2003-11-25', 'Male',   '+1-555-0202', 'Active'),
(3,  10, 'CS2023003', 'Priya',    'Sharma',    1, 5, '2023-08-20', '2004-07-19', 'Female', '+1-555-0203', 'Active'),
(4,  11, 'CS2023004', 'Marcus',   'Vance',     1, 5, '2023-08-20', '2003-09-05', 'Male',   '+1-555-0204', 'Active'),
(5,  12, 'CS2023005', 'Chloe',    'Bennett',   1, 5, '2023-08-20', '2004-01-30', 'Female', '+1-555-0205', 'Active'),
(6,  13, 'CS2023006', 'Daniel',   'Kim',       1, 5, '2023-08-20', '2003-05-14', 'Male',   '+1-555-0206', 'Active'),

(7,  14, 'AI2023001', 'Fatima',   'Al-Zahra',  2, 5, '2023-08-20', '2004-08-11', 'Female', '+1-555-0207', 'Active'),
(8,  15, 'AI2023002', 'Ethan',    'Walker',    2, 5, '2023-08-20', '2003-12-03', 'Male',   '+1-555-0208', 'Active'),
(9,  16, 'AI2023003', 'Liam',     'Smith',     2, 5, '2023-08-20', '2004-04-22', 'Male',   '+1-555-0209', 'Active'),
(10, 17, 'AI2023004', 'Olivia',   'Davis',     2, 5, '2023-08-20', '2004-02-18', 'Female', '+1-555-0210', 'Active'),
(11, 18, 'AI2023005', 'Noah',     'Garcia',    2, 5, '2023-08-20', '2003-10-09', 'Male',   '+1-555-0211', 'Active'),
(12, 19, 'AI2023006', 'Sophia',   'Martinez',  2, 5, '2023-08-20', '2004-06-27', 'Female', '+1-555-0212', 'Active'),

(13, 20, 'IT2024001', 'Lucas',    'Brown',     3, 3, '2024-08-22', '2005-01-15', 'Male',   '+1-555-0213', 'Active'),
(14, 21, 'IT2024002', 'Emma',     'Rodriguez', 3, 3, '2024-08-22', '2005-09-04', 'Female', '+1-555-0214', 'Active'),
(15, 22, 'IT2024003', 'Mason',    'Lee',       3, 3, '2024-08-22', '2004-11-12', 'Male',   '+1-555-0215', 'Active'),
(16, 23, 'IT2024004', 'Isabella', 'White',     3, 3, '2024-08-22', '2005-03-29', 'Female', '+1-555-0216', 'Active'),
(17, 24, 'IT2024005', 'Logan',    'Harris',    3, 3, '2024-08-22', '2004-07-08', 'Male',   '+1-555-0217', 'Active'),
(18, 25, 'IT2024006', 'Mia',      'Clark',     3, 3, '2024-08-22', '2005-05-19', 'Female', '+1-555-0218', 'Active'),

(19, 26, 'EC2024001', 'Jackson',  'Lewis',     4, 3, '2024-08-22', '2005-02-10', 'Male',   '+1-555-0219', 'Active'),
(20, 27, 'EC2024002', 'Harper',   'Robinson',  4, 3, '2024-08-22', '2004-10-31', 'Female', '+1-555-0220', 'Active'),
(21, 28, 'EC2024003', 'Benjamin', 'Walker',    4, 3, '2024-08-22', '2005-06-14', 'Male',   '+1-555-0221', 'Active'),
(22, 29, 'EC2024004', 'Evelyn',   'Hall',      4, 3, '2024-08-22', '2004-12-05', 'Female', '+1-555-0222', 'Active'),
(23, 30, 'EC2024005', 'James',    'Allen',     4, 3, '2024-08-22', '2005-04-01', 'Male',   '+1-555-0223', 'Suspended'),
(24, 31, 'EC2024006', 'Abigail',  'Young',     4, 3, '2024-08-22', '2004-08-25', 'Female', '+1-555-0224', 'Active');

-- -----------------------------------------------------------------------------
-- 8. COURSES (12 Curriculum Courses)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE courses;
INSERT INTO courses (course_id, course_code, course_name, department_id, credits, description) VALUES
(1,  'CS301', 'Database Management Systems',         1, 4, 'Relational models, SQL, transactions, indexing, normalization, and ACID guarantees'),
(2,  'CS201', 'Data Structures & Algorithms',        1, 4, 'Trees, graphs, dynamic programming, sorting complexity, and algorithmic analysis'),
(3,  'CS401', 'Operating Systems & Virtualization',  1, 3, 'Process scheduling, concurrency, virtual memory, file systems, and kernels'),
(4,  'CS501', 'Computer Networks & Security',        1, 3, 'TCP/IP protocol stack, network layers, cryptography, and socket programming'),
(5,  'AI301', 'Machine Learning Foundations',        2, 4, 'Supervised & unsupervised learning, gradient descent, regression, and classification'),
(6,  'AI402', 'Deep Neural Networks',                2, 4, 'Backpropagation, CNNs, RNNs, Transformer architectures, and attention mechanisms'),
(7,  'AI202', 'Probability & Statistics for AI',     2, 3, 'Probability distributions, Bayes theorem, hypothesis testing, and random variables'),
(8,  'IT202', 'Modern Web Technologies',             3, 3, 'Full-stack client-server architecture, RESTful APIs, React, and Node.js'),
(9,  'IT304', 'Cloud Computing & DevOps',            3, 3, 'Containerization, microservices, CI/CD pipelines, and distributed cloud services'),
(10, 'IT401', 'Enterprise Information Systems',      3, 3, 'ERP architectures, business process workflow, and system integration'),
(11, 'EC201', 'Digital Signal Processing',           4, 4, 'Discrete-time signals, Fourier transforms, digital filter design, and spectral analysis'),
(12, 'EC303', 'Embedded Systems & IoT',              4, 3, 'Microcontrollers, real-time operating systems, sensor interfacing, and wireless IoT');

-- -----------------------------------------------------------------------------
-- 9. COURSE OFFERINGS (Active Fall 2026 Term)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE course_offerings;
INSERT INTO course_offerings (offering_id, course_id, term_id, faculty_id, section, capacity, status) VALUES
(1, 1, 1, 1, 'A', 30, 'Open'), -- CS301 (DBMS) taught by Dr. Alan Turing
(2, 2, 1, 2, 'A', 30, 'Open'), -- CS201 (DSA) taught by Dr. Grace Hopper
(3, 5, 1, 3, 'A', 30, 'Open'), -- AI301 (ML) taught by Dr. John von Neumann
(4, 6, 1, 4, 'A', 25, 'Open'), -- AI402 (Deep Learning) taught by Dr. Ada Lovelace
(5, 8, 1, 5, 'A', 30, 'Open'), -- IT202 (Web Tech) taught by Dr. Donald Knuth
(6, 11, 1, 6, 'A', 25, 'Open'); -- EC201 (DSP) taught by Dr. Claude Shannon

-- -----------------------------------------------------------------------------
-- 10. ENROLLMENTS
-- -----------------------------------------------------------------------------
TRUNCATE TABLE enrollments;
-- Enroll CSE Students (1-6) in CS301 (offering 1) & CS201 (offering 2)
INSERT INTO enrollments (enrollment_id, student_id, offering_id, enrollment_date, status) VALUES
(1,  1, 1, '2026-08-16', 'Enrolled'),
(2,  2, 1, '2026-08-16', 'Enrolled'),
(3,  3, 1, '2026-08-16', 'Enrolled'),
(4,  4, 1, '2026-08-16', 'Enrolled'),
(5,  5, 1, '2026-08-16', 'Enrolled'),
(6,  6, 1, '2026-08-16', 'Enrolled'),

(7,  1, 2, '2026-08-16', 'Enrolled'),
(8,  2, 2, '2026-08-16', 'Enrolled'),
(9,  3, 2, '2026-08-16', 'Enrolled'),
(10, 4, 2, '2026-08-16', 'Enrolled'),
(11, 5, 2, '2026-08-16', 'Enrolled'),
(12, 6, 2, '2026-08-16', 'Enrolled'),

-- Enroll AI Students (7-12) in AI301 (offering 3) & AI402 (offering 4)
(13, 7,  3, '2026-08-16', 'Enrolled'),
(14, 8,  3, '2026-08-16', 'Enrolled'),
(15, 9,  3, '2026-08-16', 'Enrolled'),
(16, 10, 3, '2026-08-16', 'Enrolled'),
(17, 11, 3, '2026-08-16', 'Enrolled'),
(18, 12, 3, '2026-08-16', 'Enrolled'),

(19, 7,  4, '2026-08-16', 'Enrolled'),
(20, 8,  4, '2026-08-16', 'Enrolled'),
(21, 9,  4, '2026-08-16', 'Enrolled'),
(22, 10, 4, '2026-08-16', 'Enrolled'),
(23, 11, 4, '2026-08-16', 'Enrolled'),
(24, 12, 4, '2026-08-16', 'Enrolled'),

-- Enroll IT Students (13-18) in IT202 (offering 5)
(25, 13, 5, '2026-08-17', 'Enrolled'),
(26, 14, 5, '2026-08-17', 'Enrolled'),
(27, 15, 5, '2026-08-17', 'Enrolled'),
(28, 16, 5, '2026-08-17', 'Enrolled'),
(29, 17, 5, '2026-08-17', 'Enrolled'),
(30, 18, 5, '2026-08-17', 'Enrolled'),

-- Enroll ECE Students (19-24) in EC201 (offering 6)
(31, 19, 6, '2026-08-17', 'Enrolled'),
(32, 20, 6, '2026-08-17', 'Enrolled'),
(33, 21, 6, '2026-08-17', 'Enrolled'),
(34, 22, 6, '2026-08-17', 'Enrolled'),
(35, 23, 6, '2026-08-17', 'Enrolled'),
(36, 24, 6, '2026-08-17', 'Enrolled');

-- -----------------------------------------------------------------------------
-- 11. CLASS SESSIONS (Offering 1: CS301 - DBMS)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE class_sessions;
INSERT INTO class_sessions (session_id, offering_id, session_date, start_time, end_time, topic, room_number) VALUES
(1, 1, '2026-09-01', '09:00:00', '10:30:00', 'Introduction to Relational Databases & Schema Design', 'Hall-301'),
(2, 1, '2026-09-03', '09:00:00', '10:30:00', 'Relational Algebra & Tuple Calculus', 'Hall-301'),
(3, 1, '2026-09-08', '09:00:00', '10:30:00', 'SQL Queries, Joins & Subqueries', 'Hall-301'),
(4, 1, '2026-09-10', '09:00:00', '10:30:00', 'Normalization Theory: 1NF, 2NF, 3NF, BCNF', 'Hall-301'),
(5, 1, '2026-09-15', '09:00:00', '10:30:00', 'Transaction Processing, ACID & Serializability', 'Hall-301'),
(6, 1, '2026-09-17', '09:00:00', '10:30:00', 'Concurrency Control: Two-Phase Locking & Deadlocks', 'Hall-301'),
(7, 1, '2026-09-22', '09:00:00', '10:30:00', 'B+ Trees, Indexing Strategies & Query Plans', 'Hall-301'),
(8, 1, '2026-09-24', '09:00:00', '10:30:00', 'Database Triggers, Procedures & Stored Functions', 'Hall-301'),

-- Offering 2: CS201 (DSA)
(9,  2, '2026-09-02', '11:00:00', '12:30:00', 'Algorithm Asymptotics & Big-O Notation', 'Hall-204'),
(10, 2, '2026-09-04', '11:00:00', '12:30:00', 'Balanced Trees: AVL and Red-Black Trees', 'Hall-204'),
(11, 2, '2026-09-09', '11:00:00', '12:30:00', 'Graph Algorithms: BFS, DFS & Shortest Path', 'Hall-204'),

-- Offering 3: AI301 (ML)
(12, 3, '2026-09-01', '14:00:00', '15:30:00', 'Linear & Logistic Regression Foundations', 'Lab-AI-1'),
(13, 3, '2026-09-08', '14:00:00', '15:30:00', 'Support Vector Machines & Kernel Methods', 'Lab-AI-1');

-- -----------------------------------------------------------------------------
-- 12. ATTENDANCE RECORDS (Realistic Attendance for CS301 sessions 1 - 8)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE attendance;
INSERT INTO attendance (session_id, enrollment_id, status, remarks) VALUES
-- Session 1
(1, 1, 'Present', 'Attentive'),
(1, 2, 'Present', 'Attentive'),
(1, 3, 'Present', 'Attentive'),
(1, 4, 'Present', 'Attentive'),
(1, 5, 'Late',    '10 mins delay - transit'),
(1, 6, 'Absent',   'Unexcused'),

-- Session 2
(2, 1, 'Present', 'On time'),
(2, 2, 'Present', 'On time'),
(2, 3, 'Present', 'On time'),
(2, 4, 'Late',    '5 mins delay'),
(2, 5, 'Present', 'On time'),
(2, 6, 'Absent',  'Medical certificate pending'),

-- Session 3
(3, 1, 'Present', 'Active participation'),
(3, 2, 'Present', 'Active participation'),
(3, 3, 'Present', 'Active participation'),
(3, 4, 'Present', 'Active participation'),
(3, 5, 'Present', 'Active participation'),
(3, 6, 'Excused', 'Approved medical leave'),

-- Session 4
(4, 1, 'Present', 'Good'),
(4, 2, 'Present', 'Good'),
(4, 3, 'Present', 'Good'),
(4, 4, 'Present', 'Good'),
(4, 5, 'Late',    'Traffic delay'),
(4, 6, 'Absent',  'Unexcused'),

-- Session 5
(5, 1, 'Present', 'Participated in lock demo'),
(5, 2, 'Present', 'Participated in lock demo'),
(5, 3, 'Present', 'Participated in lock demo'),
(5, 4, 'Present', 'Participated in lock demo'),
(5, 5, 'Present', 'Participated in lock demo'),
(5, 6, 'Present', 'On time'),

-- Session 6
(6, 1, 'Present', 'Normal'),
(6, 2, 'Present', 'Normal'),
(6, 3, 'Present', 'Normal'),
(6, 4, 'Late',    '8 mins delay'),
(6, 5, 'Present', 'Normal'),
(6, 6, 'Absent',  'Unexcused - Shortage warning'),

-- Session 7
(7, 1, 'Present', 'Normal'),
(7, 2, 'Present', 'Normal'),
(7, 3, 'Present', 'Normal'),
(7, 4, 'Present', 'Normal'),
(7, 5, 'Present', 'Normal'),
(7, 6, 'Absent',  'Unexcused'),

-- Session 8
(8, 1, 'Present', 'Demo evaluated'),
(8, 2, 'Present', 'Demo evaluated'),
(8, 3, 'Present', 'Demo evaluated'),
(8, 4, 'Present', 'Demo evaluated'),
(8, 5, 'Present', 'Demo evaluated'),
(8, 6, 'Present', 'Lab test submitted');

-- -----------------------------------------------------------------------------
-- 13. EXAMINATIONS
-- -----------------------------------------------------------------------------
TRUNCATE TABLE exams;
INSERT INTO exams (exam_id, offering_id, exam_name, exam_type, exam_date, max_marks, weightage_percentage, status, published_at) VALUES
(1, 1, 'Quiz 1: SQL & Relational Models',        'Quiz',       '2026-09-12', 25.00,  10.00, 'Published', '2026-09-15 10:00:00'),
(2, 1, 'Midterm Examination: Advanced SQL & 3NF', 'Midterm',    '2026-10-15', 100.00, 30.00, 'Published', '2026-10-20 14:00:00'),
(3, 1, 'DBMS Practical & Indexing Lab Test',     'Practical',  '2026-11-05', 50.00,  20.00, 'Draft',     NULL),
(4, 2, 'Quiz 1: Trees and Graphs',               'Quiz',       '2026-09-18', 30.00,  15.00, 'Published', '2026-09-22 09:30:00'),
(5, 3, 'Midterm: Machine Learning Algorithms',   'Midterm',    '2026-10-18', 100.00, 35.00, 'Published', '2026-10-25 11:00:00');

-- -----------------------------------------------------------------------------
-- 14. RESULTS (Exam Marks with Automatic Grade Mapping)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE results;
-- Results for Exam 1 (Quiz 1 - Max 25)
INSERT INTO results (exam_id, enrollment_id, marks_obtained, grade, remarks, is_published) VALUES
(1, 1, 24.00, 'A+', 'Outstanding grasp of query structure', TRUE),
(1, 2, 22.50, 'A+', 'Very good execution', TRUE),
(1, 3, 21.00, 'A',  'Good logic, minor formatting flaw', TRUE),
(1, 4, 18.50, 'B',  'Satisfactory join syntax', TRUE),
(1, 5, 16.00, 'C',  'Review correlated subqueries', TRUE),
(1, 6, 11.50, 'F',  'Incomplete submission - Needs review', TRUE),

-- Results for Exam 2 (Midterm - Max 100)
(2, 1, 94.00, 'A+', 'Top tier performance in normalization & ACID proofs', TRUE),
(2, 2, 88.00, 'A',  'Excellent design of relational schema', TRUE),
(2, 3, 84.50, 'A',  'Well articulated transaction isolation analysis', TRUE),
(2, 4, 76.00, 'B',  'Good overall, minor lock contention mistakes', TRUE),
(2, 5, 68.00, 'C',  'Satisfactory understanding of 3NF dependencies', TRUE),
(2, 6, 46.00, 'F',  'Below passing threshold - Attend remedial session', TRUE),

-- Results for Exam 4 (Quiz 1: DSA - Max 30)
(4, 7,  28.00, 'A+', 'Flawless AVL rotation proofs', TRUE),
(4, 8,  26.00, 'A',  'Solid graph traversal complexity', TRUE),
(4, 9,  24.50, 'A',  'Good algorithmic understanding', TRUE),
(4, 10, 21.00, 'B',  'Clear recursion tree analysis', TRUE),
(4, 11, 19.00, 'C',  'Review balance factors', TRUE),
(4, 12, 14.00, 'F',  'Failed dynamic programming edge cases', TRUE),

-- Results for Exam 5 (Midterm: ML - Max 100)
(5, 13, 95.00, 'A+', 'Exceptional gradient optimization derivations', TRUE),
(5, 14, 87.00, 'A',  'Very strong regularization analysis', TRUE),
(5, 15, 82.00, 'A',  'Good SVM margin derivations', TRUE),
(5, 16, 75.00, 'B',  'Satisfactory classification evaluation', TRUE),
(5, 17, 65.00, 'C',  'Review bias-variance tradeoff calculations', TRUE),
(5, 18, 52.00, 'D',  'Marginal pass - remedial mentoring recommended', TRUE);

-- -----------------------------------------------------------------------------
-- 15. NOTIFICATIONS
-- -----------------------------------------------------------------------------
TRUNCATE TABLE notifications;
INSERT INTO notifications (notification_id, user_id, title, message, type, is_read) VALUES
-- Admin notifications
(1, 1, 'Fall 2026 Academic Term Active', 'The Fall 2026 semester is now officially active with 6 active offerings.', 'general', TRUE),
(2, 1, 'Faculty Course Assignments Completed', 'All 6 faculty members have been assigned their designated term courses.', 'general', FALSE),

-- Faculty notifications (Alan Turing - User 2)
(3, 2, 'Midterm Results Published', 'Official results for CS301 Midterm Examination have been submitted and published.', 'result_published', TRUE),
(4, 2, 'Attendance Shortage Detected', 'Student Daniel Kim (CS2023006) has fallen below the 75% attendance threshold.', 'attendance_shortage', FALSE),

-- Student notifications (Sarah Jenkins - User 8)
(5, 8, 'Grade Sheet Published', 'Your grade for CS301: Database Management Systems Midterm has been published: 94/100 (A+).', 'result_published', FALSE),
(6, 8, 'Enrollment Confirmed', 'You have been enrolled in CS301 (Section A) and CS201 (Section A).', 'enrollment', TRUE),

-- Student notifications (Daniel Kim - User 13)
(7, 13, 'Urgent: Attendance Shortage Warning', 'Your attendance in CS301 is currently 57.14%, which is critically below the 75% requirement.', 'attendance_shortage', FALSE);

-- -----------------------------------------------------------------------------
-- 16. AUDIT LOGS (Sample verified audit trail)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE audit_logs;
INSERT INTO audit_logs (audit_id, user_id, action_type, table_name, record_id, old_values, new_values, ip_address, action_time) VALUES
(1, 1, 'INSERT', 'departments', '1', NULL, JSON_OBJECT('department_code', 'CSE', 'department_name', 'Computer Science & Engineering'), '127.0.0.1', '2026-08-10 09:00:00'),
(2, 1, 'INSERT', 'academic_terms', '1', NULL, JSON_OBJECT('term_code', '2026-FALL', 'status', 'Active'), '127.0.0.1', '2026-08-10 09:15:00'),
(3, 1, 'INSERT', 'course_offerings', '1', NULL, JSON_OBJECT('course_id', 1, 'faculty_id', 1, 'capacity', 30), '127.0.0.1', '2026-08-15 10:30:00'),
(4, 2, 'PUBLISH', 'exams', '1', JSON_OBJECT('status', 'Draft'), JSON_OBJECT('status', 'Published'), '127.0.0.1', '2026-09-15 10:00:00'),
(5, 2, 'PUBLISH', 'exams', '2', JSON_OBJECT('status', 'Draft'), JSON_OBJECT('status', 'Published'), '127.0.0.1', '2026-10-20 14:00:00');

SET FOREIGN_KEY_CHECKS = 1;
