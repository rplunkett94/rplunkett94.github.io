///<reference path="../globals.ts" />
/* ------------
 PCB.ts
 ------------ */
var TSOS;
(function (TSOS) {
    var PCB = (function () {
        function PCB() {
            this.pid = _PID++;
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
        }
        return PCB;
    })();
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
