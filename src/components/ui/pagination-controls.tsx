import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  className?: string;
}

export function PaginationControls({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
  className,
}: PaginationControlsProps) {
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className={cn('flex items-center justify-between px-4 py-3 border-t border-slate-800/50', className)}>
      <div className="flex items-center gap-4">
        <p className="text-sm text-slate-400">
          Showing <span className="font-medium text-slate-200">{startItem}</span> to{' '}
          <span className="font-medium text-slate-200">{endItem}</span> of{' '}
          <span className="font-medium text-slate-200">{total}</span> results
        </p>
        {onLimitChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Per page:</span>
            <Select value={limit.toString()} onValueChange={(v) => onLimitChange(Number(v))}>
              <SelectTrigger className="w-[70px] h-8 bg-slate-800/50 border-slate-700/50 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className="h-8 w-8 border-slate-700/50 text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-50"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="h-8 w-8 border-slate-700/50 text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-1 px-2">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (page <= 3) {
              pageNum = i + 1;
            } else if (page >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = page - 2 + i;
            }
            
            return (
              <Button
                key={pageNum}
                variant={page === pageNum ? 'default' : 'outline'}
                size="icon"
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  'h-8 w-8',
                  page === pageNum
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-900 border-transparent'
                    : 'border-slate-700/50 text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                )}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="h-8 w-8 border-slate-700/50 text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          className="h-8 w-8 border-slate-700/50 text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-50"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
