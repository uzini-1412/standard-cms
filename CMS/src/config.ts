// 백엔드 API 주소 설정.
// 값은 Vite 환경변수(VITE_SERVER_URL)에서 읽으며, 미설정 시 로컬 개발 서버로 폴백한다.
// 환경별 주소는 .env 파일에서 관리한다 (.env.example 참고).

export const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:5000';
export const API_BASE_URL = `${SERVER_URL}/api`;
