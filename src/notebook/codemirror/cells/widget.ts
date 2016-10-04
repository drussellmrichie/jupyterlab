// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  ICellEditorWidget
} from '../../cells/editor';

import {
  CodeCellWidget
} from '../../cells/widget';

import {
  CodeMirrorCellEditorWidget
} from './editor';


/**
 * A code mirror renderer for a code cell widget.
 */
export
class CodeMirrorCodeCellWidgetRenderer extends CodeCellWidget.Renderer {
  /**
   * Construct a code mirror renderer for a code cell widget.
   * @param editorConfiguration a code mirror editor configuration
   * @param editorInitializer a code cell widget initializer
   */
  constructor(options: CodeMirrorCodeCellWidgetRenderer.IOptions = {}) {
    super();
    this._editorConfiguration = (options.editorConfiguration ||
      CodeMirrorCodeCellWidgetRenderer.defaultEditorConfiguration);
    this._editorInitializer = (options.editorInitializer ||
      (editor => { /* no-op */ }));
  }

  /**
   * Construct a code cell widget.
   */
  createCellEditor(): ICellEditorWidget {
    const widget = new CodeMirrorCellEditorWidget(this._editorConfiguration);
    this._editorInitializer(widget);
    return widget;
  }

  private _editorConfiguration: CodeMirror.EditorConfiguration = null;
  private _editorInitializer: (editor: CodeMirrorCellEditorWidget) => void = null;
}


/**
 * A namespace for `CodeMirrorCodeCellWidgetRenderer` statics.
 */
export
namespace CodeMirrorCodeCellWidgetRenderer {
  /**
   * The options used to construct a code mirror code cell widget renderer.
   */
  export
  interface IOptions {
    /**
     * A code mirror editor configuration.
     */
    editorConfiguration?: CodeMirror.EditorConfiguration;

    /**
     * A code cell widget initializer function.
     */
    editorInitializer?: (editor: CodeMirrorCellEditorWidget) => void;
  }

  /**
   * A default code mirror configuration for a cell editor.
   */
  export
  const defaultEditorConfiguration: CodeMirror.EditorConfiguration = {
    // Default value of the theme is set in the parent constructor,
    // but could be overridden here
    indentUnit: 4,
    readOnly: false,
    extraKeys: {
      'Cmd-Right': 'goLineRight',
      'End': 'goLineRight',
      'Cmd-Left': 'goLineLeft',
      'Tab': 'indentMore',
      'Shift-Tab': 'indentLess',
      'Cmd-Alt-[': 'indentAuto',
      'Ctrl-Alt-[': 'indentAuto',
      'Cmd-/': 'toggleComment',
      'Ctrl-/': 'toggleComment',
    }
  };

  /**
   * A default code mirror renderer for a code cell widget.
   */
  export
  const defaultRenderer = new CodeMirrorCodeCellWidgetRenderer();
}
