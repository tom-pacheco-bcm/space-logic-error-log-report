export const setAttributes = function (node: Element, props: ValueProps) {
    for (let n in props) {
        if (props.hasOwnProperty(n)) {
            node.setAttribute(n, props[n]);
        }
    }
};