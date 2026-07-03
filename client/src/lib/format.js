const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export const formatPrice = (price, status) => {
  const base = usd.format(price ?? 0);
  return status === 'for-rent' || status === 'rented' ? `${base}/mo` : base;
};

export const formatArea = (sqft) => `${new Intl.NumberFormat('en-US').format(sqft ?? 0)} sqft`;

export const STATUS_LABELS = {
  'for-sale': 'For Sale',
  'for-rent': 'For Rent',
  sold: 'Sold',
  rented: 'Rented',
};

export const TYPE_LABELS = {
  house: 'House',
  apartment: 'Apartment',
  villa: 'Villa',
  condo: 'Condo',
  land: 'Land',
  commercial: 'Commercial',
};

export const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [name, secs] of units) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value} ${name}${value > 1 ? 's' : ''} ago`;
  }
  return 'just now';
};
