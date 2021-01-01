import * as React from 'react';
import classNames from 'classnames';
import { VPage, Page, LMR, Image, Edit, Controller, List } from "tonva";
import { FA, nav, Badge, ItemSchema, ImageSchema, StringSchema, UiSchema, UiTextItem, UiImageItem } from 'tonva';
import { CHome } from "./CHome";
import { observer } from 'mobx-react';
import { store } from 'store';
import { UnitApp, Unit, unitCaption, DevObjBase } from 'model';
//import { CUsers } from 'Users';
import { ObjViewProps } from 'Dev/ObjViewProps';
import AppsPage from 'Apps';
import { AppController, CUq, busesProps, serversProps, ObjView } from 'Dev';
import { NewApp } from 'Apps/new';
//import { CAdmins } from 'Admins';

const defaultIconClass = 'text-info';
const devIconClass = 'text-success';

interface  ActionBase {
    title: string | JSX.Element;
    icon: string|JSX.Element;
    onClick?: ()=>void;
    className?: string;
    iconClassName?: string;
    page?: new (props:any) => React.Component;
}

interface ActionItem extends ActionBase {
    right?: string | JSX.Element;
    controller?: Controller;
}

interface DevItem<T extends DevObjBase> extends ActionBase {
    dev: true;
    count: number;
    objProps?: ObjViewProps<T>;
}

type Item = ActionItem|DevItem<DevObjBase>|string;

const rArrow = <FA name="angle-right" />;

export class VUnit extends VPage<CHome> {
    async open() {
        this.openPage(this.page);
    }

    private appsAction:ActionItem = {
        title: '启停App',
        right: rArrow, //'增减',
        icon: 'play-circle-o',
        page: AppsPage,
    };
    /*
    private usersAction:ActionItem = {
        main: '用户角色',
        right: rArrow,
        icon: 'users',
        page: Members,
    };
    */
    private newUsersAction:ActionItem = {
        title: 'App管理员',
        right: <><small className="text-muted">各App的管理员汇总</small> &nbsp; {rArrow}</>,
        icon: 'user-o',
        controller: this.controller.cUsers, // new UsersController(undefined),
    };
    /*
    private devAction:Item = {
        main: <DevActions />,
        right: '程序开发相关管理',
        icon: 'laptop',
        //page: Dev,
    };*/
    private adminsAction: ActionItem = {
        title: unitCaption(this.controller.unit) + '总管',
        right: rArrow,
        icon: 'universal-access',
        //page: AdministorsPage,
        controller: this.controller.cAdmins, // new CAdmins(undefined)
    };
    /*
    private appUserManagerAction: ActionItem = {
        main: 'App用户管理员',
        right: rArrow,
        icon: 'vcard-o',
        //page: Administors,
        controller: new CAppUserManagers(undefined),
    };
    */
    /*
    private cOrganization = new COrganization;
    private organizeAction:ActionItem = {
        main: this.cOrganization.label,
        right: rArrow,
        icon: this.cOrganization.icon,
        controller: this.cOrganization
    };
    */

    private noneAction:ActionItem = {
        title: '请耐心等待分配任务',
        icon: 'hourglass-start',
    };

    private buildItems():Item[] {
        let {unit, dev} = store;
        let {isAdmin, isOwner, isDev, type} = unit;
        let items:Item[] = [];
        if (isOwner === 1 || isAdmin === 1) {
            items.push(this.adminsAction);
        }
        if ((type & 2) !== 0) {
            if (isAdmin === 1) {
                items.push(this.newUsersAction);
            }
        }

        // 开发号
        if ((type & 1) !== 0) {
            let {counts} = dev;

            if (isAdmin ===1 || isDev === 1) {
                items.push('开发号管理')
            }

            if (isAdmin === 1) {
                let developersAction:ActionItem = {
                    title: '开发者', 
                    right: rArrow,
                    icon: 'user-o', 
                    onClick: async () => await this.controller.onShowDevelopers(),
                    className: 'border-bottom',
                    iconClassName: devIconClass,
                };
                items.push(developersAction);
            }

            if (isDev === 1 ) {
                if (isOwner>0) {
                    let appAction:DevItem<DevObjBase> = {
                        dev: true,
                        title: 'APP', 
                        count: counts && counts.app, 
                        icon: 'tablet', 
                        onClick: () => this.controller.startApp(unit), // new AppController(undefined).start(unit.id),
                    };
                    items.push(appAction);
                }
                let uqAction:DevItem<DevObjBase> = {
                    dev: true,
                    title: 'UQ', 
                    count: counts && counts.uq, 
                    icon: 'database', 
                    onClick: () => this.controller.startUq(unit), //new CUq(undefined).start(unit),
                };
                let busAction:DevItem<DevObjBase> = {
                    dev: true,
                    title: 'BUS', 
                    count: counts && counts.bus, 
                    icon: 'cogs', 
                    objProps: busesProps as any,
                };
                items.push(uqAction, busAction);
                if (isOwner>0) {
                    let serverAction:DevItem<DevObjBase> = {
                        dev: true,
                        title: 'Server', 
                        count: counts && counts.server, 
                        icon: 'server', 
                        objProps: serversProps as any,
                    };
                    items.push(serverAction);
                }
            }
        }
        /*
        // 小号
        if ((type & 2) !== 0) {
            if (isAdmin === 1) {
                items.push(
                    '小号管理（未来将会去掉）',
                    this.appsAction, 
                    //this.usersAction, 
                    this.newUsersAction, 
                    //this.organizeAction
                );
            }
        }
        */
        return items;
    }
    private row = (item:Item, index:number):JSX.Element => {
        if (typeof item === 'string') {
            return <div className="px-3 pt-3 pb-1 small text-muted cursor-default" style={{backgroundColor:'#f0f0f0'}}>{item}</div>;
        }
        let {iconClassName, className} = item;
        if (iconClassName === undefined) iconClassName = defaultIconClass;
        let {dev} = item as DevItem<DevObjBase>;
        let left:any, mid:any, r:any;
        if (dev === true) {
            let {icon, title, count} = item as DevItem<DevObjBase>;
            left = typeof icon === 'string'?
                <FA className={iconClassName} name={icon} fixWidth={true} size="lg" />
                :
                icon;
            mid = title;
            r = count>0 && <span>{count}</span>;
        }
        else {
            let {right, title, icon} = item as ActionItem;
            left = typeof icon === 'string'? 
                <FA className={iconClassName} name={icon} fixWidth={true} size="lg" /> :
                item.icon;
            mid = title;
            r = <span>{right}</span>;
        }
        return <LMR className={classNames('px-3 py-2 align-items-center', className)} left={left} right={r}>
            <div className="px-3"><b>{mid}</b></div>
        </LMR>;
    }
    private rowClick = async (item:Item) => {
        let {page:P, onClick} = item as ActionBase;
        if (P !== undefined) {
            nav.push(<P />);
            return;
        }
        if (onClick) {
            onClick();
            return;
        }
        let {objProps} = item as DevItem<DevObjBase>;
        if (objProps !== undefined) {
            return nav.push(<ObjView {...objProps} />);
        }
        let {controller} = item as ActionItem;
        if (controller) {
            await controller.start(store.unit);
            return;
        }
    }

    private appItemRender(app:UnitApp, index:number) {
        let {name, discription, icon, inUnit} = app;
        let ban = (inUnit === 0) &&
            <FA className="text-danger" name='ban' />;
        return <LMR className="px-3 py-2"
            left={<Badge><Image src={icon} /></Badge>}
            right={ban}>
            <div className="px-3">
                <div><b>{name}</b></div>
                <small className="text-muted">{discription}</small>
            </div>
        </LMR>;
    }
    private appClick = async (app:UnitApp) => {
        await this.controller.showAppXAccount(app);
        /*
        nav.push(<Page header="App详细信息">
            <Info app={app} />
        </Page>);
        */
    }
    private newItem() {
        nav.push(<NewApp />);
    }
    private appRender() {
        let {apps} = store;
        if (apps === undefined) return;
        if (apps.length === 0) return;
        let {isAdmin, isOwner} = store.unit;
        let right =  (isAdmin===1 || isOwner===1) && <button 
            className='btn btn-success btn-sm' 
            onClick={()=>this.newItem()}><FA name="plus" /></button>;
        return <>
            <LMR className="mt-4 mb-2 px-3 small text-muted align-items-end" right={right}>
                <div className="align-self-end">App</div>
            </LMR>
            <List items={store.apps} item={{render: this.appItemRender, onClick: this.appClick}} />
        </>
    }

    private onClickUnitProps = () => {
        this.openPageElement(<UnitProps />);
    }

    private page = observer(() => {
        let unit:Unit = store.unit;
        if (unit === undefined) {
            //console.log("admin render without unit");
            return null;
        }
        //console.log("admin render with unit");
        let items = this.buildItems();
        if (items === undefined) {
            return <Page header="" />;
        }
        let header:any, top:any;
        if (unit !== undefined) {
            let {name, nick, icon, discription} = unit;
            let title:string, vice:any;
            if (nick) {
                title = nick;
                vice = <h6><small className='text-secondary'>{name}</small></h6>;
            }
            else {
                title = name;
            }
            let caption = unitCaption(this.controller.unit);
            if (caption !== undefined) header = caption + ' - ' + title;
            top = <LMR className='px-3 my-4 bg-white py-2 cursor-pointer' onClick={this.onClickUnitProps}
                left={<div><Image className="w-3c h-3c" src={icon} /></div>}>
                <div className="px-3">
                    <LMR right={vice}><h6 className='text-dark font-weight-bold'>{title}</h6></LMR>
                    <div className='text-info overflow-hidden h-max-3c'>{discription}</div>
                </div>
            </LMR>;
        }
        else {
            header = '系统管理';
        }

        return <Page header={header} logout={this.controller.logout}>
            {top}
            {items.length>0 && <List items={items} item={{render:this.row, onClick:this.rowClick}} />}
            {this.appRender()}
        </Page>;
    })
}


class UnitProps extends React.Component {
    private schema:ItemSchema[] =[
        {name: 'icon', type: 'image'} as ImageSchema,
        {name: 'nick', type: 'string'} as StringSchema,
        {name: 'discription', type: 'string'} as StringSchema,
    ];
    private uiSchema:UiSchema = {
        items: {
            nick: {widget:'text', label:'别名', placeholder:'好的别名更方便记忆'} as UiTextItem,
            icon: {widget:'image', label:'标志图'} as UiImageItem,
            discription: {widget:'text', label:'描述', placeholder:'简短清晰的描述'} as UiTextItem,
        }
    }
    /*
    async onNickChanged(value:any, orgValue:any):Promise<void> {
        await store.unitChangeProp('nick', value);
    }
    async onDiscriptionChanged(value:any, orgValue:any):Promise<void> {
        await store.unitChangeProp('discription', value);
    }
    */
    private onItemChanged = async (itemSchema:ItemSchema, newValue:any, preValue:any) => {
        let {name} = itemSchema;
        //await userApi.userSetProp(name, newValue);
        await store.unitChangeProp(name, newValue);
        //this.data[name] = newValue;
        //nav.user[name] = newValue;
        //nav.saveLocalUser();
    }
    //<PropGrid rows={this.rows} values={store.unit} alignValue="right" />
    render() {
        let unit:Unit = store.unit;
        let {isRoot, isOwner, readMe} = unit;
        let caption = unitCaption(unit);

        let divReadMe = readMe && <div className="p-3" 
            dangerouslySetInnerHTML={{__html:readMe}}></div>;

        return <Page header={caption + '详情'}>
            <Edit schema={this.schema} uiSchema={this.uiSchema}
                data={store.unit}
                onItemChanged={this.onItemChanged}
                stopEdit={!(isRoot>0 && isOwner>0)} />
            {divReadMe}
        </Page>;
    }
}
