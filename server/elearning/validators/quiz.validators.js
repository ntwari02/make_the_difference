const { body, param, query } = require('express-validator');

// Quiz Questions Validation
const validateCreateQuizQuestions = [
  param('lessonId').isString().isLength({ min: 10 }),
  body('questions').isArray({ min: 1 }),
  body('questions.*.question_text').isString().isLength({ min: 10 }),
  body('questions.*.question_type').isIn(['multiple_choice', 'true_false', 'fill_blank', 'short_answer', 'essay']),
  body('questions.*.correct_answer').isString().isLength({ min: 1 }),
  body('questions.*.options').optional().isObject(),
  body('questions.*.explanation').optional().isString(),
  body('questions.*.points').optional().isInt({ min: 1, max: 10 }),
  body('questions.*.difficulty').optional().isIn(['easy', 'medium', 'hard'])
];

// Quiz Answer Validation
const validateSubmitQuizAnswers = [
  param('attemptId').isString().isLength({ min: 10 }),
  body('answers').isArray({ min: 1 }),
  body('answers.*.question_id').isString().isLength({ min: 10 }),
  body('answers.*.user_answer').isString(),
  body('answers.*.time_spent_seconds').optional().isInt({ min: 0 })
];

// Quiz Start Validation
const validateStartQuiz = [
  param('lessonId').isString().isLength({ min: 10 })
];

// Quiz Results Validation
const validateGetQuizResults = [
  param('attemptId').isString().isLength({ min: 10 })
];

// Quiz History Validation
const validateGetQuizHistory = [
  param('lessonId').isString().isLength({ min: 10 })
];

// Quiz Analytics Validation
const validateGetQuizAnalytics = [
  query('courseId').optional().isString().isLength({ min: 10 })
];

// Quiz Statistics Validation
const validateGetQuizStatistics = [
  param('lessonId').isString().isLength({ min: 10 })
];

// Resume Quiz Validation
const validateResumeQuiz = [
  param('attemptId').isString().isLength({ min: 10 })
];

// Abandon Quiz Validation
const validateAbandonQuiz = [
  param('attemptId').isString().isLength({ min: 10 })
];

module.exports = {
  validateCreateQuizQuestions,
  validateSubmitQuizAnswers,
  validateStartQuiz,
  validateGetQuizResults,
  validateGetQuizHistory,
  validateGetQuizAnalytics,
  validateGetQuizStatistics,
  validateResumeQuiz,
  validateAbandonQuiz
};
