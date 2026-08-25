import React, { useState, useCallback, useEffect } from 'react';
import { AuthProvider, useAuth } from './components/AuthContext';
import { SIGNALS as FALLBACK_SIGNALS } from './data/signals';
import TopBar from './components/TopBar';
import TabBar from './components/TabBar';
import SignalMonitor from './components/SignalMonitor';
import RecordDecision from './components/RecordDecision';
import AuditLog from './components/AuditLog';
import LoginScreen from './components/LoginScreen';
import { Toast } from './components/ui';

const API_URL      = process.env.REACT_APP_API_URL     || null;
const SIGNALS_URL  = process.env.REACT_APP_SIGNALS_URL || null;

function Dashboard() {
  const { user, idToken, isAnalyst, isManager, signOut } = useAuth();

  const [signals,          setSignals]          = useState(FALLBACK_SIGNALS);
  const [signalsLoading,   setSignalsLoading]   = useState(false);
  const [signalsAsOf,      setSignalsAsOf]      = useState(null);
  const [selectedSignalId, setSelectedSignalId] = useState(FALLBACK_SIGNALS[0].id);
  const [auditLog,         setAuditLog]         = useState([]);
  const [activeTab,        setActiveTab]        = useState('signals');
  const [toast,            setToast]            = useState('');
  const [loadingAudit,     setLoadingAudit]     = useState(false);

  const clearToast = useCallback(() => setToast(''), []);

  // ── Fetch live signals from FRED via Lambda ───────────────
  const fetchSignals = useCallback(async () => {
    if (!SIGNALS_URL) return; // no API — use hardcoded fallback
    setSignalsLoading(true);
    try {
      const response = await fetch(SIGNALS_URL);
      if (!response.ok) throw new Error(`Signals API returned ${response.status}`);
      const data = await response.json();

      if (data.signals && data.signals.length > 0) {
        // Merge live values with frontend config (thresholds, higherIsBetter etc
        // are already included in the Lambda response)
        setSignals(data.signals.map(s => ({
          ...s,
          previousValue: s.value, // FRED doesn't return previous — delta will show 0
        })));
        setSignalsAsOf(data.asOf);

        if (data.errors && data.errors.length > 0) {
          setToast(`${data.errors.length} signal(s) could not be fetched from FRED.`);
        }
      }
    } catch (err) {
      console.error('Failed to fetch live signals:', err);
      setToast('Using sample data — could not reach FRED API.');
    } finally {
      setSignalsLoading(false);
    }
  }, []);

  // ── Authenticated fetch helper ────────────────────────────
  const authFetch = useCallback((url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type':  'application/json',
        'Authorization': idToken,
        ...(options.headers || {}),
      },
    });
  }, [idToken]);

  // ── Fetch audit log ───────────────────────────────────────
  const fetchAuditLog = useCallback(async (actionFilter = null) => {
    if (!API_URL) return;
    setLoadingAudit(true);
    try {
      const url = actionFilter ? `${API_URL}?action=${actionFilter}` : API_URL;
      const response = await authFetch(url);
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      const data = await response.json();
      setAuditLog(data.decisions || []);
    } catch (err) {
      console.error('Failed to fetch audit log:', err);
      setToast('Could not load audit log.');
    } finally {
      setLoadingAudit(false);
    }
  }, [authFetch]);

  // Fetch signals and audit log on mount
  useEffect(() => { fetchSignals(); },   [fetchSignals]);
  useEffect(() => { fetchAuditLog(); },  [fetchAuditLog]);

  // ── Submit decision ───────────────────────────────────────
  async function handleDecisionSubmit(entry) {
    if (!isAnalyst) {
      setToast('Managers cannot submit decisions.');
      return;
    }

    if (API_URL) {
      try {
        const response = await authFetch(API_URL, {
          method: 'POST',
          body:   JSON.stringify({
            signalId:   entry.signalId,
            signalName: entry.signalName,
            action:     entry.action,
            reasoning:  entry.reasoning,
            snapshot:   entry.snapshot,
          }),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || `Server returned ${response.status}`);
        }
        await fetchAuditLog();
        setToast('Decision recorded successfully.');
        setActiveTab('audit');
      } catch (err) {
        setToast(`Submission failed: ${err.message}`);
      }
    } else {
      setAuditLog(prev => [{ ...entry, id: Date.now() }, ...prev]);
      setToast('Decision recorded (local mode).');
      setActiveTab('audit');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <TopBar user={user} isAnalyst={isAnalyst} isManager={isManager} onSignOut={signOut} />
      <TabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        auditCount={auditLog.length}
        isAnalyst={isAnalyst}
      />

      <main style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'signals' && (
          <SignalMonitor
            signals={signals}
            signalsLoading={signalsLoading}
            signalsAsOf={signalsAsOf}
            selectedSignalId={selectedSignalId}
            onSelectSignal={setSelectedSignalId}
            onGoToDecision={() => setActiveTab('decision')}
            onRefresh={fetchSignals}
          />
        )}
        {activeTab === 'decision' && (
          <RecordDecision
            signals={signals}
            selectedSignalId={selectedSignalId}
            onSelectSignal={setSelectedSignalId}
            auditLog={auditLog}
            onSubmit={handleDecisionSubmit}
            onToast={setToast}
            isReadOnly={!isAnalyst}
          />
        )}
        {activeTab === 'audit' && (
          <AuditLog
            auditLog={auditLog}
            loading={loadingAudit}
            onFilterChange={API_URL ? fetchAuditLog : null}
          />
        )}
      </main>

      <Toast message={toast} onDone={clearToast} />
    </div>
  );
}

function AppRouter() {
  const { user, handleOAuthCallback } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code   = params.get('code');
    if (code && window.location.pathname === '/callback') {
      handleOAuthCallback(code);
    }
  }, [handleOAuthCallback]);

  if (!user) return <LoginScreen />;
  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
