import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePrevious5 = () => {
    const newPage = Math.max(1, currentPage - 5);
    onPageChange(newPage);
  };

  const handleNext5 = () => {
    const newPage = Math.min(totalPages, currentPage + 5);
    onPageChange(newPage);
  };

  return (
    <div className="flex items-center justify-center space-x-2 py-1 px-4 bg-white">
      <button
        onClick={handlePrevious5}
        disabled={currentPage === 1}
        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
        title="5페이지 뒤로"
      >
        <ChevronsLeft className="w-4 h-4" />
      </button>
      
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
        title="1페이지 뒤로"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      
      <span className="text-sm text-gray-700 min-w-[80px] text-center">
        {currentPage}/{totalPages} 페이지
      </span>
      
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
        title="1페이지 앞으로"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      
      <button
        onClick={handleNext5}
        disabled={currentPage === totalPages}
        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
        title="5페이지 앞으로"
      >
        <ChevronsRight className="w-4 h-4" />
      </button>
    </div>
  );
}