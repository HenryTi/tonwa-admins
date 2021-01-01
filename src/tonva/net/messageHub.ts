class MessageHub {
    private handlerSeed = 1;
    private anyHandlers:{[id:number]:(msg:any)=>Promise<void>} = {};
    private msgHandlers:{[id:number]:{type:string, handler:(msg:any)=>Promise<void>}} = {};
	registerReceiveHandler(handler:(msg:any)=>Promise<void>):number;
	registerReceiveHandler(type:string, handler:(msg:any)=>Promise<void>):number;	
    registerReceiveHandler(...args:any[]):number {
		let seed = this.handlerSeed++;
		let args0 = args[0];
		let handler:(msg:any)=>Promise<void>;
		switch (typeof args0) {
			case 'string':
				handler = args[1];
				this.msgHandlers[seed] = {type:args0, handler};
				break;
			case 'function':
				this.anyHandlers[seed] = args0;
				break;
		}
		return seed;
    }
    unregisterReceiveHandler(handlerId:number) {
        delete this.anyHandlers[handlerId];
        delete this.msgHandlers[handlerId];
    }
    async dispatch(msg:any) {
        let {$type} = msg;
        for (let i in this.anyHandlers) {
            await this.anyHandlers[i](msg);
        }
        for (let i in this.msgHandlers) {
            let {type, handler} = this.msgHandlers[i];
            if (type !== $type) continue;
            await handler(msg);
        }
    }
}

export const messageHub = new MessageHub();
