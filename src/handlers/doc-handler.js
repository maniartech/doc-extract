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