import React from 'react';
import { User } from '../tool';
import { nav, Login } from '../components';
import { Controller, VPage } from "../vm";
import { VLogout } from './VLogout';
//import { Login as LoginPage } from './login';
import { VLogin } from './VLogin';
import { CenterAppApi, userApi } from '../net';
import { VChangePassword } from './VChangePassword';
import { CRegister } from './register';
import { CForget } from './register';

export class CLogin extends Controller implements Login {
	protected async internalStart() {
	}

	async showLogin(callback?: (user:User)=>Promise<void>, withBack?:boolean):Promise<void> {
		let onLogin = async (un:string, pwd:string):Promise<boolean> => {
			let user = await userApi.login({
				user: un,
				pwd: pwd,
				guest: nav.guest,
			});
	
			if (user === undefined) return false;
			console.log("onLoginSubmit: user=%s pwd:%s", user.name, user.token);
			await nav.userLogined(user, callback);
			return true;
		}
		this.openVPage(VLogin, {onLogin, withBack});
    }

    async showLogout(callback?: ()=>Promise<void>) {
		this.openVPage(VLogout, () => {
			nav.logout(callback);
		});
	}

	async showRegister() {
		let cRegister = new CRegister(this.res);
		await cRegister.start();
	}

	async showForget() {
		let cForget = new CForget(this.res);
		await cForget.start();
	}

	protected getVChangePassword():new (cLogin:CLogin) => VPage<CLogin> {
		return VChangePassword;
	}
	async showChangePassword() {
		let vPage = this.getVChangePassword();
		this.openVPage(vPage, async (orgPassword:string, newPassword:string):Promise<boolean> => {
			let centerAppApi = new CenterAppApi('tv/', undefined);
			let ret = await centerAppApi.changePassword({orgPassword, newPassword});
			return ret;
		});
    }
}
