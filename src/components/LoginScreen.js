import React, { useState } from 'react';
import { useAuth } from './AuthContext';

export default function LoginScreen() {
  const { signIn, signInWithGoogle, loading, error } = useAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [formErr,  setFormErr]  = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setFormErr('');

    if (!email.trim())    { setFormErr('Please enter your email.');    return; }
    if (!password.trim()) { setFormErr('Please enter your password.'); return; }

    try {
      await signIn(email.trim(), password);
    } catch {
      // error is shown from AuthContext
    }
  }

  const displayError = formErr || error;

  return (
    <div style={{
      minHeight: '100vh',
      display:   'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: 24,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 380,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}>

        {/* Wordmark */}
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: 'var(--fm)',
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: '0.16em',
            color: 'var(--muted)',
            textTransform: 'uppercase',
            marginBottom: 6,
          }}>
            LiquidityIQ
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 500, color: 'var(--text)' }}>
            Sign in
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
            Market Risk Dashboard
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--surface)',
          borderRadius: 'var(--r-lg)',
          border: '0.5px solid var(--border)',
          boxShadow: 'var(--shadow-md)',
          padding: '28px 28px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>

          {/* Google button */}
          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: 'var(--r-sm)',
              border: '0.5px solid var(--border-md)',
              background: 'var(--surface)',
              color: 'var(--text)',
              fontSize: 13,
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              transition: 'background 0.12s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
          >
            {/* Google 'G' SVG */}
            <svg width="16" height="16" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: '0.5px', background: 'var(--border)' }} />
            <span style={{ fontSize: 11, color: 'var(--hint)' }}>or</span>
            <div style={{ flex: 1, height: '0.5px', background: 'var(--border)' }} />
          </div>

          {/* Email/password form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--muted)', marginBottom: 5 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="analyst@yourbank.com"
                autoComplete="email"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  fontSize: 13,
                  border: '0.5px solid var(--border)',
                  borderRadius: 'var(--r-sm)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--border-md)'}
                onBlur={e  => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--muted)', marginBottom: 5 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  fontSize: 13,
                  border: '0.5px solid var(--border)',
                  borderRadius: 'var(--r-sm)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--border-md)'}
                onBlur={e  => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* Error message */}
            {displayError && (
              <div style={{
                fontSize: 12,
                color: 'var(--red)',
                background: 'var(--red-bg)',
                border: '0.5px solid var(--red-border)',
                borderRadius: 'var(--r-sm)',
                padding: '8px 12px',
              }}>
                {displayError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 'var(--r-sm)',
                border: 'none',
                background: loading ? 'var(--border)' : 'var(--text)',
                color: 'var(--surface)',
                fontSize: 13,
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.15s',
                opacity: loading ? 0.6 : 1,
                marginTop: 4,
              }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--hint)' }}>
          Contact your administrator to request access.
        </p>
      </div>
    </div>
  );
}
