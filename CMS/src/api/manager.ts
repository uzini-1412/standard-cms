import { API_BASE_URL } from "../config";
const BASE_URL = `${API_BASE_URL}/managers`; 

export async function getAllManagers() {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    throw new Error('담당자 목록을 불러오는데 실패했습니다.');
  }
  return response.json();
}