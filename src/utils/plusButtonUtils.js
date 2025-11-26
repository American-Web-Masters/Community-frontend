  const getTabTitle = (activeTab) => {
    switch (activeTab) {
      case 'prayer-request':
        return 'Create Prayer Request';
      case 'community':
        return 'Create Community';
      case 'inner-circle':
        return 'Create Inner Circle';
      case 'journal-entry':
        return 'Create Journal Entry';
      default:
        return 'Create Prayer Request';
    }
  };

  const getTabSubtitle = (activeTab) => {
    switch (activeTab) {
      case 'prayer-request':
        return 'Share your prayer request with the community';
      case 'community':
        return 'Create a new community space';
      case 'inner-circle':
        return 'Create an intimate study circle';
      case 'journal-entry':
        return 'Capture your thoughts and reflections';
      default:
        return 'Share your prayer request with the community';
    }
  };

  export { getTabTitle, getTabSubtitle };