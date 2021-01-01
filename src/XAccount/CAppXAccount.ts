import _ from 'lodash';
import { CUqBase } from "UqApp";
import { UnitApp, Unit, DevApp } from "model";
import { VApp } from "./VApp";
import { VDetail } from "./VDetail";
import { devApi, mainApi } from "api";
import { store } from "store";
import { observable } from 'mobx';
import { VAdmins } from './VAdmins';
import { VRoleUsers } from './VRoleUsers';
import { VNoRoleUsers } from './VNoRoleUsers';
import { VAddUserPage } from './VAddUserPage';
import { VUser } from './VUser';
import { VUserList } from './VUserList';
import { VEditUserPage } from './VEditUserPage';

export interface User {
    id: number;
    assigned: string;
    isAdmin: boolean;
    roleBins:number;
}

export interface Coll {
    admins: User[];
    users: User[];
    roleUsers: User[][];
}

export class CAppXAccount extends CUqBase {
    unit: Unit;
    appXAccount:DevApp;
    uqAccesses: any[];
    uqMain: number;
    uqRoles: string[];
    //userColl: {[id:number]: User};
    @observable users: User[];
    @observable unitOnly: boolean;
    @observable roleUserCount: number;

    async internalStart(unit:Unit, appXAccount:DevApp) {
        this.unit = unit;
        this.appXAccount = appXAccount;
        this.unitOnly = appXAccount.unitOnly === 1;
        await this.loadAppAdmins();
        this.openVPage(VApp);
    }

    private async loadAppAdmins() {
        let ret:any[][] = await mainApi.unitAppAdmins(this.unit.id, this.appXAccount.id);
        let {uq_main, roles} = ret[0][0];
        this.uqMain = uq_main;
        if (roles) {
            this.uqRoles = (roles as string).split('\t');
        }
        this.users = [];
        for (let admin of ret[1]) {
            let {user:id} = admin;
            let i = this.insertUser(id);
            if (i>=0) this.users[i].isAdmin = true;
        }
        let roleUserCount = 0;
        for (let userRoles of ret[2]) {
            let {user:id, roles} = userRoles;
            let i = this.insertUser(id);
            if (i>=0) {
                //let rolesArr = this.toRolesArr(roles);
                this.users[i].roleBins = roles; // rolesArr;
                //if (rolesArr !== undefined && rolesArr.length > 0) roleUserCount++;
                if (!roles) roleUserCount++;
            }
        }
        for (let item of ret[3]) {
            let {user:id, assigned} = item;
            let i = this.insertUser(id);
            if (i>=0) this.users[i].assigned = assigned;
        }
        this.roleUserCount = roleUserCount;
    }

    private insertUser(id:number):number {
        let len = this.users.length;
        let i:number;
        for (i=0; i<len; i++) {
            let u = this.users[i];
            let uid = u.id;
            if (id === uid) return i;
            if (id < uid) break;
        }
        this.users.splice(i, 0, {id:id} as User);
        return i;
    }

    private toRolesArr(n: number):number[] {
        if (this.uqRoles === undefined) return undefined;
        let ret:number[] = [];
        let len = this.uqRoles.length;
        let mask = 1;
        for (let i=0;i<len; i++, mask<<=1) {
            if ((n & mask) === mask) ret.push(i);
        }
        return ret;
    }

    calcUserColl = (): Coll => {
        let admins:User[] = [];
        let users:User[] = [];
        let roleUsers:User[][];
        let roleUserCount = 0;
        let len = 0;
        if (this.uqRoles) {
            len = this.uqRoles.length;
            roleUsers = [];
            for (let i=0; i<len; i++) roleUsers.push([]);
        }
        for (let user of this.users) {
            let {isAdmin, roleBins} = user;
            let isUser = true, isRole = false;
            if (isAdmin === true) {
                admins.push(user);
                isUser = false;
            }

            let mask = 1;
            for (let i=0; i<len; i++, mask<<=1) {
                if ((roleBins & mask) !== 0) {
                    let rus = roleUsers[i];
                    if (this.user.id === user.id) 
                        rus.unshift(user);
                    else
                        rus.push(user);
                    isUser = false;
                    isRole = true;
                }
            }
            if (isRole === true) {
                ++roleUserCount;
            }
            if (isUser === true) {
                users.push(user);
            }
        }
        this.roleUserCount = roleUserCount;
        return {
            admins: admins,
            users: users,
            roleUsers: roleUsers,
        };
    }

    showDetail = async () => {
        this.uqAccesses = await devApi.loadAppUqs(this.appXAccount.id);
        this.openVPage(VDetail);
    }

    appTurnOnOff = async ():Promise<boolean> => {
        let {id, inUnit, name} = this.appXAccount;
        //let newInUnit:number = 1;
        if (inUnit === 0) {
            let ret = await store.restoreUnitApp(id);
            if (ret <= 0) {
                alert('app 或者 uq 没有定义 service');
                return false;
            }
            return true;
        }

        if (inUnit === 1) {
            let ret = await this.confirm({
                caption: '停运 - ' + name,
                message: 'App停运之后，任何人都无法访问。请确认',
                ok: '确认',
            });
            if (ret !== 'ok') return false;
            await store.stopUnitApp(id);
            //newInUnit = 0;
            return true;
        }

        let newApp:UnitApp = _.clone(this.appXAccount);
        newApp.id = id;
        newApp.inUnit = 1;
        let ret = await store.addUnitApp(newApp);
        if (ret <= 0) {
            alert('app 或者 uq 没有定义 service');
            return false;
        }
        return true;
    }

    showAdmins = async () => {
        this.openVPage(VAdmins);
    }

    showRoles = async () => {
        this.openVPage(VRoleUsers);
    }

    showUsers = async () => {
        this.openVPage(VNoRoleUsers);
    }

    showUserList = async () => {
        this.openVPage(VUserList);
    }

    showAddUserPage = (roleNum:number) => {
        this.openVPage(VAddUserPage, roleNum);
    }

    showEditUserPage = (user: User) => {
        this.openVPage(VEditUserPage, user);
    }

    getRoleCaption(roleNum:number):string {
        switch(roleNum) {
            case -1: return '[App管理员]';
            case -2: return '[普通用户]';
            default: return this.uqRoles[roleNum];
        }
    }

    async addUser(roleNum:number, userName:string):Promise<string> {
        let roleBit:number = roleNum<=0? roleNum : 1<<(roleNum-1);
        let ret = await mainApi.setAppRoles(this.unit.id, this.appXAccount.id, undefined, userName, roleBit);
        if (ret === undefined) return 'unauthorized';
        let {r, id} = ret;
        if (r !== undefined) return r;

        let i = this.insertUser(id);
        //let isAdmin:boolean = false; 
        let user = this.users[i];
        if (roleNum > 0) {
            user.roleBins |= (1<<roleNum-1);
        }
        else if (roleNum === -1) {
            // 管理员
            user.isAdmin = true;
        }
        else if (roleNum === 0) {
            // 普通用户
        }
        //this.users[i] = {id, isAdmin, roles, assigned:undefined};
    }

    renderUser = (user:User, index:number) => {
        return this.renderView(VUser, user);
    }

    async setAppAdmin(user:User, on:boolean):Promise<string> {
        let {id, isAdmin, roleBins, assigned} = user;
        isAdmin = on;
        let ret = await mainApi.setAppAdmin(
            this.unit.id, this.appXAccount.id, 
            id, undefined, isAdmin===true? 1:0);
        if (ret === undefined) {
            return 'unauthorized';
        }
        let {r} = ret;
        if (r !== undefined) return r;

        this.renewUser(user, isAdmin, roleBins, assigned);
    }

    async setAppRole(user:User, roleNum:number, on:boolean):Promise<string> {
        let {id, isAdmin, assigned} = user;
        if (on === true) {
            user.roleBins |= 1<<roleNum;
        }
        else {
            user.roleBins &= ~(1<<roleNum);
        }
        let roleBins = user.roleBins;
        let ret = await mainApi.setAppRoles(
            this.unit.id, this.appXAccount.id, 
            id, undefined, roleBins);
        if (ret === undefined) return 'unauthorized';
        let {r} = ret;
        if (r !== undefined) return r;
        this.renewUser(user, isAdmin, roleBins, assigned);
    }

    private renewUser(user:User, isAdmin:boolean, roleBins:number, assigned:string) {
        let {id} = user;
        let index = this.users.findIndex(v => v.id === id);
        this.users[index] = {id, isAdmin, roleBins, assigned};
    }

    delUser = async (user:User):Promise<string> => {
        let ret = await mainApi.setAppRoles(this.unit.id, this.appXAccount.id, user.id, undefined, 0);
        if (ret === undefined) return 'unauthorized';
        let {id, r} = ret;
        if (r !== undefined) return r;
        let index = this.users.findIndex(v => v.id === id);
        this.users.splice(index, 1);
    }
}
