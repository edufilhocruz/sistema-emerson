import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface Props {
  currentPage: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

export const LogsPagination = ({ currentPage, pageCount, onPageChange }: Props) => (
  <Pagination>
    <PaginationContent>
      <PaginationItem>
        <PaginationPrevious onClick={() => onPageChange(currentPage - 1)} className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""} />
      </PaginationItem>
      <PaginationItem>
        <span className="text-sm p-2 font-medium">Página {currentPage} de {pageCount}</span>
      </PaginationItem>
      <PaginationItem>
        <PaginationNext onClick={() => onPageChange(currentPage + 1)} className={currentPage >= pageCount ? "pointer-events-none opacity-50" : ""} />
      </PaginationItem>
    </PaginationContent>
  </Pagination>
);