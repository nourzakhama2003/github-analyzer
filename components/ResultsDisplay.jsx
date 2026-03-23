'use client';

import React from 'react';
import RepositoryCard from './RepositoryCard';

export default function ResultsDisplay({ repositories }) {
  const successCount = repositories.filter((r) => !r.error).length;
  const errorCount = repositories.filter((r) => r.error).length;

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-green-900/20 border border-green-500 rounded-lg p-4">
          <p className="text-green-200 font-semibold">Successfully Analyzed</p>
          <p className="text-3xl font-bold text-green-400 mt-1">{successCount}</p>
        </div>
        {errorCount > 0 && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
            <p className="text-red-200 font-semibold">Failed</p>
            <p className="text-3xl font-bold text-red-400 mt-1">{errorCount}</p>
          </div>
        )}
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {repositories.map((repo, index) => (
          <div key={index}>
            {repo.error ? (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
                <p className="font-mono text-gray-300 mb-2">{repo.input}</p>
                <p className="text-red-300 font-semibold">{repo.error}</p>
              </div>
            ) : (
              <RepositoryCard repository={repo} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
