
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
