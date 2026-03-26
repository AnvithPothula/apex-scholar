import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button, Input, Textarea } from '../ui/UIComponents';

// Format a Date as a local datetime-local string (avoids UTC shift from toISOString)
const toLocalDateTimeString = (d) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export function TaskModal({ task, onClose, onSave, isOpen }) {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    type: 'homework',
    difficulty: 'Medium',
    estimated_time: 30,
    pages: 0,
    deadline: toLocalDateTimeString(new Date()),
    description: ''
  });

  useEffect(() => {
    if (task) {
      // Fix: Better date handling for both Firestore timestamps and regular dates
      let deadlineValue;
      if (task.deadline) {
        if (typeof task.deadline.toDate === 'function') {
          deadlineValue = toLocalDateTimeString(task.deadline.toDate());
        } else {
          deadlineValue = toLocalDateTimeString(new Date(task.deadline));
        }
      } else {
        deadlineValue = toLocalDateTimeString(new Date());
      }

      setFormData({
        name: task.name || '',
        subject: task.subject || '',
        type: task.type || 'homework',
        difficulty: task.difficulty || 'Medium',
        estimated_time: task.estimated_time || 30,
        pages: task.pages || 0,
        deadline: deadlineValue,
        description: task.description || '',
        priority: task.priority || 'medium'
      });
    } else {
      // Reset form for new task
      setFormData({
        name: '',
        subject: '',
        type: 'homework',
        difficulty: 'Medium',
        estimated_time: 30,
        pages: 0,
        deadline: toLocalDateTimeString(new Date()),
        description: '',
        priority: 'medium'
      });
    }
  }, [task]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const taskData = {
      ...formData,
      deadline: new Date(formData.deadline),
      estimated_time: parseInt(formData.estimated_time),
      // Fix: Add required fields for scheduler
      timeRequired: parseInt(formData.estimated_time) / 60, // Convert minutes to hours
      timeSpent: task?.timeSpent || 0, // Preserve existing progress on edit
      priority: formData.priority || 'medium',
      pages: parseInt(formData.pages) || 0
    };
    onSave(taskData);
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4"
      onClick={(e) => {
        // Close modal when clicking on backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-base-850 rounded-md shadow-floating w-full max-w-md max-h-[90vh] flex flex-col border border-border mx-auto"
      >
        <div className="p-4 sm:p-6 border-b border-border bg-base-850">
          <h3 className="text-lg sm:text-xl font-semibold text-content-primary">{task ? 'Edit Task' : 'Create New Task'}</h3>
          <p className="text-xs sm:text-sm text-content-secondary mt-1">Fill in the details below to {task ? 'update' : 'create'} your task</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium mb-2 text-content-primary">Task Name</label>
            <Input 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              required 
              className="text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-content-primary">Subject</label>
            <Input 
              value={formData.subject} 
              onChange={(e) => setFormData({...formData, subject: e.target.value})} 
              required 
              className="text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-content-primary">Task Type</label>
              <select 
                value={formData.type} 
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="flex h-10 w-full rounded-sm border border-border-strong bg-base-800 px-3 py-2 text-sm text-content-primary placeholder:text-content-muted focus:border-content-muted focus:ring-1 focus:ring-content-muted/20 transition-colors duration-150"
              >
                <option value="homework">Homework</option>
                <option value="test">Test Prep</option>
                <option value="project">Project</option>
                <option value="reading">Reading</option>
                <option value="lab">Lab Work</option>
                <option value="essay">Essay/Writing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-content-primary">Difficulty</label>
              <select 
                value={formData.difficulty} 
                onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                className="flex h-10 w-full rounded-sm border border-border-strong bg-base-800 px-3 py-2 text-sm text-content-primary placeholder:text-content-muted focus:border-content-muted focus:ring-1 focus:ring-content-muted/20 transition-colors duration-150"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-content-primary">
                {formData.type === 'reading' ? 'Pages' : 'Time (min)'}
              </label>
              <Input 
                type="number" 
                value={formData.type === 'reading' ? formData.pages : formData.estimated_time} 
                onChange={(e) => setFormData({
                  ...formData, 
                  [formData.type === 'reading' ? 'pages' : 'estimated_time']: e.target.value,
                  // Auto-calculate time for reading (2 min per page)
                  ...(formData.type === 'reading' ? { estimated_time: parseInt(e.target.value) * 2 } : {})
                })} 
                min="1" 
                step={formData.type === 'reading' ? '1' : '5'}
                placeholder={formData.type === 'reading' ? 'Number of pages' : 'Minutes needed'}
                required 
                className="text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-content-primary">Priority</label>
              <select 
                value={formData.priority || 'medium'} 
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="flex h-10 w-full rounded-sm border border-border-strong bg-base-800 px-3 py-2 text-sm text-content-primary placeholder:text-content-muted focus:border-content-muted focus:ring-1 focus:ring-content-muted/20 transition-colors duration-150"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-content-primary">Deadline</label>
            <Input 
              type="datetime-local" 
              value={formData.deadline} 
              onChange={(e) => setFormData({...formData, deadline: e.target.value})} 
              required 
              className="text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-content-primary">Description</label>
            <Textarea 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              rows="3"
              placeholder="Optional: Add more details about this task..."
              className="text-sm resize-none"
            />
          </div>
        </form>
        <div className="p-4 sm:p-6 border-t border-border bg-base-850">
          <div className="flex gap-3">
            <Button 
              type="button" 
              onClick={handleSubmit}
              className="flex-1 h-10 sm:h-11 text-sm"
            >
              {task ? 'Update Task' : 'Create Task'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="h-10 sm:h-11 px-4 text-sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}