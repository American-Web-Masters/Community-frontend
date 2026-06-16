import React, { useState, useEffect } from 'react';
import { MdEdit, MdCheck, MdClose, MdAdd, MdDelete } from 'react-icons/md';
import { FaEdit } from "react-icons/fa";
const Rules = ({ 
  community, 
  isModerator, 
  isEditing, 
  onEdit, 
  onCancel, 
  onSave, 
  loading 
}) => {
  const defaultRules = [
    "Be respectful and kind to all community members",
    "Keep discussions relevant to the community's purpose",
    "No spam, advertising, or inappropriate content",
    "Respect privacy and confidentiality of shared information",
    "Follow community guidelines and moderator instructions"
  ];
  
  const [editRules, setEditRules] = useState([]);
  const rules = community.communityRules || defaultRules;

  useEffect(() => {
    if (isEditing) {
      setEditRules([...rules]);
    }
  }, [isEditing, rules]);

  const handleAddRule = () => {
    setEditRules([...editRules, '']);
  };

  const handleRemoveRule = (index) => {
    setEditRules(editRules.filter((_, i) => i !== index));
  };

  const handleRuleChange = (index, value) => {
    const updatedRules = [...editRules];
    updatedRules[index] = value;
    setEditRules(updatedRules);
  };

  const handleSave = () => {
    const filteredRules = editRules.filter(rule => rule.trim() !== '');
    onSave(filteredRules);
  };

  if (isEditing) {
    return (
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50 mb-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-blue-900">Community Rules</h3>
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
              className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 cursor-pointer"
              title="Cancel editing"
            >
              <MdClose size={18} />
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {editRules.map((rule, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 text-[#03045E] rounded-full flex items-center justify-center flex-shrink-0 mt-2">
                <span className="text-sm font-semibold">{index + 1}</span>
              </div>
              <div className="flex-1">
                <textarea
                  value={rule}
                  onChange={(e) => handleRuleChange(index, e.target.value)}
                  className="w-full p-2 text-[#03045E] leading-relaxed text-sm bg-white/80 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="Enter rule..."
                />
              </div>
              <button
                onClick={() => handleRemoveRule(index)}
                className="p-1 pt-3 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200 mt-1 cursor-pointer"
                title="Remove rule"
              >
                <MdDelete size={28} />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={handleAddRule}
          className="mt-4 flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors duration-200"
        >
          <MdAdd size={16} />
          <span className="text-sm">Add Rule</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50 mb-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-blue-900">Community Rules</h3>
        {isModerator && (
          <button
            onClick={onEdit}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200 cursor-pointer"
            title="Edit Rules"
          >
            <FaEdit size={20} />
          </button>
        )}
      </div>
      <div className="space-y-3">
        {rules.map((rule, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 text-[#03045E] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-semibold">{index + 1}</span>
            </div>
            <p className="text-[#03045E] leading-relaxed text-sm">{rule}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Rules;