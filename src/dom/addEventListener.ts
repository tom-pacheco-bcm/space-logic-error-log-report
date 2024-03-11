
export const MOUSE_CLICK_EVENT = "click"
export const MOUSE_OVER_EVENT = "mouseover"
export const MOUSE_OUT_EVENT = "mouseout"
export const MOUSE_DOWN_EVENT = "mousedown"
export const MOUSE_UP_EVENT = "mouseup"


export const addEventListener = function (node: Element, type: string, callback: EventListener) {
    node.addEventListener(type, callback, false);
}
