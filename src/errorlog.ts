
const emptyErrorLog = (): ErrorLog => ({
  Generated: "",
  Device: "",
  Model: "",
  SoftwareVersion: "",
  Items: [],
})

export function parseErrorLog(fileText: string): ErrorLog {


  let log: ErrorLog = emptyErrorLog();
  if (!fileText) {
    return emptyErrorLog();
  }

  const lines = fileText.split('\r\n')

  if (lines.length < 4) {
    console.log("empty file")
    return emptyErrorLog();
  }

  try {
    log = {
      Generated: lines[0].slice(14),
      Device: lines[1].split(':')[1].trim(),
      Model: lines[2].split(':')[1].trim(),
      SoftwareVersion: lines[3].split(':')[1].trim(),
      Items: [],
    }
  } catch (e) {
    console.log(lines)
    console.error('error reading log file:', e)
    return log
  }

  let n = lines.length
  while (lines.at(n - 1) === "") { --n; }   // trim empty lines.

  const records = lines.slice(6, n)

  if (records.length % 2 !== 0) { records.pop() }

  /*
  
  record formatting:
  
  <Line>\t<Level>\t<Time Stamp>\t<Error Code>\t<TCB Addr>\t<Prg Cntr>\t<Data1>\t<Data2>
  \t\t\s+\t<Error Message>
  
  */

  try {

    for (let i = 0; i < records.length - 1; i += 2) {
      const values = records[i].split('\t');
      const errorText = records[i + 1].trim();
      const item: LogRecord = {
        Device: log.Device,
        Line: parseInt(values[0], 10),
        Level: values[1],
        TimeStamp: values[2],
        ErrorCode: values[3],
        TCBAddr: values[4],
        PrgCntr: values[5],
        Data1: values[6],
        Data2: values[7],
        Error: errorText,
      }
      log.Items.push(item)
    }
  } catch (e) {
    console.log(records)
    console.error('error reading log file:', e)
  }

  return log
}
