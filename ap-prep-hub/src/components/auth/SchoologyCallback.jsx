/**
 * Schoology OAuth Callback Handler
 * Handles the OAuth callback from Schoology authentication
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader, CheckCircle, XCircle } from 'lucide-react';
// import { schoologyAPI } from '../../services/schoologyAPI';
// import { assignmentSync } from '../../services/assignmentSync';
import { Card, CardContent, Button } from '../ui/UIComponents';
import { createPageUrl } from '../../utils/helpers';

export function SchoologyCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('Processing Schoology authentication...');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get parameters from URL
        const oauthToken = searchParams.get('oauth_token');
        const oauthVerifier = searchParams.get('oauth_verifier');
        const error = searchParams.get('error');

        // Get user ID from session storage
        const userId = sessionStorage.getItem('schoology_oauth_user');

        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        if (!oauthToken || !oauthVerifier) {
          throw new Error('Missing OAuth parameters');
        }

        if (!userId) {
          throw new Error('User session not found');
        }

        // Schoology OAuth token exchange requires a backend server for security.
        // Client-only apps cannot safely complete the OAuth handshake.
        setStatus('error');
        setMessage('Schoology integration requires a backend server for secure OAuth token exchange. This feature is not yet available in the client-only version.');

        // Clean up session storage
        sessionStorage.removeItem('schoology_oauth_user');

        // Redirect to settings after 3 seconds
        setTimeout(() => {
          navigate(createPageUrl('Settings'), { replace: true });
        }, 3000);

      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(`Authentication failed: ${error.message}`);

        // Clean up session storage
        sessionStorage.removeItem('schoology_oauth_user');
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate]);

  const handleRetry = () => {
    navigate(createPageUrl('Settings'), { replace: true });
  };

  return (
    <div className="min-h-screen bg-base-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-base-850 border-border">
        <CardContent className="p-6 text-center">
          <div className="mb-6">
            {status === 'processing' && (
              <Loader className="w-12 h-12 animate-spin text-content-muted mx-auto" />
            )}
            {status === 'success' && (
              <CheckCircle className="w-12 h-12 text-success-400 mx-auto" />
            )}
            {status === 'error' && (
              <XCircle className="w-12 h-12 text-error-400 mx-auto" />
            )}
          </div>

          <h2 className="text-xl font-semibold text-content-primary mb-4">
            {status === 'processing' && 'Connecting to Schoology'}
            {status === 'success' && 'Connection Successful!'}
            {status === 'error' && 'Connection Failed'}
          </h2>

          <p className="text-content-secondary mb-6">
            {message}
          </p>

          {status === 'success' && (
            <div className="text-sm text-content-muted mb-4">
              Redirecting to settings in a few seconds...
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <Button 
                onClick={handleRetry}
                className="w-full bg-content-primary hover:bg-content-primary text-base-950"
              >
                Return to Settings
              </Button>
              <p className="text-xs text-content-muted">
                You can try connecting again from the Settings page.
              </p>
            </div>
          )}

          {status === 'processing' && (
            <div className="text-sm text-content-muted">
              This may take a few moments...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
