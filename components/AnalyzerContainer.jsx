'use client';

import React, { useState } from 'react';
import RepositoryInput from './RepositoryInput';
import ResultsDisplay from './ResultsDisplay';
import LoadingState from './LoadingState';

export default function AnalyzerContainer() {
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analyzed, setAnalyzed] = useState(false);

  const handleAnalyze = async (repoList) => {
    setLoading(true);
    setError(null);
    setAnalyzed(false);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repos: repoList }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze repositories');
      }

      const data = await response.json();
      setRepositories(data.data || []);
      setAnalyzed(true);
    } catch (err) {
      setError(err.message);
      setRepositories([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            GitHub Repository Analyzer
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Discover insights about GitHub repositories
          </p>
          <p className="text-gray-400">
            Analyze repository activity, complexity, and learning difficulty with advanced scoring formulas
          </p>
        </div>

        {/* Input Section */}
        {!analyzed && (
          <div className="mb-12">
            <RepositoryInput onAnalyze={handleAnalyze} loading={loading} />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-8 bg-red-900/20 border border-red-500 text-red-200 px-6 py-4 rounded-lg">
            <p className="font-semibold">Error: {error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && <LoadingState />}

        {/* Results Display */}
        {analyzed && !loading && (
          <>
            <div className="mb-8">
              <button
                onClick={() => {
                  setAnalyzed(false);
                  setRepositories([]);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
              >
                ← Analyze Another Repository
              </button>
            </div>
            <ResultsDisplay repositories={repositories} />
          </>
        )}
      </div>
    </div>
  );
}
