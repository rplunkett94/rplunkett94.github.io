///<reference path="../globals.ts" />
///<reference path="../os/shell.ts" />

/* ------------
     CPU.ts

     Requires global.ts.

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Cpu {

        constructor(public code: string = "",
                    public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false) {

        }

        public init(): void {
            this.code = "";
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        public clearProgram(){
            this.code = "";
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.

            var ir = _MemMan.getMemoryLocation(this.PC);

            this.opCodes(ir);
            if(_Step){
                this.isExecuting = false;
            }
            this.PC++;

            (<HTMLButtonElement>document.getElementById("pcVal")).innerHTML = (this.PC).toString();
            (<HTMLButtonElement>document.getElementById("irVal")).innerHTML = (ir).toString();
            (<HTMLButtonElement>document.getElementById("accVal")).innerHTML = (this.Acc).toString();
            (<HTMLButtonElement>document.getElementById("xRegVal")).innerHTML = (this.Xreg).toString();
            (<HTMLButtonElement>document.getElementById("yRegVal")).innerHTML = (this.Yreg).toString();
            (<HTMLButtonElement>document.getElementById("zFlagVal")).innerHTML = (this.Zflag).toString();
        }

        public opCodes(input):void {

            this.code = input.toUpperCase();
            console.log(this.code);
            switch (this.code) {
                case "A9": //Load the accumulator with a constant
                    this.loadAccumulatorConst();
                    break;
                case "AD": //Load the accumulator from memory
                    this.loadAccumulatorMemory();
                    break;
                case "8D": //Store the accumulator in memory
                    this.storeAccumulatorMemory();
                    break;
                case "6D": //Add with carry
                    this.addWithCarry();
                    break;
                case "A2": //Load the x register with a constant
                    this.loadXConst();
                    break;
                case "AE": //Load the x register from memory
                    this.loadXMemory();
                    break;
                case "A0": //Load the Y register with a constant
                    this.loadYConst();
                    break;
                case "AC": //Load the Y register from memory
                    this.loadYMemory();
                    break;
                case "EA": //No Operation
                    this.noOperation();
                    break;
                case "00": //Break
                    this.breakSysCall();
                    break;
                case "EC": //Compare a byte in memory to the x reg
                    this.compareByteInMemory();
                    break;
                case "D0": //Branch n bytes if z flag = 0
                    this.branchNByte();
                    break;
                case "EE": //Increment the value of a byte
                    this.incrementValueByte();
                    break;
                case "FF": //System Call
                    this.sysCall();
                    break;
                default: //No match
                    _StdOut.putText("There is no op code refering to " + this.code);

            }
        }

        public loadAccumulatorConst(){
            this.Acc = this.getNext();
            this.PC = this.PC + 1;
            _Kernel.krnTrace("load const into accumulator");
        }

        public loadAccumulatorMemory(){
            var location = this.getNextTwoBytes();
            this.Acc = Control.hexToDec(_MemMan.getMemoryLocation(location));
            this.PC = this.PC + 2;
            _Kernel.krnTrace("load acc from memory");
        }

        public storeAccumulatorMemory(){
            var location = this.getNextTwoBytes();

            _MemMan.updateMemoryLocation(location, Control.decToHex(this.Acc));
            this.PC = this.PC + 2;
            _Kernel.krnTrace("store acc into memory");
        }

        public addWithCarry(){
            var location = this.getNextTwoBytes();
            this.Acc += parseInt(_MemMan.getMemoryLocation(location));
            this.PC = this.PC + 2;
            _Kernel.krnTrace("add and store into acc");
        }

        public loadXConst(){
            this.Xreg = this.getNext();
            this.PC = this.PC + 1;
            _Kernel.krnTrace("load const into x");
        }

        public loadXMemory(){
            var location = this.getNextTwoBytes();
            this.Xreg = Control.hexToDec(_MemMan.getMemoryLocation( location));
            this.PC = this.PC + 2;
            _Kernel.krnTrace("load x from mem");
        }

        public loadYConst(){
            this.Yreg = this.getNext();
            this.PC = this.PC + 1;
            _Kernel.krnTrace("load const into y");
        }

        public loadYMemory(){
            var location = this.getNextTwoBytes();
            console.log("location" + location);
            this.Yreg = Control.hexToDec(_MemMan.getMemoryLocation(location));
            this.PC = this.PC + 2;
            _Kernel.krnTrace("load y from mem");
        }

        public noOperation(){
            _Kernel.krnTrace("no op");
        }

        public breakSysCall(){
            this.updatePCB();
            this.isExecuting = false;
            _Kernel.krnTrace("break");
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        }

        public compareByteInMemory(){
            var location = this.getNextTwoBytes();
            var Value = parseInt(_MemMan.getMemoryLocation(location));
            this.Zflag = (Value === this.Xreg) ? 1 : 0;
            this.PC = this.PC + 2;
            _Kernel.krnTrace("compare to x");
        }

        public branchNByte(){
            if (this.Zflag === 0) {
                var branch = this.getNext();
                this.PC += 1;
                this.PC = this.PC + branch;
                if (this.PC >= 256) {
                    this.PC = this.PC - 256;
                }
            } else {
                this.PC++;
            }
            _Kernel.krnTrace("branch");
        }

        public incrementValueByte(){
            var location = this.getNextTwoBytes();
            var value = 1 + Control.hexToDec(_MemMan.getMemoryLocation(location));
            _MemMan.updateMemoryLocation(location, value);
            this.PC = this.PC + 2;
            _Kernel.krnTrace("increment");
        }

        public sysCall(){
            if(this.Xreg == 1){
                console.log(Control.hexToDec(this.Yreg));
                _StdOut.putText(Control.hexToDec(this.Yreg).toString());
            }
            else if(this.Xreg == 2){
                var test = _MemMan.getMemoryLocation(this.Yreg);
                var text = "";
                var keyCode = 0;

                while(test != "00") {
                    keyCode = parseInt(test, 16);
                    text = String.fromCharCode(keyCode);
                    _StdOut.putText(text);
                    this.Yreg++;
                    test = _MemMan.getMemoryLocation(this.Yreg);
                }
                _Kernel.krnTrace("syscall");
            }

        }


        public updatePCB(){
            _PCB.PC = this.PC;
            _CPU.Acc = this.Acc;
            _CPU.Xreg = this.Xreg;
            _CPU.Yreg = this.Yreg;
            _CPU.Zflag = this.Zflag;

        }


        public getNext () {
            var nextByte = _MemMan.getMemoryLocation(this.PC + 1);
            return Control.hexToDec(nextByte);
        }

        public getNextTwoBytes() {
            var byteOne = _MemMan.getMemoryLocation(this.PC + 1);
            var byteTwo = _MemMan.getMemoryLocation(this.PC + 2);
            return Control.hexToDec(byteTwo + byteOne);
        }

        public resetCpu(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }
    }
}
