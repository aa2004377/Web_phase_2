import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/** ---------- AUTH ---------- **/

export async function login(username, password) {
  const student = await prisma.student.findUnique({ where: { username } });
  if (student && student.password === password) return { ...student, role: 'student' };

  const instructor = await prisma.instructor.findUnique({ where: { username } });
  if (instructor && instructor.password === password) return { ...instructor, role: 'instructor' };

  const admin = await prisma.admin.findUnique({ where: { username } });
  if (admin && admin.password === password) return { ...admin, role: 'admin' };

  return null;
}

/** ---------- COURSES ---------- **/

export async function getAllCourses() {
  return await prisma.course.findMany({
    include: {
      instructorCourses: {
        include: {
          instructor: true,
          registeredStudents: {
            include: { student: true }
          }
        }
      },
      prerequisites: {
        include: {
          prerequisiteCourse: true
        }
      }
    }
  });
}

export async function searchCourses(searchText) {
  return await prisma.course.findMany({
    where: {
      OR: [
        { course_name: { contains: searchText, mode: 'insensitive' } },
        { category: { contains: searchText, mode: 'insensitive' } }
      ]
    },
    include: {
      instructorCourses: true
    }
  });
}

export async function getCoursePrerequisites(courseId) {
  const prereqs = await prisma.prerequisite.findMany({
    where: { course_id: courseId },
    select: { prerequisite_id: true }
  });
  return prereqs.map(p => p.prerequisite_id);
}

/** ---------- STUDENT ---------- **/

export async function getCompletedCourses(studentId) {
  return await prisma.completedCourse.findMany({
    where: { student_id: studentId },
    include: { course: true }
  });
}

export async function getPendingCourses(studentId) {
  return await prisma.pendingCourse.findMany({
    where: { student_id: studentId },
    include: { course: true, instructor: true }
  });
}

export async function getRegisteredCourses(studentId) {
  return await prisma.registeredStudent.findMany({
    where: { student_id: studentId },
    include: {
      instructorCourse: {
        include: {
          course: true,
          instructor: true
        }
      }
    }
  });
}

export async function hasCompletedCourse(studentId, courseId) {
  const record = await prisma.completedCourse.findUnique({
    where: {
      course_id_student_id: {
        course_id: courseId,
        student_id: studentId
      }
    }
  });
  return !!record;
}

export async function registerStudent(studentId, instructorId, courseId) {
    const alreadyRegistered = await prisma.registeredStudent.findFirst({
      where: {
        student_id: studentId,
        instructor_course_course_id: courseId,
        instructor_course_instructor_id: instructorId
      }
    });
  
    if (alreadyRegistered) {
      throw new Error('Student is already registered to this course.');
    }
  
    return await prisma.registeredStudent.create({
      data: {
        student_id: studentId,
        instructor_course_course_id: courseId,
        instructor_course_instructor_id: instructorId
      }
    });
  }
  

/** ---------- INSTRUCTOR ---------- **/

export async function getInstructorCourses(instructorId) {
  return await prisma.instructorCourse.findMany({
    where: { instructor_id: instructorId },
    include: {
      course: true,
      registeredStudents: {
        include: { student: true }
      }
    }
  });
}

export async function submitGrade(studentId, courseId, grade) {
  // Remove from Registered
  await prisma.registeredStudent.delete({
    where: {
      instructor_course_course_id_instructor_course_instructor_id_student_id: {
        course_id: courseId,
        instructor_id: undefined, // optional if not uniquely needed
        student_id: studentId
      }
    }
  });

  // Add to Completed
  return await prisma.completedCourse.create({
    data: {
      course_id: courseId,
      student_id: studentId,
      grade
    }
  });
}

/** ---------- ADMIN (Optional Extra) ---------- **/

export async function getPendingInstructorCourses() {
  return await prisma.instructorCourse.findMany({
    where: { status: 'pending' },
    include: {
      course: true,
      instructor: true
    }
  });
}

export async function approveInstructorCourse(courseId, instructorId) {
  return await prisma.instructorCourse.update({
    where: {
      course_id_instructor_id: {
        course_id: courseId,
        instructor_id: instructorId
      }
    },
    data: { status: 'validated' }
  });
}

/** ---------- FOR API TESTING ---------- **/

export async function getStudentsInCourse(courseId) {
  return await prisma.registeredStudent.findMany({
    where: {
      instructorCourse: {
        course_id: courseId
      }
    },
    include: {
      student: true,
      instructorCourse: true
    }
  });
}

/** ---------- STATISTICS ---------- **/

export async function getStatistics() {
  const [
    totalStudents,
    totalInstructors,
    totalCourses,
    totalEnrollments,
    validatedClasses,
    pendingClasses,
    courseWithMostEnrollments,
    instructorWithMostCourses,
    avgCoursesPerStudent,
    studentsWith3OrMoreCourses
  ] = await Promise.all([
    prisma.student.count(),
    prisma.instructor.count(),
    prisma.course.count(),
    prisma.registeredStudent.count(),
    prisma.instructorCourse.count({ where: { status: 'validated' } }),
    prisma.instructorCourse.count({ where: { status: 'pending' } }),
    prisma.registeredStudent.groupBy({
      by: ['instructor_course_course_id'],
      _count: { student_id: true },
      orderBy: { _count: { student_id: 'desc' } },
      take: 1
    }),
    prisma.instructorCourse.groupBy({
      by: ['instructor_id'],
      _count: { course_id: true },
      orderBy: { _count: { course_id: 'desc' } },
      take: 1
    }),
    prisma.student.findMany({
      include: {
        registeredCourses: true
      }
    }).then(students => {
      const total = students.reduce((sum, s) => sum + s.registeredCourses.length, 0);
      return (students.length > 0) ? (total / students.length).toFixed(2) : 0;
    }),
    prisma.student.findMany({
      where: {
        registeredCourses: {
          some: {}
        }
      },
      include: {
        registeredCourses: true
      }
    }).then(students =>
      students.filter(s => s.registeredCourses.length >= 3).length
    )
  ]);

  const mostPopularCourse = courseWithMostEnrollments[0]
    ? await prisma.course.findUnique({
        where: { course_id: courseWithMostEnrollments[0].instructor_course_course_id }
      })
    : null;

  const topInstructor = instructorWithMostCourses[0]
    ? await prisma.instructor.findUnique({
        where: { id: instructorWithMostCourses[0].instructor_id }
      })
    : null;

  return {
    totalStudents,
    totalInstructors,
    totalCourses,
    totalEnrollments,
    validatedClasses,
    pendingClasses,
    mostPopularCourse: mostPopularCourse?.course_name || 'N/A',
    topInstructor: topInstructor?.username || 'N/A',
    avgCoursesPerStudent,
    studentsWith3OrMoreCourses
  };
}
