import { centerApi, UqApi } from 'tonva';
import { devApi } from "../api";
import { DevUQ, Unit } from "../model";
import { CUqBase } from "UqApp";
import { VUqRoles } from "./VUqRoles";
import { observable, runInAction } from 'mobx';
import { VRoleAdmin } from './VRoleAdmin';

export interface UserRole {
	user:number; 
	roles:boolean[];
	isDeleted?: boolean;
}

export class CUqRoles extends CUqBase {
	private unit: Unit;
	private uqApi: UqApi;
	private myRolesChanged:(roles:string[])=>void;

	devUQs: (DevUQ&{roles:string[]})[];
	allRoles: string[];
	//roleCaptions: string[];
	@observable meRoles: UserRole = null;
	@observable userRoles: UserRole[] = null;

	protected async internalStart(unit: Unit) {
		this.unit = unit;
		await this.loadUQs();
		this.openVPage(VUqRoles);
	}

	async loadUQs() {
		let ret = await devApi.unitUQs(this.unit.id, 1000);
		this.devUQs = ret.map(v => {
			let roles: string[];
			try {
				roles = JSON.parse(v.roles);
			}
			catch {
				try {
					roles = v.roles.split('\t');
				}
				catch {
					roles = [];
				}
			}
			roles = roles.filter(v => v);
			return {
				...v,
				roles,
			};
		});
	}

	onDevUQ = async (item: DevUQ & {roles: string[]}) => {
		let basePath:string = 'tv/';
		let appOwner:string = undefined;
		let appName:string = undefined;
		let uqOwner = item.owner;
		let uqName = item.name;
		let access:string[] = undefined;
		let showWaiting = false;
		this.uqApi = new UqApi(basePath, appOwner, appName, uqOwner, uqName, access, showWaiting);
		await this.uqApi.init();

		this.allRoles = item.roles;
		let allUserRoles = await this.uqApi.getAllRoleUsers();
		runInAction(() => {
			let r0 = allUserRoles.shift();
			let {roles} = r0;
			if (roles) {
				//this.ixOfUsers = roles.split('|');
			}
			let arr:string[] = this.allRoles.map(v => `|${v}|`);
			function rolesBool(t:string): boolean[] {
				if (!t) return arr.map(v => false);
				return arr.map(v => t.indexOf(v) >= 0);
			}
			this.userRoles = [];
			let meId = this.user.id;
			for (let ur of allUserRoles) {
				let {user, roles} = ur;
				let item:UserRole = ur as any;
				item.roles = rolesBool(roles);
				if (user === meId)
					this.meRoles = item;
				else
					this.userRoles.push(item);
			}
		});
		this.openVPage(VRoleAdmin);
	}
	
	async setUserRole(checked:boolean, iRole:number, userRole:UserRole) {
		let {roles} = userRole;
		let len = roles.length;
		let text:string = '';
		for (let i=0; i<len; i++) {
			let yes = i===iRole? checked : roles[i];
			if (yes === true) text += '|' + this.allRoles[i];
		}
		text += '|';
		await this.uqApi.setUserRoles(userRole.user, text);
		roles[iRole] = checked;
		this.fireMyRolesChanged(userRole);
	}

	private fireMyRolesChanged(userRole: UserRole, newRoles?:boolean[]) {
		if (!this.myRolesChanged) return;
		if (userRole !== this.meRoles) return;
		let {roles} = userRole;
		if (newRoles) roles = newRoles;
		let roleNames:string[] = ['$'];
		for (let i=0; i<roles.length; i++) {
			if (roles[i] === true) roleNames.push(this.allRoles[i]);
		}
		this.myRolesChanged(roleNames);
	}

	private buildRolesText(userRole:UserRole) {
		let ret = userRole.roles.map((v, index) => v===true? this.allRoles[index]:'').join('|');
		return `|${ret}|`;
	}

	async newUser(userName: string): Promise<string> {
		let ret = await centerApi.userFromKey(userName);
		if (!ret) {
			return '这个用户名没有注册';
		}
		let user = ret.id;
		let roles: string;
		if (this.isMe(user) === true) {
			if (this.meRoles) {
				this.meRoles.isDeleted = false;
			}
			else {
				this.meRoles = {
					user,
					roles:  this.allRoles.map(v => false)
				};	
			}
		}
		else {
			let userRole = this.userRoles.find(v => v.user === user);
			if (userRole) {
				if (userRole.isDeleted === true) {
					userRole.isDeleted = false;
					roles = this.buildRolesText(userRole);
				}
				else {
					return '这个用户已经是角色用户了';
				}
			}
			else {
				userRole = {
					user,
					roles: this.allRoles.map(v => false),
				};
				this.userRoles.push(userRole);
				roles = '';
			}
		}
		await this.uqApi.setUserRoles(user, roles);
		if (this.isMe(user) === true) {
			this.fireMyRolesChanged(this.meRoles);
		}
	}

	async deleteUser(userRole: UserRole) {
		let {user} = userRole;
		userRole.isDeleted = true; 
		await this.uqApi.deleteUserRoles(user);
		this.fireMyRolesChanged(userRole, this.allRoles.map(v => false));
	}

	async restoreUser(userRole: UserRole) {
		let {user} = userRole;
		userRole.isDeleted = false;
		let roles = this.buildRolesText(userRole)
		await this.uqApi.setUserRoles(user, roles);
		this.fireMyRolesChanged(userRole);
	}
}
