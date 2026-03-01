import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import OnboardingScreen, { ONBOARDING_STORAGE_KEY } from './components/OnboardingScreen';
import { IdeasProvider } from './contexts/IdeasContext';
import * as serviceWorker from './serviceWorker';

// Backwards compatibility: migrate old key
function hasCompletedOnboarding(): boolean {
  if (localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true') return true;
  if (localStorage.getItem('onboardingCompleted') === 'true') {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    return true;
  }
  return false;
}

function Root() {
  const [showOnboarding, setShowOnboarding] = useState(() => !hasCompletedOnboarding());

  const handleOnboardingComplete = (_premiumUnlocked?: boolean, _firstNoteContent?: string) => {
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <div
      style={{
        opacity: 1,
        animation: 'appFadeIn 0.5s ease-out',
      }}
    >
      <style>{`
        @keyframes appFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      <IdeasProvider>
        <App />
      </IdeasProvider>
    </div>
  );
}

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <Root />
    </React.StrictMode>
  );
}

// Register service worker for offline functionality
serviceWorker.register(); 