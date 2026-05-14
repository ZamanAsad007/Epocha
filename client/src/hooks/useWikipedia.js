import { useState, useEffect } from 'react';
import axios from 'axios';

const useWikipedia = (slug) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Simple in-memory cache
  const [cache, setCache] = useState({});

  useEffect(() => {
    if (!slug) return;

    if (cache[slug]) {
      setData(cache[slug]);
      return;
    }

    const fetchWiki = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`
        );
        const result = {
          title: response.data.title,
          description: response.data.description,
          extract: response.data.extract,
          thumbnail: response.data.thumbnail?.source,
        };
        setData(result);
        setCache((prev) => ({ ...prev, [slug]: result }));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWiki();
  }, [slug]);

  return { ...data, loading, error };
};

export default useWikipedia;
