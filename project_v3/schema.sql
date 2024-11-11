-- Create the Course table
CREATE TABLE
    Course (
        id TEXT,
        course_id TEXT PRIMARY KEY,
        course_name TEXT NOT NULL,
        duration TEXT,
        credits TEXT
    );

-- Create the gender_table
CREATE TABLE
    gender_table (id TEXT, gender TEXT PRIMARY KEY);

--Create Academic_Year 
CREATE TABLE
    academic_year (id TEXT, acad_year TEXT PRIMARY KEY);

-- Create semester_table
CREATE TABLE
    semester (id TEXT, sem TEXT PRIMARY KEY);

--Create month_table
CREATE TABLE
    month_table (id TEXT, acad_month TEXT PRIMARY KEY);

--Create category_table
CREATE TABLE
    category_table (id TEXT, category TEXT PRIMARY KEY);

-- create blood_group_table
CREATE TABLE
    blood_grp_table (id TEXT, blood_grp TEXT PRIMARY KEY);

--create country_table
CREATE TABLE
    country_table (id TEXT, country TEXT PRIMARY KEY);

-- create state_table
CREATE TABLE
    country_state_table (
        id TEXT,
        country TEXT,
        stud_state TEXT,
        FOREIGN KEY (country) REFERENCES country_table (country),
        PRIMARY KEY (country, stud_state)
    );

--create state_table
CREATE TABLE
    country_state_dist (
        id TEXT,
        country TEXT,
        stud_state TEXT,
        district TEXT,
        PRIMARY KEY (country, stud_state, district),
        FOREIGN KEY (country, stud_state) REFERENCES country_state_table (country, stud_state)
    );

-- create grade_table
CREATE TABLE
    grade_table (id TEXT, grades TEXT PRIMARY KEY);

--Create Academic_year_semeseter_table
CREATE TABLE
    acad_year_sem (
        id TEXT,
        acad_year TEXT,
        semester TEXT,
        acad_month TEXT,
        PRIMARY KEY (acad_year, semester),
        FOREIGN KEY (acad_year) REFERENCES academic_year (acad_year),
        FOREIGN KEY (semester) REFERENCES semester (sem),
        FOREIGN KEY (acad_month) REFERENCES month_table (acad_month)
    );

-- Create the Student_table
CREATE TABLE
    Student (
        id TEXT,
        prn_no TEXT,
        roll_no TEXT PRIMARY KEY,
        stud_name TEXT NOT NULL,
        gender TEXT,
        batch TEXT,
        aadhar_no TEXT,
        email TEXT,
        mobile_no TEXT,
        stud_address TEXT,
        father_name TEXT,
        mother_name TEXT,
        SSC_grade TEXT,
        HSC_grade TEXT,
        graduation_grade TEXT,
        category TEXT,
        country TEXT,
        stud_state TEXT,
        district TEXT,
        dob TEXT,
        blood_grp TEXT,
        course_id TEXT,
        FOREIGN KEY (course_id) REFERENCES Course (course_id),
        FOREIGN KEY (gender) REFERENCES gender_table (gender),
        FOREIGN KEY (batch) REFERENCES academic_year (acad_year),
        FOREIGN KEY (country, stud_state, district) REFERENCES country_state_dist (country, stud_state, district),
        FOREIGN KEY (category) REFERENCES category_table (category),
        FOREIGN KEY (blood_grp) REFERENCES blood_grp_table (blood_grp)
    );

-- Create the Subject table
CREATE TABLE
    Subject (
        id TEXT,
        subject_code TEXT PRIMARY KEY,
        sub_name TEXT NOT NULL,
        credits TEXT,
        tot_internal TEXT,
        tot_external TEXT
    );

--create the table sem_subject_table
CREATE TABLE
    sem_subject_table (
        id TEXT,
        acad_year TEXT,
        semester TEXT,
        subject_code TEXT,
        FOREIGN KEY (acad_year, semester) REFERENCES acad_year_sem (acad_year, semester),
        PRIMARY KEY (acad_year, semester, subject_code)
    );

--create faculty_type_table
CREATE TABLE
    faculty_type_table (
        id TEXT,
        faculty_type TEXT PRIMARY KEY --visiting, full_time, contract_based
    );

-- Create the Faculty table
CREATE TABLE
    Faculty (
        id TEXT,
        faculty_id TEXT PRIMARY KEY,
        faculty_name TEXT NOT NULL,
        faculty_type TEXT,
        gender TEXT,
        major TEXT,
        research_area TEXT,
        mobile_no TEXT,
        country TEXT,
        stud_state TEXT,
        district TEXT,
        stud_address TEXT,
        FOREIGN KEY (gender) REFERENCES gender_table (gender),
        FOREIGN KEY (country, stud_state, district) REFERENCES country_state_dist (country, stud_state, district),
        FOREIGN KEY (faculty_type) REFERENCES faculty_type_table (faculty_type)
    );

-- Create the semester_subject_teaching table
CREATE TABLE
    semester_subject_teaching (
        id TEXT,
        faculty_id TEXT,
        subject_code TEXT,
        acad_year TEXT,
        semester TEXT,
        PRIMARY KEY (faculty_id, subject_code, acad_year, semester),
        FOREIGN KEY (faculty_id) REFERENCES Faculty (faculty_id),
        FOREIGN KEY (acad_year, semester, subject_code) REFERENCES sem_subject_table (acad_year, semester, subject_code)
    );

-- Create the sem_sub_regist table
CREATE TABLE
    sem_sub_regist (
        id TEXT,
        roll_no TEXT,
        acad_year TEXT,
        semester TEXT,
        subject_code TEXT,
        faculty_id TEXT,
        PRIMARY KEY (roll_no, acad_year, semester, subject_code),
        FOREIGN KEY (roll_no) REFERENCES Student (roll_no),
        FOREIGN KEY (faculty_id, subject_code, acad_year, semester) REFERENCES semester_subject_teaching (faculty_id, subject_code, acad_year, semester)
    );

--Create the exam_type_table
CREATE TABLE
    exam_type_table (
        id TEXT,
        exam_type TEXT PRIMARY KEY --internal1,internal2,internal3,external
    );

-- Create the Exams table
CREATE TABLE
    Exams (
        id TEXT,
        exam_code TEXT, --(text + year)
        exam_type TEXT,
        exam_date TEXT,
        acad_year TEXT,
        semester TEXT,
        subject_code TEXT,
        PRIMARY KEY (
            exam_type,
            exam_code,
            acad_year,
            semester,
            subject_code
        ),
        FOREIGN KEY (acad_year, semester, subject_code) REFERENCES sem_subject_table (acad_year, semester, subject_code),
        FOREIGN KEY (exam_type) REFERENCES exam_type_table (exam_type)
    );

--create the stud_exam_table\
CREATE TABLE
    student_exams (
        id TEXT,
        roll_no TEXT,
        acad_year TEXT,
        semester TEXT,
        subject_code TEXT,
        exam_type TEXT,
        exam_code TEXT,
        ob_grades TEXT,
        PRIMARY KEY (
            roll_no,
            acad_year,
            semester,
            subject_code,
            exam_type,
            exam_code
        ),
        FOREIGN KEY (exam_type, exam_code) REFERENCES Exams (exam_type, exam_code),
        FOREIGN KEY (roll_no, acad_year, semester, subject_code) REFERENCES sem_sub_regist (roll_no, acad_year, semester, subject_code)
    );

-- -- Create the stud_sub_marks table
-- CREATE TABLE stud_sub_marks (
--     roll_no TEXT,
--     exam_code TEXT,
--     exam_type TEXT,
--     subject_code TEXT,
--     acad_year TEXT,
--     semester TEXT,
--     ob_grades TEXT,
--     PRIMARY KEY (roll_no, exam_code, exam_type, subject_code, acad_year, semester),
--     FOREIGN  KEY(roll_no,acad_year,semester,subject_code,exam_type,exam_code) REFRENCES student_exams(roll_no,acad_year,semester,subject_code,exam_type,exam_code)
-- );