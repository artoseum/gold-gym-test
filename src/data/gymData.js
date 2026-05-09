export const CITIES = [
  {
    id: 'mumbai',
    name: 'Mumbai',
    gyms: [
      { id: 'andheri', name: "Gold's Gym Andheri", address: 'Lokhandwala Complex, Andheri West', capacity: 120 },
      { id: 'bandra', name: "Gold's Gym Bandra", address: 'Linking Road, Bandra West', capacity: 90 },
      { id: 'powai', name: "Gold's Gym Powai", address: 'Hiranandani Gardens, Powai', capacity: 100 },
      { id: 'malad', name: "Gold's Gym Malad", address: 'Mindspace, Malad West', capacity: 80 },
    ],
  },
  {
    id: 'delhi',
    name: 'New Delhi',
    gyms: [
      { id: 'connaught', name: "Gold's Gym Connaught Place", address: 'Block A, CP, New Delhi', capacity: 150 },
      { id: 'saket', name: "Gold's Gym Saket", address: 'Select City Walk, Saket', capacity: 110 },
      { id: 'vasant', name: "Gold's Gym Vasant Kunj", address: 'Ambience Mall, Vasant Kunj', capacity: 130 },
    ],
  },
  {
    id: 'bangalore',
    name: 'Bangalore',
    gyms: [
      { id: 'koramangala', name: "Gold's Gym Koramangala", address: '7th Block, Koramangala', capacity: 100 },
      { id: 'indiranagar', name: "Gold's Gym Indiranagar", address: '100 Feet Road, Indiranagar', capacity: 85 },
      { id: 'whitefield', name: "Gold's Gym Whitefield", address: 'Phoenix Marketcity, Whitefield', capacity: 120 },
    ],
  },
  {
    id: 'chennai',
    name: 'Chennai',
    gyms: [
      { id: 'anna', name: "Gold's Gym Anna Nagar", address: '2nd Avenue, Anna Nagar', capacity: 90 },
      { id: 'velachery', name: "Gold's Gym Velachery", address: 'VR Chennai Mall, Velachery', capacity: 100 },
    ],
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    gyms: [
      { id: 'banjara', name: "Gold's Gym Banjara Hills", address: 'Road No. 12, Banjara Hills', capacity: 110 },
      { id: 'jubilee', name: "Gold's Gym Jubilee Hills", address: 'Jubilee Hills Check Post', capacity: 95 },
      { id: 'gachibowli', name: "Gold's Gym Gachibowli", address: 'DLF Cyber City, Gachibowli', capacity: 140 },
    ],
  },
  {
    id: 'pune',
    name: 'Pune',
    gyms: [
      { id: 'koregaon', name: "Gold's Gym Koregaon Park", address: 'Lane 5, Koregaon Park', capacity: 80 },
      { id: 'hinjewadi', name: "Gold's Gym Hinjewadi", address: 'Phase 1, Hinjewadi IT Park', capacity: 100 },
    ],
  },
];

export const SLOTS = [
  {
    id: 'morning',
    label: 'Morning',
    time: '06:00 AM – 09:00 AM',
    icon: '🌅',
    peakFactor: 0.75,
  },
  {
    id: 'evening',
    label: 'Evening',
    time: '05:00 PM – 08:00 PM',
    icon: '🌆',
    peakFactor: 0.95,
  },
  {
    id: 'night',
    label: 'Night',
    time: '08:00 PM – 11:00 PM',
    icon: '🌙',
    peakFactor: 0.55,
  },
];

export const MEMBERSHIP_PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 1499,
    durationDays: 30,
    features: ['Unlimited Gym Access', 'Locker Access', 'Basic Classes', 'Social Community'],
    badge: null,
  },
  {
    id: 'annual',
    name: 'Annual',
    price: 12999,
    durationDays: 365,
    features: ['Unlimited Gym Access', 'Locker Access', 'All Classes', 'Social Community', 'Personal Trainer (2x/month)', 'Nutrition Consultation'],
    badge: 'BEST VALUE',
  },
];
