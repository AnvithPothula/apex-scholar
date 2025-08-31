import apiKeyManager from './APIKeyManager';

class GeminiService {
  constructor() {
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  }

  async generateContent(prompt, options = {}) {
    let lastError = null;
    const maxRetries = Math.min(3, apiKeyManager.getTotalKeys()); // Try up to 3 keys or all available keys
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const apiUrl = apiKeyManager.getCurrentUrl();
        console.log(`🔑 Attempt ${attempt + 1}/${maxRetries} using API key ${apiKeyManager.getCurrentKeyIndex() + 1}`);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: options.temperature || 0.7,
              topK: options.topK || 40,
              topP: options.topP || 0.95,
              maxOutputTokens: options.maxOutputTokens || 2048,
            }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          
          // Handle rate limiting specifically
          if (response.status === 429) {
            console.log(`⚠️ Rate limit hit on API key ${apiKeyManager.getCurrentKeyIndex() + 1}, rotating to next key...`);
            
            // Extract retry delay from error if available
            let retryAfter = 300; // Default 5 minutes
            try {
              const errorData = JSON.parse(errorText);
              if (errorData.error && errorData.error.details) {
                const retryInfo = errorData.error.details.find(d => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo');
                if (retryInfo && retryInfo.retryDelay) {
                  const delay = retryInfo.retryDelay;
                  retryAfter = parseInt(delay.replace('s', '')) || 300;
                }
              }
            } catch (parseError) {
              console.log('Could not parse retry delay, using default');
            }
            
            apiKeyManager.markCurrentKeyFailed(retryAfter);
            lastError = new Error(`Rate limit exceeded: ${errorText}`);
            continue; // Try next key
          }
          
          throw new Error(`Gemini API failed: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        
        if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
          throw new Error('Invalid API response structure');
        }

        console.log(`✅ Request successful with API key ${apiKeyManager.getCurrentKeyIndex() + 1}`);
        return result.candidates[0].content.parts[0].text;
        
      } catch (error) {
        console.error(`❌ Error with API key ${apiKeyManager.getCurrentKeyIndex() + 1}:`, error.message);
        lastError = error;
        
        // If it's a rate limit error, we already handled it above
        if (error.message.includes('Rate limit exceeded')) {
          continue;
        }
        
        // For other errors, try rotating to next key
        if (attempt < maxRetries - 1) {
          apiKeyManager.rotateToNextKey();
        }
      }
    }
    
    // If all attempts failed, throw the last error
    console.error('❌ All API key attempts failed');
    throw lastError || new Error('Failed to generate content with any available API key');
  }

  async generateWithImages(prompt, images = [], options = {}) {
    let lastError = null;
    const maxRetries = Math.min(3, apiKeyManager.getTotalKeys());
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const apiUrl = apiKeyManager.getCurrentUrl();
        console.log(`🔑 Image generation attempt ${attempt + 1}/${maxRetries} using API key ${apiKeyManager.getCurrentKeyIndex() + 1}`);
        
        const parts = [{ text: prompt }];
        
        // Add images to the request
        images.forEach(image => {
          parts.push({
            inline_data: {
              mime_type: image.mimeType || 'image/jpeg',
              data: image.data
            }
          });
        });

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: parts
            }],
            generationConfig: {
              temperature: options.temperature || 0.7,
              topK: options.topK || 40,
              topP: options.topP || 0.95,
              maxOutputTokens: options.maxOutputTokens || 2048,
            }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          
          // Handle rate limiting
          if (response.status === 429) {
            console.log(`⚠️ Rate limit hit on API key ${apiKeyManager.getCurrentKeyIndex() + 1} for image generation, rotating...`);
            apiKeyManager.markCurrentKeyFailed();
            lastError = new Error(`Rate limit exceeded: ${errorText}`);
            continue;
          }
          
          throw new Error(`Gemini API failed: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        
        if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
          throw new Error('Invalid API response structure');
        }

        console.log(`✅ Image generation successful with API key ${apiKeyManager.getCurrentKeyIndex() + 1}`);
        return result.candidates[0].content.parts[0].text;
        
      } catch (error) {
        console.error(`❌ Image generation error with API key ${apiKeyManager.getCurrentKeyIndex() + 1}:`, error.message);
        lastError = error;
        
        if (error.message.includes('Rate limit exceeded')) {
          continue;
        }
        
        if (attempt < maxRetries - 1) {
          apiKeyManager.rotateToNextKey();
        }
      }
    }
    
    console.error('❌ All API key attempts failed for image generation');
    throw lastError || new Error('Failed to generate content with images using any available API key');
  }

  // Specialized methods for different features
  async generateFlashcards(subject, topic, count = 20, difficulty = 'medium') {
    const prompt = `Create ${count} high-quality flashcards for ${subject} - ${topic}.

Requirements:
- Difficulty level: ${difficulty}
- Focus on key concepts, formulas, and important facts
- Each card should have a clear, concise question and comprehensive answer
- Include relevant examples where appropriate
- Use LaTeX notation for mathematical expressions (e.g., $x^2$ for inline math, $$\\frac{a}{b}$$ for block math)
- Format as JSON array with objects containing "question" and "answer" fields

Return ONLY the JSON array, no additional text or formatting.`;

    const response = await this.generateContent(prompt, { temperature: 0.8 });
    
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Error parsing flashcards JSON:', error);
      // Fallback: create basic flashcards
      return this.createFallbackFlashcards(subject, topic, count);
    }
  }

  async solveProblem(problemText, subject = '', imageData = null) {
    let prompt = `Solve this ${subject} problem step by step:

${problemText}

IMPORTANT: Use LaTeX formatting for all mathematical expressions. Wrap inline math with single dollar signs $...$ and block math with double dollar signs $$...$$.

Provide:
1. Problem identification and type
2. Step-by-step solution with explanations (use LaTeX for all math)
3. Final answer (use LaTeX for mathematical expressions)
4. Key concepts used
5. Common mistakes to avoid

Format as JSON with fields: problemType, steps (array of {step, title, content, explanation}), finalAnswer, concepts, commonMistakes

Example LaTeX formatting:
- Inline: "The derivative of $f(x) = x^2$ is $f'(x) = 2x$"
- Block: "$$\\int_{0}^{1} x^2 dx = \\frac{1}{3}$$"`;

    if (imageData) {
      return await this.generateWithImages(prompt, [imageData]);
    } else {
      return await this.generateContent(prompt, { temperature: 0.3 });
    }
  }

  async generateDiagnosticQuestions(subject, topic, difficulty = 'medium', count = 10) {
    const prompt = `Generate ${count} diagnostic multiple-choice questions for ${subject} - ${topic}.

Requirements:
- Difficulty: ${difficulty}
- Focus on identifying student understanding and common misconceptions
- Each question should test different aspects of the topic
- Include 4 answer choices with one correct answer
- Provide explanations for why each choice is correct or incorrect

Format as JSON array with objects containing:
- question: the question text
- choices: array of 4 answer choices
- correctAnswer: index of correct choice (0-3)
- explanations: array of explanations for each choice
- concept: main concept being tested

Return ONLY the JSON array.`;

    const response = await this.generateContent(prompt, { temperature: 0.7 });
    
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Error parsing diagnostic questions JSON:', error);
      return this.createFallbackDiagnosticQuestions(subject, topic, count);
    }
  }

  async analyzeStudentProgress(subjects, activities, weakAreas = []) {
    const prompt = `Analyze this student's learning progress and provide personalized recommendations:

Subjects studied: ${subjects.join(', ')}
Recent activities: ${JSON.stringify(activities)}
Identified weak areas: ${weakAreas.join(', ')}

Provide analysis with:
1. Overall progress assessment
2. Strengths and areas for improvement
3. Specific study recommendations
4. Suggested next steps
5. Time allocation advice

Format as JSON with fields: overallProgress, strengths, weaknesses, recommendations, nextSteps, timeAllocation`;

    const response = await this.generateContent(prompt, { temperature: 0.6 });
    
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Error parsing progress analysis JSON:', error);
      return this.createFallbackProgressAnalysis();
    }
  }

  // Fallback methods for when AI generation fails
  createFallbackFlashcards(subject, topic, count) {
    const flashcards = [];
    for (let i = 0; i < Math.min(count, 10); i++) {
      flashcards.push({
        question: `${subject} ${topic} - Question ${i + 1}`,
        answer: `This is a sample answer for ${topic} concept ${i + 1}. The AI generation failed, but this ensures the app continues working.`
      });
    }
    return flashcards;
  }

  createFallbackDiagnosticQuestions(subject, topic, count) {
    const questions = [];
    for (let i = 0; i < Math.min(count, 5); i++) {
      questions.push({
        question: `Sample ${subject} question about ${topic} ${i + 1}`,
        choices: [
          `Option A for question ${i + 1}`,
          `Option B for question ${i + 1}`,
          `Option C for question ${i + 1}`,
          `Option D for question ${i + 1}`
        ],
        correctAnswer: 0,
        explanations: [
          "This is the correct answer",
          "This is incorrect because...",
          "This is incorrect because...",
          "This is incorrect because..."
        ],
        concept: `${topic} Concept ${i + 1}`
      });
    }
    return questions;
  }

  createFallbackProgressAnalysis() {
    return {
      overallProgress: "Good progress shown across subjects",
      strengths: ["Consistent study habits", "Good problem-solving approach"],
      weaknesses: ["Need more practice in specific areas"],
      recommendations: ["Continue regular practice", "Focus on weak areas"],
      nextSteps: ["Take more practice tests", "Review challenging topics"],
      timeAllocation: "Spend 60% time on weak areas, 40% on review"
    };
  }
}

const geminiServiceInstance = new GeminiService();
export default geminiServiceInstance;
