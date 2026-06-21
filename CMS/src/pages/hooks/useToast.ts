// Toast 훅 사용 예시 파일
// 실제로는 /src/app/contexts/ToastContext.tsx에서 export한 useToast를 사용하세요.

/**
 * 사용 방법:
 * 
 * 1. 컴포넌트에서 import:
 * import { useToast } from '../contexts/ToastContext';
 * 
 * 2. 컴포넌트 내에서 훅 사용:
 * const { showToast } = useToast();
 * 
 * 3. 등록/수정 성공 시 호출:
 * showToast('고객정보가 등록되었습니다');
 * showToast('상담정보가 수정되었습니다');
 * showToast('계약정보가 삭제되었습니다');
 * 
 * 예시:
 * 
 * function MyComponent() {
 *   const { showToast } = useToast();
 *   
 *   const handleSubmit = () => {
 *     // 저장 로직...
 *     showToast('고객정보가 등록되었습니다');
 *   };
 *   
 *   return <button onClick={handleSubmit}>등록</button>;
 * }
 */

export {};
