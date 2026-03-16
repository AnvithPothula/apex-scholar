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
import MCQCard from '../components/tutors/MCQCard.jsx';
import CalculatorPad from '../components/tools/CalculatorPad.jsx';
import { cedSearch } from '../services/cedSearch';
import { extractPdfTextFromBase64 } from '../services/pdfUtils';
import SubjectSelector from '../components/tutors/SubjectSelector.jsx';
import MarkdownRenderer from '../components/MarkdownRenderer.jsx';
import ModelSelector, { getDefaultModel, saveSelectedModel } from '../components/ui/ModelSelector.jsx';
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
import geminiService, { RateLimitError } from '../services/geminiService';

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
  const [selectedMode, setSelectedMode] = useState('Explain'); // 'Explain' | 'Practice MCQ' | 'Walkthrough' | 'Summarize Attachment'
  const [checkMySteps, setCheckMySteps] = useState(false);
  const [selectedModel, setSelectedModel] = useState(getDefaultModel);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
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
    let unsubscribe = null;
    if (user && selectedSubject) {
      loadConversations(user.uid, selectedSubject).then(unsub => {
        unsubscribe = unsub;
      });
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, selectedSubject, loadConversations]);

  // Load messages when active conversation changes
  useEffect(() => {
    let unsubscribe = null;
    let cancelled = false;
    
    if (activeConversationId) {
      console.log('Loading messages for conversation:', activeConversationId);
      loadConversationMessages(activeConversationId).then(unsub => {
        if (cancelled) {
          // Effect already cleaned up — tear down the new listener immediately
          if (unsub) unsub();
        } else {
          unsubscribe = unsub;
        }
      });
    } else {
      // Clear messages when no conversation is active
      setMessages([]);
    }
    
    // Cleanup function
    return () => {
      cancelled = true;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [activeConversationId, loadConversationMessages]);

  // Keyboard-first shortcuts
  useEffect(() => {
    const handler = (e) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (meta && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        handleFileSelect();
      } else if (meta && ['1','2','3','4'].includes(e.key)) {
        e.preventDefault();
        const map = { '1':'Explain', '2':'Practice MCQ', '3':'Walkthrough', '4':'Summarize Attachment' };
        setSelectedMode(map[e.key]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debug effect to track state changes (excludes currentMessage to avoid keystroke spam)
  useEffect(() => {
    console.log('Current state:', {
      selectedSubject,
      messageCount: messages.length,
      isTyping
    });
  }, [selectedSubject, messages, isTyping]);

  // Auto scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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
      setTimeout(() => setIsSwitchingSubjects(false), 1000);
    }
  }, [user, loadConversations, activeConversationId, conversations.length, cleanupEmptyConversation]);

  // Handle URL subject parameter — sync selectedSubject with the route
  useEffect(() => {
    if (urlSubject && urlSubject !== selectedSubject) {
      console.log('URL subject detected:', urlSubject);
      handleSubjectSelect(urlSubject);
    } else if (!urlSubject && selectedSubject) {
      // Navigated back to /AITutors (no subject in URL) — show subject selector
      setSelectedSubject(null);
      setActiveConversationId(null);
      setMessages([]);
      setConversations([]);
      setCurrentMessage('');
      setUploadedFiles([]);
    }
  }, [urlSubject, selectedSubject, handleSubjectSelect]);

  // Redirect to login if not authenticated
  if (loading) {
    return (
      <div className="min-h-screen bg-base-950 flex items-center justify-center">
        <div className="text-content-secondary">Loading...</div>
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
      // Persist suggestions for welcome messages so they survive page reload
      if (Array.isArray(message.suggestions) && message.suggestions.length > 0) {
        messageData.suggestions = message.suggestions;
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
  const response = await generateKnowledgeableResponse(selectedSubject, userMessage, curriculumData, uploadedFiles, { mode: selectedMode, checkMySteps });
      
      if (!response || response.trim().length === 0) {
        throw new Error('Empty response from AI');
      }
      
      let aiMessage = {
        id: `ai_${Date.now()}`,
        type: 'ai',
        content: response,
        timestamp: new Date()
      };

      // If MCQ mode and response is JSON, render as MCQ card
      if (selectedMode === 'Practice MCQ') {
        try {
          // Strip markdown code fences (```json ... ```)
          let cleaned = response.replace(/```(?:json)?\s*([\s\S]*?)```/g, '$1').trim();
          // Try to extract JSON object — find the outermost { ... }
          const firstBrace = cleaned.indexOf('{');
          const lastBrace = cleaned.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace > firstBrace) {
            const jsonStr = cleaned.substring(firstBrace, lastBrace + 1);
            const mcq = JSON.parse(jsonStr);
            if (mcq && mcq.question && Array.isArray(mcq.choices) && mcq.choices.length >= 2) {
              // Ensure correctIndex is always a number (AI may return it as a string)
              if (mcq.correctIndex !== undefined && mcq.correctIndex !== null) {
                mcq.correctIndex = parseInt(mcq.correctIndex, 10);
                if (isNaN(mcq.correctIndex)) mcq.correctIndex = 0;
              }
              // Ensure explanations is an array (AI may omit or return wrong type)
              if (!Array.isArray(mcq.explanations)) {
                mcq.explanations = mcq.choices.map(() => '');
              }
              aiMessage.responseType = 'mcq';
              aiMessage.mcq = mcq;
              // Replace content with just the question text (hide raw JSON from display)
              aiMessage.content = mcq.question;
            }
          }
        } catch (_) {
          // JSON parse failed — strip any JSON-looking blocks so user doesn't see raw JSON
          aiMessage.content = response
            .replace(/```(?:json)?\s*[\s\S]*?```/g, '')
            .replace(/\{[\s\S]*"question"[\s\S]*"choices"[\s\S]*\}/g, '')
            .trim() || 'I generated a practice question but had trouble formatting it. Please try again!';
        }
      }
      
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

  // Input sanitization to prevent prompt injection - use centralized sanitizer
  const sanitizeUserInput = (input) => {
    return geminiService.sanitizeInput(input, { maxLength: 8000, allowMarkdown: true });
  };

  // Enhanced AI-powered response generator with markdown, LaTeX, and curriculum focus
  const generateKnowledgeableResponse = async (subject, userMessage, curriculumData, uploadedFiles = [], opts = {}) => {
    // geminiService is already imported at top of file
    const subjectName = curriculumData?.name || subject;
    const { mode = 'Explain', checkMySteps = false } = opts;
    
    // Build conversation history for context (last 6 messages for optimal performance)
    // IMPORTANT: Only include images from the LATEST message to save tokens.
    // Older images are replaced with text descriptions.
    const hasFiles = Array.isArray(uploadedFiles) && uploadedFiles.length > 0;
    const conversationHistory = messages.slice(-6).map((msg, idx, arr) => {
      const sanitizedContent = msg.type === 'user' ? sanitizeUserInput(msg.content) : msg.content;
      // Truncate older assistant responses to save input tokens
      const isOldMessage = idx < arr.length - 2;
      const truncatedContent = isOldMessage && msg.type === 'ai' && sanitizedContent.length > 500
        ? sanitizedContent.substring(0, 500) + '... [truncated for brevity]'
        : sanitizedContent;
      const parts = [{ text: truncatedContent }];
      
      // Only include inline image data for the most recent user message.
      // For older messages, include a text reference instead to save tokens.
      const isLatestUserMsg = idx === arr.length - 1 && msg.type === 'user';
      if (msg.files) {
        msg.files.forEach(file => {
          if (file.category === 'image' && file.data) {
            if (isLatestUserMsg) {
              parts.push({
                inline_data: {
                  mime_type: file.mimeType || file.type || 'image/png',
                  data: file.data
                }
              });
              parts.push({ text: `[Image: ${file.name}]` });
            } else {
              parts.push({ text: `[Previously uploaded image: ${file.name}]` });
            }
          } else if (file.category === 'text' && file.content) {
            // Truncate old text file content
            const content = isOldMessage ? file.content.substring(0, 500) + '...' : file.content;
            parts.push({ text: `[File: ${file.name}]\n${content}` });
          } else if (file.category === 'document') {
            parts.push({ text: `[Document: ${file.name}]` });
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
CURRICULUM: ${curriculumData.name}
${curriculumData.units?.map((unit, i) => `Unit ${i + 1}: ${unit.name} (${unit.weight || '~equal'}) — ${unit.topics?.slice(0, 5).join(', ') || 'Core concepts'}`).join('\n') || 'Multiple units covering all AP standards'}
${curriculumData.examFormat ? `EXAM: ${curriculumData.examFormat.duration} — ${curriculumData.examFormat.sections?.map(s => `${s.name}: ${s.questions}q, ${s.weight}`).join('; ') || 'MC + FRQ'}` : ''}
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

  // Fetch CED citations (best-effort, non-blocking)
  console.log('[AI] Fetching CED citations...');
  let citations = [];
  try {
    citations = await cedSearch(subjectName, userMessage);
    console.log('[AI] CED citations fetched:', citations.length);
  } catch (e) {
    console.warn('[AI] CED citations failed:', e);
    citations = [];
  }

  const modeDirective = mode === 'Practice MCQ'
    ? `MODE: Practice MCQ.
Output STRICT JSON with keys: question (string), choices (array of 4 strings), correctIndex (0-3), explanations (array of 4 strings). No prose before or after JSON.`
    : mode === 'Walkthrough'
    ? `MODE: Step-by-step walkthrough with short steps and $LaTeX$ for math.`
    : mode === 'Summarize Attachment'
    ? `MODE: Summarize the attached files first (key ideas, formulas, exam relevance), then answer the user's prompt.`
    : `MODE: Clear explanation of the concept with examples and exam alignment.`;

  const critiqueDirective = checkMySteps
    ? `Critique Mode ON: If the user shares steps, briefly check for correctness and point out specific fixes before providing the final answer.`
    : `Critique Mode OFF.`;

  const citationsBlock = citations.length > 0
    ? `
CED REFERENCE SNIPPETS (use to support your answer; cite page numbers):
${citations.map(c => `- Page ${c.page}: ${c.snippet}`).join('\n')}
`
    : '';

  // Enhanced system prompt — compact to reduce per-call token usage
  const studentName = user?.displayName || user?.fullName || '';
  const personalization = user?.aiPersonalization || {};
  const styleMap = {
    professional: 'Use formal, precise academic language.',
    friendly: 'Be warm, conversational, and approachable.',
    casual: 'Be relaxed and chill — like a friend who\'s good at the subject.',
    encouraging: 'Be supportive and motivating. Celebrate progress.',
    direct: 'Be concise. No filler. Get straight to the point.',
    balanced: ''
  };
  const personalDirective = [
    styleMap[personalization.style] || '',
    personalization.useEmoji ? 'Use emoji occasionally to make responses engaging.' : 'Do NOT use emoji.',
    personalization.useHeaders === false ? 'Avoid headers and bullet lists — use flowing prose instead.' : '',
    personalization.customInstructions ? `STUDENT INSTRUCTIONS: ${personalization.customInstructions}` : ''
  ].filter(Boolean).join('\n');

  const systemPrompt = `You are an expert AP ${subjectName} tutor. You ONLY answer questions related to ${subjectName}. Your goal: help the student score a 5.${studentName ? `\nThe student's name is ${studentName}. Address them by name occasionally.` : ''}
${personalDirective ? `\n${personalDirective}` : ''}

${curriculumContext}

${modeDirective}
${critiqueDirective}
${citationsBlock}

ATTACHMENTS: ${hasFiles ? 'Files attached — analyze them first, describe contents, then answer.' : 'None.'}
- Only reference files if attached. Never ask user to upload unless they request it.

FORMATTING:
- Markdown: **bold**, *italics*, ## headers, bullet lists
- LaTeX: ALWAYS wrap math in delimiters — $inline$ or $$display$$. Examples: $\\leftrightharpoons$, $\\int_a^b f(x)\\,dx$, $$\\frac{d}{dx}[f(x)]$$
- Never write bare LaTeX commands without $ delimiters
- Tables: Use proper Markdown table syntax with | and --- when presenting data
- Keep responses under 400 words unless asked for more
- No preambles ("Understood", "I'm ready", etc.)

If asked about a non-${subjectName} topic: "${boundaryLine}"
If ambiguous: give a brief best-effort answer, then ask one clarifying question.

RESPONSE STRUCTURE: Direct analysis → 2-3 key concepts → AP application → One follow-up question.`;

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
            // Try to extract first pages for better context
            try {
              if ((file.mimeType || file.type) === 'application/pdf') {
                const extracted = await extractPdfTextFromBase64(file.data, { maxPages: 2, maxChars: 2000 });
                if (extracted) {
                  messageParts.push({ text: `[Extracted from PDF ${file.name}]:\n${extracted}` });
                }
              }
            } catch (_) { /* ignore extraction errors */ }
            messageParts.push({ text: `[Document uploaded: ${file.name}. Analyze in the context of AP ${subjectName}.]` });
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
          temperature: mode === 'Practice MCQ' ? 0.4 : 0.7,
          topK: 40,
          topP: 0.9,
          maxOutputTokens: mode === 'Practice MCQ' ? 800 : 1600, // smaller for JSON
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
        ],
        timeoutMs: 45000 // 45 second timeout
      };
      console.log("Calling enhanced Gemini API with curriculum focus and file analysis...", {
        messagePartsCount: messageParts.length,
        conversationHistoryCount: conversationHistory.length,
        mode,
        hasFiles
      });
      const text = await geminiService.generateFromPayload(payload);
      console.log("Received AI response, length:", text?.length || 0);
      return text;
      
    } catch (error) {
      console.error('Error calling enhanced Gemini API:', error);
      
      // Check for rate limit error and provide specific message
      if (error instanceof RateLimitError || error.isRateLimit || 
          (error.message && (error.message.includes('rate') || error.message.includes('quota') || error.message.includes('429')))) {
        const waitTime = error.retryAfter || 60;
        return `⏳ **AI Service Temporarily Unavailable**

The AI service is currently experiencing high demand. Please wait **${waitTime} seconds** before trying again.

**While you wait:**
- Review your course materials for ${subjectName}
- Check out the Practice Tests section
- Browse flashcards for quick review

*The service will automatically become available again shortly. Thank you for your patience!*`;
      }
      
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
      'biology': 'from-success-500 to-emerald-600',
      'chemistry': 'from-success-600 to-success-700',
      'physics': 'from-emerald-500 to-success-600',
      'environmental': 'from-success-400 to-emerald-500',
      'psychology': 'from-success-500 to-teal-600',
      
      // Math - RED
      'calculus': 'from-error-500 to-error-600',
      'statistics': 'from-error-600 to-error-700',
      'precalculus': 'from-error-400 to-error-500',
      
      // Computer Science - GREEN (as it's often considered STEM/Science)
      'computer': 'from-success-600 to-emerald-700',
      'programming': 'from-emerald-600 to-success-700',
      
      // English & Literature - BLUE
      'english': 'from-primary-500 to-primary-600',
      'literature': 'from-primary-600 to-primary-600',
      'language': 'from-primary-400 to-primary-500',
      'composition': 'from-primary-500 to-primary-500',
      'chinese': 'from-primary-500 to-primary-600',
      'french': 'from-primary-400 to-primary-500',
      'german': 'from-primary-600 to-primary-600',
      'italian': 'from-primary-500 to-primary-600',
      'japanese': 'from-primary-400 to-primary-500',
      'spanish': 'from-primary-500 to-primary-600',
      'latin': 'from-primary-600 to-primary-600',
      
      // History & Social Sciences - ORANGE
      'history': 'from-orange-500 to-orange-600',
      'government': 'from-orange-600 to-orange-700',
      'politics': 'from-orange-500 to-error-500',
      'geography': 'from-orange-400 to-orange-500',
      'humanGeography': 'from-orange-500 to-orange-600',
      'worldHistory': 'from-orange-600 to-error-600',
      'usHistory': 'from-orange-500 to-orange-600',
      'europeanHistory': 'from-orange-500 to-orange-600',
      
      // Economics - ORANGE (Social Studies)
      'economics': 'from-orange-500 to-orange-600',
      'macroeconomics': 'from-orange-600 to-orange-700',
      'microeconomics': 'from-orange-500 to-orange-600',
      
      // Arts - Keep creative colors (not in main 4 categories)
      'art': 'from-primary-500 to-primary-600',
      'studio': 'from-primary-500 to-primary-600',
      'drawing': 'from-gray-500 to-gray-600',
      'design': 'from-primary-500 to-primary-600',
      'music': 'from-primary-500 to-primary-600',
      
      // Other
      'research': 'from-gray-600 to-gray-700',
      'seminar': 'from-primary-500 to-primary-600'
    };
    
    // Find matching color by checking if subject ID contains key terms
    const subjectLower = subjectId?.toLowerCase() || '';
    
    for (const [key, color] of Object.entries(colorMap)) {
      if (subjectLower.includes(key.toLowerCase())) {
        return color;
      }
    }
    
    // Specific overrides for exact matches
    if (subjectLower.includes('ap physics 1')) return 'from-success-500 to-emerald-600';
    if (subjectLower.includes('ap physics 2')) return 'from-emerald-500 to-success-600';
    if (subjectLower.includes('mechanics')) return 'from-success-600 to-emerald-700';
    if (subjectLower.includes('electricity') || subjectLower.includes('magnetism')) return 'from-success-500 to-success-700';
    if (subjectLower.includes('comparative')) return 'from-orange-500 to-orange-600';
    
    // Default fallback
    return 'from-primary-500 to-primary-600';
  };

  // Early return for subject selection
  if (!selectedSubject) {
    return (
      <div className="min-h-screen bg-base-950">
        <SubjectSelector
          subjects={subjects}
          selectedSubject={selectedSubject}
          onSelectSubject={handleSubjectSelect}
        />
      </div>
    );
  }

  // Get computed values (these are simple lookups, no need for useMemo)
  const SubjectIcon = getSubjectIcon(selectedSubject);
  const subjectColor = getSubjectColor(selectedSubject);
  const subjectSuggestions = getSubjectSuggestions(selectedSubject);

  return (
    <div className="h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] flex bg-base-950 relative">
      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}
      
      {/* Conversation Sidebar - Hidden on mobile by default, always visible on desktop */}
      {selectedSubject && (
        <div
          className={`fixed md:relative z-50 md:z-auto w-72 sm:w-80 h-full bg-base-850 md:bg-base-850 border-r border-border flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:opacity-100 ${showMobileSidebar ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 md:translate-x-0 md:opacity-100'}`}
        >
          {/* Sidebar Header */}
          <div className="p-3 sm:p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-content-primary">Conversations</h3>
              <div className="flex items-center gap-1">
                {/* Close button for mobile */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileSidebar(false)}
                  className="text-content-secondary hover:text-content-primary md:hidden"
                >
                  <X strokeWidth={1.5} className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNewConversation();
                  }}
                  className="text-content-secondary hover:text-content-primary"
                >
                  <Plus strokeWidth={1.5} className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-content-muted mt-1">
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
                    ? 'bg-primary-900 border border-primary-500/30'
                    : 'bg-base-800 hover:bg-base-800'
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
                          className="text-sm bg-base-750 border-border-strong text-content-primary"
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
                            className="h-6 px-2 text-success-400 hover:text-success-400"
                          >
                            <Check strokeWidth={1.5} className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelEditingConversation();
                            }}
                            className="h-6 px-2 text-error-400 hover:text-error-400"
                          >
                            <X strokeWidth={1.5} className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h4 className="text-sm font-medium text-content-primary truncate">
                          {conversation.name}
                        </h4>
                        <p className="text-xs text-content-muted mt-1 line-clamp-2">
                          {conversation.lastMessage || 'New conversation'}
                        </p>
                        <p className="text-xs text-content-muted mt-1">
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
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-content-muted hover:text-content-primary"
                      >
                        <MoreVertical strokeWidth={1.5} className="w-3 h-3" />
                      </Button>

                      {/* Dropdown Menu */}
                      {showConversationMenu === conversation.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute right-0 top-6 z-50 bg-base-850 border border-border-strong rounded-lg shadow-raised py-1 min-w-[120px]"
                          data-conversation-menu
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditingConversation(conversation.id, conversation.name);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-content-primary hover:bg-base-800 transition-colors"
                          >
                            <Edit3 strokeWidth={1.5} className="w-3 h-3" />
                            Rename
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDeleteConversation(conversation.id);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-error-400 hover:bg-base-800 transition-colors"
                          >
                            <Trash2 strokeWidth={1.5} className="w-3 h-3" />
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
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Enhanced Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-base-850 border-b border-border shadow-raised"
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                {/* Mobile sidebar toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileSidebar(true)}
                  className="text-content-secondary hover:text-content-primary md:hidden flex-shrink-0 p-2"
                >
                  <BookOpen strokeWidth={1.5} className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    // Clean up current conversation if empty before navigating
                    if (activeConversationId && conversations.length > 1) {
                      console.log('Back button clicked, cleaning up empty conversation if needed...');
                      await cleanupEmptyConversation(activeConversationId, conversations.length);
                    }
                    navigate('/AITutors');
                  }}
                  className="text-content-secondary hover:text-content-primary hidden sm:flex"
                >
                  <ChevronLeft strokeWidth={1.5} className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden md:inline">Back to Subjects</span>
                  <span className="md:hidden">Back</span>
                </Button>
                
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                  <div className={`p-2 sm:p-3 bg-gradient-to-br ${subjectColor} rounded-lg sm:rounded-sm shadow-raised flex-shrink-0`}>
                    <SubjectIcon className="w-4 h-4 sm:w-6 sm:h-6 text-content-primary" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-base sm:text-xl md:text-2xl font-bold font-display text-content-primary truncate">
                      {getCurriculumData(selectedSubject)?.name || selectedSubject}
                    </h1>
                    <p className="text-xs sm:text-sm text-content-secondary flex items-center gap-1 sm:gap-2">
                      <Bot strokeWidth={1.5} className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400 flex-shrink-0" />
                      <span className="hidden sm:inline">AI Tutor • Ready to help</span>
                      <span className="sm:hidden">AI Tutor</span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-6 flex-shrink-0">
                <Badge variant="primary" className="bg-emerald-800 text-emerald-200 border-emerald-600 text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 hidden sm:inline-flex">
                  Active Session
                </Badge>
                {/* Mobile back button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/AITutors')}
                  className="text-content-secondary hover:text-content-primary sm:hidden p-2"
                >
                  <ChevronLeft strokeWidth={1.5} className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Diagnostics output removed */}

      {/* Mode Selector — sticky bar */}
      <div className="bg-base-850 border-b border-border z-10">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-2">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2" role="group" aria-label="Tutor modes">
            {['Explain','Practice MCQ','Walkthrough','Summarize Attachment'].map((m) => (
              <Button
                key={m}
                variant={selectedMode === m ? 'primary' : 'ghost'}
                size="sm"
                aria-pressed={selectedMode === m}
                onClick={() => setSelectedMode(m)}
                className={`text-xs sm:text-sm px-2 sm:px-3 py-1.5 ${selectedMode === m ? 'bg-primary-900 text-primary-400' : 'text-content-secondary hover:text-content-primary'}`}
              >
                <span className="hidden sm:inline">{m}</span>
                <span className="sm:hidden">{m === 'Practice MCQ' ? 'MCQ' : m === 'Summarize Attachment' ? 'Summarize' : m}</span>
              </Button>
            ))}
            <label className="ml-1 sm:ml-2 inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-content-secondary">
              <input type="checkbox" checked={checkMySteps} onChange={(e) => setCheckMySteps(e.target.checked)} className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Check my steps</span>
              <span className="sm:hidden">Check</span>
            </label>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto scroll-touch">
        <div className="max-w-4xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
          {/* Welcome Message */}
          {messages.length === 1 && messages[0].suggestions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="bg-base-850 border-border-strong">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <Sparkles strokeWidth={1.5} className="w-8 h-8 text-primary-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-content-primary">Quick Start Suggestions</h3>
                  </div>
                  <div className="space-y-2">
                    {subjectSuggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-left justify-start h-auto p-3 text-sm text-content-secondary hover:bg-base-800 hover:text-content-primary w-full"
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
                    <div className={`w-10 h-10 rounded-sm flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-primary-500' 
                        : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                    }`}>
                      {message.type === 'user' ? (
                        <User strokeWidth={1.5} className="w-5 h-5 text-content-primary" />
                      ) : (
                        <Bot strokeWidth={1.5} className="w-5 h-5 text-content-primary" />
                      )}
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 max-w-2xl">
                    <Card className={`${
                      message.type === 'user'
                        ? 'bg-primary-500 text-base-950 border-none'
                        : 'bg-base-850 border border-border-strong'
                    }`}>
                      <CardContent className="p-4">
                        {message.type === 'user' ? (
                          <div>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap text-base-950">
                              {message.content}
                            </p>
                            
                            {/* Display uploaded files */}
                            {message.files && message.files.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {message.files.map((file, index) => (
                                  <div key={index} className="flex items-center gap-2 p-2 bg-base-850/50 rounded-lg">
                                    {file.category === 'image' ? (
                                      <Image strokeWidth={1.5} className="w-4 h-4 text-primary-400" />
                                    ) : (
                                      <FileText strokeWidth={1.5} className="w-4 h-4 text-primary-400" />
                                    )}
                                    <span className="text-xs text-primary-400">{file.name}</span>
                                    <span className="text-xs text-primary-400">
                                      ({Math.round(file.size / 1024)}KB)
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          message.responseType === 'mcq' && message.mcq ? (
                            <MCQCard
                              mcq={message.mcq}
                              onSelect={async (choiceIdx) => {
                                try {
                                  const correct = typeof message.mcq.correctIndex === 'number' ? (choiceIdx === message.mcq.correctIndex) : null;
                                  await addDoc(collection(db, 'conversations', activeConversationId, 'mcqResponses'), {
                                    question: message.mcq.question,
                                    choiceIndex: choiceIdx,
                                    correctIndex: message.mcq.correctIndex,
                                    correct,
                                    createdAt: serverTimestamp()
                                  });
                                } catch (e) {
                                  console.error('Failed to save MCQ response', e);
                                }
                              }}
                            />
                          ) : (
                            <MarkdownRenderer 
                              content={message.content}
                              className={`text-sm leading-relaxed ${
                                message.type === 'user' ? 'text-base-950' : 'text-content-primary'
                              }`}
                            />
                          )
                        )}
                        
                        <div className={`text-xs mt-2 ${
                          message.type === 'user' ? 'text-primary-400' : 'text-content-muted'
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
                <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Bot strokeWidth={1.5} className="w-5 h-5 text-content-primary" />
                </div>
                <Card className="bg-base-850 border border-border-strong">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-1">
                      <Sparkles strokeWidth={1.5} className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span className="text-sm text-content-secondary">AI Tutor is thinking...</span>
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
        className="bg-base-850 border-t border-border shadow-raised safe-bottom"
      >
        <div className="max-w-4xl mx-auto p-3 sm:p-4 md:p-6">
          {/* Display uploaded files */}
          {uploadedFiles.length > 0 && (
            <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-base-800 rounded-lg border border-border-strong">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm text-content-secondary font-medium">Attached:</span>
                <button
                  onClick={() => setUploadedFiles([])}
                  className="text-xs text-content-muted hover:text-content-primary"
                >
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-base-750 rounded-lg border border-border-strong"
                  >
                    {file.category === 'image' ? (
                      <Image strokeWidth={1.5} className="w-3 h-3 sm:w-4 sm:h-4 text-primary-400" />
                    ) : (
                      <FileText strokeWidth={1.5} className="w-3 h-3 sm:w-4 sm:h-4 text-success-400" />
                    )}
                    <span className="text-xs sm:text-sm text-content-primary truncate max-w-[100px] sm:max-w-none">{file.name}</span>
                    <span className="text-xs text-content-muted hidden sm:inline">
                      ({Math.round(file.size / 1024)}KB)
                    </span>
                    <button
                      onClick={() => handleFileRemove(file.id)}
                      className="ml-1 sm:ml-2 text-content-muted hover:text-error-400"
                    >
                      <X strokeWidth={1.5} className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-2 sm:gap-3 items-end">
            <div className="flex-1">
              <Input
                ref={inputRef}
                placeholder={`Ask about ${getCurriculumData(selectedSubject)?.name || selectedSubject}...`}
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                className="text-sm sm:text-base py-2.5 sm:py-4 pr-12 sm:pr-20 min-h-[2.5rem] sm:min-h-[3rem] max-h-24 sm:max-h-32"
                multiline={true}
              />
            </div>
            
            <div className="flex gap-1.5 sm:gap-2 items-center flex-shrink-0">
              <ModelSelector
                value={selectedModel}
                onChange={(m) => { setSelectedModel(m); saveSelectedModel(m); }}
                compact
              />
              <Button
                variant="ghost" 
                size="sm"
                onClick={handleFileSelect}
                className="text-content-secondary hover:text-content-primary p-2 sm:p-2.5"
                title="Attach file"
              >
                <Paperclip strokeWidth={1.5} className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Send button clicked');
                  handleSendMessage();
                }}
                disabled={(!currentMessage.trim() && uploadedFiles.length === 0) || isTyping}
                className="px-3 sm:px-6 py-2 sm:py-2.5 bg-primary-500 hover:bg-primary-600"
              >
                <Send strokeWidth={1.5} className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center justify-between mt-3 sm:mt-4 text-xs text-content-muted">
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <span>Enter to send • Shift+Enter for new line</span>
              <span className="flex items-center gap-1">
                <TrendingUp strokeWidth={1.5} className="w-3 h-3" />
                Powered by AI
              </span>
            </div>
          </div>
        </div>
      </motion.div>
      {showCalculator && (
        <CalculatorPad onClose={() => setShowCalculator(false)} />
      )}
      </div>
    </div>
  );
};

export default AITutors;
