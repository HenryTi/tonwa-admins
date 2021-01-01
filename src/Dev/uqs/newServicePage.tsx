import * as React from 'react';
import { IdPickProps, createIdPick } from '../../tools';
import { store, caches } from 'store';
import { Field, FormRow, TonvaForm, SubmitResult } from 'tonva-form';
import { CUq } from './CUq';
import { VPage, nav, Page } from 'tonva';
import { DevServer } from 'model';

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

//const urlField:Field = {name: 'url', type: 'string', required:true, maxLength:200};
//const urlTestField:Field = {name: 'urlTest', type: 'string', required:false, maxLength:200};
const serverField:Field = {name: 'server', type: 'id'};
const testServerField:Field = {name: 'serverTest', type: 'id'};
const dbField:Field = {name: 'db', type: 'string', maxLength:50, required: true};

/*
const urlRow = {
    label: 'URL',
    field: urlField,
};

const urlRowTest = {
    label: 'URL-Test',
    field: urlTestField,
    face: {placeholder:'如果同URL，请不要输入'}
};
*/

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

/*
const dbTypeRow:FormRow = {
    label: '数据库类型',
    field: dbTypeField,
    face: {
        type: 'string',
        readonly: true,
    } as StringFace
};
*/

const dbRow = {
    label: '数据库名字',
    field: dbField,
};

/*
const connectionRow = {
    label: '连接字符串',
    field: connectionField,
    face: {
        type: 'textarea',
        maxLength: 250,
        rows: 8,
    } as TextAreaFace,
};
*/
export class NewServicePage extends VPage<CUq> {
    private tonvaForm:TonvaForm;
    private formRows:FormRow[] = [
        //urlRow,
        //urlRowTest,
		serverRow,
		testServerRow,
        //dbTypeRow,
        dbRow,
        //connectionRow
    ];
    async open() {
        this.openPage(this.page);
    }
    private onSubmit = async (values:any):Promise<SubmitResult | undefined> => {
        /*
        if (values.url.indexOf('/uq/')<0) {
            this.tonvaForm.formView.setError('url', 'service url 必须包含/uq/');
            return;
        }
        */
        values.type = 2; // uq type, to be removed
        values.uqId = this.controller.uq.id;
        let ret = await this.controller.saveService(values);
        if (ret === 0) {
            /*
            if (this.tonvaForm !== undefined) {
                this.tonvaForm.formView.setError('url', '已经有Service使用这个url');
            }
            */
            return;
        }
        nav.pop();
        return;
    }
    private page = () => {
        return <Page header="新建Service">
            <TonvaForm ref={t=>this.tonvaForm=t} className="m-3" formRows={this.formRows} onSubmit={this.onSubmit} />
        </Page>
    }
}
