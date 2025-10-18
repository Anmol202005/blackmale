import React, { useState } from 'react';
import { Mail, MailOpen, User, Clock, RefreshCw } from 'lucide-react';
import { formatRelativeTime, formatTimeRemaining, getTimeRemainingColor } from '../utils/timeUtils';
import EmailViewer from './EmailViewer';

const EmailList = ({ email, messages, loading, expiresAt, onRefresh }) => {
  const [selectedMessage, setSelectedMessage] = useState(null);

  if (!email) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center text-gray-500">
          <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Generate a temporary email address to start receiving messages</p>
        </div>
      </div>
    );
  }

  if (selectedMessage) {
    return (
      <EmailViewer
        message={selectedMessage}
        onBack={() => setSelectedMessage(null)}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Inbox</h2>
            <p className="text-sm text-gray-600 font-mono">{email}</p>
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {expiresAt && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4" />
            <span className={getTimeRemainingColor(expiresAt)}>
              {formatTimeRemaining(expiresAt)}
            </span>
          </div>
        )}
      </div>

      <div className="divide-y divide-gray-200">
        {loading && messages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-gray-300" />
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No messages yet</p>
            <p className="text-sm">Send an email to {email} to see it here</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              onClick={() => setSelectedMessage(message)}
              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {message.isRead ? (
                    <MailOpen className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Mail className="w-5 h-5 text-primary-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className={`text-sm ${message.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                          {message.senderName || message.sender}
                        </span>
                        {message.senderName && (
                          <span className="text-xs text-gray-500">
                            ({message.sender})
                          </span>
                        )}
                      </div>

                      <h3 className={`text-sm mb-1 truncate ${message.isRead ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
                        {message.subject || '(No Subject)'}
                      </h3>

                      {message.bodyText && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {message.bodyText.replace(/\s+/g, ' ').trim()}
                        </p>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 shrink-0">
                      {formatRelativeTime(message.receivedAt)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EmailList;