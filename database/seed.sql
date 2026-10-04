-- ==============================================================================
-- CloudNative Student Management Platform - Seed Data
-- 12 Realistic Students, Full Attendance Records, and Subject Marks
-- ==============================================================================

USE student_management;

-- Clear existing data if any (in reverse foreign key order)
DELETE FROM marks;
DELETE FROM attendance;
DELETE FROM students;

-- Reset Auto Increment
ALTER TABLE marks AUTO_INCREMENT = 1;
ALTER TABLE attendance AUTO_INCREMENT = 1;
ALTER TABLE students AUTO_INCREMENT = 1;

-- ------------------------------------------------------------------------------
-- 1. Insert Students
-- ------------------------------------------------------------------------------
INSERT INTO students (id, register_number, name, email, phone, department, year, section, profile_image_url) VALUES
(1, '21BCS101', 'Aarav Sharma', 'aarav.sharma@college.edu', '+91 9876543201', 'CSE', 3, 'A', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
(2, '21BCS102', 'Diya Patel', 'diya.patel@college.edu', '+91 9876543202', 'CSE', 3, 'A', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
(3, '21BCS103', 'Rohan Gupta', 'rohan.gupta@college.edu', '+91 9876543203', 'CSE', 3, 'B', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
(4, '21BIT201', 'Ananya Verma', 'ananya.verma@college.edu', '+91 9876543204', 'IT', 3, 'A', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'),
(5, '21BIT202', 'Karthik Raja', 'karthik.raja@college.edu', '+91 9876543205', 'IT', 3, 'A', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
(6, '21BEC301', 'Sneha Reddy', 'sneha.reddy@college.edu', '+91 9876543206', 'ECE', 3, 'A', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'),
(7, '21BEC302', 'Vikram Singh', 'vikram.singh@college.edu', '+91 9876543207', 'ECE', 3, 'B', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'),
(8, '21BEE401', 'Pooja Nair', 'pooja.nair@college.edu', '+91 9876543208', 'EEE', 3, 'A', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'),
(9, '21BEE402', 'Arjun Menon', 'arjun.menon@college.edu', '+91 9876543209', 'EEE', 3, 'A', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'),
(10, '21BCS104', 'Meera Iyer', 'meera.iyer@college.edu', '+91 9876543210', 'CSE', 3, 'B', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'),
(11, '22BCS105', 'Rahul Desai', 'rahul.desai@college.edu', '+91 9876543211', 'CSE', 2, 'A', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150'),
(12, '22BIT203', 'Priya Sundaram', 'priya.sundaram@college.edu', '+91 9876543212', 'IT', 2, 'B', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');

-- ------------------------------------------------------------------------------
-- 2. Insert Attendance Records (Multiple Dates)
-- ------------------------------------------------------------------------------
-- Dates: 2026-09-01 to 2026-09-10 (10 school days)
-- Student 1 (Aarav): 9 Present, 1 Absent = 90% (Good)
INSERT INTO attendance (student_id, date, status) VALUES
(1, '2026-09-01', 'Present'), (1, '2026-09-02', 'Present'), (1, '2026-09-03', 'Present'),
(1, '2026-09-04', 'Present'), (1, '2026-09-05', 'Absent'),  (1, '2026-09-08', 'Present'),
(1, '2026-09-09', 'Present'), (1, '2026-09-10', 'Present'), (1, '2026-09-11', 'Present'),
(1, '2026-09-12', 'Present');

-- Student 2 (Diya): 10 Present, 0 Absent = 100% (Good)
INSERT INTO attendance (student_id, date, status) VALUES
(2, '2026-09-01', 'Present'), (2, '2026-09-02', 'Present'), (2, '2026-09-03', 'Present'),
(2, '2026-09-04', 'Present'), (2, '2026-09-05', 'Present'), (2, '2026-09-08', 'Present'),
(2, '2026-09-09', 'Present'), (2, '2026-09-10', 'Present'), (2, '2026-09-11', 'Present'),
(2, '2026-09-12', 'Present');

-- Student 3 (Rohan): 6 Present, 4 Absent = 60% (BELOW 75% - Defaulter)
INSERT INTO attendance (student_id, date, status) VALUES
(3, '2026-09-01', 'Present'), (3, '2026-09-02', 'Absent'),  (3, '2026-09-03', 'Present'),
(3, '2026-09-04', 'Absent'),  (3, '2026-09-05', 'Present'), (3, '2026-09-08', 'Absent'),
(3, '2026-09-09', 'Present'), (3, '2026-09-10', 'Absent'),  (3, '2026-09-11', 'Present'),
(3, '2026-09-12', 'Present');

-- Student 4 (Ananya): 9 Present, 1 Absent = 90% (Good)
INSERT INTO attendance (student_id, date, status) VALUES
(4, '2026-09-01', 'Present'), (4, '2026-09-02', 'Present'), (4, '2026-09-03', 'Present'),
(4, '2026-09-04', 'Present'), (4, '2026-09-05', 'Present'), (4, '2026-09-08', 'Present'),
(4, '2026-09-09', 'Absent'),  (4, '2026-09-10', 'Present'), (4, '2026-09-11', 'Present'),
(4, '2026-09-12', 'Present');

-- Student 5 (Karthik): 5 Present, 5 Absent = 50% (BELOW 75% - Defaulter)
INSERT INTO attendance (student_id, date, status) VALUES
(5, '2026-09-01', 'Absent'),  (5, '2026-09-02', 'Present'), (5, '2026-09-03', 'Absent'),
(5, '2026-09-04', 'Present'), (5, '2026-09-05', 'Absent'),  (5, '2026-09-08', 'Present'),
(5, '2026-09-09', 'Absent'),  (5, '2026-09-10', 'Present'), (5, '2026-09-11', 'Absent'),
(5, '2026-09-12', 'Present');

-- Student 6 (Sneha): 8 Present, 2 Absent = 80% (Good)
INSERT INTO attendance (student_id, date, status) VALUES
(6, '2026-09-01', 'Present'), (6, '2026-09-02', 'Present'), (6, '2026-09-03', 'Absent'),
(6, '2026-09-04', 'Present'), (6, '2026-09-05', 'Present'), (6, '2026-09-08', 'Present'),
(6, '2026-09-09', 'Present'), (6, '2026-09-10', 'Absent'),  (6, '2026-09-11', 'Present'),
(6, '2026-09-12', 'Present');

-- Student 7 (Vikram): 6 Present, 4 Absent = 60% (BELOW 75% - Defaulter)
INSERT INTO attendance (student_id, date, status) VALUES
(7, '2026-09-01', 'Present'), (7, '2026-09-02', 'Absent'),  (7, '2026-09-03', 'Present'),
(7, '2026-09-04', 'Absent'),  (7, '2026-09-05', 'Present'), (7, '2026-09-08', 'Present'),
(7, '2026-09-09', 'Absent'),  (7, '2026-09-10', 'Absent'),  (7, '2026-09-11', 'Present'),
(7, '2026-09-12', 'Present');

-- Student 8 (Pooja): 9 Present, 1 Absent = 90% (Good)
INSERT INTO attendance (student_id, date, status) VALUES
(8, '2026-09-01', 'Present'), (8, '2026-09-02', 'Present'), (8, '2026-09-03', 'Present'),
(8, '2026-09-04', 'Absent'),  (8, '2026-09-05', 'Present'), (8, '2026-09-08', 'Present'),
(8, '2026-09-09', 'Present'), (8, '2026-09-10', 'Present'), (8, '2026-09-11', 'Present'),
(8, '2026-09-12', 'Present');

-- Student 9 (Arjun): 8 Present, 2 Absent = 80% (Good)
INSERT INTO attendance (student_id, date, status) VALUES
(9, '2026-09-01', 'Present'), (9, '2026-09-02', 'Present'), (9, '2026-09-03', 'Present'),
(9, '2026-09-04', 'Present'), (9, '2026-09-05', 'Absent'),  (9, '2026-09-08', 'Present'),
(9, '2026-09-09', 'Present'), (9, '2026-09-10', 'Present'), (9, '2026-09-11', 'Absent'),
(9, '2026-09-12', 'Present');

-- Student 10 (Meera): 10 Present, 0 Absent = 100% (Good)
INSERT INTO attendance (student_id, date, status) VALUES
(10, '2026-09-01', 'Present'), (10, '2026-09-02', 'Present'), (10, '2026-09-03', 'Present'),
(10, '2026-09-04', 'Present'), (10, '2026-09-05', 'Present'), (10, '2026-09-08', 'Present'),
(10, '2026-09-09', 'Present'), (10, '2026-09-10', 'Present'), (10, '2026-09-11', 'Present'),
(10, '2026-09-12', 'Present');

-- Student 11 (Rahul): 9 Present, 1 Absent = 90% (Good)
INSERT INTO attendance (student_id, date, status) VALUES
(11, '2026-09-01', 'Present'), (11, '2026-09-02', 'Present'), (11, '2026-09-03', 'Present'),
(11, '2026-09-04', 'Present'), (11, '2026-09-05', 'Present'), (11, '2026-09-08', 'Present'),
(11, '2026-09-09', 'Present'), (11, '2026-09-10', 'Absent'),  (11, '2026-09-11', 'Present'),
(11, '2026-09-12', 'Present');

-- Student 12 (Priya): 8 Present, 2 Absent = 80% (Good)
INSERT INTO attendance (student_id, date, status) VALUES
(12, '2026-09-01', 'Present'), (12, '2026-09-02', 'Absent'),  (12, '2026-09-03', 'Present'),
(12, '2026-09-04', 'Present'), (12, '2026-09-05', 'Present'), (12, '2026-09-08', 'Present'),
(12, '2026-09-09', 'Present'), (12, '2026-09-10', 'Absent'),  (12, '2026-09-11', 'Present'),
(12, '2026-09-12', 'Present');

-- ------------------------------------------------------------------------------
-- 3. Insert Marks (All 5 Specified Subjects for each student)
-- Subjects: Data Structures, DBMS, Cloud Computing, Computer Networks, Operating Systems
-- ------------------------------------------------------------------------------
INSERT INTO marks (student_id, subject, marks, max_marks, semester, exam_type) VALUES
-- Student 1 (Aarav Sharma - Top Performer)
(1, 'Data Structures', 88.00, 100.00, 5, 'Semester Final'),
(1, 'DBMS', 92.00, 100.00, 5, 'Semester Final'),
(1, 'Cloud Computing', 95.00, 100.00, 5, 'Semester Final'),
(1, 'Computer Networks', 84.00, 100.00, 5, 'Semester Final'),
(1, 'Operating Systems', 89.00, 100.00, 5, 'Semester Final'),

-- Student 2 (Diya Patel - Distinction)
(2, 'Data Structures', 94.00, 100.00, 5, 'Semester Final'),
(2, 'DBMS', 90.00, 100.00, 5, 'Semester Final'),
(2, 'Cloud Computing', 98.00, 100.00, 5, 'Semester Final'),
(2, 'Computer Networks', 91.00, 100.00, 5, 'Semester Final'),
(2, 'Operating Systems', 93.00, 100.00, 5, 'Semester Final'),

-- Student 3 (Rohan Gupta - Average)
(3, 'Data Structures', 62.00, 100.00, 5, 'Semester Final'),
(3, 'DBMS', 58.00, 100.00, 5, 'Semester Final'),
(3, 'Cloud Computing', 70.00, 100.00, 5, 'Semester Final'),
(3, 'Computer Networks', 55.00, 100.00, 5, 'Semester Final'),
(3, 'Operating Systems', 64.00, 100.00, 5, 'Semester Final'),

-- Student 4 (Ananya Verma - High First Class)
(4, 'Data Structures', 82.00, 100.00, 5, 'Semester Final'),
(4, 'DBMS', 85.00, 100.00, 5, 'Semester Final'),
(4, 'Cloud Computing', 88.00, 100.00, 5, 'Semester Final'),
(4, 'Computer Networks', 79.00, 100.00, 5, 'Semester Final'),
(4, 'Operating Systems', 84.00, 100.00, 5, 'Semester Final'),

-- Student 5 (Karthik Raja - Needs Improvement / Fail in one subject)
(5, 'Data Structures', 35.00, 100.00, 5, 'Semester Final'),
(5, 'DBMS', 42.00, 100.00, 5, 'Semester Final'),
(5, 'Cloud Computing', 52.00, 100.00, 5, 'Semester Final'),
(5, 'Computer Networks', 48.00, 100.00, 5, 'Semester Final'),
(5, 'Operating Systems', 38.00, 100.00, 5, 'Semester Final'),

-- Student 6 (Sneha Reddy - Good)
(6, 'Data Structures', 76.00, 100.00, 5, 'Semester Final'),
(6, 'DBMS', 80.00, 100.00, 5, 'Semester Final'),
(6, 'Cloud Computing', 84.00, 100.00, 5, 'Semester Final'),
(6, 'Computer Networks', 72.00, 100.00, 5, 'Semester Final'),
(6, 'Operating Systems', 78.00, 100.00, 5, 'Semester Final'),

-- Student 7 (Vikram Singh - Average)
(7, 'Data Structures', 60.00, 100.00, 5, 'Semester Final'),
(7, 'DBMS', 65.00, 100.00, 5, 'Semester Final'),
(7, 'Cloud Computing', 68.00, 100.00, 5, 'Semester Final'),
(7, 'Computer Networks', 58.00, 100.00, 5, 'Semester Final'),
(7, 'Operating Systems', 62.00, 100.00, 5, 'Semester Final'),

-- Student 8 (Pooja Nair - Distinction)
(8, 'Data Structures', 89.00, 100.00, 5, 'Semester Final'),
(8, 'DBMS', 91.00, 100.00, 5, 'Semester Final'),
(8, 'Cloud Computing', 94.00, 100.00, 5, 'Semester Final'),
(8, 'Computer Networks', 87.00, 100.00, 5, 'Semester Final'),
(8, 'Operating Systems', 90.00, 100.00, 5, 'Semester Final'),

-- Student 9 (Arjun Menon - Good)
(9, 'Data Structures', 74.00, 100.00, 5, 'Semester Final'),
(9, 'DBMS', 78.00, 100.00, 5, 'Semester Final'),
(9, 'Cloud Computing', 81.00, 100.00, 5, 'Semester Final'),
(9, 'Computer Networks', 70.00, 100.00, 5, 'Semester Final'),
(9, 'Operating Systems', 75.00, 100.00, 5, 'Semester Final'),

-- Student 10 (Meera Iyer - Top Performer)
(10, 'Data Structures', 95.00, 100.00, 5, 'Semester Final'),
(10, 'DBMS', 96.00, 100.00, 5, 'Semester Final'),
(10, 'Cloud Computing', 99.00, 100.00, 5, 'Semester Final'),
(10, 'Computer Networks', 92.00, 100.00, 5, 'Semester Final'),
(10, 'Operating Systems', 97.00, 100.00, 5, 'Semester Final'),

-- Student 11 (Rahul Desai)
(11, 'Data Structures', 70.00, 100.00, 3, 'Semester Final'),
(11, 'DBMS', 75.00, 100.00, 3, 'Semester Final'),
(11, 'Cloud Computing', 79.00, 100.00, 3, 'Semester Final'),
(11, 'Computer Networks', 68.00, 100.00, 3, 'Semester Final'),
(11, 'Operating Systems', 72.00, 100.00, 3, 'Semester Final'),

-- Student 12 (Priya Sundaram)
(12, 'Data Structures', 85.00, 100.00, 3, 'Semester Final'),
(12, 'DBMS', 88.00, 100.00, 3, 'Semester Final'),
(12, 'Cloud Computing', 86.00, 100.00, 3, 'Semester Final'),
(12, 'Computer Networks', 82.00, 100.00, 3, 'Semester Final'),
(12, 'Operating Systems', 84.00, 100.00, 3, 'Semester Final');
