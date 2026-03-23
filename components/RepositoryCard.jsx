'use client';

import React from 'react';
import ScoreGauge from './ScoreGauge';

export default function RepositoryCard({ repository }) {
  const {
    repository: repo,
    metrics,
    scores,
    insights,
  } = repository;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getDifficultyBadgeColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-900/30 text-green-300 border-green-600';
      case 'Intermediate':
        return 'bg-yellow-900/30 text-yellow-300 border-yellow-600';
      case 'Advanced':
        return 'bg-red-900/30 text-red-300 border-red-600';
      default:
        return 'bg-gray-900/30 text-gray-300 border-gray-600';
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 border border-slate-600/50 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 border-b border-slate-600/50 p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl font-bold text-white hover:text-purple-300 transition-colors"
            >
              {repo.fullName}
            </a>
            <p className="text-gray-300 text-sm mt-1">{repo.description}</p>
          </div>
        </div>
    
        <div className="flex flex-wrap gap-2 mt-3">
          <span className={`inline-block px-3 py-1 text-xs font-semibold border rounded ${getDifficultyBadgeColor(insights.learningDifficulty)}`}>
            {insights.learningDifficulty}
          </span>
          {insights.activelyMaintained && (
            <span className="inline-block px-3 py-1 text-xs font-semibold bg-green-900/30 text-green-300 border border-green-600 rounded">
              ✅ Maintained
            </span>
          )}
          {insights.bestForBeginners && (
            <span className="inline-block px-3 py-1 text-xs font-semibold bg-blue-900/30 text-blue-300 border border-blue-600 rounded">
              📚 Beginner Friendly
            </span>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="px-5 py-4 border-b border-slate-600/50">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-slate-900/30 rounded p-2">
            <p className="text-gray-400">⭐ Stars</p>
            <p className="text-white font-semibold">{repo.stars.toLocaleString()}</p>
          </div>
          <div className="bg-slate-900/30 rounded p-2">
            <p className="text-gray-400">🔀 Forks</p>
            <p className="text-white font-semibold">{repo.forks.toLocaleString()}</p>
          </div>
          <div className="bg-slate-900/30 rounded p-2">
            <p className="text-gray-400">👥 Contributors</p>
            <p className="text-white font-semibold">{metrics.contributors}</p>
          </div>
          <div className="bg-slate-900/30 rounded p-2">
            <p className="text-gray-400">💾 Languages</p>
            <p className="text-white font-semibold">{metrics.languageCount}</p>
          </div>
          <div className="bg-slate-900/30 rounded p-2">
            <p className="text-gray-400">📝 Commits (30d)</p>
            <p className="text-white font-semibold">{metrics.commits30d}</p>
          </div>
          <div className="bg-slate-900/30 rounded p-2">
            <p className="text-gray-400">📅 Last Updated</p>
            <p className="text-white font-semibold">{metrics.daysSinceLastCommit}d ago</p>
          </div>
        </div>
      </div>

      {/* Scores */}
      <div className="px-5 py-4 border-b border-slate-600/50">
        <h4 className="text-white font-semibold mb-3">Scores</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Activity Score</span>
            <div className="flex items-center gap-2">
              <ScoreGauge score={scores.activity} />
              <span className={`text-lg font-bold ${getScoreColor(scores.activity)}`}>
                {scores.activity}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Complexity Score</span>
            <div className="flex items-center gap-2">
              <ScoreGauge score={scores.complexity} />
              <span className={`text-lg font-bold ${getScoreColor(100 - scores.complexity)}`}>
                {scores.complexity}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Maintainability</span>
            <div className="flex items-center gap-2">
              <ScoreGauge score={scores.maintainability} />
              <span className={`text-lg font-bold ${getScoreColor(scores.maintainability)}`}>
                {scores.maintainability}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Health Score</span>
            <div className="flex items-center gap-2">
              <ScoreGauge score={scores.health} />
              <span className={`text-lg font-bold ${getScoreColor(scores.health)}`}>
                {scores.health}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Learning Score</span>
            <div className="flex items-center gap-2">
              <ScoreGauge score={scores.learning} />
              <span className={`text-lg font-bold ${getScoreColor(scores.learning)}`}>
                {scores.learning}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="px-5 py-4">
        <h4 className="text-white font-semibold mb-3">Insights</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Recommendation:</span>
            <span className="text-purple-300 font-semibold">{insights.recommendation}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Complexity:</span>
            <span className="text-blue-300 font-semibold">{insights.complexityLevel}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Activity:</span>
            <span className="text-green-300 font-semibold">{insights.activityLevel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
