import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const AuthContext = createContext(null);

const REGION         = 'eu-west-2';
const CLIENT_ID      = process.env.REACT_APP_COGNITO_CLIENT_ID;
const COGNITO_DOMAIN = process.env.REACT_APP_COGNITO_DOMAIN;
const REDIRECT_URI   = `${window.location.origin}/callback`;

const cognitoClient = new CognitoIdentityProviderClient({ region: REGION });

function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function userFromToken(token) {
  const payload = parseJwt(token);
  if (!payload) return null;
  const rawGroups = payload['cognito:groups'] || [];
  const groups    = Array.isArray(rawGroups) ? rawGroups : rawGroups.split(' ');
  return {
    email:  payload.email,
    sub:    payload.sub,
    name:   payload.name || payload.email,
    groups,
  };
}

export function AuthProvider({ children }) {
  // Restore from sessionStorage on page refresh
  const [user,    setUser]    = useState(() => {
    const token = sessionStorage.getItem('idToken');
    if (!token) return null;
    return userFromToken(token);
  });

  const [idToken, setIdToken] = useState(() => sessionStorage.getItem('idToken'));
  const [error,   setError]   = useState(null);
  const [loading, setLoading] = useState(false);

  const storeTokens = useCallback((tokens) => {
    // AWS SDK returns IdToken (PascalCase); OAuth endpoint returns id_token (snake_case)
    const rawIdToken = tokens.IdToken || tokens.id_token;
    const payload    = parseJwt(rawIdToken);
    if (!payload) throw new Error('Could not parse ID token.');

    const rawGroups = payload['cognito:groups'] || [];
    const groups    = Array.isArray(rawGroups) ? rawGroups : rawGroups.split(' ');

    // Persist across page refreshes (clears on tab close)
    sessionStorage.setItem('idToken', rawIdToken);

    setIdToken(rawIdToken);
    setUser({
      email:  payload.email,
      sub:    payload.sub,
      name:   payload.name || payload.email,
      groups,
    });
  }, []);

  // ── Email/password sign-in via AWS SDK InitiateAuth ───────
  const signIn = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const command = new InitiateAuthCommand({
        AuthFlow:       'USER_PASSWORD_AUTH',
        ClientId:       CLIENT_ID,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      });

      const response = await cognitoClient.send(command);

      if (!response.AuthenticationResult) {
        throw new Error('Authentication did not return tokens. Please try again.');
      }

      storeTokens(response.AuthenticationResult);
    } catch (err) {
      const msg = err.message?.includes('Incorrect username or password')
        ? 'Incorrect email or password.'
        : err.message?.includes('User is not confirmed')
        ? 'Account not verified. Check your email for a confirmation code.'
        : err.message || 'Sign-in failed. Please try again.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [storeTokens]);

  // ── Google OAuth — redirect to Cognito hosted UI ──────────
  const signInWithGoogle = useCallback(() => {
    const params = new URLSearchParams({
      response_type:     'code',
      client_id:         CLIENT_ID,
      redirect_uri:      REDIRECT_URI,
      identity_provider: 'Google',
      scope:             'email openid profile',
    });
    window.location.href = `${COGNITO_DOMAIN}/oauth2/authorize?${params}`;
  }, []);

  // ── Handle Google OAuth callback (/callback route) ────────
  const handleOAuthCallback = useCallback(async (code) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${COGNITO_DOMAIN}/oauth2/token`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body:    new URLSearchParams({
            grant_type:   'authorization_code',
            client_id:    CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            code,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Google sign-in failed. Please try again.');
      }

      const tokens = await response.json();
      storeTokens(tokens);
      window.history.replaceState({}, document.title, '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [storeTokens]);

  // ── Sign out — clear sessionStorage and wipe state ───────
  const signOut = useCallback(() => {
    sessionStorage.removeItem('idToken');
    setUser(null);
    setIdToken(null);
    setError(null);
  }, []);

  const isAnalyst = user?.groups?.includes('analysts') ?? false;
  const isManager = user?.groups?.includes('managers') ?? false;

  return (
    <AuthContext.Provider value={{
      user,
      idToken,
      isAnalyst,
      isManager,
      loading,
      error,
      signIn,
      signInWithGoogle,
      handleOAuthCallback,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}