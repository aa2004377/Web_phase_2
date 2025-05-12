const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const GRADES = ['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'];
const VALID_GRADES = ['A', 'B+', 'B', 'C+', 'C', 'D+', 'D'];

function randomValidGrade() {
  return VALID_GRADES[Math.floor(Math.random() * VALID_GRADES.length)];
}

function getRandomCourseIds(courseIds, count) {
  const shuffled = [...courseIds].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function main() {
  console.log('⏳ Clearing database...');
  await prisma.registeredStudent.deleteMany();
  await prisma.instructorCourse.deleteMany();
  await prisma.pendingCourse.deleteMany();
  await prisma.completedCourse.deleteMany();
  await prisma.prerequisite.deleteMany();
  await prisma.course.deleteMany();
  await prisma.student.deleteMany();
  await prisma.instructor.deleteMany();
  await prisma.admin.deleteMany();
  console.log('✅ Database cleared.');

  console.log('👨‍🏫 Creating instructors...');
  await prisma.instructor.createMany({
    data: [
      { id: '4', username: 'instructor1', password: 'password4' },
      { id: '5', username: 'instructor2', password: 'password5' },
      { id: '6', username: 'instructor3', password: 'password6' }
    ]
  });

  console.log('👮 Creating admin...');
  await prisma.admin.create({
    data: { id: '7', username: 'admin1', password: 'password7' }
  });

  console.log('📘 Creating core courses...');
  const coreCourses = [
    {
      course_id: 101,
      course_name: "Programming Concepts",
      course_description: "Learn the basics of programming using Python.",
      category: "Programming",
      status: "open"
    },
    {
      course_id: 102,
      course_name: "Object-Oriented Programming (OOP)",
      course_description: "Understand the principles of OOP using Java.",
      category: "Programming",
      status: "open"
    },
    {
      course_id: 103,
      course_name: "Web Development",
      course_description: "Learn how to build websites using HTML, CSS, and JavaScript.",
      category: "Programming",
      status: "open"
    },
    {
      course_id: 104,
      course_name: "Data Structures",
      course_description: "Explore various data structures and their applications.",
      category: "Computer Science",
      status: "open"
    },
    {
      course_id: 105,
      course_name: "Calculus",
      course_description: "",
      category: "Math",
      status: "open"
    },
    {
      course_id: 106,
      course_name: "Arabic",
      course_description: "",
      category: "Language",
      status: "open"
    },
    {
      course_id: 112,
      course_name: "Arabic 2",
      course_description: "Advanced Arabic course",
      category: "Language",
      status: "open"
    }
  ];
  await prisma.course.createMany({ data: coreCourses });

  await prisma.prerequisite.createMany({
    data: [
      { course_id: 102, prerequisite_id: 101 },
      { course_id: 103, prerequisite_id: 101 },
      { course_id: 103, prerequisite_id: 102 },
      { course_id: 103, prerequisite_id: 104 },
      { course_id: 104, prerequisite_id: 101 },
      { course_id: 104, prerequisite_id: 102 },
      { course_id: 112, prerequisite_id: 106 }
    ]
  });

  console.log('👩‍🎓 Creating 3 original students...');
  await prisma.student.createMany({
    data: [
      { id: '202004377', username: 'student1', password: 'password1' },
      { id: '202002180', username: 'student2', password: 'password2' },
      { id: '202210817', username: 'student3', password: 'password3' }
    ]
  });

  await prisma.completedCourse.createMany({
    data: [
      { student_id: '202004377', course_id: 101, grade: 'A' },
      { student_id: '202004377', course_id: 102, grade: 'B+' },
      { student_id: '202004377', course_id: 104, grade: 'B' },
      { student_id: '202002180', course_id: 101, grade: 'B' },
      { student_id: '202002180', course_id: 102, grade: 'C+' }
    ]
  });

  console.log('📘 Creating 50 additional courses...');
  const extraCourseData = [];
  for (let i = 1; i <= 50; i++) {
    extraCourseData.push({
      course_id: 200 + i,
      course_name: `Course ${i}`,
      course_description: `This is the description for Course ${i}`,
      category: i % 2 === 0 ? 'Programming' : 'Math',
      status: 'open',
    });
  }
  await prisma.course.createMany({ data: extraCourseData });

  const allCourses = await prisma.course.findMany();
  const allCourseIds = allCourses.map(c => c.course_id);

  console.log('👩‍🎓 Creating 500 additional students...');
  for (let i = 4; i <= 503; i++) {
    const studentId = `s${String(i).padStart(5, '0')}`;
    const completedCourses = getRandomCourseIds(allCourseIds, Math.floor(Math.random() * 5) + 1).map(course_id => ({
      course_id,
      grade: randomValidGrade()
    }));

    await prisma.student.create({
      data: {
        id: studentId,
        username: `student${i}`,
        password: `pass${i}`,
        completedCourses: {
          create: completedCourses
        }
      }
    });
  }

  console.log('📚 Creating instructorCourse entries...');
  const instructors = ['4', '5', '6'];
  for (let course of allCourses) {
    const alreadyExists = await prisma.instructorCourse.findFirst({
      where: { course_id: course.course_id }
    });

    if (!alreadyExists) {
      const assignedInstructor = instructors[Math.floor(Math.random() * instructors.length)];
      await prisma.instructorCourse.create({
        data: {
          course_id: course.course_id,
          instructor_id: assignedInstructor,
          capacity: 30,
          status: 'validated'
        }
      });
    }
  }

  console.log('📝 Registering 300 students in random courses...');
  const instructorCourses = await prisma.instructorCourse.findMany();
  for (let i = 4; i <= 303; i++) {
    const studentId = `s${String(i).padStart(5, '0')}`;
    const courseAssignments = getRandomCourseIds(allCourseIds, 3);

    for (let courseId of courseAssignments) {
      const instructorCourse = instructorCourses.find(ic => ic.course_id === courseId);
      if (!instructorCourse) continue;

      const hasCompleted = await prisma.completedCourse.findUnique({
        where: {
          course_id_student_id: {
            course_id: courseId,
            student_id: studentId
          }
        }
      });

      if (!hasCompleted) {
        await prisma.registeredStudent.create({
          data: {
            student_id: studentId,
            instructor_course_course_id: courseId,
            instructor_course_instructor_id: instructorCourse.instructor_id
          }
        });
      }
    }
  }

  console.log('✅ Seeding complete.');
}

main()
  .catch(e => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
