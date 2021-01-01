import { observable } from "mobx";
import { mainApi } from "api";
import { Unit } from "model";

export interface AdminDev {
    type: string;
    dev: number;
    user: number;
}

export interface UserUqsBuses {
    user: number;
    uqs: number[];
    buses: number[];
}

export interface UqUsers {
    uq: number;
    users: number[];
}

export interface BusUsers {
    bus: number;
    users: number[];
}

export class AdminDevs {
    private loaded:boolean = false;
    unit: Unit;
    @observable users: number[];
    @observable uqDevs: number[];
    @observable buses: number[];
    @observable devs: AdminDev[];

    constructor(unit: Unit) {
        this.unit = unit;
    }

    async load() {
        if (this.loaded === true) return;
        let ret = await mainApi.adminDevs(this.unit.id);
        this.loaded = true;
        this.users = ret[0].map(v => v.user);
        this.devs = ret[1];
        this.uqDevs = ret[2].map(v => v.id);
        this.buses = ret[3].map(v => v.id);
    }

    getUserUqsBuses(user: number):UserUqsBuses {
        //let ret:UserUqsBuses[] = [];
        //for (let user of this.users) {
            let uqs: number[] = [];
            let buses: number[] = [];
            let ret = {
                user: user,
                uqs: uqs,
                buses: buses
            };
            for (let dev of this.devs) {
                if (dev.user === user) {
                    switch (dev.type) {
                        case 'uq': uqs.push(dev.dev); break;
                        case 'bus': buses.push(dev.dev); break;
                    }
                }
            }
        //}
        return ret;
    }

    getUqUsers(): UqUsers[] {
        let ret:UqUsers[] = [];
        for (let uq of this.uqDevs) {
            let users: number[] = [];
            ret.push({
                uq: uq,
                users: users,
            });
            for (let dev of this.devs) {
                if (dev.type === 'uq' && dev.dev === uq) {
                    users.push(dev.user);
                }
            }
        }
        return ret;
    }

    getBusUsers(): BusUsers[] {
        let ret:BusUsers[] = [];
        for (let bus of this.buses) {
            let users: number[] = [];
            ret.push({
                bus: bus,
                users: users,
            });
            for (let dev of this.devs) {
                if (dev.type === 'bus' && dev.dev === bus) {
                    users.push(dev.user);
                }
            }
        }
        return ret;
    }
}
