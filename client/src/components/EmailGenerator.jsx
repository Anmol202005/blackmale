import React, { useState } from 'react';
import { RefreshCw, Copy, CheckCircle } from 'lucide-react';
import { emailService } from '../services/api';
import toast from 'react-hot-toast';

const EmailGenerator = ({ onEmailGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [currentEmail, setCurrentEmail] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateEmail = async () => {
    setLoading(true);
    try {
      const data = await emailService.generateAlias();
      setCurrentEmail(data);
      onEmailGenerated(data.email);
      toast.success('New temporary email generated!');
    } catch (error) {
      toast.error('Failed to generate email address');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!currentEmail?.email) return;

    try {
      await navigator.clipboard.writeText(currentEmail.email);
      setCopied(true);
      toast.success('Email copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">TempMail</h1>
        <p className="text-gray-600">Generate temporary email addresses that expire automatically</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        <button
          onClick={generateEmail}
          disabled={loading}
          className="btn-primary flex items-center gap-2 min-w-[200px] justify-center"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Generating...' : 'Generate Email'}
        </button>

        {currentEmail && (
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3 min-w-0 flex-1 max-w-md">
            <div className="flex-1 min-w-0">
              <div className="font-mono text-sm text-gray-900 truncate">
                {currentEmail.email}
              </div>
              <div className="text-xs text-gray-500">
                Expires in {currentEmail.lifetimeMinutes} minutes
              </div>
            </div>
            <button
              onClick={copyToClipboard}
              className="btn-secondary p-2 shrink-0"
              title="Copy to clipboard"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
      </div>

      {currentEmail && (
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>
            Your temporary email will expire at{' '}
            <span className="font-medium">
              {new Date(currentEmail.expiresAt).toLocaleString()}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default EmailGenerator;