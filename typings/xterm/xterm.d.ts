// Type definitions for term.js 0.0.7
// Project: https://github.com/chjj/term.js
// Definitions by: Steven Silvester <https://github.com/blink1073>


/**
 * Typing for a term.js terminal object.
 */
interface Xterm {

  options: Xterm.IOptions;

  element: HTMLElement;

  textarea: HTMLElement;

  attachCustomKeydownHandler(callback: (event: KeyboardEvent) => boolean): void;

  blur(): void;

  clear(): void;

  destroy(): void;

  focus(): void;

  setOption(key: 'rows'): number;
  setOption(key: 'cols'): number;
  setOption(key: 'cursorBlink'): boolean;

  on(event: string, callback: (arg: any) => void): void;

  off(event: string, callback: (arg: any) => void): void;

  open(parent: HTMLElement): void;

  refresh(start: number, end: number, queue?: boolean): void;

  reset(): void;

  resize(x: number, y: number): void;

  scrollDisp(n: number): void;

  setOption(key: 'rows', value: number): void;
  setOption(key: 'cols', value: number): void;
  setOption(key: 'cursorBlink', value: boolean): void;

  write(text: string): void;

  writeln(text: string): void;
}


interface XtermConstructor {
  new (options?: Xterm.IOptions): Xterm;
  (options?: Xterm.IOptions): Xterm;
}


/**
 * A terminal options.
 */
declare module Xterm {
  interface IOptions {

    cursorBlink?: boolean;

    rows?: number;

    cols?: number;
  }
}


declare var Xterm: XtermConstructor;


declare module 'xterm' {
  export = Xterm;
}
