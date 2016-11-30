// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import expect = require('expect.js');

import {
  MimeData
} from 'phosphor/lib/core/mimedata';

import {
  BaseCellWidget
} from '../../../lib/notebook/cells';

import {
  CodeMirrorNotebookPanelRenderer
} from '../../../lib/notebook/codemirror/notebook/panel';

import {
  NotebookPanel
} from '../../../lib/notebook/notebook/panel';

import {
  NotebookTracker
} from '../../../lib/notebook/tracker';

import {
  createNotebookContext, defaultRenderMime
} from '../utils';

import {
  DEFAULT_CONTENT
} from './utils';


class TestTracker extends NotebookTracker {
  methods: string[] = [];

  protected onCurrentChanged(): void {
    super.onCurrentChanged();
    this.methods.push('onCurrentChanged');
  }
}


/**
 * Default notebook panel data.
 */
const rendermime = defaultRenderMime();
const clipboard = new MimeData();
const renderer = CodeMirrorNotebookPanelRenderer.defaultRenderer;


describe('notebook/tracker', () => {

  describe('NotebookTracker', () => {

    describe('#constructor()', () => {

      it('should create a NotebookTracker', () => {
        let tracker = new NotebookTracker();
        expect(tracker).to.be.a(NotebookTracker);
      });

    });

    describe('#activeCell', () => {

      it('should be `null` if there is no tracked notebook panel', () => {
        let tracker = new NotebookTracker();
        expect(tracker.activeCell).to.be(null);
      });

      it('should be `null` if a tracked notebook has no active cell', () => {
        let tracker = new NotebookTracker();
        let panel = new NotebookPanel({ rendermime, clipboard, renderer});
        tracker.add(panel);
        tracker.sync(panel);
        expect(tracker.activeCell).to.be(null);
      });

      it('should be the active cell if a tracked notebook has one', () => {
        let tracker = new NotebookTracker();
        let panel = new NotebookPanel({ rendermime, clipboard, renderer});
        tracker.add(panel);
        tracker.sync(panel);
        panel.context = createNotebookContext();
        panel.content.model.fromJSON(DEFAULT_CONTENT);
        expect(tracker.activeCell).to.be.a(BaseCellWidget);
        panel.dispose();
      });

    });

    describe('#activeCellChanged', () => {

      it('should emit a signal when the active cell changes', () => {
        let tracker = new NotebookTracker();
        let panel = new NotebookPanel({ rendermime, clipboard, renderer });
        let count = 0;
        tracker.activeCellChanged.connect(() => { count++; });
        panel.context = createNotebookContext();
        panel.content.model.fromJSON(DEFAULT_CONTENT);
        expect(count).to.be(0);
        tracker.add(panel);
        tracker.sync(panel);
        expect(count).to.be(1);
        panel.content.activeCellIndex = 1;
        expect(count).to.be(2);
        panel.dispose();
      });

    });

    describe('#onCurrentChanged()', () => {

      it('should be called when the active cell changes', () => {
        let tracker = new TestTracker();
        let panel = new NotebookPanel({ rendermime, clipboard, renderer});
        tracker.add(panel);
        tracker.sync(panel);
        panel.context = createNotebookContext();
        panel.content.model.fromJSON(DEFAULT_CONTENT);
        expect(tracker.methods).to.contain('onCurrentChanged');
        panel.dispose();
      });

    });

  });

});
