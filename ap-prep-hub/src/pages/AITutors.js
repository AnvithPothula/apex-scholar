import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { 
  Send, 
  Bot, 
  User, 
  BookOpen,
  ChevronLeft,
  Sparkles,
  TrendingUp,
  Plus,
  Paperclip,
  MoreVertical,
  Edit3,
  Trash2,
  Check,
  X,
  FileText,
  Image,
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
  Brain,
  TrendingUp as Economics,
  BarChart3,
  Brush,
  Microscope,
  Zap,
  Earth,
  Scale,
  MapPin,
  Scroll,
  PenTool
} from 'lucide-react';
import { Card, CardContent, Button, Badge, Input } from '../components/ui/UIComponents';
import SubjectSelector from '../components/tutors/SubjectSelector.jsx';
import MarkdownRenderer from '../components/MarkdownRenderer.jsx';
import { subjects } from '../constants/subjects';
import { getCurriculumData } from '../constants/comprehensiveCurriculum';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import geminiService from '../services/geminiService';

const AITutors = () => {
  const { subject: urlSubject } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState(urlSubject || null);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [editingConversationId, setEditingConversationId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [showConversationMenu, setShowConversationMenu] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSwitchingSubjects, setIsSwitchingSubjects] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  // Removed diagnostics UI and state

  // Warm up AI service (Puter model probe) to reduce first-call latency
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await geminiService.prewarm({ multimodal: true });
      } catch (_) { /* ignore */ }
      if (cancelled) return;
    })();
    return () => { cancelled = true; };
  }, []);

  // Load messages for a specific conversation
  const loadConversationMessages = useCallback(async (conversationId) => {
    try {
      console.log('Loading messages for conversation:', conversationId);
      const messagesRef = collection(db, 'conversations', conversationId, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'asc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messagesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        }));
        
        console.log('Messages loaded for conversation', conversationId, ':', messagesList.length, 'messages');
        setMessages(messagesList);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, []);

  // Helper function to check if a conversation is empty (only has welcome message)
  const isConversationEmpty = useCallback(async (conversationId) => {
    try {
      const messagesRef = collection(db, 'conversations', conversationId, 'messages');
      const messagesSnapshot = await getDocs(messagesRef);
      
      // Count non-welcome messages (user messages and AI responses to user messages)
      const userMessages = messagesSnapshot.docs.filter(doc => {
        const data = doc.data();
        return data.type === 'user' || (data.type === 'ai' && !data.id?.includes('welcome'));
      });
      
      console.log(`Conversation ${conversationId} has ${userMessages.length} non-welcome messages`);
      
      // Extra safety: if conversation was just created (less than 5 seconds ago), don't consider it empty
      const conversationDoc = await getDocs(query(collection(db, 'conversations'), where('__name__', '==', conversationId)));
      if (conversationDoc.docs.length > 0) {
        const conversationData = conversationDoc.docs[0].data();
        const createdAt = conversationData.createdAt?.toDate();
        if (createdAt && (new Date() - createdAt) < 5000) {
          console.log(`Conversation ${conversationId} is too new to be considered empty`);
          return false;
        }
      }
      
      return userMessages.length === 0;
    } catch (error) {
      console.error('Error checking if conversation is empty:', error);
      return false; // If we can't check, assume it's not empty to be safe
    }
  }, []);

  // Helper function to clean up empty conversations when leaving
  const cleanupEmptyConversation = useCallback(async (conversationId, totalConversations) => {
    if (!conversationId || totalConversations <= 1) {
      console.log('Skipping cleanup: no conversation ID or only one conversation left');
      return;
    }

    try {
      const isEmpty = await isConversationEmpty(conversationId);
      
      if (isEmpty) {
        console.log('Cleaning up empty conversation:', conversationId);
        
        // Delete all messages in this conversation
        const messagesRef = collection(db, 'conversations', conversationId, 'messages');
        const messagesSnapshot = await getDocs(messagesRef);
        
        const deletePromises = messagesSnapshot.docs.map(messageDoc => 
          deleteDoc(messageDoc.ref)
        );
        await Promise.all(deletePromises);
        
        // Delete the conversation document
        await deleteDoc(doc(db, 'conversations', conversationId));
        
        console.log('Empty conversation deleted successfully:', conversationId);
      } else {
        console.log('Conversation is not empty, keeping it:', conversationId);
      }
    } catch (error) {
      console.error('Error cleaning up empty conversation:', error);
    }
  }, [isConversationEmpty]);

  // Helper function to create the first conversation for a subject
  const createFirstConversation = useCallback(async (subjectId) => {
    if (!user) return;
    
    const curriculumData = getCurriculumData(subjectId);
    const subjectName = curriculumData?.name || subjectId;
    const sessionNumber = 1;
    
    const newConversation = {
      name: `${subjectName} - Session ${sessionNumber}`,
      subject: subjectId,
      lastMessage: '',
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    try {
      // Save conversation to Firebase
      const docRef = await addDoc(collection(db, 'conversations'), newConversation);
      const conversationId = docRef.id;
      
      // Set this as the active conversation immediately
      setActiveConversationId(conversationId);
      
      // Create welcome message
      const welcomeMessage = {
        id: `${conversationId}_welcome`,
        type: 'ai',
        content: `Hello! I'm your specialized AI tutor for ${subjectName}. I'm here to help you master this AP subject with personalized explanations, practice problems, and study strategies tailored to the College Board curriculum. What would you like to learn about today?`,
        timestamp: new Date(),
        createdAt: serverTimestamp(),
        suggestions: getSubjectSuggestions(subjectId)
      };
      
      // Save welcome message to Firebase
      await addDoc(collection(db, 'conversations', conversationId, 'messages'), welcomeMessage);
      
      console.log('Created new conversation and set as active:', conversationId);
      return conversationId;
    } catch (error) {
      console.error('Error creating first conversation:', error);
      return null;
    }
  }, [user]);

  // Load conversations from Firebase
  const loadConversations = useCallback(async (userId, subject) => {
    try {
      const conversationsRef = collection(db, 'conversations');
      const q = query(
        conversationsRef,
        where('userId', '==', userId),
        where('subject', '==', subject),
        orderBy('updatedAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const conversationsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        }));
        
        console.log('Loaded conversations for subject:', subject, 'Count:', conversationsList.length);
        setConversations(conversationsList);
        
        // If conversations exist, open the most recent one
        if (conversationsList.length > 0) {
          console.log('Existing conversations found, opening the most recent one...');
          const mostRecentConversation = conversationsList[0];
          console.log('Opening most recent conversation:', mostRecentConversation.name);
          
          // Always open the most recent conversation when switching subjects
          setActiveConversationId(mostRecentConversation.id);
        } else {
          // No conversations exist, create a new one
          console.log('No conversations found, creating new one...');
          await createFirstConversation(subject);
        }
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }, [createFirstConversation]);

  const handleNewConversation = async () => {
    console.log('New conversation clicked, selectedSubject:', selectedSubject);
    
    if (!selectedSubject) {
      console.error('No subject selected');
      return;
    }
    
    // Clean up current conversation if it's empty before creating a new one
    if (activeConversationId && conversations.length > 1) {
      console.log('Cleaning up current conversation before creating new one...');
      await cleanupEmptyConversation(activeConversationId, conversations.length);
    }
    
    const curriculumData = getCurriculumData(selectedSubject);
    const subjectName = curriculumData?.name || selectedSubject;
    const sessionNumber = conversations.length + 1;
    
    const newConversation = {
      name: `${subjectName} - Session ${sessionNumber}`,
      subject: selectedSubject,
      lastMessage: ''
    };
    
    // Save to Firebase (user is guaranteed to exist due to auth protection)
    const conversationId = await saveConversation(newConversation);
    if (!conversationId) {
      console.error('Failed to save conversation');
      return;
    }
    
    setActiveConversationId(conversationId);
    
    const welcomeMessage = {
      id: `${conversationId}_welcome`,
      type: 'ai',
      content: `Hello! I'm your specialized AI tutor for ${subjectName}. I'm here to help you master this AP subject with personalized explanations, practice problems, and study strategies tailored to the College Board curriculum. What would you like to learn about today?`,
      timestamp: new Date(),
      suggestions: getSubjectSuggestions(selectedSubject)
    };
    
    // Save welcome message to Firebase
    await saveMessage(conversationId, welcomeMessage);
  };

  // Initialize conversations when user or subject changes
  useEffect(() => {
    if (user && selectedSubject) {
      loadConversations(user.uid, selectedSubject);
    }
  }, [user, selectedSubject, loadConversations]);

  // Load messages when active conversation changes
  useEffect(() => {
    let unsubscribe = null;
    
    if (activeConversationId) {
      console.log('Loading messages for conversation:', activeConversationId);
      loadConversationMessages(activeConversationId).then(unsub => {
        unsubscribe = unsub;
      });
    } else {
      // Clear messages when no conversation is active
      setMessages([]);
    }
    
    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [activeConversationId, loadConversationMessages]);

  // Debug effect to track state changes
  useEffect(() => {
    console.log('Current state:', {
      selectedSubject,
      messageCount: messages.length,
      currentMessage,
      isTyping
    });
  }, [selectedSubject, messages, currentMessage, isTyping]);

  // Auto scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close conversation menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only handle if menu is open
      if (!showConversationMenu) return;
      
      // Check if click is outside the menu
      const menuElement = document.querySelector('[data-conversation-menu]');
      if (menuElement && !menuElement.contains(event.target)) {
        setShowConversationMenu(null);
      }
    };

    // Only add listener when menu is open
    if (showConversationMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showConversationMenu]);

  // Cleanup empty conversation when component unmounts or user navigates away
  useEffect(() => {
    const currentActiveConversationId = activeConversationId;
    const currentConversationsLength = conversations.length;
    
    const handleBeforeUnload = async () => {
      // Don't cleanup if we're in the middle of switching subjects
      if (isSwitchingSubjects) return;
      
      // Cleanup function that runs when user is about to leave the page
      if (currentActiveConversationId && currentConversationsLength > 1) {
        console.log('Page unload detected, cleaning up empty conversation if needed...');
        // Use a fire-and-forget approach for page unload to avoid blocking
        cleanupEmptyConversation(currentActiveConversationId, currentConversationsLength).catch(console.error);
      }
    };

    // Add event listener for page unload
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // Don't cleanup if we're in the middle of switching subjects
      if (isSwitchingSubjects) {
        console.log('Skipping cleanup during subject switch');
        window.removeEventListener('beforeunload', handleBeforeUnload);
        return;
      }
      
      // Cleanup function that runs when component unmounts
      if (currentActiveConversationId && currentConversationsLength > 1) {
        console.log('Component unmounting, cleaning up empty conversation if needed...');
        cleanupEmptyConversation(currentActiveConversationId, currentConversationsLength).catch(console.error);
      }
      
      // Remove event listener
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [activeConversationId, conversations.length, cleanupEmptyConversation, isSwitchingSubjects]);

  // Enhanced file upload handler with Gemini analysis support
  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf,.doc,.docx,.txt,.csv,.json';
    input.multiple = true; // Allow multiple files
    input.onchange = async (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        await processUploadedFiles(files);
      }
    };
    input.click();
  };

  // Process uploaded files and convert to base64 for Gemini API
  const processUploadedFiles = async (files) => {
    const processedFiles = [];
    const errors = [];
    
    for (const file of files) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name} is too large (max 10MB)`);
        continue;
      }
      
      try {
        const processedFile = await processFile(file);
        processedFiles.push(processedFile);
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        errors.push(`Failed to process ${file.name}: ${error.message}`);
      }
    }
    
    if (errors.length > 0) {
      alert(`Some files could not be processed:\n${errors.join('\n')}`);
    }
    
    if (processedFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...processedFiles]);
      console.log('Files uploaded successfully:', processedFiles.map(f => f.name));
    }
  };

  // Process individual file based on type
  const processFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      // Set timeout to prevent hanging
      const timeout = setTimeout(() => {
        reader.abort();
        reject(new Error('File reading timeout'));
      }, 30000); // 30 seconds timeout
      
      reader.onload = (e) => {
        clearTimeout(timeout);
        
        try {
          const result = e.target.result;
          
          // Create file object with metadata
          const processedFile = {
            name: file.name,
            type: file.type,
            size: file.size,
            uploadedAt: new Date(),
            id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          };

          // Handle different file types
          if (file.type.startsWith('image/')) {
            // For images, store as base64 for Gemini Vision
            processedFile.data = result.split(',')[1]; // Remove data:image/xxx;base64, prefix
            processedFile.mimeType = file.type;
            processedFile.category = 'image';
          } else if (file.type === 'application/pdf') {
            processedFile.data = result.split(',')[1];
            processedFile.mimeType = file.type;
            processedFile.category = 'document';
          } else if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
            // For text files, store as text content
            processedFile.content = result;
            processedFile.category = 'text';
          } else {
            // For other files, store as base64 and attempt text extraction
            processedFile.data = result.split(',')[1];
            processedFile.mimeType = file.type;
            processedFile.category = 'document';
          }

          resolve(processedFile);
        } catch (error) {
          reject(new Error(`Failed to process file content: ${error.message}`));
        }
      };

      reader.onerror = () => {
        clearTimeout(timeout);
        reject(new Error(`Failed to read file: ${file.name}`));
      };

      reader.onabort = () => {
        clearTimeout(timeout);
        reject(new Error(`File reading was aborted: ${file.name}`));
      };

      // Read file based on type
      try {
        if (file.type.startsWith('image/') || file.type === 'application/pdf' || 
            (!file.type.includes('text') && !file.name.endsWith('.txt'))) {
          reader.readAsDataURL(file);
        } else {
          reader.readAsText(file);
        }
      } catch (error) {
        clearTimeout(timeout);
        reject(new Error(`Failed to start reading file: ${error.message}`));
      }
    });
  };

  // Remove uploaded file
  const handleFileRemove = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleSubjectSelect = useCallback(async (subjectId) => {
    console.log('Subject selected:', subjectId);
    
    // Set flag to prevent cleanup during subject switching
    setIsSwitchingSubjects(true);
    
    try {
      // Store current state before clearing
      const currentActiveConversationId = activeConversationId;
      const currentConversationsLength = conversations.length;
      
      // Clean up the current conversation if it's empty before switching subjects
      // Only if we actually have conversations and an active one
      if (currentActiveConversationId && currentConversationsLength > 1) {
        console.log('Checking if current conversation is empty before switching subjects...');
        await cleanupEmptyConversation(currentActiveConversationId, currentConversationsLength);
      }
      
      // Reset state when switching subjects
      setActiveConversationId(null);
      setMessages([]);
      setConversations([]);
      setCurrentMessage('');
      setUploadedFiles([]);
      
      setSelectedSubject(subjectId);
      
      // Load conversations from Firebase (user is guaranteed to exist due to auth protection)
      if (user) {
        const unsubscribe = await loadConversations(user.uid, subjectId);
        return unsubscribe;
      }
    } finally {
      // Clear the flag after subject switching is complete
      const timer = setTimeout(() => setIsSwitchingSubjects(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [user, loadConversations, activeConversationId, conversations.length, cleanupEmptyConversation]);

  // Handle URL subject parameter
  useEffect(() => {
    if (urlSubject && urlSubject !== selectedSubject) {
      console.log('URL subject detected:', urlSubject);
      handleSubjectSelect(urlSubject);
    }
  }, [urlSubject, selectedSubject, handleSubjectSelect]);

  // Redirect to login if not authenticated
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-slate-300">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Save conversation to Firebase
  const saveConversation = async (conversation) => {
    if (!user) return null;
    
    try {
      const conversationData = {
        ...conversation,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'conversations'), conversationData);
      return docRef.id;
    } catch (error) {
      console.error('Error saving conversation:', error);
      return null;
    }
  };

  // Save message to Firebase
  const saveMessage = async (conversationId, message) => {
    console.log('saveMessage called with:', { conversationId, messageType: message.type, content: message.content.substring(0, 50) });
    if (!user || !conversationId) {
      console.error('saveMessage failed: missing user or conversationId', { user: !!user, conversationId });
      return null;
    }
    
    try {
      // Sanitize files for Firestore (no base64 data/content, no functions/undefined)
      let sanitizedFiles = undefined;
      if (Array.isArray(message.files) && message.files.length > 0) {
        sanitizedFiles = message.files.map((f) => {
          const fileMeta = {
            id: f.id,
            name: f.name,
            size: typeof f.size === 'number' ? f.size : undefined,
            mimeType: f.mimeType || f.type || undefined,
            category: f.category || undefined,
            uploadedAt: f.uploadedAt instanceof Date ? f.uploadedAt.toISOString() : (typeof f.uploadedAt === 'string' ? f.uploadedAt : undefined)
          };
          // Remove undefined keys
          Object.keys(fileMeta).forEach((k) => fileMeta[k] === undefined && delete fileMeta[k]);
          return fileMeta;
        });
      }

      const messageData = {
        id: message.id,
        type: message.type,
        content: message.content,
        timestamp: message.timestamp || new Date(),
        createdAt: serverTimestamp()
      };
      if (sanitizedFiles && sanitizedFiles.length > 0) {
        messageData.files = sanitizedFiles;
      }
      
      console.log('Saving message to Firebase...', { conversationId, messageId: messageData.id });
      const docRef = await addDoc(collection(db, 'conversations', conversationId, 'messages'), messageData);
      console.log('Message saved successfully with ID:', docRef.id);
      
      // Update conversation's last message and updated time
      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: message.content.slice(0, 50) + (message.content.length > 50 ? '...' : ''),
        updatedAt: serverTimestamp()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error saving message:', error);
      return null;
    }
  };

  // Enhanced conversation management functions
  const handleRenameConversation = async (conversationId, newName) => {
    if (!user || !conversationId || !newName.trim()) return;
    
    try {
      await updateDoc(doc(db, 'conversations', conversationId), {
        name: newName.trim(),
        updatedAt: serverTimestamp()
      });
      
      setEditingConversationId(null);
      setEditingName('');
      console.log('Conversation renamed successfully');
    } catch (error) {
      console.error('Error renaming conversation:', error);
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    if (!user || !conversationId) return;
    
    // Prevent deleting the last conversation
    if (conversations.length <= 1) {
      console.log('Cannot delete the last conversation');
      alert('You must have at least one conversation. This is the last conversation for this subject.');
      setShowConversationMenu(null);
      return;
    }
    
    try {
      // Delete all messages in this conversation
      const messagesRef = collection(db, 'conversations', conversationId, 'messages');
      const messagesSnapshot = await getDocs(messagesRef);
      
      const deletePromises = messagesSnapshot.docs.map(messageDoc => 
        deleteDoc(messageDoc.ref)
      );
      await Promise.all(deletePromises);
      
      // Delete the conversation document
      await deleteDoc(doc(db, 'conversations', conversationId));
      
      // If we deleted the active conversation, switch to another one or clear
      if (activeConversationId === conversationId) {
        const remainingConversations = conversations.filter(c => c.id !== conversationId);
        if (remainingConversations.length > 0) {
          setActiveConversationId(remainingConversations[0].id);
          loadConversationMessages(remainingConversations[0].id);
        } else {
          setActiveConversationId(null);
          setMessages([]);
        }
      }
      
      setShowConversationMenu(null);
      console.log('Conversation deleted successfully');
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const startEditingConversation = (conversationId, currentName) => {
    setEditingConversationId(conversationId);
    setEditingName(currentName);
    setShowConversationMenu(null);
  };

  const cancelEditingConversation = () => {
    setEditingConversationId(null);
    setEditingName('');
  };

  const confirmDeleteConversation = (conversationId) => {
    // Check if this is the last conversation
    if (conversations.length <= 1) {
      alert('You must have at least one conversation. This is the last conversation for this subject.');
      setShowConversationMenu(null);
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      handleDeleteConversation(conversationId);
    }
    setShowConversationMenu(null);
  };

  const getSubjectSuggestions = (subjectId) => {
    console.log('Getting suggestions for subject:', subjectId);
    
    // Get curriculum-based suggestions for more accurate tutoring
    const curriculumData = getCurriculumData(subjectId);
    console.log('Curriculum data:', curriculumData);
    
    if (curriculumData && curriculumData.units) {
      // Generate suggestions based on actual curriculum units
      const unitBasedSuggestions = curriculumData.units.slice(0, 3).map(unit => 
        `Explain ${unit.name.toLowerCase()}`
      );
      
      const topicSuggestions = curriculumData.units.slice(0, 2).flatMap(unit => 
        unit.topics.slice(0, 1).map(topic => `Help me understand ${topic.toLowerCase()}`)
      );
      
      return [
        ...unitBasedSuggestions,
        ...topicSuggestions,
        `Prepare for the ${curriculumData.name} exam`,
        'Create a study schedule'
      ].slice(0, 6);
    }
    
    // Fallback suggestions by subject
    const suggestions = {
      'biology': [
        'Explain cellular respiration',
        'How does DNA replication work?', 
        'What are the mechanisms of evolution?',
        'Help me understand photosynthesis',
        'Explain enzyme function and kinetics',
        'What is gene expression regulation?'
      ],
      'chemistry': [
        'Explain chemical bonding types',
        'How do I balance equations?',
        'What is thermodynamics in chemistry?',
        'Help with stoichiometry calculations',
        'Explain acids and bases',
        'What are reaction mechanisms?'
      ],
      'physics1': [
        'Explain Newton\'s laws clearly',
        'How do I solve kinematics problems?',
        'What is conservation of energy?',
        'Help with circular motion',
        'Explain momentum and collisions',
        'What are simple harmonic motion basics?'
      ],
      'calculusAB': [
        'Explain derivatives step-by-step',
        'How do I find limits?',
        'What is integration?',
        'Help with optimization problems',
        'Explain the Fundamental Theorem of Calculus',
        'What are related rates problems?'
      ],
      'usHistory': [
        'Explain the causes of the Civil War',
        'What was the significance of the New Deal?',
        'Help me understand the Progressive Era',
        'Explain Cold War foreign policy',
        'What were the effects of westward expansion?',
        'How did industrialization change America?'
      ]
    };
    
    // Try to match by subject ID or return generic suggestions
    const subjectKey = Object.keys(suggestions).find(key => 
      subjectId.toLowerCase().includes(key.toLowerCase()) || 
      key.toLowerCase().includes(subjectId.toLowerCase())
    );
    
    return suggestions[subjectKey] || suggestions[subjectId] || [
      'Explain key concepts',
      'Help with practice problems',
      'Create a study plan',
      'Prepare for the AP exam',
      'Review difficult topics',
      'Practice essay writing'
    ];
  };

  const generateAIResponse = async (userMessage, uploadedFiles = []) => {
    console.log('generateAIResponse called with:', userMessage, 'and files:', uploadedFiles);
    setIsTyping(true);
    
    try {
      const curriculumData = getCurriculumData(selectedSubject);
      const subjectName = curriculumData?.name || selectedSubject;
      
      console.log('Generating real AI response for subject:', subjectName);
      
      // Always use the real AI for intelligent, contextual responses
      const response = await generateKnowledgeableResponse(selectedSubject, userMessage, curriculumData, uploadedFiles);
      
      if (!response || response.trim().length === 0) {
        throw new Error('Empty response from AI');
      }
      
      const aiMessage = {
        id: `ai_${Date.now()}`,
        type: 'ai',
        content: response,
        timestamp: new Date()
      };
      
      console.log('Adding AI response:', aiMessage);
      
      // Save AI message to Firebase (user is guaranteed to exist due to auth protection)
      await saveMessage(activeConversationId, aiMessage);
      
    } catch (error) {
      console.error('Error generating AI response:', error);
      // Add error message
      const errorMessage = {
        id: `error_${Date.now()}`,
        type: 'ai',
        content: "I apologize, but I encountered an issue generating a response. Please try asking your question again, and I'll do my best to help you learn!",
        timestamp: new Date(),
        responseType: 'error'
      };
      
      try {
        await saveMessage(activeConversationId, errorMessage);
      } catch (saveError) {
        console.error('Failed to save error message:', saveError);
        // If we can't even save the error message, show an alert
        alert('I encountered an error and couldn\'t respond properly. Please try again.');
      }
    } finally {
      setIsTyping(false);
    }
  };

  // Remove all hardcoded response generators - we now use real AI

  // Input sanitization to prevent prompt injection
  const sanitizeUserInput = (input) => {
    if (!input || typeof input !== 'string') return '';
    
    // Remove or escape common prompt injection patterns
    return input
      .replace(/\[ignore.*?instructions?\]/gi, '[content filtered]')
      .replace(/\[system.*?prompt\]/gi, '[content filtered]')
      .replace(/ignore\s+all\s+previous\s+instructions?/gi, '[content filtered]')
      .replace(/forget\s+everything\s+above/gi, '[content filtered]')
      .replace(/act\s+as\s+if\s+you\s+are/gi, '[content filtered]')
      .replace(/you\s+are\s+now/gi, '[content filtered]')
      .replace(/pretend\s+to\s+be/gi, '[content filtered]')
      .replace(/roleplay\s+as/gi, '[content filtered]')
      .replace(/simulate\s+being/gi, '[content filtered]')
      .trim();
  };

  // Enhanced AI-powered response generator with markdown, LaTeX, and curriculum focus
  const generateKnowledgeableResponse = async (subject, userMessage, curriculumData, uploadedFiles = []) => {
    const { default: geminiService } = await import('../services/geminiService');
    const subjectName = curriculumData?.name || subject;
    
    // Build conversation history for context (last 6 messages for optimal performance)
    const hasFiles = Array.isArray(uploadedFiles) && uploadedFiles.length > 0;
    const conversationHistory = messages.slice(-6).map(msg => {
      const sanitizedContent = msg.type === 'user' ? sanitizeUserInput(msg.content) : msg.content;
      const parts = [{ text: sanitizedContent }];
      
      // Add file content to conversation history if present
      if (msg.files) {
        msg.files.forEach(file => {
          if (file.category === 'image' && file.data) {
            parts.push({
              inline_data: {
                mime_type: file.mimeType || file.type || 'image/png',
                data: file.data
              }
            });
            parts.push({ text: `[Image: ${file.name}]` });
          } else if (file.category === 'text' && file.content) {
            parts.push({ text: `[File: ${file.name}]\n${file.content}` });
          } else if (file.category === 'document') {
            parts.push({ text: `[Document: ${file.name} - Please analyze in context of AP ${subjectName}]` });
          }
        });
      }
      
      return {
        role: msg.type === 'user' ? 'user' : 'model',
        parts: parts
      };
    });

    // Get comprehensive curriculum information for deep subject knowledge
    const curriculumContext = curriculumData ? `
COMPREHENSIVE CURRICULUM MASTERY:
Course: ${curriculumData.name}
Description: ${curriculumData.description || 'Rigorous AP-level academic preparation'}

COMPLETE UNIT BREAKDOWN:
${curriculumData.units?.map((unit, i) => `
Unit ${i + 1}: ${unit.name}
  - Weight: ${unit.weight || 'Significant portion'}
  - Key Topics: ${unit.topics?.join(', ') || 'Core concepts'}
  - Essential Knowledge: ${unit.essentialKnowledge?.join('; ') || 'Fundamental principles'}
  - Skills: ${unit.skills?.join(', ') || 'Critical analysis and application'}
`).join('') || 'Multiple comprehensive units covering all AP standards'}

EXAM STRUCTURE:
${curriculumData.examFormat ? `
- Duration: ${curriculumData.examFormat.duration}
- Sections: ${curriculumData.examFormat.sections?.map(s => 
  `${s.name} (${s.questions} questions, ${s.time}, ${s.weight})`
).join('; ') || 'Multiple choice and free response sections'}
` : 'Comprehensive AP examination with multiple choice and free response components'}

STUDY STRATEGIES:
${curriculumData.studyTips?.join('\n- ') || 'Active learning, practice problems, conceptual understanding'}
` : 'AP-level curriculum with comprehensive academic standards';

    // Subject suggestion for boundary messaging
    const suggestSubject = (current, text) => {
      const t = (text || '').toLowerCase();
      const mapping = [
        { name: 'Biology', kws: ['cell', 'photosynthesis', 'mitosis', 'dna', 'genetics', 'evolution', 'ecology'] },
        { name: 'Chemistry', kws: ['mole', 'stoichiometry', 'acid', 'base', 'equilibrium', 'bond', 'organic', 'enthalpy', 'redox'] },
        { name: 'Physics', kws: ['force', 'velocity', 'acceleration', 'electric', 'magnetic', 'momentum', 'energy', 'wave', 'optics', 'quantum'] },
        { name: 'Calculus', kws: ['derivative', 'integral', 'limit', 'series', 'differential', 'optimization'] },
        { name: 'Statistics', kws: ['probability', 'regression', 'confidence', 'p-value', 'hypothesis', 'normal distribution', 'anova'] },
        { name: 'Computer Science', kws: ['algorithm', 'data structure', 'runtime', 'recursion', 'binary', 'sorting', 'coding', 'program', 'compile'] },
        { name: 'English Language', kws: ['rhetoric', 'argument', 'syntax', 'diction', 'tone', 'appeal'] },
        { name: 'English Literature', kws: ['poem', 'novel', 'metaphor', 'iambic', 'alliteration', 'sonnet'] },
        { name: 'World History', kws: ['empire', 'revolution', 'industrial', 'imperialism', 'silk road'] },
        { name: 'US History', kws: ['constitution', 'civil war', 'new deal', 'reconstruction', 'federalist'] },
        { name: 'Government & Politics', kws: ['congress', 'executive', 'judicial', 'federalism', 'policy'] },
        { name: 'Macroeconomics', kws: ['gdp', 'inflation', 'unemployment', 'fiscal', 'monetary', 'aggregate'] },
        { name: 'Microeconomics', kws: ['supply', 'demand', 'elasticity', 'utility', 'market', 'oligopoly'] },
        { name: 'Environmental Science', kws: ['ecosystem', 'biodiversity', 'sustainability', 'pollution', 'climate'] },
        { name: 'Psychology', kws: ['cognition', 'behavior', 'conditioning', 'memory', 'perception', 'personality'] },
        { name: 'Art History', kws: ['renaissance', 'baroque', 'impressionism', 'sculpture', 'architecture'] },
        { name: 'Music Theory', kws: ['chord', 'scale', 'harmony', 'interval', 'cadence', 'notation'] }
      ];
      const currentL = (current || '').toLowerCase();
      for (const m of mapping) {
        if (m.kws.some(k => t.includes(k))) {
          if (!m.name.toLowerCase().includes(currentL)) return m.name;
        }
      }
      return null;
    };
    const recommendedSubject = suggestSubject(subjectName, userMessage);
    const boundaryLine = recommendedSubject
      ? `I don't know about that topic, but the ${recommendedSubject} tutor might be able to help you with that question.`
      : `I don't know about that topic, but another subject tutor might be able to help you with that question.`;

  // Enhanced system prompt with strict anti-hallucination guidance
  const systemPrompt = `You are an expert AP ${subjectName} tutor with deep mastery of the official College Board curriculum and advanced multimodal analysis capabilities. You ONLY answer questions related to ${subjectName}.

${curriculumContext}

MULTIMODAL ANALYSIS CAPABILITIES:
When analyzing uploaded files:
- **Images**: Identify diagrams, charts, graphs, equations, lab setups, or problem screenshots and explain them in the context of AP ${subjectName}
- **Documents**: Extract key concepts and relate them directly to course content and exam preparation
- **Text Files**: Analyze notes, practice problems, or study materials and provide targeted feedback
- **Connection to Curriculum**: Always connect file content to specific units and learning objectives

ATTACHMENT CONTEXT: ${hasFiles ? 'Files are attached for the current user request.' : 'No files are attached for the current user request.'}

ATTACHMENT POLICY:
- Do NOT mention or describe any files, images, or PDFs unless they are explicitly attached in THIS conversation.
- If no files are attached, answer based on the user's text only. Do NOT ask the user to upload files unless they specifically request file-based analysis.
- If files are attached, you MUST analyze them first and describe what they show before anything else. Never claim you cannot view attachments when they exist.

CRITICAL FORMATTING REQUIREMENTS:
1. **Use Markdown**: Bold with **text**, italics with *text*, headers with ## Header
2. **LaTeX Math**: Use LaTeX for ALL mathematical expressions: $inline$ or $$display$$
  - Examples: $x^2 + y^2 = r^2$, $$\\frac{d}{dx}[f(x)] = f'(x)$$, $\\Delta H = H_{products} - H_{reactants}$
3. **Concise Responses**: Keep responses under 400 words unless specifically asked for more detail
4. **Subject Boundaries**:
  - Use the boundary line ONLY if the user's request is clearly about a different AP subject (not a general skill or an attachment/file-analysis request).
  - If asked about topics outside ${subjectName}, respond exactly as: "${boundaryLine}"
  - If the question overlaps multiple AP subjects but includes AP ${subjectName} content, answer ONLY the AP ${subjectName}-relevant parts and ignore the rest.

RESPONSE STRUCTURE:
- **Direct Analysis**: Address the question/file content immediately
- **Key Concepts**: 2-3 essential points with proper formatting
- **Practical Application**: How this applies to AP ${subjectName}
- **Brief Follow-up**: One engaging question to continue learning

SUBJECT EXPERTISE FOR ${subjectName}:
- You have complete mastery of all ${curriculumData?.units?.length || 'course'} units
- You understand the specific AP ${subjectName} exam format and expectations
- You can explain concepts at the appropriate academic level
- You connect topics to the broader curriculum framework
- You provide exam-relevant examples and applications

MARKDOWN EXAMPLES:
- Use **bold** for emphasis, *italics* for terms
- Use ## for section headers, ### for subsections
- Use $LaTeX$ for any mathematical content
- Use > for important quotes or key principles
- Use - for bullet points, 1. for numbered lists

STYLE AND SAFETY:
- Answer immediately. Avoid preambles like "Understood" or "I'm ready".
- Stay strictly within ${subjectName} content.
- If the question is ambiguous, ask one brief clarifying question after giving a concise best-effort answer.
- Keep responses focused and well-formatted.

Note: Your response must adhere to these guidelines without exception. Also, your entire purpose is for the user to get a 5 on the AP ${subjectName} test!`;

    try {
  // API request with resilient Gemini service (handles retries, rotation, and discovery)
      
      // Prepare content for Gemini API including files
  const messageParts = [];
          
          // Add text if present (with sanitization)
          if (userMessage.trim()) {
            const sanitizedMessage = sanitizeUserInput(userMessage);
            messageParts.push({ text: sanitizedMessage });
          }

          // Add uploaded files to the current message
          if (uploadedFiles.length > 0) {
            for (const file of uploadedFiles) {
              if (file.category === 'image' && file.data) {
                messageParts.push({
                  inline_data: {
                    mime_type: file.mimeType || file.type || 'image/png',
                    data: file.data
                  }
                });
            messageParts.push({ text: `[Analyze this image in the context of AP ${subjectName}: ${file.name}]` });
          } else if (file.category === 'text' && file.content) {
            messageParts.push({ text: `[Analyze this text file content for AP ${subjectName}]\nFile: ${file.name}\nContent:\n${file.content}` });
          } else if (file.category === 'document' && file.data) {
            messageParts.push({ text: `[Document uploaded: ${file.name}. Please provide guidance on how to analyze this document type in the context of AP ${subjectName} curriculum.]` });
          }
        }
      }
      
      const payload = {
        contents: [
          {
            role: "user",
            parts: [{ text: systemPrompt }]
          },
          ...conversationHistory,
          {
            role: "user", 
            parts: messageParts.length > 0 ? messageParts : [{ text: userMessage }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.9,
          maxOutputTokens: 1600, // Increased to reduce truncation of longer responses
          candidateCount: 1
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };
      console.log("Calling enhanced Gemini API with curriculum focus and file analysis...");
      const text = await geminiService.generateFromPayload(payload);
      return text;
      
    } catch (error) {
      console.error('Error calling enhanced Gemini API:', error);
      
      
      // Enhanced contextual fallback with proper formatting
      return `I apologize, but I'm experiencing connectivity issues right now.

**However, regarding your question about ${subjectName}:**

${curriculumData ? `
## Quick Reference
This topic likely relates to **${curriculumData.units?.find(unit => 
  unit.topics?.some(topic => 
    topic.toLowerCase().includes(userMessage.toLowerCase().split(' ')[0]) ||
    userMessage.toLowerCase().includes(topic.toLowerCase().split(' ')[0])
  )
)?.name || 'one of our key course units'}**.

## Study Suggestions
- Review the relevant unit in your course materials
- Practice with AP-style questions on this topic  
- Connect this concept to broader ${subjectName} themes
- Check the College Board course description

*I'll be back online shortly to provide more detailed guidance!*
` : `
Please check your internet connection and try again. In the meantime:
- Review your course materials for related concepts
- Practice problems are always helpful for ${subjectName}
- Consider reaching out to your teacher for additional support
`}`;
    }
  };

  const handleConversationSelect = async (conversationId) => {
    console.log('Switching to conversation:', conversationId);
    
    // Don't cleanup if we're switching subjects
    if (isSwitchingSubjects) {
      console.log('Skipping cleanup during subject switch');
      setActiveConversationId(conversationId);
      return;
    }
    
    // Clean up the current conversation if it's empty before switching
    if (activeConversationId && activeConversationId !== conversationId && conversations.length > 1) {
      console.log('Checking if current conversation is empty before switching...');
      await cleanupEmptyConversation(activeConversationId, conversations.length);
    }
    
    setActiveConversationId(conversationId);
    
    // Messages will be loaded automatically by useEffect when activeConversationId changes
  };

  const handleSendMessage = async () => {
    console.log('Send message clicked, current message:', currentMessage);
    if ((!currentMessage.trim() && uploadedFiles.length === 0) || isTyping || !activeConversationId) {
      console.log('Message empty, already typing, or no active conversation, returning');
      return;
    }
    
    const messageContent = currentMessage.trim();
    const filesToSend = [...uploadedFiles]; // Copy files before clearing
    console.log('Processing message:', messageContent);
    console.log('Uploaded files:', filesToSend);
    console.log('Active conversation ID:', activeConversationId);
    
    const userMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: messageContent || '[Files attached]',
      timestamp: new Date()
    };
    
    // Only add files property if there are files to send
    if (filesToSend.length > 0) {
      userMessage.files = filesToSend;
    }
    
    // Clear input and files immediately for better UX
    setCurrentMessage('');
    setUploadedFiles([]);
    
    try {
      // Save user message to Firebase first
      const savedMessageId = await saveMessage(activeConversationId, userMessage);
      
      if (savedMessageId) {
        // Generate AI response with file data
        console.log('Generating AI response for:', messageContent, 'with files:', filesToSend);
        await generateAIResponse(messageContent, filesToSend);
      } else {
        // Restore input if save failed
        setCurrentMessage(messageContent);
        setUploadedFiles(filesToSend);
        console.error('Failed to save message');
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      // Restore input if error occurred
      setCurrentMessage(messageContent);
      setUploadedFiles(filesToSend);
      console.error('Error in handleSendMessage:', error);
      alert('An error occurred while sending your message. Please try again.');
    }
  };

  const handleKeyPress = (e) => {
    console.log('Key pressed:', e.key, 'shiftKey:', e.shiftKey);
    
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Allow Shift+Enter for new line (don't prevent default)
        console.log('Shift+Enter pressed, allowing new line');
        return;
      } else {
        // Enter without Shift sends the message
        e.preventDefault();
        console.log('Enter pressed, sending message');
        handleSendMessage();
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setCurrentMessage(suggestion);
    // Auto-focus the input after setting the message
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const getSubjectIcon = (subjectId) => {
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
      'research': FileText,
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
  };

  const getSubjectColor = (subjectId) => {
    // Create thematic color mapping based on subject area
    const colorMap = {
      // Sciences - GREEN
      'biology': 'from-green-500 to-emerald-600',
      'chemistry': 'from-green-600 to-green-700',
      'physics': 'from-emerald-500 to-green-600',
      'environmental': 'from-green-400 to-emerald-500',
      'psychology': 'from-green-500 to-teal-600',
      
      // Math - RED
      'calculus': 'from-red-500 to-red-600',
      'statistics': 'from-red-600 to-red-700',
      'precalculus': 'from-red-400 to-red-500',
      
      // Computer Science - GREEN (as it's often considered STEM/Science)
      'computer': 'from-green-600 to-emerald-700',
      'programming': 'from-emerald-600 to-green-700',
      
      // English & Literature - BLUE
      'english': 'from-blue-500 to-blue-600',
      'literature': 'from-blue-600 to-indigo-600',
      'language': 'from-blue-400 to-blue-500',
      'composition': 'from-blue-500 to-indigo-500',
      'chinese': 'from-blue-500 to-blue-600',
      'french': 'from-blue-400 to-blue-500',
      'german': 'from-blue-600 to-indigo-600',
      'italian': 'from-blue-500 to-blue-600',
      'japanese': 'from-blue-400 to-indigo-500',
      'spanish': 'from-blue-500 to-blue-600',
      'latin': 'from-blue-600 to-indigo-600',
      
      // History & Social Sciences - ORANGE
      'history': 'from-orange-500 to-orange-600',
      'government': 'from-orange-600 to-orange-700',
      'politics': 'from-orange-500 to-red-500',
      'geography': 'from-orange-400 to-orange-500',
      'humanGeography': 'from-orange-500 to-orange-600',
      'worldHistory': 'from-orange-600 to-red-600',
      'usHistory': 'from-orange-500 to-orange-600',
      'europeanHistory': 'from-orange-500 to-orange-600',
      
      // Economics - ORANGE (Social Studies)
      'economics': 'from-orange-500 to-orange-600',
      'macroeconomics': 'from-orange-600 to-orange-700',
      'microeconomics': 'from-orange-500 to-orange-600',
      
      // Arts - Keep creative colors (not in main 4 categories)
      'art': 'from-purple-500 to-pink-600',
      'studio': 'from-pink-500 to-purple-600',
      'drawing': 'from-gray-500 to-slate-600',
      'design': 'from-violet-500 to-purple-600',
      'music': 'from-indigo-500 to-purple-600',
      
      // Other
      'research': 'from-slate-600 to-gray-700',
      'seminar': 'from-blue-500 to-purple-600'
    };
    
    // Find matching color by checking if subject ID contains key terms
    const subjectLower = subjectId?.toLowerCase() || '';
    
    for (const [key, color] of Object.entries(colorMap)) {
      if (subjectLower.includes(key.toLowerCase())) {
        return color;
      }
    }
    
    // Specific overrides for exact matches
    if (subjectLower.includes('ap physics 1')) return 'from-green-500 to-emerald-600';
    if (subjectLower.includes('ap physics 2')) return 'from-emerald-500 to-green-600';
    if (subjectLower.includes('mechanics')) return 'from-green-600 to-emerald-700';
    if (subjectLower.includes('electricity') || subjectLower.includes('magnetism')) return 'from-green-500 to-green-700';
    if (subjectLower.includes('comparative')) return 'from-orange-500 to-orange-600';
    
    // Default fallback
    return 'from-blue-500 to-purple-600';
  };

  if (!selectedSubject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <SubjectSelector
          subjects={subjects}
          selectedSubject={selectedSubject}
          onSelectSubject={handleSubjectSelect}
        />
      </div>
    );
  }

  const SubjectIcon = getSubjectIcon(selectedSubject);
  const subjectColor = getSubjectColor(selectedSubject);

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Conversation Sidebar */}
      {selectedSubject && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-80 bg-slate-800/90 backdrop-blur-xl border-r border-slate-700 flex flex-col"
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-200">Conversations</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleNewConversation();
                }}
                className="text-slate-300 hover:text-slate-100"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              {getCurriculumData(selectedSubject)?.name || selectedSubject}
            </p>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {conversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  activeConversationId === conversation.id
                    ? 'bg-blue-600/20 border border-blue-500/30'
                    : 'bg-slate-700/50 hover:bg-slate-700/80'
                }`}
                onClick={() => {
                  if (!editingConversationId) {
                    handleConversationSelect(conversation.id);
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 mr-2">
                    {editingConversationId === conversation.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleRenameConversation(conversation.id, editingName);
                            } else if (e.key === 'Escape') {
                              cancelEditingConversation();
                            }
                          }}
                          className="text-sm bg-slate-600 border-slate-500 text-slate-200"
                          autoFocus
                        />
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRenameConversation(conversation.id, editingName);
                            }}
                            className="h-6 px-2 text-green-400 hover:text-green-300"
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelEditingConversation();
                            }}
                            className="h-6 px-2 text-red-400 hover:text-red-300"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h4 className="text-sm font-medium text-slate-200 truncate">
                          {conversation.name}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {conversation.lastMessage || 'New conversation'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {conversation.createdAt.toLocaleDateString()}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Conversation Menu */}
                  {!editingConversationId && (
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowConversationMenu(
                            showConversationMenu === conversation.id ? null : conversation.id
                          );
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-slate-400 hover:text-slate-200"
                      >
                        <MoreVertical className="w-3 h-3" />
                      </Button>

                      {/* Dropdown Menu */}
                      {showConversationMenu === conversation.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute right-0 top-6 z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-lg py-1 min-w-[120px]"
                          data-conversation-menu
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditingConversation(conversation.id, conversation.name);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />
                            Rename
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDeleteConversation(conversation.id);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-slate-700 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Enhanced Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-slate-800/90 backdrop-blur-xl border-b border-slate-700 shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={async () => {
                    // Clean up current conversation if empty before navigating
                    if (activeConversationId && conversations.length > 1) {
                      console.log('Back button clicked, cleaning up empty conversation if needed...');
                      await cleanupEmptyConversation(activeConversationId, conversations.length);
                    }
                    navigate('/dashboard');
                  }}
                  className="text-slate-300 hover:text-slate-100"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Subjects
                </Button>
                
                <div className="flex items-center gap-4">
                  <div className={`p-3 bg-gradient-to-br ${subjectColor} rounded-xl shadow-lg`}>
                    <SubjectIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-100">
                      {getCurriculumData(selectedSubject)?.name || selectedSubject}
                    </h1>
                    <p className="text-sm text-slate-300 flex items-center gap-2">
                      <Bot className="w-4 h-4 text-emerald-400" />
                      AI Tutor • Ready to help
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <Badge variant="primary" className="bg-emerald-800 text-emerald-200 border-emerald-600">
                  Active Session
                </Badge>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Diagnostics output removed */}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Welcome Message */}
          {messages.length === 1 && messages[0].suggestions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <Sparkles className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-slate-200">Quick Start Suggestions</h3>
                  </div>
                  <div className="space-y-2">
                    {getSubjectSuggestions(selectedSubject).map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-left justify-start h-auto p-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-100 w-full"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Messages */}
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-4xl ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                        : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-5 h-5 text-white" />
                      ) : (
                        <Bot className="w-5 h-5 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 max-w-2xl">
                    <Card className={`${
                      message.type === 'user'
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white border-none'
                        : 'bg-slate-800/80 backdrop-blur-sm border border-slate-600/50'
                    }`}>
                      <CardContent className="p-4">
                        {message.type === 'user' ? (
                          <div>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap text-white">
                              {message.content}
                            </p>
                            
                            {/* Display uploaded files */}
                            {message.files && message.files.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {message.files.map((file, index) => (
                                  <div key={index} className="flex items-center gap-2 p-2 bg-white/10 rounded-lg">
                                    {file.category === 'image' ? (
                                      <Image className="w-4 h-4 text-blue-200" />
                                    ) : (
                                      <FileText className="w-4 h-4 text-blue-200" />
                                    )}
                                    <span className="text-xs text-blue-100">{file.name}</span>
                                    <span className="text-xs text-blue-200">
                                      ({Math.round(file.size / 1024)}KB)
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <MarkdownRenderer 
                            content={message.content}
                            className={`text-sm leading-relaxed ${
                              message.type === 'user' ? 'text-white' : 'text-slate-200'
                            }`}
                          />
                        )}
                        
                        <div className={`text-xs mt-2 ${
                          message.type === 'user' ? 'text-blue-100' : 'text-slate-400'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <Card className="bg-slate-800/80 backdrop-blur-sm border border-slate-600/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span className="text-sm text-slate-300">AI Tutor is thinking...</span>
                      <div className="flex gap-1 ml-2">
                        <motion.div
                          className="w-1.5 h-1.5 bg-emerald-500 rounded-full"
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-1.5 h-1.5 bg-emerald-500 rounded-full"
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-1.5 h-1.5 bg-emerald-500 rounded-full"
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Enhanced Input Area */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-slate-800/90 backdrop-blur-xl border-t border-slate-700 shadow-lg"
      >
        <div className="max-w-4xl mx-auto p-6">
          {/* Display uploaded files */}
          {uploadedFiles.length > 0 && (
            <div className="mb-4 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300 font-medium">Attached Files:</span>
                <button
                  onClick={() => setUploadedFiles([])}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-600/50 rounded-lg border border-slate-500"
                  >
                    {file.category === 'image' ? (
                      <Image className="w-4 h-4 text-blue-400" />
                    ) : (
                      <FileText className="w-4 h-4 text-green-400" />
                    )}
                    <span className="text-sm text-slate-200">{file.name}</span>
                    <span className="text-xs text-slate-400">
                      ({Math.round(file.size / 1024)}KB)
                    </span>
                    <button
                      onClick={() => handleFileRemove(file.id)}
                      className="ml-2 text-slate-400 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Input
                ref={inputRef}
                placeholder={`Ask your ${getCurriculumData(selectedSubject)?.name || selectedSubject} tutor anything...`}
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                className="text-base py-4 pr-20 min-h-[3rem] max-h-32"
                multiline={true}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="ghost" 
                size="sm"
                onClick={handleFileSelect}
                className="text-slate-300 hover:text-slate-100"
                title="Attach file"
              >
                <Paperclip className="w-5 h-5" />
              </Button>
              
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Send button clicked');
                  handleSendMessage();
                }}
                disabled={(!currentMessage.trim() && uploadedFiles.length === 0) || isTyping}
                className="px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                glow
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4 text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span>Press Enter to send • Shift+Enter for new line</span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Powered by advanced AI
              </span>
            </div>
          </div>
        </div>
      </motion.div>
      </div>
    </div>
  );
};

export default AITutors;
