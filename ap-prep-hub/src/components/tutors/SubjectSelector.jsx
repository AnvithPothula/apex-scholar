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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"
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
              className="p-2 sm:p-3 md:p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Apex Scholar
            </h1>
          </div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-sm sm:text-base md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed px-2"
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
                { icon: Trophy, label: "AP Subjects Available", value: "38+", color: "text-yellow-500" },
                { icon: TrendingUp, label: "Study Tools", value: "Advanced", color: "text-green-500" },
                { icon: Clock, label: "AI Response Time", value: "⚡ Instant", color: "text-blue-500" },
                { icon: Target, label: "Personalized", value: "100%", color: "text-purple-500" }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                  className="bg-slate-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-slate-700 shadow-lg"
                >
                  <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 ${stat.color} mx-auto mb-1 sm:mb-2`} />
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-slate-200">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-slate-400 leading-tight">{stat.label}</div>
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
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-100 mb-2 flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  Your AP Subjects
                </h2>
                <p className="text-sm md:text-base text-slate-400">
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
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-100 mb-2 flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg">
                      <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    Explore More AP Subjects
                  </h2>
                  <p className="text-sm md:text-base text-slate-400">
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
            <Card className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 border-none text-white">
              <CardContent className="p-6 sm:p-8 md:p-12">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="inline-block mb-4 md:mb-6"
                >
                  <Lightbulb className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16" />
                </motion.div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">Ready to Excel in Your AP Courses?</h2>
                <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 text-blue-100">
                  Get personalized AI tutoring for all 39 AP subjects with our advanced study platform.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
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
      className={`cursor-pointer h-full bg-slate-800/90 backdrop-blur-sm border-2 transition-all duration-300 relative ${
        hoveredSubject === subject.id ? 'border-slate-600 shadow-2xl shadow-blue-500/20' : 'border-slate-700'
      } ${isUserSubject ? 'ring-2 ring-blue-500/30' : ''}`}
      onClick={() => handleSubjectSelect(subject.id)}
      glow={hoveredSubject === subject.id}
    >
      {/* User Subject Badge */}
      {isUserSubject && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
            Your Subject
          </div>
        </div>
      )}
      
      <CardContent className="p-0">
        {/* Subject Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 ${subject.color} rounded-xl shadow-lg`}>
              <subject.icon className="w-6 h-6 text-white" />
            </div>
            {isUserSubject && (
              <Sparkles className="w-5 h-5 text-blue-400" />
            )}
          </div>
          
          <h3 className="text-xl font-bold text-slate-200 mb-2">{subject.name}</h3>
          <p className="text-sm text-slate-400 mb-4">{subject.description}</p>
          
          {/* Stats - Only show for non-logged-in users */}
          {!user && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-emerald-400">
                  Advanced
                </div>
                <div className="text-xs text-slate-400">Course Level</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-400">
                  {subject.avgStudyTime}min
                </div>
                <div className="text-xs text-slate-400">Study Time</div>
              </div>
            </div>
          )}

          {/* Progress Bar - Only show for non-logged-in users */}
          {!user && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Avg Student Progress</span>
                <span>{25 + (index % 60)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
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
              <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                <Sparkles className="w-3 h-3 text-purple-500" />
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
  // Keep light gradients for backgrounds
  const gradients = [
    'bg-gradient-to-br from-blue-50/80 to-indigo-100/80',
    'bg-gradient-to-br from-emerald-50/80 to-teal-100/80',
    'bg-gradient-to-br from-purple-50/80 to-pink-100/80',
    'bg-gradient-to-br from-amber-50/80 to-orange-100/80',
    'bg-gradient-to-br from-rose-50/80 to-red-100/80',
    'bg-gradient-to-br from-cyan-50/80 to-blue-100/80'
  ];
  return gradients[subject.length % gradients.length];
}

function getSubjectColor(subjectId) {
  // Create thematic color mapping based on subject area - matching AITutors
  const colorMap = {
    // Sciences - GREEN
    'biology': 'bg-gradient-to-br from-green-500 to-emerald-600',
    'chemistry': 'bg-gradient-to-br from-green-600 to-green-700',
    'physics': 'bg-gradient-to-br from-emerald-500 to-green-600',
    'environmental': 'bg-gradient-to-br from-green-400 to-emerald-500',
    'psychology': 'bg-gradient-to-br from-green-500 to-teal-600',
    
    // Math - RED
    'calculus': 'bg-gradient-to-br from-red-500 to-red-600',
    'statistics': 'bg-gradient-to-br from-red-600 to-red-700',
    'precalculus': 'bg-gradient-to-br from-red-400 to-red-500',
    
    // Computer Science - GREEN (as it's often considered STEM/Science)
    'computer': 'bg-gradient-to-br from-green-600 to-emerald-700',
    'programming': 'bg-gradient-to-br from-emerald-600 to-green-700',
    
    // English & Literature - BLUE
    'english': 'bg-gradient-to-br from-blue-500 to-blue-600',
    'literature': 'bg-gradient-to-br from-blue-600 to-indigo-600',
    'language': 'bg-gradient-to-br from-blue-400 to-blue-500',
    'composition': 'bg-gradient-to-br from-blue-500 to-indigo-500',
    'chinese': 'bg-gradient-to-br from-blue-500 to-blue-600',
    'french': 'bg-gradient-to-br from-blue-400 to-blue-500',
    'german': 'bg-gradient-to-br from-blue-600 to-indigo-600',
    'italian': 'bg-gradient-to-br from-blue-500 to-blue-600',
    'japanese': 'bg-gradient-to-br from-blue-400 to-indigo-500',
    'spanish': 'bg-gradient-to-br from-blue-500 to-blue-600',
    'latin': 'bg-gradient-to-br from-blue-600 to-indigo-600',
    
    // History & Social Sciences - ORANGE
    'history': 'bg-gradient-to-br from-orange-500 to-orange-600',
    'government': 'bg-gradient-to-br from-orange-600 to-orange-700',
    'politics': 'bg-gradient-to-br from-orange-500 to-red-500',
    'geography': 'bg-gradient-to-br from-orange-400 to-orange-500',
    'humanGeography': 'bg-gradient-to-br from-orange-500 to-orange-600',
    'worldHistory': 'bg-gradient-to-br from-orange-600 to-red-600',
    'usHistory': 'bg-gradient-to-br from-orange-500 to-orange-600',
    'europeanHistory': 'bg-gradient-to-br from-orange-500 to-orange-600',
    
    // Economics - ORANGE (Social Studies)
    'economics': 'bg-gradient-to-br from-orange-500 to-orange-600',
    'macroeconomics': 'bg-gradient-to-br from-orange-600 to-orange-700',
    'microeconomics': 'bg-gradient-to-br from-orange-500 to-orange-600',
    
    // Arts - Keep creative colors (not in main 4 categories)
    'art': 'bg-gradient-to-br from-purple-500 to-pink-600',
    'studio': 'bg-gradient-to-br from-pink-500 to-purple-600',
    'drawing': 'bg-gradient-to-br from-gray-500 to-slate-600',
    'design': 'bg-gradient-to-br from-violet-500 to-purple-600',
    'music': 'bg-gradient-to-br from-indigo-500 to-purple-600',
    
    // Other
    'research': 'bg-gradient-to-br from-slate-600 to-gray-700',
    'seminar': 'bg-gradient-to-br from-blue-500 to-purple-600'
  };
  
  // Find matching color by checking if subject ID contains key terms
  const subjectLower = subjectId?.toLowerCase() || '';
  
  for (const [key, color] of Object.entries(colorMap)) {
    if (subjectLower.includes(key.toLowerCase())) {
      return color;
    }
  }
  
  // Specific overrides for exact matches
  if (subjectLower.includes('ap physics 1')) return 'bg-gradient-to-br from-green-500 to-emerald-600';
  if (subjectLower.includes('ap physics 2')) return 'bg-gradient-to-br from-emerald-500 to-green-600';
  if (subjectLower.includes('mechanics')) return 'bg-gradient-to-br from-green-600 to-emerald-700';
  if (subjectLower.includes('electricity') || subjectLower.includes('magnetism')) return 'bg-gradient-to-br from-green-500 to-green-700';
  if (subjectLower.includes('comparative')) return 'bg-gradient-to-br from-orange-500 to-orange-600';
  
  // Default fallback
  return 'bg-gradient-to-br from-blue-500 to-purple-600';
}

export default SubjectSelector;