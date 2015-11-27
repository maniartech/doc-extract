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

//Define handlers
DocExtract.handlers = {};

//Field, Property, Readonly
DocExtract.handlers["field"] = DocExtract.FieldHandler;
DocExtract.handlers["property"] = DocExtract.FieldHandler;
DocExtract.handlers["readonly"] = DocExtract.FieldHandler;

//Constructor, Function
DocExtract.handlers["function"] = DocExtract.FunctionHandler;
DocExtract.handlers["constructor"] = DocExtract.FunctionHandler;
DocExtract.handlers["event"] = DocExtract.FunctionHandler;
DocExtract.handlers["class"] = DocExtract.ClassHandler;

if (FrameworkFactory.environment.node) {
    module.exports = DocExtract;
}
