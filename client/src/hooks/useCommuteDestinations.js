import { useCallback, useState } from 'react';
import api from '../lib/axios';
import { getDestinations, saveDestination, removeDestination } from '../lib/commuteDestinations';

/**
 * Manages the user's saved commute destinations (e.g. Office, University),
 * persisted to localStorage so they carry over between the Properties list
 * and Property Details pages.
 *
 * @returns {{
 *   destinations: import('../lib/commuteDestinations').CommuteDestination[],
 *   addDestination: (label:string, address:string) => Promise<boolean>,
 *   remove: (id:string) => void,
 *   isAdding: boolean,
 *   error: string,
 * }}
 */
export function useCommuteDestinations() {
  const [destinations, setDestinations] = useState(() => getDestinations());
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  const addDestination = useCallback(async (label, address) => {
    if (!label?.trim() || !address?.trim()) {
      setError('Enter a label and an address');
      return false;
    }
    setIsAdding(true);
    setError('');
    try {
      const { data } = await api.post('/commute/geocode', { query: address.trim() });
      if (!data.available) {
        setError(data.message || "Couldn't find that address");
        return false;
      }
      const next = saveDestination({
        label: label.trim(),
        address: address.trim(),
        lat: data.location.lat,
        lon: data.location.lon,
      });
      setDestinations(next);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsAdding(false);
    }
  }, []);

  const remove = useCallback((id) => {
    setDestinations(removeDestination(id));
  }, []);

  return { destinations, addDestination, remove, isAdding, error };
}
