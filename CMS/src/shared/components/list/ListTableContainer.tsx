import { Children, isValidElement, type ReactNode } from "react";
import { LIST_TABLE_STYLES } from "../../styles/table-styles";
import { ServerPagination } from "./ServerPagination";

const DEFAULT_HEIGHT = "calc(100vh - 280px)";

interface ListTableContainerProps {
  children: ReactNode;
  pagination?: ReactNode;
  height?: string;
  className?: string;
}

/**
 * 목록 표 외곽 컨테이너.
 * children 중 <ServerPagination> 은 자동으로 추출해 하단 페이징 영역에 배치한다.
 */
export function ListTableContainer({
  children,
  pagination,
  height = DEFAULT_HEIGHT,
  className = "",
}: ListTableContainerProps) {
  let extractedPagination: ReactNode = null;
  const tableChildren: ReactNode[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === ServerPagination) {
      extractedPagination = child;
    } else {
      tableChildren.push(child);
    }
  });

  const finalPagination = pagination ?? extractedPagination;

  return (
    <div className={`${LIST_TABLE_STYLES.container} ${className}`}>
      <div className={LIST_TABLE_STYLES.scrollWrapper} style={{ height }}>
        {tableChildren}
      </div>
      {finalPagination && (
        <div className={LIST_TABLE_STYLES.paginationWrapper}>{finalPagination}</div>
      )}
    </div>
  );
}
