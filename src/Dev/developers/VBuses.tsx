import * as React from 'react';
import { CDevelopers } from "./CDevelopers";
import { VPage, Page, List, FA } from 'tonva';
import { UserSpan } from 'tools/userSpan';
import { BusSpan } from 'tools';
import { observer } from 'mobx-react';

export class VBuses extends VPage<CDevelopers> {
    private user: number;
    async open(user: number) {
        this.user = user;
        this.openPage(this.page);
    }

    private onCheckChanged = async (evt: React.ChangeEvent<HTMLInputElement>, dev: number) => {
        await this.controller.changeUserDev(evt.target.checked, 'bus', this.user, dev);
    }

    private renderBusItem = (item: { dev: number, selected: boolean }, index: number) => {
        let { dev, selected } = item;
        return <label className="ms-0 px-3 py-2 align-items-center">
            <input className="me-4" type="checkbox" defaultChecked={selected}
                onChange={async evt => await this.onCheckChanged(evt, dev)} />
            <FA className="text-primary" size="lg" name="database" fixWidth={true} />
            <div className="mx-3"><BusSpan id={dev} /></div>
        </label>;
    }

    private onClickBusItem = (bus: number) => {
    }

    private page = observer(() => {
        let { adminDevs } = this.controller;
        let { buses } = adminDevs;
        let { user, buses: userBuses } = adminDevs.getUserUqsBuses(this.user);
        let items: { dev: number, selected: boolean }[] = buses.map(dev => {
            return {
                dev: dev,
                selected: userBuses.findIndex(v => v === dev) >= 0
            }
        });
        return <Page header="增减 - UQ">
            <div className="px-3 py-2"><UserSpan id={user} /></div>
            <div className="h-1c" />

            <List className="mb-3" items={items}
                item={{ render: this.renderBusItem, onClick: this.onClickBusItem }} />
            <div className="h-1c" />
        </Page>;
    });
}
