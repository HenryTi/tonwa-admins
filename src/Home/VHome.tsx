import classNames from 'classnames';
import { VPage, Page, List, LMR, FA } from 'tonva';
import { CHome } from './CHome';
import { UnitAdmin } from 'model';
import { store } from 'store';

export class VHome extends VPage<CHome> {
    async open() {
        let {isProduction} = this.controller;
        let {unitAdmins} = store;
        if (isProduction === false) {
            switch (unitAdmins.length) {
                default: this.openPage(this.selectUnitPage); return;
                case 0: this.openPage(this.noUnitPage); return;
                case 1: await this.controller.onShowUnit(unitAdmins[0]); return;
            }
        }

        if (store.unit === undefined) {
            this.openPage(this.noUnitPage);
            return;
        }
        await this.controller.onShowUnit(unitAdmins[0]);
    }

    private onClickUnit = async (unitAdmin: UnitAdmin) => {
        this.closePage();
        await this.controller.onShowUnit(unitAdmin);
    }

    private selectUnitPage = () => {
        let {logout} = this.controller;
        let {accUnits, devUnits, bothUnits} = store;
        let item = {render: this.renderUnitAdmin, onClick: this.onClickUnit};
        let list = (items:UnitAdmin[], label:string) => {
            return items.length>0 &&
            <div className="my-3">
                <div className="px-3 py-1 small text-muted">{label}</div>
                <List items={items} item={item} />
            </div>
        }
        return <Page header="同花管理员" logout={logout}>
            {list(accUnits, '小号')}
            {list(devUnits, '开发号')}
            {list(bothUnits, '双号')}
        </Page>;
        //<List items={this.controller.unitAdmins} 
        //    item={{render: this.renderRow, onClick: this.onRowClick}} />
}

    private noUnitPage = () => {
        let {user, logout} = this.controller;
        let {nick, name} = user;
        return <Page header="没有小号" logout={logout}>
            <div className="p-3 small text-info">
                {nick || name}: 没有需要管理的小号
            </div>
        </Page>
    }

    protected get view():any {return undefined}

    private renderUnitAdmin = (item: UnitAdmin, index: number):JSX.Element => {
        let {name, nick, type} = item;
        let icon:string, color:string;
        if (type & 1) {
            icon = 'code';
            color = 'text-success';
        }
        else if (type & 2) {
            icon = 'flag';
            color = 'text-primary';
        }
        else {
            icon = 'start';
            color = 'text-danger';
        }
        return <LMR className="px-3 py-2" right={<span className="small text-muted">id: {item.id}</span>}>
            <div>
                <FA name={icon} fixWidth={true} className={classNames('mr-3', color)} />
                {nick || name}
            </div>
        </LMR>;
    }
    /*
    private onUnitClick = async (item: UnitAdmin) => {
        appInFrame.unit = item.id; // 25;
        store.init();
        await store.loadUnit();
        this.closePage();
        this.openPageElement(<AdminPage />);
    }*/
}
