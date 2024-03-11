/**
 * attributeSetter returns a function that sets an attribute to preset value
 */
export const attributeSetter = function (name: string, value: string) {
  return function (node: Element) {
    if (node && node.setAttribute) {
      node.setAttribute(name, value);
    }
  }
}
