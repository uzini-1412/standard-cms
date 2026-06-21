import { API_BASE_URL } from "../config";
const BASE_URL = `${API_BASE_URL}/consultations`; 

export async function getAllConsultations() {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    throw new Error('상담 이력을 불러오는데 실패했습니다.');
  }
  return response.json();
}