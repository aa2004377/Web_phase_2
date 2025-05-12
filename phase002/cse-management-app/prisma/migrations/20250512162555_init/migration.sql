-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Instructor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Course" (
    "course_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "course_name" TEXT NOT NULL,
    "course_description" TEXT,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "InstructorCourse" (
    "capacity" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "course_id" INTEGER NOT NULL,
    "instructor_id" TEXT NOT NULL,

    PRIMARY KEY ("course_id", "instructor_id"),
    CONSTRAINT "InstructorCourse_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course" ("course_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InstructorCourse_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "Instructor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RegisteredStudent" (
    "instructor_course_course_id" INTEGER NOT NULL,
    "instructor_course_instructor_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,

    PRIMARY KEY ("instructor_course_course_id", "instructor_course_instructor_id", "student_id"),
    CONSTRAINT "RegisteredStudent_instructor_course_course_id_instructor_course_instructor_id_fkey" FOREIGN KEY ("instructor_course_course_id", "instructor_course_instructor_id") REFERENCES "InstructorCourse" ("course_id", "instructor_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RegisteredStudent_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompletedCourse" (
    "course_id" INTEGER NOT NULL,
    "student_id" TEXT NOT NULL,
    "grade" TEXT NOT NULL,

    PRIMARY KEY ("course_id", "student_id"),
    CONSTRAINT "CompletedCourse_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course" ("course_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CompletedCourse_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PendingCourse" (
    "course_id" INTEGER NOT NULL,
    "student_id" TEXT NOT NULL,
    "instructor_id" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL,

    PRIMARY KEY ("course_id", "student_id", "instructor_id"),
    CONSTRAINT "PendingCourse_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course" ("course_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PendingCourse_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PendingCourse_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "Instructor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Prerequisite" (
    "course_id" INTEGER NOT NULL,
    "prerequisite_id" INTEGER NOT NULL,

    PRIMARY KEY ("course_id", "prerequisite_id"),
    CONSTRAINT "Prerequisite_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course" ("course_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Prerequisite_prerequisite_id_fkey" FOREIGN KEY ("prerequisite_id") REFERENCES "Course" ("course_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_username_key" ON "Student"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Instructor_username_key" ON "Instructor"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");
