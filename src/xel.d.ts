import "solid-js/types/jsx";

type Size = "small"|"medium"|"large"|"smaller"|"larger";

declare module "solid-js" {
  namespace JSX {
  interface IntrinsicElements {
    "x-button": HTMLAttributes<HTMLElement>&Partial<{
      skin: "nav" | "flat" | "dock" | "recessed",
      "disabled": boolean,
      "size": Size,
      toggled: boolean,
      condensed: boolean,
    }>,
      "x-icon":
        HTMLAttributes<HTMLElement>&Partial<{ size: Size, href: string }>,
      "x-buttons": HTMLAttributes<HTMLElement>&Partial<
        { vertical: boolean, tracking: `${number}` }>,
      "x-box": HTMLAttributes<HTMLElement>&Partial<{ vertical: boolean }>,
      "x-tab": HTMLAttributes<HTMLElement>&Partial<
        { "selected": boolean, "disabled": boolean, "size": Size, value: any }>,
      "x-tabs": JSX.HTMLAttributes<HTMLElement>&Partial<{ value: string }>,
      "x-card": HTMLAttributes<HTMLElement>&Partial<{}>,
      "x-menu": HTMLAttributes<HTMLElement>&Partial<{}>,
      "x-menuitem": HTMLAttributes<HTMLElement>&Partial<{ value: string }>,
      "x-numberinput": JSX.InputHTMLAttributes<HTMLInputElement>&Partial<
        { suffix: string, condensed: boolean }>,
      "x-label":
        JSX.LabelHTMLAttributes<HTMLLabelElement>&Partial<{ value: any }>,
      "x-input": JSX.InputHTMLAttributes<HTMLInputElement>&Partial<{}>,
      "x-select": JSX.SelectHTMLAttributes<HTMLSelectElement>&Partial<{}>,
      "x-slider": JSX.InputHTMLAttributes<HTMLInputElement>&Partial<{
        min: number,
        max: number,
        condensed: boolean,
      }>,
      "x-stepper": JSX.InputHTMLAttributes<HTMLInputElement>&Partial<{}>,
      "x-tag": JSX.InputHTMLAttributes<HTMLInputElement>&Partial<{}>,
      "x-switch":
        JSX.InputHTMLAttributes<HTMLInputElement>&Partial<{ toggled: boolean }>,
      "webview": HTMLAttributes<HTMLIFrameElement>&Partial<
        { src: string, partition: string }>
  }
  }
}

declare module "xel/xel.js";
