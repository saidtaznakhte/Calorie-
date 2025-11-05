import React from 'react';

const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return <div className={`bg-light-gray dark:bg-dark-border rounded animate-pulse ${className}`} />;
};

export default Skeleton;
