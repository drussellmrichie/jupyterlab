// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import expect = require('expect.js');

import {
  IKernel
} from 'jupyter-js-services';

import {
  DisposableDelegate, IDisposable
} from 'phosphor/lib/core/disposable';

import {
  Widget
} from 'phosphor/lib/ui/widget';

import {
  ABCWidgetFactory, Base64ModelFactory, DocumentRegistry,
  IDocumentModel, IDocumentContext, IWidgetExtension, TextModelFactory
} from '../../../lib/docregistry';


class WidgetFactory extends ABCWidgetFactory<Widget, IDocumentModel> {

  createNew(context: IDocumentContext<IDocumentModel>, kernel?: IKernel.IModel): Widget {
    return new Widget();
  }
}


class WidgetExtension implements IWidgetExtension<Widget, IDocumentModel> {

   createNew(widget: Widget, context: IDocumentContext<IDocumentModel>): IDisposable {
     return new DisposableDelegate(null);
   }
}


describe('docregistry/registry', () => {

  describe('DocumentRegistry', () => {

    let registry: DocumentRegistry;

    beforeEach(() => {
      registry = new DocumentRegistry();
    });

    afterEach(() => {
      registry.dispose();
    });

    describe('#isDisposed', () => {

      it('should get whether the registry has been disposed', () => {
        expect(registry.isDisposed).to.be(false);
        registry.dispose();
        expect(registry.isDisposed).to.be(true);
      });

    });

    describe('#dispose()', () => {

      it('should dispose of the resources held by the registry', () => {
        registry.addFileType({ name: 'notebook', extension: '.ipynb' });
        registry.dispose();
        expect(registry.isDisposed).to.be(true);
      });

      it('should be safe to call multiple times', () => {
        registry.dispose();
        registry.dispose();
        expect(registry.isDisposed).to.be(true);
      });

    });

    describe('#addWidgetFactory()', () => {

      it('should add the widget factory to the registry', () => {
        let factory = new WidgetFactory();
        registry.addWidgetFactory(factory, {
          fileExtensions: [],
          displayName: 'foo',
          modelName: 'bar'
        });
        expect(registry.getWidgetFactory('foo')).to.be(factory);
        expect(registry.getWidgetFactory('FOO')).to.be(factory);
      });

      it('should be a no-op if the `displayName` is already registered', () => {
        let factory = new WidgetFactory();
        registry.addWidgetFactory(factory, {
          fileExtensions: [],
          displayName: 'foo',
          modelName: 'bar'
        });
        let disposable = registry.addWidgetFactory(new WidgetFactory(), {
          fileExtensions: [],
          displayName: 'foo',
          modelName: 'bar'
        });
        disposable.dispose();
        expect(registry.getWidgetFactory('foo')).to.be(factory);
      });

      it('should become the global default if `*` is given as a defaultFor', () => {
        registry.addModelFactory(new TextModelFactory());
        let factory = new WidgetFactory();
        registry.addWidgetFactory(factory, {
          fileExtensions: ['*'],
          displayName: 'foo',
          modelName: 'text'
        });
        expect(registry.defaultWidgetFactory('*')).to.be('foo');
      });

      it('should override an existing global default', () => {
        registry.addModelFactory(new TextModelFactory());
        registry.addWidgetFactory(new WidgetFactory(), {
          fileExtensions: ['*'],
          defaultFor: ['.*'],
          displayName: 'foo',
          modelName: 'text'
        });
        let factory = new WidgetFactory();
        registry.addWidgetFactory(factory, {
          fileExtensions: ['*'],
          defaultFor: ['*'],
          displayName: 'bar',
          modelName: 'text'
        });
        expect(registry.defaultWidgetFactory('*')).to.be('bar');
      });

      it('should override an existing extension default', () => {
        registry.addModelFactory(new TextModelFactory());
        registry.addWidgetFactory(new WidgetFactory(), {
          fileExtensions: ['.txt'],
          displayName: 'foo',
          modelName: 'text'
        });
        let factory = new WidgetFactory();
        registry.addWidgetFactory(factory, {
          fileExtensions: ['.txt'],
          displayName: 'bar',
          modelName: 'text'
        });
        expect(registry.defaultWidgetFactory('.txt')).to.be('foo');
      });

      it('should be removed from the registry when disposed', () => {
        registry.addModelFactory(new TextModelFactory());
        let factory = new WidgetFactory();
        let disposable = registry.addWidgetFactory(factory, {
          fileExtensions: ['.txt'],
          displayName: 'bar',
          modelName: 'text'
        });
        disposable.dispose();
        expect(registry.getWidgetFactory('bar')).to.be(void 0);
      });

    });

    describe('#addModelFactory()', () => {

      it('should add the model factory to the registry', () => {
        let factory = new TextModelFactory();
        registry.addModelFactory(factory);
        expect(registry.listModelFactories()).to.eql(['text']);
      });

      it('should be a no-op a factory with the given `name` is already registered', () => {
        let factory = new TextModelFactory();
        registry.addModelFactory(factory);
        let disposable = registry.addModelFactory(new TextModelFactory());
        disposable.dispose();
        expect(registry.listModelFactories()).to.eql(['text']);
      });

      it('should be a no-op if the same factory is already registered', () => {
        let factory = new TextModelFactory();
        registry.addModelFactory(factory);
        let disposable = registry.addModelFactory(factory);
        disposable.dispose();
        expect(registry.listModelFactories()).to.eql(['text']);
      });

      it('should be removed from the registry when disposed', () => {
        let factory = new TextModelFactory();
        let disposable = registry.addModelFactory(factory);
        disposable.dispose();
        expect(registry.listModelFactories()).to.eql([]);
      });

    });

    describe('#addWidgetExtension()', () => {

      it('should add a widget extension to the registry', () => {
        let extension = new WidgetExtension();
        registry.addWidgetExtension('foo', extension);
        expect(registry.getWidgetExtensions('foo')).to.eql([extension]);
      });

      it('should be a no-op if the extension is already registered for a given widget factory', () => {
        let extension = new WidgetExtension();
        registry.addWidgetExtension('foo', extension);
        let disposable = registry.addWidgetExtension('foo', extension);
        disposable.dispose();
        expect(registry.getWidgetExtensions('foo')).to.eql([extension]);
      });

      it('should be removed from the registry when disposed', () => {
        let extension = new WidgetExtension();
        let disposable = registry.addWidgetExtension('foo', extension);
        disposable.dispose();
        expect(registry.getWidgetExtensions('foo')).to.eql([]);
      });

    });

    describe('#addFileType()', () => {

      it('should add a file type to the document registry', () => {
        let fileType = { name: 'notebook', extension: '.ipynb' };
        registry.addFileType(fileType);
        expect(registry.listFileTypes()).to.eql([fileType]);
      });

      it('should be removed from the registry when disposed', () => {
        let fileType = { name: 'notebook', extension: '.ipynb' };
        let disposable = registry.addFileType(fileType);
        disposable.dispose();
        expect(registry.listFileTypes()).to.eql([]);
      });

      it('should be a no-op if a file type of the same name is registered', () => {
        let fileType = { name: 'notebook', extension: '.ipynb' };
        registry.addFileType(fileType);
        let disposable = registry.addFileType(fileType);
        disposable.dispose();
        expect(registry.listFileTypes()).to.eql([fileType]);
      });

    });

    describe('#addCreator()', () => {

      it('should add a file type to the document registry', () => {
        let creator = { name: 'notebook', fileType: 'notebook' };
        registry.addCreator(creator);
        expect(registry.listCreators()).to.eql([creator]);
      });

      it('should be removed from the registry when disposed', () => {
        let creator = { name: 'notebook', fileType: 'notebook' };
        let disposable = registry.addCreator(creator);
        disposable.dispose();
        expect(registry.listCreators()).to.eql([]);
      });

      it('should add after a named creator if given', () => {
        let creators = [
          { name: 'Python Notebook', fileType: 'notebook' },
          { name: 'R Notebook', fileType: 'notebook' },
          { name: 'Shell Notebook', fileType: 'notebook' }
        ];
        registry.addCreator(creators[0]);
        registry.addCreator(creators[1]);
        registry.addCreator(creators[2], creators[1].name);
        expect(registry.listCreators()).to.eql([ creators[0], creators[2], creators[1]]);
      });

      it('should be a no-op if a file type of the same name is registered', () => {
        let creator = { name: 'notebook', fileType: 'notebook' };
        registry.addCreator(creator);
        let disposable = registry.addCreator(creator);
        disposable.dispose();
        expect(registry.listCreators()).to.eql([creator]);
      });

    });

    describe('#listWidgetFactories()', () => {

      it('should list the names of the valid registered widget factories', () => {
        expect(registry.listWidgetFactories()).to.eql([]);
        registry.addModelFactory(new TextModelFactory());
        let factory = new WidgetFactory();
        registry.addWidgetFactory(factory, {
          fileExtensions: ['.foo'],
          displayName: 'Foo',
          modelName: 'text'
        });
        registry.addWidgetFactory(factory, {
          fileExtensions: ['.foo'],
          displayName: 'Bar',
          modelName: 'text'
        });
        expect(registry.listWidgetFactories('.foo')).to.eql(['Foo', 'Bar']);
      });

      it('should not list a factory whose model is not registered', () => {
        registry.addWidgetFactory(new WidgetFactory(), {
          fileExtensions: ['.bar'],
          displayName: 'Bar',
          modelName: 'text'
        });
        expect(registry.listWidgetFactories()).to.eql([]);
      });

      it('should select the factory for a given extension', () => {
        registry.addModelFactory(new TextModelFactory());
        let factory = new WidgetFactory();
        registry.addWidgetFactory(factory, {
          fileExtensions: ['.foo'],
          displayName: 'Foo',
          modelName: 'text'
        });
        registry.addWidgetFactory(factory, {
          fileExtensions: ['.bar'],
          displayName: 'Bar',
          modelName: 'text'
        });
        expect(registry.listWidgetFactories('.foo')).to.eql(['Foo']);
      });

      it('should respect the priority order', () => {
        registry.addModelFactory(new TextModelFactory());
        let factory = new WidgetFactory();
        registry.addWidgetFactory(factory, {
          fileExtensions: ['.txt'],
          displayName: 'Foo',
          modelName: 'text'
        });
        registry.addWidgetFactory(factory, {
          fileExtensions: ['.txt'],
          defaultFor: ['.txt'],
          displayName: 'Bar',
          modelName: 'text'
        });
        registry.addWidgetFactory(factory, {
          fileExtensions: ['*'],
          displayName: 'Buzz',
          modelName: 'text'
        });
        registry.addWidgetFactory(factory, {
          fileExtensions: ['*'],
          defaultFor: ['*'],
          displayName: 'Fizz',
          modelName: 'text'
        });
        expect(registry.listWidgetFactories('.txt')).to.eql(['Bar', 'Fizz', 'Foo', 'Buzz']);
      });

    });

    describe('#defaultWidgetFactory()', () => {

      it('should get the default widget factory for a given extension', () => {
        registry.addModelFactory(new TextModelFactory());
        let factory = new WidgetFactory();
        registry.addWidgetFactory(factory, {
          fileExtensions: ['.txt'],
          displayName: 'Foo',
          modelName: 'text'
        });
        registry.addWidgetFactory(factory, {
          fileExtensions: ['.txt'],
          defaultFor: ['.txt'],
          displayName: 'Bar',
          modelName: 'text'
        });
        registry.addWidgetFactory(factory, {
          fileExtensions: ['*'],
          displayName: 'Buzz',
          modelName: 'text'
        });
        registry.addWidgetFactory(factory, {
          fileExtensions: ['*'],
          defaultFor: ['*'],
          displayName: 'Fizz',
          modelName: 'text'
        });
        expect(registry.defaultWidgetFactory('.txt')).to.be('Bar');
        expect(registry.defaultWidgetFactory()).to.be('Fizz');
      });

    });

    describe('#listModelFactories()', () => {

      it('should list the currently registered model factories', () => {
        expect(registry.listModelFactories()).to.eql([]);
        registry.addModelFactory(new TextModelFactory());
        registry.addModelFactory(new Base64ModelFactory());
        expect(registry.listModelFactories()).to.eql(['text', 'base64']);
      });

    });

    describe('#listFileTypes()', () => {

      it('should list the registered file types', () => {
        expect(registry.listFileTypes()).to.eql([]);
        let fileTypes = [
          { name: 'notebook', extension: '.ipynb' },
          { name: 'python', extension: '.py' }
        ];
        registry.addFileType(fileTypes[0]);
        registry.addFileType(fileTypes[1]);
        expect(registry.listFileTypes()).to.eql(fileTypes);
      });

    });

    describe('#listCreators()', () => {

      it('should list the registered file creators', () => {
        expect(registry.listCreators()).to.eql([]);
        let creators = [
          { name: 'Python Notebook', fileType: 'notebook' },
          { name: 'R Notebook', fileType: 'notebook' },
          { name: 'Shell Notebook', fileType: 'notebook' }
        ];
        registry.addCreator(creators[0]);
        registry.addCreator(creators[1]);
        registry.addCreator(creators[2]);
        expect(registry.listCreators()).to.eql(creators);
      });

    });

    describe('#getFileType()', () => {

      it('should get a file type by name', () => {
        let fileTypes = [
          { name: 'notebook', extension: '.ipynb' },
          { name: 'python', extension: '.py' }
        ];
        registry.addFileType(fileTypes[0]);
        registry.addFileType(fileTypes[1]);
        expect(registry.getFileType('notebook')).to.be(fileTypes[0]);
        expect(registry.getFileType('python')).to.be(fileTypes[1]);
        expect(registry.getFileType('r')).to.be(void 0);
      });
    });

    describe('#getCreator()', () => {

      it('should get a creator by name', () => {
        let creators = [
          { name: 'Python Notebook', fileType: 'notebook' },
          { name: 'R Notebook', fileType: 'notebook' },
          { name: 'Shell Notebook', fileType: 'notebook' }
        ];
        registry.addCreator(creators[0]);
        registry.addCreator(creators[1]);
        registry.addCreator(creators[2]);
        expect(registry.getCreator('Python Notebook')).to.be(creators[0]);
        expect(registry.getCreator('r notebook')).to.be(creators[1]);
        expect(registry.getCreator('shell Notebook')).to.be(creators[2]);
        expect(registry.getCreator('foo')).to.be(void 0);
      });

    });

    describe('#getKernelPreference()', () => {

      it('should get a kernel preference', () => {
        registry.addModelFactory(new TextModelFactory());
        registry.addWidgetFactory(new WidgetFactory(), {
          fileExtensions: ['.txt'],
          displayName: 'foo',
          modelName: 'text'
        });
        registry.addWidgetFactory(new WidgetFactory(), {
          fileExtensions: ['.py'],
          displayName: 'bar',
          modelName: 'text',
          canStartKernel: true,
          preferKernel: true
        });

        let pref = registry.getKernelPreference('.c', 'foo');
        expect(pref.language).to.be('clike');
        expect(pref.preferKernel).to.be(false);
        expect(pref.canStartKernel).to.be(false);

        pref = registry.getKernelPreference('.py', 'bar');
        expect(pref.language).to.be('python');
        expect(pref.preferKernel).to.be(true);
        expect(pref.canStartKernel).to.be(true);

        pref = registry.getKernelPreference('.py', 'baz');
        expect(pref).to.be(void 0);
      });

    });

    describe('#getModelFactoryFor()', () => {

      it('should get a registered model factory for a given widget name', () => {
        let mFactory = new TextModelFactory();
        registry.addModelFactory(mFactory);
        registry.addWidgetFactory(new WidgetFactory(), {
          fileExtensions: ['.txt'],
          displayName: 'foo',
          modelName: 'text'
        });
        expect(registry.getModelFactoryFor('foo')).to.be(mFactory);
        expect(registry.getModelFactoryFor('FOO')).to.be(mFactory);
        expect(registry.getModelFactoryFor('text')).to.be(void 0);
      });

    });

    describe('#getWidgetFactory()', () => {

      it('should get a widget factory by name', () => {
        registry.addModelFactory(new TextModelFactory());
        let foo = new WidgetFactory();
        registry.addWidgetFactory(foo, {
          fileExtensions: ['*'],
          defaultFor: ['.*'],
          displayName: 'foo',
          modelName: 'text'
        });
        let bar = new WidgetFactory();
        registry.addWidgetFactory(bar, {
          fileExtensions: ['*'],
          defaultFor: ['*'],
          displayName: 'bar',
          modelName: 'text'
        });
        expect(registry.getWidgetFactory('foo')).to.be(foo);
        expect(registry.getWidgetFactory('Foo')).to.be(foo);
        expect(registry.getWidgetFactory('bar')).to.be(bar);
        expect(registry.getWidgetFactory('baz')).to.be(void 0);
      });

    });

    describe('#getWidgetExtensions()', () => {

      it('should get the registered extensions for a given widget', () => {
        let foo = new WidgetExtension();
        let bar = new WidgetExtension();
        registry.addWidgetExtension('fizz', foo);
        registry.addWidgetExtension('fizz', bar);
        registry.addWidgetExtension('buzz', foo);
        expect(registry.getWidgetExtensions('fizz')).to.eql([foo, bar]);
        expect(registry.getWidgetExtensions('buzz')).to.eql([foo]);
        expect(registry.getWidgetExtensions('baz')).to.eql([]);
      });

    });

  });

});
