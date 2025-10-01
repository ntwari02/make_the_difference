const { executeQuery } = require('../../config/database');

// Quiz Questions Repository
const createQuizQuestion = async (questionData) => {
  const {
    lesson_id,
    question_text,
    question_type,
    options,
    correct_answer,
    explanation,
    points = 1,
    difficulty = 'medium',
    order_index = 0
  } = questionData;

  const questionId = 'quiz-question-' + Date.now();
  
  const query = `
    INSERT INTO quiz_questions (
      id, lesson_id, question_text, question_type, options, correct_answer,
      explanation, points, difficulty, order_index, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  await executeQuery(query, [
    questionId,
    lesson_id,
    question_text,
    question_type,
    options ? JSON.stringify(options) : null,
    correct_answer,
    explanation || null,
    points,
    difficulty,
    order_index
  ]);

  const result = await executeQuery('SELECT * FROM quiz_questions WHERE id = ?', [questionId]);
  return result[0] || null;
};

const getQuizQuestions = async (lessonId) => {
  const query = `
    SELECT * FROM quiz_questions 
    WHERE lesson_id = ? AND is_active = TRUE 
    ORDER BY order_index ASC, created_at ASC
  `;
  
  const questions = await executeQuery(query, [lessonId]);
  
  // Parse JSON options for each question
  return questions.map(question => ({
    ...question,
    options: question.options ? JSON.parse(question.options) : null
  }));
};

// Create multiple quiz questions for a lesson
const createQuizQuestions = async (lessonId, questions) => {
  const createdQuestions = [];
  
  for (let i = 0; i < questions.length; i++) {
    const questionData = {
      lesson_id: lessonId,
      question_text: questions[i].question_text,
      question_type: questions[i].question_type,
      options: questions[i].options || null,
      correct_answer: questions[i].correct_answer,
      explanation: questions[i].explanation || null,
      points: questions[i].points || 1,
      difficulty: questions[i].difficulty || 'medium',
      order_index: questions[i].order_index || i
    };
    
    const createdQuestion = await createQuizQuestion(questionData);
    createdQuestions.push(createdQuestion);
  }
  
  return createdQuestions;
};

const getQuizQuestionById = async (questionId) => {
  const query = 'SELECT * FROM quiz_questions WHERE id = ? AND is_active = TRUE';
  const result = await executeQuery(query, [questionId]);
  
  if (result.length > 0) {
    const question = result[0];
    return {
      ...question,
      options: question.options ? JSON.parse(question.options) : null
    };
  }
  return null;
};

const updateQuizQuestion = async (questionId, updates) => {
  const setClause = [];
  const values = [];
  
  Object.entries(updates).forEach(([key, value]) => {
    if (key === 'options' && value) {
      setClause.push(`${key} = ?`);
      values.push(JSON.stringify(value));
    } else {
      setClause.push(`${key} = ?`);
      values.push(value);
    }
  });
  
  values.push(questionId);
  
  const query = `
    UPDATE quiz_questions 
    SET ${setClause.join(', ')}, updated_at = NOW() 
    WHERE id = ?
  `;
  
  await executeQuery(query, values);
  
  const result = await executeQuery('SELECT * FROM quiz_questions WHERE id = ?', [questionId]);
  return result[0] || null;
};

const deleteQuizQuestion = async (questionId) => {
  const query = 'UPDATE quiz_questions SET is_active = FALSE, updated_at = NOW() WHERE id = ?';
  await executeQuery(query, [questionId]);
  return true;
};

// Quiz Attempts Repository
const createQuizAttempt = async (attemptData) => {
  const {
    user_id,
    lesson_id,
    enrollment_id,
    attempt_number = 1,
    total_questions
  } = attemptData;

  const attemptId = 'quiz-attempt-' + Date.now();
  
  const query = `
    INSERT INTO quiz_attempts (
      id, user_id, lesson_id, enrollment_id, attempt_number,
      total_questions, started_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

  await executeQuery(query, [
    attemptId,
    user_id,
    lesson_id,
    enrollment_id,
    attempt_number,
    total_questions
  ]);

  const result = await executeQuery('SELECT * FROM quiz_attempts WHERE id = ?', [attemptId]);
  return result[0] || null;
};

const getQuizAttempt = async (attemptId) => {
  const query = 'SELECT * FROM quiz_attempts WHERE id = ?';
  const result = await executeQuery(query, [attemptId]);
  return result[0] || null;
};

const getUserQuizAttempts = async (userId, lessonId) => {
  const query = `
    SELECT * FROM quiz_attempts 
    WHERE user_id = ? AND lesson_id = ? 
    ORDER BY attempt_number DESC
  `;
  
  const result = await executeQuery(query, [userId, lessonId]);
  return result;
};

const updateQuizAttempt = async (attemptId, updates) => {
  const setClause = [];
  const values = [];
  
  Object.entries(updates).forEach(([key, value]) => {
    setClause.push(`${key} = ?`);
    values.push(value);
  });
  
  values.push(attemptId);
  
  const query = `
    UPDATE quiz_attempts 
    SET ${setClause.join(', ')}, updated_at = NOW() 
    WHERE id = ?
  `;
  
  await executeQuery(query, values);
  
  const result = await executeQuery('SELECT * FROM quiz_attempts WHERE id = ?', [attemptId]);
  return result[0] || null;
};

const completeQuizAttempt = async (attemptId, scoreData) => {
  const {
    correct_answers,
    total_points,
    earned_points,
    score_percentage,
    time_spent_minutes
  } = scoreData;

  const query = `
    UPDATE quiz_attempts 
    SET correct_answers = ?, total_points = ?, earned_points = ?, 
        score_percentage = ?, time_spent_minutes = ?, 
        status = 'completed', completed_at = NOW(), updated_at = NOW()
    WHERE id = ?
  `;

  await executeQuery(query, [
    correct_answers,
    total_points,
    earned_points,
    score_percentage,
    time_spent_minutes,
    attemptId
  ]);

  const result = await executeQuery('SELECT * FROM quiz_attempts WHERE id = ?', [attemptId]);
  return result[0] || null;
};

// Quiz Answers Repository
const createQuizAnswer = async (answerData) => {
  const {
    attempt_id,
    question_id,
    user_answer,
    is_correct,
    points_earned,
    time_spent_seconds
  } = answerData;

  const answerId = 'quiz-answer-' + Date.now();
  
  const query = `
    INSERT INTO quiz_answers (
      id, attempt_id, question_id, user_answer, is_correct,
      points_earned, time_spent_seconds, answered_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

  await executeQuery(query, [
    answerId,
    attempt_id,
    question_id,
    user_answer,
    is_correct ? 1 : 0,
    points_earned,
    time_spent_seconds
  ]);

  const result = await executeQuery('SELECT * FROM quiz_answers WHERE id = ?', [answerId]);
  return result[0] || null;
};

const getQuizAnswers = async (attemptId) => {
  const query = `
    SELECT qa.*, qq.question_text, qq.question_type, qq.points as question_points
    FROM quiz_answers qa
    JOIN quiz_questions qq ON qa.question_id = qq.id
    WHERE qa.attempt_id = ?
    ORDER BY qa.answered_at ASC
  `;
  
  const result = await executeQuery(query, [attemptId]);
  return result;
};

const getQuizAnswerById = async (answerId) => {
  const query = `
    SELECT qa.*, qq.question_text, qq.question_type, qq.points as question_points
    FROM quiz_answers qa
    JOIN quiz_questions qq ON qa.question_id = qq.id
    WHERE qa.id = ?
  `;
  
  const result = await executeQuery(query, [answerId]);
  return result[0] || null;
};

// Quiz Analytics Repository
const updateQuizAnalytics = async (userId, lessonId, courseId, attemptData) => {
  const {
    score_percentage,
    time_spent_minutes
  } = attemptData;

  // Check if analytics record exists
  const existingQuery = 'SELECT * FROM quiz_analytics WHERE user_id = ? AND lesson_id = ?';
  const existing = await executeQuery(existingQuery, [userId, lessonId]);

  if (existing.length > 0) {
    // Update existing record
    const analytics = existing[0];
    const newTotalAttempts = analytics.total_attempts + 1;
    const newAverageScore = ((analytics.average_score * analytics.total_attempts) + score_percentage) / newTotalAttempts;
    const newBestScore = Math.max(analytics.best_score, score_percentage);
    const newTotalTime = analytics.total_time_spent_minutes + time_spent_minutes;
    
    // Determine improvement trend
    let improvementTrend = 'stable';
    if (score_percentage > analytics.best_score) {
      improvementTrend = 'improving';
    } else if (score_percentage < analytics.average_score * 0.8) {
      improvementTrend = 'declining';
    }

    const updateQuery = `
      UPDATE quiz_analytics 
      SET total_attempts = ?, best_score = ?, average_score = ?, 
          total_time_spent_minutes = ?, last_attempt_date = NOW(),
          improvement_trend = ?, updated_at = NOW()
      WHERE user_id = ? AND lesson_id = ?
    `;

    await executeQuery(updateQuery, [
      newTotalAttempts,
      newBestScore,
      newAverageScore,
      newTotalTime,
      improvementTrend,
      userId,
      lessonId
    ]);
  } else {
    // Create new record
    const analyticsId = 'quiz-analytics-' + Date.now();
    const insertQuery = `
      INSERT INTO quiz_analytics (
        id, user_id, lesson_id, course_id, total_attempts, best_score,
        average_score, total_time_spent_minutes, last_attempt_date,
        improvement_trend, created_at
      ) VALUES (?, ?, ?, ?, 1, ?, ?, ?, NOW(), 'stable', NOW())
    `;

    await executeQuery(insertQuery, [
      analyticsId,
      userId,
      lessonId,
      courseId,
      score_percentage,
      score_percentage,
      time_spent_minutes
    ]);
  }

  const result = await executeQuery(existingQuery, [userId, lessonId]);
  return result[0] || null;
};

const getUserQuizAnalytics = async (userId, courseId = null) => {
  let query = `
    SELECT qa.*, cl.title as lesson_title, c.title as course_title
    FROM quiz_analytics qa
    JOIN course_lessons cl ON qa.lesson_id = cl.id
    JOIN courses c ON qa.course_id = c.id
    WHERE qa.user_id = ?
  `;
  
  const params = [userId];
  
  if (courseId) {
    query += ' AND qa.course_id = ?';
    params.push(courseId);
  }
  
  query += ' ORDER BY qa.last_attempt_date DESC';
  
  const result = await executeQuery(query, params);
  return result;
};

// Quiz Feedback Repository
const createQuizFeedback = async (feedbackData) => {
  const {
    answer_id,
    instructor_id,
    feedback_text,
    additional_points = 0
  } = feedbackData;

  const feedbackId = 'quiz-feedback-' + Date.now();
  
  const query = `
    INSERT INTO quiz_feedback (
      id, answer_id, instructor_id, feedback_text, additional_points,
      is_reviewed, reviewed_at, created_at
    ) VALUES (?, ?, ?, ?, ?, TRUE, NOW(), NOW())
  `;

  await executeQuery(query, [
    feedbackId,
    answer_id,
    instructor_id,
    feedback_text,
    additional_points
  ]);

  const result = await executeQuery('SELECT * FROM quiz_feedback WHERE id = ?', [feedbackId]);
  return result[0] || null;
};

const getQuizFeedback = async (answerId) => {
  const query = `
    SELECT qf.*, u.first_name, u.last_name
    FROM quiz_feedback qf
    LEFT JOIN users u ON qf.instructor_id = u.id
    WHERE qf.answer_id = ?
  `;
  
  const result = await executeQuery(query, [answerId]);
  return result[0] || null;
};

// Additional functions needed by the service
const getQuizQuestionsByLesson = async (lessonId) => {
  return getQuizQuestions(lessonId);
};

const startQuizAttempt = async (userId, lessonId, attemptId) => {
  const attemptData = {
    id: attemptId,
    user_id: userId,
    lesson_id: lessonId,
    status: 'in_progress',
    started_at: new Date()
  };
  return createQuizAttempt(attemptData);
};

const submitQuizAnswers = async (attemptId, answers) => {
  // Create answers for each question
  for (const answer of answers) {
    const answerData = {
      attempt_id: attemptId,
      question_id: answer.question_id,
      user_answer: answer.user_answer,
      time_spent_seconds: answer.time_spent_seconds || 0,
      is_correct: false // Will be calculated based on correct_answer
    };
    await createQuizAnswer(answerData);
  }
  
  // Complete the attempt
  const attempt = await getQuizAttempt(attemptId);
  return completeQuizAttempt(attemptId, { 
    completed_at: new Date(),
    status: 'completed'
  });
};

const getQuizResults = async (attemptId, userId) => {
  const attempt = await getQuizAttempt(attemptId);
  const answers = await getQuizAnswers(attemptId);
  return { attempt, answers };
};

const resumeQuizAttempt = async (attemptId, userId) => {
  return getQuizAttempt(attemptId);
};

const abandonQuizAttempt = async (attemptId, userId) => {
  return updateQuizAttempt(attemptId, { 
    status: 'abandoned',
    abandoned_at: new Date()
  });
};

const getUserQuizHistory = async (userId, lessonId) => {
  return getUserQuizAttempts(userId, lessonId);
};

const getQuizStatistics = async (lessonId) => {
  const query = `
    SELECT 
      COUNT(*) as total_attempts,
      AVG(score) as average_score,
      MAX(score) as highest_score,
      MIN(score) as lowest_score
    FROM quiz_attempts 
    WHERE lesson_id = ? AND status = 'completed'
  `;
  const result = await executeQuery(query, [lessonId]);
  return result[0] || { total_attempts: 0, average_score: 0, highest_score: 0, lowest_score: 0 };
};

module.exports = {
  // Quiz Questions
  createQuizQuestion,
  createQuizQuestions,
  getQuizQuestions,
  getQuizQuestionsByLesson,
  getQuizQuestionById,
  updateQuizQuestion,
  deleteQuizQuestion,
  
  // Quiz Attempts
  createQuizAttempt,
  startQuizAttempt,
  getQuizAttempt,
  getUserQuizAttempts,
  updateQuizAttempt,
  completeQuizAttempt,
  resumeQuizAttempt,
  abandonQuizAttempt,
  
  // Quiz Answers
  createQuizAnswer,
  getQuizAnswers,
  getQuizAnswerById,
  submitQuizAnswers,
  
  // Quiz Results & History
  getQuizResults,
  getUserQuizHistory,
  getQuizStatistics,
  
  // Quiz Analytics
  updateQuizAnalytics,
  getUserQuizAnalytics,
  
  // Quiz Feedback
  createQuizFeedback,
  getQuizFeedback
};
