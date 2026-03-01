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
    <div className="w-72 border-r bg-base-900 border-border flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between border-border">
        <h3 className="text-sm font-display text-overline text-content-muted uppercase tracking-widest">Conversations</h3>
        <Button size="sm" variant="outline" onClick={onCreate} className="gap-1 text-xs">
          <Plus strokeWidth={1.5} className="w-4 h-4" /> New
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-border-subtle">
        {conversations.length === 0 && (
          <div className="p-4 text-xs text-content-muted">Start a conversation</div>
        )}
        {conversations.map(conv => {
          const isActive = conv.id === activeId;
          const isEditing = conv.id === editingId;
          return (
            <div
              key={conv.id}
              className={`group px-3 py-2 text-sm cursor-pointer flex items-center justify-between gap-2 ${isActive ? 'bg-primary-950 text-primary-400 border-l-2 border-primary-500' : 'hover:bg-base-850 text-content-secondary'}`}
              onClick={() => !isEditing && onSelect(conv.id)}
            >
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <input
                    autoFocus
                    value={tempName}
                    onChange={e => setTempName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') cancelEdit(); }}
                    className="w-full bg-base-850 border border-border-strong rounded px-2 py-1 text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                ) : (
                  <div className="truncate font-medium">
                    {conv.name || 'Untitled'}
                  </div>
                )}
                {!isEditing && (
                  <div className="text-[10px] text-content-muted truncate">
                    {conv.lastMessageSnippet || 'No messages yet'}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {isEditing ? (
                  <>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={commitEdit}><Check strokeWidth={1.5} className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={cancelEdit}><X strokeWidth={1.5} className="w-4 h-4" /></Button>
                  </>
                ) : (
                  <>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e)=>{e.stopPropagation(); startEdit(conv);}}><Pencil strokeWidth={1.5} className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6 hover:text-error-600" onClick={(e)=>{e.stopPropagation(); onDelete(conv.id);}}><Trash2 strokeWidth={1.5} className="w-4 h-4" /></Button>
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
