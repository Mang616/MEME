/**
 * Arco Message/Modal 等弹层用 copyRender；优先走 react-dom/client 的 createRoot。
 * @see https://arco.design/react/docs/start#react-19
 */
import { createRoot } from "react-dom/client";
import { setCreateRoot } from "@arco-design/web-react/es/_util/react-dom";

setCreateRoot(createRoot);
