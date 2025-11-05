
import React from 'react';

const DashboardSkeleton = () => {
  return (
    React.createElement("div", { className: "p-4 flex flex-col space-y-6 animate-pulse" },
      // Header Skeleton
      React.createElement("div", { className: "p-4 pb-8 flex justify-between items-start bg-gradient-to-br from-gray-300 to-gray-400 dark:from-dark-border dark:to-gray-700 text-white dark:text-dark-text-main relative z-10 rounded-b-3xl shadow-lg" },
        React.createElement("div", null,
          React.createElement("div", { className: "h-6 bg-gray-200 dark:bg-gray-600 rounded w-48 mb-2" }),
          React.createElement("div", { className: "h-4 bg-gray-200 dark:bg-gray-600 rounded w-32" })
        ),
        React.createElement("div", { className: "flex items-center space-x-2" },
          React.createElement("div", { className: "w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600" }),
          React.createElement("div", { className: "w-16 h-8 rounded-full bg-gray-200 dark:bg-gray-600" }),
          React.createElement("div", { className: "w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600" })
        )
      ),

      // Date Selector and Nav Skeleton
      React.createElement("div", { className: "-mt-12 relative z-20 space-y-4" },
        React.createElement("div", { className: "flex justify-between items-center px-4" },
          React.createElement("div", { className: "w-8 h-8 rounded-full bg-light-gray dark:bg-dark-card" }),
          React.createElement("div", { className: "h-6 bg-light-gray dark:bg-dark-card rounded w-32" }),
          React.createElement("div", { className: "w-8 h-8 rounded-full bg-light-gray dark:bg-dark-card" })
        ),
        React.createElement("div", { className: "flex justify-between items-center px-4 space-x-2" },
          Array.from({ length: 7 }).map((_, i) => (
            React.createElement("div", { key: i, className: "flex flex-col items-center justify-center w-12 h-20 rounded-xl bg-card dark:bg-dark-card" },
              React.createElement("div", { className: "h-3 bg-light-gray dark:bg-dark-border rounded w-8 mb-2" }),
              React.createElement("div", { className: "h-6 bg-light-gray dark:bg-dark-border rounded w-8" })
            )
          ))
        )
      ),

      // Daily Summary Card Skeleton
      React.createElement("div", { className: "bg-card dark:bg-dark-card rounded-2xl p-4 shadow-sm flex justify-around items-center" },
        React.createElement("div", { className: "flex flex-col items-center w-20 space-y-1" },
          React.createElement("div", { className: "h-3 bg-light-gray dark:bg-dark-border rounded w-12" }),
          React.createElement("div", { className: "h-6 bg-light-gray dark:bg-dark-border rounded w-16" })
        ),
        React.createElement("div", { className: "w-1 h-8 bg-light-gray dark:bg-dark-border" }),
        React.createElement("div", { className: "flex flex-col items-center w-20 space-y-1" },
          React.createElement("div", { className: "h-3 bg-light-gray dark:bg-dark-border rounded w-12" }),
          React.createElement("div", { className: "h-6 bg-light-gray dark:bg-dark-border rounded w-16" })
        ),
        React.createElement("div", { className: "w-1 h-8 bg-light-gray dark:bg-dark-border" }),
        React.createElement("div", { className: "flex flex-col items-center w-20 space-y-1" },
          React.createElement("div", { className: "h-3 bg-light-gray dark:bg-dark-border rounded w-12" }),
          React.createElement("div", { className: "h-6 bg-light-gray dark:bg-dark-border rounded w-16" })
        )
      ),

      // Concentric Progress Skeleton
      React.createElement("div", { className: "bg-card dark:bg-dark-card rounded-2xl p-6 shadow-sm flex flex-col items-center" },
        React.createElement("div", { className: "relative w-[250px] h-[250px] bg-light-gray dark:bg-dark-border rounded-full flex items-center justify-center" },
          React.createElement("div", { className: "w-24 h-24 bg-card dark:bg-dark-card rounded-full" })
        ),
        React.createElement("div", { className: "flex justify-around w-full mt-6 space-x-4" },
          React.createElement("div", { className: "text-center space-y-1" },
            React.createElement("div", { className: "h-6 bg-light-gray dark:bg-dark-border rounded w-16" }),
            React.createElement("div", { className: "h-3 bg-light-gray dark:bg-dark-border rounded w-12" })
          ),
          React.createElement("div", { className: "text-center space-y-1" },
            React.createElement("div", { className: "h-6 bg-light-gray dark:bg-dark-border rounded w-16" }),
            React.createElement("div", { className: "h-3 bg-light-gray dark:bg-dark-border rounded w-12" })
          ),
          React.createElement("div", { className: "text-center space-y-1" },
            React.createElement("div", { className: "h-6 bg-light-gray dark:bg-dark-border rounded w-16" }),
            React.createElement("div", { className: "h-3 bg-light-gray dark:bg-dark-border rounded w-12" })
          )
        )
      ),

      // Water Intake Pod Skeleton
      React.createElement("div", { className: "bg-card dark:bg-dark-card rounded-2xl p-4 shadow-sm" },
        React.createElement("div", { className: "flex justify-between items-center mb-4" },
          React.createElement("div", { className: "h-6 bg-light-gray dark:bg-dark-border rounded w-24" }),
          React.createElement("div", { className: "w-8 h-8 rounded-full bg-light-gray dark:bg-dark-border" })
        ),
        React.createElement("div", { className: "flex flex-col items-center space-y-4" },
          React.createElement("div", { className: "w-28 h-28 bg-light-gray dark:bg-dark-border rounded-full" }),
          React.createElement("div", { className: "h-4 bg-light-gray dark:bg-dark-border rounded w-32" }),
          React.createElement("div", { className: "flex space-x-3" },
            React.createElement("div", { className: "w-16 h-10 bg-light-gray dark:bg-dark-border rounded-full" }),
            React.createElement("div", { className: "w-16 h-10 bg-light-gray dark:bg-dark-border rounded-full" })
          )
        )
      ),

      // Logged Meals Section Skeleton
      React.createElement("div", { className: "space-y-4" },
        React.createElement("div", { className: "h-6 bg-light-gray dark:bg-dark-border rounded w-36" }),
        Array.from({ length: 3 }).map((_, i) => (
          React.createElement("div", { key: i, className: "bg-card dark:bg-dark-card p-4 rounded-xl shadow-sm" },
            React.createElement("div", { className: "flex justify-between items-center mb-3" },
              React.createElement("div", { className: "flex items-center" },
                React.createElement("div", { className: "w-8 h-8 bg-light-gray dark:bg-dark-border rounded-full mr-3" }),
                React.createElement("div", { className: "h-5 bg-light-gray dark:bg-dark-border rounded w-24" })
              ),
              React.createElement("div", { className: "h-5 bg-light-gray dark:bg-dark-border rounded w-20" })
            ),
            React.createElement("div", { className: "space-y-2" },
              React.createElement("div", { className: "h-4 bg-light-gray dark:bg-dark-border rounded w-full" }),
              React.createElement("div", { className: "h-4 bg-light-gray dark:bg-dark-border rounded w-3/4" })
            )
          )
        ))
      )
    )
  );
};

export default DashboardSkeleton;
