import * as React from 'react';
import { VPage, Page, nav, EasyTime } from 'tonva';
import { CUq } from './CUq';
import { IdDates, UnitSpan, ServerSpan } from 'tools';
import { Prop, LMR, FA, PropGrid, Muted, List, DropdownActions } from 'tonva';
import { EditPage } from './editPage';
import { store } from 'store';
import { observer } from 'mobx-react';
import { DevService } from 'model';

export class UQPage extends VPage<CUq> {
    async open() {
        this.openPageElement(React.createElement(this.page));
    }

    private editItem = async () => {
        await this.openVPage(EditPage);
    }

    private deleteItem = async () => {
        if (window.confirm('真的要删除UQ吗？') === true) {
            await this.controller.deleteUq();
            nav.pop();
        }
    }

    private page = observer(():JSX.Element => {
        let {onUqUpload, onUqTest, onUqDeploy, onUqDevsAdmin, serviceClick, uq, services} = this.controller;
        let {unit} = store;
        let {isOwner} = unit;
        let {name, discription, unit:unitId, date_init, date_update} = uq;
        let disp = <div>
            <div>{discription}</div>
            <IdDates date_update={date_update} date_init={date_init} />
        </div>;
        let menuItems = [
            {caption:'修改UQ', action:this.editItem, icon:'edit' },
            {caption:'删除', action:this.deleteItem, icon:'trash-o' }
        ];
        let right = isOwner>0 && <DropdownActions className="btn-primary mr-2" actions={menuItems} />;
        let angle = <FA className="align-self-center" name="angle-right" />;
        let action = (icon:string, cnIcon:string, label:string, onClick:()=>void):Prop => {
            return {
                type: 'component',
                label: undefined, // '上传UQ', 
                component: <LMR onClick={onClick} className="w-100 py-2 cursor-pointer" 
                    left={<span className="align-self-center"><FA className={cnIcon} name={icon} fixWidth={true} /> &nbsp; {label}</span>} right={angle} />
            };
        };
        let rows:Prop[] = [
            '',
            {
                type: 'component', 
                component: <LMR className="py-2"
                    left={<FA name="database" className="text-primary fa-2x mr-3" />}>
                    <div><b>{name}</b></div>
                    {disp}
                </LMR>
            },
            {
                type: 'component', 
                label: '开发号', 
                component: <div className="py-2"><UnitSpan id={unitId} isLink={true} /></div> 
            },
            '',
            action('code', 'text-info', '上传提交UQ代码', onUqUpload),
            action('database', 'text-warning', '测试版 - 编译UQ数据库', onUqTest),
            action('database', 'text-success', '发布版 - 编译UQ数据库', onUqDeploy),
        ];

        let adminDev:any;
        let btnAddService:any;
        if (isOwner > 0) {
            btnAddService = <button
                className="btn btn-outline-primary btn-sm"
                onClick={()=>this.controller.showNewServicePage()}>
                增加
            </button>;
            let devList = this.controller.uqDevs.filter(v => v.isOwner===0);
            adminDev = <>
                <div className="d-flex mx-3 mt-3 mb-1 align-items-end">
                    <Muted style={{display:'block', flex:1}}>开发者</Muted>
                    <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={onUqDevsAdmin}>
                        管理
                    </button>
                </div>
                <div className="px-3 py-2 d-flex flex-wrap bg-white">
                    {
                        devList.length === 0?
                        <div className="small text-muted">[无]</div>
                        :
                        devList.map((v:any) => {
                            return <div key={v.userId} className="my-2 mr-3">{v.nick || v.name}</div>
                        })}
                </div>
            </>;
        }

        let onServiceClick:any;
        if (isOwner>0) onServiceClick = serviceClick;

        return <Page header={'UQ - ' + name} right={right}>
            <PropGrid rows={rows} values={uq} />
            {adminDev}
            <div className="d-flex mx-3 mt-3 mb-1 align-items-end">
                <Muted style={{display:'block', flex:1}}>Service</Muted>
                {btnAddService}
            </div>
            <List items={services} item={{
				render:(service:DevService, index:number)=>
					React.createElement(this.renderService, {service, index}), 
                onClick:onServiceClick
            }} />
        </Page>;
    });
    private renderService = observer((props: {service:DevService; index:number}):JSX.Element => {
        let {service} = props;
        let {db, server, serverTest, uqUniqueUnit, compile_time, deploy_time} = service;
        let compile = !compile_time?
            <Muted>未测试</Muted> 
            :
            <EasyTime date={compile_time}/>;
        let deploy = !deploy_time?
            <Muted>未发布</Muted> 
            :
            <EasyTime date={deploy_time}/>;

        return <div className="d-block w-100 cursor-pointer mb-2 py-2 px-3">
            <div>
                <small>数据库名：</small>{db}
                &nbsp; &nbsp; &nbsp; 
                <small>小号($unit)：</small><UnitSpan id={uqUniqueUnit} />
            </div>
            <LMR className="align-items-center"
                right={<small>{deploy}</small>}>
                <div>
                    <small>生产：</small>
                    <ServerSpan id={server} />
                </div>
            </LMR>
            <LMR className="align-items-center"
                right={<small>{compile}</small>}>
                <div>
                    <small>测试：</small>
                    <ServerSpan id={serverTest} />
                </div>
            </LMR>
        </div>;
    })
}
