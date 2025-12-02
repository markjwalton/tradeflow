import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ 
  currentPage, 
  totalItems, 
  itemsPerPage, 
  onPageChange, 
  onItemsPerPageChange,
  pageSizeOptions = [10, 20, 30, 50]
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalItems === 0) return null;

  return (
    <div className="flex items-center justify-between py-4 border-t">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>Show</span>
        <Select value={String(itemsPerPage)} onValueChange={(v) => onItemsPerPageChange(parseInt(v))}>
          <SelectTrigger className="w-16 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map(size => (
              <SelectItem key={size} value={String(size)}>{size}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>of {totalItems} items</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          {startItem}-{endItem} of {totalItems}
        </span>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {totalPages <= 5 ? (
            Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            ))
          ) : (
            <>
              <Button
                variant={currentPage === 1 ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(1)}
              >
                1
              </Button>
              {currentPage > 3 && <span className="px-2">...</span>}
              {currentPage > 2 && currentPage < totalPages && (
                <Button
                  variant="default"
                  size="icon"
                  className="h-8 w-8"
                >
                  {currentPage}
                </Button>
              )}
              {currentPage < totalPages - 2 && <span className="px-2">...</span>}
              <Button
                variant={currentPage === totalPages ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(totalPages)}
              >
                {totalPages}
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}