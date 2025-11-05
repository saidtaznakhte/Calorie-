
import React from 'react';
import { Page } from './types.js';
import { AppProvider, useAppContext } from './contexts/AppContext.js';
import BottomNav from './components/BottomNav.js';
import DashboardScreen from './screens/DashboardScreen.js';
import LogMealScreen from './screens/LogMealScreen.js';
import SettingsScreen from './screens/SettingsScreen.js';
import CameraScreen from './screens/CameraScreen.js';
import DiaryScreen from './screens/DiaryScreen.js';
import ProgressScreen from './screens/ProgressScreen.js'; // Changed from ReportsScreen
import AdjustMacrosScreen from './screens/AdjustMacrosScreen.js';
import WeightGoalsScreen from './screens/WeightGoalsScreen.js';
import WeightHistoryScreen from './screens/WeightHistoryScreen.js';
import WaterHistoryScreen from './screens/WaterHistoryScreen.js';
import ProfileScreen from './screens/ProfileScreen.js';
import BarcodeScannerScreen from './screens/BarcodeScannerScreen.js';
// FIX: Changed ManualLogScreen import to a named import.
import { LogActivityScreen } from './screens/LogActivityScreen.js';
import WelcomeScreen from './screens/WelcomeScreen.js';
import OnboardingScreen from './screens/OnboardingScreen.js';
// FIX: Changed ManualLogScreen import from a named import to a default import.
import ManualLogScreen from './screens/ManualLogScreen.js';
import MealPrepCreatorScreen from './screens/MealPrepCreatorScreen.js';
import MealDetailScreen from './components/MealDetailScreen.js';
import RemindersModal from './components/RemindersModal.js';
import Toast from './components/Toast.js'; // Import Toast component

const MainApp: React.FC = () => {
  const { page, isRemindersModalOpen, currentUser, closeRemindersModal, handleRemindersUpdate, toastMessage } = useAppContext();

  const renderPage = () => {
    switch (page) {
      case Page.Dashboard:
        return <DashboardScreen />;
      case Page.Diary:
        return <DiaryScreen />;
      case Page.Progress: // Changed from Reports
        return <ProgressScreen />; // Changed from ReportsScreen
      case Page.Settings:
        return <SettingsScreen />;
      case Page.LogMeal:
        return <LogMealScreen />;
      case Page.Camera:
        return <CameraScreen />;
      case Page.BarcodeScanner:
        return <BarcodeScannerScreen />;
      case Page.AdjustMacros:
        return <AdjustMacrosScreen />;
      case Page.WeightGoals:
        return <WeightGoalsScreen />;
      case Page.WeightHistory:
        return <WeightHistoryScreen />;
      case Page.WaterHistory:
        return <WaterHistoryScreen />;
      case Page.Profile:
        return <ProfileScreen />;
      case Page.LogActivity:
        return <LogActivityScreen />;
      case Page.ManualLog:
        return <ManualLogScreen />;
      case Page.MealPrepCreator:
        return <MealPrepCreatorScreen />;
      case Page.MealDetail:
        return <MealDetailScreen />;
      default:
        return <DashboardScreen />;
    }
  };
  
  const isBottomNavVisible = [Page.Dashboard, Page.Diary, Page.Progress, Page.Settings].includes(page); // Updated for Page.Progress

  return (
    <div className="max-w-md mx-auto h-screen bg-background dark:bg-dark-background font-inter flex flex-col shadow-2xl">
       {isRemindersModalOpen && currentUser && (
          <RemindersModal
              isOpen={isRemindersModalOpen}
              onClose={closeRemindersModal}
              reminders={currentUser.reminders}
              onSave={handleRemindersUpdate}
          />
      )}
      <main className={`flex-1 overflow-y-auto ${isBottomNavVisible ? 'pb-20' : ''}`}>
        <div key={page} className="animate-fade-in">
          {renderPage()}
        </div>
      </main>
      {isBottomNavVisible && <BottomNav />}
      <Toast message={toastMessage} /> {/* Add Toast component here */}
    </div>
  );
};

const AuthFlow: React.FC = () => {
  const { currentUser, users, isRegistering } = useAppContext();

  if (currentUser) {
    return <MainApp />;
  }
  
  if (isRegistering || users.length === 0) {
    return <OnboardingScreen />;
  }

  return <WelcomeScreen />;
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AuthFlow />
    </AppProvider>
  );
};

export default App;