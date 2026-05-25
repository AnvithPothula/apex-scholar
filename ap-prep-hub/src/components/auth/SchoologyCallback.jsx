/**
 * Schoology OAuth Callback Handler.
 *
 * Schoology redirects back here with ?oauth_token=...&oauth_verifier=... after
 * the user authorizes. We hand those off to schoologyAPI.handleOAuthCallback,
 * which exchanges them for an access token (via the Netlify proxy that holds
 * the consumer secret) and persists it to Firestore. After success the user
 * is sent back to Settings.
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader, CheckCircle, XCircle } from 'lucide-react';
import { schoologyAPI } from '../../services/schoologyAPI';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, Button } from '../ui/UIComponents';
import { createPageUrl } from '../../utils/helpers';

const USER_KEY = 'apex.schoology.requestUser';

export function SchoologyCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState('processing'); // processing | success | error
  const [message, setMessage] = useState('Connecting your Schoology account…');

  useEffect(() => {
    // Wait until auth has resolved — we need user.uid to write tokens.
    if (authLoading) return;

    const run = async () => {
      try {
        const oauthToken = searchParams.get('oauth_token');
        const oauthVerifier = searchParams.get('oauth_verifier');
        const err = searchParams.get('error') || searchParams.get('oauth_problem');

        if (err) throw new Error(err);
        if (!oauthToken || !oauthVerifier) {
          throw new Error('Schoology did not return the expected verification parameters.');
        }

        // Prefer the live Firebase user; fall back to the uid stashed at
        // sign-in start (the redirect chain shouldn't change it, but be safe).
        let uid = user?.uid || null;
        if (!uid) {
          try { uid = sessionStorage.getItem(USER_KEY); } catch (_) { /* ignore */ }
        }
        if (!uid) {
          throw new Error('Your Apex session expired during sign-in — please sign in to Apex and try connecting Schoology again.');
        }

        const result = await schoologyAPI.handleOAuthCallback(uid, oauthToken, oauthVerifier);
        setStatus('success');
        setMessage(
          result?.schoologyName
            ? `Connected as ${result.schoologyName}. Redirecting…`
            : 'Schoology connected. Redirecting…'
        );
        setTimeout(() => {
          navigate(createPageUrl('Settings') + '#settings-schoology', { replace: true });
        }, 1500);
      } catch (error) {
        console.error('Schoology OAuth callback error:', error);
        setStatus('error');
        setMessage(
          error?.message ||
            "We couldn't complete the Schoology connection. You can try again or paste a calendar URL in Settings instead."
        );
      }
    };

    run();
  }, [authLoading, user, searchParams, navigate]);

  const goSettings = () => {
    navigate(createPageUrl('Settings') + '#settings-schoology', { replace: true });
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

          <h2 className="text-xl font-display font-semibold text-content-primary mb-3">
            {status === 'processing' && 'Connecting to Schoology'}
            {status === 'success' && 'Connected'}
            {status === 'error' && "Couldn't connect"}
          </h2>

          <p className="text-content-secondary mb-6">{message}</p>

          {status === 'error' && (
            <div className="space-y-3">
              <Button onClick={goSettings} className="w-full">
                Back to Settings
              </Button>
              <p className="text-xs text-content-muted">
                You can try again from Settings, or paste a calendar URL instead.
              </p>
            </div>
          )}

          {status === 'processing' && (
            <p className="text-sm text-content-muted">This usually takes a couple of seconds…</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
