
# Design Patterns

There are several design patterns that are repeated throughout
the repository.  This guide is meant to supplement the 
[TypeScript Style Guide](https://github.com/jupyter/jupyterlab/wiki/TypeScript-Style-Guide).


## TypeScript

TypeScript is used in all of the source code.  TypeScript is used because
it provides features from the most recent EMCAScript 6 standards, while 
providing type safety.  The TypeScript compiler eliminates an entire class 
of bugs, while making it much easier to refactor code.


## Initialization Options

Objects will typically have an `IOptions` interface for
initializing the widget.  The use of this interface allows options
to be later added while preserving backward compatibility.


## Renderer Option

A common option for a widget is a `IRenderer`, which is used to customize the 
rendering of content in the widget.  If not given, a `defaultRenderer` instance
is typically used.  In this way, widgets can be customized
without subclassing them, and widgets can support customization
of their nested content.


## Static Namespace

An object class will typically have an exported static namespace
sharing the same name as the object.  The namespace is used
to declutter the class definition.


## Private Module Namespace

The "Private" module namespace is used to group variables and
functions that are not intended to be exported and may have
otherwise existed as module-level variables and functions.  
The use of the namespace also makes it clear when a variable access
is to an imported name or from the module itself.  Finally,
the namespace allows the entire section to be collapsed in
an editor if desired.


## Disposables

JavaScript does not support "destructors", so the `IDisposable` 
pattern is used to ensure resources are freed and can be claimed by the
Garbage Collector when no longer needed.  It should always be safe to
`dispose()` of an object more than once.  Typically the object that
creates another object is responsible for calling the dispose method
of that object unless explicitly stated otherwise.


## Messages

Messages are intended for many-to-one communication where outside objects
influence another object.  Messages can be conflated and processed 
as a single message.  They can be posted and handled on the next animation
frame.


## Signals

Signals are intended for one-to-many communication where outside objects
react to changes on another object.  Signals are always emitted with
the sender as the first argument, and contain a single second argument
with the payload.  Signals should generally not be used to trigger the 
"default" behavior for an action, but to allow others to trigger additional
behavior.  If a "default" behavior is intended to be provided by another
object, then a callback should be provided by that object.


## Models

Some of the more advanced widgets have a model associated with them.
The common pattern used is that the model is settable and must be set
outside of the constructor.  This means that any consumer of the widget
must account for a model that may be `null`, and may change at any time.
The widget should emit a `modelChanged` signal to allow consumers to
handle a change in model.  The reason to allow a model to swap is that
the same widget could be used to display different model content
while preserving the widget's location in the application.  The reason
the model cannot be provided in the constructor is the initialization 
required for a model may have to call methods that are subclassed.
The subclassed methods would be called before the subclass constructor has
finished evaluating, resulting in undefined state.


## Data Structures

Prefer to use Phosphor [Phosphor `Vector`](http://phosphorjs.github.io/phosphor/api/classes/_collections_vector_.vector.html) over JavaScript `Array` for internal use,
and expose Vectors as ISequences for external use.  This allows us to use
the Phosphor algorithms which provide advanced functionality over what is
offered by the native Arrays.
