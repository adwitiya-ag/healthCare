// Enum arrays — swap these for API calls later
export const QUALIFICATIONS = [
  { id: 1, label: 'MBBS', active: true },
  { id: 2, label: 'MD', active: true },
  { id: 3, label: 'BDS', active: true },
  { id: 4, label: 'MDS', active: true },
  { id: 5, label: 'MS', active: true },
  { id: 6, label: 'DNB', active: true },
  { id: 7, label: 'DM', active: true },
  { id: 8, label: 'MCh', active: false },
];

export const SPECIALISATIONS = [
  { id: 1, label: 'General Physician', active: true },
  { id: 2, label: 'Cardiologist', active: true },
  { id: 3, label: 'Dermatologist', active: true },
  { id: 4, label: 'Gynaecologist', active: true },
  { id: 5, label: 'Orthopaedic', active: true },
  { id: 6, label: 'Paediatrician', active: true },
  { id: 7, label: 'Neurologist', active: true },
  { id: 8, label: 'Diabetologist', active: true },
  { id: 9, label: 'Pulmonologist', active: true },
  { id: 10, label: 'Gastroenterologist', active: false },
];

export const CHEMIST_TYPES = [
  { id: 1, label: 'Retail Chemist' },
  { id: 2, label: 'Wholesale Chemist' },
  { id: 3, label: 'Hospital Pharmacy' },
  { id: 4, label: 'Online Pharmacy' },
  { id: 5, label: 'Jan Aushadhi' },
];

export const VISIT_TYPES = [
  { id: 1, label: 'Regular Visit' },
  { id: 2, label: 'Sample Distribution' },
  { id: 3, label: 'Product Detailing' },
  { id: 4, label: 'Follow-up' },
  { id: 5, label: 'New Introduction' },
];

export const PREFERENCE_LEVELS = [
  { id: 1, label: 'High' },
  { id: 2, label: 'Medium' },
  { id: 3, label: 'Low' },
  { id: 4, label: 'No Preference' },
];

export const CITIES = [
  'Mumbai', 'Pune', 'Nashik', 'Aurangabad', 'Nagpur',
  'Ahmedabad', 'Kolkata', 'Vadodara', 'Rajkot', 'Delhi',
];

export const AREAS = {
  Mumbai: ['Andheri', 'Bandra', 'Borivali', 'Dadar', 'Kurla', 'Thane'],
  Pune: ['Shivajinagar', 'Kothrud', 'Hadapsar', 'Viman Nagar', 'Pimpri'],
  Nashik: ['Gangapur Road', 'Satpur', 'Cidco', 'Nashik Road'],
  Aurangabad: ['MIDC', 'Cantonment', 'Cidco', 'Garkheda'],
  Nagpur: ['Dharampeth', 'Sadar', 'Sitabuldi', 'Wardhaman Nagar'],
  Ahmedabad: ['Navrangpura', 'Satellite', 'Bopal', 'Maninagar'],
  Kolkata: ['Park Street', 'Salt Lake', 'Behala', 'Shyamaprasad'],
  Vadodara: ['Alkapuri', 'Fatehgunj', 'Gotri', 'Manjalpur'],
  Rajkot: ['Kalawad Road', 'Mavdi', 'Raiya Road', 'Tagore Marg'],
  Delhi: ['Connaught Place', 'Rohini', 'Dwarka', 'Lajpat Nagar'],
};
