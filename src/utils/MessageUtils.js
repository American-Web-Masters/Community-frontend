// Custom styles for thin scrollbars
export const scrollbarStyles = `
  .thin-scrollbar::-webkit-scrollbar {
    width: 3px;
    height: 3px;
  }
  .thin-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .thin-scrollbar::-webkit-scrollbar-thumb {
    background: #A6D3FF;
    border-radius: 10px;
  }
  .thin-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #8BC1FF;
  }
  .thin-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #A6D3FF transparent;
  }
`;



export const toIdString = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (typeof value._id === 'string') return value._id;
    if (typeof value.id === 'string') return value.id;
  }
  return String(value);
};