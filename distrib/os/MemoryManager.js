///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager(block, bases, limits) {
            if (block === void 0) { block = 0; }
            if (bases === void 0) { bases = [0, 256, 512]; }
            if (limits === void 0) { limits = [256, 512, 768]; }
            this.block = block;
            this.bases = bases;
            this.limits = limits;
        }
        MemoryManager.prototype.fillMemory = function (code) {
            _Mem.clearMemory();
            for (var i = 0; i < code.length; i++) {
                //console.log( "i = " + i + " " + "code = " + code[i]);
                this.updateMemoryLocation(i, code[i]);
            }
        };
        MemoryManager.prototype.updateMemoryLocation = function (loc, newCode) {
            var tableRow = 0;
            var Hex = TSOS.Control.decToHex(newCode);
            var currHex = _Mem.getMemory();
            if (Hex.length < 2) {
                Hex = "0" + Hex;
            }
            currHex[loc] = Hex;
            tableRow = tableRow + Math.floor(loc / 8);
            var myloc = loc % 8;
            console.log("bleh " + loc, tableRow, Hex);
            console.log(_MemTable);
            TSOS.Control.updateMemTableLoc(tableRow, myloc, Hex);
        };
        MemoryManager.prototype.getMemoryLocation = function (loc) {
            return _Mem.getMemoryFrom(loc);
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
