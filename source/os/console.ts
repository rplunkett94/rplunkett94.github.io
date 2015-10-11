///<reference path="../globals.ts" />

/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "",
                    public bufferArray = [],
                    public bufferIndex = 0) {
        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }


        public clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }



        public clearLine():void{
            _DrawingContext.clearRect( 0,this.currentYPosition-this.currentFontSize , _Canvas.width,this.currentFontSize+5);
            this.currentXPosition=0;
        }


        public backspace():void{
            var bufferLength = this.buffer.length;
            var lastChar = bufferLength - 1;
            this.buffer = this.buffer.substring(0, lastChar);
            this.clearLine();
            this.putText(">" + this.buffer);
        }


        private autoComplete():void {
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
            if(matchFound) {
                this.buffer = lastMatch;

            }else {
                this.clearLine();
                this.buffer = "";
                this.putText("No Match");
                this.advanceLine();
                this.putText(">");
            }

        }

        public scroll(): void{
            var data = _DrawingContext.getImageData(0,0,_Canvas.width, _Canvas.height);
            _Canvas.height+=100;
            _DrawingContext.putImageData(data, 0,0);
        }


        private resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { //     Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    this.bufferArray[this.bufferArray.length]=this.buffer;
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                    // checks for click code (8)
                    // Removes the last character
                } else if(chr === String.fromCharCode(8)) {
                    this.backspace();
                    // checks for click code (9)
                    // completes command
                } else if(chr === String.fromCharCode(9)) {
                    this.autoComplete();

                } else if(chr === String.fromCharCode(17) || chr === String.fromCharCode(18)) {//arrows
                    this.history(chr);

                } else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Write a case for Ctrl-C.
            }
        }

        public putText(text): void {
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
         }

        public advanceLine(): void {
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
            if (this.currentYPosition >_Canvas.height) {
                this.scroll();
            }
        }

        public history(args): void {
            if (args === String.fromCharCode(37)) {
                if (this.bufferIndex < this.bufferArray.length) {
                    ++this.bufferIndex;
                    //console.log("test");
                    this.clearLine();
                    this.putText(">" + this.bufferArray[this.bufferArray.length - this.bufferIndex]);
                    this.buffer = this.bufferArray [this.bufferArray.length - this.bufferIndex];
                }
            }

            if (args === String.fromCharCode(39)) {
                if(this.bufferIndex >=2) {
                    --this.bufferIndex;
                    this.clearLine();
                    this.putText(">" + this.bufferArray[this.bufferArray.length - this.bufferIndex]);
                    this.buffer=this.bufferArray[this.bufferArray.length - this.bufferIndex];
                }
            }
        }
    }
 }
