import { API_BASE_URL } from "../config";
const BASE_URL = `${API_BASE_URL}/sales`; 
// 매출 데이터 추가 
export const addSalesData = async (data: any) => {
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('매출 데이터 등록 실패');
    }
    return await response.json();
  } catch (error) {
    console.error('Sales API Error:', error);
    throw error;
  }
};

// 매출 데이터 수정
export const updateSalesData = async (id: number, data: any) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('매출 데이터 수정 실패');
    }
    return await response.json();
  } catch (error) {
    console.error('Sales API Error:', error);
    throw error;
  }
};

// 매출 데이터 삭제
export const deleteSalesData = async (id: number) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('매출 데이터 삭제 실패');
    }
    return await response.json();
  } catch (error) {
    console.error('Sales API Error:', error);
    throw error;
  }
};