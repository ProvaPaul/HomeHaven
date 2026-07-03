import mongoose from 'mongoose';
import { env } from '../config/env.js';
import User from '../models/User.js';
import Property from '../models/Property.js';

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=70`;

const sampleProperties = [
  {
    title: 'Modern Family House with Garden',
    description:
      'A stunning modern family home in a quiet neighborhood. Features an open-plan kitchen, spacious living areas flooded with natural light, and a beautifully landscaped garden perfect for entertaining.',
    type: 'house',
    status: 'for-sale',
    price: 749000,
    bedrooms: 4,
    bathrooms: 3,
    area: 2800,
    yearBuilt: 2019,
    address: { street: '42 Maple Grove', city: 'Austin', state: 'TX', zipCode: '78701' },
    amenities: ['Garage', 'Garden', 'Air Conditioning', 'Fireplace', 'Smart Home'],
    images: [img('photo-1600596542815-ffad4c1539a9'), img('photo-1600585154340-be6161a56a0c'), img('photo-1600607687939-ce8a6c25118c')],
    featured: true,
  },
  {
    title: 'Downtown Luxury Apartment',
    description:
      'Live in the heart of the city in this luxurious two-bedroom apartment with floor-to-ceiling windows, premium finishes, and breathtaking skyline views from the private balcony.',
    type: 'apartment',
    status: 'for-rent',
    price: 3200,
    bedrooms: 2,
    bathrooms: 2,
    area: 1150,
    yearBuilt: 2021,
    address: { street: '900 Congress Ave, Unit 1804', city: 'Seattle', state: 'WA', zipCode: '98101' },
    amenities: ['Gym', 'Pool', 'Concierge', 'Parking', 'Balcony'],
    images: [img('photo-1522708323590-d24dbb6b0267'), img('photo-1502672260266-1c1ef2d93688'), img('photo-1560448204-e02f11c3d0e2')],
    featured: true,
  },
  {
    title: 'Mediterranean Villa with Pool',
    description:
      'An exquisite Mediterranean-style villa featuring a private pool, expansive terraces, a chef\'s kitchen, and a master suite with panoramic ocean views. Resort-style living every day.',
    type: 'villa',
    status: 'for-sale',
    price: 2450000,
    bedrooms: 5,
    bathrooms: 5,
    area: 5200,
    yearBuilt: 2016,
    address: { street: '18 Costa Bella Dr', city: 'Miami', state: 'FL', zipCode: '33139' },
    amenities: ['Pool', 'Ocean View', 'Wine Cellar', 'Home Theater', 'Garage', 'Garden'],
    images: [img('photo-1613490493576-7fde63acd811'), img('photo-1613977257363-707ba9348227'), img('photo-1600047509807-ba8f99d2cdde')],
    featured: true,
  },
  {
    title: 'Cozy Studio Near University',
    description:
      'Perfect starter home or investment property. This bright, efficient studio is steps from campus, cafes, and transit. Recently renovated with modern appliances and durable finishes.',
    type: 'apartment',
    status: 'for-rent',
    price: 1150,
    bedrooms: 1,
    bathrooms: 1,
    area: 480,
    yearBuilt: 2008,
    address: { street: '77 College Way, Apt 3B', city: 'Boston', state: 'MA', zipCode: '02115' },
    amenities: ['Laundry', 'Heating', 'Internet'],
    images: [img('photo-1554995207-c18c203602cb'), img('photo-1536376072261-38c75010e6c9')],
  },
  {
    title: 'Sleek Waterfront Condo',
    description:
      'Contemporary condo with unobstructed water views, an open floor plan, and access to a rooftop lounge. Building amenities include a fitness center, sauna, and 24-hour security.',
    type: 'condo',
    status: 'for-sale',
    price: 985000,
    bedrooms: 3,
    bathrooms: 2,
    area: 1680,
    yearBuilt: 2020,
    address: { street: '350 Harborview Blvd, Unit 12A', city: 'San Diego', state: 'CA', zipCode: '92101' },
    amenities: ['Gym', 'Sauna', 'Rooftop Lounge', 'Security', 'Parking', 'Ocean View'],
    images: [img('photo-1512917774080-9991f1c4c750'), img('photo-1600566753086-00f18fb6b3ea'), img('photo-1600210492486-724fe5c67fb0')],
    featured: true,
  },
  {
    title: 'Charming Craftsman Bungalow',
    description:
      'A lovingly maintained craftsman bungalow with original hardwood floors, built-in cabinetry, a wraparound porch, and a detached studio ideal for a home office or guest suite.',
    type: 'house',
    status: 'for-sale',
    price: 512000,
    bedrooms: 3,
    bathrooms: 2,
    area: 1720,
    yearBuilt: 1928,
    address: { street: '15 Alder Street', city: 'Portland', state: 'OR', zipCode: '97205' },
    amenities: ['Porch', 'Fireplace', 'Garden', 'Home Office'],
    images: [img('photo-1518780664697-55e3ad937233'), img('photo-1583608205776-bfd35f0d9f83')],
  },
  {
    title: 'Prime Commercial Corner Lot',
    description:
      'High-visibility commercial space on a busy corner with excellent foot traffic. Open floor plan suitable for retail, dining, or office conversion. Includes six dedicated parking spots.',
    type: 'commercial',
    status: 'for-sale',
    price: 1275000,
    bedrooms: 0,
    bathrooms: 2,
    area: 3400,
    yearBuilt: 2005,
    address: { street: '201 Main & 5th', city: 'Denver', state: 'CO', zipCode: '80202' },
    amenities: ['Parking', 'Security', 'Loading Dock'],
    images: [img('photo-1486406146926-c627a92ad1ab'), img('photo-1497366216548-37526070297c')],
  },
  {
    title: 'Sunny Two-Bedroom with Balcony',
    description:
      'Airy two-bedroom apartment on a tree-lined street. South-facing windows, updated kitchen with stone counters, and a generous balcony overlooking the courtyard garden.',
    type: 'apartment',
    status: 'for-rent',
    price: 2100,
    bedrooms: 2,
    bathrooms: 1,
    area: 890,
    yearBuilt: 2014,
    address: { street: '8 Linden Court, Apt 5', city: 'Chicago', state: 'IL', zipCode: '60614' },
    amenities: ['Balcony', 'Laundry', 'Heating', 'Pet Friendly'],
    images: [img('photo-1493809842364-78817add7ffb'), img('photo-1484154218962-a197022b5858')],
  },
  {
    title: '5-Acre Buildable Land Parcel',
    description:
      'Rare opportunity to own five gently sloping acres with utilities at the road and approved building permits. Ideal for a custom estate or small development, twenty minutes from downtown.',
    type: 'land',
    status: 'for-sale',
    price: 395000,
    bedrooms: 0,
    bathrooms: 0,
    area: 217800,
    address: { street: 'Lot 12, Ridgeline Rd', city: 'Nashville', state: 'TN', zipCode: '37201' },
    amenities: ['Utilities Ready', 'Road Access'],
    images: [img('photo-1500382017468-9049fed747ef'), img('photo-1500530855697-b586d89ba3ee')],
  },
  {
    title: 'Renovated Loft in Arts District',
    description:
      'Industrial-chic loft with exposed brick, soaring 14-foot ceilings, and oversized windows. Walk to galleries, restaurants, and the weekend market. Includes deeded parking.',
    type: 'condo',
    status: 'for-sale',
    price: 678000,
    bedrooms: 1,
    bathrooms: 2,
    area: 1240,
    yearBuilt: 1972,
    address: { street: '410 Foundry Ln, Loft 7', city: 'Los Angeles', state: 'CA', zipCode: '90013' },
    amenities: ['Parking', 'High Ceilings', 'Exposed Brick', 'Elevator'],
    images: [img('photo-1536708880921-03a9306ec47d'), img('photo-1560185007-cde436f6a4d0')],
  },
  {
    title: 'Hillside Retreat with Views',
    description:
      'Tucked into the hills, this serene retreat offers floor-to-ceiling glass, a chef\'s kitchen, and a deck made for sunsets. Minutes from hiking trails yet close to the city.',
    type: 'house',
    status: 'for-sale',
    price: 1150000,
    bedrooms: 4,
    bathrooms: 3,
    area: 3100,
    yearBuilt: 2017,
    address: { street: '9 Summit Ridge', city: 'Phoenix', state: 'AZ', zipCode: '85004' },
    amenities: ['Mountain View', 'Deck', 'Smart Home', 'Garage', 'Fireplace'],
    images: [img('photo-1600585154526-990dced4db0d'), img('photo-1600566752355-35792bedcfea'), img('photo-1600573472592-401b489a3cdc')],
    featured: true,
  },
  {
    title: 'Family Villa Near Top Schools',
    description:
      'Spacious villa in a family-friendly enclave with award-winning schools. Highlights include a play lawn, three-car garage, media room, and a resort-style backyard with covered patio.',
    type: 'villa',
    status: 'for-rent',
    price: 5800,
    bedrooms: 5,
    bathrooms: 4,
    area: 4300,
    yearBuilt: 2012,
    address: { street: '31 Orchard Bend', city: 'Dallas', state: 'TX', zipCode: '75201' },
    amenities: ['Garage', 'Garden', 'Media Room', 'Patio', 'Pool'],
    images: [img('photo-1564013799919-ab600027ffc6'), img('photo-1600596542815-ffad4c1539a9')],
  },
];

const seed = async () => {
  await mongoose.connect(env.MONGO_URI);
  console.log('Connected. Seeding…');

  let demo = await User.findOne({ email: 'demo@homehaven.com' });
  if (!demo) {
    demo = await User.create({
      name: 'Demo Agent',
      email: 'demo@homehaven.com',
      password: 'Demo1234',
      role: 'agent',
      phone: '+1 (555) 010-2030',
    });
    console.log('Created demo user demo@homehaven.com / Demo1234');
  }

  await Property.deleteMany({ owner: demo._id });
  const docs = await Property.insertMany(
    sampleProperties.map((p) => ({ ...p, owner: demo._id, views: Math.floor(Math.random() * 400) }))
  );
  console.log(`Seeded ${docs.length} properties.`);

  await mongoose.disconnect();
  console.log('Done.');
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
