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