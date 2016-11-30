// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  JupyterLab, JupyterLabPlugin
} from '../application';

import {
  ICommandPalette
} from '../commandpalette';

import {
  InstanceTracker
} from '../common/instancetracker';

import {
  IPathTracker
} from '../filebrowser';

import {
  ILayoutRestorer
} from '../layoutrestorer';

import {
  IServiceManager
} from '../services';

import {
  IStateDB
} from '../statedb';

import {
  LandingModel, LandingWidget
} from './widget';


/**
 * The landing page extension.
 */
export
const landingExtension: JupyterLabPlugin<void> = {
  id: 'jupyter.extensions.landing',
  requires: [
    IPathTracker, ICommandPalette, IServiceManager, IStateDB, ILayoutRestorer
  ],
  activate: activateLanding,
  autoStart: true
};

/**
 * The class name added to the landing plugin.
 */
const LANDING_CLASS = 'jp-Landing';


function activateLanding(app: JupyterLab, pathTracker: IPathTracker, palette: ICommandPalette, services: IServiceManager, state: IStateDB, layout: ILayoutRestorer): void {
  const category = 'Help';
  const command = 'jupyterlab-landing:show';
  const model = new LandingModel(services.terminals.isAvailable());
  const tracker = new InstanceTracker<LandingWidget>({
    restore: {
      state, layout, command,
      args: widget => null,
      name: widget => 'landing',
      namespace: 'landing',
      when: app.started,
      registry: app.commands
    }
  });

  let widget: LandingWidget;

  function newWidget(): LandingWidget {
    let widget = new LandingWidget(app);
    widget.model = model;
    widget.id = 'landing-jupyterlab';
    widget.title.label = 'Launcher';
    widget.title.closable = true;
    widget.addClass(LANDING_CLASS);
    tracker.add(widget);
    return widget;
  }

  app.commands.addCommand(command, {
    label: 'Show Landing',
    execute: () => {
      if (!widget || widget.isDisposed) {
        widget = newWidget();
        app.shell.addToMainArea(widget);
      }
      app.shell.activateMain(widget.id);
    }
  });

  pathTracker.pathChanged.connect(() => {
    if (pathTracker.path.length) {
      model.path = 'home > ' + pathTracker.path.replace('/', ' > ');
    } else {
      model.path = 'home';
    }
  });

  palette.addItem({ category, command });

  // Only create a landing page if there are no other tabs open.
  layout.restored.then(() => {
    if (app.shell.mainAreaIsEmpty) {
      app.commands.execute(command, void 0);
    }
  });
}
