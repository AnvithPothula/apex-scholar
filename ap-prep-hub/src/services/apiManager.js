import apiKeyManager from './APIKeyManager';
import { parseAIResponse } from '../utils/testUtils';

/**
 * Centralized API Manager for handling all Gemini API requests
 * Provides request queuing, rate limiting, fallback responses, and intelligent retry logic
 */

import { getRateLimitConfig, getBatchingConfig } from '../config/environment';

class APIManager {
  constructor() {
    // Load configuration from environment
    const rateLimitConfig = getRateLimitConfig();
    const batchingConfig = getBatchingConfig();
    
    // Configuration for production scaling
    this.config = {
      // Rate limiting per user
      userRateLimit: rateLimitConfig.user,
      
      // Global rate limiting
      globalRateLimit: rateLimitConfig.global,
      
      // Retry and backoff settings
      retry: {
        maxAttempts: 4,
        baseDelay: 1000,        // 1 second base delay
        maxDelay: 30000,        // 30 second max delay
        exponentialBase: 2
      },
      
      // Batch optimization
      batching: batchingConfig
    };

    // Request tracking
    this.userRequests = new Map(); // Track per-user rate limits
    this.globalQueue = [];         // Global request queue
    this.activeRequests = 0;       // Current active requests
    this.requestHistory = [];      // Success/failure tracking
    
    // Performance metrics
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      rateLimitHits: 0
    };

    // Start background queue processor
    this.processQueue();
    
    // Cleanup old request tracking data every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Main API request method with comprehensive rate limiting and queuing
   */
  async makeRequest(userId, requestData, priority = 'normal') {
    return new Promise((resolve, reject) => {
      const request = {
        id: this.generateRequestId(),
        userId,
        requestData,
        priority,
        timestamp: Date.now(),
        resolve,
        reject,
        attempts: 0
      };

      // Check if user is rate limited
      if (this.isUserRateLimited(userId)) {
        const waitTime = this.calculateUserWaitTime(userId);
        reject(new Error(`Rate limited. Please wait ${Math.ceil(waitTime / 1000)} seconds before making another request.`));
        return;
      }

      // Check global queue capacity
      if (this.globalQueue.length >= this.config.globalRateLimit.queueSize) {
        reject(new Error('System is at capacity. Please try again in a few minutes.'));
        return;
      }

      // Add to queue with priority handling
      this.addToQueue(request);
      
      console.log(`📥 Request ${request.id} queued for user ${userId}. Queue position: ${this.globalQueue.length}`);
    });
  }

  /**
   * Add request to queue with priority sorting
   */
  addToQueue(request) {
    this.globalQueue.push(request);
    
    // Sort by priority and timestamp
    this.globalQueue.sort((a, b) => {
      const priorityOrder = { 'high': 3, 'normal': 2, 'low': 1 };
      const aPriority = priorityOrder[a.priority] || 2;
      const bPriority = priorityOrder[b.priority] || 2;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority first
      }
      return a.timestamp - b.timestamp; // Earlier timestamp first
    });
  }

  /**
   * Background queue processor
   */
  async processQueue() {
    setInterval(async () => {
      // Process multiple requests in parallel up to concurrent limit
      const availableSlots = this.config.globalRateLimit.maxConcurrent - this.activeRequests;
      const requestsToProcess = Math.min(availableSlots, this.globalQueue.length, 5);

      if (requestsToProcess > 0) {
        const requests = this.globalQueue.splice(0, requestsToProcess);
        
        for (const request of requests) {
          this.executeRequest(request);
        }
      }
    }, 200); // Check every 200ms for high responsiveness
  }

  /**
   * Execute individual request with retry logic
   */
  async executeRequest(request) {
    this.activeRequests++;
    const startTime = Date.now();

    try {
      // Track user request
      this.trackUserRequest(request.userId);
      
      // For full AP tests, don't apply adaptive batch sizing - we need the exact count
      const isFullAPTest = request.requestData.section === 'mcq' && request.requestData.numQuestions >= 45;
      
      if (!isFullAPTest) {
        // Adaptive batch sizing only for smaller requests
        const adjustedBatchSize = this.getAdaptiveBatchSize();
        if (request.requestData.numQuestions > adjustedBatchSize) {
          request.requestData.numQuestions = adjustedBatchSize;
        }
      }

      // Make the actual API call
      const result = await this.executeAPICall(request.requestData);
      
      // Track success
      this.metrics.totalRequests++;
      this.metrics.successfulRequests++;
      this.updateResponseTime(startTime);
      
      request.resolve(result);
      
      console.log(`✅ Request ${request.id} completed successfully`);
      
    } catch (error) {
      await this.handleRequestError(request, error, startTime);
    } finally {
      this.activeRequests--;
    }
  }

  /**
   * Handle request errors with intelligent retry
   */
  async handleRequestError(request, error, startTime) {
    request.attempts++;
    this.metrics.totalRequests++;
    this.metrics.failedRequests++;
    this.updateResponseTime(startTime);

    const isRateLimit = error.message.includes('429') || error.message.includes('Rate limit');
    const isServerError = error.message.includes('500') || error.message.includes('502') || error.message.includes('503');

    if (isRateLimit) {
      this.metrics.rateLimitHits++;
    }

    // Determine if we should retry
    const shouldRetry = request.attempts < this.config.retry.maxAttempts && 
                       (isRateLimit || isServerError);

    if (shouldRetry) {
      const delay = this.calculateRetryDelay(request.attempts, isRateLimit);
      
      console.log(`🔄 Request ${request.id} failed (attempt ${request.attempts}), retrying in ${delay/1000}s. Error: ${error.message}`);
      
      // Add back to queue after delay
      setTimeout(() => {
        this.addToQueue(request);
      }, delay);
      
    } else {
      // Generate fallback response for final failure
      console.log(`❌ Request ${request.id} failed permanently after ${request.attempts} attempts`);
      
      try {
        const fallbackResult = this.generateFallbackResponse(request.requestData);
        request.resolve(fallbackResult);
      } catch (fallbackError) {
        request.reject(new Error(`Request failed: ${error.message}. Unable to generate fallback content.`));
      }
    }
  }

  /**
   * Execute the actual API call
   */
  async executeAPICall(requestData) {
    let lastError = null;
    const maxRetries = Math.min(3, apiKeyManager.getTotalKeys());
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const apiUrl = apiKeyManager.getCurrentUrl();
        console.log(`🔑 API Manager attempt ${attempt + 1}/${maxRetries} using API key ${apiKeyManager.getCurrentKeyIndex() + 1}`);

        // Build optimized prompt
        const prompt = this.buildOptimizedPrompt(requestData);

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'User-Agent': 'ApexScholar/1.0'
          },
          body: JSON.stringify({
            contents: [{
              role: "user",
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4000, // Reduced for reliability
              candidateCount: 1,
              stopSequences: ["}\n]\n\n"]
            }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          
          if (response.status === 429) {
            console.log(`⚠️ Rate limit hit on API key ${apiKeyManager.getCurrentKeyIndex() + 1}, rotating...`);
            
            // Extract retry delay if available
            let retryAfter = 300;
            try {
              const errorData = JSON.parse(errorText);
              if (errorData.error && errorData.error.details) {
                const retryInfo = errorData.error.details.find(d => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo');
                if (retryInfo && retryInfo.retryDelay) {
                  retryAfter = parseInt(retryInfo.retryDelay.replace('s', '')) || 300;
                }
              }
            } catch (parseError) {
              console.log('Could not parse retry delay, using default');
            }
            
            apiKeyManager.markCurrentKeyFailed(retryAfter);
            lastError = new Error('Rate limit exceeded');
            continue;
          } else if (response.status === 403) {
            throw new Error('API access denied');
          } else if (response.status >= 500) {
            throw new Error(`Server error (${response.status})`);
          } else {
            throw new Error(`API request failed (${response.status})`);
          }
        }

        const result = await response.json();
        
        if (!result?.candidates?.[0]?.content?.parts?.[0]?.text) {
          throw new Error('Invalid API response structure');
        }

        console.log(`✅ API Manager request successful with API key ${apiKeyManager.getCurrentKeyIndex() + 1}`);
        return this.parseAPIResponse(result.candidates[0].content.parts[0].text, requestData);
        
      } catch (error) {
        console.error(`❌ API Manager error with API key ${apiKeyManager.getCurrentKeyIndex() + 1}:`, error.message);
        lastError = error;
        
        if (error.message.includes('Rate limit exceeded')) {
          continue;
        }
        
        if (attempt < maxRetries - 1) {
          apiKeyManager.rotateToNextKey();
        }
      }
    }
    
    console.error('❌ All API key attempts failed in API Manager');
    throw lastError || new Error('Failed to execute API call with any available API key');
  }

  /**
   * Build optimized prompt for better token efficiency
   */
  buildOptimizedPrompt(requestData) {
    const { subject, section, difficulty, numQuestions, selectedUnits, startId = 1 } = requestData;
    
    // Enhanced prompts for different question types
    let basePrompt = '';
    let formatInstructions = '';
    
    if (section === 'mcq') {
      basePrompt = `Create ${numQuestions} high-quality multiple choice questions for ${subject} (${difficulty} level).`;
      
      if (selectedUnits?.length > 0) {
        basePrompt += ` Focus on: ${selectedUnits.map(unit => unit.replace(/unit\s*\d+:?\s*/i, '')).join(', ')}.`;
      }
      
      // Add document requirement for MCQ
      basePrompt += ` Each question should reference a provided document (text, chart, graph, image description, or primary source). Group 2-4 consecutive questions around the same document.`;
      
      formatInstructions = `
Format as JSON array with this exact structure (use LaTeX for mathematical expressions):
[{
  "id": ${startId},
  "question": "[Question text with LaTeX if needed: $$\\\\frac{1}{2}$$]",
  "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
  "correctAnswer": 0,
  "explanation": "[Why correct answer is right]",
  "difficulty": "${difficulty}",
  "topic": "[Unit name: Topic]",
  "document": {
    "id": "Doc 1",
    "source": "[Source citation]",
    "content": "[Full actual document text/data - NOT a summary]"
  }
}]`;
      
    } else if (section === 'saq') {
      basePrompt = `Create ${numQuestions} Short Answer Questions for ${subject} (${difficulty} level). Each SAQ must have exactly 3 parts (a, b, c) and be worth 3 points total (1 point per part).`;
      
      if (selectedUnits?.length > 0) {
        basePrompt += ` Focus on: ${selectedUnits.map(unit => unit.replace(/unit\s*\d+:?\s*/i, '')).join(', ')}.`;
      }
      
      basePrompt += ` Include a primary source document for each SAQ.`;
      
      formatInstructions = `
SAQ requirements: 3 parts (a, b, c), 3 points total, with document.
Format as JSON array (use LaTeX for math if needed):
[{
  "id": ${startId},
  "question": "[Main prompt]",
  "parts": {
    "a": "[Part a question - 1 point]",
    "b": "[Part b question - 1 point]", 
    "c": "[Part c question - 1 point]"
  },
  "sampleAnswer": {
    "a": "[1-2 sentence response for part a]",
    "b": "[1-2 sentence response for part b]",
    "c": "[1-2 sentence response for part c]"
  },
  "points": 3,
  "rubric": {
    "totalPoints": 3,
    "pointBreakdown": "1 point per part (a, b, c)"
  },
  "explanation": "[What this tests]",
  "difficulty": "${difficulty}",
  "topic": "[Unit name: Topic]",
  "document": {
    "id": "Document",
    "source": "[Source citation with date]",
    "content": "[Full actual document text - NOT a summary]"
  }
}]`;
      
    } else if (section === 'dbq') {
      basePrompt = `Create ${numQuestions} Document-Based Question for ${subject} (${difficulty} level). Must include exactly 7 documents and be worth 7 points total.`;
      
      if (selectedUnits?.length > 0) {
        basePrompt += ` Focus on: ${selectedUnits.map(unit => unit.replace(/unit\s*\d+:?\s*/i, '')).join(', ')}.`;
      }
      
      basePrompt += ` Provide full, authentic historical documents - not summaries or descriptions.`;
      
      formatInstructions = `
DBQ requirements: 7 documents, 7 points total, with specific time period.
Format as JSON array (use LaTeX for math if needed):
[{
  "id": ${startId},
  "question": "[Essay question with specific time period in years, e.g., 1865-1920]",
  "documents": [
    {"id": "Document 1", "source": "[Author, Title, Date]", "content": "[Full actual document text - 2-3 paragraphs]"},
    {"id": "Document 2", "source": "[Author, Title, Date]", "content": "[Full actual document text - 2-3 paragraphs]"},
    {"id": "Document 3", "source": "[Author, Title, Date]", "content": "[Full actual document text - 2-3 paragraphs]"},
    {"id": "Document 4", "source": "[Author, Title, Date]", "content": "[Full actual document text - 2-3 paragraphs]"},
    {"id": "Document 5", "source": "[Author, Title, Date]", "content": "[Full actual document text - 2-3 paragraphs]"},
    {"id": "Document 6", "source": "[Author, Title, Date]", "content": "[Full actual document text - 2-3 paragraphs]"},
    {"id": "Document 7", "source": "[Author, Title, Date]", "content": "[Full actual document text - 2-3 paragraphs]"}
  ],
  "sampleAnswer": "[Comprehensive 5-paragraph essay with thesis, contextualization, document evidence from at least 6 documents, outside evidence, and analysis. Reference documents by number.]",
  "points": 7,
  "rubric": {
    "totalPoints": 7,
    "breakdown": ["Thesis (1pt)", "Contextualization (1pt)", "Evidence from Documents (3pts)", "Outside Evidence (1pt)", "Analysis (1pt)"]
  },
  "explanation": "[Historical thinking skill tested]",
  "difficulty": "${difficulty}",
  "topic": "[Unit name: Topic with specific years]"
}]`;
      
    } else if (section === 'leq') {
      basePrompt = `Create ${numQuestions} Long Essay Question for ${subject} (${difficulty} level). Must specify exact time period in years and be worth 6 points total.`;
      
      if (selectedUnits?.length > 0) {
        basePrompt += ` Focus on: ${selectedUnits.map(unit => unit.replace(/unit\s*\d+:?\s*/i, '')).join(', ')}.`;
      }
      
      formatInstructions = `
LEQ requirements: Specific time period in years, 6 points total.
Format as JSON array (use LaTeX for math if needed):
[{
  "id": ${startId},
  "question": "[Essay question with specific time period in years, e.g., 'Evaluate the extent to which...' from 1865 to 1920]",
  "sampleAnswer": "[Comprehensive essay with clear thesis, contextualization, specific evidence, and historical reasoning. 4-5 paragraphs.]",
  "points": 6,
  "rubric": {
    "totalPoints": 6,
    "breakdown": ["Thesis (1pt)", "Contextualization (1pt)", "Evidence (2pts)", "Analysis and Reasoning (2pts)"]
  },
  "explanation": "[Historical thinking skill tested]",
  "difficulty": "${difficulty}",
  "topic": "[Unit name: Topic with specific years]"
}]`;
      
    } else {
      // Enhanced FRQ for other subjects (especially math/science)
      let parts = 3; // Default parts
      let totalPoints = 9; // Default points per question
      
      // Subject-specific adjustments
      if (subject.includes('Calculus') || subject.includes('Statistics')) {
        parts = 4;
        totalPoints = 9;
      } else if (subject.includes('Physics') || subject.includes('Chemistry') || subject.includes('Biology')) {
        parts = 3;
        totalPoints = 10;
      }
      
      basePrompt = `Create ${numQuestions} ${section} questions for ${subject} (${difficulty} level). Each question must have exactly ${parts} parts and be worth ${totalPoints} points total.`;
      
      if (selectedUnits?.length > 0) {
        basePrompt += ` Focus on: ${selectedUnits.map(unit => unit.replace(/unit\s*\d+:?\s*/i, '')).join(', ')}.`;
      }
      
      basePrompt += ` Use LaTeX notation for all mathematical expressions. Design questions that may require graphing, calculations, or diagrams.`;
      
      formatInstructions = `
Format as JSON array (use LaTeX for ALL mathematical expressions):
[{
  "id": ${startId},
  "question": "[Main question with LaTeX: $$\\\\int_0^1 x^2 dx$$]",
  "parts": {
    ${Array.from({length: parts}, (_, i) => `"${String.fromCharCode(97 + i)}": "[Part ${String.fromCharCode(97 + i)} with LaTeX if needed]"`).join(',\n    ')}
  },
  "sampleAnswer": {
    ${Array.from({length: parts}, (_, i) => `"${String.fromCharCode(97 + i)}": "[Detailed solution for part ${String.fromCharCode(97 + i)} with LaTeX]"`).join(',\n    ')}
  },
  "points": ${totalPoints},
  "rubric": {
    "totalPoints": ${totalPoints},
    "pointBreakdown": "${Math.floor(totalPoints/parts)} points per part"
  },
  "explanation": "[What concept this tests]",
  "difficulty": "${difficulty}",
  "topic": "[Unit name: Topic]",
  "requiresDrawing": ${subject.includes('Calculus') || subject.includes('Physics') || subject.includes('Chemistry') || subject.includes('Biology')}
}]`;
    }

    const fullPrompt = basePrompt + formatInstructions + `\\n\\nReturn valid JSON only, no extra text.`;
    
    return fullPrompt;
  }

  /**
   * Parse API response with error recovery
   */
  parseAPIResponse(text, requestData) {
    try {
      // Clean the response
      let cleanedText = text.trim();
      
      // Remove common prefixes/suffixes
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      
      // Fix common JSON syntax issues
      cleanedText = cleanedText.replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
      cleanedText = cleanedText.replace(/([{,]\s*)(\w+):/g, '$1"$2":'); // Quote unquoted keys
      cleanedText = cleanedText.replace(/:\s*'([^']*)'/g, ': "$1"'); // Replace single quotes with double quotes
      
      // Parse JSON
      const questions = parseAIResponse(cleanedText, requestData.startId || 1);
      const questionArray = Array.isArray(questions) ? questions : [questions];
      
      console.log(`Parsed ${questionArray.length} questions from API response`);
      
      // Validate and clean questions with better error handling
      const validQuestions = questionArray.filter(q => q?.question).map((q, index) => {
        const questionId = q.id || (requestData.startId || 1) + index;
        
        const cleanQuestion = {
          id: questionId,
          type: requestData.section === 'mcq' ? 'mcq' : requestData.section,
          question: q.question,
          topic: q.topic || 'General Topic',
          difficulty: q.difficulty || requestData.difficulty,
          explanation: q.explanation || 'Explanation will be provided.',
        };

        // Add section-specific fields
        if (requestData.section === 'mcq') {
          cleanQuestion.options = q.options || ['A) Option A', 'B) Option B', 'C) Option C', 'D) Option D'];
          cleanQuestion.correctAnswer = typeof q.correctAnswer === 'number' ? q.correctAnswer : 0;
          cleanQuestion.document = q.document || null;
        } else {
          // For FRQ, SAQ, DBQ, LEQ
          cleanQuestion.sampleAnswer = q.sampleAnswer || q.sample_answer || 'Sample answer will be provided.';
          cleanQuestion.rubric = q.rubric || { totalPoints: 6, breakdown: ['Point 1', 'Point 2', 'Point 3'] };
          cleanQuestion.points = q.points || (
            requestData.section === 'saq' ? 3 :
            requestData.section === 'dbq' ? 7 :
            requestData.section === 'leq' ? 6 :
            9 // Default FRQ points
          );
          
          // Add section-specific fields
          if (requestData.section === 'saq') {
            cleanQuestion.parts = q.parts || { a: 'Part a', b: 'Part b', c: 'Part c' };
            cleanQuestion.document = q.document || null;
          } else if (requestData.section === 'dbq') {
            cleanQuestion.documents = q.documents || [];
          } else if (requestData.section === 'frq') {
            cleanQuestion.parts = q.parts || {};
            cleanQuestion.requiresDrawing = q.requiresDrawing || false;
          }
        }

        return cleanQuestion;
      });
      
      console.log(`Returning ${validQuestions.length} valid questions`);
      
      // Ensure we return the expected number of questions
      if (validQuestions.length < requestData.numQuestions) {
        console.warn(`Expected ${requestData.numQuestions} questions but only got ${validQuestions.length}`);
        
        // Generate fallback questions to fill the gap
        const missingCount = requestData.numQuestions - validQuestions.length;
        const startId = (requestData.startId || 1) + validQuestions.length;
        
        for (let i = 0; i < missingCount; i++) {
          const fallbackQuestion = {
            id: startId + i,
            type: requestData.section === 'mcq' ? 'mcq' : requestData.section,
            question: `Fallback question ${startId + i} for ${requestData.subject}`,
            topic: 'Review',
            difficulty: requestData.difficulty,
            explanation: 'This is a fallback question due to generation issues.',
          };
          
          if (requestData.section === 'mcq') {
            fallbackQuestion.options = ['A) Option A', 'B) Option B', 'C) Option C', 'D) Option D'];
            fallbackQuestion.correctAnswer = 0;
          } else {
            fallbackQuestion.sampleAnswer = 'Sample answer for fallback question.';
            fallbackQuestion.points = requestData.section === 'saq' ? 3 : requestData.section === 'dbq' ? 7 : requestData.section === 'leq' ? 6 : 9;
            fallbackQuestion.rubric = { totalPoints: fallbackQuestion.points, breakdown: ['Point 1', 'Point 2', 'Point 3'] };
          }
          
          validQuestions.push(fallbackQuestion);
        }
      }
      
      return validQuestions;
      
    } catch (error) {
      console.error('Failed to parse API response:', error);
      console.error('Raw response text:', text);
      
      // Generate complete fallback response
      const fallbackQuestions = [];
      const numQuestions = requestData.numQuestions || 1;
      const startId = requestData.startId || 1;
      
      for (let i = 0; i < numQuestions; i++) {
        const questionId = startId + i;
        const fallbackQuestion = {
          id: questionId,
          type: requestData.section === 'mcq' ? 'mcq' : requestData.section,
          question: `Fallback question ${questionId} for ${requestData.subject} (parsing error)`,
          topic: 'Review',
          difficulty: requestData.difficulty,
          explanation: 'This is a fallback question due to parsing issues.',
        };
        
        if (requestData.section === 'mcq') {
          fallbackQuestion.options = ['A) Option A', 'B) Option B', 'C) Option C', 'D) Option D'];
          fallbackQuestion.correctAnswer = 0;
        } else {
          fallbackQuestion.sampleAnswer = 'Sample answer for fallback question.';
          fallbackQuestion.points = requestData.section === 'saq' ? 3 : requestData.section === 'dbq' ? 7 : requestData.section === 'leq' ? 6 : 9;
          fallbackQuestion.rubric = { totalPoints: fallbackQuestion.points, breakdown: ['Point 1', 'Point 2', 'Point 3'] };
        }
        
        fallbackQuestions.push(fallbackQuestion);
      }
      
      console.log(`Generated ${fallbackQuestions.length} fallback questions`);
      return fallbackQuestions;
    }
  }

  /**
   * Generate fallback response when all retries fail
   */
  generateFallbackResponse(requestData) {
    const { subject, section, numQuestions } = requestData;
    const fallbackQuestions = [];

    for (let i = 0; i < numQuestions; i++) {
      if (section === 'mcq') {
        fallbackQuestions.push({
          id: i + 1,
          type: 'mcq',
          question: `${subject} practice question ${i + 1}. (Generated offline - limited functionality)`,
          options: [
            'A) Option A',
            'B) Option B', 
            'C) Option C',
            'D) Option D'
          ],
          correctAnswer: 0,
          explanation: 'This is an offline-generated question. For full AI-powered content, please try again when connectivity improves.',
          difficulty: 'Standard',
          topic: 'Review'
        });
      } else {
        fallbackQuestions.push({
          id: i + 1,
          type: 'frq',
          question: `${subject} essay question ${i + 1}. (Generated offline - limited functionality)`,
          sampleAnswer: 'Sample response would be provided with full AI functionality.',
          rubric: ['Thesis statement', 'Supporting evidence', 'Analysis and reasoning'],
          explanation: 'This is an offline-generated question.',
          difficulty: 'Standard',
          topic: 'Review'
        });
      }
    }

    return fallbackQuestions;
  }

  /**
   * Check if user is rate limited
   */
  isUserRateLimited(userId) {
    const userHistory = this.userRequests.get(userId);
    if (!userHistory) return false;

    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Clean old requests
    userHistory.requests = userHistory.requests.filter(req => req.timestamp > oneMinuteAgo);
    
    // Check burst limit (rapid requests)
    const recentRequests = userHistory.requests.filter(req => req.timestamp > now - 10000); // Last 10 seconds
    if (recentRequests.length >= this.config.userRateLimit.burstLimit) {
      return true;
    }
    
    // Check per-minute limit
    return userHistory.requests.length >= this.config.userRateLimit.requestsPerMinute;
  }

  /**
   * Calculate wait time for rate limited user
   */
  calculateUserWaitTime(userId) {
    const userHistory = this.userRequests.get(userId);
    if (!userHistory || userHistory.requests.length === 0) return 0;

    const oldestRequest = userHistory.requests[0];
    const waitUntil = oldestRequest.timestamp + 60000; // 1 minute from oldest request
    return Math.max(0, waitUntil - Date.now());
  }

  /**
   * Track user request for rate limiting
   */
  trackUserRequest(userId) {
    if (!this.userRequests.has(userId)) {
      this.userRequests.set(userId, { requests: [] });
    }
    
    const userHistory = this.userRequests.get(userId);
    userHistory.requests.push({ timestamp: Date.now() });
  }

  /**
   * Get adaptive batch size based on success rate
   */
  getAdaptiveBatchSize() {
    if (this.requestHistory.length < 10) {
      return 15; // Increased from config.batching.maxBatchSize for full tests
    }

    const recentRequests = this.requestHistory.slice(-20);
    const successRate = recentRequests.filter(r => r.success).length / recentRequests.length;

    if (successRate > 0.9) {
      return 20; // Allow larger batches for high success rate
    } else if (successRate > 0.7) {
      return 15; // Increased from config.batching.maxBatchSize
    } else {
      return Math.max(10, 5); // Minimum of 10 instead of 3
    }
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  calculateRetryDelay(attempt, isRateLimit) {
    let baseDelay = this.config.retry.baseDelay;
    
    if (isRateLimit) {
      baseDelay = 5000; // Start with 5 seconds for rate limits
    }
    
    const delay = Math.min(
      baseDelay * Math.pow(this.config.retry.exponentialBase, attempt - 1),
      this.config.retry.maxDelay
    );
    
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 1000;
    return delay + jitter;
  }

  /**
   * Update response time metrics
   */
  updateResponseTime(startTime) {
    const responseTime = Date.now() - startTime;
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + responseTime) / 
      this.metrics.totalRequests;
  }

  /**
   * Generate unique request ID
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup old tracking data
   */
  cleanup() {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;

    // Cleanup user request history
    for (const [userId, userHistory] of this.userRequests.entries()) {
      userHistory.requests = userHistory.requests.filter(req => req.timestamp > fiveMinutesAgo);
      if (userHistory.requests.length === 0) {
        this.userRequests.delete(userId);
      }
    }

    // Cleanup global request history
    this.requestHistory = this.requestHistory.filter(req => req.timestamp > fiveMinutesAgo);
  }

  /**
   * Get system status and metrics
   */
  getSystemStatus() {
    return {
      queueLength: this.globalQueue.length,
      activeRequests: this.activeRequests,
      totalUsers: this.userRequests.size,
      metrics: { ...this.metrics },
      config: { ...this.config }
    };
  }
}

// Create singleton instance
const apiManager = new APIManager();

export default apiManager;
