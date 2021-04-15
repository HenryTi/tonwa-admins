import React from 'react';
import { VPage } from "../../vm";
import { CRegBase } from './CRegister';

export abstract class VSuccess extends VPage<CRegBase> {
	header() {return false;}
}

export class VRegisterSuccess extends VSuccess {
	content() {
    	const {account, login} = this.controller;
		return <div className="container w-max-30c">
			<div className="my-5">
				<div className="py-5 text-center">
					账号 <strong className="text-primary">{account} </strong> 注册成功！
				</div>
				<button className="btn btn-success btn-block" type="button" onClick={()=>login(undefined)}>
					直接登录
				</button>
			</div>
		</div>;
	}
}

export class VForgetSuccess extends VSuccess {
	content() {
    	const {login} = this.controller;
		return <div className="container w-max-30c">
			<div className="my-5">
				<div className="py-5 text-center text-success">成功修改密码</div>
				<button className="btn btn-primary btn-block" onClick={()=>login()}>
					登录账号
				</button>
			</div>
		</div>
	}	
}
