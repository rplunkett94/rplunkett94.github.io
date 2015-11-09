///<reference path="../globals.ts" />
///<reference path="../host/control.ts" />

module TSOS {

    export class Memory {
        coreM: string[];
        memoryLength: number;

        constructor(length:number) {
            this.memoryLength = length;
            this.init(this.memoryLength);
        }

        public init(length):void {
            this.coreM = [length];
            for (var i = 0; i < length; i++) {
                this.coreM[i] = "00";
            }
        }

        public getMemory():string[] {
            return this.coreM;
        }

        public getMemoryFrom(loc) : string{
            return this.coreM[loc];
        }

        public clearMemory(): void {
            this.init(this.coreM);
           Control.emptyMemTable();
        }

        public isEmpty(): boolean {
            for(var i = 0; i < this.coreM.length; i++){
                if(this.coreM[i] != "00"){
                    return false;
                }
            }
            return true;
        }

    }
}
