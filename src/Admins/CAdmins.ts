import { CUqBase } from "UqApp";
import { Unit, UnitAdmin } from "model";
import { Admins } from "store/admins";
import { VAdmins } from "./VAdmins";

export class CAdmins extends CUqBase {
    unit: Unit;
    admins: Admins;
    protected async internalStart(unit: Unit) {
        this.unit = unit;
        this.admins = new Admins(unit);
        await this.admins.load();

        this.openVPage(VAdmins);
    }

    setAdmin = async (isOwner:number, isAdmin:number) => {
        await this.admins.unitSetAdmin(isOwner, isAdmin, 0);
    }

    addAdmin = async (user:string):Promise<string> => {
        let ret = await this.admins.unitAddAdmin(user, 0, 1, 0);
        if (typeof ret === 'object') return;
        return ret;
    }

    delAdmins = async (unitAdmins: UnitAdmin[]) => {
        if (await this.confirm({
            caption: '确认移除',
            message: '真的要移除这些管理员吗？' + unitAdmins.map(v => v.name).join(','),
            ok: '确认'
        }) === 'ok') {
            let promises:Promise<any>[] = unitAdmins.map(v => this.admins.unitDelAdmin(v));
            await Promise.all(promises);
        }
    }
}
