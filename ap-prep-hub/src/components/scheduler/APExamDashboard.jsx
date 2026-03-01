import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, BookOpen, Target, X, Globe } from 'lucide-react';
import { Card, CardContent, Badge } from '../ui/UIComponents';
import { getUpcomingExamsSync } from '../../constants/apExamDates';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { getTimezoneDisplayString } from '../../utils/timezone';

const APExamDashboard = () => {
  const { user } = useAuth();
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [userSubjects, setUserSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadExamData = async () => {
      if (!user?.uid) {
        setIsLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const subjects = userData.subjects || [];
          
          setUserSubjects(subjects);
          
          const exams = getUpcomingExamsSync(subjects);
          console.log('Exams returned:', exams);
          setUpcomingExams(exams);
        }
      } catch (error) {
        console.error("Error loading exam data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExamData();
  }, [user]);

  if (isLoading) {
    return (
      <Card className="bg-base-850 border-border">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-base-800 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-base-800 rounded w-1/2"></div>
          </div>
        </div>
      </Card>
    );
  }

  const getUrgencyLevel = (daysUntil) => {
    if (daysUntil < 0) return { level: 'past', color: 'text-content-muted', bgColor: 'bg-base-900/50' };
    if (daysUntil <= 14) return { level: 'critical', color: 'text-error-300', bgColor: 'bg-error-900/50' };
    if (daysUntil <= 30) return { level: 'warning', color: 'text-warning-300', bgColor: 'bg-warning-900/50' };
    if (daysUntil <= 60) return { level: 'moderate', color: 'text-info-300', bgColor: 'bg-info-900/50' };
    return { level: 'low', color: 'text-success-300', bgColor: 'bg-success-900/50' };
  };

  const buttonText = upcomingExams.length === 0 
    ? (userSubjects.length === 0 ? "Select AP Subjects" : "No Upcoming Exams")
    : `${upcomingExams.length} AP Exam${upcomingExams.length === 1 ? '' : 's'}`;

  return (
    <>
      <Card
        className="bg-base-850 border-border cursor-pointer hover:bg-base-800 transition-colors"
        onClick={() => setIsModalOpen(true)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary-400" strokeWidth={1.5} />
              <div>
                <h3 className="text-content-primary font-medium">AP Exam Schedule</h3>
                <p className="text-content-muted text-sm">{buttonText}</p>
              </div>
            </div>
            {upcomingExams.length > 0 && (
              <Badge className="bg-primary-900/50 text-primary-300 border-primary-700">
                {upcomingExams.length}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Render modal using portal to ensure it appears above everything */}
      {createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <motion.div
                className="bg-base-850 rounded-md border border-border max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-floating"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-primary-400" strokeWidth={1.5} />
                  <h2 className="text-xl font-semibold text-content-primary">AP Exam Schedule</h2>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-content-muted hover:text-content-primary transition-colors"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>

              <div className="p-6">
                {upcomingExams.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-16 h-16 text-content-muted mx-auto mb-4" strokeWidth={1.5} />
                    <h3 className="text-lg font-medium text-content-secondary mb-2">
                      {userSubjects.length === 0 ? "No AP Subjects Selected" : "No exams registered"}
                    </h3>
                    <p className="text-content-muted">
                      {userSubjects.length === 0
                        ? "Go to Settings to choose your AP courses and see exam dates."
                        : `You have ${userSubjects.length} AP subjects selected but no upcoming exams were found.`
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingExams.map((exam, index) => {
                      const urgency = getUrgencyLevel(exam.daysUntilExam);
                      return (
                        <motion.div
                          key={exam.subject}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-4 rounded-sm border ${urgency.bgColor} border-border-strong`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-semibold text-content-primary">{exam.subject}</h3>
                            <Badge className={`${urgency.bgColor} ${urgency.color} border-border-strong`}>
                              {exam.daysUntilExam} days
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-content-muted" strokeWidth={1.5} />
                              <span className="text-content-secondary text-sm">
                                {format(exam.examDate, 'MMM dd, yyyy')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-content-muted" strokeWidth={1.5} />
                              <span className="text-content-secondary text-sm">{exam.time}</span>
                              <Globe className="w-3 h-3 text-content-muted" strokeWidth={1.5} />
                              <span className="text-content-muted text-xs">{getTimezoneDisplayString()}</span>
                            </div>
                          </div>

                          {exam.reviewSchedule && exam.reviewSchedule.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <h4 className="text-sm font-medium text-content-secondary mb-2 flex items-center gap-2">
                                <BookOpen className="w-4 h-4" strokeWidth={1.5} />
                                Review Schedule
                              </h4>
                              <div className="space-y-2">
                                {exam.reviewSchedule.map((review, reviewIndex) => (
                                  <div key={reviewIndex} className="flex items-center gap-3 text-sm">
                                    <Target className="w-3 h-3 text-primary-400" strokeWidth={1.5} />
                                    <span className="text-content-muted">{review.startDate}:</span>
                                    <span className="text-content-secondary">{review.description}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
      )}
    </>
  );
};

export default APExamDashboard;
