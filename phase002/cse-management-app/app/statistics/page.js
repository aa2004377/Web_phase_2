import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { getStatistics } from '@/lib/repository';
import { redirect } from 'next/navigation';

export default async function StatisticsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/api/auth/signin');

  const stats = await getStatistics();

  const containerStyle = {
    maxWidth: '800px',
    margin: '50px auto',
    padding: '30px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: '30px'
  };

  const listStyle = {
    listStyle: 'none',
    padding: 0,
    fontSize: '18px',
    lineHeight: '1.8'
  };

  const itemStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '12px 20px',
    marginBottom: '10px',
    border: '1px solid #ddd',
    display: 'flex',
    justifyContent: 'space-between'
  };

  const labelStyle = { color: '#555' };
  const valueStyle = { fontWeight: 'bold', color: '#0070f3' };

  return (
    <main style={containerStyle}>
      <h1 style={titleStyle}>📊 Statistics Dashboard</h1>
      <ul style={listStyle}>
        <li style={itemStyle}><span style={labelStyle}>👥 Total Students</span> <span style={valueStyle}>{stats.totalStudents}</span></li>
        <li style={itemStyle}><span style={labelStyle}>👨‍🏫 Total Instructors</span> <span style={valueStyle}>{stats.totalInstructors}</span></li>
        <li style={itemStyle}><span style={labelStyle}>📚 Total Courses</span> <span style={valueStyle}>{stats.totalCourses}</span></li>
        <li style={itemStyle}><span style={labelStyle}>📝 Total Enrollments</span> <span style={valueStyle}>{stats.totalEnrollments}</span></li>
        <li style={itemStyle}><span style={labelStyle}>✅ Validated Classes</span> <span style={valueStyle}>{stats.validatedClasses}</span></li>
        <li style={itemStyle}><span style={labelStyle}>🕐 Pending Classes</span> <span style={valueStyle}>{stats.pendingClasses}</span></li>
        <li style={itemStyle}><span style={labelStyle}>🔥 Most Popular Course</span> <span style={valueStyle}>{stats.mostPopularCourse}</span></li>
        <li style={itemStyle}><span style={labelStyle}>🏆 Instructor with Most Courses</span> <span style={valueStyle}>{stats.topInstructor}</span></li>
        <li style={itemStyle}><span style={labelStyle}>📈 Avg Courses per Student</span> <span style={valueStyle}>{stats.avgCoursesPerStudent}</span></li>
        <li style={itemStyle}><span style={labelStyle}>📊 Students in 3+ Courses</span> <span style={valueStyle}>{stats.studentsWith3OrMoreCourses}</span></li>
      </ul>
    </main>
  );
}
