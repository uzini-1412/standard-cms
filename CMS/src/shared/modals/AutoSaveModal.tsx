interface AutoSaveModalProps {
  isOpen: boolean;
  onLoad: () => void;
  onDiscard: () => void;
}

export function AutoSaveModal({ isOpen, onLoad, onDiscard }: AutoSaveModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
      onClick={onDiscard}
    >
      <div 
        className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2">임시저장된 데이터</h3>
          <p className="text-sm text-gray-600">
            작성 중이던 데이터가 있습니다.<br />
            이어서 작성하시겠습니까?
          </p>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onDiscard}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors text-sm"
          >
            새로 작성
          </button>
          <button
            onClick={onLoad}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
          >
            이어서 작성
          </button>
        </div>
      </div>
    </div>
  );
}