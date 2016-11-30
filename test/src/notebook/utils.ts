// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  nbformat
} from '@jupyterlab/services';


/**
 * The default notebook content.
 */
export
const DEFAULT_CONTENT: nbformat.INotebookContent = require('../../../examples/notebook/test.ipynb') as nbformat.INotebookContent;
