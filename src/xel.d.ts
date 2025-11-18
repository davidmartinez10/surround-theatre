import "solid-js/types/jsx";

type Size = "small"|"medium"|"large"|"smaller"|"larger";

declare module "solid-js" {
  namespace JSX {
    interface IntrinsicElements {
      "x-accordion": HTMLAttributes<HTMLElement>&Partial<{}>,
      "x-avatar": HTMLAttributes<HTMLElement>&Partial<{ size: Size }>,
      "x-backdrop": HTMLAttributes<HTMLElement>&Partial<{}>,
      "x-box": HTMLAttributes<HTMLElement>&Partial<{ vertical: boolean }>,
      "x-button": HTMLAttributes<HTMLElement>&Partial<{
        skin: "nav" | "flat" | "dock" | "recessed",
        disabled: boolean,
        size: Size,
        toggled: boolean,
        condensed: boolean,
        value: string | null,
      }>,
      "x-buttons": HTMLAttributes<HTMLElement>&Partial<{ vertical: boolean, tracking: `${number}` }>,
      "x-card": HTMLAttributes<HTMLElement>&Partial<{}>,
      "x-checkbox": HTMLAttributes<HTMLElement>&Partial<{ toggled: boolean, disabled: boolean, size: Size }>,
      "x-colorinput": HTMLAttributes<HTMLElement>&Partial<{ disabled: boolean, size: Size }>,
      "x-colorpicker": HTMLAttributes<HTMLElement>&Partial<{ value: string, alpha: boolean, spaces: string[], disabled: boolean }>,
      "x-colorselect": HTMLAttributes<HTMLElement>&Partial<{ disabled: boolean, size: Size }>,
      "x-contextmenu": HTMLAttributes<HTMLElement>&Partial<{}>,
      "x-drawer": HTMLAttributes<HTMLElement>&Partial<{}>,
      "x-icon": HTMLAttributes<HTMLElement>&Partial<{ size: Size, href: string, disabled: boolean }>,
      "x-input": JSX.InputHTMLAttributes<HTMLInputElement>&Partial<{
        type: "text" | "email" | "password" | "url" | "color",
        value: string,
        disabled: boolean,
        size: Size,
        readOnly: boolean,
        mixed: boolean,
      }>,
      "x-label": JSX.LabelHTMLAttributes<HTMLLabelElement>&Partial<{ value: string, level: number | null, disabled: boolean }>,
      "x-menu": HTMLAttributes<HTMLElement>&Partial<{ opened: boolean }>,
      "x-menuitem": HTMLAttributes<HTMLElement>&Partial<{ value: string }>,
      "x-message": HTMLAttributes<HTMLElement>&Partial<{ href: string, args: Record<string, string | number>, autocapitalize: boolean, ellipsis: boolean }>,
      "x-nav": HTMLAttributes<HTMLElement>&Partial<{}>,
      "x-navitem": HTMLAttributes<HTMLElement>&Partial<{}>,
      "x-notification": HTMLAttributes<HTMLElement>&Partial<{ opened: boolean, size: Size }>,
      "x-numberinput": JSX.InputHTMLAttributes<HTMLInputElement>&Partial<{ value: number, min: number, max: number, step: number, suffix: string, condensed: boolean, disabled: boolean, size: Size }>,
      "x-popover": HTMLAttributes<HTMLElement>&Partial<{}>,
      "x-progressbar": HTMLAttributes<HTMLElement>&Partial<{}>,
      "x-radio": HTMLAttributes<HTMLElement>&Partial<{ toggled: boolean, disabled: boolean }>,
      "x-radios": HTMLAttributes<HTMLElement>&Partial<{}>,
      "x-select": JSX.SelectHTMLAttributes<HTMLSelectElement>&Partial<{ disabled: boolean, size: Size }>,
      "x-slider": JSX.InputHTMLAttributes<HTMLInputElement>&Partial<{
        value: number | number[],
        min: number,
        max: number,
        step: number,
        ticks: boolean,
        disabled: boolean,
      }>,
      "x-stepper": JSX.InputHTMLAttributes<HTMLInputElement>&Partial<{ value: number, min: number, max: number, step: number, disabled: boolean }>,
      "x-swatch": HTMLAttributes<HTMLElement>&Partial<{ value: string, size: Size }>,
      "x-switch": JSX.InputHTMLAttributes<HTMLInputElement>&Partial<{ toggled: boolean, disabled: boolean }>,
      "x-tab": HTMLAttributes<HTMLElement>&Partial<{ toggled: boolean, disabled: boolean, size: Size, value: string }>,
      "x-tabs": JSX.HTMLAttributes<HTMLElement>&Partial<{ value: string }>,
      "x-tag": JSX.InputHTMLAttributes<HTMLInputElement>&Partial<{ value: string, toggled: boolean, removable: boolean, disabled: boolean }>,
      "x-tags": HTMLAttributes<HTMLElement>&Partial<{}>,
      "x-texteditor": HTMLAttributes<HTMLElement>&Partial<{ value: string, size: Size, mixed: boolean, disabled: boolean }>,
      "x-throbber": HTMLAttributes<HTMLElement>&Partial<{}>,
      "x-titlebar": HTMLAttributes<HTMLElement>&Partial<{}>,
      "x-tooltip": HTMLAttributes<HTMLElement>&Partial<{ disabled: boolean }>,
      "webview": HTMLAttributes<HTMLIFrameElement>&Partial<{ src: string, partition: string }>
    }
  }
}

//@ts-ignore
declare module "xel/xel.js";
