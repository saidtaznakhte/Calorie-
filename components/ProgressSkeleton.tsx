import React from 'react';

const ProgressSkeleton: React.FC = () => {
  return (
    <div className="p-4 flex flex-col space-y-6 animate-pulse">
      {/* View/Timeframe Selectors Skeleton */}
      <div className="flex p-1 bg-light-gray dark:bg-dark-border rounded-full mb-6">
        <div className="w-full h-10 bg-card dark:bg-dark-card rounded-full"></div>
        <div className="w-full h-10 bg-card dark:bg-dark-card rounded-full ml-1"></div>
        <div className="w-full h-10 bg-card dark:bg-dark-card rounded-full ml-1"></div>
      </div>
      <div className="flex p-1 bg-light-gray dark:bg-dark-border rounded-full mb-6">
        <div className="w-full h-10 bg-card dark:bg-dark-card rounded-full"></div>
        <div className="w-full h-10 bg-card dark:bg-dark-card rounded-full ml-1"></div>
      </div>

      {/* AI Suggestion Card Skeleton */}
      <div className="bg-card dark:bg-dark-card p-4 rounded-2xl shadow-sm">
        <div className="h-6 bg-light-gray dark:bg-dark-border rounded w-48 mb-4"></div>
        <div className="flex items-start mb-3">
          <div className="w-4 h-4 bg-primary rounded-full mr-3 mt-1"></div>
          <div className="h-4 bg-light-gray dark:bg-dark-border rounded w-full"></div>
        </div>
        <div className="flex items-start mb-3">
          <div className="w-4 h-4 bg-primary rounded-full mr-3 mt-1"></div>
          <div className="h-4 bg-light-gray dark:bg-dark-border rounded w-5/6"></div>
        </div>
        <div className="text-center mt-6">
          <div className="h-10 bg-primary rounded-lg w-40 mx-auto"></div>
        </div>
      </div>

      {/* Stat Cards Skeleton */}
      <div className="flex gap-4">
        <div className="bg-card dark:bg-dark-card p-4 rounded-2xl flex-1 shadow-sm h-24">
          <div className="h-3 bg-light-gray dark:bg-dark-border rounded w-2/3 mb-2"></div>
          <div className="h-6 bg-light-gray dark:bg-dark-border rounded w-1/2"></div>
        </div>
        <div className="bg-card dark:bg-dark-card p-4 rounded-2xl flex-1 shadow-sm h-24">
          <div className="h-3 bg-light-gray dark:bg-dark-border rounded w-2/3 mb-2"></div>
          <div className="h-6 bg-light-gray dark:bg-dark-border rounded w-1/2"></div>
        </div>
      </div>

      {/* Chart Card Skeleton */}
      <div className="bg-card dark:bg-dark-card rounded-2xl p-4 shadow-sm">
        <div className="h-6 bg-light-gray dark:bg-dark-border rounded w-48 mb-4"></div>
        <div className="w-full h-64 bg-light-gray dark:bg-dark-border rounded-lg"></div>
      </div>

      {/* Another Chart/Macro Distribution Card Skeleton */}
      <div className="bg-card dark:bg-dark-card rounded-2xl p-4 shadow-sm">
        <div className="h-6 bg-light-gray dark:bg-dark-border rounded w-48 mb-4"></div>
        <div className="w-full h-64 bg-light-gray dark:bg-dark-border rounded-lg"></div>
      </div>
    </div>
  );
};

export default ProgressSkeleton;