import { trpc } from "@/utils/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type DivisionItemProps = {
  name: string;
  handleClick: (view: number, title: string) => void;
  id: number;
  matchesCount: number;
};

type DivisionListProps = {
  handleClick: (view: number, title: string) => void;
};

export const DivisionList = ({ handleClick }: DivisionListProps) => {
  const { data, isLoading, isSuccess, isError } = trpc.getDivisions.useQuery();

  if (isLoading) {
    return <p>LOADING</p>;
  }

  if (isError) {
    return <p>SOMETHING WENT WRONG</p>;
  }

  if (isSuccess) {
    return (
      <>
        <div className="grid grid-cols-2 gap-4">
          {data.map((division) => (
            <DivisionItem
              name={division.name}
              key={division.id}
              id={division.id}
              matchesCount={division.matchesCount}
              handleClick={handleClick}
            />
          ))}
        </div>
      </>
    );
  }
};

export const DivisionItem = ({
  name,
  handleClick,
  id,
  matchesCount,
}: DivisionItemProps) => {
  return (
    <Card onClick={() => handleClick(id, name)} className="hover:bg-secondary">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{matchesCount} matches scraped.</CardDescription>
      </CardHeader>
    </Card>
  );
};
