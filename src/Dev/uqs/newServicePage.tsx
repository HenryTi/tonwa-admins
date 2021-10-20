import { IdPickProps, createIdPick } from '../../tools';
import { store, caches } from 'store';
import { Field, FormRow, TonvaForm, SubmitResult } from 'tonva-form';
import { CUq } from './CUq';
import { VPage, nav, Page } from 'tonva';
import { DevServer, Unit } from 'model';

const ServerCaption = (item:DevServer) => {
    let {discription, cloud, ip} = item;
    return <>{discription} {cloud} {ip}</>;
}

const idPickServerProps: IdPickProps = {
    caption: '选择服务器',
    searchPlaceHolder: '搜索服务器',
    candidateItems: async (params:any, key:string) => {
        await store.dev.searchServer.first(key);
        return store.dev.searchServer.items;
    },
    moreCandidates: async () => {
        await store.dev.searchServer.more();
    },
    row: (item:DevServer, index:number) => {
        return <div className="px-3 py-2"><ServerCaption {...item} /></div>;
    },
};

const serverField:Field = {name: 'server', type: 'id', required: true};
const testServerField:Field = {name: 'serverTest', type: 'id', required: true};
const uqUniqueUnitField:Field = {name: 'uqUniqueUnit', type: 'id', required: true};
const dbField:Field = {name: 'db', type: 'string', maxLength:50, required: true};

const fromPicked = (item:DevServer)=>{
	return {
		id: item.id, 
		caption: <ServerCaption {...item} />,
	};
}

const itemFromId = (id:number)=>caches.servers.get(id);

const serverRow = {
    label: '运行服务器',
    field: serverField,
    face: {
        type: 'pick-id', 
        initCaption: '请选择运行服务器', 
        pick: createIdPick(idPickServerProps), //this.idPick,
        fromPicked: fromPicked,
        itemFromId: itemFromId,
    },
};

const testServerRow = {
    label: '测试服务器', 
    field: testServerField,
    face: {
        type: 'pick-id', 
        initCaption: '请选择测试服务器', 
        pick: createIdPick(idPickServerProps), //this.idPick,
        fromPicked: fromPicked,
        itemFromId: itemFromId,
    },
};


const UnitCaption = (item:Unit) => {
    let {name, discription} = item;
    return <>{name ?? discription}</>;
}
const idPickUnitProps: IdPickProps = {
    caption: '选择小号($unit)',
    searchPlaceHolder: '搜索小号($unit)',
    candidateItems: async (params:any, key:string) => {
        // await store.dev.searchServer.first(key);
        //return store.dev.searchServer.items;
        return store.accUnits;
    },
    moreCandidates: async () => {
        // await store.dev.searchServer.more();
    },
    row: (item:Unit, index:number) => {
        return <div className="px-3 py-2"><UnitCaption {...item} /></div>;
    },
};

const uqUniqueUnitRow = {
    label: '小号($unit)',
    field: uqUniqueUnitField,
    face: {
        type: 'pick-id', 
        initCaption: '请选择小号($unit)', 
        pick: createIdPick(idPickUnitProps), 
        fromPicked: (item:Unit)=>{
            return {
                id: item.id, 
                caption: <UnitCaption {...item} />,
            };
        },
        itemFromId: (id:number)=>caches.units.get(id),
    },
};

const dbRow = {
    label: '数据库名字',
    field: dbField,
};

export class NewServicePage extends VPage<CUq> {
    private formRows:FormRow[] = [
        dbRow,
        uqUniqueUnitRow,
		serverRow,
		testServerRow,
    ];
    async open() {
        this.openPage(this.page);
    }
    private onSubmit = async (values:any):Promise<SubmitResult | undefined> => {
        values.type = 2; // uq type, to be removed
        values.uqId = this.controller.uq.id;
        let ret = await this.controller.saveService(values);
        if (ret === 0) {
            return;
        }
        nav.pop();
        return;
    }
    private page = () => {
        return <Page header="新建Service">
            <TonvaForm className="m-3" formRows={this.formRows} onSubmit={this.onSubmit} />
        </Page>
    }
}
