import { DivisionList } from "./select-division";
import DivisionSummary from "./division/summary";
import DivisionStats from "./division/stats";
import { atom, useAtom } from "jotai";

type View = {
  type: "DIVISION_SELECTOR" | "DIVISION" | "TEAM" | "MATCH";
  value: number;
  title: string;
};

export const viewAtom = atom<View>({
  type: "DIVISION_SELECTOR",
  value: 0,
  title: "Select a division",
});

const ViewStats = () => {
  const [view, setView] = useAtom(viewAtom);

  const changeView = (viewValue: number, title: string) => {
    setView({
      type: "DIVISION",
      value: viewValue,
      title,
    });
  };

  return (
    <>
      <h2 className="pb-8 text-3xl font-bold tracking-tight">{view.title}</h2>
      {view.type === "DIVISION_SELECTOR" ? (
        <DivisionList handleClick={changeView} />
      ) : null}
      {view.type === "DIVISION" ? (
        <div className="grid grid-cols-8 gap-8">
          <DivisionStats divisionId={view.value} />
          <DivisionSummary divisionId={view.value} />
        </div>
      ) : null}
    </>
  );
};

export default ViewStats;
