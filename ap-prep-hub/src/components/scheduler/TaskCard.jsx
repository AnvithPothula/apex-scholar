import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { formatDistanceToNow, isPast } from 'date-fns';
import { Card, Badge, Button, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/UIComponents';
import { getDifficultyColor } from '../../utils/helpers';

export function TaskCard({ task, onEdit, onDelete, onComplete }) {
  // Fix: Better date handling for both Firestore timestamps and regular dates
  const getTaskDate = () => {
    if (!task.deadline) return new Date();
    if (typeof task.deadline.toDate === 'function') {
      return task.deadline.toDate();
    }
    return new Date(task.deadline);
  };
  
  const taskDate = getTaskDate();
  const isOverdue = isPast(taskDate) && !task.is_completed;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card className={`p-3 sm:p-4 transition-all duration-200 hover:shadow-md ${
        task.is_completed ? 'opacity-60 bg-slate-800/40' : 'bg-slate-800/60 backdrop-blur-sm'
      } ${isOverdue ? 'border-red-500 bg-red-900/40' : 'border-slate-600'}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
            <div className="flex items-start justify-between">
              <h4 className={`font-semibold text-slate-100 text-sm sm:text-base truncate pr-2 ${
                task.is_completed ? "line-through text-slate-400" : ""
              }`}>
                {task.name}
              </h4>
              {task.is_completed && (
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium truncate">{task.subject}</p>
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              <Badge className={`${getDifficultyColor(task.difficulty)} border text-xs`}>
                {task.difficulty}
              </Badge>
              <div className="flex items-center text-slate-400 text-xs">
                <Clock size={12} className="sm:w-3.5 sm:h-3.5 mr-1"/>
                {task.estimated_time} min
              </div>
            </div>
            <div className={`text-xs sm:text-sm font-medium ${
              isOverdue ? 'text-red-400' : task.is_completed ? 'text-green-400' : 'text-slate-300'
            }`}>
              {task.is_completed ? 'Completed' : `Due: ${formatDistanceToNow(taskDate, { addSuffix: true })}`}
            </div>
            {task.description && (
              <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-700 flex-shrink-0 ml-2">
                <MoreVertical size={14} className="sm:w-4 sm:h-4"/>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 sm:w-40">
              <DropdownMenuItem onSelect={onComplete} className="flex items-center text-xs sm:text-sm">
                <CheckCircle size={12} className="sm:w-3.5 sm:h-3.5 mr-2"/>
                {task.is_completed ? "Mark Incomplete" : "Mark Complete"}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onEdit} className="flex items-center text-xs sm:text-sm">
                <Edit size={12} className="sm:w-3.5 sm:h-3.5 mr-2"/>Edit
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onDelete} className="flex items-center text-red-400 hover:text-red-300 hover:bg-red-900/20 text-xs sm:text-sm">
                <Trash2 size={12} className="sm:w-3.5 sm:h-3.5 mr-2"/>Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    </motion.div>
  );
}