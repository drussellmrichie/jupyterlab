// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import expect = require('expect.js');

import {
  ServiceManager
} from '@jupyterlab/services';

import {
  MimeData
} from 'phosphor/lib/core/mimedata';

import {
  IChangedArgs
} from '../../../../lib/common/interfaces';

import {
  DocumentRegistry, Context
} from '../../../../lib/docregistry';

import {
  CompleterWidget
} from '../../../../lib/completer';

import {
  INotebookModel
} from '../../../../lib/notebook/notebook/model';

import {
  NotebookPanel
} from '../../../../lib/notebook/notebook/panel';

import {
  Toolbar
} from '../../../../lib/toolbar';

import {
  Notebook
} from '../../../../lib/notebook/notebook/widget';

import {
  createNotebookContext, defaultRenderMime
} from '../../utils';

import {
  DEFAULT_CONTENT
} from '../utils';

import {
  CodeMirrorNotebookPanelRenderer
} from '../../../../lib/notebook/codemirror/notebook/panel';


/**
 * Default data.
 */
const rendermime = defaultRenderMime();
const clipboard = new MimeData();
const renderer = CodeMirrorNotebookPanelRenderer.defaultRenderer;


class LogNotebookPanel extends NotebookPanel {

  methods: string[] = [];

  protected onContextChanged(oldValue: DocumentRegistry.IContext<INotebookModel>, newValue: DocumentRegistry.IContext<INotebookModel>): void {
    super.onContextChanged(oldValue, newValue);
    this.methods.push('onContextChanged');
  }

  protected onModelStateChanged(sender: INotebookModel, args: IChangedArgs<any>): void {
    super.onModelStateChanged(sender, args);
    this.methods.push('onModelStateChanged');
  }

  protected onPathChanged(sender: DocumentRegistry.IContext<INotebookModel>, path: string): void {
    super.onPathChanged(sender, path);
    this.methods.push('onPathChanged');
  }
}


function createPanel(context: Context<INotebookModel>): LogNotebookPanel {
  let panel = new LogNotebookPanel({ rendermime, clipboard, renderer });
  context.model.fromJSON(DEFAULT_CONTENT);
  panel.context = context;
  return panel;
}


describe('notebook/notebook/panel', () => {

  let context: Context<INotebookModel>;
  let manager: ServiceManager.IManager;

  before((done) => {
    manager = new ServiceManager();
    manager.ready.then(done, done);
  });

  beforeEach(() => {
    context = createNotebookContext('', manager);
  });

  afterEach(() => {
    context.dispose();
  });

  after(() => {
    manager.dispose();
  });

  describe('NotebookPanel', () => {

    describe('#constructor()', () => {

      it('should create a notebook panel', () => {
        let panel = new NotebookPanel({ rendermime, clipboard, renderer});
        expect(panel).to.be.a(NotebookPanel);
      });


      it('should accept an optional render', () => {
        let newRenderer = new CodeMirrorNotebookPanelRenderer();
        let panel = new NotebookPanel({
          rendermime, clipboard, renderer: newRenderer
        });
        expect(panel.renderer).to.be(newRenderer);
      });

    });

    describe('#contextChanged', () => {

      it('should be emitted when the context on the panel changes', () => {
        let panel = new NotebookPanel({ rendermime, clipboard, renderer });
        let called = false;
        panel.contextChanged.connect((sender, args) => {
          expect(sender).to.be(panel);
          expect(args).to.be(void 0);
          called = true;
        });
        panel.context = context;
        expect(called).to.be(true);
      });

      it('should not be emitted if the context does not change', () => {
        let panel = new NotebookPanel({ rendermime, clipboard, renderer });
        let called = false;
        panel.context = context;
        panel.contextChanged.connect(() => { called = true; });
        panel.context = context;
        expect(called).to.be(false);
      });

    });

    describe('#kernelChanged', () => {

      it('should be emitted when the kernel on the panel changes', (done) => {
        let panel = createPanel(context);
        panel.kernelChanged.connect((sender, args) => {
          expect(sender).to.be(panel);
          expect(args.name).to.be.ok();
          done();
        });
        panel.context.save().then(() => {
          return panel.context.startDefaultKernel();
        }).catch(done);
      });

    });

    describe('#toolbar', () => {

      it('should be the toolbar used by the widget', () => {
        let panel = new NotebookPanel({ rendermime, clipboard, renderer });
        expect(panel.toolbar).to.be.a(Toolbar);
      });

    });

    describe('#content', () => {

      it('should be the content area used by the widget', () => {
        let panel = new NotebookPanel({ rendermime, clipboard, renderer });
        expect(panel.content).to.be.a(Notebook);
      });

    });

    describe('#kernel', () => {

      it('should be the current kernel used by the panel', (done) => {
        let panel = createPanel(context);
        context.save().then(() => {
          return context.startDefaultKernel();
        }).catch(done);
        context.kernelChanged.connect(() => {
          expect(panel.kernel.name).to.be.ok();
          done();
        });
      });

    });

    describe('#rendermime', () => {

      it('should be the rendermime instance used by the widget', () => {
        let panel = new NotebookPanel({ rendermime, clipboard, renderer });
        expect(panel.rendermime).to.be(rendermime);
      });

    });

    describe('#renderer', () => {

      it('should be the renderer used by the widget', () => {
        let renderer = new CodeMirrorNotebookPanelRenderer();
        let panel = new NotebookPanel({ rendermime, clipboard, renderer });
        expect(panel.renderer).to.be(renderer);
      });

    });

    describe('#clipboard', () => {

      it('should be the clipboard instance used by the widget', () => {
        let panel = new NotebookPanel({ rendermime, clipboard, renderer });
        expect(panel.clipboard).to.be(clipboard);
      });

    });

    describe('#model', () => {

      it('should be the model for the widget', () => {
        let panel = new NotebookPanel({ rendermime, clipboard, renderer });
        expect(panel.model).to.be(null);
        panel.context = context;
        expect(panel.model).to.be(context.model);
        expect(panel.content.model).to.be(context.model);
      });

    });

    describe('#context', () => {

      it('should get the document context for the widget', () => {
        let panel = new NotebookPanel({ rendermime, clipboard, renderer });
        expect(panel.context).to.be(null);
      });

      it('should set the document context for the widget', () => {
        let panel = new NotebookPanel({ rendermime, clipboard, renderer });
        panel.context = context;
        expect(panel.context).to.be(context);
      });

      it('should emit the `contextChanged` signal', () => {
        let panel = new NotebookPanel({ rendermime, clipboard, renderer });
        let called = false;
        panel.contextChanged.connect(() => { called = true; });
        panel.context = context;
        expect(called).to.be(true);
      });


      it('should initialize the model state', (done) => {
        let panel = new LogNotebookPanel({ rendermime, clipboard, renderer });
        let model = context.model;
        model.fromJSON(DEFAULT_CONTENT);
        expect(model.cells.canUndo).to.be(true);
        panel.context = context;
        context.ready.then(() => {
          expect(model.cells.canUndo).to.be(false);
          done();
        });
        context.save();
      });

    });

    describe('#dispose()', () => {

      it('should dispose of the resources used by the widget', () => {
        let panel = new NotebookPanel({ rendermime, clipboard, renderer });
        panel.context = context;
        panel.dispose();
        expect(panel.isDisposed).to.be(true);
      });

      it('should be safe to call more than once', () => {
        let panel = new NotebookPanel({ rendermime, clipboard, renderer });
        panel.dispose();
        panel.dispose();
        expect(panel.isDisposed).to.be(true);
      });

    });

    describe('#onContextChanged()', () => {

      it('should be called when the context changes', () => {
        let panel = new LogNotebookPanel({ rendermime, clipboard, renderer });
        panel.methods = [];
        panel.context = context;
        expect(panel.methods).to.contain('onContextChanged');
      });

    });

    describe('#onModelStateChanged()', () => {

      it('should be called when the model state changes', () => {
        let panel = createPanel(context);
        panel.methods = [];
        panel.model.dirty = false;
        expect(panel.methods).to.contain('onModelStateChanged');
      });

      it('should update the title className based on the dirty state', () => {
        let panel = createPanel(context);
        panel.model.dirty = true;
        expect(panel.title.className).to.contain('jp-mod-dirty');
        panel.model.dirty = false;
        expect(panel.title.className).to.not.contain('jp-mod-dirty');
      });

    });

    describe('#onPathChanged()', () => {

      it('should be called when the path changes', (done) => {
        let panel = createPanel(context);
        panel.methods = [];
        context.save().then(() => {
          return manager.contents.rename(context.path, 'foo.ipynb');
        }).catch(done);
        context.pathChanged.connect(() => {
          expect(panel.methods).to.contain('onPathChanged');
          done();
        });
      });

      it('should be called when the context changes', () => {
        let panel = new LogNotebookPanel({ rendermime, clipboard, renderer });
        panel.methods = [];
        panel.context = context;
        expect(panel.methods).to.contain('onPathChanged');
      });

      it('should update the title label', () => {
        let panel = createPanel(context);
        expect(panel.title.label).to.be(context.path);
      });

    });

    describe('.Renderer', () => {

      describe('#createContent()', () => {

        it('should create a notebook widget', () => {
          let r = new CodeMirrorNotebookPanelRenderer();
          expect(r.createContent(rendermime)).to.be.a(Notebook);
        });

      });

      describe('#createToolbar()', () => {

        it('should create a notebook toolbar', () => {
          let r = new CodeMirrorNotebookPanelRenderer();
          expect(r.createToolbar()).to.be.a(Toolbar);
        });

      });

      describe('#createCompleter()', () => {

        it('should create a completer widget', () => {
          let r = new CodeMirrorNotebookPanelRenderer();
          expect(r.createCompleter()).to.be.a(CompleterWidget);
        });

      });

    });

    describe('.defaultRenderer', () => {

      it('should be an instance of a `Renderer`', () => {
        expect(CodeMirrorNotebookPanelRenderer.defaultRenderer).to.be.a(NotebookPanel.Renderer);
      });

    });

  });

});
