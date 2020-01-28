"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("./src/requester/query/result");
const react_1 = require("react");
/** @ignore */
function useRawDsaQuery(link, pathOrNode, query, callback) {
    const callbackRef = react_1.useRef();
    const rootNodeCache = react_1.useRef();
    const [, forceUpdate] = react_1.useState(1);
    const watchingNodes = new WeakSet();
    callbackRef.current = callback;
    let childCallback = react_1.useCallback((node) => {
        for (let [name, child] of node.children) {
            if (!watchingNodes.has(child)) {
                watchingNodes.add(child);
                child.listen(childCallback, false);
            }
        }
        if (rootNodeCache.current) {
            rootCallback(rootNodeCache.current);
        }
    }, []);
    const rootCallback = react_1.useCallback((node) => {
        rootNodeCache.current = node;
        for (let [name, child] of node.children) {
            if (!watchingNodes.has(child)) {
                watchingNodes.add(child);
                child.listen(childCallback, false);
            }
        }
        if (callbackRef.current) {
            callbackRef.current(node);
        }
        // force render on node change
        forceUpdate((v) => -v);
    }, []);
    react_1.useEffect(() => {
        let subscription;
        if (typeof pathOrNode === 'string') {
            subscription = link.requester.query(pathOrNode, query, rootCallback);
        }
        else if (pathOrNode instanceof result_1.NodeQueryResult) {
            pathOrNode.listen(rootCallback);
        }
        return () => {
            if (subscription) {
                subscription.close();
            }
        };
    }, [link, pathOrNode]);
}
/**
 * Query a node and its children
 * @param link
 * @param path The node path to be queried.
 * @param query
 * @param callback The callback will be called only when
 *  - node value changed if ?value is defined
 *  - value of config that matches ?configs is changed
 *  - value of attribute that matches ?attributes is changed
 *  - child is removed or new child is added when wildcard children match * is defined
 *  - a child has updated internally (same as the above condition), and the child is defined in watchChildren
 */
function useDsaQuery(link, path, query, callback) {
    return useRawDsaQuery(link, path, query, callback);
}
exports.useDsaQuery = useDsaQuery;
/**
 * Query a child node and its children
 * @param node The node from a result of a parent query.
 * @param callback The callback will be called only when
 *  - node value changed if ?value is defined
 *  - value of config that matches ?configs is changed
 *  - value of attribute that matches ?attributes is changed
 *  - child is removed or new child is added when wildcard children match * is defined
 *  - a child has updated internally (same as the above condition), and the child is defined in watchChildren
 */
function useDsaChildQuery(node, callback) {
    return useRawDsaQuery(null, node, null, callback);
}
exports.useDsaChildQuery = useDsaChildQuery;
//# sourceMappingURL=react-hook.js.map