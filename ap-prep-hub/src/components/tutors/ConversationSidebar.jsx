import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { Button } from '../ui/UIComponents';

// ConversationSidebar lists conversations for a subject with create, rename, delete actions
export function ConversationSidebar({
  conversations = [],
  activeId,
  onSelect,
  onCreate,
  onRename,
  onDelete
}) {
  const [editingId, setEditingId] = useState(null);
  const [tempName, setTempName] = useState('');

  const startEdit = (conv) => {
    setEditingId(conv.id);
    setTempName(conv.name || 'Untitled');
  };

  const commitEdit = () => {
    if (tempName.trim() && editingId) {
      onRename(editingId, tempName.trim());
    }
    setEditingId(null);
    setTempName('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTempName('');
  };

  return (
    <div className="w-72 border-r bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm flex flex-col h-full border-slate-200 dark:border-slate-800">
      <div className="p-4 border-b flex items-center justify-between border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Conversations</h3>
        <Button size="sm" variant="outline" onClick={onCreate} className="gap-1 text-xs">
          <Plus className="w-4 h-4" /> New
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
        {conversations.length === 0 && (
          <div className="p-4 text-xs text-slate-500">No conversations yet.</div>
        )}
        {conversations.map(conv => {
          const isActive = conv.id === activeId;
          const isEditing = conv.id === editingId;
          return (
            <div
              key={conv.id}
              className={`group px-3 py-2 text-sm cursor-pointer flex items-center justify-between gap-2 ${isActive ? 'bg-blue-50/70 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300'}`}
              onClick={() => !isEditing && onSelect(conv.id)}
            >
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <input
                    autoFocus
                    value={tempName}
                    onChange={e => setTempName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') cancelEdit(); }}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                ) : (
                  <div className="truncate font-medium">
                    {conv.name || 'Untitled'}
                  </div>
                )}
                {!isEditing && (
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                    {conv.lastMessageSnippet || 'No messages yet'}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {isEditing ? (
                  <>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={commitEdit}><Check className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={cancelEdit}><X className="w-4 h-4" /></Button>
                  </>
                ) : (
                  <>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e)=>{e.stopPropagation(); startEdit(conv);}}><Pencil className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6 hover:text-red-600" onClick={(e)=>{e.stopPropagation(); onDelete(conv.id);}}><Trash2 className="w-4 h-4" /></Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ConversationSidebar;
