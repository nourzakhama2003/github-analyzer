/**
 * API Route: Analyze GitHub Repository
 * 
 * Endpoint: POST /api/analyze
 * Body: { repos: ['owner/repo', 'owner/repo2', ...] }
 * 
 * Returns analyzed repository data with scores and insights
 */

import axios from 'axios';
import {
  calculateActivityScore,
  calculateComplexityScore,
  classifyLearningDifficulty,
  calculateMaintainabilityScore,
  calculateHealthScore,
  calculateLearningScore,
} from '../../lib/scoringFormulas.js';

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

const githubClient = axios.create({
  baseURL: GITHUB_API_BASE,
  headers: GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {},
});

/**
 * Fetch repository data from GitHub API
 */
async function fetchRepositoryData(owner, repo) {
  try {
    const [repoData, commits30d, contributors, languages, dependencies] = await Promise.all([
      githubClient.get(`/repos/${owner}/${repo}`),
      fetchCommits30Days(owner, repo),
      githubClient.get(`/repos/${owner}/${repo}/contributors?per_page=100`),
      githubClient.get(`/repos/${owner}/${repo}/languages`),
      fetchDependencies(owner, repo),
    ]);

    const issues = await githubClient.get(
      `/repos/${owner}/${repo}/issues?state=all&per_page=1`
    );

    return {
      name: repoData.data.name,
      owner: repoData.data.owner.login,
      fullName: repoData.data.full_name,
      url: repoData.data.html_url,
      description: repoData.data.description || 'No description provided',
      stars: repoData.data.stargazers_count,
      forks: repoData.data.forks_count,
      watchers: repoData.data.watchers_count,
      language: repoData.data.language || 'Unknown',
      topics: repoData.data.topics || [],
      createdAt: repoData.data.created_at,
      updatedAt: repoData.data.updated_at,
      
      // Metrics
      commits30d,
      contributors: contributors.data.length,
      languages: Object.keys(languages.data),
      fileCount: repoData.data.forks_count ? repoData.data.size : 0,
      dependencyCount: dependencies.length,
      openIssues: repoData.data.open_issues_count,
      closedIssues: (issues.headers['link'] ? parseInt(issues.headers['link'].split('&page=')[1].split('>')[0]) : 1) || 0,
      daysSinceLastCommit: daysSinceDate(repoData.data.pushed_at),
    };
  } catch (error) {
    console.error(`Error fetching ${owner}/${repo}:`, error.message);
    return null;
  }
}

/**
 * Fetch commits from last 30 days
 */
async function fetchCommits30Days(owner, repo) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const response = await githubClient.get(
      `/repos/${owner}/${repo}/commits?since=${thirtyDaysAgo.toISOString()}&per_page=1`
    );

    const linkHeader = response.headers.link;
    if (!linkHeader) return response.data.length;

    const lastPageMatch = linkHeader.match(/&page=(\d+)>; rel="last"/);
    return lastPageMatch ? parseInt(lastPageMatch[1]) : response.data.length;
  } catch (error) {
    console.error(`Error fetching commits for ${owner}/${repo}:`, error.message);
    return 0;
  }
}

/**
 * Fetch dependencies (package.json, requirements.txt, etc.)
 */
async function fetchDependencies(owner, repo) {
  const dependencyFiles = [
    'package.json',
    'requirements.txt',
    'Gemfile',
    'go.mod',
    'Cargo.toml',
    'pom.xml',
    'build.gradle',
  ];

  let dependencies = [];

  for (const file of dependencyFiles) {
    try {
      const response = await githubClient.get(
        `/repos/${owner}/${repo}/contents/${file}`
      );
      const content = Buffer.from(response.data.content, 'base64').toString();
      
      // Simple dependency count extraction
      if (file === 'package.json') {
        const json = JSON.parse(content);
        dependencies = Object.keys(json.dependencies || {}).length;
      } else if (file === 'requirements.txt') {
        dependencies = content.split('\n').filter((line) => line.trim()).length;
      } else {
        // Rough estimate for other files
        dependencies = content.split('\n').filter((line) => line.trim()).length / 2;
      }

      if (dependencies > 0) break;
    } catch (error) {
      // File not found, continue to next
      continue;
    }
  }

  return dependencies;
}

/**
 * Calculate days since last commit
 */
function daysSinceDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Main API handler
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { repos } = req.body;

  if (!repos || !Array.isArray(repos) || repos.length === 0) {
    return res.status(400).json({
      error: 'Invalid input. Provide an array of repository URLs or "owner/repo" format.',
      example: { repos: ['facebook/react', 'vuejs/vue'] },
    });
  }

  if (repos.length > 10) {
    return res.status(400).json({
      error: 'Maximum 10 repositories can be analyzed at once',
      received: repos.length,
    });
  }

  const results = [];

  for (const repoInput of repos) {
    const [owner, repo] = repoInput
      .replace('https://github.com/', '')
      .replace('http://github.com/', '')
      .split('/')
      .filter(Boolean);

    if (!owner || !repo) {
      results.push({
        input: repoInput,
        error: 'Invalid repository format. Use "owner/repo" or full GitHub URL',
      });
      continue;
    }

    try {
      const repoData = await fetchRepositoryData(owner, repo);

      if (!repoData) {
        results.push({
          input: repoInput,
          error: 'Repository not found or is private',
        });
        continue;
      }

      // Calculate scores
      const activityScore = calculateActivityScore({
        commits30d: repoData.commits30d,
        contributors: repoData.contributors,
        stars: repoData.stars,
        issuesAndPrs30d: repoData.openIssues,
      });

      const complexityScore = calculateComplexityScore({
        languages: repoData.languages,
        fileCount: repoData.fileCount,
        dependencyCount: repoData.dependencyCount,
        contributors: repoData.contributors,
      });

      const maintainabilityScore = calculateMaintainabilityScore({
        daysSinceLastCommit: repoData.daysSinceLastCommit,
        commits30d: repoData.commits30d,
        contributors: repoData.contributors,
        openIssues: repoData.openIssues,
        closedIssues: repoData.closedIssues,
      });

      const healthScore = calculateHealthScore(
        activityScore,
        complexityScore,
        maintainabilityScore
      );

      const learningScore = calculateLearningScore(
        activityScore,
        complexityScore,
        maintainabilityScore
      );

      const learningDifficulty = classifyLearningDifficulty(
        activityScore,
        complexityScore
      );

      results.push({
        input: repoInput,
        repository: {
          name: repoData.name,
          owner: repoData.owner,
          fullName: repoData.fullName,
          url: repoData.url,
          description: repoData.description,
          stars: repoData.stars,
          forks: repoData.forks,
          language: repoData.language,
          topics: repoData.topics,
          createdAt: repoData.createdAt,
          updatedAt: repoData.updatedAt,
        },
        metrics: {
          commits30d: repoData.commits30d,
          contributors: repoData.contributors,
          languages: repoData.languages,
          languageCount: repoData.languages.length,
          openIssues: repoData.openIssues,
          daysSinceLastCommit: repoData.daysSinceLastCommit,
        },
        scores: {
          activity: activityScore,
          complexity: complexityScore,
          maintainability: maintainabilityScore,
          health: healthScore,
          learning: learningScore,
        },
        insights: {
          learningDifficulty,
          recommendation: getRecommendation(learningScore, activityScore, complexityScore),
          bestForBeginners: learningScore > 70,
          activelyMaintained: maintainabilityScore > 70,
          complexityLevel: getComplexityLevel(complexityScore),
          activityLevel: getActivityLevel(activityScore),
        },
      });
    } catch (error) {
      console.error(`Error analyzing ${owner}/${repo}:`, error);
      results.push({
        input: repoInput,
        error: error.message || 'Error analyzing repository',
      });
    }
  }

  res.status(200).json({
    success: true,
    timestamp: new Date().toISOString(),
    analyzedCount: results.filter((r) => !r.error).length,
    totalCount: results.length,
    data: results,
  });
}

/**
 * Helper functions for insights
 */
function getRecommendation(learningScore, activityScore, complexityScore) {
  if (learningScore > 75) {
    return '⭐ Excellent for beginners';
  } else if (learningScore > 60) {
    return '✅ Good learning resource';
  } else if (complexityScore > 80) {
    return '🚀 Advanced project';
  } else if (activityScore < 30) {
    return '⚠️ Not actively maintained';
  }
  return '📚 Interesting project';
}

function getComplexityLevel(score) {
  if (score < 35) return 'Beginner-Friendly';
  if (score < 65) return 'Moderate';
  return 'Advanced';
}

function getActivityLevel(score) {
  if (score < 30) return 'Inactive/Abandoned';
  if (score < 60) return 'Moderately Active';
  return 'Highly Active';
}
