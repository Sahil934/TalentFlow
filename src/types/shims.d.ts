// Temporary shims to satisfy TypeScript in this environment without installed dependencies.
// Remove this file after running `npm install`.

declare module 'react' {
  const React: any;
  export default React;
  export const useState: any;
  export const useEffect: any;
  export const useMemo: any;
  export const useRef: any;
  export const Fragment: any;
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare module 'react-dom/client' {
  export const createRoot: any;
}

declare module 'react-router-dom' {
  export const BrowserRouter: any;
  export const Routes: any;
  export const Route: any;
  export const NavLink: any;
  export const Navigate: any;
  export const Link: any;
  export const useParams: any;
  export const useLocation: any;
}

declare module 'styled-components' {
  const styled: any;
  export default styled;
  export const createGlobalStyle: any;
}

declare module 'react-beautiful-dnd' {
  export const DragDropContext: any;
  export const Droppable: any;
  export const Draggable: any;
  export type DropResult = any;
  export type DroppableProvided = any;
  export type DraggableProvided = any;
}

declare module 'react-window' {
  export const FixedSizeList: any;
}

declare module 'react-virtualized-auto-sizer' {
  const AutoSizer: any;
  export default AutoSizer;
}

// Minimal JSX typing to allow intrinsic elements like <div /> during shimming.
// Remove this once real React type definitions are installed.
export {};
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
