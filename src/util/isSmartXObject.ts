
export function isSmartXObject(oi: ObjectInfo) {

  const modelName = oi.properties.ModelName.value as string;

  switch (modelName.substring(0, 2)) {
    case "MP":
    case "RP":
    case "IP":
      return true
    default:
      return false
  }
}
