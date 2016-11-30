// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  IIterator, map, toArray
} from 'phosphor/lib/algorithm/iteration';

import {
  JSONObject
} from 'phosphor/lib/algorithm/json';

import {
  Vector
} from 'phosphor/lib/collections/vector';

import {
  DisposableDelegate, IDisposable
} from 'phosphor/lib/core/disposable';

import {
  Token
} from 'phosphor/lib/core/token';

import {
  h, VNode
} from 'phosphor/lib/ui/vdom';

import {
  ICommandLinker
} from '../commandlinker';

import {
  VDomModel, VDomWidget
} from '../common/vdom';


/* tslint:disable */
/**
 * The launcher token.
 */
export
const ILauncher = new Token<ILauncher>('jupyter.services.launcher');
/* tslint:enable */


/**
 * The class name added to LauncherWidget instances.
 */
const LAUNCHER_CLASS = 'jp-LauncherWidget';

/**
 * The class name added to LauncherWidget image nodes.
 */
const IMAGE_CLASS = 'jp-LauncherWidget-image';

/**
 * The class name added to LauncherWidget text nodes.
 */
const TEXT_CLASS = 'jp-LauncherWidget-text';

/**
 * The class name added to LauncherWidget item nodes.
 */
const ITEM_CLASS = 'jp-LauncherWidget-item';

/**
 * The class name added to LauncherWidget folder node.
 */
const FOLDER_CLASS = 'jp-LauncherWidget-folder';

/**
 * The class name added for the folder icon from default-theme.
 */
const FOLDER_ICON_CLASS = 'jp-FolderIcon';

/**
 * The class name added to LauncherWidget path nodes.
 */
const PATH_CLASS = 'jp-LauncherWidget-path';

/**
 * The class name added to LauncherWidget current working directory node.
 */
const CWD_CLASS = 'jp-LauncherWidget-cwd';

/**
 * The class name added to LauncherWidget body nodes.
 */
const BODY_CLASS = 'jp-LauncherWidget-body';

/**
 * The class name added to LauncherWidget dialog node.
 */
const DIALOG_CLASS = 'jp-LauncherWidget-dialog';


/**
 * The launcher interface.
 */
export
interface ILauncher {
  /**
   * Add a command item to the launcher, and trigger re-render event for parent
   * widget.
   *
   * @param options - The specification options for a launcher item.
   *
   * @returns A disposable that will remove the item from Launcher, and trigger
   * re-render event for parent widget.
   *
   */
  add(options: ILauncherItem): IDisposable;
}


/**
 * The specification for a launcher item.
 */
export
interface ILauncherItem {
  /**
   * The display name of the launcher item.
   */
  name: string;

  /**
   * The ID of the command that is called to launch the item.
   */
  command: string;

  /**
   * The command arguments, if any, needed to launch the item.
   */
  args?: JSONObject;

  /**
   * The image class name to attach to the launcher item. Defaults to
   * 'jp-Image' followed by the `name` with spaces removed. So if the name is
   * 'Launch New Terminal' the class name will be 'jp-ImageLaunchNewTerminal'.
   */
  imgClassName?: string;
}


/**
 * LauncherModel keeps track of the path to working directory and has a list of
 * LauncherItems, which the LauncherWidget will render.
 */
export
class LauncherModel extends VDomModel implements ILauncher {
  /**
   * Create a new launcher model.
   */
  constructor() {
    super();
    this._items = new Vector<ILauncherItem>();
  }

  /**
   * The path to the current working directory.
   */
  get path(): string {
    return this._path;
  }
  set path(path: string) {
    if (path === this._path) {
      return;
    }
    this._path = path;
    this.stateChanged.emit(void 0);
  }

  /**
   * Add a command item to the launcher, and trigger re-render event for parent
   * widget.
   *
   * @param options - The specification options for a launcher item.
   *
   * @returns A disposable that will remove the item from Launcher, and trigger
   * re-render event for parent widget.
   *
   */
  add(options: ILauncherItem): IDisposable {
    // Create a copy of the options to circumvent mutations to the original.
    let item = JSON.parse(JSON.stringify(options));

    // If image class name is not set, use the default value.
    item.imgClassName = item.imgClassName ||
      `jp-Image${item.name.replace(/\ /g, '')}`;

    this._items.pushBack(item);
    this.stateChanged.emit(void 0);

    return new DisposableDelegate(() => {
      this._items.remove(item);
      this.stateChanged.emit(void 0);
    });
  }

  /**
   * Return an iterator of launcher items.
   */
  items(): IIterator<ILauncherItem> {
    return this._items.iter();
  }

  private _items: Vector<ILauncherItem> = null;
  private _path: string = 'home';
}


/**
 * A virtual-DOM-based widget for the Launcher.
 */
export
class LauncherWidget extends VDomWidget<LauncherModel> {
  /**
   * Construct a new launcher widget.
   */
  constructor(options: LauncherWidget.IOptions) {
    super();
    this.addClass(LAUNCHER_CLASS);
    this._linker = options.linker;
  }

  /**
   * Render the launcher to virtual DOM nodes.
   */
  protected render(): VNode | VNode[] {
    // Create an iterator that yields rendered item nodes.
    let children = map(this.model.items(), item => {
      let img = h.span({className: item.imgClassName + ' ' + IMAGE_CLASS});
      let text = h.span({className: TEXT_CLASS }, item.name);
      let attrs = this._linker.populateVNodeAttrs({
        className: ITEM_CLASS
      }, item.command, item.args);
      return h.div(attrs, [img, text]);
    });

    let folderImage = h.span({
      className: `${FOLDER_CLASS} ${FOLDER_ICON_CLASS}`
    });
    let p = this.model.path;
    let pathName = p.length ? `home > ${p.replace(/\//g, ' > ')}` : 'home';
    let path = h.span({ className: PATH_CLASS }, pathName );
    let cwd = h.div({ className: CWD_CLASS }, [folderImage, path]);
    let body = h.div({ className: BODY_CLASS  }, toArray(children));

    return h.div({ className: DIALOG_CLASS }, [cwd, body]);
  }

  private _linker: ICommandLinker = null;
}


/**
 * A namespace for launcher widget statics.
 */
export
namespace LauncherWidget {
  /**
   * The instantiation option for a launcher widget.
   */
  export
  interface IOptions {
    /**
     * Command linker instance.
     */
    linker: ICommandLinker;
  }
}
