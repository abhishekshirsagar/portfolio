let n;
var d = (o) => {
    if (!n) {
        const r = o.forwardRef(({color: i = "currentColor", size: e = 24, ...l}, t) => {
            return o.createElement("svg", {ref: t, xmlns: "http://www.w3.org/2000/svg", width: e, height: e, viewBox: "0 0 24 24", fill: "none", stroke: i, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...l}, o.createElement("path", {d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"}), o.createElement("polyline", {points: "7 10 12 15 17 10"}), o.createElement("line", {x1: "12", y1: "15", x2: "12", y2: "3"}));
        });
        r.displayName = "Download",n = r;
    }
    return n;
};
const __FramerMetadata__ = {exports: {default: {type: "reactComponent", slots: [], annotations: {framerContractVersion: "1"}}, __FramerMetadata__: {type: "variable"}}};
export { __FramerMetadata__, d as default };