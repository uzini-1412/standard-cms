
import { API_BASE_URL } from "../config";
const BASE_URL = `${API_BASE_URL}/contracts`; 

export async function getAllContracts() {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    throw new Error('계약 이력을 불러오는데 실패했습니다.');
  }
  return response.json();
}