
declare type Column = {
  header: string,
  field: LogRecordFields
  cssClass?: string
}

declare type TableProps = {
  parent: Element
  columns: Column[]
}

declare type TableRowProps = {
  parent: Element
  columns: Column[]
}
