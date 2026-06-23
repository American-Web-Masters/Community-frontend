import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook for infinite scroll with pagination
 * @param {Function} fetchFunction - Function to fetch data (should accept page and limit)
 * @param {Object} options - Configuration options
 * @param {number} options.limit - Items per page
 * @param {boolean} options.enabledCondition - Condition to enable fetching (e.g., user logged in)
 * @returns {Object} - Hook state and functions
 */
const useInfiniteScroll = (fetchFunction, options = {}) => {
  const { limit = 20, enabledCondition = true } = options;

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch more items
  const fetchMoreItems = useCallback(async () => {
    if (loading || !hasMore || !enabledCondition) return;

    try {
      setError(null);

      // For first page, show loading. For subsequent pages, don't show loading
      if (page === 1) {
        setLoading(true);
      }

      const response = await fetchFunction(page, limit);

      if (response.success) {
        const newItems = response.data.prayers || response.data.items || [];
        const pagination = response.data.pagination || {};

        if (page === 1) {
          // First page - replace items
          setItems(newItems);
        } else {
          // Subsequent pages - append items
          setItems((prevItems) => [...prevItems, ...newItems]);
        }

        setHasMore(pagination.hasNextPage || false);
        setPage(pagination.currentPage + 1 || page + 1);
      } else {
        throw new Error("Failed to fetch items");
      }
    } catch (err) {
      console.error("Error fetching items:", err);
      setError(err.message || "Failed to load items");
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, page, limit, enabledCondition, loading, hasMore]);

  // Function to refresh data (reset to first page)
  const refresh = useCallback(async () => {
    setPage(1);
    setHasMore(true);
    setItems([]);
    setError(null);
    setLoading(true);

    try {
      const response = await fetchFunction(1, limit);

      if (response.success) {
        const newItems = response.data.prayers || response.data.items || [];
        const pagination = response.data.pagination || {};

        setItems(newItems);
        setHasMore(pagination.hasNextPage || false);
        setPage(2); // Next page will be 2
      } else {
        throw new Error("Failed to fetch items");
      }
    } catch (err) {
      console.error("Error refreshing items:", err);
      setError(err.message || "Failed to load items");
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, limit]);

  // Initial fetch when component mounts or enabledCondition changes
  useEffect(() => {
    if (enabledCondition && items.length === 0) {
      refresh();
    }
  }, [enabledCondition, refresh, items.length]);

  return {
    items,
    hasMore,
    loading,
    error,
    fetchMoreItems,
    refresh,
    setItems, // For manual updates if needed
  };
};

export default useInfiniteScroll;
