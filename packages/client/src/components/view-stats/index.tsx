import { DivisionList } from "./select-division";
import DivisionSummary from "./division/summary";
import DivisionStats from "./division/stats";
import { atom, useAtom } from "jotai";
import { Button } from "../ui/button";

type View = {
  type: "HOME" | "DIVISION" | "TEAM" | "MATCH";
  value: number;
  title: string;
  breadcrumbText: string;
};

export const viewAtom = atom<View[]>([
  {
    type: "HOME",
    value: 0,
    title: "Select a division",
    breadcrumbText: "Home",
  },
]);

type BreadcrumbItemProps = {
  breadcrumbText: string;
  value: number;
  onClick: (value: number) => void;
  isLast: boolean;
};

const BreadcrumbItem = ({
  breadcrumbText,
  value,
  onClick,
  isLast,
}: BreadcrumbItemProps) => {
  return (
    <li>
      <Button variant="link" disabled={isLast} onClick={() => onClick(value)}>
        {breadcrumbText}
      </Button>
    </li>
  );
};

const ViewStats = () => {
  const [viewState, setViewState] = useAtom(viewAtom);

  const currentView = viewState[viewState.length - 1];

  const changeView = (viewValue: number, name: string) => {
    setViewState((prev) => [
      ...prev,
      {
        type: "DIVISION",
        value: viewValue,
        title: name,
        breadcrumbText: name,
      },
    ]);
  };

  const handleNavigationBreadcrumb = (value: number) => {
    setViewState((prev) => {
      const index = prev.findIndex((item) => item.value === value);

      return prev.slice(0, index + 1);
    });
  };

  return (
    <>
      <ul className="flex flex-row gap-x-4">
        {viewState.map((view, i, row) => (
          <BreadcrumbItem
            key={view.value}
            breadcrumbText={view.breadcrumbText}
            value={view.value}
            onClick={handleNavigationBreadcrumb}
            isLast={i + 1 === row.length}
          />
        ))}
      </ul>
      <h2 className="pb-8 text-3xl font-bold tracking-tight">
        {currentView.title}
      </h2>
      {currentView.type === "HOME" ? (
        <DivisionList handleClick={changeView} />
      ) : null}
      {currentView.type === "DIVISION" ? (
        <div className="grid grid-cols-8 gap-8">
          <DivisionStats divisionId={currentView.value} />
          <DivisionSummary divisionId={currentView.value} />
        </div>
      ) : null}
    </>
  );
};

export default ViewStats;
