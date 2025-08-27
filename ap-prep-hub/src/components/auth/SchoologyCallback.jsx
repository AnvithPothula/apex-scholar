/**
 * Schoology OAuth Callback Handler
 * Handles the OAuth callback from Schoology authentication
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader, CheckCircle, XCircle } from 'lucide-react';
import { schoologyAPI } from '../../services/schoologyAPI';
import { assignmentSync } from '../../services/assignmentSync';
import { Card, CardContent, Button } from '../ui/UIComponents';

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

        setMessage('Exchanging OAuth tokens...');

        // In a production environment, you would:
        // 1. Send the oauth_token and oauth_verifier to your backend
        // 2. Exchange them for access tokens using Schoology's API
        // 3. Store the tokens securely

        // For demo purposes, we'll simulate successful token exchange
        const accessToken = `access_${oauthToken}_${Date.now()}`;
        const accessTokenSecret = `secret_${oauthVerifier}_${Date.now()}`;

        // Store the tokens
        await schoologyAPI.handleOAuthCallback(userId, accessToken, accessTokenSecret);

        setMessage('Schoology connected successfully! Performing initial sync...');

        // Perform initial sync
        const syncResult = await assignmentSync.manualSync(userId, {
          daysBack: 7,
          includeCompleted: false
        });

        // Clean up session storage
        sessionStorage.removeItem('schoology_oauth_user');

        setStatus('success');
        setMessage(`Successfully connected and synced ${syncResult.syncedCount} assignments!`);

        // Redirect to settings after 3 seconds
        setTimeout(() => {
          navigate('/settings', { replace: true });
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
    navigate('/settings', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/60 border-slate-700">
        <CardContent className="p-6 text-center">
          <div className="mb-6">
            {status === 'processing' && (
              <Loader className="w-12 h-12 animate-spin text-blue-400 mx-auto" />
            )}
            {status === 'success' && (
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
            )}
            {status === 'error' && (
              <XCircle className="w-12 h-12 text-red-400 mx-auto" />
            )}
          </div>

          <h2 className="text-xl font-semibold text-slate-100 mb-4">
            {status === 'processing' && 'Connecting to Schoology'}
            {status === 'success' && 'Connection Successful!'}
            {status === 'error' && 'Connection Failed'}
          </h2>

          <p className="text-slate-300 mb-6">
            {message}
          </p>

          {status === 'success' && (
            <div className="text-sm text-slate-400 mb-4">
              Redirecting to settings in a few seconds...
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <Button 
                onClick={handleRetry}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Return to Settings
              </Button>
              <p className="text-xs text-slate-400">
                You can try connecting again from the Settings page.
              </p>
            </div>
          )}

          {status === 'processing' && (
            <div className="text-sm text-slate-400">
              This may take a few moments...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
