import React, { useState, useEffect } from 'react';
import { FaEdit } from 'react-icons/fa';
import { MdEdit, MdCheck, MdClose } from 'react-icons/md';

const AboutUs = ({ 
  community, 
  isModerator, 
  isEditing, 
  onEdit, 
  onCancel, 
  onSave, 
  loading 
}) => {
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (isEditing) {
      setEditText(community.description || "This community is dedicated to bringing people together through shared values and meaningful connections.");
    }
  }, [isEditing, community.description]);

  const handleSave = () => {
    onSave(editText);
  };

  if (isEditing) {
    return (
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50 mb-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-blue-900">About Us</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 cursor-pointer disabled:opacity-50"
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
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="w-full p-4 text-[#03045E] leading-relaxed bg-white/80 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
          placeholder="Enter community description..."
        />
        {community.createdAt && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-[#03045E]">
              Community created on {new Date(community.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50 mb-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-blue-900">About Us</h3>
        {isModerator && (
          <button
            onClick={onEdit}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200 cursor-pointer" 
            title="Edit About Us"
          >
            <FaEdit size={20} />
          </button>
        )}
      </div>
      <p className="text-[#03045E] leading-relaxed">
        {community.description || "This community is dedicated to bringing people together through shared values and meaningful connections."}
      </p>
      {community.createdAt && (
        <div className=" pt-4 border-t border-gray-200">
          <p className="text-sm text-[#03045E]">
            Community created on {new Date(community.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      )}
    </div>
  );
};

export default AboutUs;