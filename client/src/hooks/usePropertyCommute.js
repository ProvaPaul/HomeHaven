import { useEffect, useState } from 'react';
import api from '../lib/axios';

/**
 * Fetches commute times from one property to multiple saved destinations
 * (e.g. Office, University). Used on the Property Details page.
 *
 * @param {string} propertyId
 * @param {import('../lib/commuteDestinations').CommuteDestination[]} destinations
 * @returns {{
 *   results: Array<{label:string, available:boolean, drivingMin?:number, walkingMin?:number, cyclingMin?:number, distanceKm?:number}>,
 *   isLoading: boolean,
 *   error: string,
 * }}
 */
export function usePropertyCommute(propertyId, destinations) {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const destKey = destinations.map((d) => `${d.label}:${d.lat},${d.lon}`).join('|');

  useEffect(() => {
    if (!propertyId || !destinations.length) {
      setResults([]);
      return;
    }

    let alive = true;
    setIsLoading(true);
    setError('');

    api
      .post(`/commute/property/${propertyId}`, { destinations })
      .then(({ data }) => {
        if (alive) setResults(data.results || []);
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
  }, [propertyId, destKey]);

  return { results, isLoading, error };
}
