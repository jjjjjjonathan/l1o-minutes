import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export type Player = {
  playerId: number;
  playerName: string;
  yearOfBirth: number;
  totalMinutes: number;
  isU23: boolean;
  isU20: boolean;
};

export const columns: ColumnDef<Player>[] = [
  {
    accessorKey: "playerName",
    header: ({ column }) => {
      return (
        <div className="font-medium">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("playerName")}</div>;
    },
  },
  {
    accessorKey: "yearOfBirth",
    header: ({ column }) => {
      return (
        <div className="text-right font-medium">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Year of birth
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="text-right font-medium">
          {row.getValue("yearOfBirth")}
        </div>
      );
    },
  },
  {
    accessorKey: "totalMinutes",
    header: ({ column }) => {
      return (
        <div className="text-right font-medium">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Minutes played
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="text-right font-medium">
          {row.getValue("totalMinutes")}
        </div>
      );
    },
  },
];
