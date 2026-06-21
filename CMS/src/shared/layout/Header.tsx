import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export function Header() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 현재 경로 확인
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // 메뉴 닫기
  const closeMenu = () => setIsMenuOpen(false);

  // [데스크탑] 네비게이션 링크 스타일
  const getLinkClass = (path: string) => {
    const base = "px-4 py-2 rounded-lg transition font-bold text-[1.1em]";
    const active = isActive(path) ? "bg-blue-700" : "hover:bg-blue-500";
    return `${base} ${active}`;
  };

  // [모바일] 사이드 메뉴 링크 스타일 (Active 상태 강조)
  const getDrawerItemClass = (path: string) => {
    // 1. 공통 스타일
    const baseClass = "block px-6 py-4 font-medium border-b border-gray-100 transition-colors duration-200";
    
    // 2. 현재 페이지일 때: 파란 배경 + 진한 글씨 + 왼쪽 파란 띠
    const activeClass = "bg-blue-50 text-blue-700 border-l-4 border-l-blue-600";
    
    // 3. 아닐 때: 회색 글씨 + 호버 시 연한 회색 배경
    const inactiveClass = "text-gray-700 hover:bg-gray-50 hover:text-blue-600 border-l-4 border-l-transparent";

    return `${baseClass} ${isActive(path) ? activeClass : inactiveClass}`;
  };

  return (
    <header className="bg-blue-600 text-white  sticky top-0 z-50 relative">
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-6 py-3">
        <div className="flex items-center justify-between">
          
          {/* 1. 로고 (왼쪽) */}
          <Link to="/" className="flex items-center hover:opacity-80 transition z-50" onClick={closeMenu}>
            <span className="font-extrabold text-xl md:text-2xl tracking-tight text-white">CMS</span>
            <span className="ml-2 hidden sm:inline text-sm font-medium text-blue-100">Customer Management</span>
          </Link>
          
          {/* 2. 데스크탑 네비게이션 (lg 이상 보임, 중앙 정렬) */}
          <nav className="hidden lg:flex space-x-2 xl:space-x-8 absolute left-1/2 transform -translate-x-1/2">
            <Link to="/" className={getLinkClass('/')}>홈</Link>
            <Link to="/customer-status" className={getLinkClass('/customer-status')}>고객현황</Link>
            <Link to="/consultation-history" className={getLinkClass('/consultation-history')}>상담현황</Link>
            <Link to="/contract-history" className={getLinkClass('/contract-history')}>계약현황</Link>
            <Link to="/manager-status" className={getLinkClass('/manager-status')}>담당자현황</Link>
          </nav>
          
          {/* 3. 우측 여백 (데스크탑 레이아웃 균형용) */}
          <div className="hidden lg:block w-32"></div>

          {/* 4. 햄버거 버튼 (lg 미만 보임) */}
          <button 
            className="lg:hidden p-1 text-white focus:outline-none z-50 cursor-pointer"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={28} />
          </button>
        </div>
      </div>

      <div 
        className={`
          fixed inset-0 bg-black/50 z-[60] lg:hidden transition-opacity duration-300
          ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}
        `}
        onClick={closeMenu} 
      />

      {/* 2. 슬라이드 메뉴 본체 */}
      <div 
        className={`
          fixed top-0 right-0 h-full w-[280px] bg-white text-gray-800  z-[70] lg:hidden
          transform transition-transform duration-300 ease-in-out
          ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} 
        `}
      >
        <div className="flex flex-col h-full">
          
          {/* 메뉴 헤더 (닫기 버튼) */}
          <div className="p-5 flex justify-between items-center border-b border-gray-100 bg-blue-600 text-white">
            <span className="font-bold text-lg">메뉴</span>
            <button onClick={closeMenu} className="focus:outline-none hover:bg-blue-500 p-1 rounded transition-colors cursor-pointer">
              <X size={24} />
            </button>
          </div>

          {/* 메뉴 리스트 (함수 적용됨) */}
          <nav className="flex-1 overflow-y-auto py-0">
            <Link to="/" className={getDrawerItemClass('/')} onClick={closeMenu}>홈</Link>
            <Link to="/customer-status" className={getDrawerItemClass('/customer-status')} onClick={closeMenu}>고객현황</Link>
            <Link to="/consultation-history" className={getDrawerItemClass('/consultation-history')} onClick={closeMenu}>상담현황</Link>
            <Link to="/contract-history" className={getDrawerItemClass('/contract-history')} onClick={closeMenu}>계약현황</Link>
            <Link to="/manager-status" className={getDrawerItemClass('/manager-status')} onClick={closeMenu}>담당자현황</Link>
          </nav>

          {/* 메뉴 하단 */}
          <div className="p-5 text-center text-xs text-gray-300">
            © Customer Management System
          </div>

        </div>
      </div>
    </header>
  );
}