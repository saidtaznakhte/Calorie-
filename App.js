

import React from 'react';
import { Page } from './types.js';
import { AppProvider, useAppContext } from './contexts/AppContext.js';
import BottomNav from './components/BottomNav.js';
import DashboardScreen from './screens/DashboardScreen.js';
import LogMealScreen from './screens/LogMealScreen.js';
import SettingsScreen from './screens/SettingsScreen.js';
import CameraScreen from './screens/CameraScreen.js';
import DiaryScreen from './screens/DiaryScreen.js';
import ProgressScreen from './screens/ProgressScreen.js';
import AdjustMacrosScreen from './screens/AdjustMacrosScreen.js';
import WeightGoalsScreen from './screens/WeightGoalsScreen.js';
import WeightHistoryScreen from './screens/WeightHistoryScreen.js';
import WaterHistoryScreen from './screens/WaterHistoryScreen.js';
import ProfileScreen from './screens/ProfileScreen.js';
import BarcodeScannerScreen from './screens/BarcodeScannerScreen.js';
import { LogActivityScreen } from './screens/LogActivityScreen.js';
import WelcomeScreen from './screens/WelcomeScreen.js';
import OnboardingScreen from './screens/OnboardingScreen.js';
import ManualLogScreen from './screens/ManualLogScreen.js';
import MealPrepCreatorScreen from './screens/MealPrepCreatorScreen.js';
import MealDetailScreen from './components/MealDetailScreen.js';
import RemindersModal from './components/RemindersModal.js';
import Toast from './components/Toast.js';

const MainApp = () => {
  const { page, isRemindersModalOpen, currentUser, closeRemindersModal, handleRemindersUpdate, toastMessage } = useAppContext();

  const renderPage = () => {
    switch (page) {
      case Page.Dashboard:
        return React.createElement(DashboardScreen, null);
      case Page.Diary:
        return React.createElement(DiaryScreen, null);
      case Page.Progress:
        return React.createElement(ProgressScreen, null);
      case Page.Settings:
        return React.createElement(SettingsScreen, null);
      case Page.LogMeal:
        return React.createElement(LogMealScreen, null);
      case Page.Camera:
        return React.createElement(CameraScreen, null);
      case Page.BarcodeScanner:
        return React.createElement(BarcodeScannerScreen, null);
      case Page.AdjustMacros:
        return React.createElement(AdjustMacrosScreen, null);
      case Page.WeightGoals:
        return React.createElement(WeightGoalsScreen, null);
      case Page.WeightHistory:
        return React.createElement(WeightHistoryScreen, null);
      case Page.WaterHistory:
        return React.createElement(WaterHistoryScreen, null);
      case Page.Profile:
        return React.createElement(ProfileScreen, null);
      case Page.LogActivity:
        return React.createElement(LogActivityScreen, null);
      case Page.ManualLog:
        return React.createElement(ManualLogScreen, null);
      case Page.MealPrepCreator:
        return React.createElement(MealPrepCreatorScreen, null);
      case Page.MealDetail:
        return React.createElement(MealDetailScreen, null);
      default:
        return React.createElement(DashboardScreen, null);
    }
  };
  
  const isBottomNavVisible = [Page.Dashboard, Page.Diary, Page.Progress, Page.Settings].includes(page);

  return (
    React.createElement("div", { className: "max-w-md mx-auto h-screen bg-background dark:bg-dark-background font-inter flex flex-col shadow-2xl" },
       isRemindersModalOpen && currentUser && (
          React.createElement(RemindersModal, {
              isOpen: isRemindersModalOpen,
              onClose: closeRemindersModal,
              reminders: currentUser.reminders,
              onSave: handleRemindersUpdate
          })
      ),
      React.createElement("main", { className: `flex-1 overflow-y-auto ${isBottomNavVisible ? 'pb-20' : ''}` },
        React.createElement("div", { key: page, className: "animate-fade-in" },
          renderPage()
        )
      ),
      isBottomNavVisible && React.createElement(BottomNav, null),
      React.createElement(Toast, { message: toastMessage })
    )
  );
};

const AuthFlow = () => {
  const { currentUser, users, isRegistering } = useAppContext();

  if (currentUser) {
    return React.createElement(MainApp, null);
  }
  
  if (isRegistering || users.length === 0) {
    return React.createElement(OnboardingScreen, null);
  }

  return React.createElement(WelcomeScreen, null);
};

const App = () => {
  return (
    React.createElement(AppProvider, null,
      React.createElement(AuthFlow, null)
    )
  );
};

export default App;
