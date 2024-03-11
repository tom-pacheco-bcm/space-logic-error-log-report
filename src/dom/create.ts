import { setAttributes } from "./setAttributes";

export interface Props {
    [name: string]: string;
}

/**
 * create a element
 */
export const create = function (
    name: string,
    props?: Props,
    ...children: (Element | string)[]
) {
    const elem = document.createElement(name)
    setAttributes(elem, props || {});
    if (children) {
        children.forEach(c =>
            typeof c === 'string' ?
                elem.appendChild(document.createTextNode(c)) :
                elem.appendChild(c))
    }
    return elem
};

