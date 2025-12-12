import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * ResponsiveTable - Converts to card layout on mobile
 * @param {Array} columns - [{key: string, label: string, render?: (value, row) => ReactNode}]
 * @param {Array} data - Array of data objects
 * @param {Function} onRowClick - Optional click handler
 */
export function ResponsiveTable({ columns, data, onRowClick, className }) {
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className={cn("w-full border-collapse", className)}>
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left p-3 text-sm font-medium text-muted-foreground"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={idx}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "border-b border-border transition-colors",
                  onRowClick && "cursor-pointer hover:bg-muted/50"
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className="p-3 text-sm">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {data.map((row, idx) => (
          <Card
            key={idx}
            onClick={() => onRowClick?.(row)}
            className={cn(
              "transition-shadow",
              onRowClick && "cursor-pointer hover:shadow-md"
            )}
          >
            <CardContent className="p-4 space-y-2">
              {columns.map((col) => (
                <div key={col.key} className="flex justify-between items-start gap-2">
                  <span className="text-xs font-medium text-muted-foreground min-w-[80px]">
                    {col.label}
                  </span>
                  <span className="text-sm text-right flex-1">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

/**
 * ResponsiveList - Simple list that stacks items on mobile
 */
export function ResponsiveList({ items, renderItem, className }) {
  return (
    <div className={cn("space-y-2 sm:space-y-3", className)}>
      {items.map((item, idx) => (
        <div key={idx}>{renderItem(item, idx)}</div>
      ))}
    </div>
  );
}