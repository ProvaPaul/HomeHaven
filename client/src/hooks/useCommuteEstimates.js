import { useEffect, useState } from 'react';
import api from '../lib/axios';

/**
 * Fetches driving/walking/cycling commute times from a single destination to
 * many properties in one batched request. Used by the Properties list page
 * for commute badges, the max-commute filter, and sort-by-commute.
 *
 * @param {{lat:number, lon:number}|null} destination
 * @param {string[]} propertyIds
 * @returns {{
 *   commutes: Record<string, {available:boolean, drivingMin?:number, walkingMin?:number, cyclingMin?:number, distanceKm?:number}>,
 *   isLoading: boolean,
 *   error: string,
 * }}
 */
export function useCommuteEstimates(destination, propertyIds) {
  const [commutes, setCommutes] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const idsKey = propertyIds.join(',');

  useEffect(() => {
    if (!destination || !propertyIds.length) {
      setCommutes({});
      return;
    }

    let alive = true;
    setIsLoading(true);
    setError('');

    api
      .post('/commute/estimate', { destination, propertyIds })
      .then(({ data }) => {
        if (alive) setCommutes(data.commutes || {});
      })
      .catch((err) => {
        if (alive) setError(err.message);
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination?.lat, destination?.lon, idsKey]);

  return { commutes, isLoading, error };
}
