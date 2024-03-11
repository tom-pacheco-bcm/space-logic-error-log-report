
type ErrorLog = {
  Generated: string
  Device: string
  Model: string
  SoftwareVersion: string
  Items: LogRecord[]
}

type LogRecord = {
  Line: number
  Level: string
  TimeStamp: string
  Error: string
  ErrorCode: string
  TCBAddr: string
  PrgCntr: string
  Data1: string
  Data2: string
  Device: string
}

type LogRecordFields = keyof LogRecord

declare type Controller = {
  name: string;
  path: string;
  online: boolean;
  properties: PropertyInfo;
};

declare type ControllerInfo = {
  Name: string;
  Path: string;
  IsOnline: boolean;
  ProductId: string;
  SerialNumber: string;
  Firmware: string;
  RSTP: string;
  RSTPStatus: string;
  MACAddress: string;
  IPAddress: string;
};

declare interface Page {
  show: (visible: Boolean) => void
}

declare type State = {
  Paths: string[];
  Controllers: { [path: string]: Controller };
  ErrorLogs: { [path: string]: ErrorLog };
  ErrorLog: LogRecord[]
  Progress: {
    Value: number
    Max: number
  };
};

type Observer<T> = (s: T) => void

declare interface Action {
  type: String
}


type Reducer<S> = (s: S, a: Action) => S
