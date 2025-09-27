const { v4: uuidv4 } = require('uuid');
const quizRepo = require('../repositories/quiz.repository');

// Start a new quiz attempt
const startQuiz = async (userId, lessonId) => {
  const attemptId = uuidv4();
  const quizData = await quizRepo.startQuizAttempt(userId, lessonId, attemptId);
  return quizData;
};

// Get quiz questions for a lesson
const getQuizQuestions = async (lessonId) => {
  const questions = await quizRepo.getQuizQuestionsByLesson(lessonId);
  return questions;
};

// Submit quiz answers
const submitQuizAnswers = async (attemptId, answers) => {
  const result = await quizRepo.submitQuizAnswers(attemptId, answers);
  return result;
};

// Get quiz results
const getQuizResults = async (attemptId, userId) => {
  const results = await quizRepo.getQuizResults(attemptId, userId);
  return results;
};

// Resume quiz attempt
const resumeQuizAttempt = async (attemptId, userId) => {
  const attempt = await quizRepo.resumeQuizAttempt(attemptId, userId);
  return attempt;
};

// Abandon quiz attempt
const abandonQuizAttempt = async (attemptId, userId) => {
  const result = await quizRepo.abandonQuizAttempt(attemptId, userId);
  return result;
};

// Get user quiz history
const getUserQuizHistory = async (userId, lessonId) => {
  const history = await quizRepo.getUserQuizHistory(userId, lessonId);
  return history;
};

// Get user quiz analytics
const getUserQuizAnalytics = async (userId) => {
  const analytics = await quizRepo.getUserQuizAnalytics(userId);
  return analytics;
};

// Create quiz questions (for instructors)
const createQuizQuestions = async (lessonId, questions) => {
  const result = await quizRepo.createQuizQuestions(lessonId, questions);
  return result;
};

// Get quiz statistics (for instructors)
const getQuizStatistics = async (lessonId) => {
  const stats = await quizRepo.getQuizStatistics(lessonId);
  return stats;
};

module.exports = {
  startQuiz,
  getQuizQuestions,
  submitQuizAnswers,
  getQuizResults,
  resumeQuizAttempt,
  abandonQuizAttempt,
  getUserQuizHistory,
  getUserQuizAnalytics,
  createQuizQuestions,
  getQuizStatistics
};
