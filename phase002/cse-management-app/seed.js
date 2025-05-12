const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('Seeding the database...');

async function main() {
  //clear data
  await prisma.registeredStudent.deleteMany();
  await prisma.instructorCourse.deleteMany();
  await prisma.pendingCourse.deleteMany();
  await prisma.completedCourse.deleteMany();
  await prisma.prerequisite.deleteMany();
  await prisma.course.deleteMany();
  await prisma.student.deleteMany();
  await prisma.instructor.deleteMany();
  await prisma.admin.deleteMany();
  console.log('database cleared');


  //create instructor
  await prisma.instructor.createMany({
    data: [
      { id: '4', username: 'instructor1', password: 'password4' },
      { id: '5', username: 'instructor2', password: 'password5' },
      { id: '6', username: 'instructor3', password: 'password6' }
    ]
  });
  console.log('Instructors created.');

  //create admin
  await prisma.admin.create({
    data: { id: '7', username: 'admin1', password: 'password7' }
  });
  console.log('Admin created.');

  //create course
  const courses = [
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
      course_name: "calculus",
      course_description: "math class 101",
      category: "math",
      status: "open"
    },
    {
      course_id: 106,
      course_name: "arabic",
      course_description: "arabic class 101",
      category: "language",
      status: "open"
    },
    {
      course_id: 112,
      course_name: "arabic2",
      course_description: "advanced Arabic course",
      category: "language",
      status: "open"
    }
  ];

  await prisma.course.createMany({ data: courses });
  console.log('Courses created.');
  //create prerequisites
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

  console.log('Prerequisites created.');

  // Create Students with their completed and pending courses
  const students = [
    {
      id: '202004377',
      username: 'student1',
      password: 'password1',
      completedCourses: [
        { course_id: 101, grade: 'A' },
        { course_id: 102, grade: 'B+' },
        { course_id: 104, grade: 'B' }
      ],
      pendingCourses: [
        { course_id: 105, instructor_id: '6', approved: true }
      ]
    },
    {
      id: '202002180',
      username: 'student2',
      password: 'password2',
      completedCourses: [
        { course_id: 101, grade: 'B' },
        { course_id: 102, grade: 'C+' }
      ],
      pendingCourses: [
        { course_id: 105, instructor_id: '6', approved: true }
      ]
    },
    {
      id: '202210817',
      username: 'student3',
      password: 'password3',
      completedCourses: [],
      pendingCourses: []
    }
  ];

  for (const student of students) {
    await prisma.student.create({
      data: {
        id: student.id,
        username: student.username,
        password: student.password,
        completedCourses: {
          create: student.completedCourses
        },
        pendingCourses: {
          create: student.pendingCourses
        }
      }
    });
  }

  console.log('Students created.');

  const instructorCourses = [
    // Course 101
    {
      course_id: 101,
      instructor_id: '5', // instructor2
      capacity: 2,
      status: 'validated',
      registeredStudents: []
    },
    {
      course_id: 101,
      instructor_id: '4', // instructor1
      capacity: 6,
      status: 'pending',
      registeredStudents: ['202210817']
    },
    // Course 102
    {
      course_id: 102,
      instructor_id: '4', // instructor1
      capacity: 3,
      status: 'validated',
      registeredStudents: []
    },
    {
      course_id: 102,
      instructor_id: '6', // instructor3
      capacity: 2,
      status: 'validated',
      registeredStudents: []
    },
    // Course 103
    {
      course_id: 103,
      instructor_id: '4', // instructor1
      capacity: 2,
      status: 'validated',
      registeredStudents: ['202004377']
    },
    // Course 104
    {
      course_id: 104,
      instructor_id: '6', // instructor3
      capacity: 2,
      status: 'validated',
      registeredStudents: ['202002180']
    },
    // Course 105
    {
      course_id: 105,
      instructor_id: '6', // instructor3
      capacity: 5,
      status: 'cancelled',
      registeredStudents: []
    },
    {
      course_id: 105,
      instructor_id: '4', // instructor1
      capacity: 3,
      status: 'validated',
      registeredStudents: ['202210817']
    },
    // Course 106
    {
      course_id: 106,
      instructor_id: '4', // instructor1
      capacity: 5,
      status: 'validated',
      registeredStudents: ['202002180', '202004377', '202210817']
    },
    // Course 112
    {
      course_id: 112,
      instructor_id: '5', // instructor2
      capacity: 11,
      status: 'validated',
      registeredStudents: []
    }
  ];

  for (const ic of instructorCourses) {
    await prisma.instructorCourse.create({
      data: {
        course_id: ic.course_id,
        instructor_id: ic.instructor_id,
        capacity: ic.capacity,
        status: ic.status,
        registeredStudents: {
          create: ic.registeredStudents.map(student_id => ({
            student_id: student_id
          }))
        }
      }
    });
  }
  console.log('Instructor courses created.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });