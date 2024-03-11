import { create } from "../dom/create";
import { CreateTableRow, TableRow } from "./tableRow";

declare interface Table {
  update: (data: readonly LogRecord[]) => void
}

export const CreateTable = function (props: TableProps): Table {

  const report = props.parent.appendChild(create("div", { class: "report" }));
  const table = report.appendChild(
    create("table",
      null,
      create("caption", null, "Error Logs"),
      create("thead", null,
        create("tr", null,
          ...props.columns.map(c => create("th", (c.cssClass ? { "class": c.cssClass } : null), c.header))
        ))
    )
  );

  const tbody = table.appendChild(create("tbody"));

  let tableRows: TableRow[] = [];

  const update = (records: readonly LogRecord[]) => {

    if (tableRows.length > records.length) { // remove extras if needed.
      tableRows = tableRows.slice(0, records.length)
    }

    tableRows = records.map((record, i) => {
      if (tableRows[i]) {
        tableRows[i].update(record);
        return tableRows[i]
      }
      // add data Rows if needed
      let tr = CreateTableRow({
        parent: tbody,
        columns: props.columns
      })
      tr.update(record);
      return tr;
    });
  };

  return {
    update: update,
  };
};
