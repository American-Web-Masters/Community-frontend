import React from 'react';

const ReactionPicker = ({ reactionPickerRef, isOutgoing, commonEmojis, onReactionClick }) => {
  return (
    <div
      ref={reactionPickerRef}
      className={`absolute ${isOutgoing ? 'right-0' : 'left-0'} top-full mt-2 z-10 bg-white rounded-full shadow-lg px-2 py-1.5 flex gap-1`}
    >
      {commonEmojis.map(emoji => (
        <button
          key={emoji}
          onClick={() => onReactionClick(emoji)}
          className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-lg transition-all hover:scale-110"
          title={`React with ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default ReactionPicker;
