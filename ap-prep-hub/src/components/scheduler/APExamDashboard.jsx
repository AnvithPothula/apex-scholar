import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, BookOpen, Target, X } from 'lucide-react';
import { Card, CardContent, Badge } from '../ui/UIComponents';
import { getUpcomingExamsSync } from '../../constants/apExamDates';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

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
          
          console.log('APExamDashboard Debug:', {
            userData,
            subjects,
            subjectsLength: subjects.length
          });
          
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
      <Card className="bg-slate-800/60 border-slate-700">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-600 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-slate-600 rounded w-1/2"></div>
          </div>
        </div>
      </Card>
    );
  }

  const getUrgencyLevel = (daysUntil) => {
    if (daysUntil < 0) return { level: 'past', color: 'text-slate-500', bgColor: 'bg-slate-900/50' };
    if (daysUntil <= 14) return { level: 'critical', color: 'text-red-300', bgColor: 'bg-red-900/50' };
    if (daysUntil <= 30) return { level: 'warning', color: 'text-yellow-300', bgColor: 'bg-yellow-900/50' };
    if (daysUntil <= 60) return { level: 'moderate', color: 'text-blue-300', bgColor: 'bg-blue-900/50' };
    return { level: 'low', color: 'text-green-300', bgColor: 'bg-green-900/50' };
  };

  const buttonText = upcomingExams.length === 0 
    ? (userSubjects.length === 0 ? "Select AP Subjects" : "No Upcoming Exams")
    : `${upcomingExams.length} AP Exam${upcomingExams.length === 1 ? '' : 's'}`;

  return (
    <>
      <Card 
        className="bg-slate-800/60 border-slate-700 cursor-pointer hover:bg-slate-800/80 transition-colors"
        onClick={() => setIsModalOpen(true)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="text-slate-100 font-medium">AP Exam Schedule</h3>
                <p className="text-slate-400 text-sm">{buttonText}</p>
              </div>
            </div>
            {upcomingExams.length > 0 && (
              <Badge className="bg-blue-900/50 text-blue-300 border-blue-700">
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
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <motion.div
                className="bg-slate-800 rounded-xl border border-slate-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
              <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-blue-400" />
                  <h2 className="text-xl font-semibold text-slate-100">AP Exam Schedule</h2>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {upcomingExams.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-300 mb-2">
                      {userSubjects.length === 0 ? "No AP Subjects Selected" : "No Upcoming Exams"}
                    </h3>
                    <p className="text-slate-400">
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
                          className={`p-4 rounded-lg border ${urgency.bgColor} border-slate-600`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-semibold text-slate-100">{exam.subject}</h3>
                            <Badge className={`${urgency.bgColor} ${urgency.color} border-slate-600`}>
                              {exam.daysUntilExam} days
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-300 text-sm">
                                {format(exam.examDate, 'MMM dd, yyyy')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-300 text-sm">{exam.time}</span>
                            </div>
                          </div>

                          {exam.reviewSchedule && exam.reviewSchedule.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-700">
                              <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                Review Schedule
                              </h4>
                              <div className="space-y-2">
                                {exam.reviewSchedule.map((review, reviewIndex) => (
                                  <div key={reviewIndex} className="flex items-center gap-3 text-sm">
                                    <Target className="w-3 h-3 text-blue-400" />
                                    <span className="text-slate-400">{review.startDate}:</span>
                                    <span className="text-slate-300">{review.description}</span>
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
