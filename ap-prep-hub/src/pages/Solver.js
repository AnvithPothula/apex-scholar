import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Camera, Brain, ChevronRight, CheckCircle, Clock, Calculator, Lightbulb, FileText, Image as ImageIcon } from 'lucide-react';
import { Button, Card, Badge, Textarea } from '../components/ui/UIComponents';
import CustomDropdown from '../components/ui/CustomDropdown';
import { useAuth } from '../contexts/AuthContext';
import { AP_SUBJECTS } from '../constants/subjects';
import geminiService from '../services/geminiService';
import dataService from '../services/dataService';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const SolverPage = () => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [solution, setSolution] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);

  // Component to render text with LaTeX support
  // Uses a div wrapper to avoid DOM nesting issues with BlockMath
  const MathText = ({ children, inline = false }) => {
    if (!children) return null;

    const text = typeof children === 'string' ? children : String(children);

    // Check if content has block math ($$...$$)
    const hasBlockMath = /\$\$.*?\$\$/s.test(text);

    // Split text by LaTeX delimiters
    const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]*?\$)/g);

    const content = parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        // Block math - render as div
        const math = part.slice(2, -2).trim();
        try {
          return (
            <span key={index} className="block my-2">
              <InlineMath math={math} />
            </span>
          );
        } catch (error) {
          return <span key={index} className="text-red-400">[Math Error: {part}]</span>;
        }
      } else if (part.startsWith('$') && part.endsWith('$')) {
        // Inline math
        const math = part.slice(1, -1);
        try {
          return <InlineMath key={index} math={math} />;
        } catch (error) {
          return <span key={index} className="text-red-400">[Math Error: {part}]</span>;
        }
      } else if (part.trim()) {
        // Regular text
        return <span key={index}>{part}</span>;
      }
      return null;
    }).filter(Boolean);

    // Use div wrapper if content has block math to avoid nesting issues
    if (hasBlockMath && !inline) {
      return <span className="block">{content}</span>;
    }

    return <span>{content}</span>;
  };

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
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
      };
      reader.readAsDataURL(file);
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
      
      if (selectedImage && questionText) {
        // Both image and text provided
        const imageData = convertImageToBase64(selectedImage);
        solutionText = await geminiService.generateWithImages(
          `Solve this ${subjectName} problem. Here's the text description: ${questionText}. Also analyze the image provided. 

IMPORTANT: Use LaTeX formatting for all mathematical expressions. Wrap inline math with single dollar signs $...$ and block math with double dollar signs $$...$$.

Provide a detailed step-by-step solution with proper LaTeX formatting for mathematical content.`,
          [imageData]
        );
      } else if (selectedImage) {
        // Only image provided
        const imageData = convertImageToBase64(selectedImage);
        solutionText = await geminiService.generateWithImages(
          `Analyze and solve this ${subjectName} problem from the image. Provide step-by-step solution.

IMPORTANT: Use LaTeX formatting for all mathematical expressions. Wrap inline math with single dollar signs $...$ and block math with double dollar signs $$...$$.

Provide a detailed step-by-step solution with proper LaTeX formatting for mathematical content.`,
          [imageData]
        );
      } else {
        // Only text provided
        solutionText = await geminiService.solveProblem(questionText, subjectName);
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
        const stripped = txt.replace(/```[\s\S]*?```/g, (m) => {
          const inner = m.replace(/^```[a-z]*\n?/i,'').replace(/```$/,'');
          return inner;
        });
        // Attempt to find first JSON object
        const firstBrace = stripped.indexOf('{');
        const lastBrace = stripped.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const candidate = stripped.slice(firstBrace, lastBrace + 1);
          try { return JSON.parse(candidate); } catch(_) {}
        }
        // Fallback regex
        const loose = stripped.match(/\{[\s\S]*\}/);
        if (loose) {
          try { return JSON.parse(loose[0]); } catch(_) {}
        }
        return null;
      };
      let parsedSolution;
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
      alert('Failed to analyze the problem. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const parseTextSolution = (text, question, subject) => {
    // Simple text parsing for fallback
    const lines = text
      .split('\n')
      .filter(line => line.trim())
      .filter(line => !/^```/i.test(line)); // drop code fence markers
    
    return {
      question: question || "Problem from image",
      subject: subject || "General",
      steps: [
        {
          step: 1,
          title: "Problem Analysis",
          content: lines[0] || "Analyzing the problem...",
          explanation: "Understanding the problem type and requirements"
        },
        {
          step: 2,
          title: "Solution Process",
          content: lines.slice(1, -1).join(' ') || "Working through the solution...",
          explanation: "Applying relevant concepts and methods"
        },
        {
          step: 3,
          title: "Final Answer",
          content: lines[lines.length - 1] || "Solution completed",
          explanation: "Arrived at the final result"
        }
      ],
      finalAnswer: lines[lines.length - 1] || "Solution provided above",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              AI Solver
            </h1>
          </div>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto">
            Get instant step-by-step solutions for AP homework problems. Upload a photo or type your question 
            for detailed explanations and personalized learning insights.
          </p>
        </motion.div>

        {/* AI Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-blue-500/30">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="p-3 bg-blue-500/20 rounded-lg w-fit mx-auto mb-3">
                  <Camera className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-semibold text-slate-200 mb-2">Photo Recognition</h3>
                <p className="text-sm text-slate-400">
                  Upload photos of handwritten or printed problems
                </p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-indigo-500/20 rounded-lg w-fit mx-auto mb-3">
                  <Brain className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-slate-200 mb-2">Step-by-Step Solutions</h3>
                <p className="text-sm text-slate-400">
                  Detailed explanations for every step of the solution
                </p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-purple-500/20 rounded-lg w-fit mx-auto mb-3">
                  <Lightbulb className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="font-semibold text-slate-200 mb-2">Learning Insights</h3>
                <p className="text-sm text-slate-400">
                  Understand concepts and identify knowledge gaps
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Problem Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 h-fit">
              <h2 className="text-xl font-bold text-slate-100 mb-6">Submit Your Problem</h2>
              
              {/* Upload Methods */}
              <div className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Upload Photo
                  </label>
                  <div 
                    className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {selectedImage ? (
                      <div className="space-y-4">
                        <img 
                          src={selectedImage} 
                          alt="Uploaded problem"
                          className="max-h-48 mx-auto rounded-lg"
                        />
                        <p className="text-sm text-slate-400">Click to change image</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Camera className="w-12 h-12 text-slate-500 mx-auto" />
                        <div>
                          <p className="text-slate-300 font-medium">Take a photo or upload image</p>
                          <p className="text-sm text-slate-500">Supports handwritten and printed problems</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Text Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Or Type Your Question
                  </label>
                  <Textarea
                    placeholder="Enter your AP problem here..."
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                {/* Subject Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Subject (Optional)
                  </label>
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
                    placeholder="Auto-detect subject"
                  />
                </div>

                {/* Solve Button */}
                <Button
                  onClick={handleSolve}
                  disabled={(!selectedImage && !questionText) || isAnalyzing}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Analyzing Problem...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Solve with AI
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Solution Display */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {solution ? (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-100">Solution</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNewProblem}
                  >
                    New Problem
                  </Button>
                </div>

                {/* Problem Info */}
                <div className="mb-6 p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{solution.subject}</Badge>
                    <Badge variant={solution.difficulty === 'Hard' ? 'destructive' : 'default'}>
                      {solution.difficulty}
                    </Badge>
                  </div>
                  <p className="text-slate-300 font-medium"><MathText>{solution.question}</MathText></p>
                  <p className="text-sm text-slate-400 mt-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Estimated time: {solution.timeToSolve}
                  </p>
                </div>

                {/* Step-by-Step Solution */}
                <div className="space-y-4 mb-6">
                  <h3 className="text-lg font-semibold text-slate-200">Step-by-Step Solution</h3>
                  {solution.steps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-slate-800/30 rounded-lg border border-slate-700"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                          {step.step}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-200 mb-2">{step.title}</h4>
                          <p className="text-slate-300 mb-2"><MathText>{step.content}</MathText></p>
                          <p className="text-sm text-slate-400"><MathText>{step.explanation}</MathText></p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Final Answer */}
                <div className="p-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-lg mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <h3 className="text-lg font-semibold text-slate-200">Final Answer</h3>
                  </div>
                  <p className="text-green-300 font-mono text-lg"><MathText>{solution.finalAnswer}</MathText></p>
                </div>

                {/* Key Concepts */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-200 mb-3">Key Concepts</h3>
                  <div className="flex flex-wrap gap-2">
                    {solution.concepts.map((concept, index) => (
                      <Badge key={index} variant="outline" className="text-blue-400 border-blue-400">
                        {concept}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center h-fit">
                <Calculator className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-300 mb-2">Ready to solve your problem</h3>
                <p className="text-slate-400">
                  Upload an image or type your question to get started with AI-powered solutions.
                </p>
              </Card>
            )}
          </motion.div>
        </div>

        {/* Recent Solutions */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-bold text-slate-100 mb-6">Recent Solutions</h2>
            <div className="space-y-4">
              {analysisHistory.map((item) => (
                <Card 
                  key={item.id} 
                  className="p-4 hover:bg-slate-800/50 cursor-pointer transition-all duration-200"
                  onClick={() => {
                    // Show the solution for this item
                    if (item.solution) {
                      setSolution(item.solution);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="secondary" className="text-xs">{item.subject}</Badge>
                        <span className="text-xs text-slate-400">{item.timestamp}</span>
                        {item.solved && <CheckCircle className="w-4 h-4 text-green-400" />}
                      </div>
                      <p className="text-slate-300 truncate">{item.question}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Card className="p-8 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border-blue-500/30">
            <h2 className="text-2xl font-bold text-slate-100 mb-6 text-center">
              How AI Solver Works
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="p-4 bg-blue-500/20 rounded-full w-fit mx-auto mb-4">
                  <ImageIcon className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="font-semibold text-slate-200 mb-2">1. Upload</h3>
                <p className="text-sm text-slate-400">
                  Take a photo or type your AP problem
                </p>
              </div>
              <div className="text-center">
                <div className="p-4 bg-indigo-500/20 rounded-full w-fit mx-auto mb-4">
                  <Brain className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-slate-200 mb-2">2. Analyze</h3>
                <p className="text-sm text-slate-400">
                  AI recognizes and understands the problem
                </p>
              </div>
              <div className="text-center">
                <div className="p-4 bg-purple-500/20 rounded-full w-fit mx-auto mb-4">
                  <FileText className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="font-semibold text-slate-200 mb-2">3. Solve</h3>
                <p className="text-sm text-slate-400">
                  Get detailed step-by-step solutions
                </p>
              </div>
              <div className="text-center">
                <div className="p-4 bg-pink-500/20 rounded-full w-fit mx-auto mb-4">
                  <Lightbulb className="w-8 h-8 text-pink-400" />
                </div>
                <h3 className="font-semibold text-slate-200 mb-2">4. Learn</h3>
                <p className="text-sm text-slate-400">
                  Understand concepts and improve skills
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default SolverPage;
