import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { getStatistics } from '@/lib/repository';
import { redirect } from 'next/navigation';

export default async function StatisticsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/api/auth/signin');

  const stats = await getStatistics();

  return (
    <main className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-6">📊 Statistics Dashboard</h1>
      <ul className="space-y-3 text-lg">
        <li>👥 Total Students: <strong>{stats.totalStudents}</strong></li>
        <li>👨‍🏫 Total Instructors: <strong>{stats.totalInstructors}</strong></li>
        <li>📚 Total Courses: <strong>{stats.totalCourses}</strong></li>
        <li>📝 Total Enrollments: <strong>{stats.totalEnrollments}</strong></li>
        <li>✅ Validated Classes: <strong>{stats.validatedClasses}</strong></li>
        <li>🕐 Pending Classes: <strong>{stats.pendingClasses}</strong></li>
        <li>🔥 Most Popular Course: <strong>{stats.mostPopularCourse}</strong></li>
        <li>🏆 Instructor with Most Courses: <strong>{stats.topInstructor}</strong></li>
        <li>📈 Avg Courses per Student: <strong>{stats.avgCoursesPerStudent}</strong></li>
        <li>📊 Students in 3+ Courses: <strong>{stats.studentsWith3OrMoreCourses}</strong></li>
      </ul>
    </main>
  );
}
