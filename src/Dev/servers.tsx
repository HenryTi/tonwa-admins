import * as React from 'react';
import {Prop, PropGrid, LMR, Muted, FA, EasyTime, EasyDate} from 'tonva';
import {UnitSpan} from '../tools';
import {store} from '../store';
import { ObjViewProps } from './ObjViewProps';
import { DevServer } from 'model';

class Info extends React.Component<DevServer> {
    render() {
        let {name, discription, unit, date_init, date_update} = this.props;
        let disp = <div>
            <div><b>{name}</b></div>
            <div>{discription}</div>
        </div>;
        let right = <div className="text-right small text-muted align-self-end">
            更新:<EasyTime date={date_update}/><br/>
            创建:<EasyDate date={date_init}/>
        </div>;
        let rows:Prop[] = [
            '',
            {type: 'component', component: <LMR className="w-100 py-2"
                left={<FA name="server" className="text-primary fa-2x mr-3" />}
                right={right}>
                {disp}
            </LMR>},
            '',
            {type: 'component', label: '开发号', component: <div className="py-2"><UnitSpan id={unit} isLink={true} /></div> },
            {type: 'string', label: 'URL', name: 'url'},
            {type: 'string', label: '云服务', name: 'cloud'},
            {type: 'string', label: 'IP', name: 'ip'},
        ];
        return <div>
            <PropGrid rows={rows} values={this.props} />
        </div>;
    }
}

const serversProps:ObjViewProps<DevServer> = {
    title: 'Server',
    info: Info,
    formRows: [
        {
            label: '名称', 
            field: {name: 'name', type: 'string', maxLength: 50, required: true},
        },
        {
            label: 'URL', 
            field: {name: 'url', type: 'string', maxLength: 200, required: true},
        },
        {
            label: 'IP地址', 
            field: {name: 'ip', type: 'string', maxLength: 20},
        },
        {
            label: '描述', 
            field: {name: 'discription', type: 'string', maxLength: 50, required: false},
        },
        {
            label: '云服务商', 
            field: {name: 'cloud', type: 'string', maxLength: 20, required: false},
        },
    ],
    row: (item: DevServer):JSX.Element => {
        let {name, discription, cloud} = item;
        return <LMR className="py-2 px-3 align-items-center"
            left={<FA name="server" className="text-primary fa-lg" />}>
            <div className="px-3">
				<div><b className="mr-3">{name}</b><Muted>{cloud}</Muted></div>
                <div className="small text-muted">{discription}</div>
            </div>
        </LMR>;
    },
    items: ()=>store.dev.servers,
    repeated: {
        name: 'name',
        err: '跟已有服务器名称重复',
	},
	canEdit: server => {
		let {isOwner, isAdmin} = store.unit;
		return isOwner>0 || isAdmin>0;
	},
};

export default serversProps;
