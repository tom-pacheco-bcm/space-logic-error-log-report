import { parseErrorLog } from "./errorlog";
import { Store } from "./store";
import { isSmartXObject } from "./util/isSmartXObject";

const ERROR_LOG_FILE = Symbol('error-log-file')


const SE_VENDOR_ID = "10"

function mergeLogs(a: LogRecord[], b: LogRecord[]): LogRecord[] {

  let r: LogRecord[] = []

  let i = 0
  let j = 0

  if (b.length == 0) {
    return r.concat(a)
  }
  const bDevice = b[0].Device

  while (i < a.length && j < b.length) {

    if (a[i].Device === bDevice) { // filter existing devices
      i++
      continue
    }

    if (a[i].TimeStamp < b[j].TimeStamp) {
      r.push(a[i])
      i++
      continue
    }
    if (a[i].TimeStamp > b[j].TimeStamp) {
      r.push(b[j])
      j++
      continue
    }
    // same timestamp
    if (a[i].Device < b[j].Device) {
      r.push(a[i])
      i++
      continue
    }
    if (a[i].Device > b[j].Device) {
      r.push(b[j])
      j++
      continue
    }
    r.push(a[i])
    i++
  }

  while (i < a.length) {
    if (a[i].Device !== bDevice) {
      r.push(a[i])
    }
    i++
  }

  while (j < b.length) {
    r.push(b[j])
    j++
  }
  return r
}


function isBACnetVendorSE(child: ObjectInfo): boolean {
  return child.properties.VendorIdentifier && child.properties.VendorIdentifier.presentationValue === SE_VENDOR_ID;
}

function pathLast(path: string): string {
  return path.substring(path.lastIndexOf('/') + 1)
}

async function getChildren(path: string): Promise<ChildInfo[]> {

  let children: ChildInfo[] = []

  let cs = await client.getChildren(path, false)

  cs.forEach(async c => {
    if (c.typeName === "system.base.Folder") {
      const x = await getChildren(c.path)
      children = children.concat(x)
    } else {
      children.push(c)
    }
  })

  children.sort((a, b) => a.path.localeCompare(b.path))

  return children
}

function filterTypes(typeName: string) {
  return (children: ChildInfo[]) => children.filter(c => c.typeName === typeName)
}

function findType(typeName: string) {
  return (children: ChildInfo[]) => children.find(c => c.typeName === typeName)
}

async function getServerName(): Promise<string> {
  return client.getObjectPath().then(rootPath);
}

function rootPath(path: string): string {
  const i = path.indexOf("/", 1)
  if (i === -1) {
    return path
  }
  return path.substring(0, i)
}

async function getBACnetInterfacePath(serverName: string) {
  return client.getChildren(serverName)
    .then(findType("bacnet.Device"))
    .then(bni => {
      if (!bni) {
        return Promise.reject(new Error('no bacnet interface found'))
      }
      return bni.path
    })
}

async function getBACnetIPNetworks(bniPath: string) {
  return client.getChildren(bniPath)
    .then(filterTypes("bacnet.IPDataLink"))
}

function readLogs({ getState, dispatch }: Store<State>) {

  const s = getState()

  const max_request = 3
  let counter = 0
  let pos = 0
  let deviceCount = s.Paths.length
  let reportCount = 0

  dispatch(new UpdateProgressAction(0, deviceCount))

  const updateProgress = () => {
    reportCount++
    dispatch(new UpdateProgressAction(reportCount, deviceCount))
  }

  const next = () => {
    while (pos < s.Paths.length && counter < max_request) {
      const path = s.Paths[pos]
      pos++
      if (s.Controllers[path].online) {
        makeRequest(path)
      } else {
        updateProgress()
      }
    }
  }

  const done = () => {
    updateProgress()
    counter--
    next()
  }

  const makeRequest = path => {
    counter++
    client.readFile(path + "/Diagnostic Files/Error Log")
      .then(
        result => {
          const log = parseErrorLog(result)
          log[ERROR_LOG_FILE] = result
          dispatch(new AddErrorLogAction(path, log))
          done()
        },
        _ => {
          console.log(`could not read 'Error Log' for:`, path)
          done()
        }
      );
  }

  next()
}

function load(store: Store<State>) {

  store.dispatch(new UpdateProgressAction(-1, 1))

  getServerName()
    .then(serverName => {
      if (!serverName) {
        return Promise.reject(new Error('could not get server name'))
      }
      return serverName
    })
    .then(getBACnetInterfacePath)
    .then(getBACnetIPNetworks)
    .then(async networks => {
      if (networks.length === 0) {
        return Promise.reject(new Error('no BACnet IP networks found'))
      }
      let children: ChildInfo[] = []
      for (let nw of networks) {
        const list = await getChildren(nw.path).catch(
          e => {
            console.error(e)
            return []
          }
        )
        children = children.concat(list)
      }
      return children.map(item => item.path)
    })
    .then(paths =>
      client.getObjects(paths).catch(
        e => {
          console.error(e)
          return new Map() as Map<string, ObjectInfo>
        }
      )
    )
    .then(childMap => {
      let cs: Controller[] = Array.from(childMap.values())
        .filter(isBACnetVendorSE)
        .filter(isSmartXObject)
        .map(child => {

          const name = pathLast(child.path);
          const onLine = child.properties.Status.value.low === 1;

          return {
            name: name,
            path: child.path,
            online: onLine,
            properties: child.properties
          }
        });

      cs.sort((a, b) => a.path.localeCompare(b.path))

      store.dispatch(new AddControllerAction(cs))
      readLogs(store)
    })
    .catch(e => {
      console.error(e)
    })
}

//-----------------------------------------------------------------------
// actions
//-----------------------------------------------------------------------


type ACTION_UPDATE_PROGRESS = 'update-progress'
const ACTION_UPDATE_PROGRESS = 'update-progress'

class UpdateProgressAction {
  type: ACTION_UPDATE_PROGRESS = ACTION_UPDATE_PROGRESS
  constructor(public value: number, public max: number) { }
}

function UpdateProgressReducer(state: State, action: UpdateProgressAction): State {

  if (action.type !== ACTION_UPDATE_PROGRESS) {
    return state
  }

  return {
    ...state,
    Progress: {
      Value: action.value,
      Max: action.max
    }
  }
}

type ACTION_ADD_ERROR_LOG = 'add-error-log'
const ACTION_ADD_ERROR_LOG = 'add-error-log'

class AddErrorLogAction {
  type: ACTION_ADD_ERROR_LOG = ACTION_ADD_ERROR_LOG
  constructor(public path: string, public errorLog: ErrorLog
  ) { }
}

function AddErrorLogReducer(state: State, action: AddErrorLogAction): State {

  if (action.type !== ACTION_ADD_ERROR_LOG) {
    return state
  }

  return {
    ...state,
    ErrorLogs: {
      ...state.ErrorLogs,
      [action.path]: action.errorLog,
    },
    ErrorLog: mergeLogs(state.ErrorLog, action.errorLog.Items)
  }
}

type ACTION_ADD_CONTROLLERS = 'add-controllers'
const ACTION_ADD_CONTROLLERS = 'add-controllers'

class AddControllerAction {
  type: ACTION_ADD_CONTROLLERS = ACTION_ADD_CONTROLLERS
  constructor(public controllers: Controller[]) { }
}

function AddControllerReducer(state: State, action: AddControllerAction): State {

  if (action.type !== ACTION_ADD_CONTROLLERS) {
    return state
  }

  const controllers = action.controllers.reduce((m, c) => {
    m[c.path] = c;
    return m
  }, { ...state.Controllers })

  const paths = Object.values(controllers).map(c => c.path)

  paths.sort((a, b) => a.localeCompare(b))

  return {
    ...state,
    Paths: paths,
    Controllers: controllers,
  }
}

//-----------------------------------------------------------------------


type ReducerActions = UpdateProgressAction | AddErrorLogAction | AddControllerAction;

function reducer(state: State, action: ReducerActions) {
  switch (action.type) {
    case ACTION_UPDATE_PROGRESS:
      return UpdateProgressReducer(state, action)
    case ACTION_ADD_ERROR_LOG:
      return AddErrorLogReducer(state, action)
    case ACTION_ADD_CONTROLLERS:
      return AddControllerReducer(state, action)
  }
  return state
}

export function CreateDataStore() {

  const initialState: State = {
    Paths: [],
    Controllers: {},
    ErrorLogs: {},
    ErrorLog: [],
    Progress: {
      Value: 0,
      Max: 1
    },
  }

  const store = new Store(reducer, initialState)

  return {
    subscribe: (observer: Observer<State>) => store.subscribe(observer)
    ,
    load: () => { load(store) }
    ,
  }
}

