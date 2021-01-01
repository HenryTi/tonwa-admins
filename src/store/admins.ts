import {observable} from 'mobx';
import {Unit, UnitAdmin} from '../model';
import {mainApi} from '../api';
//import {Store} from './store';

export class Admins {
    //private store:Store;
    private unit: Unit;
    constructor(unit: Unit/*store:Store*/) {
        //this.store = store;
        this.unit = unit;
    }

    @observable cur: UnitAdmin = undefined;
    @observable owners: UnitAdmin[] = undefined;
    @observable admins: UnitAdmin[] = undefined;
    @observable devs: UnitAdmin[] = undefined;
    
    async load(): Promise<void> {
        let unit = this.unit;
        if (unit === undefined) return;
        if (unit.id === undefined) return;
        if (this.admins !== undefined) return;
        let all = await mainApi.unitAdmins(unit.id);
        let owners:UnitAdmin[] = [];
        let admins:UnitAdmin[] = [];
        let devs:UnitAdmin[] = [];
        all.forEach(ua => {
            let {isOwner, isAdmin, isDev} = ua;
            if (isDev)
                devs.push(ua);
            else {
                if (isOwner === 1) owners.push(ua);
                if (isAdmin === 1) admins.push(ua);
            }
        });
        this.owners = owners;
        this.admins = admins;
        this.devs = devs;
    }

    private removeOneUnitAdmin(arr: UnitAdmin[], unitAdmin?: UnitAdmin) {
        let index = arr.findIndex(v => v.id===unitAdmin.id);
        if (index >=0) arr.splice(index, 1);
    }

    private removeUnitAdmin(unitAdmin?: UnitAdmin) {
        if (unitAdmin === undefined) unitAdmin = this.cur;
        this.removeOneUnitAdmin(this.owners, unitAdmin);
        this.removeOneUnitAdmin(this.admins, unitAdmin);
        this.removeOneUnitAdmin(this.devs, unitAdmin);
    }

    async unitSetAdmin(isOwner:number, isAdmin:number, isDev:number) {
        let cur = this.cur;
        let fellowId = cur.id, unitId = this.unit.id;
        await mainApi.unitSetAdmin(fellowId, unitId, isOwner, isAdmin, isDev);
        cur.isOwner = isOwner;
        cur.isAdmin = isAdmin;
        this.removeUnitAdmin();
        if (isOwner === 0 && isAdmin === 0)
            this.devs.unshift(cur);
        else {
            if (isOwner === 1) this.owners.unshift(cur);
            if (isAdmin === 1) this.admins.unshift(cur);
        }
    }

    async unitAddAdmin(user:string, isOwner:number, isAdmin:number, isDev:number):Promise<UnitAdmin|string> {
        let admin = await mainApi.unitAddAdmin(user, this.unit.id, isOwner, isAdmin, isDev);
        if (admin === undefined) return 'unauthorized';
        let {r} = admin;
        if (r !== undefined) return r;

        let cur = this.cur = admin;
        this.removeUnitAdmin();
        if (isOwner === 0 && isAdmin === 0)
            this.devs.unshift(cur);
        else {
            if (isOwner === 1) this.owners.unshift(cur);
            if (isAdmin === 1) this.admins.unshift(cur);
        }
        return admin;
    }

    async unitDelAdmin(unitAdmin: UnitAdmin) {
        await mainApi.unitDelAdmin(this.unit.id, unitAdmin.id);
        if (this.cur === unitAdmin) this.cur = undefined;
        this.removeUnitAdmin(unitAdmin);
    }
}
