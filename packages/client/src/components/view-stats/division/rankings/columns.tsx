import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSetAtom } from "jotai";
import { viewAtom } from "../..";

export type TeamRanking = {
  id: number;
  name: string;
  leagueRank: number | null;
  totalU23Minutes: number;
  totalU20Minutes: number;
};

export const columns: ColumnDef<TeamRanking>[] = [
  {
    accessorKey: "leagueRank",
    header: ({ column }) => {
      return (
        <div className="text-center font-medium">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Position
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="text-center font-medium">
          {row.getValue("leagueRank")}
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Team",
    cell: ({ row }) => {
      const setView = useSetAtom(viewAtom);
      return (
        <Button
          variant="link"
          onClick={() => {
            setView((prev) => [
              ...prev,
              {
                type: "TEAM",
                value: row.original.id,
                title: row.getValue("name"),
                breadcrumbText: row.getValue("name"),
              },
            ]);
          }}
        >
          {row.getValue("name")}
        </Button>
      );
    },
  },
  {
    accessorKey: "totalU23Minutes",
    header: ({ column }) => {
      return (
        <div className="text-right font-medium">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            U-23 Minutes
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="text-right font-medium">
          {row.original.totalU23Minutes.toLocaleString()}
        </div>
      );
    },
  },
  {
    accessorKey: "totalU20Minutes",
    header: ({ column }) => {
      return (
        <div className="text-right font-medium">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            U-20 Minutes
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="text-right font-medium">
          {row.original.totalU20Minutes.toLocaleString()}
        </div>
      );
    },
  },
];
