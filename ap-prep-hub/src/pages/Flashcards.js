import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Play, Trash2, Clock, BookOpen, CheckCircle, X, Edit3, Save, ChevronDown, Globe, Lock, Copy, Users, User } from 'lucide-react';
import { Button, Card, Input } from '../components/ui/UIComponents';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AP_SUBJECTS } from '../constants/subjects';
import geminiService, { RateLimitError } from '../services/geminiService';
import dataService from '../services/dataService';
import MarkdownRenderer from '../components/MarkdownRenderer';
import ModelSelector, { getDefaultModel, saveSelectedModel } from '../components/ui/ModelSelector';
import { useToast } from '../contexts/ToastContext';

// Custom Dropdown Component
const CustomDropdown = ({ options, value, onChange, placeholder, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(value ? options.find(opt => opt.value === value) : null);

  const handleSelect = (option) => {
    setSelectedOption(option);
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-base-800 border border-border-strong rounded-lg px-4 py-3 text-left text-content-primary focus:border-content-muted focus:outline-none transition-colors flex items-center justify-between"
      >
        <span className={selectedOption ? 'text-content-primary' : 'text-content-muted'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} strokeWidth={1.5} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-base-850 border border-border-strong rounded-lg shadow-raised max-h-60 overflow-y-auto"
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option)}
                className="w-full px-4 py-3 text-left text-content-primary hover:bg-base-800 transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

const FlashcardsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showManualCreate, setShowManualCreate] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [createSubject, setCreateSubject] = useState('');
  const [createTopic, setCreateTopic] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [manualCards, setManualCards] = useState([{ question: '', answer: '' }]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [studyingDeck, setStudyingDeck] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studySession, setStudySession] = useState(null);
  const [selectedModel, setSelectedModel] = useState(getDefaultModel);

  const [userCollections, setUserCollections] = useState([]);
  
  // Public / Private tab state
  const [activeTab, setActiveTab] = useState('my'); // 'my' | 'public'
  const [publicDecks, setPublicDecks] = useState([]);
  const [publicSearchQuery, setPublicSearchQuery] = useState('');
  const [publicSubjectFilter, setPublicSubjectFilter] = useState('');
  const [isSearchingPublic, setIsSearchingPublic] = useState(false);
  const [copyingDeckId, setCopyingDeckId] = useState(null);
  const [isPublicDeck, setIsPublicDeck] = useState(false); // toggle for create forms

  // Load user's flashcard decks
  const loadUserFlashcards = useCallback(async () => {
    if (!user) return;
    try {
      const decks = await dataService.getUserFlashcardDecks(user.uid);
      setUserCollections(decks.map(deck => ({
        ...deck,
        lastStudied: deck.lastStudied ? new Date(deck.lastStudied.seconds * 1000).toLocaleDateString() : 'Never',
        createdAt: deck.createdAt ? new Date(deck.createdAt.seconds * 1000) : new Date()
      })));
    } catch (error) {
      console.error('Error loading flashcards:', error);
    }
  }, [user]);

  // Load user's flashcard decks on component mount
  useEffect(() => {
    loadUserFlashcards();
  }, [loadUserFlashcards]);

  const handleCreateCollection = async () => {
    if (!createSubject || !createTopic || !user) return;

    setIsGenerating(true);
    
    try {
      // Generate flashcards using Gemini AI
      const flashcards = await geminiService.generateFlashcards(
        AP_SUBJECTS[createSubject]?.name || createSubject,
        createTopic,
        20,
        'medium'
      );

      const newCollection = {
        title: `${AP_SUBJECTS[createSubject]?.name || createSubject} - ${createTopic}`,
        subject: createSubject,
        topic: createTopic,
        cards: flashcards,
        cardCount: flashcards.length,
        difficulty: 'Medium',
        description: createDescription || `AI-generated flashcards for ${createTopic}`,
        progress: 0,
        isPublic: isPublicDeck,
        creatorName: user.displayName || 'Anonymous'
      };

      // Save to Firebase
      const deckId = await dataService.saveFlashcardDeck(user.uid, newCollection);
      
      // Add to local state
      setUserCollections(prev => [{
        ...newCollection,
        id: deckId,
        lastStudied: 'Never',
        createdAt: new Date()
      }, ...prev]);

      setShowCreateForm(false);
      setCreateSubject('');
      setCreateTopic('');
      setCreateDescription('');
      setIsPublicDeck(false);
    } catch (error) {
      console.error('Error creating flashcards:', error);
      if (error instanceof RateLimitError || error?.isRateLimit) {
        const waitTime = error.retryAfter || 60;
        toast.error(`AI service is temporarily busy. Please wait ${waitTime} seconds and try again.`);
      } else {
        toast.error('Failed to generate flashcards. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStudyCollection = (collection) => {
    if (!collection.cards || collection.cards.length === 0) {
      toast.warning('This deck has no cards to study!');
      return;
    }
    
    setStudyingDeck(collection);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setStudySession({
      startTime: new Date(),
      deckId: collection.id,
      cardsStudied: 0,
      correctAnswers: 0
    });
  };

  const handleNextCard = () => {
    if (currentCardIndex < studyingDeck.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
      setStudySession(prev => ({
        ...prev,
        cardsStudied: prev.cardsStudied + 1
      }));
    } else {
      // End of deck - count last card and finish study session
      const finalSession = { ...studySession, cardsStudied: studySession.cardsStudied + 1 };
      setStudySession(finalSession);
      finishStudySession(finalSession);
    }
  };

  const handlePreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
    }
  };

  const handleCardAnswer = (isCorrect) => {
    if (isCorrect) {
      setStudySession(prev => ({
        ...prev,
        correctAnswers: prev.correctAnswers + 1
      }));
    }
    handleNextCard();
  };

  const finishStudySession = async (sessionOverride) => {
    try {
      const session = sessionOverride || studySession;
      const endTime = new Date();
      const duration = Math.round((endTime - session.startTime) / 1000 / 60); // minutes
      const accuracy = session.cardsStudied > 0
        ? Math.round((session.correctAnswers / session.cardsStudied) * 100)
        : 0;

      // Save study session
      await dataService.saveStudySession(user.uid, {
        type: 'flashcards',
        deckId: session.deckId,
        subject: studyingDeck.subject,
        duration,
        cardsStudied: session.cardsStudied,
        accuracy,
        completedAt: endTime
      });

      // Update deck progress
      const newProgress = Math.min(100, studyingDeck.progress + 10);
      await dataService.updateFlashcardProgress(studyingDeck.id, {
        progress: newProgress
      });

      // Update local state
      setUserCollections(prev => prev.map(deck => 
        deck.id === studyingDeck.id 
          ? { ...deck, progress: newProgress, lastStudied: 'Just now' }
          : deck
      ));

      toast.success(`Study session complete! Accuracy: ${accuracy}%`);
    } catch (error) {
      console.error('Error finishing study session:', error);
    }

    setStudyingDeck(null);
    setStudySession(null);
  };

  // Manual flashcard creation functions
  const handleManualCreate = async () => {
    if (!manualTitle || manualCards.some(card => !card.question || !card.answer) || !user) {
      toast.warning('Please fill in all fields and ensure each card has both a question and answer.');
      return;
    }

    try {
      const newCollection = {
        title: manualTitle,
        subject: createSubject || 'General',
        cards: manualCards.filter(card => card.question && card.answer),
        cardCount: manualCards.filter(card => card.question && card.answer).length,
        difficulty: 'Custom',
        description: createDescription || `Manually created flashcards`,
        progress: 0,
        isManual: true,
        isPublic: isPublicDeck,
        creatorName: user.displayName || 'Anonymous'
      };

      // Save to Firebase
      const deckId = await dataService.saveFlashcardDeck(user.uid, newCollection);
      
      // Add to local state
      setUserCollections(prev => [{
        ...newCollection,
        id: deckId,
        lastStudied: 'Never',
        createdAt: new Date()
      }, ...prev]);

      // Reset form
      setShowManualCreate(false);
      setManualTitle('');
      setManualCards([{ question: '', answer: '' }]);
      setCreateSubject('');
      setCreateDescription('');
      setIsPublicDeck(false);
    } catch (error) {
      console.error('Error creating manual flashcards:', error);
      toast.error('Failed to create flashcards. Please try again.');
    }
  };

  const addCard = () => {
    setManualCards(prev => [...prev, { question: '', answer: '' }]);
  };

  // --- Public flashcard functions ---
  const searchPublicDecks = useCallback(async () => {
    setIsSearchingPublic(true);
    try {
      const decks = await dataService.searchPublicFlashcardDecks(publicSearchQuery, publicSubjectFilter);
      setPublicDecks(decks.map(deck => ({
        ...deck,
        createdAt: deck.createdAt ? new Date(deck.createdAt.seconds * 1000) : new Date()
      })));
    } catch (error) {
      console.error('Error searching public decks:', error);
    } finally {
      setIsSearchingPublic(false);
    }
  }, [publicSearchQuery, publicSubjectFilter]);

  // Load public decks when switching to public tab or changing filters
  useEffect(() => {
    if (activeTab === 'public') {
      searchPublicDecks();
    }
  }, [activeTab, searchPublicDecks]);

  const handleCopyPublicDeck = async (deck) => {
    if (!user) return;
    if (deck.userId === user.uid) return; // Can't copy your own deck
    setCopyingDeckId(deck.id);
    try {
      const newId = await dataService.copyPublicDeckToUser(user.uid, deck);
      // Add to local My Decks
      setUserCollections(prev => [{
        ...deck,
        id: newId,
        userId: user.uid,
        isPublic: false,
        progress: 0,
        lastStudied: 'Never',
        createdAt: new Date(),
        copiedFrom: deck.id
      }, ...prev]);
      toast.success('Deck copied to your flashcards!');
    } catch (error) {
      console.error('Error copying deck:', error);
      toast.error('Failed to copy deck. Please try again.');
    } finally {
      setCopyingDeckId(null);
    }
  };

  const handleToggleVisibility = async (deck) => {
    const newVisibility = !deck.isPublic;
    try {
      await dataService.toggleFlashcardVisibility(deck.id, newVisibility);
      setUserCollections(prev => prev.map(d =>
        d.id === deck.id ? { ...d, isPublic: newVisibility } : d
      ));
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast.error('Failed to update visibility.');
    }
  };

  const removeCard = (index) => {
    if (manualCards.length > 1) {
      setManualCards(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateCard = (index, field, value) => {
    setManualCards(prev => prev.map((card, i) => 
      i === index ? { ...card, [field]: value } : card
    ));
  };

  // Deck editing functions
  const startEditingDeck = (deck) => {
    setEditingDeck({
      ...deck,
      originalId: deck.id
    });
  };

  const saveEditedDeck = async () => {
    try {
      await dataService.updateFlashcardDeck(editingDeck.originalId, editingDeck);
      
      // Update local state
      setUserCollections(prev => prev.map(deck => 
        deck.id === editingDeck.originalId ? editingDeck : deck
      ));
      
      setEditingDeck(null);
    } catch (error) {
      console.error('Error updating deck:', error);
      toast.error('Failed to update deck. Please try again.');
    }
  };

  const cancelEditingDeck = () => {
    setEditingDeck(null);
  };

  // Card editing functions
  const startEditingCard = (deckId, cardIndex) => {
    const deck = userCollections.find(d => d.id === deckId);
    if (deck && deck.cards[cardIndex]) {
      setEditingCard({
        deckId,
        cardIndex,
        question: deck.cards[cardIndex].question,
        answer: deck.cards[cardIndex].answer
      });
    }
  };

  const saveEditedCard = async () => {
    try {
      const updatedDeck = userCollections.find(d => d.id === editingCard.deckId);
      const updatedCards = [...updatedDeck.cards];
      updatedCards[editingCard.cardIndex] = {
        question: editingCard.question,
        answer: editingCard.answer
      };

      await dataService.updateFlashcardDeck(editingCard.deckId, {
        ...updatedDeck,
        cards: updatedCards
      });

      // Update local state
      setUserCollections(prev => prev.map(deck => 
        deck.id === editingCard.deckId 
          ? { ...deck, cards: updatedCards }
          : deck
      ));
      
      setEditingCard(null);
    } catch (error) {
      console.error('Error updating card:', error);
      toast.error('Failed to update card. Please try again.');
    }
  };

  const cancelEditingCard = () => {
    setEditingCard(null);
  };

  const deleteDeck = async (deckId) => {
    if (!window.confirm('Are you sure you want to delete this deck? This action cannot be undone.')) {
      return;
    }

    try {
      await dataService.deleteFlashcardDeck(deckId);
      setUserCollections(prev => prev.filter(deck => deck.id !== deckId));
    } catch (error) {
      console.error('Error deleting deck:', error);
      toast.error('Failed to delete deck. Please try again.');
    }
  };

  const subjectOptions = Object.keys(AP_SUBJECTS).map(key => ({
    value: key,
    label: AP_SUBJECTS[key].name
  }));

  const filteredUserCollections = userCollections.filter(collection =>
    collection.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collection.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-base-950 text-content-primary">
      {studyingDeck ? (
        // Study Interface
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
          <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6 md:mb-8">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-content-primary truncate">{studyingDeck.title}</h1>
              <p className="text-xs sm:text-sm text-content-muted">
                Card {currentCardIndex + 1} of {studyingDeck.cards.length}
              </p>
            </div>
            <Button
              onClick={() => setStudyingDeck(null)}
              variant="outline"
              className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-4"
            >
              <X className="w-4 h-4 sm:mr-2" strokeWidth={1.5} />
              <span className="hidden sm:inline">Exit Study</span>
            </Button>
          </div>

          <div className="mb-6">
            <div className="w-full bg-base-800 rounded-full h-2">
              <div 
                className="bg-content-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${((currentCardIndex + 1) / studyingDeck.cards.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <Card className="p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 min-h-[200px] sm:min-h-[280px] md:min-h-[300px] flex flex-col justify-center">
            <div className="text-center">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-content-primary mb-4 sm:mb-6">
                {showAnswer ? 'Answer' : 'Question'}
              </h2>
              <div className="text-sm sm:text-base md:text-lg text-content-primary leading-relaxed">
                {showAnswer 
                  ? <MarkdownRenderer content={studyingDeck.cards[currentCardIndex]?.answer || 'No answer available'} />
                  : <MarkdownRenderer content={studyingDeck.cards[currentCardIndex]?.question || 'No question available'} />
                }
              </div>
              {!showAnswer && (
                <Button
                  onClick={() => setShowAnswer(true)}
                  className="mt-4 sm:mt-6 bg-content-primary text-base-950 hover:opacity-90 text-sm sm:text-base"
                >
                  Show Answer
                </Button>
              )}
            </div>
          </Card>

          {showAnswer && (
            <div className="flex flex-col gap-4">
              <div className="text-center text-content-secondary mb-4">
                How well did you know this?
              </div>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => handleCardAnswer(false)}
                  variant="outline"
                  className="border-error-500 text-error-400 hover:bg-error-500/20"
                >
                  Didn't Know
                </Button>
                <Button
                  onClick={() => handleCardAnswer(true)}
                  className="bg-content-primary text-base-950 hover:opacity-90"
                >
                  <CheckCircle className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Got It Right
                </Button>
              </div>
              <div className="flex gap-2 justify-center mt-4">
                <Button
                  onClick={handlePreviousCard}
                  disabled={currentCardIndex === 0}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <Button
                  onClick={handleNextCard}
                  variant="outline"
                  size="sm"
                >
                  {currentCardIndex === studyingDeck.cards.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Main Flashcards Interface
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h1 className="text-2xl font-display font-semibold text-content-primary mb-2">Flashcards</h1>
          <p className="text-sm sm:text-base text-content-secondary">
            Create and study flashcard decks.
          </p>
          <div className="mt-3 flex justify-center">
            <ModelSelector
              value={selectedModel}
              onChange={(m) => { setSelectedModel(m); saveSelectedModel(m); }}
            />
          </div>
        </div>

        {/* Tabs: My Decks / Public */}
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-center mb-6">
            <div className="flex bg-base-850 p-1 rounded-lg border border-border">
              <button
                onClick={() => setActiveTab('my')}
                className={`px-4 sm:px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'my'
                    ? 'bg-content-primary text-base-950 shadow-sm'
                    : 'text-content-muted hover:text-content-primary'
                }`}
              >
                <BookOpen className="w-4 h-4" strokeWidth={1.5} />
                My Decks
              </button>
              <button
                onClick={() => setActiveTab('public')}
                className={`px-4 sm:px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'public'
                    ? 'bg-content-primary text-base-950 shadow-sm'
                    : 'text-content-muted hover:text-content-primary'
                }`}
              >
                <Globe className="w-4 h-4" strokeWidth={1.5} />
                Public Decks
              </button>
            </div>
          </div>

          {/* Search Bar (context-aware) */}
          {activeTab === 'my' ? (
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-content-muted" strokeWidth={1.5} />
              <Input
                placeholder="Search your flashcard collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-center"
              />
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-content-muted" strokeWidth={1.5} />
                  <Input
                    placeholder="Search public flashcards by topic, title, or description..."
                    value={publicSearchQuery}
                    onChange={(e) => setPublicSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') searchPublicDecks(); }}
                    className="pl-10"
                  />
                </div>
                <div className="w-full sm:w-48">
                  <CustomDropdown
                    options={[{ value: '', label: 'All Subjects' }, ...subjectOptions]}
                    value={publicSubjectFilter}
                    onChange={setPublicSubjectFilter}
                    placeholder="Filter by subject"
                  />
                </div>
                <Button
                  onClick={searchPublicDecks}
                  disabled={isSearchingPublic}
                  className="bg-content-primary text-base-950 hover:opacity-90 whitespace-nowrap"
                >
                  {isSearchingPublic ? (
                    <div className="w-4 h-4 border-2 border-base-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" strokeWidth={1.5} />
                  )}
                  <span className="ml-2 hidden sm:inline">Search</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* My Flashcards Section */}
        {activeTab === 'my' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-content-primary">My Flashcards</h2>
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                onClick={() => setShowManualCreate(true)}
                className="flex-1 sm:flex-none bg-content-primary text-base-950 hover:opacity-90 text-sm"
              >
                <Plus className="w-4 h-4 mr-1 sm:mr-2" strokeWidth={1.5} />
                <span className="hidden sm:inline">Create Manual</span>
              </Button>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="flex-1 sm:flex-none bg-content-primary text-base-950 hover:opacity-90 text-sm"
              >
                <Plus className="w-4 h-4 mr-1 sm:mr-2" strokeWidth={1.5} />
                <span className="hidden sm:inline">Create with AI</span>
              </Button>
            </div>
          </div>

          {/* Create Form */}
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-content-primary mb-4">Create AI Flashcards</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-content-secondary mb-2">
                      Subject
                    </label>
                    <CustomDropdown
                      options={subjectOptions}
                      value={createSubject}
                      onChange={setCreateSubject}
                      placeholder="Select a subject..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-content-secondary mb-2">
                      Topic
                    </label>
                    <Input
                      placeholder="e.g., Cell Structure, Limits, French Revolution"
                      value={createTopic}
                      onChange={(e) => setCreateTopic(e.target.value)}
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-content-secondary mb-2">
                    Description (Optional)
                  </label>
                  <Input
                    placeholder="Additional details about what to include..."
                    value={createDescription}
                    onChange={(e) => setCreateDescription(e.target.value)}
                  />
                  <p className="text-xs text-content-muted mt-1">
                    💡 LaTeX math is supported! Use $x^2$ for inline math or $$x + y = z$$ for block math
                  </p>
                </div>
                {/* Visibility Toggle */}
                <div className="mb-4 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPublicDeck(!isPublicDeck)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                      isPublicDeck ? 'bg-content-primary' : 'bg-base-750'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      isPublicDeck ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                  <div className="flex items-center gap-1.5">
                    {isPublicDeck ? <Globe className="w-4 h-4 text-content-muted" strokeWidth={1.5} /> : <Lock className="w-4 h-4 text-content-muted" strokeWidth={1.5} />}
                    <span className="text-sm text-content-secondary">
                      {isPublicDeck ? 'Public — anyone can find and copy this deck' : 'Private — only you can see this deck'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleCreateCollection}
                    disabled={!createSubject || !createTopic || isGenerating}
                    className="bg-content-primary text-base-950 hover:opacity-90"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-content-muted border-t-transparent rounded-full animate-spin mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
                        Generate Flashcards
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Manual Create Form */}
          {showManualCreate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-content-primary mb-4">Create Manual Flashcards</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-content-secondary mb-2">
                      Deck Title
                    </label>
                    <Input
                      placeholder="e.g., Biology Chapter 5 Study Cards"
                      value={manualTitle}
                      onChange={(e) => setManualTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-content-secondary mb-2">
                      Subject (Optional)
                    </label>
                    <CustomDropdown
                      options={[{value: '', label: 'General'}, ...subjectOptions]}
                      value={createSubject}
                      onChange={setCreateSubject}
                      placeholder="Select a subject..."
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-content-secondary mb-2">
                    Description (Optional)
                  </label>
                  <Input
                    placeholder="Brief description of this deck..."
                    value={createDescription}
                    onChange={(e) => setCreateDescription(e.target.value)}
                  />
                </div>

                {/* Cards */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-medium text-content-secondary">Cards</h4>
                    <Button
                      onClick={addCard}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-1" strokeWidth={1.5} />
                      Add Card
                    </Button>
                  </div>
                  
                  {manualCards.map((card, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-base-800/30 rounded-lg border border-border-strong"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-content-secondary">Card {index + 1}</span>
                        {manualCards.length > 1 && (
                          <Button
                            onClick={() => removeCard(index)}
                            variant="ghost"
                            size="sm"
                            className="text-error-400 hover:text-error-300"
                          >
                            <X className="w-4 h-4" strokeWidth={1.5} />
                          </Button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-content-muted mb-1">
                            Question
                          </label>
                          <Input
                            placeholder="Enter your question..."
                            value={card.question}
                            onChange={(e) => updateCard(index, 'question', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-content-muted mb-1">
                            Answer
                          </label>
                          <textarea
                            placeholder="Enter the answer..."
                            value={card.answer}
                            onChange={(e) => updateCard(index, 'answer', e.target.value)}
                            className="w-full bg-base-800 border border-border-strong rounded-lg px-3 py-2 text-content-primary placeholder:text-content-muted focus:border-content-muted focus:outline-none transition-colors resize-none"
                            rows={3}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Visibility Toggle */}
                <div className="mb-4 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPublicDeck(!isPublicDeck)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                      isPublicDeck ? 'bg-content-primary' : 'bg-base-750'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      isPublicDeck ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                  <div className="flex items-center gap-1.5">
                    {isPublicDeck ? <Globe className="w-4 h-4 text-content-muted" strokeWidth={1.5} /> : <Lock className="w-4 h-4 text-content-muted" strokeWidth={1.5} />}
                    <span className="text-sm text-content-secondary">
                      {isPublicDeck ? 'Public — anyone can find and copy this deck' : 'Private — only you can see this deck'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleManualCreate}
                    disabled={!manualTitle || manualCards.some(card => !card.question || !card.answer)}
                    className="bg-content-primary text-base-950 hover:opacity-90"
                  >
                    <Save className="w-4 h-4 mr-2" strokeWidth={1.5} />
                    Create Deck
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowManualCreate(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* User Collections */}
          {user ? (
            filteredUserCollections.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUserCollections.map((collection) => (
                  <motion.div
                    key={collection.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    className="cursor-pointer"
                  >
                    <Card className="p-6 h-full hover:bg-base-850/50 transition-all duration-200 group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="text-lg font-bold text-content-primary group-hover:text-content-muted transition-colors truncate">
                              {collection.title}
                            </h3>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleToggleVisibility(collection); }}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                collection.isPublic
                                  ? 'bg-base-800 text-content-muted hover:bg-content-primary hover:text-base-950'
                                  : 'bg-base-800 text-content-muted hover:bg-base-750'
                              }`}
                              title={collection.isPublic ? 'Click to make private' : 'Click to make public'}
                            >
                              {collection.isPublic ? <Globe className="w-3 h-3" strokeWidth={1.5} /> : <Lock className="w-3 h-3" strokeWidth={1.5} />}
                              {collection.isPublic ? 'Public' : 'Private'}
                            </button>
                          </div>
                          <p className="text-sm text-content-muted mb-3">
                            {collection.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-content-muted mb-4">
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3" strokeWidth={1.5} />
                              <span>{collection.cardCount} cards</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" strokeWidth={1.5} />
                              <span>{collection.lastStudied}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleStudyCollection(collection)}
                          className="flex-1 bg-content-primary text-base-950 hover:opacity-90"
                        >
                          <Play className="w-4 h-4 mr-2" strokeWidth={1.5} />
                          Study
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditingDeck(collection)}
                          className="hover:bg-content-primary/20 hover:border-content-primary"
                        >
                          <Edit3 className="w-4 h-4" strokeWidth={1.5} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteDeck(collection.id)}
                          className="hover:bg-error-500/20 hover:border-error-500"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <BookOpen className="w-16 h-16 text-content-muted mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="text-xl font-bold text-content-secondary mb-2">No flashcards yet</h3>
                <p className="text-content-muted mb-6">Create your first AI-powered flashcard collection to get started.</p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-content-primary text-base-950 hover:opacity-90"
                >
                  <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Create Flashcards
                </Button>
              </Card>
            )
          ) : (
            <Card className="p-8 text-center">
              <BookOpen className="w-16 h-16 text-content-muted mx-auto mb-4" strokeWidth={1.5} />
              <h3 className="text-xl font-bold text-content-secondary mb-2">Sign up to create flashcards</h3>
              <p className="text-content-muted mb-6">Create a free account to build your own custom flashcard decks with AI assistance.</p>
              <Button
                onClick={() => navigate('/login')}
                className="bg-content-primary text-base-950 hover:opacity-90"
              >
                Create Account
              </Button>
            </Card>
          )}
        </motion.div>
        )}

        {/* Public Flashcards Section */}
        {activeTab === 'public' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-content-muted" strokeWidth={1.5} />
            <h2 className="text-xl sm:text-2xl font-bold text-content-primary">Public Flashcards</h2>
          </div>

          {isSearchingPublic ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-content-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : publicDecks.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicDecks.map((deck) => (
                <motion.div
                  key={deck.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="p-6 h-full hover:bg-base-850/50 transition-all duration-200 group">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-content-primary group-hover:text-content-muted transition-colors truncate">
                          {deck.title}
                        </h3>
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-base-800 text-content-muted whitespace-nowrap">
                          <Globe className="w-3 h-3" strokeWidth={1.5} />
                          Public
                        </span>
                      </div>
                      {deck.topic && (
                        <p className="text-xs text-content-muted mb-1">{AP_SUBJECTS[deck.subject]?.name || deck.subject}</p>
                      )}
                      <p className="text-sm text-content-muted mb-3 line-clamp-2">
                        {deck.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-content-muted flex-wrap">
                        {deck.creatorName && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPublicSearchQuery(deck.creatorName);
                            }}
                            className="flex items-center gap-1 hover:text-content-primary transition-colors"
                            title={`View all decks by ${deck.creatorName}`}
                          >
                            <User className="w-3 h-3" strokeWidth={1.5} />
                            <span>{deck.creatorName}</span>
                          </button>
                        )}
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" strokeWidth={1.5} />
                          <span>{deck.cardCount || deck.cards?.length || 0} cards</span>
                        </div>
                        {deck.createdAt && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" strokeWidth={1.5} />
                            <span>{deck.createdAt instanceof Date ? deck.createdAt.toLocaleDateString() : 'Recently'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {deck.userId !== user?.uid && (
                        <Button
                          size="sm"
                          onClick={() => handleCopyPublicDeck(deck)}
                          disabled={copyingDeckId === deck.id}
                          className="flex-1 bg-content-primary text-base-950 hover:opacity-90"
                        >
                          {copyingDeckId === deck.id ? (
                            <div className="w-4 h-4 border-2 border-base-950 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-2" strokeWidth={1.5} />
                              Copy to My Decks
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStudyCollection(deck)}
                        className="hover:bg-content-primary/20 hover:border-content-primary"
                      >
                        <Play className="w-4 h-4" strokeWidth={1.5} />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Globe className="w-16 h-16 text-content-muted mx-auto mb-4" strokeWidth={1.5} />
              <h3 className="text-xl font-bold text-content-secondary mb-2">No public decks found</h3>
              <p className="text-content-muted mb-4">
                {publicSearchQuery || publicSubjectFilter
                  ? 'Try a different search term or clear your filters.'
                  : 'Be the first to share a flashcard deck! Create a deck and toggle it to Public.'}
              </p>
              {(publicSearchQuery || publicSubjectFilter) && (
                <Button
                  variant="outline"
                  onClick={() => { setPublicSearchQuery(''); setPublicSubjectFilter(''); }}
                >
                  Clear Filters
                </Button>
              )}
            </Card>
          )}
        </motion.div>
        )}
      </div>
      )}

      {/* Deck Editing Modal */}
      {editingDeck && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-base-850 rounded-lg border border-border w-full max-w-2xl max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-content-primary">Edit Deck</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-content-secondary mb-2">Title</label>
                <Input
                  value={editingDeck.title}
                  onChange={(e) => setEditingDeck(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-content-secondary mb-2">Description</label>
                <Input
                  value={editingDeck.description}
                  onChange={(e) => setEditingDeck(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-content-secondary mb-2">Visibility</label>
                <button
                  type="button"
                  onClick={() => setEditingDeck(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    editingDeck.isPublic
                      ? 'border-content-muted bg-content-primary/10 text-content-muted'
                      : 'border-border bg-base-800/50 text-content-secondary'
                  }`}
                >
                  {editingDeck.isPublic ? (
                    <>
                      <Globe className="w-4 h-4" strokeWidth={1.5} />
                      <span className="text-sm font-medium">Public</span>
                      <span className="text-xs text-content-muted ml-1">— Anyone can find and copy this deck</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" strokeWidth={1.5} />
                      <span className="text-sm font-medium">Private</span>
                      <span className="text-xs text-content-muted ml-1">— Only you can see this deck</span>
                    </>
                  )}
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-content-secondary mb-2">Cards</label>
                <div className="space-y-3">
                  {editingDeck.cards.map((card, index) => (
                    <div key={index} className="p-4 bg-base-800/30 rounded-lg border border-border-strong">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-content-secondary">Card {index + 1}</span>
                        <Button
                          onClick={() => startEditingCard(editingDeck.originalId, index)}
                          variant="ghost"
                          size="sm"
                        >
                          <Edit3 className="w-4 h-4" strokeWidth={1.5} />
                        </Button>
                      </div>
                      <div className="text-sm text-content-muted">
                        <div className="mb-1"><strong>Q:</strong> {card.question}</div>
                        <div><strong>A:</strong> {card.answer}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3">
              <Button onClick={saveEditedDeck} className="bg-content-primary text-base-950 hover:opacity-90">
                <Save className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Save Changes
              </Button>
              <Button variant="outline" onClick={cancelEditingDeck}>
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Card Editing Modal */}
      {editingCard && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-base-850 rounded-lg border border-border w-full max-w-lg"
          >
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-content-primary">Edit Card</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-content-secondary mb-2">Question</label>
                <textarea
                  value={editingCard.question}
                  onChange={(e) => setEditingCard(prev => ({ ...prev, question: e.target.value }))}
                  className="w-full bg-base-800 border border-border-strong rounded-lg px-3 py-2 text-content-primary placeholder:text-content-muted focus:border-content-muted focus:outline-none transition-colors resize-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-content-secondary mb-2">Answer</label>
                <textarea
                  value={editingCard.answer}
                  onChange={(e) => setEditingCard(prev => ({ ...prev, answer: e.target.value }))}
                  className="w-full bg-base-800 border border-border-strong rounded-lg px-3 py-2 text-content-primary placeholder:text-content-muted focus:border-content-muted focus:outline-none transition-colors resize-none"
                  rows={4}
                />
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3">
              <Button onClick={saveEditedCard} className="bg-content-primary text-base-950 hover:opacity-90">
                <Save className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Save Card
              </Button>
              <Button variant="outline" onClick={cancelEditingCard}>
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default FlashcardsPage;
