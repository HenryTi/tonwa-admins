import * as React from 'react';
import { CDevelopers } from "./CDevelopers";
import { VPage, Page, List, FA } from 'tonva';
import { UserSpan } from 'tools/userSpan';
import { UqSpan } from 'tools';
import { observer } from 'mobx-react';

export class VUqs extends VPage<CDevelopers> {
    private user: number;
    async open(user: number) {
        this.user = user;
        this.openPage(this.page);
    }

    private onCheckChanged = async (evt: React.ChangeEvent<HTMLInputElement>, dev: number) => {
        await this.controller.changeUserDev(evt.target.checked, 'uq', this.user, dev);
    }

    private renderUqItem = (item: { dev: number, selected: boolean }, index: number) => {
        let { dev, selected } = item;
        return <label className="ms-0 px-3 py-2 align-items-center">
            <input className="me-4" type="checkbox" defaultChecked={selected}
                onChange={async evt => await this.onCheckChanged(evt, dev)} />
            <FA className="text-primary" size="lg" name="database" fixWidth={true} />
            <div className="mx-3"><UqSpan id={dev} /></div>
        </label>;
    }

    private onClickUq = (uq: number) => {
    }

    private page = observer(() => {
        let { adminDevs } = this.controller;
        let { uqDevs } = adminDevs;
        let { user, uqs } = adminDevs.getUserUqsBuses(this.user);
        let uqItems: { dev: number, selected: boolean }[] = uqDevs.map(uq => {
            return {
                dev: uq,
                selected: uqs.findIndex(v => v === uq) >= 0
            }
        });
        return <Page header="增减 - UQ">
            <div className="px-3 py-2"><UserSpan id={user} /></div>
            <div className="h-1c" />

            <List className="mb-3" items={uqItems}
                item={{ render: this.renderUqItem, onClick: this.onClickUq }} />
            <div className="h-1c" />
        </Page>;
    });
}