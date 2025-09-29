const { executeQuery } = require('./server/config/database');

async function insertTestData() {
  try {
    console.log('=== Inserting test data ===');
    
    // First, check if we have any users (instructors)
    const users = await executeQuery('SELECT id FROM users WHERE role = "instructor" LIMIT 1');
    if (users.length === 0) {
      console.log('No instructors found. Creating a test instructor...');
      await executeQuery(`
        INSERT INTO users (id, username, email, password_hash, role, first_name, last_name, is_active, email_verified)
        VALUES (UUID(), 'test_instructor', 'instructor@test.com', 'hashed_password', 'instructor', 'Test', 'Instructor', 1, 1)
      `);
    }
    
    // Get an instructor
    const instructor = await executeQuery('SELECT id FROM users WHERE role = "instructor" LIMIT 1');
    const instructorId = instructor[0].id;
    console.log('Using instructor ID:', instructorId);
    
    // Check if we have any courses
    const courses = await executeQuery('SELECT id FROM courses LIMIT 1');
    if (courses.length === 0) {
      console.log('No courses found. Creating a test course...');
      await executeQuery(`
        INSERT INTO courses (id, title, description, price, category, level, duration_hours, instructor_id, is_published, status)
        VALUES (UUID(), 'Test Course', 'A test course for analytics', 99.99, 'Technology', 'beginner', 10, ?, 1, 'published')
      `, [instructorId]);
    }
    
    // Get a course
    const course = await executeQuery('SELECT id FROM courses LIMIT 1');
    const courseId = course[0].id;
    console.log('Using course ID:', courseId);
    
    // Check if we have any online classes
    const onlineClasses = await executeQuery('SELECT COUNT(*) as count FROM online_classes');
    console.log('Current online classes count:', onlineClasses[0].count);
    
    if (onlineClasses[0].count === 0) {
      console.log('No online classes found. Creating test online classes...');
      
      // Create a live class
      await executeQuery(`
        INSERT INTO online_classes (id, course_id, title, description, instructor_id, class_type, start_time, end_time, duration_minutes, status)
        VALUES (UUID(), ?, 'Live Test Class', 'A live test class', ?, 'live', NOW(), DATE_ADD(NOW(), INTERVAL 60 MINUTE), 60, 'live')
      `, [courseId, instructorId]);
      
      // Create a scheduled class
      await executeQuery(`
        INSERT INTO online_classes (id, course_id, title, description, instructor_id, class_type, start_time, end_time, duration_minutes, status)
        VALUES (UUID(), ?, 'Scheduled Test Class', 'A scheduled test class', ?, 'live', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 1 DAY 60 MINUTE), 60, 'scheduled')
      `, [courseId, instructorId]);
      
      // Create a completed class
      await executeQuery(`
        INSERT INTO online_classes (id, course_id, title, description, instructor_id, class_type, start_time, end_time, duration_minutes, status)
        VALUES (UUID(), ?, 'Completed Test Class', 'A completed test class', ?, 'live', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY 60 MINUTE), 60, 'completed')
      `, [courseId, instructorId]);
      
      console.log('Created 3 test online classes');
    }
    
    console.log('\n=== Final counts ===');
    const finalCounts = await executeQuery(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'instructor') as instructors,
        (SELECT COUNT(*) FROM courses) as courses,
        (SELECT COUNT(*) FROM online_classes) as online_classes
    `);
    console.log('Final counts:', JSON.stringify(finalCounts[0], null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

insertTestData();
