import _ from 'lodash';
import { observable } from 'mobx';
import { nav } from 'tonva';
import { Unit, DevUQ, DevService } from '../../model';
import { UqUpload, UqDeploy } from './uqUpload';
import { devApi } from 'api';
import { NewServicePage } from './newServicePage';
import { ServicePage } from './servicePage';
import { UQPage } from './uqPage';
import { ListPage } from './listPage';
import { VUqDevsAdmin } from './VUqDevsAdmin';
import { CUqBase } from 'UqApp';
import { CPickServer } from './CPickServer';
import { Admins } from 'store/admins';
import { CPickUnit } from './CPickUnit';

export class CUq extends CUqBase {
    private unit: Unit;
    uq: DevUQ;
    access: string;
    entities: string;
    admins: Admins;
    @observable uqDevs: any[];
    @observable uqList: DevUQ[];
    @observable services: DevService[];
    protected async internalStart(unit:Unit) {
        this.unit = unit;
        this.uqList = await devApi.uqs(this.unit.id, 200);
        this.openVPage(ListPage);
    }

    listRowClick = async (item:DevUQ) => {
        this.uq = item;
        await this.loadUqEntities(item.id);
        this.openVPage(UQPage);
    }

    private async loadUqEntities(uqId: number) {
        let ret = await devApi.uqGetEntities(this.unit.id, uqId);
        let r0 = ret[0][0];
        this.access = r0.access;
        this.entities = r0.entities;
        this.services = ret[1];
        this.uqDevs = ret[4];
    }

    async loadAdmins() {
        this.admins = new Admins(this.unit);
        await this.admins.load();
    }

    async devChanged(admin:any, isSelected:boolean) {
        let param = {
            unit: this.unit.id,
            type: 'uq',
            dev: this.uq.id,
            devUser: admin.id
        };
        if (isSelected === true) {
            await devApi.adminDevAdd(param);
            this.uqDevs.push({
                userId: admin.id,
                icon: admin.icon,
                name: admin.name,
                nick: admin.nick,
                isOwner: 0,
            });
        }
        else {
            await devApi.adminDevDel(param);
            let index = this.uqDevs.findIndex(v => v.userId === admin.id);
            this.uqDevs.splice(index, 1);
        }
    }

    onUqDevsAdmin = () => {
        this.openVPage(VUqDevsAdmin);
    }

    serviceClick = (service: DevService) => {
        this.openVPage(ServicePage, service);
    }

    onUqUpload = async() => {
        let onDispose = () => {}
        nav.push(<UqUpload uq={this.uq} services={this.services} />, onDispose);
    }

    onUqTest = async() => {
        let onDispose = () => {}
        nav.push(<UqDeploy uq={this.uq} action="test" services={this.services} />, onDispose);
    }

    onUqDeploy = async() => {
        let onDispose = () => {}
        nav.push(<UqDeploy uq={this.uq} action="deploy" services={this.services} />, onDispose);
    }

    saveUq = async (values: DevUQ) => {
        let uq: DevUQ;
        if (this.uq === undefined) {
            uq = _.clone(values);
        }
        else {
            uq = _.clone(this.uq);
            _.merge(uq, values);
        }
        uq.unit = this.unit.id;
        let ret = await devApi.saveUq(uq);
        uq.id = ret;
        this.uqList.push(uq);
    }

    deleteUq = async () => {
        await devApi.delUq(this.unit.id, this.uq.id);
        let index = this.uqList.findIndex(v => v.id === this.uq.id);
        if (index >= 0) this.uqList.splice(index);
    }

    async changeServiceProp(service: DevService, prop:string, value:any):Promise<any> {
        return await devApi.changeServiceProp(this.unit.id, service.id, prop, value);
    }

    async saveService(service: DevService):Promise<number> {
        let svc = _.clone(service);
        svc.unit = this.unit.id;
        if (!svc.urlTest) svc.urlTest = '-';
        let ret = await devApi.saveService(svc);
        svc.id = ret;
        this.services.push(svc);
        return ret;
    }

    async delService(service: DevService) {
        await devApi.delService(this.unit.id, service.id);
        let index = this.services.findIndex(v => v.id === service.id);
        if (index >= 0) this.services.splice(index);
    }

    showNewServicePage = async () => {
        await this.openVPage(NewServicePage);
    }

    pickServer = async () => {
        let cPickServer = this.newC(CPickServer);
        return await cPickServer.pick();
    }

    pickUnit = async () => {
        let cPickUnit = this.newC(CPickUnit);
        return await cPickUnit.pick();
    }
}
