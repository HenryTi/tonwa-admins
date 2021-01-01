export interface Id {
    id: number;
}

export interface Api {
    name: string;
    url: string;
    token: string;
}

export interface App extends Id {
    name: string;
    discription: string;
    icon: string;
    owner: number;
    ownerName: string;
    ownerDiscription: string;
    url: string;
    apis?: {[name:string]: Api};
}

export interface Unit extends Id {
    type: number;
    name: string;
    nick: string;
    discription: string;
    icon: string;
    readMe: string;
    isRoot: number;
    isOwner: number;
    isAdmin: number;
    isDev: number;
    owner?: number;
    ownerName?: string;
    ownerNick?: string;
    ownerIcon?: string;
}

const unitCaptions = {
    1: '开发号',
    2: '小号',
    3: '系统号'
}
export function unitCaption(unit:Unit):String {
    return unitCaptions[unit.type] as string
}

export interface UnitApps extends Unit {
    apps: App[];
}

export interface UnitAdmin extends Id {
    name: string;
    nick: string;
    icon: string;
    type: number;
    country: string;
    mobile: string;
    email: string;
    isRoot: number;
    isOwner: number;
    isAdmin: number;
    isDev: number;
}
