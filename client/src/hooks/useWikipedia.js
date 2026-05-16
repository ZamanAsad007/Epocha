import { useState, useEffect } from 'react';
import axios from 'axios';

const cache = {}; // module level cache, persists across renders

const useWikipedia = (slug) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;

    // return cached result immediately
    if (cache[slug]) {
      setData(cache[slug]);
      return;
    }

    // cancellation token
    let cancelled = false;
    setLoading(true);

    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) {
          const result = {
            title: json.title,
            description: json.description,
            extract: json.extract,
            thumbnail: json.thumbnail?.source,
          };
          cache[slug] = result; // save to cache
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });

    // cleanup: cancel if slug changes before fetch completes
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { ...data, loading, error };
};

export default useWikipedia;
