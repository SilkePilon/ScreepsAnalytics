"use client"

import * as React from "react"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconTrophy,
} from "@tabler/icons-react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"

import { UserStats } from "@/lib/screeps-api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const columns: ColumnDef<UserStats>[] = [
  {
    id: "rank",
    header: "Rank",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.index < 3 ? (
          <IconTrophy
            className={
              row.index === 0
                ? "text-yellow-500"
                : row.index === 1
                ? "text-gray-400"
                : "text-amber-600"
            }
          />
        ) : null}
        <span className="font-medium">#{row.index + 1}</span>
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.username}</div>
    ),
  },
  {
    accessorKey: "gcl",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          GCL
          <IconChevronDown
            className={`ml-2 size-4 transition-transform ${
              column.getIsSorted() === "asc" ? "rotate-180" : ""
            }`}
          />
        </Button>
      )
    },
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        {row.original.gcl.toLocaleString()}
      </Badge>
    ),
  },
  {
    accessorKey: "rooms",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Rooms
          <IconChevronDown
            className={`ml-2 size-4 transition-transform ${
              column.getIsSorted() === "asc" ? "rotate-180" : ""
            }`}
          />
        </Button>
      )
    },
    cell: ({ row }) => <div className="text-center">{row.original.rooms}</div>,
  },
  {
    accessorKey: "avgRCL",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Avg RCL
          <IconChevronDown
            className={`ml-2 size-4 transition-transform ${
              column.getIsSorted() === "asc" ? "rotate-180" : ""
            }`}
          />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.avgRCL > 0 ? row.original.avgRCL.toFixed(1) : "-"}
      </div>
    ),
  },
  {
    accessorKey: "totalCreeps",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Active Creeps
          <IconChevronDown
            className={`ml-2 size-4 transition-transform ${
              column.getIsSorted() === "asc" ? "rotate-180" : ""
            }`}
          />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.totalCreeps}
      </div>
    ),
  },
  {
    accessorKey: "totalSpawns",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Spawns
          <IconChevronDown
            className={`ml-2 size-4 transition-transform ${
              column.getIsSorted() === "asc" ? "rotate-180" : ""
            }`}
          />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.totalSpawns}
      </div>
    ),
  },
  {
    accessorKey: "totalTowers",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Towers
          <IconChevronDown
            className={`ml-2 size-4 transition-transform ${
              column.getIsSorted() === "asc" ? "rotate-180" : ""
            }`}
          />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.totalTowers}
      </div>
    ),
  },
  {
    accessorKey: "totalExtensions",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Extensions
          <IconChevronDown
            className={`ml-2 size-4 transition-transform ${
              column.getIsSorted() === "asc" ? "rotate-180" : ""
            }`}
          />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.totalExtensions}
      </div>
    ),
  },
  {
    accessorKey: "totalStorage",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Storage
          <IconChevronDown
            className={`ml-2 size-4 transition-transform ${
              column.getIsSorted() === "asc" ? "rotate-180" : ""
            }`}
          />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.totalStorage}
      </div>
    ),
  },
]

export function PlayerLeaderboard({ data }: { data: UserStats[] }) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "gcl", desc: true },
  ])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Filter usernames..."
          value={(table.getColumn("username")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("username")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No players found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-4">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          Showing {table.getRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} players
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <IconChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <IconChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <IconChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <IconChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
