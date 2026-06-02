/**
 * Schoology API service.
 *
 * Two integration paths coexist:
 *   1) OAuth sign-in (preferred). All OAuth 1.0a signing happens in the
 *      Netlify function /.netlify/functions/schoology-oauth (it holds the
 *      consumer secret). This file is just a thin client that calls that
 *      proxy and persists the resulting access token to Firestore.
 *   2) iCal calendar URL paste (fallback). Some districts don't enable
 *      Schoology developer apps; users can still paste their personal
 *      calendar feed URL and get assignments that way.
 *
 * Token storage: users/{userId}/integrations/schoology (single doc):
 *   accessToken, accessTokenSecret, schoologyUid, schoologyName,
 *   connectedAt, lastSync, isActive, integrationType ('oauth' | 'calendar'),
 *   calendarUrl (calendar-path only)
 */

import { doc, setDoc, getDoc, updateDoc, deleteField } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import schoologyCalendar from './schoologyCalendar';

const PROXY_URL = '/.netlify/functions/schoology-oauth';

// Every proxy action requires a verified Firebase ID token — the function uses
// it to key the user's (server-only) Schoology tokens. Nothing sensitive is
// kept in the browser anymore.
async function callProxy(action, body = {}) {
  const headers = { 'Content-Type': 'application/json' };
  try {
    const user = auth && auth.currentUser;
    if (user) {
      const idToken = await user.getIdToken();
      if (idToken) headers['Authorization'] = `Bearer ${idToken}`;
    }
  } catch (_) { /* not signed in — the function will reject with 401 */ }

  const res = await fetch(`${PROXY_URL}?action=${encodeURIComponent(action)}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    /* fall through */
  }
  if (!res.ok) {
    const msg = data?.error || `Schoology proxy returned ${res.status}`;
    const err = new Error(msg);
    err.upstream = data?.upstream;
    err.status = res.status;
    throw err;
  }
  return data;
}

// No consumer secret AND no access tokens live in this client — both are held
// server-side by the Netlify function.
class SchoologyAPIService {
  // ---- OAuth flow -------------------------------------------------------

  /**
   * Kick off OAuth: ask the proxy for a request token, stash the matching
   * token-secret in sessionStorage, then redirect the browser to Schoology
   * for the user to authorize. They'll come back to /schoology-callback.
   */
  async initiateOAuth(userId) {
    if (!userId) throw new Error('userId required');
    const callback = `${window.location.origin}/schoology-callback`;
    // The function stores the request-token secret server-side keyed by uid —
    // it no longer comes back to the browser.
    const data = await callProxy('request_token', { callback });
    const { oauth_token, authorize_url } = data;
    if (!oauth_token || !authorize_url) {
      throw new Error('Schoology did not return a valid request token');
    }
    window.location.assign(authorize_url);
  }

  /**
   * Complete OAuth after Schoology redirects back. The function verifies the
   * Firebase user, recovers the request secret it stored, exchanges the
   * verifier, and persists the access token SERVER-SIDE. The browser never
   * sees a token — it only gets the display name back.
   */
  async handleOAuthCallback(userId, oauthToken, oauthVerifier) {
    if (!userId || !oauthToken || !oauthVerifier) {
      throw new Error('Missing OAuth callback parameters');
    }
    const result = await callProxy('access_token', {
      oauth_token: oauthToken,
      oauth_verifier: oauthVerifier,
    });
    return {
      success: true,
      schoologyUid: result?.schoologyUid || null,
      schoologyName: result?.schoologyName || null,
    };
  }

  // ---- Connection state -------------------------------------------------

  /**
   * Returns a snapshot describing how (if at all) the user is connected to
   * Schoology. Kept boolean-coercible (truthy when any connection exists)
   * so existing callsites that did `if (await isConnected(uid))` still work.
   */
  async isConnected(userId) {
    try {
      const ref = doc(db, 'users', userId, 'integrations', 'schoology');
      const snap = await getDoc(ref);
      if (!snap.exists()) return false;
      const d = snap.data();
      if (d.isActive === false) return false;
      // Tokens live server-side now; OAuth connection is reflected by the
      // non-sensitive status fields the function writes.
      const oauth = d.integrationType === 'oauth';
      const calendar = !!d.calendarUrl;
      if (!oauth && !calendar) return false;
      // Truthy object — old `if (isConnected)` checks pass; new code can read
      // .oauth / .calendar / .schoologyName for fuller state.
      return {
        oauth,
        calendar,
        schoologyName: d.schoologyName || null,
        schoologyUid: d.schoologyUid || null,
        connectedAt: d.connectedAt || null,
        lastSync: d.lastSync || null,
        valueOf() { return true; },
      };
    } catch (e) {
      console.error('Error checking Schoology connection:', e);
      return false;
    }
  }

  /**
   * Sign the user out of Schoology OAuth only. Leaves any separately
   * configured calendar URL in place so a user who set up both doesn't
   * lose their calendar feed when they sign out of OAuth.
   *
   * Schoology has no remote-revoke endpoint for legacy OAuth 1.0a tokens,
   * so this stops Apex from using the token but the token remains valid
   * on Schoology's side until they expire or the user revokes via the
   * Schoology UI.
   */
  async disconnectOAuth(userId) {
    try {
      // Server wipes the access token (stored server-side).
      await callProxy('disconnect').catch(() => {});
      const ref = doc(db, 'users', userId, 'integrations', 'schoology');
      const snap = await getDoc(ref);
      if (!snap.exists()) return { success: true };
      const d = snap.data();
      // If the only thing this doc held was OAuth state, mark inactive too.
      const stillHasCalendar = !!d.calendarUrl;
      await updateDoc(ref, {
        // Scrub any legacy client-stored tokens too.
        accessToken: deleteField(),
        accessTokenSecret: deleteField(),
        schoologyUid: deleteField(),
        schoologyName: deleteField(),
        ...(stillHasCalendar
          ? { integrationType: 'calendar' }
          : { isActive: false, integrationType: deleteField() }),
        disconnectedAt: new Date(),
      });
      return { success: true };
    } catch (e) {
      console.error('Error disconnecting Schoology OAuth:', e);
      throw new Error('Failed to sign out of Schoology');
    }
  }

  /**
   * Disconnect entirely (both OAuth and calendar). Schoology has no
   * remote-revoke endpoint for legacy OAuth 1.0a tokens, so this stops
   * Apex from using the token but the token remains valid on Schoology's
   * side until they expire or the user revokes via Schoology directly.
   */
  async disconnect(userId) {
    try {
      await callProxy('disconnect').catch(() => {});
      const ref = doc(db, 'users', userId, 'integrations', 'schoology');
      await updateDoc(ref, {
        isActive: false,
        accessToken: deleteField(),
        accessTokenSecret: deleteField(),
        schoologyUid: deleteField(),
        schoologyName: deleteField(),
        calendarUrl: deleteField(),
        integrationType: deleteField(),
        disconnectedAt: new Date(),
      });
      return { success: true };
    } catch (e) {
      console.error('Error disconnecting Schoology:', e);
      throw new Error('Failed to disconnect Schoology integration');
    }
  }

  async updateLastSync(userId) {
    try {
      const ref = doc(db, 'users', userId, 'integrations', 'schoology');
      await updateDoc(ref, { lastSync: new Date() });
    } catch (e) {
      console.error('Error updating last sync:', e);
    }
  }

  // ---- Signed API calls (via proxy) ------------------------------------

  /**
   * Generic signed Schoology API call. Forwards through the proxy so the
   * consumer secret stays server-side.
   */
  async makeAPIRequest(userId, endpoint, method = 'GET', data = null) {
    // No tokens here — the function loads the caller's server-side tokens from
    // the verified Firebase uid and signs the request.
    const result = await callProxy('api_call', {
      method,
      path: endpoint.startsWith('/') ? endpoint : `/${endpoint}`,
      body: data,
    });
    if (!result.ok) {
      throw new Error(`Schoology API error: ${result.status}`);
    }
    return result.data;
  }

  async getCourses(userId) {
    try {
      const r = await this.makeAPIRequest(userId, '/users/me/sections');
      return r?.section || [];
    } catch (e) {
      console.error('Error fetching Schoology courses:', e);
      return [];
    }
  }

  async getAssignments(userId, courseId, startDate = null) {
    try {
      let endpoint = `/sections/${courseId}/assignments`;
      if (startDate) {
        const dateStr = startDate.toISOString().split('T')[0];
        endpoint += `?start=${dateStr}`;
      }
      const r = await this.makeAPIRequest(userId, endpoint);
      return r?.assignment || [];
    } catch (e) {
      console.error('Error fetching Schoology assignments:', e);
      return [];
    }
  }

  async getAllAssignments(userId /* , daysBack = 7 */) {
    try {
      return await this.getAssignmentsFromCalendar(userId);
    } catch (e) {
      console.error('Error fetching Schoology assignments:', e);
      return [];
    }
  }

  async getAssignmentsFromCalendar(userId) {
    try {
      const ref = doc(db, 'users', userId, 'integrations', 'schoology');
      const snap = await getDoc(ref);
      if (!snap.exists() || !snap.data().calendarUrl) return [];
      const calendarUrl = snap.data().calendarUrl;
      return await schoologyCalendar.parseCalendarToAssignments(calendarUrl);
    } catch (e) {
      console.error('Error fetching assignments from calendar:', e);
      return [];
    }
  }

  async getCombinedAssignments(userId, daysBack = 7) {
    return await this.getAllAssignments(userId, daysBack);
  }

  // ---- Calendar URL (fallback path) -------------------------------------

  async setCalendarUrl(userId, calendarUrl) {
    try {
      if (!schoologyCalendar.isValidCalendarUrl(calendarUrl)) {
        throw new Error('Invalid calendar URL format');
      }
      const normalizedUrl = schoologyCalendar.normalizeCalendarUrl(calendarUrl);
      await schoologyCalendar.fetchCalendarFeed(normalizedUrl);
      const ref = doc(db, 'users', userId, 'integrations', 'schoology');
      await setDoc(
        ref,
        {
          calendarUrl: normalizedUrl,
          calendarConfiguredAt: new Date(),
          isActive: true,
          // Don't overwrite integrationType if OAuth already set it.
        },
        { merge: true }
      );
      return { success: true };
    } catch (e) {
      console.error('Error setting calendar URL:', e);
      throw new Error('Failed to configure calendar URL: ' + e.message);
    }
  }
}

export const schoologyAPI = new SchoologyAPIService();
export default schoologyAPI;
