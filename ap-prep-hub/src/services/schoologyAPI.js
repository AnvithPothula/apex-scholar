/**
 * Schoology API Integration Service
 * Handles authentication and API calls to Schoology
 */

import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import schoologyCalendar from './schoologyCalendar';
import CryptoJS from 'crypto-js';

class SchoologyAPIService {
  constructor() {
    this.baseURL = 'https://api.schoology.com/v1';
    this.consumerKey = process.env.REACT_APP_SCHOOLOGY_CONSUMER_KEY;
    this.consumerSecret = process.env.REACT_APP_SCHOOLOGY_CONSUMER_SECRET;
    this.accessTokens = new Map(); // Cache tokens for users
  }

  /**
   * Get authorization URL for OAuth flow
   */
  async getAuthorizationUrl() {
    try {
      // For now, provide a simplified OAuth flow
      // In production, you would need to implement the full OAuth 1.0a flow
      if (!this.consumerKey || !this.consumerSecret) {
        throw new Error('Schoology API credentials not configured. Please set REACT_APP_SCHOOLOGY_CONSUMER_KEY and REACT_APP_SCHOOLOGY_CONSUMER_SECRET environment variables.');
      }

      // Return the authorization URL that would be used in production
      const authUrl = `https://api.schoology.com/oauth/authorize?oauth_consumer_key=${this.consumerKey}`;
      return authUrl;
    } catch (error) {
      console.error('Error getting authorization URL:', error);
      throw error;
    }
  }

  /**
   * Initialize OAuth flow for Schoology authentication
   */
  async initiateOAuth(userId) {
    try {
      // Create OAuth request token
      const requestTokenEndpoint = `${this.baseURL}/oauth/request_token`;
      const callbackUrl = `${window.location.origin}/schoology-callback`;
      
      const oauthParams = {
        oauth_callback: callbackUrl,
        oauth_consumer_key: this.consumerKey,
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
        oauth_nonce: this.generateNonce(),
        oauth_version: '1.0'
      };

      // Generate signature for request token
      const signature = this.generateSignature('POST', requestTokenEndpoint, oauthParams);
      oauthParams.oauth_signature = signature;

      // Make request token call
      const authHeader = 'OAuth ' + Object.keys(oauthParams)
        .map(key => `${key}="${encodeURIComponent(oauthParams[key])}"`)
        .join(', ');

      const response = await fetch(requestTokenEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (!response.ok) {
        throw new Error(`OAuth request failed: ${response.status}`);
      }

      const responseText = await response.text();
      const tokenData = new URLSearchParams(responseText);
      const requestToken = tokenData.get('oauth_token');
      const requestTokenSecret = tokenData.get('oauth_token_secret');

      if (!requestToken) {
        throw new Error('Failed to get request token');
      }

      // Store request token temporarily
      sessionStorage.setItem('schoology_request_token_secret', requestTokenSecret);
      sessionStorage.setItem('schoology_oauth_user', userId);

      // Build authorization URL
      const authURL = `${this.baseURL}/oauth/authorize?oauth_token=${requestToken}`;
      
      // Open OAuth window
      window.open(authURL, 'schoology-oauth', 'width=600,height=600,scrollbars=yes');
      
      return { success: true, authURL };
    } catch (error) {
      console.error('Error initiating Schoology OAuth:', error);
      throw new Error('Failed to start Schoology authentication: ' + error.message);
    }
  }

  /**
   * Handle OAuth callback and store tokens
   */
  async handleOAuthCallback(userId, oauthToken, oauthVerifier) {
    try {
      // Get request token secret from session storage
      const requestTokenSecret = sessionStorage.getItem('schoology_request_token_secret');
      if (!requestTokenSecret) {
        throw new Error('Request token secret not found');
      }

      // Exchange for access token
      const accessTokenEndpoint = `${this.baseURL}/oauth/access_token`;
      
      const oauthParams = {
        oauth_consumer_key: this.consumerKey,
        oauth_token: oauthToken,
        oauth_verifier: oauthVerifier,
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
        oauth_nonce: this.generateNonce(),
        oauth_version: '1.0'
      };

      // Generate signature
      const signature = this.generateSignature('POST', accessTokenEndpoint, oauthParams, requestTokenSecret);
      oauthParams.oauth_signature = signature;

      // Make access token request
      const authHeader = 'OAuth ' + Object.keys(oauthParams)
        .map(key => `${key}="${encodeURIComponent(oauthParams[key])}"`)
        .join(', ');

      const response = await fetch(accessTokenEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (!response.ok) {
        throw new Error(`Access token request failed: ${response.status}`);
      }

      const responseText = await response.text();
      const tokenData = new URLSearchParams(responseText);
      const accessToken = tokenData.get('oauth_token');
      const accessTokenSecret = tokenData.get('oauth_token_secret');

      if (!accessToken || !accessTokenSecret) {
        throw new Error('Failed to get access tokens');
      }

      // Store tokens in Firebase
      const userTokensRef = doc(db, 'users', userId, 'integrations', 'schoology');
      await setDoc(userTokensRef, {
        accessToken,
        accessTokenSecret,
        connectedAt: new Date(),
        lastSync: null,
        isActive: true,
        calendarUrl: null // Will be set separately if user provides it
      });

      // Cache tokens for immediate use
      this.accessTokens.set(userId, {
        accessToken,
        accessTokenSecret
      });

      // Clean up session storage
      sessionStorage.removeItem('schoology_request_token_secret');

      console.log('✅ Schoology OAuth tokens stored successfully');
      return { success: true };
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
      throw new Error('Failed to complete Schoology authentication: ' + error.message);
    }
  }

  /**
   * Get stored tokens for a user
   */
  async getTokens(userId) {
    try {
      // Check cache first
      if (this.accessTokens.has(userId)) {
        return this.accessTokens.get(userId);
      }

      // Fetch from Firebase
      const userTokensRef = doc(db, 'users', userId, 'integrations', 'schoology');
      const tokenDoc = await getDoc(userTokensRef);
      
      if (tokenDoc.exists() && tokenDoc.data().isActive) {
        const tokens = {
          accessToken: tokenDoc.data().accessToken,
          accessTokenSecret: tokenDoc.data().accessTokenSecret
        };
        
        // Cache for future use
        this.accessTokens.set(userId, tokens);
        return tokens;
      }

      return null;
    } catch (error) {
      console.error('Error fetching Schoology tokens:', error);
      return null;
    }
  }

  /**
   * Make authenticated API request to Schoology
   */
  async makeAPIRequest(userId, endpoint, method = 'GET', data = null) {
    try {
      const tokens = await this.getTokens(userId);
      if (!tokens) {
        throw new Error('No Schoology authentication found');
      }

      // Generate OAuth 1.0a signature
      const oauthParams = {
        oauth_consumer_key: this.consumerKey,
        oauth_token: tokens.accessToken,
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
        oauth_nonce: this.generateNonce(),
        oauth_version: '1.0'
      };

      // Create signature
      const signature = this.generateSignature(method, `${this.baseURL}${endpoint}`, oauthParams, tokens.accessTokenSecret);
      oauthParams.oauth_signature = signature;

      // Create Authorization header
      const authHeader = 'OAuth ' + Object.keys(oauthParams)
        .map(key => `${key}="${encodeURIComponent(oauthParams[key])}"`)
        .join(', ');

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method,
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: data ? JSON.stringify(data) : undefined
      });

      if (!response.ok) {
        throw new Error(`Schoology API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Schoology API request failed:', error);
      throw error;
    }
  }

  /**
   * Get user's courses from Schoology
   */
  async getCourses(userId) {
    try {
      const response = await this.makeAPIRequest(userId, '/users/me/sections');
      return response.section || [];
    } catch (error) {
      console.error('Error fetching Schoology courses:', error);
      return [];
    }
  }

  /**
   * Get assignments for a specific course
   */
  async getAssignments(userId, courseId, startDate = null) {
    try {
      let endpoint = `/sections/${courseId}/assignments`;
      
      // Add date filter if provided
      if (startDate) {
        const dateStr = startDate.toISOString().split('T')[0];
        endpoint += `?start=${dateStr}`;
      }

      const response = await this.makeAPIRequest(userId, endpoint);
      return response.assignment || [];
    } catch (error) {
      console.error('Error fetching Schoology assignments:', error);
      return [];
    }
  }

  /**
   * Get all assignments for user from calendar only
   */
  async getAllAssignments(userId, daysBack = 7) {
    try {
  // minimize console noise during fetch
      return await this.getAssignmentsFromCalendar(userId);
    } catch (error) {
      console.error('Error fetching Schoology assignments:', error);
      return [];
    }
  }

  /**
   * Get assignments from calendar feed
   */
  async getAssignmentsFromCalendar(userId) {
    try {
      // Get calendar URL from user settings
      const userTokensRef = doc(db, 'users', userId, 'integrations', 'schoology');
      const tokenDoc = await getDoc(userTokensRef);
      
      if (!tokenDoc.exists() || !tokenDoc.data().calendarUrl) {
        return [];
      }

      const calendarUrl = tokenDoc.data().calendarUrl;
      const assignments = await schoologyCalendar.parseCalendarToAssignments(calendarUrl);
      
      return assignments;
    } catch (error) {
      console.error('Error fetching assignments from calendar:', error);
      return [];
    }
  }

  /**
   * Get combined assignments (now just calendar)
   */
  async getCombinedAssignments(userId, daysBack = 7) {
    return await this.getAllAssignments(userId, daysBack);
  }

  /**
   * Set calendar URL for user
   */
  async setCalendarUrl(userId, calendarUrl) {
    try {
      // Validate URL
      if (!schoologyCalendar.isValidCalendarUrl(calendarUrl)) {
        throw new Error('Invalid calendar URL format');
      }

      // Normalize URL (convert webcal:// to https://)
      const normalizedUrl = schoologyCalendar.normalizeCalendarUrl(calendarUrl);

      // Test the calendar URL
      await schoologyCalendar.fetchCalendarFeed(normalizedUrl);

      // Store in Firebase
      const userTokensRef = doc(db, 'users', userId, 'integrations', 'schoology');
      await setDoc(userTokensRef, {
        calendarUrl: normalizedUrl,
        calendarConfiguredAt: new Date(),
        isActive: true,
        integrationType: 'calendar'
      }, { merge: true });

      console.log('✅ Calendar URL configured successfully');
      return { success: true };
    } catch (error) {
      console.error('Error setting calendar URL:', error);
      throw new Error('Failed to configure calendar URL: ' + error.message);
    }
  }

  /**
   * Check if user has Schoology integration active
   */
  async isConnected(userId) {
    try {
      const userTokensRef = doc(db, 'users', userId, 'integrations', 'schoology');
      const tokenDoc = await getDoc(userTokensRef);
      
      if (!tokenDoc.exists()) {
        return false;
      }
      
      const data = tokenDoc.data();
      
      // User is connected if they have a calendar URL AND the integration is active
      return !!(data.calendarUrl && data.isActive !== false);
    } catch (error) {
      console.error('Error checking Schoology connection:', error);
      return false;
    }
  }

  /**
   * Disconnect Schoology integration
   */
  async disconnect(userId) {
    try {
      const userTokensRef = doc(db, 'users', userId, 'integrations', 'schoology');
      await updateDoc(userTokensRef, {
        isActive: false,
        calendarUrl: null, // Clear the calendar URL
        disconnectedAt: new Date()
      });

      // Remove from cache
      this.accessTokens.delete(userId);

      console.log('✅ Schoology integration disconnected');
      return { success: true };
    } catch (error) {
      console.error('Error disconnecting Schoology:', error);
      throw new Error('Failed to disconnect Schoology integration');
    }
  }

  /**
   * Update last sync timestamp
   */
  async updateLastSync(userId) {
    try {
      const userTokensRef = doc(db, 'users', userId, 'integrations', 'schoology');
      await updateDoc(userTokensRef, {
        lastSync: new Date()
      });
    } catch (error) {
      console.error('Error updating last sync:', error);
    }
  }

  // Helper methods
  generateNonce() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  generateSignature(method, url, params, tokenSecret = '') {
    // This is a simplified signature generation
    // In production, use a proper OAuth 1.0a library
    
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');

    const baseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
    const signingKey = `${encodeURIComponent(this.consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
    
    return CryptoJS.HmacSHA1(baseString, signingKey).toString(CryptoJS.enc.Base64);
  }
}

// Export singleton instance
export const schoologyAPI = new SchoologyAPIService();
export default schoologyAPI;
