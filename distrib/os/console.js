///<reference path="../globals.ts" />
/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var TSOS;
(function (TSOS) {
    var Console = (function () {
        function Console(currentFont, currentFontSize, currentXPosition, currentYPosition, buffer, bufferArray, bufferIndex) {
            if (currentFont === void 0) { currentFont = _DefaultFontFamily; }
            if (currentFontSize === void 0) { currentFontSize = _DefaultFontSize; }
            if (currentXPosition === void 0) { currentXPosition = 0; }
            if (currentYPosition === void 0) { currentYPosition = _DefaultFontSize; }
            if (buffer === void 0) { buffer = ""; }
            if (bufferArray === void 0) { bufferArray = []; }
            if (bufferIndex === void 0) { bufferIndex = 0; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
            this.bufferArray = bufferArray;
            this.bufferIndex = bufferIndex;
        }
        Console.prototype.init = function () {
            this.clearScreen();
            this.resetXY();
        };
        Console.prototype.clearScreen = function () {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        };
        Console.prototype.clearLine = function () {
            _DrawingContext.clearRect(0, this.currentYPosition - this.currentFontSize, _Canvas.width, this.currentFontSize + 5);
            this.currentXPosition = 0;
        };
        Console.prototype.backspace = function () {
            var bufferLength = this.buffer.length;
            var lastChar = bufferLength - 1;
            this.buffer = this.buffer.substring(0, lastChar);
            this.clearLine();
            this.putText(">" + this.buffer);
        };
        Console.prototype.autoComplete = function () {
            var lastMatch = "";
            var matchFound = false;
            for (var i = 0; i < _OsShell.commandList.length; ++i) {
                //console.log(this.buffer);
                //console.log(_OsShell.commandList[i].command.startsWith(this.buffer));
                if ((_OsShell.commandList[i].command.startsWith(this.buffer)) && this.buffer != "") {
                    matchFound = true;
                    this.advanceLine();
                    this.putText(">" + _OsShell.commandList[i].command);
                    lastMatch = _OsShell.commandList[i].command;
                }
            }
            if (matchFound) {
                this.buffer = lastMatch;
            }
            else {
                this.clearLine();
                this.buffer = "";
                this.putText("No Match");
                this.advanceLine();
                this.putText(">");
            }
        };
        Console.prototype.scroll = function () {
            var data = _DrawingContext.getImageData(0, 0, _Canvas.width, _Canvas.height);
            _Canvas.height += 100;
            _DrawingContext.putImageData(data, 0, 0);
        };
        Console.prototype.resetXY = function () {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        };
        Console.prototype.handleInput = function () {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) {
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    this.bufferArray[this.bufferArray.length] = this.buffer;
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                }
                else if (chr === String.fromCharCode(8)) {
                    this.backspace();
                }
                else if (chr === String.fromCharCode(9)) {
                    this.autoComplete();
                }
                else if (chr === String.fromCharCode(17) || chr === String.fromCharCode(18)) {
                    this.history(chr);
                }
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
            }
        };
        Console.prototype.putText = function (text) {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            //
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            //         Consider fixing that.
            if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
        };
        Console.prototype.advanceLine = function () {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            // TODO: Handle scrolling. (iProject 1)
            if (this.currentYPosition > _Canvas.height) {
                this.scroll();
            }
        };
        Console.prototype.history = function (args) {
            if (args === String.fromCharCode(37)) {
                if (this.bufferIndex < this.bufferArray.length) {
                    ++this.bufferIndex;
                    //console.log("test");
                    this.clearLine();
                    this.putText(">" + this.bufferArray[this.bufferArray.length - this.bufferIndex]);
                    this.buffer = this.bufferArray[this.bufferArray.length - this.bufferIndex];
                }
            }
            if (args === String.fromCharCode(39)) {
                if (this.bufferIndex >= 2) {
                    --this.bufferIndex;
                    this.clearLine();
                    this.putText(">" + this.bufferArray[this.bufferArray.length - this.bufferIndex]);
                    this.buffer = this.bufferArray[this.bufferArray.length - this.bufferIndex];
                }
            }
        };
        return Console;
    })();
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
