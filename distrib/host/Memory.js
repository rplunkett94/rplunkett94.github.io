///<reference path="../globals.ts" />
///<reference path="../host/control.ts" />
var TSOS;
(function (TSOS) {
    var Memory = (function () {
        function Memory(length) {
            this.memoryLength = length;
            this.init(this.memoryLength);
        }
        Memory.prototype.init = function (length) {
            this.coreM = [length];
            for (var i = 0; i < length; i++) {
                this.coreM[i] = "00";
            }
        };
        Memory.prototype.getMemory = function () {
            return this.coreM;
        };
        Memory.prototype.getMemoryFrom = function (loc) {
            return this.coreM[loc];
        };
        Memory.prototype.clearMemory = function () {
            this.init(this.coreM);
            TSOS.Control.emptyMemTable();
        };
        Memory.prototype.isEmpty = function () {
            for (var i = 0; i < this.coreM.length; i++) {
                if (this.coreM[i] != "00") {
                    return false;
                }
            }
            return true;
        };
        return Memory;
    })();
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
