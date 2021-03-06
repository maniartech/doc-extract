/**
 * Framework Factory
 * http://framework-factory.com/
 *
 * Copyright (c) 2013 Maniar Technologies Private Limited
 * Author Mohamed Aamir Maniar
 * Licensed under the MIT license.
 * https://framework-factory.com/LICENSE-MIT
 *
 **/


Object.create = Object.create ||
function create(o) {
    "use strict";

    function F() {}
    F.prototype = o;
    return new F();
};


Object.getPrototypeOf = Object.getPrototypeOf ||
function getPrototypeOf() {
    "use strict";

    if (typeof "test".__proto__ === "object") {
        Object.getPrototypeOf = function (o) {
            return o.__proto__;
        };
    } else {
        Object.getPrototypeOf = function (o) {
            // May break if the constructor has been tampered with
            return o.constructor.prototype;
        };
    }
};

Array.prototype.indexOf = Array.prototype.indexOf ||
function indexOf(obj, start) {
    "use strict";

    for (var i = (start || 0), j = this.length; i < j; i += 1) {
        if (this[i] === obj) {
            return i;
        }
    }
    return -1;
};


String.trim = String.trim ||
function trim(s) {
    "use strict";
    return s.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
};

(function (root, undefined) {
    "use strict";

    var FrameworkFactory,
        plugins = [],
        typeHandlers = {},
        i, iLen,
        environment; //Environement - node, requirejs or browser

    /**
     * FrameworkFactory contains members useful members for generating and managing
     * your very own modern frameworks and framework factory plugins.
     *
     * @Class FrameworkFactory
     * @example
     * var myFramework = FrameworkFactory.create({
     *     name: "myFramework",
     *     version: "1.0"
     * });
     *
     * //Create a new Class called
     * myFramework. = myFramework
     *
     * @public
     * @version 1.0
     **/
    FrameworkFactory = (function () {
        function FrameworkFactory() {}
        return new FrameworkFactory();
    })();

    /**
     * Provides the environment tests in which FrameworkFactory or associated frameworks are
     * currently running. Useful
     * for checking whether current environment is Node, Browser or RequireJS.
     *
     * @field {Object}
     *
     * @public
     * @version 1.0
     */
    FrameworkFactory.environment = environment = (function (){
        function Environement() {}
        return new Environement();
    })();

    /**
     * Returns `true` if framework factory is executing under the NodeJS environment otherwise
     * `false`.
     *
     * @field {boolean}
     *
     * @public
     * @version 1.0
     **/
    environment.node = typeof module !== "undefined" && typeof module.exports === "object";
    if (environment.node) {
        module.exports = FrameworkFactory;
    }

    //environment requirejs
    environment.requirejs = typeof define !== "undefined" && typeof define.amd === "object";
    if (environment.requirejs) {
        define(function() {
            return FrameworkFactory;
        });
    }

    //environment browser
    environment.browser = typeof window !== "undefined" && typeof window.document === "object";

    //Indentify global object
    FrameworkFactory.global = environment.node ? global : root;

    /**
     * The current version of framework factory.
     *
     * @field {string}
     * @defult 1.0.0
     *
     * @public
     * @version 1.0
     **/
    FrameworkFactory.version = '1.0.0';

    /**
     * Factory function which creates the core framework based on specified configuration
     * parameters.
     *
     * @function FrameworkFactory.create(config)
     * @param {objct} config The configuration object.
     * @returns {Object} The base framework.
     *
     * @example
     * // This example creates a new framework called `myFramework` and defines a class called `ClassA`.
     * //`ClassA` contains field called `name` which can be set through constructor `init`.
     *
     * var myFramework = FrameworkFactory.create({
     *     version: '1.2',
     *     framework: 'myFramework'
     * });
     *
     * myFramework.ClassA = myFramework.Class({
     *     name: myFramework.attribute("un-named"),
     *
     *     init: function (name) {
     *         this.name = name;
     *     }
     * });
     *
     * var a = new myFramework.ClassA("wow");
     * console.log(a.name);
     *
     * @memberOf FrameworkFactory
     * @public
     * @version 1.0
     **/
    FrameworkFactory.create = function create(c) {

        var _config = {},
            $f,
            otherVersion = null,
            plugin,
            name,
            key;

        if (typeof c === "string") {
            _config.name = c;
            _config.version = '1.0.0';
            $f = {};
        }
        else {
            c = c || {};

            _config.name = c.name || "framework";
            _config.version = c.version || '1.0.0';

            $f = _config.root || {};

            for (key in c) {
                if (c.hasOwnProperty(key) === true) {
                    if (key in _config === false) {
                        _config[key] = c[key];
                    }
                }
            }
        }

        /**
         * The current version of $f.
         * @field {string} returns
         *
         * @
         */
        $f.version = _config.version;

        //sets the framework name
        $f.name = _config.name;

        //assign the environment object to new framework.
        $f.environment = environment;

        /**
         * Returns the
         * @function config
         **/
        $f.config = function config(key, defaultValue) {
            if (_config[key] !== undefined) {
                return _config[key];
            }
            return defaultValue;
        };

        /**
         * Changes the $f configuration settings.
         * @function $f.config.set(key, value)
         * @param {string} key The name of the configuration key which needs to be changed.
         * @param {object} value The configuration value for specified key.
         * @example         *
         * $f.config.set("myOption", "new-value");
         *
         * @function $f.config.set(o)
         * @param {object} o The configuraiton object
         *
         * @example
         * $f.config.set({
         *     myOption: "new-value"
         * });
         *
         * @public
         */
        $f.config.set = function set() {
            var o = arguments[0],
                key;

            if (arguments.length === 1 && typeof(o) === "object") {
                for(key in o) {
                    if (o.hasOwnProperty(key) === true) {
                        _config[key] = o[key];
                    }
                }
            }
            else if (arguments.length === 2) {
                _config[arguments[0]] = arguments[1];
            }
        };

        //Load plugins
        for (i = 0, iLen = plugins.length; i < iLen; i += 1) {

            plugin = plugins[i];
            name = plugin.info.name;

            //Checks if plugin loaded
            if ($f[name] !== undefined) {
                throw new Error('Plugin with the name "' + name + '" already loaded.');
            }

            //If plugin is defined as function, execute it.
            if (typeof plugin === 'function') {
                plugin($f);
            }
            else if(typeof plugin === 'object') {
                plugin.load($f);
            }
        }

        return $f;
    };

    /**
     * Represents the plugins registry object.
     *
     * @field {Object}hh
     *
     * @memberOf FrameworkFactory
     * @public
     * @version 1.0
     **/
    FrameworkFactory.plugins = (function(){

        function Plugins() {};

        Plugins.prototype = {

            /**
             * Registers the new plugin for the framework. Once registered all the frameworks
             * created henceforth will have specified plugin available.
             * @param {Object} The plugin object.
             * @public
             * @version 1.0
             **/
            register: function register(plugin) {

                if (typeof plugin === 'function' || typeof plugin === 'object') {
                    if (plugin.info.name === undefined) {
                        throw new Error("Missing plugin name.");
                    }
                    plugins.push(plugin);
                    return;
                }
                throw new Error('Invalid plugin type.');
            },

            /**
             * Gets the names of all available plugins with FrameworkFactory.
             *
             * @returns {Array} The plugin names array.
             * @public
             * @version 1.0
             **/
            getNames: function getNames() {
                var names = [],
                    plugin,
                    i, iLen;
                for (i = 0, iLen = plugins.length; i < iLen; i += 1) {
                    plugin = plugins[i];
                    names.push(plugin.name);
                }
                return names;
            },

            /**
             * Gest the array of all the the registered plugins with FramewrokFactory.
             * @returns {Array} The plugings array.
             * @public
             * @version 1.0
             **/
            toArray: function toArray() {
                return plugins.slice();
            }
        };

        return new Plugins();

    })();



    /**
     * Represents the typeHandlers registry object.
     *
     * @memberOf FrameworkFactory
     * @public
     * @version 1.0
     **/
    FrameworkFactory.typeHandlers = (function(){

        function TypeHandlers() {};

        TypeHandlers.prototype = {

            /**
             * Registers the new typeHandler for the framework.
             *
             * @function
             * @param {Object} handler The typeHandler which needs to be registered.
             *
             * @namespace FrameworkFactory.typeHandlers
             * @public
             * @version 1.0
             **/
            register: function register(o) {

                if (typeof o === 'object') {
                    typeHandlers[o.type] = o;
                    return;
                }
                throw new Error('Invalid typeHandler.');
            },

            /**
             * Returns the handler function which is used to handle associated types during class creation.
             *
             * @function
             * @param {string} type The type name of typeHandler.
             * @returns {function} The handler function.
             *
             * @namespace FrameworkFactory.typeHandlers
             * @public
             * @version 1.0
             **/
            get: function get(type) {
                return typeHandlers[type];
            },

            /**
             * Gets the types of all available typeHandlers with FrameworkFactory.
             *
             * @function
             * @returns {Array} The string array which contains types of all registered type handlers.
             *
             * @namespace FrameworkFactory.typeHandlers
             * @public
             * @version 1.0
             **/
            getTypes: function getTypes() {
                var types = [],
                    type;
                for (type in typeHandlers) {
                    if (typeHandlers.hasOwnProperty(type)) {
                        types.push(type);
                    }
                }
                return types;
            }
        };

        return new TypeHandlers();

    })();

    root.FrameworkFactory = FrameworkFactory;

})(this);

(function (root, undefined) {
    "use strict";

    var FrameworkFactory = root.FrameworkFactory;

    function plugin($f) {

        var _is = {

            //Validation
            /**
             * Checks whether given value is a function or not.
             * @function
             * @param {anything} val The val to be checked for function test.
             * @returns {boolean} ``true`` if parameter val is a valid function, else ``false``.
             * @public
             * @version 1.0
             **/
            func: function func(val) {
                return typeof val === 'function' || val instanceof Function  === true;
            },

            /**
             * Checks whether given value is a string or not.
             * @function
             * @param {anything} val The val to be checked for string test.
             * @returns {boolean} ``true`` if parameter val is a valid string, else ``false``.
             * @public
             * @version 1.0
             **/
            string: function string(val) {
                return typeof val === 'string' || val instanceof String === true;
            },

            /**
             * Checks whether given value is a number or not.
             * @function
             * @param {anything} val The val to be checked for number test.
             * @returns {boolean} ``true`` if parameter val is a valid number, else ``false``.
             * @public
             * @version 1.0
             **/
            number: function number(val) {
                return typeof val === 'number' || val instanceof Number  === true;
            },

            /**
             * Checks whether given value is a primitive or not.
             * @function
             * @param {anything} val The val to be checked for primitive test.
             * @returns {boolean} ``true`` if parameter val is a valid primitive, else ``false``.
             * @public
             * @version 1.0
             **/
            primitive: function primitive(val) {
                return _is.string(val) || _is.number(val);
            },

            /**
             * Checks whether specified value is undefined or not.
             * @function undef
             * @module <future-framework>.is
             * @param {anything} val The val to be checked for undefined test.
             * @returns {boolean} ``true`` if parameter val is a valid undefined, else ``false``.
             * @public
             * @version 1.0
             **/
            undef: function undef(val) {
                return val === undefined;
            },

            nullOrUndef: function nullOrUndef(val) {
                return val === undefined || val === null;
            },

            date: function date(val) {
                return val instanceof Date === true;
            },

            plainObject: function (val) {
                if (val === undefined || val === null) { return false; }
                return ((typeof val === 'object') && (val.constructor === Object));
            },

            concreteObject: function (val) {
                return (_is.primitive(val) || _is.date(val) || _is.nullOrUndef(val) || _is.array(val)) === false;
            },

            array: function (val) {
                return val instanceof Array;
            },

            inBrowser: function browser() {
                return window !== undefined && root === window;
            }
        };

        $f.is = _is;
    }

    plugin.info = {
        name: 'is'
    };

    FrameworkFactory.plugins.register(plugin);

})(this);
(function (root, undefined) {
    "use strict";

    var FrameworkFactory = root.FrameworkFactory;

    function _initTypeHandlers(Class) {
        var types = FrameworkFactory.typeHandlers.getTypes(),
            type, typeHandler,
            i, iLen;

        for (i=0, iLen=types.length; i < iLen; i += 1) {
            type = types[i];
            typeHandler = FrameworkFactory.typeHandlers.get(type);
            if (typeHandler.init) {
                typeHandler.init(Class);
            }
        }
    }

    function _plainObject (val) {
        if (val === undefined || val === null) { return false; }
        return ((typeof val === 'object') && (val.constructor === Object));
    }

    function _copyKeys(o, newO, overrideExisting) {
        var key, val;

        overrideExisting = (overrideExisting === undefined) ? true : overrideExisting;

        for(key in o) {
            if (o.hasOwnProperty(key)) {
                val = o[key];
                if (overrideExisting) {
                    newO[key] = val;
                }
                else {
                    if(key in newO === false) {
                        newO[key] = val;
                    }
                }
            }
        }
    }

    function _updateMeta(Class) {
        var meta = Class.__meta__,
            parentMeta = {};

        if(Class.constructor.__baseMeta__) {
            _copyKeys(Class.constructor.__baseMeta__, parentMeta);
        }

        _copyKeys(parentMeta, meta, false);
    }

    function plugin($f) {

        var initializing = true,
            fnTest = /xyz/.test(function (){xyz;}) ? /\bbase\b/ : /.*/,
            defaultBaseClass = $f.config('defaultBaseClass'),
            requireNew = $f.config('requireNew', false),
            Class;

        if (defaultBaseClass !== undefined && $f[defaultBaseClass] === undefined) {
            $f['defaultBaseClass'] = defaultBaseClass;
        }

        Class = function (prop, parent) {
            var hasProp = Object.prototype.hasOwnProperty,
                proto, key, Constructor, __base__, funcString,
                create = Object.create;

            if ($f['defaultBaseClass'] !== undefined) {
                parent  = parent || $f['defaultBaseClass'];
            }
            else {
                parent = parent || Object;
            }
            prop    = prop || {};
            proto = create(parent.prototype);

            if (requireNew) {
                Constructor = function Object () {
                    if (this instanceof Constructor === false) {
                        throw new Error('Constructor used as function.');
                    }
                    // This.constructor = Constructor;
                    if (initializing === false && this.init !== undefined) {
                        this.init.apply(this, arguments);
                    }
                };
            }
            else {
                Constructor = function Object () {
                    var inst = null;

                    // Constructor is called as function,
                    // instanciate it and return instance object.
                    if(this instanceof Constructor === false) {
                        inst = create(Constructor.prototype);
                        if (inst.init !== undefined) {
                            inst.init.apply(inst, arguments);
                        }
                        return inst;
                    }
                    // This.constructor = Constructor;
                    if (this.init !== undefined) {
                        this.init.apply(this, arguments);
                    }
                };
            }

            //for each static members in parents, copy'em to child
            for (key in parent) {
                //if parent owns the key, set child item = parent item
                if (hasProp.call(parent, key)) {
                    Constructor[key] = parent[key];
                }
            }

            __base__ = parent.prototype;

            Constructor.prototype = proto;
            Constructor.prototype.constructor = Constructor;
            Constructor.__base__ = __base__;

            Constructor.attach = function attach(prop) {

                var item, type, val, processed,
                    key,
                    typeHandler;

                for(key in prop) {
                    if (hasProp.call(prop, key)) {
                        item = prop[key];
                        type = typeof item;
                        val = item;
                        processed = false;

                        if ($f.is.plainObject(item)) {
                            typeHandler = FrameworkFactory.typeHandlers.get(item.type);

                            if (typeHandler !== undefined && typeHandler.handler !== undefined) {
                                typeHandler.handler(Constructor, key, item);
                                processed = true;
                            }
                        }
                        else if (type === 'function' &&
                                typeof __base__[key] === 'function' &&
                                fnTest.test(item)) {
                            proto[key] = (function (key, fn) {
                                var baseFunc = function () {
                                        __base__[key].apply(this, arguments);
                                    },
                                    wrapper = function () {
                                        this.base =  baseFunc;
                                        var ret = fn.apply(this, arguments);
                                        this.base = null;
                                        return ret;
                                    };
                                return wrapper;
                            })(key, item);
                            processed = true;
                        }

                        if (!processed) {
                            proto[key] = val;
                        }
                        Constructor.__meta__[key] = item;
                    }
                }
                _updateMeta(Constructor);
            };

            Constructor.__meta__ = {};
            Constructor.__baseMeta__ = __base__.constructor.__meta__;
            _initTypeHandlers(Constructor);
            Constructor.attach(prop);

            //return
            return Constructor;

        };

        $f.Class = Class;

    }

    plugin.info = {
        name: "classes"
    };

    FrameworkFactory.plugins.register(plugin);

})(this);

(function (root, undefined) {
    "use strict";

    var FrameworkFactory = root.FrameworkFactory;

    function plugin($f) {

        var attribute = function (defaultValue) {
                return {
                    type: 'attribute',
                    defaultValue: defaultValue
                };
            };

        /**
         * Helper function to create attribute members for class.
         * @function
         * @param defaultValue The default value of the attribute.
         * @option [options] Additional options for attribute member.
         * @public
         * @version 1.0.0
         **/
        $f.attribute = attribute;

        /**
         * Shortcut to framework.attribute method.
         * @see Framework#attribute
         **/
        $f.attr = attribute;

        FrameworkFactory.typeHandlers.register({
            type: "attribute",
            handler: function handler(Class, key, options) {
                var proto = Class.prototype;
                proto[key] = options.defaultValue;
            }
        });

    }

    plugin.info = {
        name: 'attributes'
    };

    FrameworkFactory.plugins.register(plugin);

})(this);

(function (root, undefined) {
    "use strict";

    var FrameworkFactory = root.FrameworkFactory;

    function plugin($f) {

        $f.event = function () {
            return {
                type: 'event'
            };
        };

        FrameworkFactory.typeHandlers.register({
            type: "event",
            init: function init(Class) {
                var proto = Class.prototype,
                    subscribedEventKeys = {},
                    subscribedEvents = [];

                /**
                 * Registers the event handler for one or more plugin.
                 * This function is similar to obj.eventName except it accepts more then one plugin.
                 * @example
                 * var btn = new Button();
                 * btn.on('mousemove mouseout mouseup', function() {});
                 **/
                proto.on = function (eventNames, eventHandler) {
                    //Conver the event names to lower case.
                    var names = eventNames.toLowerCase().split(' '),
                        i, iLen, eventName,
                        privKey;

                    if (!$f.is.func(eventHandler)) {
                        throw new Error('Only functions can be registered as event handler');
                    }

                    for (i = 0, iLen = names.length; i < iLen; i += 1) {
                        eventName = String.trim(names[i]);

                        privKey = '_' + eventName;
                        if (this[privKey] === undefined) {
                            this[privKey] = [];
                        }
                        this[privKey].push(eventHandler);

                        if (subscribedEventKeys[eventName] === undefined) {
                            subscribedEvents.push(eventName);
                            subscribedEventKeys[eventName] = true;
                        }
                    }
                    return this;
                };

                /**
                 * Triggers an event causes all the hander associated with the event
                 * to be invoked.
                 * @param evantName The name of the event to be triggered.
                 * @param args arguments to be supplied to event handler. The args must be
                 * derived from an Object. This is an optional parameter if it is not supplied
                 * it will be created having a field 'eventName' which will help identify
                 * the name of the event which triggered.
                 **/
                proto.trigger = function (eventName, args) {

                    var subscribers = this['_' + eventName.toLowerCase()],
                            callback,
                            i;
                    if (subscribers === undefined || subscribers.length === 0) {
                        return this; //No need to fire event, sicne there is no subscriber.
                    }
                    args = args || {};
                    args.eventName = eventName;
                    for (i = 0; i < subscribers.length; i += 1) {
                        callback = subscribers[i];
                        if (callback.call(this, args) === false) {
                            //no more firing, if handler returns false.
                            break;
                        }
                    }
                    return this;
                };

                /**
                 * Disassociate the handler from the trigger.
                 **/
                proto.off = function (eventName, handler) {
                    var subscribers = this['_' + eventName.toLowerCase()],
                        index;

                    //Specified event not registered so no need to put it off.
                    if (subscribers === undefined) {
                        return;
                    }

                    //If handler is not provided, remove all subscribers
                    if (handler === undefined) {
                        subscribers.length = 0;
                        return this;
                    }

                    index = subscribers.indexOf(handler);
                    if (index !== -1) {
                        subscribers.splice(index, 1);
                    }
                    return this;
                };

                /**
                 * Unsubscribe all the events from all the subscribers. Use this method to clean up
                 * or detatch event handlers from the object.
                 *
                 * @function $f.Class.unsubscribeAll()
                 * @returns {Object} The current object.
                 *
                 * @public
                 **/
                proto.unsubscribeAll = function unsubscribeAll() {
                    var events = subscribedEvents,
                        i, iLen = events.length;

                    for(i=0; i < iLen; i += 1) {
                        this.off(events[i]);
                    }
                    return this;
                };

                /**
                 *
                 */
                proto.subscribers = function subscribers(eventName) {
                    var eventSubscribers = this['_' + eventName.toLowerCase()];
                    return (eventSubscribers) ? eventSubscribers.slice() : [];
                };
            },

            handler: function handler(Class, key) {

                var proto = Class.prototype;

                /**
                 * Registers the event for particular event.
                 * @function
                 * @param {function} handler The handler function which should be invoked on event.
                 * @returns The current object.
                 * @example
                 * var btn = new Button();
                 * btn.mouseMove(function(){
                 *     console.log('mouse is moving');
                 * });
                 **/
                proto[key] = function (eventHandler) {
                    this.on(key, eventHandler);
                    return this;
                };

                proto[key].event = true;

                proto[key].importObject = function (o, k, v) {
                    o[k].call(o, v);
                };
            }
        });
    }

    plugin.info = {
        name: 'attributes'
    };

    FrameworkFactory.plugins.register(plugin);

})(this);


(function (root, undefined) {
    "use strict";

    var FrameworkFactory = root.FrameworkFactory;

    function plugin($f) {

        var readonly, property, handler;

        /**
         * Attaches the property to the given object. If setter is not specified creates reaonly property.
         * @param {Object} obj The object on which property has to be attached.
         * @param {string} key The key or name of the property.
         * @param {function} getter The getter function, this function will be called whenever get
         *        operation is required.
         * @param {function} setter The setter function, this function will be called whenever set
         *        operation is required. If this setter is missing, it will make the property readonly.
         *        And will throw an errror whenever property is set.
         * @public
         * @version 1.0
         **/
        function attachProperty(obj, key, getter, setter) {

            setter = setter || function () {
                throw new Error('Cannot assign to readonly property "' + key + '".');
            };

            if (Object.defineProperty) {
                Object.defineProperty(obj, key, {
                    enumerable: true,
                    configurable: true,
                    get: getter,
                    set: setter
                });
            }
            else if (obj.__defineGetter__ !== undefined) {
                obj.__defineGetter__(key, getter);
                obj.__defineSetter__(key, setter);
            }
            else {
                throw new Error("Properties are not supported in current environment.");
            }
        }

        function attachReadonly(obj, key, getter) {
            attachProperty(obj, key, getter);
        }

        /**
         * Attaches readonly member to associated class.
         */
        readonly = function readonly(options) {
            var get, value;

            if ($f.is.plainObject(options)) {
                value = options.value;
                if ($f.is.func(options.get)) {
                    get = options.get;
                }
            }
            else {
                value = options;
            }

            return {
                type            : 'readonly',
                value           : value,
                readonly        : true,
                get             : get,
                set             : undefined
            };
        };

        /**
         * While defining class, this function sets the member as
         * a property.
         * @param: defaultValue, the default value of property
         * @param: firePropertyChanged, if true,
         * @function
         * @public
         * @version 1.0.0
         **/
        property = function property(options) {

            var valueOf,
                value,
                get, set;

            if ($f.is.plainObject(options)) {
                value = options.value;
                get = options.get;
                set = options.set;

                //If get is provided but not set, return readonly version.
                if (get && !set) {
                    return readonly(options);
                }
            }
            else {
                value = options;
            }

            return {
                type : 'property',
                readonly : false,
                value : value,
                get : get,
                set : set
            };
        };

        handler = function (Class, key, options) {

            var proto       = Class.prototype, _get, _set,
                readonly    = options.readonly,
                getter      = options.get,
                setter      = options.set,
                privateKey     = '_' + key,
                value       = options.value;

            if (readonly) {
                if (getter !== undefined) {
                    _get = getter;
                }
                else {
                    _get = function () {
                        return this[privateKey];
                    };
                }
            }
            else {

                _get = getter || function () {
                    return this[privateKey];
                };

                _set = setter || function (v) {
                    this[privateKey] = v;
                };

            }

            if (value !== undefined) {
                proto[privateKey] = value;
            }

            attachProperty(proto, key, _get, _set);
        };

        $f.attachProperty = attachProperty;
        $f.attachReadonly = attachReadonly;
        $f.property     = property;
        $f.readonly     = readonly;

        FrameworkFactory.typeHandlers.register({
            type: "property",
            handler: handler
        });

        FrameworkFactory.typeHandlers.register({
            type: "readonly",
            handler: handler
        });

    }

    plugin.info = {
        name: 'properties'
    };

    FrameworkFactory.plugins.register(plugin);

})(this);

(function (root, undefined) {
    "use strict";

    var FrameworkFactory = root.FrameworkFactory;

    function _attachProperty(obj, key, getter, setter) {

        if (Object.defineProperty) {
            Object.defineProperty(obj, key, {
                enumerable: true,
                configurable: true,
                get: getter,
                set: setter
            });
        }
        else if (obj.__defineGetter__ !== undefined) {
            obj.__defineGetter__(key, getter);
            obj.__defineSetter__(key, setter);
        }
        else {
            throw new Error("Properties are not supported in current environment.");
        }
    }

    function observable (value) {
        return {
            type: 'observable',
            value: value
        };
    }


    function plugin($f) {

        $f.observable = observable;

        FrameworkFactory.typeHandlers.register({
            type: "observable",
            init: function (Class) {
                var proto = Class.prototype;

                proto.set = function set() {
                    var o = arguments[0],
                        key, privateKey, changed = {},
                        oldVal, newVal;

                    if (arguments.length === 1 && typeof(o) === "object") {
                        for(key in o) {
                            if (o.hasOwnProperty(key) === true && (this[key] !== o[key])) {
                                privateKey = "_" + key;
                                oldVal = this[key];
                                newVal = o[key];
                                this[privateKey] = newVal;
                                changed[key] = {
                                    oldValue: oldVal,
                                    newValue: newVal
                                };
                            }
                        }
                    }

                    else if (arguments.length === 2) {
                        key = arguments[0];
                        privateKey = "_" + key;
                        oldVal = this[key];
                        newVal = arguments[1];

                        if (oldVal !== newVal) {
                            this[privateKey] = newVal;
                            changed[key] = {
                                oldValue: oldVal,
                                newValue: newVal
                            };
                        }
                    }

                    this.onChange(changed);
                    return this;
                };

                proto.onChange = function onChange(changed) {
                    this.trigger("change", {
                        changed: changed
                    });
                    return this;
                };

                Class.attach({
                    change: $f.event()
                });

            },
            handler: function (Class, key, options) {
                var proto = Class.prototype,
                    privateKey = "_" + key,
                    get, set;

                proto[privateKey] = options.value;

                get = function get() {
                    return this[privateKey];
                };

                set = function set(v) {
                    var value = this[privateKey],
                        changed;

                    if (value !== v) {
                        this[privateKey] = v;
                        changed = {};
                        changed[key] = { oldValue: value, newValue: v };
                        this.onChange(changed);
                    }
                };
                _attachProperty(proto, key, get, set);
            }
        });

    }

    plugin.info = {
        name: 'observables'
    };

    FrameworkFactory.plugins.register(plugin);

})(this);
(function (global, undefined) {
    "use strict";

    var FrameworkFactory = global.FrameworkFactory;

    function plugin($f) {

        /**
         * Returns the cloned object created using deep copy algorithm.
         * @param o Object or anything that need to be cloned.
         * @returns The cloned object.
         * @ref: http://stackoverflow.com/questions/728360/copying-an-object-in-javascript
         * @thanks A. Levy
         * @remark:
         *  - Modified to handle circular dependencies.
         *  - May not behave as expected if object consturctor accepts various parameters.
         **/
        $f.clone = function clone(o) {
            // To improve performance, need to replace array with some sort of
            //hash map that accepts objects as key.
            var objRefs = [];

            function doCopy(obj) {

                var copy, i, iLen;

                if (objRefs.indexOf(obj) >= 0) {
                     //Object found, return the same object no need to copy it.
                    return obj;
                }
                else {
                    objRefs.push(obj);
                }
                // Handle the 3 simple types, and null or undefined
                if (null === obj || "object" !== typeof obj) {
                    return obj;
                }

                // Handle Date
                if (obj instanceof Date) {
                    copy = new Date();
                    copy.setTime(obj.getTime());
                    return copy;
                }

                // Handle Array
                if (obj instanceof Array) {
                    copy = [];
                    for (i = 0, iLen = obj.length; i < iLen; i += 1) {
                        copy[i] = doCopy(obj[i]);
                    }
                    return copy;
                }

                // Handle Object
                if (obj instanceof Object) {
                    copy = new obj.constructor();
                    for (var attr in obj) {
                        if (obj.hasOwnProperty(attr) === true) {
                            copy[attr] = doCopy(obj[attr]);
                        }
                    }
                    return copy;
                }
                throw new Error("Unable to copy obj! Its type isn't supported.");
            }
            return doCopy(o);
        };
    }

    plugin.info = {
        name: "clone",
        author: "Mohamed Aamir Maniar",
        version: "1.0"
    };

    plugin.toString = function toString() {
        return plugin.info.name;
    };

    FrameworkFactory.plugins.register(plugin);


})(this);

(function (global, undefined) {
    "use strict";

    function utils($f, config) {

        $f.utils = {

            /**
             * Checks whether both the objects are equals. Iterates through all the
             * members to check equality.
             * @function framework.utils.equals
             * @param o1 The first object
             * @param o2 The second object
             * @returns True if both the objects are equal, false if they are not.
             **/
            equals: function (o1, o2) {

                var key, v1, v2, i, iLen;

                // True if both objects references are same.
                if (o1 === o2) {
                    return true;
                }

                for (key in o1) {
                    //If key exists in o1 but not in o2, return false.
                    if (o2[key] === undefined) {
                        return false;
                    }

                    v1 = o1[key];
                    v2 = o2[key];

                    //Skip functions
                    if ($f.is.func(key)) {
                        continue;
                    }

                    if ($f.is.primitive(v1)) {
                        if (v1 instanceof Object) {
                            if (v1.toString() !== v2.toString()) {
                                return false;
                            }
                        }
                        else {
                            if (v1 !== v2) {
                                return false;
                            }
                        }
                    }
                    else if ($f.is.date(v1)) {
                        if (v1.getTime() !== v2.getTime()) {
                            return false;
                        }
                    }
                    else if ($f.is.array(v1)) {
                        for (i = 0, iLen = v1.length; i < iLen; i += 1) {
                            if ($f.utils.equals(v1[i], v2[i]) === false) {
                                return false;
                            }
                        }
                    }
                    else {
                        if ($f.utils.equals(v1, v2) === false) {
                            return false;
                        }
                    }
                }

                //If key exists in o2 but not in o1, returns false.
                for (key in o2) {
                    if (o1[key] === undefined) {
                        return false;
                    }
                }
                //Return true, becuase no differences found.
                return true;

            },


            /**
            * Returns the cloned object created using deep copy algorithm.
            * @param Object that need to be copied.
            * @returns Deep copied object. *
            * @ref: http://stackoverflow.com/questions/728360/copying-an-object-in-javascript
            * @remark:
            *  - Modified to handle circular dependencies.
            *  - May not behave as expected if object consturctor accepts various parameters.
            **/
            deepCopy: function deepCopy(o) {

                // To improve performance, need to replace array with some sort of
                //hash map that accepts objects as key.
                var objRefs = [];

                function doCopy(obj) {

                    var copy, i, iLen;

                    if (objRefs.indexOf(obj) >= 0) {
                         //Object found, return the same object no need to copy it.
                        return obj;
                    }
                    else {
                        objRefs.push(obj);
                    }
                    // Handle the 3 simple types, and null or undefined
                    if (null === obj || "object" !== typeof obj) {
                        return obj;
                    }

                    // Handle Date
                    if (obj instanceof Date) {
                        copy = new Date();
                        copy.setTime(obj.getTime());
                        return copy;
                    }

                    // Handle Array
                    if (obj instanceof Array) {
                        copy = [];
                        for (i = 0, iLen = obj.length; i < iLen; i += 1) {
                            copy[i] = doCopy(obj[i]);
                        }
                        return copy;
                    }

                    // Handle Object
                    if (obj instanceof Object) {
                        copy = new obj.constructor();
                        for (var attr in obj) {
                            if (obj.hasOwnProperty(attr) === true) {
                                copy[attr] = doCopy(obj[attr]);
                            }
                        }
                        return copy;
                    }
                    throw new Error("Unable to copy obj! Its type isn't supported.");
                }
                return doCopy(o);
            },

            importObject: function (o, json, options) {

                options = options || {};
                var key;

                for (key in json) {

                    //Check json object owns the member
                    if (json.hasOwnProperty(key) === true) {

                        //var propMemberType = typeof prop[key];
                        var oMemberType = typeof o[key];
                        var val = json[key];

                        switch (oMemberType) {
                        case 'object':
                            if (o[key] === null) {
                                o[key] = val;
                            }
                            else if (o[key].constructor.importObject !== undefined) {
                                o[key].constructor.importObject(o, key, val);
                            }
                            else if (o[key] instanceof Array) {
                                //Push the val to o[key].
                                //o[key].push.apply(o[key], val);
                                o[key] = val;
                            }
                            else {
                                $f.utils.importObject(o[key], val);
                            }
                            break;
                        case 'function':
                            if (o[key].importObject !== undefined) {
                                o[key].importObject(o, key, val);
                            }
                            else {
                                o[key] = val;
                            }
                            break;

                        default:
                            o[key] = val;
                        }
                    }
                }
            },

            //UUID
            simpleGuid: function(sep) {
                function section() {
                    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
                }
                return (section()+section()+"-"+section()+"-"+section()+"-"+section()+"-"+section()+section()+section());
            },

            //Empty
            emptyFn: function(){},

            'undefined': undefined

        };

    }

    utils.info = {
        name: 'utils'
    };

    utils.toString = function toString() {
        return utils.info.name;
    };

    global.FrameworkFactory.plugins.register(utils);


})(this);
