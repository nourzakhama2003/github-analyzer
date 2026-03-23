'use client';

import React, { useState } from 'react';

export default function RepositoryInput({ onAnalyze, loading }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const repos = input
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (repos.length === 0) {
      setError('Please enter at least one repository');
      return;
    }

    if (repos.length > 10) {
      setError('Maximum 10 repositories allowed');
      return;
    }

    // Validate format
    for (const repo of repos) {
      if (
        !repo.match(/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+$/) &&
        !repo.includes('github.com')
      ) {
        setError(`Invalid format: "${repo}". Use "owner/repo" or GitHub URL`);
        return;
      }
    }

    onAnalyze(repos);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
      <div className="mb-6">
        <label className="block text-white text-lg font-semibold mb-3">
          GitHub Repositories
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Enter repository URLs or "owner/repo" format\n\nExamples:\nfacebook/react\nvuejs/vue\nhttps://github.com/angular/angular`}
          className="w-full h-40 bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 font-mono text-sm"
          disabled={loading}
        />
      </div>

      {error && (
        <div className="mb-4 text-red-400 text-sm bg-red-900/20 py-2 px-3 rounded">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-gray-300 text-sm">
          Maximum 10 repositories per analysis
        </p>
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          {loading ? 'Analyzing...' : 'Analyze Repositories'}
        </button>
      </div>
    </form>
  );
}
