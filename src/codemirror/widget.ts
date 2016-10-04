// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as CodeMirror
  from 'codemirror';

import 'codemirror/mode/meta';

import {
  Message
} from 'phosphor/lib/core/messaging';

import {
  ResizeMessage, Widget
} from 'phosphor/lib/ui/widget';


/**
 * The class name added to CodeMirrorWidget instances.
 */
const EDITOR_CLASS = 'jp-CodeMirrorWidget';


/**
 * The name of the default CodeMirror theme
 */
export
const DEFAULT_CODEMIRROR_THEME = 'jupyter';

/**
 * A widget which hosts a CodeMirror editor.
 */
export
class CodeMirrorWidget extends Widget {

  /**
   * Construct a CodeMirror widget.
   */
  constructor(options: CodeMirror.EditorConfiguration = {}) {
    super();
    this.addClass(EDITOR_CLASS);
    options.theme = (options.theme || DEFAULT_CODEMIRROR_THEME);
    this._editor = CodeMirror(this.node, options);
  }

  /**
   * Dispose of the resources held by the widget.
   */
  dispose(): void {
    this._editor = null;
    super.dispose();
  }

  /**
   * Get the editor wrapped by the widget.
   *
   * #### Notes
   * This is a ready-only property.
   */
   get editor(): CodeMirror.Editor {
     return this._editor;
   }

  /**
   * A message handler invoked on an `'after-attach'` message.
   */
  protected onAfterAttach(msg: Message): void {
    if (!this.isVisible) {
      this._needsRefresh = true;
      return;
    }
    this._editor.refresh();
    this._needsRefresh = false;
  }

  /**
   * A message handler invoked on an `'after-show'` message.
   */
  protected onAfterShow(msg: Message): void {
    if (this._needsRefresh) {
      this._editor.refresh();
      this._needsRefresh = false;
    }
  }

  /**
   * A message handler invoked on an `'resize'` message.
   */
  protected onResize(msg: ResizeMessage): void {
    if (msg.width < 0 || msg.height < 0) {
      this._editor.refresh();
    } else {
      this._editor.setSize(msg.width, msg.height);
    }
    this._needsRefresh = false;
  }

  /**
   * Handle `'activate-request'` messages.
   */
  protected onActivateRequest(msg: Message): void {
    this._editor.focus();
  }

  private _editor: CodeMirror.Editor = null;
  private _needsRefresh = true;
}
