import React from 'react';

const Skeleton = ({ className }) => {
  return React.createElement("div", { className: `bg-light-gray dark:bg-dark-border rounded animate-pulse ${className}` });
};

export default Skeleton;
