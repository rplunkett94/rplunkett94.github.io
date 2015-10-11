///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverKeyboard = (function (_super) {
        __extends(DeviceDriverKeyboard, _super);
        function DeviceDriverKeyboard() {
            // Override the base method pointers.
            _super.call(this, this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
        }
        DeviceDriverKeyboard.prototype.krnKbdDriverEntry = function () {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        };
        DeviceDriverKeyboard.prototype.krnKbdDispatchKeyPress = function (params) {
            // Parse the params.    TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            var shiftDigit = [50, 54, 55, 56, 57, 48]; //digits that dont match correct keycode
            var upperBound = [95, 43, 126, 58, 34, 60, 62, 63, 123, 125, 124]; //corresponding upper case
            var lowerBound = [45, 61, 96, 59, 39, 44, 46, 47, 91, 93, 92]; //corresponding lower case
            var specialChar = [189, 187, 192, 186, 222, 188, 190, 191, 219, 221, 220]; //keyCode of symbol key
            var symbolHold;
            if ((keyCode == 38 || keyCode == 40)) {
                switch (keyCode) {
                    case 38:
                        keyCode = 17;
                        break;
                    case 40:
                        keyCode = 18;
                        break;
                }
                //console.log(keyCode);
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }
            else if (((keyCode >= 65) && (keyCode <= 90)) ||
                ((keyCode >= 97) && (keyCode <= 123))) {
                // Determine the character we want to display.
                // Assume it's lowercase...
                chr = String.fromCharCode(keyCode + 32);
                // ... then check the shift key and re-adjust if necessary.
                if (isShifted) {
                    chr = String.fromCharCode(keyCode);
                    _Kernel.krnTrace("symbol " + chr + " KeyCode " + keyCode);
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            }
            else if (((keyCode >= 48) && (keyCode <= 57)) ||
                (keyCode == 32) ||
                (keyCode == 13) ||
                (keyCode == 8) ||
                (keyCode == 9)) {
                if (isShifted) {
                    if (shiftDigit.indexOf(keyCode) <= -1) {
                        keyCode = keyCode - 16;
                        _Kernel.krnTrace("symbol " + chr + " KeyCode " + keyCode);
                        chr = String.fromCharCode(keyCode);
                        _KernelInputQueue.enqueue(chr);
                    }
                    else if (shiftDigit.indexOf(keyCode) > -1) {
                        //handle switches from  digits to special characters
                        switch (keyCode) {
                            case 50:
                                keyCode = 64;
                                break;
                            case 54:
                                keyCode = 94;
                                break;
                            case 55:
                                keyCode = 38;
                                break;
                            case 56:
                                keyCode = 42;
                                break;
                            case 57:
                                keyCode = 40;
                                break;
                            case 48:
                                keyCode = 41;
                                break;
                        }
                        _Kernel.krnTrace("symbol " + chr + " KeyCode " + keyCode);
                        chr = String.fromCharCode(keyCode);
                        _KernelInputQueue.enqueue(chr);
                    }
                }
                else {
                    chr = String.fromCharCode(keyCode);
                    _KernelInputQueue.enqueue(chr);
                }
            }
            else if (specialChar.indexOf(keyCode) > -1) {
                symbolHold = specialChar.indexOf(keyCode);
                keyCode = lowerBound[symbolHold];
                if (isShifted) {
                    keyCode = upperBound[symbolHold];
                }
                _Kernel.krnTrace("symbol " + chr + " KeyCode " + keyCode);
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }
        };
        return DeviceDriverKeyboard;
    })(TSOS.DeviceDriver);
    TSOS.DeviceDriverKeyboard = DeviceDriverKeyboard;
})(TSOS || (TSOS = {}));
