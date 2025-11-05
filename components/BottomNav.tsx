import React from 'react';
import { Page } from '../types';
import { HomeIcon, BookOpenIcon, ProgressIcon, SettingsIcon, PlusIcon } from './Icons'; // Changed BarChartIcon to ProgressIcon
import { useAppContext } from '../contexts/AppContext';

interface NavItemProps {
  page: Page;
  Icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ page, Icon, label, isActive, onClick }) => {
  const { triggerHapticFeedback } = useAppContext();
  const handleClick = () => {
    triggerHapticFeedback();
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className="flex flex-col items-center justify-center flex-1 h-16 transition-colors duration-200 ease-in-out focus:outline-none group transition-transform active:scale-95"
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-primary' : 'text-medium-gray dark:text-dark-gray group-hover:text-primary'}`} />
      <span className={`text-xs ${isActive ? 'text-primary' : 'text-medium-gray dark:text-dark-gray group-hover:text-primary'}`}>{label}</span>
    </button>
  );
};

const BottomNav: React.FC = () => {
  const { page: currentPage, navigateTo, triggerHapticFeedback } = useAppContext();

  const navItems = [
    { page: Page.Dashboard, Icon: HomeIcon, label: 'Today' },
    { page: Page.Diary, Icon: BookOpenIcon, label: 'Meals' },
    // Center Log button will be here
    { page: Page.Progress, Icon: ProgressIcon, label: 'Progress' }, // Changed BarChartIcon to ProgressIcon
    { page: Page.Settings, Icon: SettingsIcon, label: 'Settings' },
  ];

  const handleLogMealClick = () => {
    triggerHapticFeedback();
    navigateTo(Page.LogMeal);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-20 bg-card dark:bg-dark-card border-t border-light-gray dark:border-dark-border shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)] flex justify-around items-center z-50">
      {navItems.slice(0, 2).map(({ page, Icon, label }) => (
        <NavItem
          key={page}
          page={page}
          Icon={Icon}
          label={label}
          isActive={currentPage === page}
          onClick={() => navigateTo(page)}
        />
      ))}

      {/* Central Log Button */}
      <button
        onClick={handleLogMealClick}
        className="relative -top-5 w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-primary/50"
        aria-label="Log Meal"
      >
        <PlusIcon className="w-8 h-8" />
      </button>

      {navItems.slice(2).map(({ page, Icon, label }) => (
        <NavItem
          key={page}
          page={page}
          Icon={Icon}
          label={label}
          isActive={currentPage === page}
          onClick={() => navigateTo(page)}
        />
      ))}
    </nav>
  );
};

export default BottomNav;