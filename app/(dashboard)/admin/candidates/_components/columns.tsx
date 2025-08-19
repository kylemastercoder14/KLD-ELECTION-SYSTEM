"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CheckIcon, ChevronsUpDown, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import CellActions from "./cell-actions";
import { CandidateWithParty } from "@/types/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const columns: ColumnDef<CandidateWithParty>[] = [
  {
    accessorKey: "filtered",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Candidate
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const candidate = row.original;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [copied, setCopied] = useState(false);
      return (
        <div className="flex items-center gap-2 ml-2.5">
          <Avatar>
            <AvatarImage
              className="object-cover"
              src={candidate.imageUrl || ""}
            />
            <AvatarFallback>{candidate.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <span className="font-semibold">{candidate.user.name}</span>
            <div
              title={candidate.id}
              className="text-xs cursor-pointer text-primary gap-2 flex items-center"
            >
              <span className="w-[180px] hover:underline truncate overflow-hidden whitespace-nowrap">
                {candidate.id}
              </span>
              {copied ? (
                <CheckIcon className="size-3 text-green-600" />
              ) : (
                <CopyIcon
                  onClick={() => {
                    navigator.clipboard.writeText(candidate.id || "");
                    toast.success("Candidate ID copied to clipboard");
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="size-3 text-muted-foreground cursor-pointer"
                />
              )}
            </div>
          </div>
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      const name = (row.original.user.name ?? "").toLowerCase();
      const id = (row.original.id ?? "").toLowerCase();
      const party = (row.original.party?.name ?? "").toLowerCase();
      const search = filterValue.toLowerCase();

      return name.includes(search) || id.includes(search) || party.includes(search);
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "position",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Position
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const position = row.original.position;
      return <span className="ml-3.5">{position}</span>;
    },
  },
  {
    accessorKey: "party",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Party
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const party = row.original.party;
      return <span className="ml-3.5">{party?.name || "Independent"}</span>;
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date Joined
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const startDate = new Date(row.original.createdAt);
      return (
        <span className="ml-3.5">{`${startDate.toLocaleDateString()}`}</span>
      );
    },
  },
  {
    accessorKey: "actions",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Actions
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const actions = row.original;
      return <CellActions candidate={actions} />;
    },
  },
];
