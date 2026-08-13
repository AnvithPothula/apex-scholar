import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import ProgressIndicator from '../ui/ProgressIndicator';

/**
 * Shown while a submitted test is graded.
 *
 * The previous version listed three "steps" with a permanent green tick, a
 * permanent spinner and a permanent clock. None of them reflected anything —
 * grading is a single await with no per-stage signal — so the checklist was
 * decoration that implied knowledge the screen did not have. Replaced with an
 * honest indeterminate bar plus elapsed time, which is what we can actually
 * report, and which tells the user the app has not hung.
 */
const ScoringScreen = () => {
  return (
    <div className="min-h-screen bg-base-950 text-content-primary flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center w-full max-w-sm"
      >
        <div className="relative mb-8">
          <div className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-content-muted border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain strokeWidth={1.5} className="w-10 h-10 sm:w-12 sm:h-12 text-content-primary" />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-content-primary mb-3">Grading your test</h2>
        <p className="text-content-secondary mb-8">
          Multiple choice is scored instantly. Written responses are graded by AI,
          which is the slow part.
        </p>

        <ProgressIndicator
          label="Scoring"
          hint="Long free-response answers can take a couple of minutes."
        />
      </motion.div>
    </div>
  );
};

export default ScoringScreen;
