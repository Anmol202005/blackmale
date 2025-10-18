import React, { useState } from 'react';
import EmailGenerator from './components/EmailGenerator';
import EmailList from './components/EmailList';
import { useEmailPolling } from './hooks/useEmailPolling';

function App() {
  const [currentEmail, setCurrentEmail] = useState(null);

  const {
    messages,
    loading,
    error,
    expiresAt,
    refresh
  } = useEmailPolling(currentEmail, !!currentEmail);

  const handleEmailGenerated = (email) => {
    setCurrentEmail(email);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <EmailGenerator onEmailGenerated={handleEmailGenerated} />

        {error ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center text-red-600">
              <p className="text-lg font-medium mb-2">Error</p>
              <p>{error}</p>
              {error === 'Email address has expired' ? (
                <button
                  onClick={() => setCurrentEmail(null)}
                  className="btn-primary mt-4"
                >
                  Generate New Email
                </button>
              ) : (
                <button
                  onClick={refresh}
                  className="btn-primary mt-4"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        ) : (
          <EmailList
            email={currentEmail}
            messages={messages}
            loading={loading}
            expiresAt={expiresAt}
            onRefresh={refresh}
          />
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