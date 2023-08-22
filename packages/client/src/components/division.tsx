import { trpc } from "@/utils/trpc";
import { Button } from "./ui/button";

type DivisionItemProps = {
  name: string;
};

export const DivisionList = () => {
  const { data, isLoading, isSuccess, isError } = trpc.getDivisions.useQuery();

  if (isLoading) {
    return <p>LOADING</p>;
  }

  if (isError) {
    return <p>SOMETHING WENT WRONG</p>;
  }

  if (isSuccess) {
    return (
      <div className="flex flex-row gap-x-4">
        {data.map((division) => (
          <DivisionItem name={division.name} key={division.name} />
        ))}
      </div>
    );
  }
};

export const DivisionItem = ({ name }: DivisionItemProps) => {
  return <Button variant={"default"}>{name}</Button>;
};
