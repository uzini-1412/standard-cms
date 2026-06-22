import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  LayoutDashboard,
  Building2,
  MessageSquare,
  FileText,
  Users,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { to: '/', label: '홈', icon: LayoutDashboard },
  { to: '/customer-status', label: '고객현황', icon: Building2 },
  { to: '/consultation-history', label: '상담현황', icon: MessageSquare },
  { to: '/contract-history', label: '계약현황', icon: FileText },
  { to: '/manager-status', label: '담당자현황', icon: Users },
];

export function Header() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-4 md:px-6">
        {/* 로고 */}
        <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4A5CC7] text-sm font-extrabold text-white">
            C
          </span>
          <span className="hidden text-lg font-bold tracking-tight text-slate-800 sm:inline">CMS</span>
          <span className="hidden text-sm font-medium text-slate-400 md:inline">Customer Management</span>
        </Link>

        {/* 데스크탑 네비게이션 */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? 'bg-indigo-50 text-[#4A5CC7]'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* 모바일 햄버거 */}
        <button
          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden"
          onClick={() => setIsMenuOpen(true)}
          aria-label="메뉴 열기"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* 모바일 드로어 오버레이 */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 lg:hidden ${
          isMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
        onClick={closeMenu}
      />

      {/* 모바일 드로어 */}
      <div
        className={`fixed right-0 top-0 z-[70] h-full w-[280px] transform bg-white shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <span className="text-base font-bold text-slate-800">메뉴</span>
          <button onClick={closeMenu} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100" aria-label="메뉴 닫기">
            <X size={22} />
          </button>
        </div>
        <nav className="py-2">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={closeMenu}
                className={`flex items-center gap-3 border-l-4 px-5 py-3.5 text-sm font-medium transition ${
                  active
                    ? 'border-l-[#4A5CC7] bg-indigo-50 text-[#4A5CC7]'
                    : 'border-l-transparent text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-full p-5 text-center text-xs text-slate-400">
          © Customer Management System
        </div>
      </div>
    </header>
  );
}
