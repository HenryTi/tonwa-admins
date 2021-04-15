import React from 'react';
import { nav } from '../components';
import { VPage } from '../vm';
import { CLogin } from './CLogin';

export class VLogout extends VPage<CLogin> {
	private onLogout: ()=>void;

	init(param: any) {
		this.onLogout = param;
	}
	header() {return this.isWebNav === true? false : '安全退出';}
	footer() {
		return <div className="mt-5 text-center justify-content-center">
			<button className="btn btn-outline-warning" onClick={nav.resetAll}>升级软件</button>
		</div>;
	}
	protected get back(): 'close' | 'back' | 'none' {return 'close'}
	content() {
		return <div className="m-5 border border-info bg-white rounded-3 p-5 text-center">
			<div>退出当前账号不会删除任何历史数据，下次登录依然可以使用本账号</div>
			<div className="mt-5 text-center">
				<button className="btn btn-danger" onClick={this.onLogout}>安全退出</button>
			</div>
		</div>;
	}
}
