import React, { useState, useEffect, useCallback } from 'react';
import { Star, X, Code2, Trash2, ChevronDown, ChevronUp, Users, ShieldOff, Loader2, BarChart3, Mail, Activity } from 'lucide-react';
import EmailBroadcast from './admin/EmailBroadcast';
import { HEALTH_PROBES, interpretProbe } from './admin/healthProbes';
import { db } from '../config/firestore';
import { getAuth } from 'firebase/auth';
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';
import { Button } from './ui/UIComponents';

// isAdmin now lives in constants/admins.js (no imports), so Layout/AuthContext
// can check admin status without dragging this whole panel — and firestore —
// into the eager bundle. Re-exported here for backwards compatibility.
export { isAdmin } from '../constants/admins';

// Shape mirrors the admin-stats function response.
const STAT_GROUPS = [
    { key: 'accounts', label: 'Accounts', items: [
        { key: 'auth', label: 'Sign-ups (Auth)' },
        { key: 'userDocs', label: 'User profiles' },
        { key: 'activeLast30Days', label: 'Active (30d)' },
    ] },
    { key: 'practice', label: 'Practice', items: [
        { key: 'testsTaken', label: 'Tests completed' },
        { key: 'testsInProgress', label: 'Tests in progress' },
    ] },
    { key: 'classes', label: 'Classes', items: [
        { key: 'total', label: 'Classes' },
        { key: 'memberships', label: 'Memberships' },
    ] },
    { key: 'content', label: 'Content', items: [
        { key: 'conversations', label: 'Tutor chats' },
        { key: 'flashcardDecks', label: 'Flashcard decks' },
        { key: 'diagnosticResults', label: 'Diagnostics' },
        { key: 'solverHistory', label: 'Solver runs' },
        { key: 'studySessions', label: 'Study sessions' },
    ] },
    { key: 'feedback', label: 'Feedback', items: [
        { key: 'reviews', label: 'Reviews' },
    ] },
];

export default function DeveloperSettings({ onClose }) {
    const { toast } = useToast();
    const confirm = useConfirm();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [siteStats, setSiteStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [statsError, setStatsError] = useState('');

    // Fetched lazily on first expand — it's a handful of Firestore aggregation
    // reads plus a listUsers walk, so there's no reason to pay for it on open.
    const loadSiteStats = useCallback(async () => {
        setStatsLoading(true);
        setStatsError('');
        try {
            const current = getAuth().currentUser;
            if (!current) throw new Error('Not signed in.');
            const token = await current.getIdToken();
            const res = await fetch('/.netlify/functions/admin-stats', {
                headers: { Authorization: `Bearer ${token}` },
            });
            // The CRA dev server answers unknown paths with index.html and a
            // 200, so `res.ok` is true and parsing it as JSON throws a cryptic
            // browser error ("The string did not match the expected pattern").
            // Check the content type instead of trusting the status.
            const contentType = res.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                throw new Error(
                    'Stats function not reachable — Netlify Functions do not run under `npm start`. ' +
                    'Use `netlify dev`, or view this on the deployed site.'
                );
            }
            const body = await res.json();
            if (!res.ok) throw new Error(body.error || `Stats request failed (${res.status}).`);
            setSiteStats(body);
        } catch (err) {
            setStatsError(err.message || 'Could not load stats.');
        } finally {
            setStatsLoading(false);
        }
    }, []);
    const [health, setHealth] = useState(null);
    const [healthLoading, setHealthLoading] = useState(false);

    const runHealthChecks = useCallback(async () => {
        setHealthLoading(true);
        try {
            const current = getAuth().currentUser;
            const token = current ? await current.getIdToken() : null;
            const results = await Promise.all(HEALTH_PROBES.map(async (probe) => {
                try {
                    const res = await fetch(`/.netlify/functions/${probe.key}`, {
                        method: probe.method,
                        headers: {
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                            ...(probe.body ? { 'Content-Type': 'application/json' } : {}),
                        },
                        ...(probe.body ? { body: probe.body } : {}),
                    });
                    const contentType = res.headers.get('content-type') || '';
                    const payload = contentType.includes('application/json')
                        ? await res.json().catch(() => null)
                        : null;
                    return { ...probe, ...interpretProbe({ status: res.status, contentType, payload }, probe.healthy) };
                } catch (err) {
                    return { ...probe, ok: false, detail: err.message || 'Request failed' };
                }
            }));
            setHealth({ results, checkedAt: Date.now() });
        } finally {
            setHealthLoading(false);
        }
    }, []);

    const [expandedSection, setExpandedSection] = useState('reviews');
    const [stats, setStats] = useState({ total: 0, average: 0, distribution: [0, 0, 0, 0, 0] });

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setReviews(data);

            // Calculate stats
            if (data.length > 0) {
                const dist = [0, 0, 0, 0, 0];
                let sum = 0;
                data.forEach(r => {
                    sum += r.rating;
                    dist[r.rating - 1]++;
                });
                setStats({
                    total: data.length,
                    average: (sum / data.length).toFixed(1),
                    distribution: dist,
                });
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        const ok = await confirm({ title: 'Delete this review?', confirmText: 'Delete' });
        if (!ok) return;
        try {
            await deleteDoc(doc(db, 'reviews', reviewId));
            setReviews(prev => prev.filter(r => r.id !== reviewId));
        } catch (error) {
            console.error('Error deleting review:', error);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Unknown';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-base-850 rounded-lg p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-border">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-content-primary flex items-center">
                        <Code2 className="w-5 h-5 mr-2 text-content-primary" strokeWidth={1.5} />
                        Developer Settings
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-content-muted hover:text-content-primary transition-colors"
                    >
                        <X className="w-5 h-5" strokeWidth={1.5} />
                    </button>
                </div>

                {/* System health — the three env groups that have actually
                    broken in production, each reporting its real error rather
                    than a generic "something went wrong". */}
                <div className="border border-border-strong rounded-lg overflow-hidden mb-3">
                    <button
                        onClick={() => {
                            const next = expandedSection === 'health' ? '' : 'health';
                            setExpandedSection(next);
                            if (next === 'health' && !health && !healthLoading) runHealthChecks();
                        }}
                        className="w-full flex items-center justify-between p-4 bg-base-800/50 hover:bg-base-800 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary-400" strokeWidth={1.5} />
                            <span className="font-medium text-content-primary">System Health</span>
                            {health && (
                                <span className={`text-xs ${health.results.every(r => r.ok) ? 'text-success-400' : 'text-error-400'}`}>
                                    {health.results.filter(r => r.ok).length}/{health.results.length} OK
                                </span>
                            )}
                        </div>
                        {expandedSection === 'health'
                            ? <ChevronUp className="w-4 h-4 text-content-muted" strokeWidth={1.5} />
                            : <ChevronDown className="w-4 h-4 text-content-muted" strokeWidth={1.5} />}
                    </button>
                    {expandedSection === 'health' && (
                        <div className="p-4 border-t border-border-strong">
                            {healthLoading && (
                                <div className="flex items-center gap-2 text-content-secondary text-sm">
                                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} /> Pinging…
                                </div>
                            )}
                            {health && (
                                <div className="space-y-2">
                                    {health.results.map((r) => (
                                        <div key={r.key} className="bg-base-800 border border-border rounded-md p-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-sm font-medium text-content-primary">{r.label}</span>
                                                <span className={`text-xs font-medium ${r.ok ? 'text-success-400' : 'text-error-400'}`}>
                                                    {r.ok ? 'OK' : 'FAIL'}
                                                </span>
                                            </div>
                                            <p className={`text-xs mt-1 ${r.ok ? 'text-content-muted' : 'text-error-400'}`}>{r.detail}</p>
                                            {!r.ok && (
                                                <p className="text-xs text-content-muted mt-1">
                                                    Needs <code>{r.hint}</code>
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-between pt-1">
                                        <p className="text-xs text-content-muted">
                                            Checked {new Date(health.checkedAt).toLocaleTimeString()} · nothing is sent or charged
                                        </p>
                                        <Button variant="ghost" size="sm" onClick={runHealthChecks} disabled={healthLoading}>
                                            Re-check
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* App-wide stats — server-side, because Firestore rules
                    correctly prevent any client from counting other users' data. */}
                <div className="border border-border-strong rounded-lg overflow-hidden mb-3">
                    <button
                        onClick={() => {
                            const next = expandedSection === 'stats' ? '' : 'stats';
                            setExpandedSection(next);
                            if (next === 'stats' && !siteStats && !statsLoading) loadSiteStats();
                        }}
                        className="w-full flex items-center justify-between p-4 bg-base-800/50 hover:bg-base-800 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-primary-400" strokeWidth={1.5} />
                            <span className="font-medium text-content-primary">Site Statistics</span>
                        </div>
                        {expandedSection === 'stats'
                            ? <ChevronUp className="w-4 h-4 text-content-muted" strokeWidth={1.5} />
                            : <ChevronDown className="w-4 h-4 text-content-muted" strokeWidth={1.5} />}
                    </button>
                    {expandedSection === 'stats' && (
                        <div className="p-4 border-t border-border-strong">
                            {statsLoading && (
                                <div className="flex items-center gap-2 text-content-secondary text-sm">
                                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} /> Counting…
                                </div>
                            )}
                            {statsError && (
                                <div className="text-sm text-error-400">
                                    <p className="mb-1">{statsError}</p>
                                    <p className="text-content-muted text-xs">
                                        Needs the <code>admin-stats</code> function deployed with
                                        FIREBASE_PROJECT_ID / CLIENT_EMAIL / PRIVATE_KEY set in Netlify.
                                    </p>
                                </div>
                            )}
                            {siteStats && (
                                <div className="space-y-4">
                                    {STAT_GROUPS.map((group) => (
                                        <div key={group.key}>
                                            <p className="text-xs uppercase tracking-wide text-content-muted mb-2">{group.label}</p>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                {group.items.map((item) => {
                                                    const value = siteStats[group.key]?.[item.key];
                                                    return (
                                                        <div key={item.key} className="bg-base-800 border border-border rounded-md p-3">
                                                            <p className="text-lg font-semibold text-content-primary">
                                                                {/* null means the count failed — say so
                                                                    rather than showing a confident 0. */}
                                                                {value === null || value === undefined
                                                                    ? <span className="text-content-muted text-sm">n/a</span>
                                                                    : value.toLocaleString()}
                                                            </p>
                                                            <p className="text-xs text-content-secondary">{item.label}</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-between pt-1">
                                        <p className="text-xs text-content-muted">
                                            As of {new Date(siteStats.generatedAt).toLocaleString()}
                                        </p>
                                        <Button variant="ghost" size="sm" onClick={loadSiteStats} disabled={statsLoading}>
                                            Refresh
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Email broadcast */}
                <div className="border border-border-strong rounded-lg overflow-hidden mb-3">
                    <button
                        onClick={() => setExpandedSection(expandedSection === 'email' ? '' : 'email')}
                        className="w-full flex items-center justify-between p-4 bg-base-800/50 hover:bg-base-800 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-info-400" strokeWidth={1.5} />
                            <span className="font-medium text-content-primary">Email Broadcast</span>
                        </div>
                        {expandedSection === 'email'
                            ? <ChevronUp className="w-4 h-4 text-content-muted" strokeWidth={1.5} />
                            : <ChevronDown className="w-4 h-4 text-content-muted" strokeWidth={1.5} />}
                    </button>
                    {expandedSection === 'email' && (
                        <div className="p-4 border-t border-border-strong">
                            <EmailBroadcast />
                        </div>
                    )}
                </div>

                {/* Reviews Section */}
                <div className="border border-border-strong rounded-lg overflow-hidden">
                    <button
                        onClick={() => setExpandedSection(expandedSection === 'reviews' ? '' : 'reviews')}
                        className="w-full flex items-center justify-between p-4 bg-base-800/50 hover:bg-base-800 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-warning-400" strokeWidth={1.5} />
                            <span className="font-medium text-content-primary">User Reviews</span>
                            <span className="text-xs bg-base-750 px-2 py-0.5 rounded-full text-content-secondary">
                                {stats.total} reviews
                            </span>
                        </div>
                        {expandedSection === 'reviews' ? (
                            <ChevronUp className="w-4 h-4 text-content-muted" strokeWidth={1.5} />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-content-muted" strokeWidth={1.5} />
                        )}
                    </button>

                    {expandedSection === 'reviews' && (
                        <div className="p-4 space-y-4">
                            {/* Stats Overview */}
                            {stats.total > 0 && (
                                <div className="bg-base-800/30 rounded-lg p-4 border border-border-strong/50">
                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-warning-400">{stats.average}</div>
                                            <div className="flex gap-0.5 mt-1">
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <Star key={s} className={`w-3 h-3 ${s <= Math.round(stats.average) ? 'text-warning-400 fill-warning-400' : 'text-content-muted'}`} strokeWidth={1.5} />
                                                ))}
                                            </div>
                                            <div className="text-xs text-content-muted mt-1">{stats.total} total</div>
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            {[5, 4, 3, 2, 1].map(star => {
                                                const count = stats.distribution[star - 1];
                                                const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                                                return (
                                                    <div key={star} className="flex items-center gap-2 text-xs">
                                                        <span className="text-content-muted w-3">{star}</span>
                                                        <Star className="w-3 h-3 text-warning-400 fill-warning-400" strokeWidth={1.5} />
                                                        <div className="flex-1 bg-base-750 rounded-full h-2">
                                                            <div
                                                                className="bg-warning-400 h-2 rounded-full transition-all"
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-content-muted w-6 text-right">{count}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Reviews List */}
                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="w-6 h-6 border-2 border-content-muted border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                    <p className="text-sm text-content-muted">Loading reviews...</p>
                                </div>
                            ) : reviews.length === 0 ? (
                                <div className="text-center py-8">
                                    <Users className="w-8 h-8 text-content-muted mx-auto mb-2" strokeWidth={1.5} />
                                    <p className="text-sm text-content-muted">No reviews yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                                    {reviews.map(review => (
                                        <div key={review.id} className="bg-base-800/40 rounded-lg p-3 border border-border-strong/50">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-medium text-content-primary">
                                                            {review.displayName || 'Anonymous'}
                                                        </span>
                                                        <div className="flex gap-0.5">
                                                            {[1, 2, 3, 4, 5].map(s => (
                                                                <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'text-warning-400 fill-warning-400' : 'text-content-muted'}`} strokeWidth={1.5} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-content-muted mb-1">
                                                        {review.email} • {formatDate(review.createdAt)}
                                                    </p>
                                                    {review.reviewText && (
                                                        <p className="text-sm text-content-secondary mt-2">{review.reviewText}</p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteReview(review.id)}
                                                    className="ml-2 p-1 text-content-muted hover:text-error-400 transition-colors"
                                                    title="Delete review"
                                                >
                                                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Puter Auth Section */}
                <div className="border border-border-strong rounded-lg overflow-hidden mt-4">
                    <button
                        onClick={() => setExpandedSection(expandedSection === 'puter' ? '' : 'puter')}
                        className="w-full flex items-center justify-between p-4 bg-base-800/50 hover:bg-base-800 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <ShieldOff className="w-4 h-4 text-error-400" strokeWidth={1.5} />
                            <span className="font-medium text-content-primary">Puter Authentication</span>
                        </div>
                        {expandedSection === 'puter' ? (
                            <ChevronUp className="w-4 h-4 text-content-muted" strokeWidth={1.5} />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-content-muted" strokeWidth={1.5} />
                        )}
                    </button>

                    {expandedSection === 'puter' && (
                        <div className="p-4 space-y-3 border-t border-border">
                            <p className="text-body-sm text-content-secondary">
                                Clear Puter authentication tokens and cached data. The user will be prompted to re-authenticate on their next AI request.
                            </p>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    // Clear all Puter-related localStorage keys
                                    const keysToRemove = [];
                                    for (let i = 0; i < localStorage.length; i++) {
                                        const key = localStorage.key(i);
                                        if (key && (key.startsWith('puter.') || key.startsWith('apex.puter.'))) {
                                            keysToRemove.push(key);
                                        }
                                    }
                                    keysToRemove.forEach(k => localStorage.removeItem(k));
                                    // Notify ModelSelector and other components that Puter auth was cleared
                                    window.dispatchEvent(new CustomEvent('apex:puterAuthCleared'));
                                    toast.success(`Cleared ${keysToRemove.length} Puter auth key(s). Puter models are now disabled.`);
                                }}
                            >
                                <ShieldOff className="w-4 h-4 mr-2" strokeWidth={1.5} />
                                Clear Puter Authentication
                            </Button>
                        </div>
                    )}
                </div>

                
            </div>
        </div>
    );
}
