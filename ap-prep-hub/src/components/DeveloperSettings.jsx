import React, { useState, useEffect } from 'react';
import { Star, X, Code2, Trash2, ChevronDown, ChevronUp, Users, ShieldOff } from 'lucide-react';
import { db } from '../config/firebase';
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';

// Admin UIDs that can access Developer Settings
const ADMIN_UIDS = [
    'b0eUycwZDHcmrkoeSEiD69QSbK32',
    'A0yRGP86ZTahByzS0ALYeKAXOn52',
];

export function isAdmin(uid) {
    return ADMIN_UIDS.includes(uid);
}

export default function DeveloperSettings({ onClose }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-slate-700">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <Code2 className="w-5 h-5 mr-2 text-purple-500" />
                        Developer Settings
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Reviews Section */}
                <div className="border border-slate-600 rounded-lg overflow-hidden">
                    <button
                        onClick={() => setExpandedSection(expandedSection === 'reviews' ? '' : 'reviews')}
                        className="w-full flex items-center justify-between p-4 bg-slate-700/50 hover:bg-slate-700 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span className="font-medium text-slate-200">User Reviews</span>
                            <span className="text-xs bg-slate-600 px-2 py-0.5 rounded-full text-slate-300">
                                {stats.total} reviews
                            </span>
                        </div>
                        {expandedSection === 'reviews' ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                    </button>

                    {expandedSection === 'reviews' && (
                        <div className="p-4 space-y-4">
                            {/* Stats Overview */}
                            {stats.total > 0 && (
                                <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-yellow-400">{stats.average}</div>
                                            <div className="flex gap-0.5 mt-1">
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <Star key={s} className={`w-3 h-3 ${s <= Math.round(stats.average) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-500'}`} />
                                                ))}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">{stats.total} total</div>
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            {[5, 4, 3, 2, 1].map(star => {
                                                const count = stats.distribution[star - 1];
                                                const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                                                return (
                                                    <div key={star} className="flex items-center gap-2 text-xs">
                                                        <span className="text-slate-400 w-3">{star}</span>
                                                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                                        <div className="flex-1 bg-slate-600 rounded-full h-2">
                                                            <div
                                                                className="bg-yellow-400 h-2 rounded-full transition-all"
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-slate-400 w-6 text-right">{count}</span>
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
                                    <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                    <p className="text-sm text-slate-400">Loading reviews...</p>
                                </div>
                            ) : reviews.length === 0 ? (
                                <div className="text-center py-8">
                                    <Users className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                                    <p className="text-sm text-slate-400">No reviews yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                                    {reviews.map(review => (
                                        <div key={review.id} className="bg-slate-700/40 rounded-lg p-3 border border-slate-600/50">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-medium text-slate-200">
                                                            {review.displayName || 'Anonymous'}
                                                        </span>
                                                        <div className="flex gap-0.5">
                                                            {[1, 2, 3, 4, 5].map(s => (
                                                                <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-500'}`} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-slate-400 mb-1">
                                                        {review.email} • {formatDate(review.createdAt)}
                                                    </p>
                                                    {review.reviewText && (
                                                        <p className="text-sm text-slate-300 mt-2">{review.reviewText}</p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteReview(review.id)}
                                                    className="ml-2 p-1 text-slate-500 hover:text-red-400 transition-colors"
                                                    title="Delete review"
                                                >
                                                    <Trash2 className="w-4 h-4" />
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
                <div className="border border-slate-600 rounded-lg overflow-hidden mt-4">
                    <button
                        onClick={() => setExpandedSection(expandedSection === 'puter' ? '' : 'puter')}
                        className="w-full flex items-center justify-between p-4 bg-slate-700/50 hover:bg-slate-700 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <ShieldOff className="w-4 h-4 text-red-400" />
                            <span className="font-medium text-slate-200">Puter Authentication</span>
                        </div>
                        {expandedSection === 'puter' ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                    </button>

                    {expandedSection === 'puter' && (
                        <div className="p-4 space-y-3">
                            <p className="text-sm text-slate-400">
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
                                    alert(`Cleared ${keysToRemove.length} Puter auth key(s). Reload the page to re-authenticate.`);
                                }}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                            >
                                <ShieldOff className="w-4 h-4" />
                                Clear Puter Authentication
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
