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