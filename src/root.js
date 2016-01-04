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
