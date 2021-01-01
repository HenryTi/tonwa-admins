import { nav, t, setGlobalRes, RouteFunc, Hooks, Navigo, NamedRoute } from "../components";
import { Controller } from '../vm';
import { UQsMan, TVs } from "../uq";
import { appInFrame } from "../net";
import { centerApi } from "./centerApi";
import { VUnitSelect, VErrorsPage, VStartError, VUnsupportedUnit } from "./vMain";

export interface IConstructor<T> {
    new (...args: any[]): T;
}

export interface AppConfig {
    appName: string;        // 格式: owner/appName
    version: string;        // 版本变化，缓存的uqs才会重载
    tvs: TVs;
    uqNameMap?: {[uqName:string]: string};      // uqName='owner/uq' 映射到内存简单名字：uq, 可以注明映射，也可以自动。有可能重
    loginTop?: JSX.Element;
    oem?: string;               // 用户注册发送验证码的oem厂家，默认同花
	privacy?: string;
	noUnit?: boolean;			// app的运行，不跟unit绑定
	htmlTitle?: string;
}

export interface Elements {
	[id:string]: (element: HTMLElement)=>void,
}

export abstract class CAppBase extends Controller {
	private appConfig: AppConfig;
    protected _uqs: any;

    protected readonly name: string;
	protected readonly noUnit: boolean;

    appUnits:any[];

    constructor(config?: AppConfig) {
		super(undefined);
		this.appConfig = config || (nav.navSettings as AppConfig);
		if (this.appConfig) {
			let {appName, noUnit} = this.appConfig;
			this.name = appName;
			if (appName === undefined) {
				throw new Error('appName like "owner/app" must be defined in MainConfig');
			}
			this.noUnit = noUnit;
		}
    }

    get uqs(): any {return this._uqs;}

	internalT(str:string):any {
		return t(str);
	}
	
	protected setRes(res:any) {
		setGlobalRes(res);
	}

	private appUnit:any;
	private roleDefines: string[];
	hasRole(role: string|number):boolean {
		let nRole:number;
		if (typeof role === 'string') {
			if (role.length === 0) return false;
			let index = this.roleDefines.findIndex(v => v === role);
			if (index < 0) return false;
			nRole = 1<<index;
		}
		else {
			nRole = role;
		}
		return (this.appUnit.roles & nRole) !== 0;
	}

	setAppUnit(appUnit:any) {
		this.appUnit = appUnit;
		let {roleDefs} = appUnit;
		if (roleDefs) {
			this.roleDefines = roleDefs.split('\t');
		}
		else {
			this.roleDefines = [];
		}
}
	
    protected async beforeStart():Promise<boolean> {
        try {
			this.onNavRoutes();
			if (!this.appConfig) return true;
			let {appName, version, tvs} = this.appConfig;
			await UQsMan.load(appName, version, tvs);
			this._uqs = UQsMan._uqs;			
            //let retErrors = await this.load();
            //let app = await loadAppUqs(this.appOwner, this.appName);
            // if (isDevelopment === true) {
			// 这段代码原本打算只是在程序员调试方式下使用，实际上，也可以开放给普通用户，production方式下
			let retErrors = UQsMan.errors;
            let {predefinedUnit} = appInFrame;
            let {user} = nav;
            if (user !== undefined && user.id > 0) {
				let result = await centerApi.userAppUnits(UQsMan.value.id);
				this.appUnits = result;
				/*
				// 老版本，只返回一个数组。新版本，返回两个数组。下面做两个数组的判断
				if (result.length === 0) {
					this.appUnits = result;
				}
				else {
					if (Array.isArray(result[0]) === true) {
						this.appUnits = result[0];
						let result1 = result[1];
						if (Array.isArray(result1) === true) {
							this.roleDefines = result1[0]?.roles?.split('\t');
							if (this.roleDefines === undefined) this.roleDefines = [];
						}
					}
					else {
						this.appUnits = result;
					}
				}
				*/
				if (this.noUnit === true) return true;
                switch (this.appUnits.length) {
                    case 0:
                        this.showUnsupport(predefinedUnit);
						return false;
                    case 1:
						let appUnit = this.appUnits[0];
						this.setAppUnit(appUnit);
						let {id} = appUnit;
                        let appUnitId = id;
                        if (appUnitId === undefined || appUnitId < 0 || 
                            (predefinedUnit !== undefined && appUnitId !== predefinedUnit))
                        {
                            this.showUnsupport(predefinedUnit);
                            return false;
                        }
                        appInFrame.unit = appUnitId;
                        break;
                    default:
                        if (predefinedUnit>0 && this.appUnits.find(v => v.id===predefinedUnit) !== undefined) {
                            appInFrame.unit = predefinedUnit;
                            break;
                        }
                        this.openVPage(VUnitSelect);
                        return false;
                }
            }
            if (retErrors !== undefined) {
                this.openVPage(VErrorsPage, retErrors);
                return false;
            }
            return true;
        }
        catch (err) {
            this.openVPage(VStartError, err);
            return false;
        }
    }
	protected async afterStart():Promise<void> {
		nav.resolveRoute();
	}

    async userFromId(userId:number):Promise<any> {
        return await centerApi.userFromId(userId);
    }

	protected on(routeFunc:RouteFunc, hooks?:Hooks):Navigo;
	protected on(url:string, routeFunc:RouteFunc, hooks?:Hooks):Navigo;
	protected on(regex:RegExp, routeFunc:RouteFunc, hooks?:Hooks):Navigo;
	protected on(options: {[url:string]: RouteFunc|NamedRoute}):Navigo;
	protected on(...args:any[]):Navigo {
		return nav.on(args[0], args[1], args[2]);
	}

	protected onNavRoutes() {return;}

    private showUnsupport(predefinedUnit: number) {
        nav.clear();
        this.openVPage(VUnsupportedUnit, predefinedUnit);
    }
}
