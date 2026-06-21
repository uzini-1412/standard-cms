// 현재 날짜와 시간을 포맷팅하여 반환
export const getCurrentDateTime = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? '오후' : '오전';
  const displayHours = hours % 12 || 12;
  
  return `${year}-${month}-${day} ${ampm} ${String(displayHours).padStart(2, '0')}:${minutes}:${seconds}`;
};

// 현재 날짜를 ISO 형식으로 반환 (YYYY-MM-DD)
export const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

// 현재 연도 반환
export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};
