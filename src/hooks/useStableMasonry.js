import { useMemo } from 'react';

/**
 * Custom hook for creating a stable masonry layout that maintains original item order
 * Items are distributed to columns based on their index, not height optimization
 * This prevents reordering when items change height or new items are added
 */
export const useStableMasonry = (items, columnCount = 2) => {
  return useMemo(() => {
    const columns = Array.from({ length: columnCount }, () => []);
    
    // Distribute items to columns in round-robin fashion based on index
    // This ensures stable ordering regardless of item height changes
    items.forEach((item, index) => {
      const columnIndex = index % columnCount;
      columns[columnIndex].push({
        ...item,
        originalIndex: index
      });
    });
    
    return columns;
  }, [items, columnCount]);
};