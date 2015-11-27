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