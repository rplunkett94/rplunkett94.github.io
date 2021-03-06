///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    var Shell = (function () {
        function Shell() {
            // Properties
            this.promptStr = ">";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
        }
        Shell.prototype.init = function () {
            var sc;
            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current os version");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", " <string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.
            sc = new TSOS.ShellCommand(this.shellDate, "date", " - Returns the date.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellWhereami, "whereami", " - Geolocation.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellBackgroundColor, "backgroundcolor", " - changes background color");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "<string> - Enter a status");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellLoad, "load", " - Loads from the user program");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellError, "error", " - displays an error");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellRun, "run", "<PID> - Runs user program");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellClearMem, "clearmem", "- Clear memory partition");
            this.commandList[this.commandList.length] = sc;
            // Display the initial prompt.
            this.putPrompt();
        };
        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
        };
        Shell.prototype.handleInput = function (buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match.  TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            }
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) {
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {
                    this.execute(this.shellApology);
                }
                else {
                    this.execute(this.shellInvalidCommand);
                }
            }
        };
        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        Shell.prototype.execute = function (fn, args) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        };
        Shell.prototype.parseInput = function (buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            // 2. Lower-case it.
            buffer = buffer.toLowerCase();
            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        };
        //
        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        };
        Shell.prototype.shellCurse = function () {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        };
        Shell.prototype.shellApology = function () {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        };
        Shell.prototype.shellVer = function (args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        };
        Shell.prototype.shellHelp = function (args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        };
        Shell.prototype.shellShutdown = function (args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        };
        Shell.prototype.shellCls = function (args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        };
        Shell.prototype.shellMan = function (args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    // TODO: Make descriptive MANual page entries for the the rest of the shell commands here.
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    case "shutdown":
                        _StdOut.putText("Shutsdown the virtual os.");
                        break;
                    case "ver":
                        _StdOut.putText("Displays the version.");
                        break;
                    case "cls":
                        _StdOut.Text("Clears the screen.");
                        break;
                    case "curse":
                        _StdOut.Text("Says mean things to you.");
                        break;
                    case "Apology":
                        _StdOut.Text("Apologizes for being so mean.");
                        break;
                    case "InvalidCommand":
                        _StdOut.Text("Tells you when your commands are well... invalid");
                        break;
                    case "Trace":
                        _StdOut.Text("Turns the trace on or off.");
                        break;
                    case "Rot13":
                        _StdOut.Text("Does rot13 obfuscation on <string>.");
                        break;
                    case "Prompt":
                        _StdOut.Text("Sets the prompt.");
                        break;
                    case "date":
                        _StdOut.Text("Displays the date.");
                        break;
                    case "whereami":
                        _StdOut.Text("Displays user location.");
                        break;
                    case "backgroundcolor":
                        _StdOut.Text("Changes background color.");
                        break;
                    case "status":
                        _StdOut.Text("Displays a status");
                        break;
                    case "load":
                        _StdOut.Text("Loads a program");
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        };
        Shell.prototype.shellTrace = function (args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        };
        Shell.prototype.shellRot13 = function (args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellPrompt = function (args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellDate = function (args) {
            var d = new Date();
            var newDate = d.toDateString();
            _StdOut.putText(newDate + "  " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds());
        };
        Shell.prototype.shellWhereami = function (args) {
            _StdOut.putText("What do I look like Google Maps???");
        };
        Shell.prototype.shellBackgroundColor = function (args) {
            _StdOut.putText("going emo");
            document.body.style.background = "black";
        };
        Shell.prototype.shellStatus = function (args) {
            //_statusBar.value += (_StdOut.clearScreen());
            //this.shellCls(args);
            _statusBar.value += ("\n");
            _statusBar.value += ("Status: ");
            for (var i = 0; args.length > i; i++) {
                if (args.length > i) {
                    _statusBar.value += (" " + args[i]);
                }
                else {
                    _StdOut.putText("Usage: status <string>  Please supply a string.");
                }
            }
        };
        Shell.prototype.shellError = function (args) {
            _Kernel.krnTrapError("error");
        };
        Shell.prototype.shellLoad = function (args) {
            var i = 0;
            var valid = true;
            var program = _Load.value.trim();
            program = program.toUpperCase();
            while (i < program.length) {
                var val = program.charAt(i);
                if (val != 'A' && val != 'B' && val != 'C' && val != 'D' && val != 'E' && val != 'F' && val != '0' &&
                    val != '1' && val != '2' && val != '3' && val != '4' && val != '5' && val != '6' && val != '7' &&
                    val != '8' && val != '9' && val != ' ') {
                    valid = false;
                }
                i++;
            }
            if (valid == true && program.length != 0) {
                console.log(_MemTable);
                var inputText = program.replace(/\n/g, " ").split(" ");
                console.log(inputText);
                console.log("Load Complete");
                _PCB = new TSOS.PCB();
                _MemMan.fillMemory(inputText);
                _StdOut.putText("Program loaded, Pid: " + _PCB.pid);
                _CPU.clearProgram();
                _StdOut.advanceLine();
            }
            else {
                _StdOut.putText("Input is invalid");
            }
        };
        Shell.prototype.shellRun = function (args) {
            if (args.length > 0) {
                if (_Mem.isEmpty()) {
                    _StdOut.putText('Nothing is in memory. Please try and load program');
                }
                else if (args[0] == _PCB.pid) {
                    _CPU.resetCpu();
                    _Counter = 0;
                    _CPU.isExecuting = true;
                }
                else {
                    _StdOut.putText('Please input correct PID');
                }
            }
            else {
                _StdOut.putText("Input PID");
            }
        };
        Shell.prototype.shellClearMem = function (args) {
            var counter = 0;
            for (var i = 0; i < 32; i++) {
                for (var k = 0; k < 8; k++) {
                    (document.getElementById(counter.toString())).innerHTML = "00";
                    counter++;
                }
            }
        };
        return Shell;
    })();
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
