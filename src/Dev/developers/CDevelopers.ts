import { CUqBase } from "UqApp";
import { VDevelopers } from "./VDevelopers";
import { AdminDevs } from "store/adminDevs";
import { VUqsBuses } from "./VUqsBuses";
import { VUqs } from "./VUqs";
import { VBuses } from "./VBuses";
import { devApi, mainApi } from "api";
import { VAddDeveloper } from "./VAddDeveloper";

export class CDevelopers extends CUqBase {
    adminDevs: AdminDevs;

    protected async internalStart(adminDevs: AdminDevs) {
        this.adminDevs = adminDevs;
        this.openVPage(VDevelopers);
    }

    showUserUqsBuses(user: number) {
        this.openVPage(VUqsBuses, user);
    }

    showUserUqs(user: number) {
        this.openVPage(VUqs, user);
    }
    
    showUserBuses(user: number) {
        this.openVPage(VBuses, user);
    }

    async changeUserDev(isSelected:boolean, type:'uq'|'bus', user:number, dev:number) {
        if (isSelected === true) {
            await devApi.adminDevAdd({unit: this.adminDevs.unit.id, type: type, dev: dev, devUser: user});
            this.adminDevs.devs.push({
                type: type,
                user: user,
                dev: dev
            });
        }
        else {
            await devApi.adminDevDel({unit: this.adminDevs.unit.id, type: type, dev: dev, devUser: user});
            let index = this.adminDevs.devs.findIndex(v => v.dev===dev && v.type===type && v.user===user);
            if (index >= 0) this.adminDevs.devs.splice(index, 1);
        }
    }

    showAddDeveloper() {
        this.openVPage(VAddDeveloper);
    }

    async addDev(dev:string): Promise<any> {
        let {users, unit} = this.adminDevs;
        let ret = await mainApi.addDev(unit.id, dev);
        if (ret === undefined) {
            throw new Error('unauthorized!');
        }
        let {r, id} = ret;
        if (r === 'success') {
            users.push(id);
        }
        return ret;
    }

    async delDev(user: number): Promise<void> {
        let {users, unit} = this.adminDevs;
        await mainApi.delDev(unit.id, user);
        let index = users.findIndex(v => v === user);
        if (index >= 0) users.splice(index, 1);
    }
}
