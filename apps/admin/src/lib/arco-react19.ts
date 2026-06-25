/**
 * Arco Message/Modal 依赖内部 copyRender；React 19 的 react-dom 不再导出 createRoot。
 * 须在任意 @arco-design 组件加载前注入 createRoot（勿用 react-dom.render 补丁，无效）。
 * @see https://arco.design/react/docs/start#react-19
 */
import { createRoot } from "react-dom/client";
import { setCreateRoot } from "@arco-design/web-react/es/_util/react-dom";

setCreateRoot(createRoot);
