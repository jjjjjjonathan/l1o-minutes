import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { DataTable } from "../../division/rankings/data-table";
import { trpc } from "@/utils/trpc";
import { columns } from "./columns";

type PlayerListProps = {
  id: number;
};
const PlayerList = ({ id }: PlayerListProps) => {
  const { data } = trpc.teams.getPlayersFromTeam.useQuery({ id });

  if (data) {
    return (
      <Card className="col-span-8 w-full">
        <CardHeader>
          <CardTitle>Players</CardTitle>
          <CardDescription>Played for this team in 2023</CardDescription>
        </CardHeader>
        <CardContent>
          {data ? (
            <DataTable columns={columns} data={data} />
          ) : (
            <p>nothing yet</p>
          )}
        </CardContent>
      </Card>
    );
  }
};

export default PlayerList;
