import React, { useEffect } from 'react';
import { ArrowLeft, User, Calendar, Paperclip } from 'lucide-react';
import { formatFullDateTime } from '../utils/timeUtils';
import { emailService } from '../services/api';

const EmailViewer = ({ message, onBack }) => {
  useEffect(() => {
    if (!message.isRead) {
      emailService.markAsRead(message.id).catch(console.error);
    }
  }, [message.id, message.isRead]);

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onBack}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Inbox
          </button>
        </div>

        <div className="space-y-3">
          <h1 className="text-xl font-semibold text-gray-900">
            {message.subject || '(No Subject)'}
          </h1>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>
                {message.senderName ? (
                  <>
                    {message.senderName} <span className="text-gray-500">({message.sender})</span>
                  </>
                ) : (
                  message.sender
                )}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatFullDateTime(message.receivedAt)}</span>
            </div>
          </div>

          {message.attachments && message.attachments.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Paperclip className="w-4 h-4" />
              <span>{message.attachments.length} attachment{message.attachments.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {message.attachments && message.attachments.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Attachments</h3>
            <div className="space-y-2">
              {message.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <Paperclip className="w-4 h-4 text-gray-400" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {attachment.filename || `attachment-${index + 1}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {attachment.contentType}
                      {attachment.size && ` • ${(attachment.size / 1024).toFixed(1)} KB`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="prose max-w-none">
          {message.bodyHtml ? (
            <div
              className="email-html-content"
              dangerouslySetInnerHTML={{
                __html: message.bodyHtml
              }}
              style={{
                lineHeight: '1.6',
                fontSize: '14px'
              }}
            />
          ) : message.bodyText ? (
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
              {message.bodyText}
            </pre>
          ) : (
            <p className="text-gray-500 italic">This message has no content.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailViewer;