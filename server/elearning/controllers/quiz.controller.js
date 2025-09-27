const quizService = require('../services/quiz.service');

// Helpers
const ok = (res, data) => res.json(data);
const created = (res, data) => res.status(201).json(data);
const bad = (res, message) => res.status(400).json({ message });
const notFound = (res) => res.status(404).json({ message: 'Not found' });
const unauthorized = (res) => res.status(401).json({ message: 'Unauthorized' });

// Start a new quiz attempt
const startQuiz = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    const quizData = await quizService.startQuiz(userId, lessonId);
    return created(res, {
      message: 'Quiz started successfully',
      quiz: quizData
    });
  } catch (error) {
    return bad(res, error.message);
  }
};

// Submit quiz answers
const submitQuizAnswers = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return bad(res, 'Answers array is required');
    }

    const result = await quizService.submitQuizAnswers(attemptId, answers);
    return ok(res, {
      message: 'Quiz submitted successfully',
      result: result
    });
  } catch (error) {
    return bad(res, error.message);
  }
};

// Get quiz results
const getQuizResults = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const results = await quizService.getQuizResults(attemptId);
    
    // Verify the attempt belongs to the current user
    if (results.attempt.user_id !== userId) {
      return unauthorized(res);
    }

    return ok(res, {
      message: 'Quiz results retrieved successfully',
      results: results
    });
  } catch (error) {
    return bad(res, error.message);
  }
};

// Get user's quiz history for a lesson
const getUserQuizHistory = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    const history = await quizService.getUserQuizHistory(userId, lessonId);
    return ok(res, {
      message: 'Quiz history retrieved successfully',
      history: history
    });
  } catch (error) {
    return bad(res, error.message);
  }
};

// Get user's quiz analytics
const getUserQuizAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.query;

    const analytics = await quizService.getUserQuizAnalytics(userId, courseId);
    return ok(res, {
      message: 'Quiz analytics retrieved successfully',
      analytics: analytics
    });
  } catch (error) {
    return bad(res, error.message);
  }
};

// Create quiz questions (for instructors)
const createQuizQuestions = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions)) {
      return bad(res, 'Questions array is required');
    }

    const createdQuestions = await quizService.createQuizQuestions(lessonId, questions);
    return created(res, {
      message: 'Quiz questions created successfully',
      questions: createdQuestions
    });
  } catch (error) {
    return bad(res, error.message);
  }
};

// Get quiz questions for a lesson (for taking quiz)
const getQuizQuestions = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    // Verify user is enrolled in the course
    const enrollment = await quizService.getUserEnrollmentForLesson(userId, lessonId);
    if (!enrollment) {
      return unauthorized(res);
    }

    const quizData = await quizService.startQuiz(userId, lessonId);
    return ok(res, {
      message: 'Quiz questions retrieved successfully',
      quiz: quizData
    });
  } catch (error) {
    return bad(res, error.message);
  }
};

// Get quiz statistics for instructors
const getQuizStatistics = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    // This would require additional service methods to get statistics
    // For now, return a placeholder response
    return ok(res, {
      message: 'Quiz statistics retrieved successfully',
      statistics: {
        lesson_id: lessonId,
        total_attempts: 0,
        average_score: 0,
        completion_rate: 0,
        common_mistakes: []
      }
    });
  } catch (error) {
    return bad(res, error.message);
  }
};

// Resume quiz attempt
const resumeQuizAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const attempt = await quizService.getQuizAttempt(attemptId);
    if (!attempt) {
      return notFound(res);
    }

    if (attempt.user_id !== userId) {
      return unauthorized(res);
    }

    if (attempt.status === 'completed') {
      return bad(res, 'Quiz has already been completed');
    }

    const results = await quizService.getQuizResults(attemptId);
    return ok(res, {
      message: 'Quiz attempt resumed successfully',
      attempt: results.attempt,
      answers: results.answers
    });
  } catch (error) {
    return bad(res, error.message);
  }
};

// Abandon quiz attempt
const abandonQuizAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const attempt = await quizService.getQuizAttempt(attemptId);
    if (!attempt) {
      return notFound(res);
    }

    if (attempt.user_id !== userId) {
      return unauthorized(res);
    }

    if (attempt.status === 'completed') {
      return bad(res, 'Quiz has already been completed');
    }

    // Update attempt status to abandoned
    await quizService.updateQuizAttempt(attemptId, { status: 'abandoned' });

    return ok(res, {
      message: 'Quiz attempt abandoned successfully'
    });
  } catch (error) {
    return bad(res, error.message);
  }
};

module.exports = {
  startQuiz,
  submitQuizAnswers,
  getQuizResults,
  getUserQuizHistory,
  getUserQuizAnalytics,
  createQuizQuestions,
  getQuizQuestions,
  getQuizStatistics,
  resumeQuizAttempt,
  abandonQuizAttempt
};
