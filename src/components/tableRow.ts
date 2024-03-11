import { create } from "../dom/create";

export declare interface TableRow {
  update: (record: LogRecord) => void
}

export function CreateTableRow(props: TableRowProps): TableRow {

  const columns: Element[] = props.columns.map(c => create("td", c.cssClass ? { 'class': c.cssClass } : null));

  props.parent.appendChild(create("tr",
    null,
    ...columns
  ));

  const update = (record: LogRecord) => {
    props.columns.forEach((c, i) => {
      const v = record[c.field as string]
      columns[i].textContent = v === undefined ? "" : v;
    })
  };

  return {
    update: update,
  };
};

