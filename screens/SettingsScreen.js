

import React from 'react';
import { Page, ThemePreference } from '../types.js';
import { ChevronRightIcon, MoonIcon, SunIcon, DesktopIcon } from '../components/Icons.js';
import { useAppContext } from '../contexts/AppContext.js';

const SettingsListItem = ({
  icon,
  text,
  onClick,
  isDestructive,
}) => {
  const { triggerHapticFeedback } = useAppContext(); // Destructure triggerHapticFeedback

  const handleClick = () => {
    triggerHapticFeedback(); // Trigger haptic feedback on click
    onClick();
  };

  return (
    React.createElement("button", { onClick: handleClick, className: "w-full flex items-center py-4 transition-transform active:scale-95" },
      React.createElement("div", { className: `w-8 h-8 rounded-lg flex items-center justify-center mr-4 text-lg ${isDestructive ? 'bg-red-100 dark:bg-red-500/20' : 'bg-light-gray dark:bg-dark-border'}` },
        icon
      ),
      React.createElement("span", { className: `flex-1 text-left font-semibold ${isDestructive ? 'text-red-500' : 'text-text-main dark:text-dark-text-main'}` },
        text
      ),
      !isDestructive && React.createElement(ChevronRightIcon, { className: "w-5 h-5 text-medium-gray" })
    )
  );
};

const ThemeToggleButton = ({
    label,
    icon: Icon,
    isActive,
    onClick,
    preference, // Add preference prop
}) => {
    const { triggerHapticFeedback } = useAppContext(); // Destructure triggerHapticFeedback

    const handleClick = () => {
        triggerHapticFeedback(); // Trigger haptic feedback on click
        onClick(preference); // Pass the preference to the onClick handler
    };

    return (
        React.createElement("button", { onClick: handleClick, className: `flex-1 flex flex-col items-center justify-center p-3 rounded-xl transition-colors transition-transform active:scale-95 ${isActive ? 'bg-primary-light dark:bg-primary/20' : 'hover:bg-light-gray dark:hover:bg-dark-border'}` },
            React.createElement(Icon, { className: `w-6 h-6 mb-1 ${isActive ? 'text-primary' : 'text-text-light dark:text-dark-text-light'}` }),
            React.createElement("span", { className: `text-sm font-semibold ${isActive ? 'text-primary' : 'text-text-main dark:text-dark-text-main'}` }, label)
        )
    );
};


const SettingsScreen = () => {
  const { navigateTo, profile, logout, deleteCurrentUser, themePreference, handleThemePreferenceChange, openRemindersModal, triggerHapticFeedback } = useAppContext();

  const handleThemeClick = (preference) => {
    handleThemePreferenceChange(preference);
  };

  return (
    React.createElement("div", { className: "p-4 bg-background dark:bg-dark-background min-h-full" },
      React.createElement("header", { className: "py-4" },
        React.createElement("h1", { className: "text-3xl font-bold text-text-main dark:text-dark-text-main font-montserrat" }, "Settings")
      ),

      React.createElement("div", { className: "space-y-6 mt-4" },
        React.createElement("div", { className: "bg-card dark:bg-dark-card rounded-2xl p-4 flex items-center shadow-sm" },
          React.createElement("div", { className: "w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mr-4 text-3xl" },
            profile.avatar
          ),
          React.createElement("div", null,
            React.createElement("p", { className: "font-bold text-lg text-text-main dark:text-dark-text-main" }, profile.name),
            React.createElement("p", { className: "text-sm text-text-light dark:text-dark-text-light" }, "Your personal wellness hub")
          )
        ),

        React.createElement("div", { className: "bg-card dark:bg-dark-card rounded-2xl px-4 divide-y divide-light-gray dark:divide-dark-border shadow-sm" },
          React.createElement("h3", { className: "text-lg font-bold text-text-main dark:text-dark-text-main pt-4 px-1 font-montserrat" }, "Account Setup"),
          React.createElement(SettingsListItem, { icon: "\u{1F464}", text: "Profile", onClick: () => navigateTo(Page.Profile) }),
          React.createElement(SettingsListItem, { icon: "\u{2696}\u{FE0F}", text: "Weight & Goals", onClick: () => navigateTo(Page.WeightGoals) }),
          React.createElement(SettingsListItem, { icon: "\u{1F4CA}", text: "Macronutrients", onClick: () => navigateTo(Page.AdjustMacros) })
        ),
      
        React.createElement("div", { className: "bg-card dark:bg-dark-card rounded-2xl px-4 divide-y divide-light-gray dark:divide-dark-border shadow-sm" },
          React.createElement("h3", { className: "text-lg font-bold text-text-main dark:text-dark-text-main pt-4 px-1 font-montserrat" }, "Progress & Data"),
          React.createElement(SettingsListItem, { icon: "\u{1F4C8}", text: "Weight History", onClick: () => navigateTo(Page.WeightHistory) }),
          React.createElement(SettingsListItem, { icon: "\u{1F4A7}", text: "Water History", onClick: () => navigateTo(Page.WaterHistory) })
        ),

         React.createElement("div", { className: "bg-card dark:bg-dark-card rounded-2xl px-4 divide-y divide-light-gray dark:divide-dark-border shadow-sm" },
          React.createElement("h3", { className: "text-lg font-bold text-text-main dark:text-dark-text-main pt-4 px-1 font-montserrat" }, "Preferences"),
          React.createElement(SettingsListItem, { icon: "\u{1F514}", text: "Notifications & Reminders", onClick: () => { triggerHapticFeedback(); openRemindersModal(); } }),
          React.createElement("div", { className: "py-4" },
            React.createElement("h4", { className: "font-semibold text-text-main dark:text-dark-text-main mb-3 px-1" }, "Appearance"),
            React.createElement("div", { className: "flex space-x-2 p-1 bg-light-gray dark:bg-dark-border rounded-xl" },
                React.createElement(ThemeToggleButton, { label: "Light", icon: SunIcon, isActive: themePreference === 'light', onClick: handleThemeClick, preference: "light" }),
                React.createElement(ThemeToggleButton, { label: "Dark", icon: MoonIcon, isActive: themePreference === 'dark', onClick: handleThemeClick, preference: "dark" }),
                React.createElement(ThemeToggleButton, { label: "System", icon: DesktopIcon, isActive: themePreference === 'system', onClick: handleThemeClick, preference: "system" })
            )
          )
        ),
        
        React.createElement("div", { className: "bg-card dark:bg-dark-card rounded-2xl px-4 divide-y divide-light-gray dark:divide-dark-border shadow-sm" },
            React.createElement(SettingsListItem, { icon: "\u{27A1}\u{FE0F}", text: "Logout", onClick: logout }),
            React.createElement(SettingsListItem, { icon: "\u{1F5D1}\u{FE0F}", text: "Delete Account", onClick: deleteCurrentUser, isDestructive: true })
        ),

        React.createElement("p", { className: "text-center text-xs text-medium-gray dark:text-dark-gray pt-4" }, "Cal AI Version 1.0.0")
      )
    )
  );
};

export default SettingsScreen;