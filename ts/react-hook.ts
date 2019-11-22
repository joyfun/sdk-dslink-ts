import {BrowserUserLink} from './src/browser/browser-user-link';
import {NodeQueryStructure} from './src/requester/query/query-structure';
import {Closable, Listener} from './src/utils/async';
import {NodeQueryResult} from './src/requester/query/result';
import {useCallback, useEffect, useRef, useState} from 'react';

/** @ignore */
function useRawDsaQuery(
  link: BrowserUserLink,
  pathOrNode: string | NodeQueryResult,
  query: NodeQueryStructure,
  callback?: Listener<NodeQueryResult>,
  watchChildren?: '*' | string[]
) {
  if (typeof watchChildren === 'string') {
    watchChildren = [watchChildren];
  }
  const callbackRef = useRef<Listener<NodeQueryResult>>();
  const rootNodeCache = useRef<NodeQueryResult>();
  const [, forceUpdate] = useState(1);
  callbackRef.current = callback;
  let childCallback = useCallback((node: NodeQueryResult) => {
    if (rootNodeCache.current) {
      rootCallback(rootNodeCache.current);
    }
  }, []);
  const rootCallback = useCallback((node: NodeQueryResult) => {
    rootNodeCache.current = node;
    if (watchChildren) {
      for (let [name, child] of node.children) {
        if (watchChildren[0] === '*' || watchChildren.includes(name)) {
          child.listen(childCallback);
        }
      }
    }
    if (callbackRef.current) {
      callbackRef.current(node);
    }
    // force render on node change
    forceUpdate((v) => -v);
  }, []);
  useEffect(() => {
    let subscription: Closable;
    if (typeof pathOrNode === 'string') {
      subscription = link.requester.query(pathOrNode, query, rootCallback);
    } else if (pathOrNode instanceof NodeQueryResult) {
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
 * @param watchChildren defines the children nodes that will trigger the callback on its internal change
 */
export function useDsaQuery(
  link: BrowserUserLink,
  path: string,
  query: NodeQueryStructure,
  callback?: Listener<NodeQueryResult>,
  watchChildren?: '*' | string[]
) {
  return useRawDsaQuery(link, path, query, callback, watchChildren);
}

/**
 * Query a child node and its children
 * @param node The node from a result of a parent query.
 * @param callback The callback will be called only when
 *  - node value changed if ?value is defined
 *  - value of config that matches ?configs is changed
 *  - value of attribute that matches ?attributes is changed
 *  - child is removed or new child is added when wildcard children match * is defined
 *  - a child has updated internally (same as the above condition), and the child is defined in watchChildren
 * @param watchChildren defines the children nodes that will trigger the callback on its internal change
 */
export function useDsaChildQuery(
  node: NodeQueryResult,
  callback?: Listener<NodeQueryResult>,
  watchChildren?: '*' | string[]
) {
  return useRawDsaQuery(null, node, null, callback, watchChildren);
}