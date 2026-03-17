import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Camera, Brain, ChevronRight, CheckCircle, Clock } from 'lucide-react';
import { Button, Card, Badge, Textarea } from '../components/ui/UIComponents';
import CustomDropdown from '../components/ui/CustomDropdown';
import { useAuth } from '../contexts/AuthContext';
import { AP_SUBJECTS } from '../constants/subjects';
import geminiService, { RateLimitError } from '../services/geminiService';
import dataService from '../services/dataService';
import MarkdownRenderer from '../components/MarkdownRenderer';
import ModelSelector, { getDefaultModel, saveSelectedModel } from '../components/ui/ModelSelector';
import 'katex/dist/katex.min.css';

const SUBJECT_BORDER_COLORS = {
  'AP Biology': 'border-l-green-500',
  'AP Chemistry': 'border-l-purple-500',
  'AP Physics 1': 'border-l-blue-500',
  'AP Physics 2': 'border-l-blue-400',
  'AP Physics C: Mechanics': 'border-l-blue-600',
  'AP Physics C: Electricity and Magnetism': 'border-l-blue-300',
  'AP Calculus AB': 'border-l-orange-500',
  'AP Calculus BC': 'border-l-orange-400',
  'AP Statistics': 'border-l-red-500',
  'AP Computer Science A': 'border-l-cyan-500',
  'AP Computer Science Principles': 'border-l-cyan-400',
  'AP Environmental Science': 'border-l-emerald-500',
  'AP Psychology': 'border-l-pink-500',
  'AP US History': 'border-l-amber-500',
  'AP World History': 'border-l-amber-400',
  'AP European History': 'border-l-amber-600',
  'AP English Language': 'border-l-indigo-500',
  'AP English Literature': 'border-l-indigo-400',
  'AP Art History': 'border-l-rose-500',
  'AP Macroeconomics': 'border-l-teal-500',
  'AP Microeconomics': 'border-l-teal-400',
  'AP US Government': 'border-l-slate-400',
  'AP Comparative Government': 'border-l-slate-500',
  'General': 'border-l-gray-500',
};

const SolverPage = () => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [solution, setSolution] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [selectedModel, setSelectedModel] = useState(getDefaultModel);

  const loadSolverHistory = useCallback(async () => {
    try {
      const history = await dataService.getUserSolverHistory(user.uid);
      setAnalysisHistory(history.map(item => ({
        ...item,
        timestamp: item.timestamp ? new Date(item.timestamp.seconds * 1000).toLocaleDateString() : 'Unknown',
        solved: true
      })));
    } catch (error) {
      console.error('Error loading solver history:', error);
    }
  }, [user]);

  // Load user's solver history on component mount
  useEffect(() => {
    if (user) {
      loadSolverHistory();
    }
  }, [user, loadSolverHistory]);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        alert('Failed to read the image file. Please try again.');
      };
      reader.readAsDataURL(file);
    }
    // Reset the input value so the same file can be selected again
    if (event.target) {
      event.target.value = '';
    }
  };

  const triggerImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const convertImageToBase64 = (imageDataUrl) => {
    // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
    const base64String = imageDataUrl.split(',')[1];
    const mimeType = imageDataUrl.split(';')[0].split(':')[1];

    return {
      data: base64String,
      mimeType: mimeType
    };
  };

  const handleSolve = async () => {
    if (!selectedImage && !questionText) return;
    if (!user) {
      alert('Please sign in to use the AI Solver');
      return;
    }

    setIsAnalyzing(true);

    try {
      let solutionText;
      const subjectName = selectedSubject ? AP_SUBJECTS[selectedSubject]?.name || selectedSubject : '';

      // Sanitize user input to prevent prompt injection
      const sanitizedQuestion = geminiService.sanitizeInput(questionText, { maxLength: 5000 });

      // Build the structured prompt for JSON output
      const buildSolverPrompt = (problem, hasImage) => `Solve this ${subjectName || 'math'} problem step by step.

${hasImage ? 'The image shows a problem. ' : ''}${problem ? `Problem text: ${problem}` : 'Analyze the problem shown in the image.'}

IMPORTANT: Use LaTeX formatting for all mathematical expressions using dollar signs: $x^2$ for inline, $$\\frac{a}{b}$$ for block math.

Return ONLY valid JSON (no code fences, no extra text) with this exact structure:
{
  "problemType": "string describing the type",
  "steps": [
    {"step": 1, "title": "Step Title", "content": "What was done (use $LaTeX$ for math)", "explanation": "Why this step"}
  ],
  "finalAnswer": "The final answer with $LaTeX$ if needed",
  "concepts": ["concept1", "concept2"],
  "commonMistakes": ["mistake1"],
  "difficulty": "Easy|Medium|Hard",
  "timeToSolve": "X-Y minutes"
}`;

      if (selectedImage && sanitizedQuestion) {
        // Both image and text provided
        const imageData = convertImageToBase64(selectedImage);
        solutionText = await geminiService.generateWithImages(
          buildSolverPrompt(sanitizedQuestion, true),
          [imageData]
        );
      } else if (selectedImage) {
        // Only image provided
        const imageData = convertImageToBase64(selectedImage);
        solutionText = await geminiService.generateWithImages(
          buildSolverPrompt('', true),
          [imageData]
        );
      } else {
        // Only text provided - sanitizedQuestion is already prepared
        solutionText = await geminiService.solveProblem(sanitizedQuestion, subjectName);
      }

      // Try to parse JSON response, fallback to text parsing
      const extractJson = (txt) => {
        if (!txt) return null;

        // Prefer fenced json blocks
        const fenced = txt.match(/```json\s*([\s\S]*?)```/i);
        if (fenced && fenced[1]) {
          try { return JSON.parse(fenced[1]); } catch(_) {}
        }

        // Remove any code fences for parsing
        let stripped = txt.replace(/```[\s\S]*?```/g, (m) => {
          const inner = m.replace(/^```[a-z]*\n?/i,'').replace(/```$/,'');
          return inner;
        });

        // Try to find a complete JSON object by matching braces
        const firstBrace = stripped.indexOf('{');
        if (firstBrace === -1) return null;

        // Count braces to find the matching closing brace
        let braceCount = 0;
        let inString = false;
        let escapeNext = false;
        let endIdx = -1;

        for (let i = firstBrace; i < stripped.length; i++) {
          const char = stripped[i];

          if (escapeNext) {
            escapeNext = false;
            continue;
          }

          if (char === '\\') {
            escapeNext = true;
            continue;
          }

          if (char === '"' && !escapeNext) {
            inString = !inString;
            continue;
          }

          if (!inString) {
            if (char === '{') braceCount++;
            if (char === '}') {
              braceCount--;
              if (braceCount === 0) {
                endIdx = i;
                break;
              }
            }
          }
        }

        if (endIdx !== -1) {
          const candidate = stripped.slice(firstBrace, endIdx + 1);
          try {
            return JSON.parse(candidate);
          } catch(e) {
            // Try to fix common JSON issues
            try {
              const fixed = candidate
                .replace(/,\s*}/g, '}')  // Remove trailing commas before }
                .replace(/,\s*]/g, ']')  // Remove trailing commas before ]
                .replace(/\n/g, ' ')     // Replace newlines with spaces
                .replace(/\t/g, ' ');    // Replace tabs with spaces
              return JSON.parse(fixed);
            } catch(_) {}
          }
        }

        // Last resort: try to parse the whole thing
        try {
          return JSON.parse(stripped.trim());
        } catch(_) {}

        return null;
      };
      let parsedSolution;

      // Try geminiService's robust JSON parsing first
      const jsonResult = geminiService.parseJSON(solutionText, false);
      if (jsonResult.success && jsonResult.data) {
        parsedSolution = jsonResult.data;
        console.log('[Solver] Parsed solution with geminiService.parseJSON');
      } else {
        // Fall back to local extraction
        try {
          const obj = extractJson(solutionText);
          if (obj) {
            parsedSolution = obj;
          } else {
            throw new Error('No JSON found');
          }
        } catch (parseError) {
          // Fallback: create solution from text
          parsedSolution = parseTextSolution(solutionText, questionText, subjectName);
        }
      }

      // Ensure parsed solution has required display fields
      if (!parsedSolution.question) parsedSolution.question = questionText || 'Problem from uploaded image';
      if (!parsedSolution.subject) parsedSolution.subject = subjectName || 'General';

      setSolution(parsedSolution);

      // Update local history immediately (don't wait for Firebase)
      const newItem = {
        id: Date.now(),
        subject: subjectName || "General",
        question: questionText || "Problem from uploaded image",
        timestamp: 'Just now',
        solved: true,
        solution: parsedSolution
      };
      setAnalysisHistory(prev => [newItem, ...prev]);

      // Save to history in background (don't block UI on Firebase errors)
      dataService.saveSolverHistory(user.uid, {
        question: questionText || "Problem from uploaded image",
        subject: subjectName || "General",
        solution: parsedSolution,
        hasImage: !!selectedImage,
        solved: true
      }).catch(saveError => {
        console.warn('Could not save to history (will retry later):', saveError.message);
      });

    } catch (error) {
      console.error('Error analyzing problem:', error);

      // Check for rate limit error
      if (error instanceof RateLimitError || error.isRateLimit ||
          (error.message && (error.message.includes('rate') || error.message.includes('quota') || error.message.includes('429')))) {
        const waitTime = error.retryAfter || 60;
        alert(`AI service is temporarily unavailable due to high demand. Please wait ${waitTime} seconds and try again.`);
      } else {
        alert('Failed to analyze the problem. Please try again.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const parseTextSolution = (text, question, subject) => {
    // Clean up the text - remove JSON-like fragments and code fences
    let cleanText = text
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/^[\s\S]*?"problemType"[\s\S]*?{/g, '') // Remove JSON preamble
      .replace(/^\s*[{}[\]",:]+\s*$/gm, '') // Remove lines with only JSON syntax
      .replace(/"[a-zA-Z]+"\s*:/g, '') // Remove JSON keys
      .replace(/^\s*\{/gm, '')
      .replace(/\}\s*$/gm, '')
      .trim();

    // Split into meaningful lines
    const lines = cleanText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 10) // Only keep substantial lines
      .filter(line => !/^[{}[\]",:\d]+$/.test(line)); // Remove JSON fragments

    // Try to find step-like content
    const steps = [];
    let currentStep = { content: '', explanation: '' };
    let stepNum = 1;

    for (const line of lines) {
      // Check for step indicators
      if (/^(step\s*\d|^\d+\.|analysis|solution|answer|conclusion)/i.test(line)) {
        if (currentStep.content) {
          steps.push({
            step: stepNum++,
            title: `Step ${stepNum - 1}`,
            content: currentStep.content,
            explanation: currentStep.explanation || 'Working through the problem'
          });
        }
        currentStep = { content: line, explanation: '' };
      } else {
        currentStep.content += (currentStep.content ? ' ' : '') + line;
      }
    }

    // Push the last step
    if (currentStep.content) {
      steps.push({
        step: stepNum,
        title: `Step ${stepNum}`,
        content: currentStep.content,
        explanation: 'Completing the solution'
      });
    }

    // If no steps found, create a simple structure
    if (steps.length === 0) {
      const allContent = lines.join(' ') || text.slice(0, 500);
      steps.push({
        step: 1,
        title: "Solution",
        content: allContent || "Solution provided",
        explanation: "AI-generated solution"
      });
    }

    // Find the final answer
    const finalAnswerMatch = text.match(/final\s*answer[:\s]*([^"}\n]+)/i);
    const finalAnswer = finalAnswerMatch
      ? finalAnswerMatch[1].trim()
      : (steps[steps.length - 1]?.content?.slice(0, 200) || "See solution above");

    return {
      question: question || "Problem from image",
      subject: subject || "General",
      problemType: subject || "General Problem",
      steps: steps,
      finalAnswer: finalAnswer,
      concepts: [subject || "Problem Solving"],
      difficulty: "Medium",
      timeToSolve: "5-10 minutes"
    };
  };

  const handleNewProblem = () => {
    setSelectedImage(null);
    setQuestionText('');
    setSelectedSubject('');
    setSolution(null);
  };

  const getSubjectBorderColor = (subject) => {
    return SUBJECT_BORDER_COLORS[subject] || SUBJECT_BORDER_COLORS['General'];
  };

  return (
    <div className="min-h-screen bg-base-950 text-content-primary">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-content-primary">Solver</h1>
          <p className="text-sm sm:text-base text-content-secondary mt-1">
            Upload a problem or type a question.
          </p>
          <div className="mt-3">
            <ModelSelector
              value={selectedModel}
              onChange={(m) => { setSelectedModel(m); saveSelectedModel(m); }}
            />
          </div>
        </div>

        {/* Problem Input - single column */}
        <div className="space-y-4 mb-6">
          {/* Image Upload */}
          <div>
            <div
              className="border-2 border-dashed border-border-strong rounded-lg p-6 text-center cursor-pointer hover:border-content-muted transition-colors"
              onClick={triggerImageUpload}
            >
              {selectedImage ? (
                <div className="space-y-3 relative">
                  <img
                    src={selectedImage}
                    alt="Uploaded problem"
                    className="max-h-48 mx-auto rounded-lg"
                  />
                  <div className="flex items-center justify-center gap-4">
                    <p className="text-sm text-content-muted">Click to change image</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(null);
                      }}
                      className="text-sm text-error-400 hover:text-error-300 underline"
                    >
                      Remove image
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Camera className="w-10 h-10 text-content-muted mx-auto" strokeWidth={1.5} />
                  <div>
                    <p className="text-content-secondary font-medium text-sm">Upload an image</p>
                    <p className="text-xs text-content-muted">Supports handwritten and printed problems</p>
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </div>

          {/* Text Input */}
          <Textarea
            placeholder="Type your question here..."
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            rows={3}
            className="resize-none"
          />

          {/* Subject Selection */}
          <CustomDropdown
            options={[
              { value: "", label: "Auto-detect subject" },
              ...Object.entries(AP_SUBJECTS).map(([key, subject]) => ({
                value: key,
                label: subject.name
              }))
            ]}
            value={selectedSubject}
            onChange={setSelectedSubject}
            placeholder="Subject (optional)"
          />

          {/* Solve Button */}
          <Button
            variant="primary"
            onClick={handleSolve}
            disabled={(!selectedImage && !questionText) || isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-base-950 border-t-transparent rounded-full animate-spin mr-2"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Solve
              </>
            )}
          </Button>
        </div>

        {/* Solution Display */}
        {solution && (
          <div className="mb-8">
            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-content-primary">Solution</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNewProblem}
                >
                  New Problem
                </Button>
              </div>

              {/* Problem Info */}
              <div className="mb-4 p-3 bg-base-850/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{solution.subject}</Badge>
                  <Badge variant={solution.difficulty === 'Hard' ? 'destructive' : 'default'}>
                    {solution.difficulty}
                  </Badge>
                </div>
                <div className="text-content-secondary font-medium text-sm"><MarkdownRenderer content={solution.question} /></div>
                <p className="text-xs text-content-muted mt-2">
                  <Clock className="w-3.5 h-3.5 inline mr-1" strokeWidth={1.5} />
                  Estimated time: {solution.timeToSolve}
                </p>
              </div>

              {/* Step-by-Step Solution */}
              <div className="space-y-3 mb-4">
                <h3 className="text-base font-semibold text-content-primary">Step-by-Step Solution</h3>
                {solution.steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 bg-base-850/30 rounded-lg border border-border"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-7 h-7 bg-base-750 rounded-full flex items-center justify-center text-xs font-semibold text-content-primary">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-content-primary text-sm mb-1">{step.title}</h4>
                        <div className="text-content-secondary text-sm mb-1"><MarkdownRenderer content={step.content} /></div>
                        <div className="text-xs text-content-muted"><MarkdownRenderer content={step.explanation} /></div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Final Answer */}
              <div className="p-3 bg-success-900/20 border border-success-500/30 rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-success-400" strokeWidth={1.5} />
                  <h3 className="text-base font-semibold text-content-primary">Final Answer</h3>
                </div>
                <div className="text-success-300 font-mono"><MarkdownRenderer content={solution.finalAnswer} /></div>
              </div>

              {/* Key Concepts */}
              {solution.concepts && solution.concepts.length > 0 && (
                <div>
                  <h3 className="text-base font-semibold text-content-primary mb-2">Key Concepts</h3>
                  <div className="flex flex-wrap gap-2">
                    {solution.concepts.map((concept, index) => (
                      <Badge key={index} variant="outline" className="text-content-muted border-content-muted">
                        {concept}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Recent Solutions */}
        {user && analysisHistory.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-content-primary mb-4">Recent Solutions</h2>
            <div className="space-y-3">
              {analysisHistory.map((item) => (
                <Card
                  key={item.id}
                  className={`p-3 hover:bg-base-850/50 cursor-pointer transition-all duration-200 border-l-2 ${getSubjectBorderColor(item.subject)}`}
                  onClick={() => {
                    if (item.solution) {
                      setSolution(item.solution);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">{item.subject}</Badge>
                        <span className="text-xs text-content-muted">{item.timestamp}</span>
                        {item.solved && <CheckCircle className="w-3.5 h-3.5 text-success-400" strokeWidth={1.5} />}
                      </div>
                      <p className="text-sm text-content-secondary truncate">{item.question}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-content-muted flex-shrink-0 ml-2" strokeWidth={1.5} />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SolverPage;
