#!/usr/bin/env node

/**
 * GitHub Repository Analyzer CLI
 * 
 * Usage:
 *   node src/cli/analyzer.js 'owner/repo' 'owner/repo2'
 *   node src/cli/analyzer.js facebook/react vuejs/vue angular/angular
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

// Helper functions
async function fetchRepositoryData(owner, repo) {
  try {
    console.log(`\n📊 Fetching data for ${owner}/${repo}...`);

    const [repoData, commits30d, contributors, languages] = await Promise.all([
      githubClient.get(`/repos/${owner}/${repo}`),
      fetchCommits30Days(owner, repo),
      githubClient.get(`/repos/${owner}/${repo}/contributors?per_page=100`),
      githubClient.get(`/repos/${owner}/${repo}/languages`),
    ]);

    return {
      name: repoData.data.name,
      owner: repoData.data.owner.login,
      fullName: repoData.data.full_name,
      url: repoData.data.html_url,
      description: repoData.data.description || 'No description',
      stars: repoData.data.stargazers_count,
      forks: repoData.data.forks_count,
      language: repoData.data.language || 'Unknown',
      commits30d,
      contributors: contributors.data.length,
      languages: Object.keys(languages.data),
      openIssues: repoData.data.open_issues_count,
      daysSinceLastCommit: daysSinceDate(repoData.data.pushed_at),
    };
  } catch (error) {
    console.error(`❌ Error fetching ${owner}/${repo}:`, error.message);
    return null;
  }
}

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
    return 0;
  }
}

function daysSinceDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function formatScore(score) {
  const maxBar = 30;
  const filledBar = Math.round((score / 100) * maxBar);
  const barChart = '█'.repeat(filledBar) + '░'.repeat(maxBar - filledBar);
  return `${barChart}`;
}

function getActivityLevel(score) {
  if (score >= 80) return '🔥 Extremely Active';
  if (score >= 60) return '⚡ Very Active';
  if (score >= 40) return '✅ Active';
  if (score >= 20) return '⚠️  Moderately Active';
  return '❌ Inactive';
}

function getComplexityLevel(score) {
  if (score >= 80) return '🚀 Highly Advanced';
  if (score >= 60) return '📈 Advanced';
  if (score >= 40) return '⚙️ Moderate';
  return '✨ Beginner Friendly';
}

// Main analyzer function
async function analyzeRepository(owner, repo) {
  console.log('\n' + '='.repeat(60));
  console.log(`ANALYZING: ${owner}/${repo}`);
  console.log('='.repeat(60));

  const repoData = await fetchRepositoryData(owner, repo);
  if (!repoData) {
    console.log('❌ Failed to fetch repository data');
    return null;
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
    fileCount: repoData.stars * 10, // Rough estimate
    dependencyCount: repoData.languages.length * 5,
    contributors: repoData.contributors,
  });

  const maintainabilityScore = calculateMaintainabilityScore({
    daysSinceLastCommit: repoData.daysSinceLastCommit,
    commits30d: repoData.commits30d,
    contributors: repoData.contributors,
    openIssues: repoData.openIssues,
    closedIssues: repoData.openIssues * 2,
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

  // Display results
  console.log('\n📌 REPOSITORY INFO');
  console.log(`   Name: ${repoData.fullName}`);
  console.log(`   URL: ${repoData.url}`);
  console.log(`   Description: ${repoData.description}`);
  console.log(`   ⭐ Stars: ${repoData.stars.toLocaleString()}`);
  console.log(`   🔀 Forks: ${repoData.forks.toLocaleString()}`);
  console.log(`   👥 Contributors: ${repoData.contributors}`);
  console.log(`   🗣️  Languages: ${repoData.languages.join(', ') || 'Unknown'}`);
  console.log(`   📝 Commits (30d): ${repoData.commits30d}`);
  console.log(`   📅 Last Update: ${repoData.daysSinceLastCommit} days ago`);

  console.log('\n📊 SCORING RESULTS');
  console.log(
    `   Activity:       ${activityScore}/100  ${formatScore(activityScore)}  ${getActivityLevel(activityScore)}`
  );
  console.log(
    `   Complexity:     ${complexityScore}/100  ${formatScore(complexityScore)}  ${getComplexityLevel(complexityScore)}`
  );
  console.log(
    `   Maintainability: ${maintainabilityScore}/100  ${formatScore(maintainabilityScore)}`
  );
  console.log(`   Health:         ${healthScore}/100  ${formatScore(healthScore)}`);
  console.log(`   Learning:       ${learningScore}/100  ${formatScore(learningScore)}`);

  console.log('\n🎓 CLASSIFICATION');
  console.log(`   Difficulty: ${learningDifficulty}`);
  console.log(
    `   Best for Beginners: ${learningScore >= 70 ? '✅ Yes' : '❌ No'}`
  );
  console.log(
    `   Actively Maintained: ${maintainabilityScore >= 70 ? '✅ Yes' : '⚠️ May need attention'}`
  );

  console.log('\n💡 INSIGHTS');
  if (learningScore >= 80) {
    console.log('   ✨ Excellent learning resource for beginners!');
  } else if (learningScore >= 60) {
    console.log('   ✅ Good for intermediate developers');
  } else if (complexityScore >= 80) {
    console.log('   🚀 Advanced project - for experienced developers');
  } else if (activityScore < 30) {
    console.log('   ⚠️  Not actively maintained - use with caution');
  }

  console.log('\n' + '='.repeat(60) + '\n');

  return {
    repository: repoData.fullName,
    scores: {
      activity: activityScore,
      complexity: complexityScore,
      maintainability: maintainabilityScore,
      health: healthScore,
      learning: learningScore,
    },
    difficulty: learningDifficulty,
  };
}

// Main CLI entry
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('GitHub Repository Analyzer CLI');
    console.log(
      'Usage: node src/cli/analyzer.js owner/repo [owner/repo2 ...]'
    );
    console.log('\nExample:');
    console.log('  node src/cli/analyzer.js facebook/react vuejs/vue');
    console.log('\nEnvironment Variables:');
    console.log('  GITHUB_TOKEN - GitHub API token (for better rate limits)');
    process.exit(0);
  }

  console.log('\n🚀 GitHub Repository Analyzer');
  console.log(`📦 Analyzing ${args.length} repository(ies)...\n`);

  const results = [];

  for (const repoInput of args) {
    const [owner, repo] = repoInput.split('/');
    if (owner && repo) {
      const result = await analyzeRepository(owner, repo);
      if (result) results.push(result);
    }
  }

  console.log('\n✅ ANALYSIS COMPLETE\n');
  console.log(` Total Analyzed: ${results.length}`);
  console.log(
    ` Highest Activity: ${Math.max(...results.map((r) => r.scores.activity))}`
  );
  console.log(
    ` Highest Complexity: ${Math.max(...results.map((r) => r.scores.complexity))}`
  );
}

main().catch(console.error);
