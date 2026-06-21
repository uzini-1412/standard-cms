import { API_BASE_URL } from "../config";
const BASE_URL = `${API_BASE_URL}/companies`; 

//고객 현황 조회
export const getCompanies = async () => {
  try {
    const response = await fetch(BASE_URL);
    if (!response.ok) {
      throw new Error('데이터를 불러오는데 실패했습니다.');
    }
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// 고객 상세 조회
export const getCompanyById = async (id: number | string) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`);
    
    if (!response.ok) {
      throw new Error('상세 정보를 불러오는데 실패했습니다.');
    }
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

//고객 등록


export const createCompany = async (data: FormData) => {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    body: data,
  });

  if (!response.ok) {
    const errorData = await response.json(); 
    throw errorData; 
  }
  
  return await response.json();
};


// 고객 수정

export const updateCompany = async (id: number | string, data: FormData) => {  
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    body:data,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }

  return await response.json();
};

// 고객 삭제
export const deleteCompany = async (id: number | string) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('삭제에 실패했습니다.');
  }

  return await response.json();
};

//고객번호 중복 확인 true, false 반환
export const checkDuplicateCustomerCode = async (code: string) => {
  const response = await fetch(`${BASE_URL}/check-duplicate?code=${code}`);
  
  if (!response.ok) {
    throw new Error('중복 확인 실패');
  }
  
  return await response.json(); 
};