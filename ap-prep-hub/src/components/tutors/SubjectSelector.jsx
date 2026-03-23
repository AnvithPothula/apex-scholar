import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Brain,
  Search,
  TrendingUp,
  Zap,
  BarChart3,
  Beaker,
  Calculator,
  Code,
  Palette,
  Globe,
  Users,
  Landmark,
  Languages,
  Music,
  Atom,
  TrendingUp as Economics,
  Brush,
  Microscope,
  Earth,
  Scale,
  MapPin,
  Scroll,
  PenTool
} from 'lucide-react';
import { Card, CardContent, Input } from '../ui/UIComponents';
import { useAuth } from '../../contexts/AuthContext';
import { getAvailableSubjects, getCurriculumData } from '../../constants/comprehensiveCurriculum';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const SubjectSelector = ({ subjects, selectedSubject, onSelectSubject }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredSubject, setHoveredSubject] = useState(null);
  const [userSubjects, setUserSubjects] = useState([]);
  const [isLoadingUserSubjects, setIsLoadingUserSubjects] = useState(true);

  // Load user's selected subjects from Settings
  React.useEffect(() => {
    const loadUserSubjects = async () => {
      if (!user?.uid) {
        setIsLoadingUserSubjects(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUserSubjects(userData.subjects || []);
        }
      } catch (error) {
        console.error("Error loading user subjects:", error);
      } finally {
        setIsLoadingUserSubjects(false);
      }
    };

    loadUserSubjects();
  }, [user]);

  // Enhanced subject data with modern features - using comprehensive curriculum
  const enhancedSubjects = React.useMemo(() => {
    const comprehensiveSubjects = getAvailableSubjects();

    const allSubjects = comprehensiveSubjects.map(subjectKey => {
      const curriculumData = getCurriculumData(subjectKey);
      return {
        id: subjectKey,
        name: curriculumData.name || subjectKey,
        description: curriculumData.description || `Master ${subjectKey} with comprehensive tutoring`,
        icon: getSubjectIcon(subjectKey),
        color: getSubjectColor(subjectKey),
        isUserSubject: userSubjects.includes(subjectKey)
      };
    });

    // Sort: user subjects first (alphabetically), then other subjects (alphabetically)
    const userSelectedSubjects = allSubjects.filter(s => s.isUserSubject).sort((a, b) => a.name.localeCompare(b.name));
    const otherSubjects = allSubjects.filter(s => !s.isUserSubject).sort((a, b) => a.name.localeCompare(b.name));

    return [...userSelectedSubjects, ...otherSubjects];
  }, [userSubjects]);

  const filteredSubjects = enhancedSubjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separate filtered subjects into user subjects and others
  const filteredUserSubjects = filteredSubjects.filter(s => s.isUserSubject);
  const filteredOtherSubjects = filteredSubjects.filter(s => !s.isUserSubject);

  const handleSubjectSelect = (subjectId) => {
    onSelectSubject(subjectId);
    navigate(`/AITutors/${encodeURIComponent(subjectId)}`);
  };

  const hasUserSubjects = user && !isLoadingUserSubjects && filteredUserSubjects.length > 0;

  return (
    <div className="min-h-screen bg-base-950">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8 sm:mb-10"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-content-primary mb-2">
            {hasUserSubjects ? 'Your Subjects' : 'Subjects'}
          </h1>
          <p className="text-sm sm:text-base text-content-muted">
            Choose a subject to start studying.
          </p>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-8 sm:mb-10"
        >
          <div className="max-w-2xl">
            <Input
              icon={Search}
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-base md:text-lg py-4 md:py-6"
            />
          </div>
        </motion.div>

        {/* Subject Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          {/* User's Selected Subjects Section */}
          {hasUserSubjects && (
            <div className="mb-10">
              <div className="mb-5">
                <h2 className="text-lg sm:text-xl md:text-2xl font-display font-semibold text-content-primary">
                  Your Subjects
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                <AnimatePresence>
                  {filteredUserSubjects.map((subject, index) => (
                    <SubjectCard
                      key={subject.id}
                      subject={subject}
                      index={index}
                      hoveredSubject={hoveredSubject}
                      setHoveredSubject={setHoveredSubject}
                      handleSubjectSelect={handleSubjectSelect}
                      isUserSubject={true}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* All Other Subjects Section */}
          {filteredOtherSubjects.length > 0 && (
            <div>
              {hasUserSubjects && (
                <div className="mb-5">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-display font-semibold text-content-primary">
                    All Subjects
                  </h2>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                <AnimatePresence>
                  {filteredOtherSubjects.map((subject, index) => (
                    <SubjectCard
                      key={subject.id}
                      subject={subject}
                      index={index}
                      hoveredSubject={hoveredSubject}
                      setHoveredSubject={setHoveredSubject}
                      handleSubjectSelect={handleSubjectSelect}
                      isUserSubject={false}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

// SubjectCard Component
const SubjectCard = React.forwardRef(({ subject, index, hoveredSubject, setHoveredSubject, handleSubjectSelect, isUserSubject }, ref) => (
  <motion.div
    ref={ref}
    key={subject.id}
    layout
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ delay: Math.min(index * 0.02, 0.3), duration: 0.3 }}
    onHoverStart={() => setHoveredSubject(subject.id)}
    onHoverEnd={() => setHoveredSubject(null)}
  >
    <Card
      className={`cursor-pointer h-full bg-base-850 border transition-colors duration-200 relative rounded-md overflow-hidden ${
        hoveredSubject === subject.id ? 'border-border-strong' : 'border-border'
      }`}
      onClick={() => handleSubjectSelect(subject.id)}
    >
      {/* Category color stripe at top for user subjects */}
      {isUserSubject && (
        <div className={`h-0.5 ${subject.color}`} />
      )}

      <CardContent className="p-0">
        <div className={isUserSubject ? 'p-5' : 'p-4'}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-2.5 h-2.5 rounded-full ${subject.color} flex-shrink-0`} />
            <h3 className={`font-semibold text-content-primary ${isUserSubject ? 'text-base' : 'text-sm'}`}>
              {subject.name}
            </h3>
          </div>

          <p className={`text-content-muted leading-relaxed ${isUserSubject ? 'text-sm ml-5.5' : 'text-xs ml-5.5'}`} style={{ marginLeft: '1.375rem' }}>
            {subject.description}
          </p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
));

// Helper functions for dynamic styling - consistent with AITutors
function getSubjectIcon(subjectId) {
  const iconMap = {
    'biology': Microscope,
    'chemistry': Beaker,
    'physics': Atom,
    'environmental': Earth,
    'psychology': Brain,
    'calculus': Calculator,
    'statistics': BarChart3,
    'precalculus': Calculator,
    'computer': Code,
    'computerScience': Code,
    'programming': Code,
    'english': BookOpen,
    'literature': BookOpen,
    'language': Languages,
    'composition': PenTool,
    'chinese': Languages,
    'french': Languages,
    'german': Languages,
    'italian': Languages,
    'japanese': Languages,
    'spanish': Languages,
    'latin': Scroll,
    'history': Landmark,
    'government': Scale,
    'politics': Users,
    'geography': MapPin,
    'humanGeography': Globe,
    'worldHistory': Globe,
    'usHistory': Landmark,
    'europeanHistory': Landmark,
    'economics': Economics,
    'macroeconomics': TrendingUp,
    'microeconomics': BarChart3,
    'art': Palette,
    'studio': Brush,
    'drawing': PenTool,
    'design': Palette,
    'music': Music,
    'research': BookOpen,
    'seminar': Users
  };

  const subjectLower = subjectId?.toLowerCase() || '';

  for (const [key, icon] of Object.entries(iconMap)) {
    if (subjectLower.includes(key.toLowerCase())) {
      return icon;
    }
  }

  if (subjectLower.includes('ap physics 1')) return Microscope;
  if (subjectLower.includes('ap physics 2')) return Atom;
  if (subjectLower.includes('mechanics')) return Calculator;
  if (subjectLower.includes('electricity') || subjectLower.includes('magnetism')) return Zap;
  if (subjectLower.includes('comparative')) return Globe;

  return BookOpen;
}

function getSubjectColor(subjectId) {
  const colorMap = {
    'biology': 'bg-success-500',
    'chemistry': 'bg-success-600',
    'physics': 'bg-success-500',
    'environmental': 'bg-success-400',
    'psychology': 'bg-content-primary',
    'calculus': 'bg-error-500',
    'statistics': 'bg-error-600',
    'precalculus': 'bg-error-400',
    'computer': 'bg-content-primary',
    'programming': 'bg-emerald-700',
    'english': 'bg-info-500',
    'literature': 'bg-info-600',
    'language': 'bg-info-400',
    'composition': 'bg-info-500',
    'chinese': 'bg-info-500',
    'french': 'bg-info-400',
    'german': 'bg-info-600',
    'italian': 'bg-info-500',
    'japanese': 'bg-info-400',
    'spanish': 'bg-info-500',
    'latin': 'bg-info-600',
    'history': 'bg-accent-500',
    'government': 'bg-accent-500',
    'politics': 'bg-accent-500',
    'geography': 'bg-accent-400',
    'humanGeography': 'bg-accent-500',
    'worldHistory': 'bg-accent-500',
    'usHistory': 'bg-accent-500',
    'europeanHistory': 'bg-accent-500',
    'economics': 'bg-warning-500',
    'macroeconomics': 'bg-warning-500',
    'microeconomics': 'bg-warning-500',
    'art': 'bg-content-primary',
    'studio': 'bg-content-primary',
    'drawing': 'bg-base-750',
    'design': 'bg-content-primary',
    'music': 'bg-content-primary',
    'research': 'bg-base-750',
    'seminar': 'bg-content-primary'
  };

  const subjectLower = subjectId?.toLowerCase() || '';

  for (const [key, color] of Object.entries(colorMap)) {
    if (subjectLower.includes(key.toLowerCase())) {
      return color;
    }
  }

  if (subjectLower.includes('ap physics 1')) return 'bg-success-500';
  if (subjectLower.includes('ap physics 2')) return 'bg-success-500';
  if (subjectLower.includes('mechanics')) return 'bg-success-600';
  if (subjectLower.includes('electricity') || subjectLower.includes('magnetism')) return 'bg-success-500';
  if (subjectLower.includes('comparative')) return 'bg-accent-500';

  return 'bg-content-primary';
}

export default SubjectSelector;
