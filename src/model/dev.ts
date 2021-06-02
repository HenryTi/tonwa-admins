import {Id} from './id';

// eslint-disable-next-line @typescript-eslint/no-namespace
//export namespace DevModel {
    export interface DevObjBase extends Id {
        unit: number;
        date_init: Date;
        date_update: Date;
    }

    export interface DevUQ extends DevObjBase {
        name: string;
        discription: string;
        owner?: string;
        //access: string;
        service_count: number;
    }

    export interface DevApp extends DevObjBase {
        name: string;
        caption: string;
        discription: string;
        icon: string;
        "public": number;
        server: number;
        uqMain: number;     // 主要uq
        inUnit: number;
        unitOnly: number;   // 只有指定user才能登录
    }

    export interface DevBus extends DevObjBase {
        name: string;
        version: number;
        discription: string;
        schema: string;
		source: string;
        owner?: string;
        mine: number;
        isPublic: number;
    }

    export interface DevServer extends DevObjBase {
        name: string;
        discription: string;
        cloud: string;
        ip: string;
        url: string;
    }

    export interface DevService extends DevObjBase {
        url: string;
        urlTest: string;
        name: string;
        discription: string;
        server: number;
        serverTest:number;
        app: number;
        uq: number;
        db: string;
        compile_time: number;
        deploy_time: number;
    }
//}

export type UnitApp = DevApp;