import React, { useState } from 'react';
import EmailGenerator from './components/EmailGenerator';
import EmailList from './components/EmailList';
import { useEmailPolling } from './hooks/useEmailPolling';

function App() {
  const [currentEmail, setCurrentEmail] = useState(() => {
    const saved = localStorage.getItem('blackMALE_currentEmail');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Check if email hasn't expired
        if (new Date(parsed.expiresAt) > new Date()) {
          return parsed.email;
        } else {
          localStorage.removeItem('blackMALE_currentEmail');
        }
      } catch (e) {
        localStorage.removeItem('blackMALE_currentEmail');
      }
    }
    return null;
  });

  const {
    messages,
    loading,
    error,
    expiresAt,
    refresh
  } = useEmailPolling(currentEmail, !!currentEmail);

  const handleEmailGenerated = (emailData) => {
    setCurrentEmail(emailData.email);
    // Save to localStorage with expiration info
    localStorage.setItem('blackMALE_currentEmail', JSON.stringify(emailData));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <EmailGenerator
          onEmailGenerated={handleEmailGenerated}
          existingEmail={currentEmail}
        />

        {error && error === 'Email address has expired' ? (
          <div className="glass-card p-8 fade-in">
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-red-400 mb-2">Email Expired</h3>
                <p className="text-gray-300 mb-6">Your temporary email has expired. Generate a new one to continue.</p>
              </div>
              <button
                onClick={() => {
                  setCurrentEmail(null);
                  localStorage.removeItem('blackMALE_currentEmail');
                }}
                className="btn-primary"
              >
                Generate New Email
              </button>
            </div>
          </div>
        ) : error ? (
          <div className="glass-card p-8 fade-in">
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-red-400 mb-2">Something went wrong</h3>
                <p className="text-gray-300 mb-6">{error}</p>
              </div>
              <button
                onClick={refresh}
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <div className="fade-in">
            <EmailList
              email={currentEmail}
              messages={messages}
              loading={loading}
              expiresAt={expiresAt}
              onRefresh={refresh}
            />
          </div>
        )}

        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>
            Temporary emails are automatically deleted after expiration.
            This service is for testing and temporary use only.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;