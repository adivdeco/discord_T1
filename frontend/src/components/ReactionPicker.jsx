import React, { useState } from 'react';
import { Smile, X } from 'lucide-react';

/**
 * ReactionPicker Component
 * Shows emoji selector for reacting to messages
 */
export const ReactionPicker = ({ onReactionAdd, onClose, isOpen }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Popular Discord reactions
  const reactionEmojis = [
    { emoji: '👍', name: 'thumbs_up', category: 'popular' },
    { emoji: '❤️', name: 'heart', category: 'popular' },
    { emoji: '😂', name: 'joy', category: 'popular' },
    { emoji: '🎉', name: 'tada', category: 'popular' },
    { emoji: '😢', name: 'cry', category: 'popular' },
    { emoji: '🔥', name: 'fire', category: 'popular' },
    { emoji: '😍', name: 'heart_eyes', category: 'emotions' },
    { emoji: '🤔', name: 'thinking', category: 'emotions' },
    { emoji: '😱', name: 'shocked', category: 'emotions' },
    { emoji: '🙏', name: 'pray', category: 'emotions' },
    { emoji: '🎮', name: 'video_game', category: 'activities' },
    { emoji: '🚀', name: 'rocket', category: 'objects' },
    { emoji: '✅', name: 'check_mark', category: 'symbols' },
    { emoji: '❌', name: 'x_mark', category: 'symbols' },
    { emoji: '🙈', name: 'see_no_evil', category: 'emotions' },
    { emoji: '👀', name: 'eyes', category: 'emotions' },
    { emoji: '🎯', name: 'target', category: 'objects' },
    { emoji: '⭐', name: 'star', category: 'objects' },
    { emoji: '🌟', name: 'glowing_star', category: 'objects' },
    { emoji: '💯', name: 'hundred', category: 'symbols' },
    { emoji: '🤢', name: 'nauseated', category: 'emotions' },
    { emoji: '🤡', name: 'clown', category: 'emotions' },
    { emoji: '🍆', name: 'eggplant', category: 'food' },
    { emoji: '🍑', name: 'peach', category: 'food' },
    { emoji: '💀', name: 'skull', category: 'emotions' },
    { emoji: '🧠', name: 'brain', category: 'body' },
    { emoji: '💀', name: 'dead', category: 'emotions' }
  ];

  const filtered = reactionEmojis.filter(r =>
    r.emoji.includes(searchTerm) ||
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-full mb-2 left-0 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 p-3">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Smile size={16} className="text-gray-400" />
          <span className="text-xs font-semibold text-gray-300">Add Reaction</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition p-0.5"
        >
          <X size={14} />
        </button>
      </div>

      <input
        type="text"
        placeholder="Search emojis..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="w-full bg-gray-700 text-white text-xs rounded px-2 py-1 mb-2 placeholder-gray-500 focus:outline-none focus:bg-gray-600"
      />

      <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
        {filtered.map((reaction, idx) => (
          <button
            key={idx}
            onClick={() => onReactionAdd(reaction.emoji, reaction.name)}
            className="text-lg hover:bg-gray-700 p-1 rounded transition cursor-pointer hover:scale-125 transform"
            title={reaction.name}
          >
            {reaction.emoji}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-xs text-gray-500 text-center py-4">
          No emojis found
        </div>
      )}
    </div>
  );
};
