import React, { useState, useEffect } from 'react';
import { FaEdit } from 'react-icons/fa';
import { MdEdit, MdCheck, MdClose, MdAdd, MdDelete } from 'react-icons/md';

const Tags = ({ 
  community, 
  isModerator, 
  isEditing, 
  onEdit, 
  onCancel, 
  onSave, 
  loading 
}) => {
  const [editTags, setEditTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const tags = community.tags || [];

  useEffect(() => {
    if (isEditing) {
      setEditTags([...tags]);
    }
  }, [isEditing, tags]);

  const handleAddTag = () => {
    if (newTag.trim() && !editTags.includes(newTag.trim().toLowerCase())) {
      setEditTags([...editTags, newTag.trim().toLowerCase()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    setEditTags(editTags.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = () => {
    onSave(editTags);
  };

  if (isEditing) {
    return (
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-blue-900">Tags</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 cursor-pointer"
              title="Save changes"
            >
              <MdCheck size={18} />
            </button>
            <button
              onClick={onCancel}
              disabled={loading}
              className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 cursor-pointer disabled:opacity-50"
              title="Cancel editing"
            >
              <MdClose size={18} />
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter a new tag..."
            />
            <button
              onClick={handleAddTag}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-1 cursor-pointer"
            >
              <MdAdd size={16} />
              <span>Add</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {editTags.map((tag, index) => (
            <div
              key={index}
              className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
            >
              <span>#{tag}</span>
              <button
                onClick={() => handleRemoveTag(index)}
                className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                title="Remove tag"
              >
                <MdDelete size={18} />
              </button>
            </div>
          ))}
          {editTags.length === 0 && (
            <p className="text-gray-500 text-sm">No tags added yet. Add some tags to help others discover this community.</p>
          )}
        </div>
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-blue-900">Tags</h3>
          {isModerator && (
            <button
              onClick={onEdit}
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200 cursor-pointer"
              title="Edit Tags"
            >
            <FaEdit size={20} />
            </button>
          )}
        </div>
        <p className="text-gray-500 text-sm">No tags have been added to this community yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-blue-900">Tags</h3>
        {isModerator && (
          <button
            onClick={onEdit}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200 cursor-pointer"
            title="Edit Tags"
          >
            <FaEdit size={20} />
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        {tags.map((tag, index) => (
          <span 
            key={index}
            className="px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-full hover:bg-blue-200 transition-colors duration-200"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Tags;