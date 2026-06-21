// 지역구분별 색상 매핑
export const getRegionColor = (region: string): string => {
  switch(region) {
    case '서울':
      return '#2563eb'; // blue-600
    case '경기':
      return '#16a34a'; // green-600
    case '인천':
      return '#ea580c'; // orange-600
    case '부산':
      return '#9333ea'; // purple-600
    case '대구':
      return '#dc2626'; // red-600
    case '광주':
      return '#0d9488'; // teal-600
    case '대전':
      return '#d97706'; // amber-600
    case '울산':
      return '#4f46e5'; // indigo-600
    case '세종':
      return '#7c3aed'; // violet-600
    case '강원':
      return '#0891b2'; // cyan-600
    case '충북':
      return '#65a30d'; // lime-600
    case '충남':
      return '#e11d48'; // rose-600
    case '전북':
      return '#0284c7'; // sky-600
    case '전남':
      return '#059669'; // emerald-600
    case '경북':
      return '#db2777'; // pink-600
    case '경남':
      return '#8b5cf6'; // violet-500
    case '제주':
      return '#14b8a6'; // teal-500
    default:
      return '#6b7280'; // gray-500
  }
};

// 사업구분별 색상 매핑 (진한 색상)
const BUSINESS_TYPE_COLORS: { [key: string]: string } = {
  '컨설팅': '#2563eb',    // blue-600
  '스마트공장': '#16a34a', // green-600
  '클라우드': '#0891b2',   // cyan-600
  '플랫폼': '#7c3aed',     // violet-600
  '앱': '#db2777',         // pink-600
};

// 새로운 사업구분을 위한 색상 팔레트
const BUSINESS_TYPE_PALETTE = [
  '#2563eb', // blue-600
  '#16a34a', // green-600
  '#0891b2', // cyan-600
  '#7c3aed', // violet-600
  '#db2777', // pink-600
  '#ea580c', // orange-600
  '#9333ea', // purple-600
  '#0d9488', // teal-600
  '#d97706', // amber-600
  '#4f46e5', // indigo-600
  '#dc2626', // red-600
  '#65a30d', // lime-600
];

// 문자열을 해시값으로 변환
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// 사업구분별 색상 반환 (단일 색상)
export const getBusinessTypeColor = (type: string): string => {
  // 기본 정의된 색상이 있으면 반환
  if (BUSINESS_TYPE_COLORS[type]) {
    return BUSINESS_TYPE_COLORS[type];
  }
  
  // 새로운 사업구분: 해시 기반으로 팔레트에서 선택
  const hash = hashString(type);
  const index = hash % BUSINESS_TYPE_PALETTE.length;
  return BUSINESS_TYPE_PALETTE[index];
};