import * as React from 'react';
import { CDevelopers } from "./CDevelopers";
import { VPage, Page, List, LMR, FA } from 'tonva';
import { UserSpan } from 'tools/userSpan';
import { BusSpan, UqSpan } from 'tools';
import { observer } from 'mobx-react';

export class VUqsBuses extends VPage<CDevelopers> {
    private user: number;
    async open(user: number) {
        this.user = user;
        this.openPage(this.page);
    }

    private renderUq = (uq: number, index: number) => {
        return <div className="px-3 py-2 align-items-center">
            <FA className="text-primary" size="lg" name="database" fixWidth={true} />
            <div className="mx-3"><UqSpan id={uq} /></div>
        </div>;
    }

    private onChangeUq = () => {
        this.controller.showUserUqs(this.user);
    }

    private renderBus = (bus: number, index: number) => {
        return <div className="px-3 py-2 align-items-center">
            <FA className="text-primary" size="lg" name="cogs" fixWidth={true} />
            <div className="mx-3"><BusSpan id={bus} /></div>
        </div>;
    }

    private onChangeBus = () => {
        this.controller.showUserBuses(this.user);
    }

    private onDelDev = async () => {
        if (await this.controller.confirm({
            message: '真的要取消开发者资格吗？',
            ok: '确认'
        }) === 'ok') {
            await this.controller.delDev(this.user);
            this.closePage();
        }
    }

    private page = observer(() => {
        let { user, uqs, buses } = this.controller.adminDevs.getUserUqsBuses(this.user);
        let btnUqAdd = <button className="btn btn-success btn-sm" onClick={this.onChangeUq}><FA name="pencil" /></button>;
        let uqHeader = <LMR className="px-3 pb-1 align-items-end" right={btnUqAdd}>UQ</LMR>;
        let btnBusAdd = <button className="btn btn-success btn-sm" onClick={this.onChangeBus}><FA name="pencil" /></button>;
        let busHeader = <LMR className="px-3 pb-1 align-items-end" right={btnBusAdd}>BUS</LMR>;
        let right = <button className="btn btn-outline-info btn-sm align-self-center me-3" onClick={this.onDelDev}><FA name="minus" /></button>;

        return <Page header="开发者 - UQ BUS" right={right}>
            <div className="px-3 py-2"><UserSpan id={user} /></div>
            <div className="h-1c" />

            {uqHeader}
            <List className="mb-3" items={uqs}
                item={{ render: this.renderUq, onClick: undefined/*this.onClickUq*/ }} />
            <div className="h-1c" />
            {busHeader}
            <List className="mb-3" items={buses}
                item={{ render: this.renderBus, onClick: undefined/*this.onClickBus*/ }} />
        </Page>;
    });
}
