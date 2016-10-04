// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import expect = require('expect.js');

import {
  MimeData
} from 'phosphor/lib/core/mimedata';

import {
  Widget
} from 'phosphor/lib/ui/widget';

import {
 CodeCellWidget, MarkdownCellWidget
} from '../../../../lib/notebook/cells/widget';

import {
  JUPYTER_CELL_MIME, NotebookActions
} from '../../../../lib/notebook/notebook/actions';

import {
 createInterruptButton,
 createKernelNameItem,
 createKernelStatusItem,
 createRestartButton
} from '../../../../lib/toolbar/kernel';

import {
 ToolbarItems
} from '../../../../lib/notebook/notebook/default-toolbar';

import {
 NotebookModel
} from '../../../../lib/notebook/notebook/model';

import {
 NotebookPanel
} from '../../../../lib/notebook/notebook/panel';

import {
  MockContext
} from '../../docmanager/mockcontext';

import {
  defaultRenderMime
} from '../../rendermime/rendermime.spec';

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


describe('notebook/notebook/default-toolbar', () => {

  describe('ToolbarItems', () => {

    let panel: NotebookPanel;
    let context: MockContext<NotebookModel>;
    const renderer = CodeMirrorNotebookPanelRenderer.defaultRenderer;

    beforeEach((done) => {
      panel = new NotebookPanel({ rendermime, clipboard, renderer });
      let model = new NotebookModel();
      model.fromJSON(DEFAULT_CONTENT);
      context = new MockContext<NotebookModel>(model);
      panel.context = context;
      context.changeKernel({ name: 'python' }).then(() => {
        done();
      }).catch(done);
    });

    afterEach(() => {
      panel.dispose();
    });

    describe('#createSaveButton()', () => {

      it('should save when clicked', () => {
        let button = ToolbarItems.createSaveButton(panel);
        Widget.attach(button, document.body);
        button.node.click();
        expect(context.methods).to.contain('save');
        button.dispose();
      });

      it('should have the `\'jp-Notebook-toolbarSave\'` class', () => {
        let button = ToolbarItems.createSaveButton(panel);
        expect(button.hasClass('jp-Notebook-toolbarSave')).to.be(true);
      });

    });

    describe('#createInsertButton()', () => {

      it('should insert below when clicked', () => {
        let button = ToolbarItems.createInsertButton(panel);
        Widget.attach(button, document.body);
        button.node.click();
        expect(panel.content.activeCellIndex).to.be(1);
        expect(panel.content.activeCell).to.be.a(CodeCellWidget);
        button.dispose();
      });

      it('should have the `\'jp-Notebook-toolbarInsert\'` class', () => {
        let button = ToolbarItems.createInsertButton(panel);
        expect(button.hasClass('jp-Notebook-toolbarInsert')).to.be(true);
      });

    });

    describe('#createCutButton()', () => {

      it('should cut when clicked', () => {
        let button = ToolbarItems.createCutButton(panel);
        let count = panel.content.childCount();
        Widget.attach(button, document.body);
        button.node.click();
        expect(panel.content.childCount()).to.be(count - 1);
        expect(clipboard.hasData(JUPYTER_CELL_MIME)).to.be(true);
        button.dispose();
      });

      it('should have the `\'jp-Notebook-toolbarCut\'` class', () => {
        let button = ToolbarItems.createCutButton(panel);
        expect(button.hasClass('jp-Notebook-toolbarCut')).to.be(true);
      });

    });

    describe('#createCopyButton()', () => {

      it('should copy when clicked', () => {
        let button = ToolbarItems.createCopyButton(panel);
        let count = panel.content.childCount();
        Widget.attach(button, document.body);
        button.node.click();
        expect(panel.content.childCount()).to.be(count);
        expect(clipboard.hasData(JUPYTER_CELL_MIME)).to.be(true);
        button.dispose();
      });

      it('should have the `\'jp-Notebook-toolbarCopy\'` class', () => {
        let button = ToolbarItems.createCopyButton(panel);
        expect(button.hasClass('jp-Notebook-toolbarCopy')).to.be(true);
      });

    });

    describe('#createPasteButton()', () => {

      it('should paste when clicked', (done) => {
        let button = ToolbarItems.createPasteButton(panel);
        let count = panel.content.childCount();
        Widget.attach(button, document.body);
        NotebookActions.copy(panel.content, clipboard);
        button.node.click();
        requestAnimationFrame(() => {
          expect(panel.content.childCount()).to.be(count + 1);
          button.dispose();
          done();
        });
      });

      it('should have the `\'jp-Notebook-toolbarPaste\'` class', () => {
        let button = ToolbarItems.createPasteButton(panel);
        expect(button.hasClass('jp-Notebook-toolbarPaste')).to.be(true);
      });

    });

    describe('#createRunButton()', () => {

      it('should run and advance when clicked', (done) => {
        let button = ToolbarItems.createRunButton(panel);

        let widget = panel.content;
        let next = widget.childAt(1) as MarkdownCellWidget;
        widget.select(next);
        let cell = widget.activeCell as CodeCellWidget;
        cell.model.outputs.clear();
        next.rendered = false;
        Widget.attach(button, document.body);
        panel.kernel.statusChanged.connect((sender, status) => {
          if (status === 'idle') {
            expect(cell.model.outputs.length).to.be.above(0);
            expect(next.rendered).to.be(true);
            button.dispose();
            done();
          }
        });
        button.node.click();
      });

      it('should have the `\'jp-Notebook-toolbarRun\'` class', () => {
        let button = ToolbarItems.createRunButton(panel);
        expect(button.hasClass('jp-Notebook-toolbarRun')).to.be(true);
      });

    });

    describe('#createInterruptButton()', () => {

      it('should interrupt the kernel when clicked', (done) => {
        let button = createInterruptButton(panel);
        Widget.attach(button, document.body);
        button.node.click();
        expect(panel.context.kernel.status).to.be('busy');
        panel.kernel.statusChanged.connect((sender, status) => {
          if (status === 'idle') {
            button.dispose();
            done();
          }
        });
      });

      it('should have the `\'jp-Kernel-toolbarInterrupt\'` class', () => {
        let button = createInterruptButton(panel);
        expect(button.hasClass('jp-Kernel-toolbarInterrupt')).to.be(true);
      });

    });

    describe('#createRestartButton()', () => {

      it('should have the `\'jp-Kernel-toolbarRestart\'` class', () => {
        let button = createRestartButton(panel);
        expect(button.hasClass('jp-Kernel-toolbarRestart')).to.be(true);
      });

    });

    describe('#createCellTypeItem()', () => {

      it('should track the cell type of the current cell', () => {
        let item = ToolbarItems.createCellTypeItem(panel);
        let node = item.node.getElementsByTagName('select')[0] as HTMLSelectElement;
        expect(node.value).to.be('code');
        panel.content.activeCellIndex++;
        expect(node.value).to.be('markdown');
      });

      it('should display `\'-\'` if multiple cell types are selected', () => {
        let item = ToolbarItems.createCellTypeItem(panel);
        let node = item.node.getElementsByTagName('select')[0] as HTMLSelectElement;
        expect(node.value).to.be('code');
        panel.content.select(panel.content.childAt(1));
        expect(node.value).to.be('-');
      });

      it('should display the active cell type if multiple cells of the same type are selected', () => {
        let item = ToolbarItems.createCellTypeItem(panel);
        let node = item.node.getElementsByTagName('select')[0] as HTMLSelectElement;
        expect(node.value).to.be('code');
        let cell = panel.model.factory.createCodeCell();
        panel.model.cells.insert(1, cell);
        panel.content.select(panel.content.childAt(1));
        expect(node.value).to.be('code');
      });

      it('should handle a change in context', () => {
        let item = ToolbarItems.createCellTypeItem(panel);
        let model = new NotebookModel();
        model.fromJSON(DEFAULT_CONTENT);
        context = new MockContext<NotebookModel>(model);
        context.changeKernel({ name: 'python' });
        panel.context = context;
        panel.content.activeCellIndex++;
        let node = item.node.getElementsByTagName('select')[0];
        expect((node as HTMLSelectElement).value).to.be('markdown');
      });

    });

    describe('#createKernelNameItem()', () => {

      it('should display the `\'display_name\'` of the kernel', (done) => {
        let item = createKernelNameItem(panel);
        panel.kernel.getKernelSpec().then(spec => {
          expect(item.node.textContent).to.be(spec.display_name);
          done();
        });
      });

      it('should display `\'No Kernel!\'` if there is no kernel', () => {
        panel.context = null;
        let item = createKernelNameItem(panel);
        expect(item.node.textContent).to.be('No Kernel!');
      });

      it('should handle a change in kernel', (done) => {
        let item = createKernelNameItem(panel);
        panel.context.changeKernel({ name: 'shell' }).then(kernel => {
          kernel.getKernelSpec().then(spec => {
            expect(item.node.textContent).to.be(spec.display_name);
            done();
          });
        });
      });

      it('should handle a change in context', (done) => {
        let item = createKernelNameItem(panel);
        panel.kernel.getKernelSpec().then(spec => {
          panel.context = null;
          expect(item.node.textContent).to.be('No Kernel!');
        }).then(done, done);
      });

    });

    describe('#createKernelStatusItem()', () => {

      it('should display a busy status if the kernel status is not idle', (done) => {
        let item = createKernelStatusItem(panel);
        expect(item.hasClass('jp-mod-busy')).to.be(false);
        panel.kernel.statusChanged.connect(() => {
          if (panel.kernel.status === 'busy') {
            expect(item.hasClass('jp-mod-busy')).to.be(true);
            done();
          }
        });
        panel.kernel.interrupt();
      });

      it('should show the current status in the node title', (done) => {
        let item = createKernelStatusItem(panel);
        let status = panel.kernel.status;
        expect(item.node.title.toLowerCase()).to.contain(status);
        panel.kernel.statusChanged.connect(() => {
          if (panel.kernel.status === 'busy') {
            expect(item.node.title.toLowerCase()).to.contain('busy');
            done();
          }
        });
        panel.kernel.interrupt();
      });

      it('should handle a change to the kernel', (done) => {
        let item = createKernelStatusItem(panel);
        panel.context.changeKernel({ name: 'shell' }).then(() => {
          panel.kernel.statusChanged.connect(() => {
            if (panel.kernel.status === 'busy') {
              expect(item.hasClass('jp-mod-busy')).to.be(true);
              done();
            }
          });
          panel.kernel.interrupt();
        });
      });

      it('should handle a null kernel', (done) => {
        let item = createKernelStatusItem(panel);
        panel.context.changeKernel(void 0).then(() => {
          expect(item.node.title).to.be('No Kernel!');
          expect(item.hasClass('jp-mod-busy')).to.be(true);
        }).then(done, done);
      });

      it('should handle a change to the context', (done) => {
        let item = createKernelStatusItem(panel);
        let model = new NotebookModel();
        model.fromJSON(DEFAULT_CONTENT);
        context = new MockContext<NotebookModel>(model);
        panel.context = context;
        context.changeKernel({ name: 'python' }).then(() => {
          panel.kernel.statusChanged.connect(() => {
            if (panel.kernel.status === 'idle') {
              expect(item.hasClass('jp-mod-busy')).to.be(false);
              done();
            }
          });
          panel.kernel.interrupt();
        });
      });

    });

    describe('#populateDefaults()', () => {

      it('should add the default items to the panel toolbar', () => {
        ToolbarItems.populateDefaults(panel);
        expect(panel.toolbar.list()).to.eql(['save', 'insert', 'cut',
          'copy', 'paste', 'run', 'interrupt', 'restart', 'cellType',
          'kernelName', 'kernelStatus']);
      });

    });

  });

});
