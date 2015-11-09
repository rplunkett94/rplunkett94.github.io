///<reference path="../globals.ts" />

/* ------------
 PCB.ts
 ------------ */

module TSOS {

    export class PCB {
        pid: number;
        PC: number;
        Acc: number;
        Xreg: number;
        Yreg: number;
        Zflag: number;

        constructor(){
                this.pid = _PID++;
                this.PC = 0;
                this.Acc = 0;
                this.Xreg= 0;
                this.Yreg = 0;
                this.Zflag = 0;
        }
    }
}
