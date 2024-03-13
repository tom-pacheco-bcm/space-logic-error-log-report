import { CreateButton } from "../components/button";
import { ProgressBar } from "../components/progressBar";
import { CreateTable } from "../components/table";

export const TablePage = function (dataStore: DataStore): Page {

  const progressBar = ProgressBar({
    el: document.getElementById("progress"),
  });

  const refreshTable = () => {
    dataStore.load();
  };

  CreateButton({
    el: document.getElementById("refresh"),
    clickHandler: refreshTable,
  });

  const appElement = document.getElementById("app")

  const dataTable = CreateTable({
    parent: appElement,
    columns: [
      {
        field: "TimeStamp",
        header: "Time Stamp"
      },
      {
        field: "Level",
        header: "Level"
      },
      {
        field: "Device",
        header: "Device"
      },
      {
        field: "ErrorCode",
        header: "Error Code",
        cssClass: "number"
      },
      {
        field: "Error",
        header: "Error Message"
      },
    ],
  });

  // table Updates
  const updateTable = (state: State) => {
    dataTable.update(state.ErrorLog);
    progressBar.update(state.Progress.Value, state.Progress.Max);
  };

  dataStore.subscribe(updateTable);

  refreshTable()

  return {
    show(visible) { },
  };
};