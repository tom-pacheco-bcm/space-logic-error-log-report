/**
 * get attribute from node
 */
export const getAttribute = function (node: Element, attrName: string): string {
    return '' + node.getAttribute(attrName);
};

