const { executeQuery } = require('./server/config/database');

async function checkData() {
  try {
    console.log('=== Checking online_classes table ===');
    const onlineClasses = await executeQuery('SELECT COUNT(*) as total FROM online_classes');
    console.log('Total online_classes:', onlineClasses[0].total);
    
    if (onlineClasses[0].total > 0) {
      const sampleData = await executeQuery('SELECT id, course_id, instructor_id, status, created_at FROM online_classes LIMIT 5');
      console.log('Sample data:', JSON.stringify(sampleData, null, 2));
    }
    
    console.log('\n=== Checking courses table ===');
    const courses = await executeQuery('SELECT COUNT(*) as total FROM courses');
    console.log('Total courses:', courses[0].total);
    
    if (courses[0].total > 0) {
      const sampleCourses = await executeQuery('SELECT id, title, price, instructor_id FROM courses LIMIT 5');
      console.log('Sample courses:', JSON.stringify(sampleCourses, null, 2));
    }
    
    console.log('\n=== Checking JOIN query ===');
    const joinResult = await executeQuery(`
      SELECT 
        COUNT(DISTINCT oc.instructor_id) as active_instructors,
        AVG(c.price) as avg_class_price,
        COUNT(CASE WHEN oc.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_classes,
        COUNT(CASE WHEN oc.status = 'live' THEN 1 END) as currently_live
      FROM online_classes oc
      JOIN courses c ON oc.course_id = c.id
    `);
    console.log('JOIN query result:', JSON.stringify(joinResult[0], null, 2));
    
    console.log('\n=== Checking basic online_classes stats ===');
    const basicStats = await executeQuery(`
      SELECT 
        COUNT(*) as total_classes,
        COUNT(CASE WHEN status = 'live' THEN 1 END) as live_classes,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_classes,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_this_period
      FROM online_classes
    `);
    console.log('Basic stats:', JSON.stringify(basicStats[0], null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

checkData();
