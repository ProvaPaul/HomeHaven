const KEY = 'homehaven-commute-destinations';
const MAX = 3;

/**
 * @typedef {Object} CommuteDestination
 * @property {string} id
 * @property {string} label
 * @property {string} address
 * @property {number} lat
 * @property {number} lon
 */

/** @returns {CommuteDestination[]} */
export function getDestinations() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * @param {{label:string, address:string, lat:number, lon:number}} destination
 * @returns {CommuteDestination[]}
 */
export function saveDestination(destination) {
  const list = getDestinations().filter((d) => d.label.toLowerCase() !== destination.label.toLowerCase());
  const entry = { id: `${Date.now()}`, ...destination };
  list.unshift(entry);
  const trimmed = list.slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    // Storage full or unavailable — destinations are best-effort
  }
  return trimmed;
}

/**
 * @param {string} id
 * @returns {CommuteDestination[]}
 */
export function removeDestination(id) {
  const list = getDestinations().filter((d) => d.id !== id);
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
  return list;
}

export function clearDestinations() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
