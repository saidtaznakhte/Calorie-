
import React from 'react';
import { RefreshIcon } from './Icons.js'; // Assuming RefreshIcon is available

const PullToRefreshIndicator = () => {
  return (
    React.createElement("div", { className: "absolute top-0 left-0 right-0 z-40 flex items-center justify-center h-16 bg-primary dark:bg-dark-card text-white dark:text-dark-text-main text-sm font-semibold" },
      React.createElement(RefreshIcon, { className: "w-5 h-5 mr-2 animate-spin" }),
      React.createElement("span", null, "Refreshing...")
    )
  );
};

export default PullToRefreshIndicator;