import { appInFrame } from 'tonva'; 
import { UnitAdmin, Unit, DevApp } from '../model';
import { store } from '../store';
import { mainApi } from 'api';
import { CUqBase } from 'UqApp';
import { VUnit } from './VUnit';
import { VHome } from './VHome';
import { CAppXAccount } from 'XAccount';
import { CDevelopers } from 'Dev/developers';
import { AdminDevs } from 'store/adminDevs';
import { CUqRoles } from '../UqRoles';
import { CAdmins } from 'Admins';
import { CUsers } from 'Users';
import { AppController, CUq } from 'Dev';

export class CHome extends CUqBase {
    unit: Unit;
    isProduction: boolean;
	adminDevs: AdminDevs;
	cAdmins: CAdmins;
	cUsers: CUsers;
	cUqRoles: CUqRoles;

    protected async internalStart(param?:any):Promise<void> {
		this.cAdmins = this.newC(CAdmins);
		this.cUsers = new CUsers(this.res);
        store.init();
        
        this.isProduction = document.location.hash.startsWith('#tv');
        console.log('admins isProduction %s', this.isProduction);

        if (this.isProduction === false) {
            await store.loadAdminUnits();
        }
        else {
            await store.loadUnit();
        }
        this.openVPage(VHome);
	}
	
	startUq = (unit: Unit) => {
		let cUq = this.newC(CUq);
		cUq.start(unit);
	}

	startApp = (unit: Unit) => {
		let appController = new AppController(this.res);
		appController.start(unit.id);
	}

    onShowUnit = async (item: UnitAdmin) => {
        appInFrame.unit = item.id; // 25;
        store.init();
        await store.loadUnit();

        let {unit} = store;
        this.adminDevs = new AdminDevs(unit);

        let {isDev, type} = unit;
        if (isDev === 1) {
            // 开发号管理员
            if ((type & 1) !== 0) {
                await store.dev.loadCounts();
            }

            // 小号管理员
            if ((type & 2) !== 0) {
                await store.loadApps();
            }
        }
        this.unit = unit;
		this.cUqRoles = this.newC(CUqRoles, this.unit.id)
        this.openVPage(VUnit);
    }

    logout = async () => {
        store.logout();
    }

    showAppXAccount = async (appXAccount: DevApp) => {
        let cAppXAccount = this.newC(CAppXAccount);
        await cAppXAccount.start(this.unit, appXAccount);
    }

    async onShowDevelopers() {
        await this.adminDevs.load();
        let c = this.newC(CDevelopers);
        c.start(this.adminDevs);
    }
}

