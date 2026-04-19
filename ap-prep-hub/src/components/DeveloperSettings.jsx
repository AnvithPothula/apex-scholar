import React, { useState, useEffect, useCallback } from 'react';
import { Star, X, Code2, Trash2, ChevronDown, ChevronUp, Users, ShieldOff, BookOpen, Loader2 } from 'lucide-react';
import { db } from '../config/firebase';
import { getAuth } from 'firebase/auth';
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { seedAllPublicDecks } from '../utils/seedPublicDecks';
import { useToast } from '../contexts/ToastContext';

// Admin UIDs that can access Developer Settings
const ADMIN_UIDS = [
    'b0eUycwZDHcmrkoeSEiD69QSbK32',
    'A0yRGP86ZTahByzS0ALYeKAXOn52',
];

export function isAdmin(uid) {
    return ADMIN_UIDS.includes(uid);
}

export default function DeveloperSettings({ onClose }) {
    const { toast } = useToast();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedSection, setExpandedSection] = useState('reviews');
    const [stats, setStats] = useState({ total: 0, average: 0, distribution: [0, 0, 0, 0, 0] });
    const [seedStatus, setSeedStatus] = useState(null); // null | 'running' | 'done'
    const [seedLog, setSeedLog] = useState([]);
    const [seedResult, setSeedResult] = useState(null);

    const handleSeedDecks = useCallback(async () => {
        if (seedStatus === 'running') return;
        setSeedStatus('running');
        setSeedLog([]);
        setSeedResult(null);

        const uid = getAuth().currentUser?.uid;
        if (!uid) { setSeedStatus(null); toast.error('Not logged in'); return; }

        const result = await seedAllPublicDecks(uid, (message, current, total) => {
            setSeedLog(prev => [...prev.slice(-50), `[${current}/${total}] ${message}`]);
        });

        setSeedResult(result);
        setSeedStatus('done');
    }, [seedStatus, toast]);

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
        if (!window.confirm('Delete this review?')) return;
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
            <div className="bg-base-850 rounded-sm p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-border">
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
                        <div className="p-4 space-y-3">
                            <p className="text-sm text-content-muted">
                                Clear Puter authentication tokens and cached data. The user will be prompted to re-authenticate on their next AI request.
                            </p>
                            <button
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
                                className="px-4 py-2 bg-error-600 hover:bg-error-700 text-content-primary rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                            >
                                <ShieldOff className="w-4 h-4" strokeWidth={1.5} />
                                Clear Puter Authentication
                            </button>
                        </div>
                    )}

                    {/* Seed Public Flashcard Decks */}
                    <div className="border-t border-gray-700 pt-4 mt-4">
                        <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
                            <BookOpen className="w-5 h-5" strokeWidth={1.5} />
                            Public Flashcard Decks
                        </h3>
                        <p className="text-sm text-gray-400 mb-3">
                            Generate AI-powered flashcard decks for all major AP subjects. Each unit gets a 15-card deck published under "Apex Scholar".
                        </p>
                        <button
                            onClick={handleSeedDecks}
                            disabled={seedStatus === 'running'}
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-content-primary rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                        >
                            {seedStatus === 'running' ? (
                                <><Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} /> Generating…</>
                            ) : (
                                <><BookOpen className="w-4 h-4" strokeWidth={1.5} /> Seed All Decks</>
                            )}
                        </button>
                        {seedLog.length > 0 && (
                            <div className="mt-3 max-h-40 overflow-y-auto bg-gray-900 rounded-lg p-3 text-xs font-mono text-gray-400 space-y-0.5">
                                {seedLog.map((line, i) => <div key={i}>{line}</div>)}
                            </div>
                        )}
                        {seedResult && (
                            <div className="mt-2 text-sm text-gray-300">
                                Done: {seedResult.created} created, {seedResult.failed} failed, {seedResult.skipped} skipped
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
