import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, TrendingUp, CheckCircle, Target } from 'lucide-react';
import { Card, Badge } from '../ui/UIComponents';
import { performanceTracker, questionCache } from '../../utils/tutorOptimization';

export const PerformanceIndicator = ({ responseTime, showDetails = false }) => {
  const getPerformanceInfo = (time) => {
    if (time < 1.0) {
      return {
        icon: Zap,
        color: 'text-success-400',
        bgColor: 'bg-success-900/20',
        borderColor: 'border-success-500/30',
        label: 'Lightning Fast',
        description: 'Sub-second response!',
        emoji: '⚡'
      };
    } else if (time < 2.0) {
      return {
        icon: CheckCircle,
        color: 'text-info-400',
        bgColor: 'bg-info-900/20',
        borderColor: 'border-info-500/30',
        label: 'Quick Response',
        description: 'Excellent speed',
        emoji: '✓'
      };
    } else if (time < 3.0) {
      return {
        icon: Clock,
        color: 'text-warning-400',
        bgColor: 'bg-warning-900/20',
        borderColor: 'border-warning-500/30',
        label: 'Good Response',
        description: 'Normal speed',
        emoji: '⏱️'
      };
    } else {
      return {
        icon: TrendingUp,
        color: 'text-error-400',
        bgColor: 'bg-error-900/20',
        borderColor: 'border-error-500/30',
        label: 'Processing',
        description: 'Complex analysis',
        emoji: '🔄'
      };
    }
  };

  if (!responseTime) return null;

  const perf = getPerformanceInfo(responseTime);
  const Icon = perf.icon;

  if (!showDetails) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${perf.bgColor} ${perf.borderColor} border text-xs`}
      >
        <Icon className={`w-3 h-3 ${perf.color}`} />
        <span className={perf.color}>{responseTime.toFixed(2)}s</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 p-2 rounded-lg ${perf.bgColor} ${perf.borderColor} border`}
    >
      <Icon className={`w-4 h-4 ${perf.color}`} />
      <div className="flex-1">
        <div className={`text-sm font-medium ${perf.color}`}>{perf.label}</div>
        <div className="text-xs text-content-muted">{perf.description}</div>
      </div>
      <div className="text-right">
        <div className={`text-sm font-mono ${perf.color}`}>{responseTime.toFixed(2)}s</div>
        <div className="text-xs text-content-muted">{perf.emoji}</div>
      </div>
    </motion.div>
  );
};

export const PerformanceStats = ({ className = '' }) => {
  const [stats, setStats] = useState(null);
  const [cacheStats, setCacheStats] = useState(null);

  useEffect(() => {
    const updateStats = () => {
      setStats(performanceTracker.getPerformanceStats());
      setCacheStats(questionCache.getCacheStats());
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  const fastResponsePercentage = Math.round(stats.fastResponseRate * 100);
  const cacheHitPercentage = cacheStats ? Math.round(cacheStats.hitRate * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}
    >
      {/* Average Response Time */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-sm bg-info-900/20 border border-info-500/30">
            <Clock strokeWidth={1.5} className="w-4 h-4 text-info-400" />
          </div>
          <div>
            <div className="text-lg font-bold text-content-primary">
              {stats.averageResponseTime.toFixed(2)}s
            </div>
            <div className="text-xs text-content-muted">Avg Response</div>
          </div>
        </div>
      </Card>

      {/* Fast Response Rate */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-sm bg-success-900/20 border border-success-500/30">
            <Zap strokeWidth={1.5} className="w-4 h-4 text-success-400" />
          </div>
          <div>
            <div className="text-lg font-bold text-content-primary">
              {fastResponsePercentage}%
            </div>
            <div className="text-xs text-content-muted">Sub-second</div>
          </div>
        </div>
      </Card>

      {/* Total Responses */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-sm bg-primary-900/20 border border-primary-500/30">
            <Target strokeWidth={1.5} className="w-4 h-4 text-primary-400" />
          </div>
          <div>
            <div className="text-lg font-bold text-content-primary">
              {stats.totalResponses}
            </div>
            <div className="text-xs text-content-muted">Total Queries</div>
          </div>
        </div>
      </Card>

      {/* Cache Hit Rate */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-sm bg-warning-900/20 border border-warning-500/30">
            <TrendingUp strokeWidth={1.5} className="w-4 h-4 text-warning-400" />
          </div>
          <div>
            <div className="text-lg font-bold text-content-primary">
              {cacheHitPercentage}%
            </div>
            <div className="text-xs text-content-muted">Cache Hits</div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export const SpeedGoalIndicator = ({ currentAverage }) => {
  const goalTime = 1.0; // Sub-second goal
  const isAchieving = currentAverage <= goalTime;
  const percentage = Math.min((goalTime / currentAverage) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-content-secondary">Speed Goal Progress</span>
        <Badge 
          variant={isAchieving ? "success" : "warning"}
          className={isAchieving ? "bg-success-900 text-success-200" : "bg-warning-900 text-warning-200"}
        >
          {isAchieving ? "Achieved!" : "In Progress"}
        </Badge>
      </div>
      
      <div className="relative">
        <div className="w-full bg-base-800 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full ${isAchieving ? 'bg-success-500' : 'bg-primary-500'}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-content-muted">
          <span>Current: {currentAverage.toFixed(2)}s</span>
          <span>Goal: &lt;{goalTime}s</span>
        </div>
      </div>
      
      {isAchieving && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-center"
        >
          <span className="text-success-400 text-sm">⚡ Sub-second responses achieved!</span>
        </motion.div>
      )}
    </motion.div>
  );
};
