import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Brain, 
  Trophy, 
  Search, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Target,
  Zap,
  Lightbulb,
  BarChart3,
  // Subject-specific icons
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
    
    // Use comprehensive curriculum as the primary source
    const allSubjects = comprehensiveSubjects.map(subjectKey => {
      const curriculumData = getCurriculumData(subjectKey);
      return {
        id: subjectKey,
        name: curriculumData.name || subjectKey,
        description: curriculumData.description || `Master ${subjectKey} with comprehensive tutoring`,
        avgStudyTime: Math.floor(Math.random() * 60) + 90, // 90-150 mins for AP courses
        icon: getSubjectIcon(subjectKey),
        gradient: getSubjectGradient(subjectKey),
        color: getSubjectColor(subjectKey),
        features: [
          'Practice Tests', 
          'Study Plans',
          'Progress Tracking',
          'Personalized Learning'
        ],
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

  return (
    <div className="min-h-screen bg-base-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-primary-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 30, 0],
            scale: [1, 0.8, 1]
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <motion.div
              className="p-2 sm:p-3 md:p-4 bg-primary-500 rounded-sm"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Brain strokeWidth={1.5} className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-base-950" />
            </motion.div>
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-display font-bold text-primary-400">
              Apex Scholar
            </h1>
          </div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-sm sm:text-base md:text-xl text-content-secondary max-w-3xl mx-auto leading-relaxed px-2"
          >
            <span className="hidden sm:inline">Unlock your full potential with AI-powered tutoring, intelligent scheduling, 
            and personalized study plans designed for AP success.</span>
            <span className="sm:hidden">AI-powered tutoring for AP success.</span>
          </motion.p>

          {/* Stats Dashboard - Only show for logged in users */}
          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-6 sm:mt-8 md:mt-12 max-w-4xl mx-auto"
            >
              {[
                { icon: Trophy, label: "AP Subjects Available", value: "38+", color: "text-warning-500" },
                { icon: TrendingUp, label: "Study Tools", value: "Advanced", color: "text-success-500" },
                { icon: Clock, label: "AI Response Time", value: "⚡ Instant", color: "text-primary-500" },
                { icon: Target, label: "Personalized", value: "100%", color: "text-primary-500" }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                  className="bg-base-850 rounded-md p-3 sm:p-4 md:p-6 border border-border shadow-raised"
                >
                  <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 ${stat.color} mx-auto mb-1 sm:mb-2`} />
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-content-primary">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-content-muted leading-tight">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mb-12"
        >
          <div className="max-w-2xl mx-auto">
            <Input
              icon={Search}
              placeholder="Search AP Subjects"
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
          transition={{ delay: 1, duration: 0.8 }}
        >
          {/* User's Selected Subjects Section */}
          {user && !isLoadingUserSubjects && filteredUserSubjects.length > 0 && (
            <div className="mb-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1, duration: 0.6 }}
                className="mb-8"
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-content-primary mb-2 flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-primary-500 rounded-sm">
                    <Sparkles strokeWidth={1.5} className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-base-950" />
                  </div>
                  Your AP Subjects
                </h2>
                <p className="text-sm md:text-base text-content-muted">
                  Your personalized tutors are ready to help you succeed in these subjects.
                </p>
              </motion.div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
                <AnimatePresence mode="popLayout">
                  {filteredUserSubjects.map((subject, index) => (
                    <SubjectCard
                      key={subject.id}
                      subject={subject}
                      index={index}
                      hoveredSubject={hoveredSubject}
                      setHoveredSubject={setHoveredSubject}
                      handleSubjectSelect={handleSubjectSelect}
                      user={user}
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
              {user && !isLoadingUserSubjects && filteredUserSubjects.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="mb-8"
                >
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-content-primary mb-2 flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-base-750 rounded-sm">
                      <BookOpen strokeWidth={1.5} className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-content-primary" />
                    </div>
                    Explore More AP Subjects
                  </h2>
                  <p className="text-sm md:text-base text-content-muted">
                    Discover additional AP courses to add to your study plan.
                  </p>
                </motion.div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                <AnimatePresence mode="popLayout">
                  {filteredOtherSubjects.map((subject, index) => (
                    <SubjectCard
                      key={subject.id}
                      subject={subject}
                      index={user ? index + filteredUserSubjects.length : index}
                      hoveredSubject={hoveredSubject}
                      setHoveredSubject={setHoveredSubject}
                      handleSubjectSelect={handleSubjectSelect}
                      user={user}
                      isUserSubject={false}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </motion.div>

        {/* CTA Section - Show for non-logged in users */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="text-center mt-20"
          >
            <Card className="max-w-4xl mx-auto bg-primary-500 border-none text-base-950">
              <CardContent className="p-6 sm:p-8 md:p-12">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="inline-block mb-4 md:mb-6"
                >
                  <Lightbulb strokeWidth={1.5} className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16" />
                </motion.div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">Ready to Excel in Your AP Courses?</h2>
                <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 text-base-950/80">
                  Get personalized AI tutoring for all 39 AP subjects with our advanced study platform.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-base-950 text-primary-400 px-8 py-4 rounded-md font-semibold text-lg shadow-floating hover:shadow-floating transition-all duration-300"
                  onClick={() => navigate('/login')}
                >
                  Join Thousands of Successful Students
                </motion.button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// SubjectCard Component
const SubjectCard = React.forwardRef(({ subject, index, hoveredSubject, setHoveredSubject, handleSubjectSelect, user, isUserSubject }, ref) => (
  <motion.div
    ref={ref}
    key={subject.id}
    layout
    initial={{ opacity: 0, scale: 0.8, y: 50 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.8, y: -50 }}
    transition={{ delay: index * 0.05, duration: 0.6 }}
    whileHover={{ scale: 1.05, y: -10 }}
    onHoverStart={() => setHoveredSubject(subject.id)}
    onHoverEnd={() => setHoveredSubject(null)}
  >
    <Card
      className={`cursor-pointer h-full bg-base-850 border-2 transition-all duration-300 relative rounded-md ${
        hoveredSubject === subject.id ? 'border-border-strong shadow-floating' : 'border-border'
      } ${isUserSubject ? 'ring-2 ring-primary-500/30' : ''}`}
      onClick={() => handleSubjectSelect(subject.id)}
    >
      {/* User Subject Badge */}
      {isUserSubject && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-primary-500 text-base-950 text-xs px-2 py-1 rounded-full font-semibold shadow-raised">
            Your Subject
          </div>
        </div>
      )}
      
      <CardContent className="p-0">
        {/* Subject Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 ${subject.color} rounded-sm shadow-raised`}>
              <subject.icon strokeWidth={1.5} className="w-6 h-6 text-content-primary" />
            </div>
            {isUserSubject && (
              <Sparkles strokeWidth={1.5} className="w-5 h-5 text-primary-400" />
            )}
          </div>
          
          <h3 className="text-xl font-bold text-content-primary mb-2">{subject.name}</h3>
          <p className="text-sm text-content-muted mb-4">{subject.description}</p>
          
          {/* Stats - Only show for non-logged-in users */}
          {!user && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-success-400">
                  Advanced
                </div>
                <div className="text-xs text-content-muted">Course Level</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-primary-400">
                  {subject.avgStudyTime}min
                </div>
                <div className="text-xs text-content-muted">Study Time</div>
              </div>
            </div>
          )}

          {/* Progress Bar - Only show for non-logged-in users */}
          {!user && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-content-muted mb-1">
                <span>Avg Student Progress</span>
                <span>{25 + (index % 60)}%</span>
              </div>
              <div className="w-full bg-base-800 rounded-full h-2">
                <motion.div
                  className="bg-primary-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${25 + (index % 60)}%` }}
                  transition={{ delay: index * 0.1, duration: 1 }}
                />
              </div>
            </div>
          )}

          {/* Features */}
          <div className="space-y-2">
            {subject.features.slice(0, 2).map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-content-muted">
                <Sparkles strokeWidth={1.5} className="w-3 h-3 text-primary-500" />
                {feature}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
));

// Helper functions for dynamic styling - consistent with AITutors
function getSubjectIcon(subjectId) {
  // Create comprehensive mapping based on subject content
  const iconMap = {
    // Sciences
    'biology': Microscope,
    'chemistry': Beaker,
    'physics': Atom,
    'environmental': Earth,
    'psychology': Brain,
    
    // Math
    'calculus': Calculator,
    'statistics': BarChart3,
    'precalculus': Calculator,
    
    // Computer Science
    'computer': Code,
    'computerScience': Code,
    'programming': Code,
    
    // Languages & Literature
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
    
    // History & Social Sciences
    'history': Landmark,
    'government': Scale,
    'politics': Users,
    'geography': MapPin,
    'humanGeography': Globe,
    'worldHistory': Globe,
    'usHistory': Landmark,
    'europeanHistory': Landmark,
    
    // Economics
    'economics': Economics,
    'macroeconomics': TrendingUp,
    'microeconomics': BarChart3,
    
    // Arts
    'art': Palette,
    'studio': Brush,
    'drawing': PenTool,
    'design': Palette,
    'music': Music,
    
    // Other
    'research': BookOpen,
    'seminar': Users
  };
  
  // Find matching icon by checking if subject ID contains key terms
  const subjectLower = subjectId?.toLowerCase() || '';
  
  for (const [key, icon] of Object.entries(iconMap)) {
    if (subjectLower.includes(key.toLowerCase())) {
      return icon;
    }
  }
  
  // Additional specific mappings for exact matches
  if (subjectLower.includes('ap physics 1')) return Microscope;
  if (subjectLower.includes('ap physics 2')) return Atom;
  if (subjectLower.includes('mechanics')) return Calculator;
  if (subjectLower.includes('electricity') || subjectLower.includes('magnetism')) return Zap;
  if (subjectLower.includes('comparative')) return Globe;
  
  // Default fallback
  return BookOpen;
}

function getSubjectGradient(subject) {
  // Subtle tinted backgrounds per category
  const tints = [
    'bg-primary-950',
    'bg-success-900/40',
    'bg-info-900/40',
    'bg-warning-900/40',
    'bg-error-900/40',
    'bg-accent-900/40'
  ];
  return tints[subject.length % tints.length];
}

function getSubjectColor(subjectId) {
  // Solid color mapping by subject area
  const colorMap = {
    // Sciences - Success (green)
    'biology': 'bg-success-500',
    'chemistry': 'bg-success-600',
    'physics': 'bg-success-500',
    'environmental': 'bg-success-400',
    'psychology': 'bg-primary-600',

    // Math - Error (red)
    'calculus': 'bg-error-500',
    'statistics': 'bg-error-600',
    'precalculus': 'bg-error-400',

    // Computer Science - Primary (teal)
    'computer': 'bg-primary-600',
    'programming': 'bg-primary-700',

    // English & Literature - Info (blue)
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

    // History & Social Sciences - Accent (amber/orange)
    'history': 'bg-accent-500',
    'government': 'bg-accent-500',
    'politics': 'bg-accent-500',
    'geography': 'bg-accent-400',
    'humanGeography': 'bg-accent-500',
    'worldHistory': 'bg-accent-500',
    'usHistory': 'bg-accent-500',
    'europeanHistory': 'bg-accent-500',

    // Economics - Warning (yellow-amber)
    'economics': 'bg-warning-500',
    'macroeconomics': 'bg-warning-500',
    'microeconomics': 'bg-warning-500',

    // Arts - Primary (teal)
    'art': 'bg-primary-500',
    'studio': 'bg-primary-600',
    'drawing': 'bg-base-750',
    'design': 'bg-primary-500',
    'music': 'bg-primary-600',

    // Other
    'research': 'bg-base-750',
    'seminar': 'bg-primary-500'
  };

  // Find matching color by checking if subject ID contains key terms
  const subjectLower = subjectId?.toLowerCase() || '';

  for (const [key, color] of Object.entries(colorMap)) {
    if (subjectLower.includes(key.toLowerCase())) {
      return color;
    }
  }

  // Specific overrides for exact matches
  if (subjectLower.includes('ap physics 1')) return 'bg-success-500';
  if (subjectLower.includes('ap physics 2')) return 'bg-success-500';
  if (subjectLower.includes('mechanics')) return 'bg-success-600';
  if (subjectLower.includes('electricity') || subjectLower.includes('magnetism')) return 'bg-success-500';
  if (subjectLower.includes('comparative')) return 'bg-accent-500';

  // Default fallback
  return 'bg-primary-500';
}

export default SubjectSelector;