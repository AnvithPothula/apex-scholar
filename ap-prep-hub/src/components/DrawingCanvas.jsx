import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from './ui/UIComponents';
import { Undo2, RotateCcw, PenTool, Upload } from 'lucide-react';

const DrawingCanvas = ({ onDrawingChange, initialDrawing = null, disabled = false }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [context, setContext] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      setContext(ctx);
      
      // Set canvas size
      canvas.width = 800;
      canvas.height = 600;
      
      // Fill with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Save initial state
      saveState();
      
      // Load initial drawing if provided
      if (initialDrawing) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        };
        img.src = initialDrawing;
      }
    }
  }, [initialDrawing]);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const imageData = canvas.toDataURL();
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(imageData);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      
      // Notify parent of drawing change
      if (onDrawingChange) {
        onDrawingChange(imageData);
      }
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const prevIndex = historyIndex - 1;
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setHistoryIndex(prevIndex);
        if (onDrawingChange) {
          onDrawingChange(history[prevIndex]);
        }
      };
      img.src = history[prevIndex];
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  const startDrawing = (e) => {
    if (disabled) return;
    
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    context.beginPath();
    context.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing || disabled) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    context.lineWidth = lineWidth;
    context.strokeStyle = currentColor;
    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      context.beginPath();
      saveState();
    }
  };

  // Handle touch events for mobile/tablet
  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    startDrawing(mouseEvent);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    draw(mouseEvent);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup', {});
    stopDrawing(mouseEvent);
  };

  const uploadImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            
            // Clear canvas and fill with white
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Calculate scaling to fit image within canvas
            const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
            const x = (canvas.width - img.width * scale) / 2;
            const y = (canvas.height - img.height * scale) / 2;
            
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            saveState();
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'];

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-600 p-4">
      <div className="mb-4">
        <h4 className="text-slate-200 font-medium mb-2">Drawing/Graph Area</h4>
        <p className="text-sm text-slate-400 mb-3">
          Draw graphs, diagrams, or mathematical expressions. You can also upload an image and annotate it.
        </p>
        
        {/* Tools */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-400">Tool:</label>
            <Button
              variant={currentTool === 'pen' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentTool('pen')}
              disabled={disabled}
            >
              <PenTool className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-400">Size:</label>
            <input
              type="range"
              min="1"
              max="10"
              value={lineWidth}
              onChange={(e) => setLineWidth(e.target.value)}
              className="w-16"
              disabled={disabled}
            />
            <span className="text-sm text-slate-400 w-6">{lineWidth}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-400">Color:</label>
            <div className="flex gap-1">
              {colors.map(color => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded border-2 ${
                    currentColor === color ? 'border-white' : 'border-slate-600'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setCurrentColor(color)}
                  disabled={disabled}
                />
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={disabled || historyIndex <= 0}
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clear}
              disabled={disabled}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={uploadImage}
              disabled={disabled}
            >
              <Upload className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Canvas */}
      <div className="bg-white rounded border border-slate-300 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="block cursor-crosshair"
          style={{ maxWidth: '100%', height: 'auto' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </div>
      
      <p className="text-xs text-slate-400 mt-2">
        💡 Tip: Use this space for graphs, calculations, diagrams, or any visual work required for the problem.
      </p>
    </div>
  );
};

export default DrawingCanvas;
