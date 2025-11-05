
import React from 'react';

const ProgressSkeleton = () => {
  return (
    React.createElement("div", { className: "p-4 flex flex-col space-y-6 animate-pulse" },
      // View/Timeframe Selectors Skeleton
      React.createElement("div", { className: "flex p-1 bg-light-gray dark:bg-dark-border rounded-full mb-6" },
        React.createElement("div", { className: "w-full h-10 bg-card dark:bg-dark-card rounded-full" }),
        React.createElement("div", { className: "w-full h-10 bg-card dark:bg-dark-card rounded-full ml-1" }),
        React.createElement("div", { className: "w-full h-10 bg-card dark:bg-dark-card rounded-full ml-1" })
      ),
      React.createElement("div", { className: "flex p-1 bg-light-gray dark:bg-dark-border rounded-full mb-6" },
        React.createElement("div", { className: "w-full h-10 bg-card dark:bg-dark-card rounded-full" }),
        React.createElement("div", { className: "w-full h-10 bg-card dark:bg-dark-card rounded-full ml-1" })
      ),

      // AI Suggestion Card Skeleton
      React.createElement("div", { className: "bg-card dark:bg-dark-card p-4 rounded-2xl shadow-sm" },
        React.createElement("div", { className: "h-6 bg-light-gray dark:bg-dark-border rounded w-48 mb-4" }),
        React.createElement("div", { className: "flex items-start mb-3" },
          React.createElement("div", { className: "w-4 h-4 bg-primary rounded-full mr-3 mt-1" }),
          React.createElement("div", { className: "h-4 bg-light-gray dark:bg-dark-border rounded w-full" })
        ),
        React.createElement("div", { className: "flex items-start mb-3" },
          React.createElement("div", { className: "w-4 h-4 bg-primary rounded-full mr-3 mt-1" }),
          React.createElement("div", { className: "h-4 bg-light-gray dark:bg-dark-border rounded w-5/6" })
        ),
        React.createElement("div", { className: "text-center mt-6" },
          React.createElement("div", { className: "h-10 bg-primary rounded-lg w-40 mx-auto" })
        )
      ),

      // Stat Cards Skeleton
      React.createElement("div", { className: "flex gap-4" },
        React.createElement("div", { className: "bg-card dark:bg-dark-card p-4 rounded-2xl flex-1 shadow-sm h-24" },
          React.createElement("div", { className: "h-3 bg-light-gray dark:bg-dark-border rounded w-2/3 mb-2" }),
          React.createElement("div", { className: "h-6 bg-light-gray dark:bg-dark-border rounded w-1/2" })
        ),
        React.createElement("div", { className: "bg-card dark:bg-dark-card p-4 rounded-2xl flex-1 shadow-sm h-24" },
          React.createElement("div", { className: "h-3 bg-light-gray dark:bg-dark-border rounded w-2/3 mb-2" }),
          React.createElement("div", { className: "h-6 bg-light-gray dark:bg-dark-border rounded w-1/2" })
        )
      ),

      // Chart Card Skeleton
      React.createElement("div", { className: "bg-card dark:bg-dark-card rounded-2xl p-4 shadow-sm" },
        React.createElement("div", { className: "h-6 bg-light-gray dark:bg-dark-border rounded w-48 mb-4" }),
        React.createElement("div", { className: "w-full h-64 bg-light-gray dark:bg-dark-border rounded-lg" })
      ),

      // Another Chart/Macro Distribution Card Skeleton
      React.createElement("div", { className: "bg-card dark:bg-dark-card rounded-2xl p-4 shadow-sm" },
        React.createElement("div", { className: "h-6 bg-light-gray dark:bg-dark-border rounded w-48 mb-4" }),
        React.createElement("div", { className: "w-full h-64 bg-light-gray dark:bg-dark-border rounded-lg" })
      )
    )
  );
};

export default ProgressSkeleton;
