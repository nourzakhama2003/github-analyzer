'use client';

import React from 'react';

export default function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-purple-900 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-purple-400 rounded-full animate-spin"></div>
          </div>
        </div>
        <p className="text-white text-xl font-semibold mb-2">
          Analyzing Repositories...
        </p>
        <p className="text-gray-400">
          This may take a moment depending on repository size and GitHub API availability
        </p>
      </div>
    </div>
  );
}
