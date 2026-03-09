export interface City {
  name: string;
  state: string;
}

export interface State {
  name: string;
  country: string;
  cities: string[];
}

export interface Country {
  name: string;
  code: string;
}

export const countries: Country[] = [
  { name: 'India', code: 'IN' },
  { name: 'United States', code: 'US' },
  { name: 'United Kingdom', code: 'GB' },
  { name: 'Canada', code: 'CA' },
  { name: 'Australia', code: 'AU' },
  { name: 'Germany', code: 'DE' },
  { name: 'France', code: 'FR' },
  { name: 'Italy', code: 'IT' },
  { name: 'Spain', code: 'ES' },
  { name: 'Japan', code: 'JP' },
  { name: 'China', code: 'CN' },
  { name: 'Singapore', code: 'SG' },
  { name: 'United Arab Emirates', code: 'AE' },
  { name: 'Saudi Arabia', code: 'SA' },
  { name: 'Qatar', code: 'QA' },
  { name: 'Malaysia', code: 'MY' },
  { name: 'Thailand', code: 'TH' },
  { name: 'Indonesia', code: 'ID' },
  { name: 'Philippines', code: 'PH' },
  { name: 'South Korea', code: 'KR' },
];

export const statesByCountry: Record<string, State[]> = {
  'India': [
    {
      name: 'Maharashtra',
      country: 'India',
      cities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Thane', 'Kalyan', 'Navi Mumbai']
    },
    {
      name: 'Delhi',
      country: 'India',
      cities: ['New Delhi', 'Central Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi']
    },
    {
      name: 'Karnataka',
      country: 'India',
      cities: ['Bangalore', 'Mysore', 'Mangalore', 'Hubli', 'Belgaum', 'Dharwad', 'Shimoga']
    },
    {
      name: 'Tamil Nadu',
      country: 'India',
      cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode']
    },
    {
      name: 'Gujarat',
      country: 'India',
      cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar']
    },
    {
      name: 'West Bengal',
      country: 'India',
      cities: ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Darjeeling']
    },
    {
      name: 'Rajasthan',
      country: 'India',
      cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Alwar']
    },
    {
      name: 'Telangana',
      country: 'India',
      cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar']
    },
    {
      name: 'Kerala',
      country: 'India',
      cities: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kannur', 'Kollam']
    },
    {
      name: 'Andhra Pradesh',
      country: 'India',
      cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Tirupati', 'Kakinada']
    },
    {
      name: 'Punjab',
      country: 'India',
      cities: ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda']
    },
    {
      name: 'Haryana',
      country: 'India',
      cities: ['Gurgaon', 'Faridabad', 'Panipat', 'Ambala', 'Hisar', 'Rohtak']
    },
    {
      name: 'Uttar Pradesh',
      country: 'India',
      cities: ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut', 'Allahabad', 'Noida', 'Ghaziabad']
    },
    {
      name: 'Madhya Pradesh',
      country: 'India',
      cities: ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar']
    },
    {
      name: 'Bihar',
      country: 'India',
      cities: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga']
    },
    {
      name: 'Odisha',
      country: 'India',
      cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur']
    },
    {
      name: 'Jharkhand',
      country: 'India',
      cities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh']
    },
    {
      name: 'Assam',
      country: 'India',
      cities: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Tezpur']
    },
    {
      name: 'Chhattisgarh',
      country: 'India',
      cities: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg']
    },
    {
      name: 'Uttarakhand',
      country: 'India',
      cities: ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Nainital']
    },
    {
      name: 'Goa',
      country: 'India',
      cities: ['Panaji', 'Vasco da Gama', 'Margao', 'Mapusa', 'Ponda']
    },
    {
      name: 'Himachal Pradesh',
      country: 'India',
      cities: ['Shimla', 'Manali', 'Dharamshala', 'Kullu', 'Solan']
    },
  ],
  'United States': [
    { name: 'California', country: 'United States', cities: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento'] },
    { name: 'New York', country: 'United States', cities: ['New York City', 'Buffalo', 'Rochester', 'Albany', 'Syracuse'] },
    { name: 'Texas', country: 'United States', cities: ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth'] },
    { name: 'Florida', country: 'United States', cities: ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale'] },
    { name: 'Illinois', country: 'United States', cities: ['Chicago', 'Aurora', 'Naperville', 'Joliet', 'Rockford'] },
  ],
  'United Kingdom': [
    { name: 'England', country: 'United Kingdom', cities: ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Leeds', 'Bristol'] },
    { name: 'Scotland', country: 'United Kingdom', cities: ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee', 'Inverness'] },
    { name: 'Wales', country: 'United Kingdom', cities: ['Cardiff', 'Swansea', 'Newport', 'Wrexham', 'Barry'] },
    { name: 'Northern Ireland', country: 'United Kingdom', cities: ['Belfast', 'Derry', 'Lisburn', 'Newry', 'Armagh'] },
  ],
  'Canada': [
    { name: 'Ontario', country: 'Canada', cities: ['Toronto', 'Ottawa', 'Mississauga', 'Brampton', 'Hamilton'] },
    { name: 'Quebec', country: 'Canada', cities: ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil'] },
    { name: 'British Columbia', country: 'Canada', cities: ['Vancouver', 'Victoria', 'Surrey', 'Burnaby', 'Richmond'] },
    { name: 'Alberta', country: 'Canada', cities: ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'St. Albert'] },
  ],
  'Australia': [
    { name: 'New South Wales', country: 'Australia', cities: ['Sydney', 'Newcastle', 'Wollongong', 'Central Coast', 'Maitland'] },
    { name: 'Victoria', country: 'Australia', cities: ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo', 'Shepparton'] },
    { name: 'Queensland', country: 'Australia', cities: ['Brisbane', 'Gold Coast', 'Sunshine Coast', 'Townsville', 'Cairns'] },
    { name: 'Western Australia', country: 'Australia', cities: ['Perth', 'Mandurah', 'Bunbury', 'Kalgoorlie', 'Geraldton'] },
  ],
};

export const getStatesByCountry = (country: string): State[] => {
  return statesByCountry[country] || [];
};

export const getCitiesByState = (country: string, state: string): string[] => {
  const states = statesByCountry[country] || [];
  const foundState = states.find(s => s.name === state);
  return foundState?.cities || [];
};
