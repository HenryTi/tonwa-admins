import { CUqBase } from "UqApp";
import { VPage, Page, SearchBox, List, PageItems } from "tonva";
import { observer } from 'mobx-react';
import { devApi } from 'api';
import { store } from 'store';
import { ServerSpan } from 'tools';
import { DevServer } from 'model';

export class CPickServer extends CUqBase {
    pageItems: PageServerItems;

    async internalStart() {
        this.pageItems = new PageServerItems();
    }

    async pick(): Promise<number> {
        this.pageItems = new PageServerItems();
        await this.pageItems.first('');
        return await this.vCall(VPickServer);
    }

    onSearch = async (key: string): Promise<void> => {
        await this.pageItems.first(key);
    }
}

class PageServerItems extends PageItems<DevServer> {
    protected async loadResults(param: any, pageStart: any, pageSize: number): Promise<{ [name: string]: DevServer[] }> {
        let unitId = store.unit.id;
        let ret = await devApi.searchServer(unitId, param, pageStart, pageSize);
        return { $page: ret };
    }
    protected setPageStart(item: DevServer): void {
        this.pageStart = item === undefined ? 0 : item.id;
    }
}

class VPickServer extends VPage<CPickServer> {
    async open() {
        this.openPage(this.page);
    }

    private renderServer = (server: DevServer, index: number): JSX.Element => {
        return <div className="px-3 py-2"><ServerSpan id={server.id} /></div>;
    }

    private clickServer = (server: DevServer) => {
        this.closePage();
        this.returnCall(server.id);
    }

    private onClickNullServer = () => {
        this.closePage();
        this.returnCall(null);
    }

    private page = observer((): JSX.Element => {
        let searchBox = <SearchBox label="选择服务器" onSearch={this.controller.onSearch} />
        return <Page header={searchBox}>
            <div className="px-3 py-2 cursor-pointer bg-white border-bottom"
                onClick={this.onClickNullServer}>
                <span className="text-danger me-3">NULL</span>
                <small className="text-muted">[不选服务器]</small>
            </div>
            <List items={this.controller.pageItems.items}
                item={{ render: this.renderServer, onClick: this.clickServer }} />
        </Page>;
    });
}
