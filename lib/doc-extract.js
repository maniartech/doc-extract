if (typeof module !== "undefined" && typeof module.exports === "object") {
    var FrameworkFactory = require("framework-factory");
    var XRegExp = require("xregexp").XRegExp;
}

(function (root) {
    "use strict";

    root.DocExtract = FrameworkFactory.create({
        framework: "DocExtract",
        version: "1.0.0"
    });

    if (FrameworkFactory.environment.node) {
        module.exports = root.DocExtract;
    }

})(this);

(function (DocExtract) {

    "use strict";

    DocExtract.Extractor = DocExtract.Class({

        init: function (doc, verbose) {
            this.doc = doc;
            this.verbose = verbose || false;
        },

        extract: function() {
            var blockComments = this._getBlockComments(),
                i, comment,
                output = {};

            for(i = 0; i < blockComments.length; i += 1) {
                comment = this._parseComment(blockComments[i]);
                var handler = DocExtract.handlers[comment.type];
                if (!handler) {
                    handler = DocExtract.Handler;
                }
                if (comment.type) {
                    var h = new handler(output, comment);
                    h.verbose = this.verbose;
                    h.process();
                    h.attach();
                }
            }
            this.output = output;
        },

        _trim: function(text, trimChars) {
            var re = XRegExp('^[' + trimChars + ']+|[' + trimChars + ']+$', 'g');
            return text.replace(re, '');
        },

        _getBlockComments: function () {
            var doc = this.doc,
                exp = new XRegExp(/\/\*([^\*]|[\r\n]|(\*+([^\*\/]|[\r\n])))*\*+\//mg);
                return doc.match(exp);
        },

        _parseComment: function (comment) {

            var counter, i,
                exp, tagExp, carr, tag, v,
                option,
                parts = [],
                c, val,
                doc = {},
                tags = {}, type;

            exp = XRegExp.union([
                XRegExp('(?<tags>(@\\w*[^@]*\\s+[^@]))'),
                XRegExp('(?<description>(\\* ([^@])*))')
            ], 'g'),

            tagExp = /(@\w*)\s*(\{[\w\W]*\})?([\w\W]*)?/;

            carr = comment.match(exp);
            counter = 0;
            doc.tags = [];

            for(c in carr) {
                val = carr[c];
                //Trim whitespaces and *s from start and end.
                val = val.replace(/^[\s\*]+|[\s\*]+$/g, '');
                //Trim leading spaces and * from each line.
                val = val.replace(/[ \t]*((\* )|(\*))/g, '');
                if (val) {
                    parts.push(val);
                    if (val[0] === '@') {
                        tagExp.exec(val);
                        tag = RegExp.$1.substr(1);
                        option = RegExp.$2;
                        v = RegExp.$3.trim();

                        if (option) {
                            option = this._trim(option, "{}");
                        }
                        if (!doc.type && tag) {
                            doc.type = tag;
                        }
                        doc.tags.push({
                            tag: tag,
                            option: option || null,
                            value: v || null
                        });
                    }
                    else {
                        doc.description = val;
                    }
                }
            }
            return doc;
        }
    });

})(this.DocExtract);

(function (DocExtract) {
    "use strict";

    DocExtract.Handler = DocExtract.Class({

        init: function (doc, block) {
            var type = block.type,
                section = type + "s";

            this.doc = doc;
            this.block = block;
            this.comment = {
                type: type
            };

            this.verbose = false;

            switch(type.substr(-1)) {
                case "y":
                    section = type.substr(0, section.length - 2) + "ies";
                    break;
                case "s":
                    section = type + "es";
                    break;
            }
            this.section = section;
        },

        process: function() {
            var comment = this.comment,
                block = this.block,
                doc = this.doc,
                i;
            if (block.description) {
                comment.description = block.description;
            }

            for (i = 0; i < block.tags.length; i += 1) {
                this.processTag(block.tags[i]);
            }
        },

        processTag: function(tagItem) {
            var doc = this.doc,
                comment = this.comment,
                tag = tagItem.tag,
                option = tagItem.option,
                value = tagItem.value,
                parent, section;

            if (tag === "example") {
                value = this.normalizeExample(value);
            }


            if (option) {
                comment[tag] = {
                    type: option,
                    value: value
                };
            }
            else {
                comment[tag] = value || true;
            }
        },

        trim: function(text, trimChars) {
            var re = XRegExp('^[' + trimChars + ']+|[' + trimChars + ']+$', 'g');
            return text.replace(re, '');
        },

        warn: function () {
            if (this.verbose === true) {
                console.log.apply(console, arguments);
            }
        },

        find: function(path, root) {
            var index = path.indexOf("."),
                newRoot, newPath;

            root = root || this.doc;

            if (path.indexOf(".") !== -1) {
                newPath = path.substr(index + 1);
                newRoot = this.find(path.substr(0, index), root);
                return this.find(newPath, newRoot);
            }
            if (!root[path]) {
                root[path] = {};
            }
            return root[path];
        },

        getSection: function () {
            return this.section;
        },

        attach: function () {
            var memberOf = this.comment.memberOf,
                statik = this.comment["static"],
                lastIndex,
                attachTo,
                section = this.getSection(),
                comment = this.comment,
                module, className;

            if (memberOf) {
                lastIndex = memberOf.lastIndexOf(".");

                attachTo = this.find(memberOf);
                if (!attachTo[section]) {
                    attachTo[section] = [];
                }
                section = attachTo[section];
                section.push(this.comment);
                this.memberOf = attachTo;

                if (comment.name) {
                    className = memberOf.substring(memberOf.lastIndexOf(".") + 1);
                    comment.fullName = className + "." + comment.name;
                    comment.path = memberOf + "." + comment.name;
                    comment.className = className;
                }
            }
            else if(statik) {
                lastIndex = statik.lastIndexOf(".");
                attachTo = this.find(statik + ".static");
                if (!attachTo[section]) {
                    attachTo[section] = [];
                }
                section = attachTo[section];
                section.push(this.comment);
            }
        },

        normalizeExample: function (example) {
            var arr = example.split("\n");
            for (var i=0; i<arr.length; i++) {
                arr[i] = "  " + arr[i];
            }
            return arr.join("\n");
        }
    });

})(this.DocExtract);
(function (DocExtract) {
    "use strict";

    DocExtract.ClassHandler = DocExtract.Class({

        attach: function () {

            var cls = this.comment["class"],
                lastIndex,
                attachTo,
                module, className;

            if (!cls || cls === true) {
                this.warn("Class not defined.", this);
                return;
            }

            lastIndex = cls.lastIndexOf(".");

            if (lastIndex !== -1) {
                className = cls.substr(lastIndex + 1);
                module = cls.substr(0, lastIndex);
                attachTo = this.find(module);
                attachTo[className] = this.comment;
            }
        }

    }, DocExtract.Handler);

})(this.DocExtract);
(function (DocExtract) {
    "use strict";

    DocExtract.FieldHandler = DocExtract.Class({

        processTag: function (tagItem) {
            var comment = this.comment,
                tag = tagItem.tag,
                option = tagItem.option,
                value = tagItem.value,
                tags = {
                    "field": true,
                    "attribute": true,
                    "readonly": true,
                    "property": true
                };

            if (tag in tags) {
                comment.name = value;
                comment.fieldType = option;
            }
            else {
                this.base(tagItem);
            }

        }

    }, DocExtract.Handler);

})(this.DocExtract);
(function (DocExtract) {
    "use strict";

    DocExtract.FunctionHandler = DocExtract.Class({

        processTag: function (tagItem) {
            var comment = this.comment,
                tag = tagItem.tag,
                option = tagItem.option,
                value = tagItem.value,
                signature, className,
                i,
                tags = {
                    "constructor": true,
                    "function": true,
                    "callback": true,
                    "event": true,
                    "param": true,
                    "example": true,
                    "memberOf": true
                };

            if (tag  in tags) {
                switch(tag) {
                    case "function":
                    case "constructor":
                    case "callback":
                        if (!comment.name && value) {
                            comment.name = value.substring(value.lastIndexOf(".") + 1, value.indexOf("("));
                        }
                        if (this.current === undefined) {
                            this.current = {
                                signature: value,
                                params:[]
                            };
                            comment.overloads = [this.current];
                        }
                        else {
                            this.current = {
                                signature: value,
                                params:[]
                            };
                            comment.overloads.push(this.current);
                        }
                        break;
                    case "event":
                        if (!value) {
                            this.warn("Event name not defined.", comment);
                            break;
                        }
                        this.current = comment;
                        this.current.params = [];
                        comment.signature = value;
                        comment.name = value.substring(value.lastIndexOf(".") + 1, value.indexOf("("));
                        break;
                    case "param":
                        if (!this.current) {
                            this.warn("Function signature not defined.", comment);
                            break;
                        }
                        if (!option) {
                            this.warn("Missing parameter info for " + this.current.signature, comment);
                            break;
                        }
                        this.current.params.push(this._getParamObject(option, value));
                        break;

                    case "example":
                        if (!this.current) {
                            this.warn("Function signature not defined.", comment);
                            break;
                        }
                        value = this.normalizeExample(value);
                        this.current.example = value;
                        break;
                    case "memberOf":
                        if (comment.type === "function" || comment.type === "constructor" || comment.type === "callback") {
                            for (i=0; i<comment.overloads.length; i += 1) {
                                signature = comment.overloads[i].signature;
                                className = value.substring(value.lastIndexOf(".")+1);
                                if (comment.type === "constructor") {
                                    signature = signature.substring(signature.indexOf("("));
                                    comment.overloads[i].signature = className + signature;
                                }
                                else {
                                    comment.overloads[i].signature = className + "." + signature;
                                }
                            }
                        }
                        //comment.fullName = className + "." + comment.name;
                        //comment.fullPath = value + "." + comment.name;
                        this.base(tagItem);
                        break;

                    case "static":
                        for (i=0; i<comment.overloads.length; i += 1) {
                            signature = comment.overloads[i].signature;
                            className = value.substring(value.lastIndexOf(".")+1);
                            comment.overloads[i].signature = className + "." + signature;
                        }
                        this.base(tagItem);
                        break;

                }
            }
            else {
                this.base(tagItem);
            }
        },

        attach: function () {
            var comment = this.comment,
                memberOf;
            this.base();
            memberOf = this.memberOf;

            if (comment.type === "constructor") {
                if (memberOf && memberOf.constructors) {
                    memberOf.constructor = memberOf.constructors[0];
                    delete memberOf.constructor.name;
                    delete memberOf.constructor.fullName;
                    delete memberOf.constructors;
                    memberOf.constructor.path = memberOf.class;
                }
            }
        },

        _getParamObject: function (type, value) {
            var optional = false,
                name, description,
                index;

            value = value || "";
            index = value.indexOf(" ");

            if (index === -1) {
                name = value;
                description = null;
            }
            else {
                name = value.substring(0, index);
                description = value.substring(index + 1);
            }

            return {
                type: type,
                name: name,
                description: description,
                optional: type.substr(0, 1) === "["
            };
        }

    }, DocExtract.Handler);
})(this.DocExtract);

(function (DocExtract) {
    "use strict";

    // Define handlers
    DocExtract.handlers = {};

    // Field, Property, Readonly
    DocExtract.handlers["field"] = DocExtract.FieldHandler;
    DocExtract.handlers["property"] = DocExtract.FieldHandler;
    DocExtract.handlers["readonly"] = DocExtract.FieldHandler;

    //Constructor, Function
    DocExtract.handlers["function"] = DocExtract.FunctionHandler;
    DocExtract.handlers["constructor"] = DocExtract.FunctionHandler;
    DocExtract.handlers["callback"] = DocExtract.FunctionHandler;
    DocExtract.handlers["event"] = DocExtract.FunctionHandler;

    // Class
    DocExtract.handlers["class"] = DocExtract.ClassHandler;

})(this.DocExtract);
