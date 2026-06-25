/**
 * 完整替换 @arco-design/web-react/es/_util/react-dom
 * React 19：callbackOriginRef 只读 props.ref，避免 element.ref 弃用警告
 */
import { Component, type ReactElement } from "react";
import ReactDOM from "react-dom";
import { isFunction, isObject, isReact18 } from "@arco-design/web-react/es/_util/is";
import warning from "@arco-design/web-react/es/_util/warning";

type LegacyReactDOM = typeof ReactDOM & {
  createRoot?: (container: Element | DocumentFragment) => {
    render: (app: unknown) => void;
    unmount?: () => void;
  };
  render?: (app: unknown, container: Element | DocumentFragment) => unknown;
  unmountComponentAtNode?: (container: Element | DocumentFragment) => boolean;
  findDOMNode?: (instance: unknown) => Element | null;
};

const legacyDom = ReactDOM as LegacyReactDOM;
const __SECRET_INTERNALS__ = "__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED";
const CopyReactDOM = legacyDom;

const updateUsingClientEntryPoint = (skipWarning: boolean) => {
  if (isObject((CopyReactDOM as Record<string, unknown>)[__SECRET_INTERNALS__])) {
    (
      (CopyReactDOM as Record<string, unknown>)[__SECRET_INTERNALS__] as {
        usingClientEntryPoint?: boolean;
      }
    ).usingClientEntryPoint = skipWarning;
  }
};

let createRoot: LegacyReactDOM["createRoot"];
try {
  createRoot = CopyReactDOM.createRoot;
} catch {
  //
}

type CopyRenderRoot = {
  render: (app: unknown) => void;
  _unmount: () => void;
  unmount?: () => void;
};

let copyRender: (app: unknown, container: Element | DocumentFragment) => CopyRenderRoot;

const setCopyRender = () => {
  if (isReact18 && createRoot) {
    copyRender = (app, container) => {
      updateUsingClientEntryPoint(true);
      const root = createRoot!(container);
      updateUsingClientEntryPoint(false);
      root.render(app);
      const renderRoot = root as CopyRenderRoot;
      renderRoot._unmount = () => {
        setTimeout(() => {
          root.unmount?.();
        });
      };
      return renderRoot;
    };
  } else {
    copyRender = (app, container) => {
      CopyReactDOM.render?.(app, container);
      return {
        render: (next) => {
          CopyReactDOM.render?.(next, container);
        },
        _unmount: () => {
          CopyReactDOM.unmountComponentAtNode?.(container);
        },
      };
    };
  }
};

let warnedInstancesWeakSet: WeakSet<object> | undefined;

function hasInstanceWarned(instance: object) {
  const ctor = (instance as { constructor?: unknown }).constructor;
  if (typeof ctor !== "function") return false;
  if (!warnedInstancesWeakSet && typeof WeakSet === "function") {
    warnedInstancesWeakSet = new WeakSet();
  }
  const hasWarned = warnedInstancesWeakSet?.has(ctor as object) ?? false;
  warnedInstancesWeakSet?.add(ctor as object);
  return hasWarned;
}

export const findDOMNode = (
  element: unknown,
  instance?: unknown,
): Element | null => {
  if (element instanceof Element) return element;
  if (
    element &&
    typeof element === "object" &&
    "current" in element &&
    (element as { current: unknown }).current instanceof Element
  ) {
    return (element as { current: Element }).current;
  }
  if (
    element &&
    typeof element === "object" &&
    "getRootDOMNode" in element &&
    isFunction((element as { getRootDOMNode: unknown }).getRootDOMNode)
  ) {
    return (element as { getRootDOMNode: () => Element }).getRootDOMNode();
  }
  if (element instanceof Component) {
    if (legacyDom.findDOMNode) {
      return legacyDom.findDOMNode(element);
    }
  }
  if (instance) {
    warning(
      isReact18 && !hasInstanceWarned(instance as object),
      "Element does not define the `getRootDOMNode` method causing a call to React.findDOMNode. but findDOMNode is deprecated in StrictMode. Please check the code logic",
      { element, instance },
    );
    if (legacyDom.findDOMNode) {
      return legacyDom.findDOMNode(instance);
    }
  }
  return null;
};

type RefHost = ReactElement & { props?: { ref?: unknown } };

export function callbackOriginRef(children: RefHost | null | undefined, node: unknown) {
  if (!children) return;
  const ref = children.props?.ref;
  if (!ref) return;
  if (isFunction(ref)) {
    ref(node);
    return;
  }
  if (typeof ref === "object" && ref !== null && "current" in ref) {
    (ref as { current: unknown }).current = node;
  }
}

export const setCreateRoot = (_createRoot: NonNullable<LegacyReactDOM["createRoot"]>) => {
  createRoot = _createRoot;
  setCopyRender();
};

setCopyRender();

export const render = (node: unknown, el: Element | DocumentFragment) => copyRender(node, el);
