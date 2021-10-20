import { CUqBase } from "UqApp";
import { VPage, Page, List } from "tonva";
import { observer } from 'mobx-react';
import { store } from 'store';
import { UnitSpan } from 'tools';
import { UnitAdmin } from 'model';

export class CPickUnit extends CUqBase {
    unitItems: UnitAdmin[];
    
    async internalStart() {
    }

    async pick(): Promise<number> {
        this.unitItems = store.accUnits;
        return await this.vCall(VPickUnit);
    }
}

class VPickUnit extends VPage<CPickUnit> {
    async open() {
        this.openPage(this.page);
    }

    private renderUnit = (unitAdmin:UnitAdmin, index:number):JSX.Element => {
        return <div className="px-3 py-2"><UnitSpan id={unitAdmin.id} /></div>;
    }

    private clickUnit = (unitAdmin:UnitAdmin) => {
        this.closePage();
        this.returnCall(unitAdmin.id);
	}
	
	private onClickNullServer = () => {
        this.closePage();
        this.returnCall(null);
	}

    private page = observer(():JSX.Element => {
        return <Page header="选择小号($unit)">
            <List items={this.controller.unitItems}
                item={{render:this.renderUnit, onClick:this.clickUnit}} />
        </Page>;
    });
}
