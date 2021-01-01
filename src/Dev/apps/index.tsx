import _ from 'lodash';
import { observable } from 'mobx';
import { Controller } from 'tonva';
import { devApi } from 'api';
import { AppsPage } from './appsPage';
import { AppPage } from './appPage';
import { UqBindPage } from './uqBindPage';
import { NewPage } from './editPage';
import { DevApp, DevUQ } from 'model';

/*
export interface UqAccess {
    uq: UQ;
    //bind_access: string[];
}
*/

export class AppController extends Controller {
    private unitId: number;
    app: DevApp;
    @observable appList: DevApp[];
    @observable uqs: DevUQ[];
    @observable uqMain: DevUQ;
    protected async internalStart(unitId:any) {
        this.unitId = unitId;
        this.appList = await devApi.apps(this.unitId);
        this.openVPage(AppsPage);
    }

    listRowClick = async (item:DevApp) => {
        this.app = item;
        let {uqMain:uqMainId} = item;
        let ret = await devApi.loadAppUqs(item.id);
        let mainIdex:number;
        this.uqs = ret.map((v, index) => {
            let {owner, id, name, discription, unit, date_init, date_update} = v;
            let ret = {
                    id: id,
                    name: name,
                    discription: discription,
                    unit: unit,
                    //access: access,
                    owner: owner,
                    date_init: date_init,
                    date_update: date_update, 
                    service_count: undefined,
            }
            if (id === uqMainId) {
                this.uqMain = ret;
                mainIdex = index;
            }
            return ret;
        });
        if (mainIdex !== undefined) {
            this.uqs.splice(mainIdex, 1);
            this.uqs.unshift(this.uqMain);
        }
        this.openVPage(AppPage);
    }

    saveSetUqMain = async (uq:DevUQ) => {
        await devApi.appSetUqMain(this.unitId, this.app.id, uq.id);
        this.setUqMain(uq);
    }

    private setUqMain(uq:DevUQ) {
        this.uqMain = uq;
        let index = this.uqs.findIndex(v => v.id === uq.id);
        if (index >= 0) {
            this.uqs.splice(index, 1);
        }
        this.uqs.unshift(uq);
    }



    showNewApp = () => {
        this.app = undefined;
        this.openVPage(NewPage);
    }

    saveApp = async (values: DevApp) => {
        let app: DevApp;
        let now = new Date();
        if (this.app === undefined) {
            app = _.clone(values);
            app.date_init = now;
        }
        else {
            app = _.clone(this.app);
            _.merge(app, values);
        }
        app.unit = this.unitId;
        app.date_update = now;
        let ret = await devApi.saveApp(app);
        app.id = ret;
        let org = this.appList.find(v => v.id === ret);
        if (org !== undefined) {
            _.merge(org, app);
        }
        else {
            this.appList.push(app);
        }
    }

    isBinded = (uq:DevUQ):boolean => {
        return this.uqs.findIndex(v => v.id === uq.id) >= 0;
    }

    isMain = (uq:DevUQ):boolean => {
        return this.uqMain !== undefined && this.uqMain.id === uq.id;
    }

    deleteApp = async () => {
        await devApi.delApp(this.unitId, this.app.id);
        let index = this.appList.findIndex(v => v.id === this.app.id);
        if (index >= 0) this.appList.splice(index, 1);
    }

    searchUq = async (key:string, pageStart:number, pageSize:number) => {
        return await devApi.searchUq(this.unitId, key, pageStart, pageSize);
    }

    getMyUqs = async () => {
        return await devApi.getMyUqs(this.unitId);
    }

    onUq = (uq: DevUQ) => {
        this.openVPage(UqBindPage, uq);
    }

    saveUqBind = async (uq: DevUQ) => {
        let uqs:number[] = this.uqs.map(v => v.id);
        let index = uqs.findIndex(v => v === uq.id);
        if (index < 0) uqs.push(uq.id);
        await devApi.appBindUq(this.unitId, this.app.id, uqs);
        this.uqs.push(uq);
        if (this.uqs.length === 1) {
            this.setUqMain(uq);
        }
    }

    removeUqBind = async (uq: DevUQ) => {
        let uqs:number[] = [];
        for (let u of this.uqs) {
            if (u.id !== uq.id) uqs.push(u.id);
        }
        await devApi.appBindUq(this.unitId, this.app.id, uqs);
        let index = this.uqs.findIndex(v => v.id === uq.id);
        if (index>=0) this.uqs.splice(index, 1);
        if (this.uqMain && this.uqMain.id === uq.id) {
            this.uqMain = undefined;
        }
    }
}
