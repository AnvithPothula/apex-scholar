import React from 'react';
import { motion } from 'framer-motion';
import { Brain, CheckCircle, Clock } from 'lucide-react';

const ScoringScreen = () => {
  return (
    <div className="min-h-screen bg-base-950 text-content-primary flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="relative mb-8">
          <div className="w-32 h-32 border-4 border-content-muted border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain strokeWidth={1.5} className="w-12 h-12 text-content-primary" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-content-primary mb-4">Grading Your Test</h2>
        <p className="text-lg text-content-secondary mb-2">
          Our AI is analyzing your responses and providing detailed feedback
        </p>
        <p className="text-sm text-content-muted">
          This may take a few moments for written responses...
        </p>

        <div className="mt-8 space-y-2">
          <div className="flex items-center justify-center gap-2 text-content-muted">
            <CheckCircle strokeWidth={1.5} className="w-4 h-4 text-success-400" />
            <span>Analyzing multiple choice answers</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-content-muted">
            <div className="w-4 h-4 border-2 border-content-muted border-t-transparent rounded-full animate-spin"></div>
            <span>Scoring written responses with AI</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-content-muted">
            <Clock strokeWidth={1.5} className="w-4 h-4" />
            <span>Generating personalized feedback</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ScoringScreen;
