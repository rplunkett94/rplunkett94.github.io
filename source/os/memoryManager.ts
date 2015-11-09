///<reference path="../globals.ts" />


module TSOS {

    export class MemoryManager {


        constructor(
            public block:number=0,
            public bases=[0,256, 512],
            public limits=[256, 512, 768 ]){}

        public fillMemory(code): void {
            _Mem.clearMemory();
            for (var i = 0; i < code.length; i++) {
                //console.log( "i = " + i + " " + "code = " + code[i]);
                this.updateMemoryLocation(i, code[i]);
            }
        }


        public updateMemoryLocation(loc, newCode): void {
            var tableRow = 0;
            var Hex = Control.decToHex(newCode);
            var currHex = _Mem.getMemory();

            if (Hex.length < 2) {
                Hex = "0" + Hex;
            }
            currHex[loc] = Hex;
            tableRow =  tableRow + Math.floor(loc / 8);
            var myloc = loc % 8;
            console.log("bleh " + loc, tableRow, Hex);
            console.log(_MemTable);
            Control.updateMemTableLoc(tableRow, myloc, Hex);
        }



        public getMemoryLocation(loc): any {
             return _Mem.getMemoryFrom(loc);
        }


    }
}

