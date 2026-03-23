/**
 * GitHub Repository Analyzer Scoring Formulas
 * 
 * This module contains all scoring algorithms used to evaluate repositories
 */

/**
 * Normalized scores calculation
 * Converts external metrics to 0-100 scale
 */
export const normalize = (value, min, max) => {
  if (max === min) return 50;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
};

/**
 * Activity Score Formula
 * 
 * Measures how active a repository is based on:
 * - Recent commits (40%)
 * - Number of contributors (30%)
 * - Stars (20%)
 * - Recent issues/PRs (10%)
 * 
 * @param {Object} metrics - Repository metrics
 * @returns {number} Activity score 0-100
 */
export const calculateActivityScore = (metrics) => {
  const {
    commits30d = 0,
    contributors = 0,
    stars = 0,
    issuesAndPrs30d = 0,
  } = metrics;

  // Define realistic benchmarks for normalization
  const benchmarks = {
    commits: { min: 0, max: 1000, excellent: 500 },
    contributors: { min: 0, max: 500, excellent: 100 },
    stars: { min: 0, max: 100000, excellent: 10000 },
    issuesAndPrs: { min: 0, max: 200, excellent: 50 },
  };

  // Normalize metrics
  const commitScore = normalize(commits30d, 0, benchmarks.commits.excellent);
  const contributorScore = normalize(contributors, 0, benchmarks.contributors.excellent);
  const starScore = normalize(Math.log(stars + 1), 0, Math.log(benchmarks.stars.excellent + 1));
  const issueScore = normalize(issuesAndPrs30d, 0, benchmarks.issuesAndPrs.excellent);

  // Weighted average
  const activityScore =
    commitScore * 0.4 +
    contributorScore * 0.3 +
    starScore * 0.2 +
    issueScore * 0.1;

  return Math.round(activityScore);
};

/**
 * Complexity Score Formula
 * 
 * Estimates repository complexity based on:
 * - Number of programming languages (35%)
 * - File count (35%)
 * - Number of dependencies (20%)
 * - Team size (10%)
 * 
 * @param {Object} metrics - Repository metrics
 * @returns {number} Complexity score 0-100
 */
export const calculateComplexityScore = (metrics) => {
  const {
    languages = [],
    fileCount = 0,
    dependencyCount = 0,
    contributors = 0,
  } = metrics;

  // Benchmarks for complexity
  const benchmarks = {
    languages: { min: 0, max: 15, threshold: 5 },
    files: { min: 0, max: 10000, threshold: 1000 },
    dependencies: { min: 0, max: 500, threshold: 100 },
    team: { min: 0, max: 200, threshold: 50 },
  };

  // Normalize metrics
  const languageScore = Math.min(
    100,
    (languages.length / benchmarks.languages.threshold) * 25 +
    normalize(languages.length, 0, benchmarks.languages.max) * 0.75
  );

  const fileScore = normalize(fileCount, 0, benchmarks.files.threshold);

  const depScore = normalize(
    dependencyCount,
    0,
    benchmarks.dependencies.threshold
  );

  const teamScore = normalize(
    contributors,
    0,
    benchmarks.team.threshold
  );

  // Weighted average
  const complexityScore =
    languageScore * 0.35 +
    fileScore * 0.35 +
    depScore * 0.2 +
    teamScore * 0.1;

  return Math.round(complexityScore);
};

/**
 * Learning Difficulty Classification
 * 
 * Classifies repository as Beginner, Intermediate, or Advanced
 * based on activity and complexity scores
 * 
 * @param {number} activityScore - Calculated activity score
 * @param {number} complexityScore - Calculated complexity score
 * @returns {string} Learning difficulty level
 */
export const classifyLearningDifficulty = (activityScore, complexityScore) => {
  // Weighted combined score
  const combinedScore = activityScore * 0.4 + complexityScore * 0.6;

  if (combinedScore < 35) {
    return 'Beginner';
  } else if (combinedScore < 65) {
    return 'Intermediate';
  } else {
    return 'Advanced';
  }
};

/**
 * Maintainability Score Formula
 * 
 * Measures how actively maintained the repository is
 * based on recent commits and contributor engagement
 * 
 * @param {Object} metrics - Repository metrics
 * @returns {number} Maintainability score 0-100
 */
export const calculateMaintainabilityScore = (metrics) => {
  const {
    daysSinceLastCommit = 365,
    commits30d = 0,
    contributors = 0,
    openIssues = 0,
    closedIssues = 0,
  } = metrics;

  // Recent activity weight
  const activityScore = Math.max(0, 100 - daysSinceLastCommit * 0.2);

  // Commit frequency (target: 10+ per month is good)
  const commitScore = Math.min(100, (commits30d / 10) * 50);

  // Issue resolution rate
  const totalIssues = openIssues + closedIssues;
  const resolutionScore = totalIssues > 0
    ? (closedIssues / totalIssues) * 100
    : 50;

  // Team engagement
  const engagementScore = normalize(contributors, 1, 50);

  // Weighted average
  const maintainability =
    activityScore * 0.35 +
    commitScore * 0.25 +
    resolutionScore * 0.25 +
    engagementScore * 0.15;

  return Math.round(maintainability);
};

/**
 * Health Score Formula
 * 
 * Overall health indicator combining all metrics
 * 
 * @param {number} activityScore - Activity score
 * @param {number} complexityScore - Complexity score
 * @param {number} maintainabilityScore - Maintainability score
 * @returns {number} Health score 0-100
 */
export const calculateHealthScore = (activityScore, complexityScore, maintainabilityScore) => {
  return Math.round(
    activityScore * 0.3 +
    maintainabilityScore * 0.4 +
    (100 - complexityScore) * 0.1 + // Inversely related to complexity
    50 * 0.2 // Base score
  );
};

/**
 * Recommendation Score
 * 
 * Determines if a repo is good for beginners/learners
 * Higher score = better for learning
 * 
 * @param {number} activityScore - Activity score
 * @param {number} complexityScore - Complexity score
 * @param {number} maintainabilityScore - Maintainability score
 * @returns {number} Recommendation score 0-100
 */
export const calculateLearningScore = (activityScore, complexityScore, maintainabilityScore) => {
  // Beginners prefer:
  // - Moderate activity (not too fast, not abandoned)
  // - Low complexity
  // - Well-maintained code

  const optimalActivity = 60; // Moderate activity
  const activityPenalty = Math.abs(activityScore - optimalActivity) / optimalActivity;

  const learningScore =
    (100 - complexityScore) * 0.5 + // Prefer simpler repos
    maintainabilityScore * 0.3 + // Well-maintained
    (100 - activityPenalty * 100) * 0.2; // Moderate activity

  return Math.round(Math.max(0, Math.min(100, learningScore)));
};

export default {
  calculateActivityScore,
  calculateComplexityScore,
  classifyLearningDifficulty,
  calculateMaintainabilityScore,
  calculateHealthScore,
  calculateLearningScore,
  normalize,
};
