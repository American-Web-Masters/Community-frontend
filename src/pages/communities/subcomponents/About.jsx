import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../store/userSlice';
import { updateCommunityDetails } from '../../../api/communities';
import toast from 'react-hot-toast';
import AboutUs from './AboutUs';
import Rules from './Rules';
import Tags from './Tags';

const About = ({ community, onCommunityUpdate }) => {
  const user = useSelector(selectUser);
  const [editingSection, setEditingSection] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check if user is moderator/owner
  const isModerator = community?.createdBy?._id === user?._id || 
                     community?.moderators?.some(mod => mod.user._id === user?._id);

  const handleEdit = (section) => {
    setEditingSection(section);
  };

  const handleCancel = () => {
    setEditingSection(null);
  };

  const handleSave = async (section, data) => {
    try {
      setLoading(true);
      
      const updateData = {};
      if (section === 'about') {
        updateData.description = data;
      } else if (section === 'rules') {
        updateData.rules = data;
      } else if (section === 'tags') {
        updateData.tags = data;
      }

      const response = await updateCommunityDetails(community._id, updateData);
      
      if (response.success) {
        toast.success(response.message);
        setEditingSection(null);
        if (onCommunityUpdate) {
          // Create updated community object with the new data
          const updatedCommunity = {
            ...community,
            ...updateData,
            // Handle specific field mappings
            ...(section === 'rules' && { communityRules: data }),
          };
          onCommunityUpdate(updatedCommunity);
        }
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Error updating community:', error);
      toast.error('Failed to update community details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <AboutUs 
        community={community} 
        isModerator={isModerator}
        isEditing={editingSection === 'about'}
        onEdit={() => handleEdit('about')}
        onCancel={handleCancel}
        onSave={(data) => handleSave('about', data)}
        loading={loading}
      />
      <Rules 
        community={community} 
        isModerator={isModerator}
        isEditing={editingSection === 'rules'}
        onEdit={() => handleEdit('rules')}
        onCancel={handleCancel}
        onSave={(data) => handleSave('rules', data)}
        loading={loading}
      />
      <Tags 
        community={community} 
        isModerator={isModerator}
        isEditing={editingSection === 'tags'}
        onEdit={() => handleEdit('tags')}
        onCancel={handleCancel}
        onSave={(data) => handleSave('tags', data)}
        loading={loading}
      />
    </div>
  );
};

export default About;