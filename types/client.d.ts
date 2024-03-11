/*
 * Copyright © 2022 Schneider Electric
 */
declare const enum ValueStatusEnum {
  Error = 0,
  Database = 1,
  Real = 2,
  Forced = 3,
}

declare type Value = {
  value: boolean | Date | string | number | any;
  presentationValue: string;
  unit: string;
  isNull: boolean;
  errorText: string;
  status: ValueStatusEnum;
  forcedUntil?: Date;
};

declare type LogValue = {
  sequenceNumber: number;
  timestamp: Date;
  value: number;
};

declare type EditLogValue = {
  value?: number;
  comment?: string;
};

declare type AddLogValue = {
  timestamp: Date;
  value: number;
} & EditLogValue;

declare type LogCalculation = {
  calculationMethod: LogCalculationMethodEnum;
  calculationPeriod: LogCalculationPeriodEnum;
};

declare const enum LogCalculationMethodEnum {
  Maximum = 1,
  Minimum = 2,
  Average = 3,
  MeterConsumption = 6,
}

declare const enum LogCalculationPeriodEnum {
  Minute = 0,
  Hour = 1,
  Day = 2,
  Week = 3,
  Month = 4,
  Quarter = 5,
  Year = 6,
}

declare const enum AlarmStateEnum {
  Normal = 0x0,
  Alarm = 0x1,
  Acknowledged = 0x2,
  Reset = 0x3,
  Disabled = 0x4,
  Fault = 0x5,
}

declare type UserSettings = {
  userName: string;
  domain: string;
  groups: string[];
  language: string;
  locale: string;
  darkMode: boolean;
};

declare type DialogConfiguration = {
  [propertyPath: string]: DialogPropertyPathConfiguration;
};

declare type DialogPropertyPathConfiguration = {
  dialogObjectName?: string;
  dialogValueLabel?: string;
  dialogObjectDescription?: string;
  hideDialogLink?: boolean;
  defaultCollapsed?: boolean;
};

declare type ChildInfo = {
  path: string;
  typeName: string;
  description: string;
  propertyNames?: string[];
};

declare type ObjectInfo = {
  path: string;
  typeName: string;
  properties: PropertyInfo;
};

declare type PropertyInfo = {
  [propertyName: string]: Value | undefined;
};

declare interface ILong {
  high: number; //The high 32 bits as a signed value
  low: number; //The low 32 bits as a signed value.
  unsigned: boolean; //Whether unsigned or not.
}

declare type RecordValueTypes = string | number | boolean | Date | ILong;

declare type RecordProperty = {
  value: RecordValueTypes;
  presentationValue?: string;
};

declare type RecordInfo = {
  [propertyName: string]: RecordProperty;
};

declare const enum ReadFileResponseTypeEnum {
  Text = 0,
  ArrayBuffer = 1,
  Blob = 2,
}

declare const enum AlarmActionEnum {
  Acknowledge,
  Enable,
  Disable,
  Hide,
  Show,
  SelfAssign,
  Release,
  Reject,
  Accept,
  Recheck,
}

declare type ReferenceInfo = {
  logs: string[];
  logLists: string[];
  charts: string[];
};

declare const enum SegmentRole {
  Member = 0x1,
  Master = 0x2,
  Standalone = 0x3,
}

declare interface ISegment {
  path: string; //Segment object path
  role: SegmentRole; //Role in segment group
  masterCapable: boolean; //If capable being master
  label?: string; //Group label used when segment acting as master
  device?: string; //Name of the device the segment is located in
  points?: string[]; //Object paths to the segments objects
}

declare interface ISegmentCollection {
  grouped: ISegment[][]; //An array of grouped segments.
  ungrouped: ISegment[]; //The ungrouped segments
}

declare type PathResult = {
  propertyPaths: string[];
  objectPaths: string[];
};

declare type SparqlResult = {
  head: { vars: string[] };
  results: { bindings: any[] };
};

declare type NspGuidResult = {
  nspGuid: string;
  objectPath?: string;
  propertyPath?: string;
};

declare interface IClient {
  Version: string;
  ValueStatus: typeof ValueStatusEnum;
  LogCalculationMethod: typeof LogCalculationMethodEnum;
  LogCalculationPeriod: typeof LogCalculationPeriodEnum;
  AlarmAction: typeof AlarmActionEnum;
  AlarmState: typeof AlarmStateEnum;
  ReadFileResponseType: typeof ReadFileResponseTypeEnum;

  /**
   *  @returns {string} Returns a promise that resolve to the current path of the viewer.
   */
  getObjectPath(): Promise<string>;

  /**
   *  @returns {string} Returns a promise that resolve the relative path around the viewer path..
   */
  resolveRelativePath(relativePath: string): Promise<string>;

  /**
   * @param objectPath An object path to get the children for
   * @param includePropertyNames An optional boolean to include propertyNames in the result.
   * @returns {ChildInfo[]} Returns a promise with an array of child information.
   */
  getChildren(objectPath: string, includePropertyNames?: boolean): Promise<ChildInfo[]>;

  /**
   * @param objectPath An object path, use getObjects if you need more paths with one roundtrip.
   * @returns {ObjectInfo} Returns a promise with object information.
   */
  getObject(objectPath: string): Promise<ObjectInfo>;

  /**
   * @param objectPaths An array of object paths
   * @returns {Map<string, ObjectInfo>} Returns a promise with an array of object information.
   */
  getObjects(objectPaths: string[]): Promise<Map<string, ObjectInfo>>;

  /**
   * @param propertyPaths An array of property path strings.
   * @param objectPaths An array of object path strings.
   * @returns {Map<string, ReferenceInfo>} Returns a promise with a reference information per path
   */
  getReferences(propertyPaths: string[], objectPaths: string[]): Promise<Map<string, ReferenceInfo>>;

  /**
   * Get current user settings
   */
  getUserSettings(): Promise<UserSettings>;

  /**
   * Starts a subscription.
   * @param propertyPaths An array of property path strings to subscribe.
   * @param callback The callback with values.
   * @returns {number} Returns a promise with the subscriptionId.
   */
  subscribeValues(callback: (result: Map<string, Value>, subscriptionId: number) => void, propertyPaths: string[]): Promise<number>;

  /**
   *
   * @param subscriptionId The number returned from subscribeValues.
   */
  unsubscribeValues(subscriptionId: number): Promise<void>;

  /**
   * Reads values by subscribing and waiting until all properties has a value or the max wait time is met.
   * In case of the max wait time a partial result will be returned.
   * @param propertyPaths The paths to read.
   * @param maxWait The max wait time in milliseconds.
   * @returns {Map<string, Value>} Returns a promise with the values as a map keyed with property path and a IValue
   */
  readValues(propertyPaths: string[], maxWait?: number): Promise<Map<string, Value>>;

  /**
   *
   * @param propertyPath The path to the property.
   * @param value The value to set, can be boolean, string, number, Date.
   */
  setValue(propertyPath: string, value: boolean | string | number | Date): Promise<void>;

  /**
   *
   * @param propertyPath The path to the property.
   * @param force false for force, false for unforce.
   * @param forcedUntil when forcing - for how long should it be forced for.
   */
  setForce(propertyPath: string, force: boolean, forcedUntil?: Date): Promise<void>;

  /**
   *
   * @param objectPath The object to navigate to
   * @param action
   * The action to invoke
   *    OpenInFloatingWindow - Opens the target object in a floating window.
        OpenInNewWindow - Opens the target object in a new window.
        OpenInNewBrowserTab - Opens the target object in a new browser window.
        OpenInParent - The target object replaces the parent location, that is, the panel in which the graphic is contained.
        OpenInSelf - The target object replaces the graphic.
        OpenInTarget - Opens the target object in a specific pane.
        OpenInTop - The target object replaces the top panel, that is the panel in which all other panels are contained.
        OpenInWorkArea - Opens the target object in the work area.
        HistoryForward - Navigates forward to a view you have visited before in the selected window.
        HistoryBack - Navigates back to a view you have visited before in the selected window.
        LogOff - Logs off the current user from WorkStation
     You can include any number of attributes that are supported for the used command. The OpenInTarget command has to include the Target attribute in order to work.
        For each invoke command you can set a number of attributes:
        Width: sets the width of the window in pixels.
        Height: sets the height of the window in pixels
        Top: sets the top position of the window in number of pixels from the top left corner o the screen
        Left: sets the left position of the window in number of pixels from the top left corner or the screen
        Target: sets the target location where the link target is to be opened. You type the name of the pane. The pane and the graphic have to be contained in the same panel.
        DisplayName: displays the name you have typed for the target pane. By default, the object name is the display name of the target pane.
        ShowToolbar: displays the toolbar in the target pane when set to “Yes“.
        SkipFallback: when set to “Yes“, this attribute makes the invoke function return a "false" message if the target object does not exist. By using SkipFallback in your script, you make it possible for the script to control what to do if the target location does not exist.
        By default, the fallback handles a non-existing target location as follows: If the graphic is contained in a panel, the object opens in the workarea. If the graphic is stand-alone, the object replaces the graphic.
   * @param pageX The x coordinate.
   * @param pageY The y coordinate.
   */
  invoke(objectPath: string, action: string, pageX: number, pageY: number): Promise<void>;

  /**
   *
   * @param propertyPaths An array of property path strings.
   * @param dialogConfiguration An optional configuration can be specified for each property path.
   */
  editProperties(propertyPaths: string[], dialogConfiguration?: DialogConfiguration): Promise<void>;

  /**
   *
   * @param propertyPaths An array of property path strings.
   * @param objectPaths An array of object path strings.
   * @param pageX The x coordinate.
   * @param pageY The y coordinate.
   */
  showMenu(propertyPaths: string[], objectPaths: string[], pageX: number, pageY: number): Promise<void>;

  /**
   *
   * @param propertyPaths An array of property path strings.
   * @param objectPaths An array of object path strings.
   * @param pageX The x coordinate.
   * @param pageY The y coordinate.
   */
  showLinksMenu(propertyPaths: string[], objectPaths: string[], pageX: number, pageY: number): Promise<void>;

  /**
   *
   * @param propertyPaths An array of property path strings.
   * @param objectPaths An array of object path strings.
   * @param title A title text
   * @param action
   * The action to invoke
   *    OpenInFloatingWindow - Opens the target object in a floating window.
        OpenInNewWindow - Opens the target object in a new window.
        OpenInNewBrowserTab - Opens the target object in a new browser window.
        OpenInParent - The target object replaces the parent location, that is, the panel in which the graphic is contained.
        OpenInSelf - The target object replaces the graphic.
        OpenInTarget - Opens the target object in a specific pane.
        OpenInTop - The target object replaces the top panel, that is the panel in which all other panels are contained.
        OpenInWorkArea - Opens the target object in the work area.
   * @param pageX The x coordinate.
   * @param pageY The y coordinate.
   */
  showList(propertyPaths: string[], objectPaths: string[], title: string, action: string, pageX: number, pageY: number): Promise<void>;

  /**
   *
   * @param callback A function that will be called for each change.
   * @param logPath A path to the log to read.
   * @param startAt The oldest date to return.
   * @param endAt The newest date to return (can be undefined to read to the latest in log)
   * @param calculation The optional calculation to run.
   */
  subscribeLog(
    callback: (result: LogValue[], unit: string, subscriptionId: number) => void,
    logPath: string,
    startAt: Date,
    endAt?: Date,
    calculation?: LogCalculation
  ): Promise<number>;

  /**
   *
   * @param logId The number returned from subscribeLog.
   */
  unsubscribeLog(logId: number): Promise<void>;

  /**
   *
   * @param logPath Path to the log
   * @param logValues An array of logvalues to add.
   */
  importToLog(logPath: string, logValues: AddLogValue[]): Promise<void>;

  /**
   *
   * @param logPath Path to the log
   * @param logValues A logvalue to add
   */
  addLogValue(logPath: string, logValue: AddLogValue): Promise<void>;

  /**
   *
   * @param logPath Path to the log
   * @param logValue The log value that you want to edit.
   * @param edit An object containing the value and comment.
   */
  editLogValue(logPath: string, logValue: LogValue, edit: EditLogValue): Promise<void>;

  /**
   *
   * @param logPath Path to the log
   */
  clearLog(logPath: string): Promise<void>;

  /**
   *
   * @param callback A function that takes an array of RecordInfo. This will be called for each change.
   * @param presentationValue A boolean indicating that you need the presentationValue. Note that this can be expensive with many records.
   * @param alarmViewPath An optional path to an alarm view. Uses a system wide alarm view if not specified.
   * @param favorite An optional path to a user favorite.
   */
  subscribeAlarmView(
    callback: (result: ReadonlyArray<RecordInfo>) => void,
    presentationValue?: boolean,
    alarmViewPath?: string,
    favorite?: string
  ): Promise<number>;

  /**
   *
   * @param action An action to perform.
   * @param record The record to perform the action upon.
   * @param alarmViewId The alarm view to use.
   */
  performAlarmAction(action: AlarmActionEnum, record: RecordInfo, alarmViewId: number): Promise<void>;

  /**
   *
   * @param alarmViewId The number returned from subscribeAlarmView.
   */
  unsubscribeAlarmView(alarmViewId: number): Promise<void>;

  /**
   *
   * @param callback A function that takes an array of RecordInfo. This will be called for each change.
   * @param presentationValue A boolean indicating that you need the presentationValue. Note that this can be expensive with many records.
   * @param eventViewPath A path to an event view. Uses a system wide event view if not specified.
   * @param favorite A path to a user favorite.
   */
  subscribeEventView(
    callback: (result: ReadonlyArray<RecordInfo>) => void,
    presentationValue?: boolean,
    eventViewPath?: string,
    favorite?: string
  ): Promise<number>;

  /**
   *
   * @param eventViewId The number returned from subscribeEventView.
   */
  unsubscribeEventView(eventViewId: number): Promise<void>;

  /**
   *
   * @param objectPath The object path to the file.
   * @param responseType An optional type of response.
   * @returns {string|ArrayBuffer} Returns a string or an ArrayBuffer that can be decoded by a DataView.
   */
  readFile(objectPath: string): Promise<string>;
  readFile(objectPath: string, responseType: ReadFileResponseTypeEnum.Text): Promise<string>;
  readFile(objectPath: string, responseType: ReadFileResponseTypeEnum.Blob): Promise<Blob>;
  readFile(objectPath: string, responseType: ReadFileResponseTypeEnum.ArrayBuffer): Promise<ArrayBuffer>;
  readFile(objectPath: string, responseType?: ReadFileResponseTypeEnum): Promise<string | ArrayBuffer | Blob>;

  /**
   *
   * @param callback A function that a ISegmentCollection. This will be called for each change.
   * @param includePoints A boolean indicating that you need the the points path information.
   * @param paths The paths to segments or folders containing segments.
   */
  subscribeSegments(callback: (result: Readonly<ISegmentCollection>) => void, paths: string[], includePoints?: boolean): Promise<number>;

  /**
   *
   * @param segmentsId The number returned from subscribeSegments.
   * @param members Members you want to group
   * @param masterSegment Optional master segment
   */
  createGroup(segmentsId: number, members: ISegment[], masterSegment?: ISegment): Promise<void>;

  /**
   *
   * @param segmentsId The number returned from subscribeSegments.
   * @param existingMember An existing member in group
   * @param members The members to add
   */
  addToGroup(segmentsId: number, existingMember: ISegment, members: ISegment[]): Promise<void>;

  /**
   *
   * @param segmentsId The number returned from subscribeSegments.
   * @param members Members to remove from their group
   */
  removeFromGroup(segmentsId: number, members: ISegment[]): Promise<void>;

  /**
   *
   * @param segmentsId The number returned from subscribeSegments.
   * @param existingMember An existing member in the group you want to remove
   */
  removeGroup(segmentsId: number, existingMember: ISegment): Promise<void>;

  /**
   *
   * @param segmentsId The number returned from subscribeSegments.
   */
  unsubscribeSegments(segmentsId: number): Promise<void>;

  /**
   *
   * @param objectPath The object path to the JavaScript object.
   * @returns Returns a module script.
   */
  importScript(objectPath: string): any;

  sparqlQuery(query: string): Promise<SparqlResult>;

  resolveNspGuids(nspGuids: string[]): Promise<NspGuidResult[]>;

  alert(message: string, header?: string): Promise<void>;
  confirm(message: string, header?: string): Promise<boolean>;
  prompt<T extends boolean | string | number>(prompt: string, header?: string, defaultValue?: T, options?: T[]): Promise<T>;
}

declare const client: IClient;
