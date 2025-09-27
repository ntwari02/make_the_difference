const express = require('express');
const { validationResult } = require('express-validator');
const quizController = require('../controllers/quiz.controller');
const { authenticate, authorizeRoles } = require('../../middlewares/auth');
const quizValidators = require('../validators/quiz.validators');

const router = express.Router();

// Validation middleware
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return next();
};

// Quiz Routes for Learners
router.post('/lessons/:lessonId/start', 
  authenticate, 
  authorizeRoles('student', 'admin', 'instructor'),
  quizValidators.validateStartQuiz,
  handleValidation,
  quizController.startQuiz
);

router.get('/lessons/:lessonId/questions',
  authenticate,
  authorizeRoles('student', 'admin', 'instructor'),
  quizValidators.validateStartQuiz,
  handleValidation,
  quizController.getQuizQuestions
);

router.post('/attempts/:attemptId/submit',
  authenticate,
  authorizeRoles('student', 'admin', 'instructor'),
  quizValidators.validateSubmitQuizAnswers,
  handleValidation,
  quizController.submitQuizAnswers
);

router.get('/attempts/:attemptId/results',
  authenticate,
  authorizeRoles('student', 'admin', 'instructor'),
  quizValidators.validateGetQuizResults,
  handleValidation,
  quizController.getQuizResults
);

router.get('/attempts/:attemptId/resume',
  authenticate,
  authorizeRoles('student', 'admin', 'instructor'),
  quizValidators.validateResumeQuiz,
  handleValidation,
  quizController.resumeQuizAttempt
);

router.put('/attempts/:attemptId/abandon',
  authenticate,
  authorizeRoles('student', 'admin', 'instructor'),
  quizValidators.validateAbandonQuiz,
  handleValidation,
  quizController.abandonQuizAttempt
);

router.get('/lessons/:lessonId/history',
  authenticate,
  authorizeRoles('student', 'admin', 'instructor'),
  quizValidators.validateGetQuizHistory,
  handleValidation,
  quizController.getUserQuizHistory
);

router.get('/analytics',
  authenticate,
  authorizeRoles('student', 'admin', 'instructor'),
  quizValidators.validateGetQuizAnalytics,
  handleValidation,
  quizController.getUserQuizAnalytics
);

// Quiz Routes for Instructors
router.post('/lessons/:lessonId/questions',
  authenticate,
  authorizeRoles('instructor', 'admin'),
  quizValidators.validateCreateQuizQuestions,
  handleValidation,
  quizController.createQuizQuestions
);

router.get('/lessons/:lessonId/statistics',
  authenticate,
  authorizeRoles('instructor', 'admin'),
  quizValidators.validateGetQuizStatistics,
  handleValidation,
  quizController.getQuizStatistics
);

module.exports = router;
