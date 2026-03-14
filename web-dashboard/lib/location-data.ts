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
      cities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Thane', 'Kalyan', 'Navi Mumbai', 'Vasai-Virar', 'Pimpri-Chinchwad', 'Kolhapur', 'Amravati', 'Akola', 'Sangli', 'Jalgaon', 'Latur', 'Dhule', 'Ahmednagar', 'Chandrapur', 'Other']
    },
    {
      name: 'Delhi',
      country: 'India',
      cities: ['New Delhi', 'Central Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Dwarka', 'Rohini', 'Connaught Place', 'Karol Bagh', 'Lajpat Nagar', 'Other']
    },
    {
      name: 'Karnataka',
      country: 'India',
      cities: ['Bangalore', 'Mysore', 'Mangalore', 'Hubli', 'Belgaum', 'Dharwad', 'Shimoga', 'Tumkur', 'Bellary', 'Vijayapura', 'Gulbarga', 'Davangere', 'Hassan', 'Bidar', 'Udupi', 'Chitradurga', 'Other']
    },
    {
      name: 'Tamil Nadu',
      country: 'India',
      cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Thanjavur', 'Dindigul', 'Ranipet', 'Sivakasi', 'Karur', 'Kumbakonam', 'Tiruppur', 'Nagercoil', 'Other']
    },
    {
      name: 'Gujarat',
      country: 'India',
      cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Junagadh', 'Anand', 'Bharuch', 'Vapi', 'Navsari', 'Mehsana', 'Morbi', 'Nadiad', 'Surendranagar', 'Other']
    },
    {
      name: 'West Bengal',
      country: 'India',
      cities: ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Darjeeling', 'Kharagpur', 'Haldia', 'Rajarhat', 'Burdwan', 'Malda', 'Barasat', 'Krishnanagar', 'Shantipur', 'Other']
    },
    {
      name: 'Rajasthan',
      country: 'India',
      cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Alwar', 'Bhilwara', 'Bharatpur', 'Sikar', 'Pali', 'Tonk', 'Kishangarh', 'Beawar', 'Hanumangarh', 'Sri Ganganagar', 'Other']
    },
    {
      name: 'Telangana',
      country: 'India',
      cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet', 'Miryalaguda', 'Siddipet', 'Other']
    },
    {
      name: 'Kerala',
      country: 'India',
      cities: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kannur', 'Kollam', 'Palakkad', 'Alappuzha', 'Malappuram', 'Kottayam', 'Kasaragod', 'Pathanamthitta', 'Other']
    },
    {
      name: 'Andhra Pradesh',
      country: 'India',
      cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Tirupati', 'Kakinada', 'Rajahmundry', 'Kadapa', 'Kurnool', 'Anantapur', 'Vizianagaram', 'Eluru', 'Ongole', 'Chittoor', 'Other']
    },
    {
      name: 'Punjab',
      country: 'India',
      cities: ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Pathankot', 'Hoshiarpur', 'Moga', 'Malerkotla', 'Khanna', 'Phagwara', 'Muktsar', 'Other']
    },
    {
      name: 'Haryana',
      country: 'India',
      cities: ['Gurgaon', 'Faridabad', 'Panipat', 'Ambala', 'Hisar', 'Rohtak', 'Karnal', 'Sonipat', 'Yamunanagar', 'Panchkula', 'Bhiwani', 'Sirsa', 'Bahadurgarh', 'Jind', 'Palwal', 'Other']
    },
    {
      name: 'Uttar Pradesh',
      country: 'India',
      cities: ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut', 'Allahabad', 'Noida', 'Ghaziabad', 'Bareilly', 'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Firozabad', 'Jhansi', 'Mathura', 'Muzaffarnagar', 'Rampur', 'Greater Noida', 'Bulandshahr', 'Other']
    },
    {
      name: 'Madhya Pradesh',
      country: 'India',
      cities: ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Ratlam', 'Satna', 'Dewas', 'Rewa', 'Katni', 'Singrauli', 'Burhanpur', 'Khandwa', 'Morena', 'Other']
    },
    {
      name: 'Bihar',
      country: 'India',
      cities: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar', 'Munger', 'Chhapra', 'Saharsa', 'Sasaram', 'Hajipur', 'Other']
    },
    {
      name: 'Odisha',
      country: 'India',
      cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore', 'Baripada', 'Bhadrak', 'Jharsuguda', 'Jeypore', 'Balangir', 'Other']
    },
    {
      name: 'Jharkhand',
      country: 'India',
      cities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh', 'Deoghar', 'Giridih', 'Ramgarh', 'Medininagar', 'Phusro', 'Dumka', 'Chaibasa', 'Other']
    },
    {
      name: 'Assam',
      country: 'India',
      cities: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Tezpur', 'Nagaon', 'Tinsukia', 'Bongaigaon', 'Dhubri', 'Diphu', 'North Lakhimpur', 'Karimganj', 'Other']
    },
    {
      name: 'Chhattisgarh',
      country: 'India',
      cities: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon', 'Jagdalpur', 'Raigarh', 'Ambikapur', 'Dhamtari', 'Mahasamund', 'Other']
    },
    {
      name: 'Uttarakhand',
      country: 'India',
      cities: ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Nainital', 'Rudrapur', 'Kashipur', 'Rishikesh', 'Pithoragarh', 'Tehri', 'Mussoorie', 'Other']
    },
    {
      name: 'Goa',
      country: 'India',
      cities: ['Panaji', 'Vasco da Gama', 'Margao', 'Mapusa', 'Ponda', 'Bicholim', 'Curchorem', 'Sanquelim', 'Cuncolim', 'Other']
    },
    {
      name: 'Himachal Pradesh',
      country: 'India',
      cities: ['Shimla', 'Manali', 'Dharamshala', 'Kullu', 'Solan', 'Mandi', 'Palampur', 'Baddi', 'Nahan', 'Una', 'Hamirpur', 'Bilaspur', 'Other']
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
