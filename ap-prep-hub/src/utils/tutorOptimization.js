// Performance tracking and optimization utilities for AI tutoring system

const FAST_RESPONSE_THRESHOLD = 1.0; // seconds

export class TutorPerformanceTracker {
  constructor() {
    this.responseMetrics = new Map();
    this.averageResponseTime = 0;
    this.totalResponses = 0;
    this.fastResponseCount = 0; // Responses under FAST_RESPONSE_THRESHOLD seconds
  }

  startTracking(requestId) {
    this.responseMetrics.set(requestId, {
      startTime: performance.now(),
      subject: null,
      questionLength: 0,
      hasFiles: false
    });
  }

  updateRequestInfo(requestId, subject, questionLength, hasFiles = false) {
    const metric = this.responseMetrics.get(requestId);
    if (metric) {
      metric.subject = subject;
      metric.questionLength = questionLength;
      metric.hasFiles = hasFiles;
    }
  }

  endTracking(requestId, success = true) {
    const metric = this.responseMetrics.get(requestId);
    if (!metric) return null;

    const endTime = performance.now();
    const responseTime = (endTime - metric.startTime) / 1000;
    
    // Update running statistics
    this.totalResponses++;
    if (responseTime < FAST_RESPONSE_THRESHOLD) {
      this.fastResponseCount++;
    }
    this.averageResponseTime = (this.averageResponseTime * (this.totalResponses - 1) + responseTime) / this.totalResponses;

    const result = {
      ...metric,
      responseTime,
      success,
      endTime: endTime,
      isFast: responseTime < FAST_RESPONSE_THRESHOLD
    };

    // Clean up
    this.responseMetrics.delete(requestId);
    
    return result;
  }

  getPerformanceStats() {
    return {
      averageResponseTime: this.averageResponseTime,
      totalResponses: this.totalResponses,
      fastResponseRate: this.totalResponses > 0 ? this.fastResponseCount / this.totalResponses : 0,
      fastResponseCount: this.fastResponseCount,
      currentActiveRequests: this.responseMetrics.size
    };
  }

  // Get optimization suggestions based on performance
  getOptimizationSuggestions() {
    const stats = this.getPerformanceStats();
    const suggestions = [];

    if (stats.averageResponseTime > 2.0) {
      suggestions.push("Consider reducing prompt complexity for faster responses");
    }
    
    if (stats.fastResponseRate < 0.7) {
      suggestions.push("Try shorter questions or break complex topics into smaller parts");
    }
    
    if (stats.averageResponseTime > 1.5) {
      suggestions.push("Enable response caching for frequently asked questions");
    }

    return suggestions;
  }
}

// Optimized prompt generation for faster, accurate responses
export const generateOptimizedPrompt = (subject, question, curriculumContext, fileContext = '') => {
  // Input validation
  if (typeof subject !== 'string' || subject.trim() === '') {
    throw new Error('Invalid subject: must be a non-empty string.');
  }
  if (typeof question !== 'string' || question.trim() === '') {
    throw new Error('Invalid question: must be a non-empty string.');
  }
  // Determine prompt complexity based on question characteristics
  const isSimpleQuestion = question.length < 100 && !question.includes('explain in detail') && !question.includes('comprehensive');
  const isExamPrep = question.toLowerCase().includes('exam') || question.toLowerCase().includes('test') || question.toLowerCase().includes('ap');
  
  if (isSimpleQuestion) {
    // Streamlined prompt for quick responses
    return `You are an expert AP ${subject} tutor. Answer concisely and accurately.

Question: "${question}"
${fileContext}

Give a clear, direct answer focusing on the key concept:`;
  } else if (isExamPrep) {
    // Exam-focused prompt with essential curriculum info
    const essentialContext = curriculumContext.split('\n').slice(0, 10).join('\n');
    return `You are an expert AP ${subject} tutor specializing in exam preparation.

${essentialContext}

Question: "${question}"
${fileContext}

Provide an exam-focused response covering:
1. Core concept explanation
2. Key points for the AP exam
3. Common mistakes to avoid

Response:`;
  } else {
    // Full detailed prompt for complex questions
    return `You are an expert AP ${subject} tutor. Provide comprehensive, accurate explanations.

${curriculumContext}

Question: "${question}"
${fileContext}

Provide a thorough response that:
1. Addresses the question directly
2. Uses official AP curriculum concepts
3. Includes relevant examples
4. Connects to broader course themes

Response:`;
  }
};

// Response optimization configurations for different scenarios
export const getOptimizedGenerationConfig = (question, hasFiles = false) => {
  // Input validation
  if (typeof question !== 'string' || question.trim() === '') {
    throw new Error('Invalid question: must be a non-empty string.');
  }
  const questionLength = question.length;
  const isSimple = questionLength < 100;
  const isComplex = questionLength > 300 || hasFiles;

  if (isSimple) {
    // Optimize for speed
    return {
      temperature: 0.2,
      topK: 10,
      topP: 0.7,
      maxOutputTokens: 400,
      candidateCount: 1
    };
  } else if (isComplex) {
    // Optimize for accuracy and completeness
    return {
      temperature: 0.4,
      topK: 30,
      topP: 0.9,
      maxOutputTokens: 1200,
      candidateCount: 1
    };
  } else {
    // Balanced configuration
    return {
      temperature: 0.3,
      topK: 20,
      topP: 0.8,
      maxOutputTokens: 800,
      candidateCount: 1
    };
  }
};

// Smart caching for frequently asked questions
export class QuestionCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.hitCount = 0;
    this.missCount = 0;
  }

  generateKey(subject, question) {
      // Input validation
      if (typeof subject !== 'string' || subject.trim() === '') {
        throw new Error('Invalid subject: must be a non-empty string.');
      }
      if (typeof question !== 'string' || question.trim() === '') {
        throw new Error('Invalid question: must be a non-empty string.');
      }
      // Normalize question for better cache hits
      const normalizedQuestion = question.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      return `${subject}:${normalizedQuestion}`;
    }

  get(subject, question) {
    const key = this.generateKey(subject, question);
    const cached = this.cache.get(key);
    
    if (cached) {
      this.hitCount++;
      // Move to end (LRU)
      this.cache.delete(key);
      this.cache.set(key, cached);
      return cached;
    }
    
    this.missCount++;
    return null;
  }

  set(subject, question, response, responseTime) {
    const key = this.generateKey(subject, question);
    
    // Only cache successful fast responses to similar questions
    if (responseTime > 3.0) return; // Don't cache slow responses
    
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry (LRU)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      response,
      responseTime,
      timestamp: Date.now(),
      subject
    });
  }

  getCacheStats() {
    const totalRequests = this.hitCount + this.missCount;
    return {
      hitRate: totalRequests > 0 ? this.hitCount / totalRequests : 0,
      totalHits: this.hitCount,
      totalMisses: this.missCount,
      cacheSize: this.cache.size,
      maxSize: this.maxSize
    };
  }

  clear() {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }
}

// Global instances
export const performanceTracker = new TutorPerformanceTracker();
export const questionCache = new QuestionCache();

// Utility function to determine if a cached response is still valid
export const isCacheValid = (cachedEntry, maxAgeMs = 24 * 60 * 60 * 1000) => {
  if (!cachedEntry) return false;
  return (Date.now() - cachedEntry.timestamp) < maxAgeMs;
};
