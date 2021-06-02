import * as React from 'react';
import {observable} from 'mobx';
import {observer} from 'mobx-react';
import {nav, Page} from 'tonva';
import {TonvaForm, MultiStep, SubmitResult} from 'tonva-form';
import {DropdownActions, List, FA} from 'tonva';
import { store } from 'store';
import { ObjViewProps } from './ObjViewProps';
import { DevObjBase } from 'model';

@observer
export class ObjView<T extends DevObjBase> extends React.Component<ObjViewProps<T>> {
    async componentDidMount() {
        await this.props.items().load();
    }
    //converter(item:T):ListItem {
    //    return this.props.converter(item);
    //}
    newItem() {
        this.props.items().cur = undefined;
        nav.push(<New {...this.props} />);
    }
    itemClick = (item:T) => {
        this.props.items().cur = observable(item);
        nav.push(<Info {...this.props} />);
    }
    render() {
        let {title, items} = this.props;
		if (!store.unit) debugger;
        let {isOwner} = store.unit;
		let right = isOwner>0 && <button className='btn btn-success btn-sm mr-2'
			onClick={()=>this.newItem()}><FA name="plus" /></button>;
        return <Page header={title} right={right}>
            <List items={items().items}
                item={{render: this.props.row, onClick: this.itemClick}}
                />
        </Page>;
    }
}

class New<T extends DevObjBase> extends React.Component<ObjViewProps<T>> {
	private tonvaForm:TonvaForm;
    constructor(props:ObjViewProps<T>) {
        super(props);
        this.onSubmit = this.onSubmit.bind(this);
    }
    async onSubmit(values:any):Promise<SubmitResult> {
		values.owner = this.props
        if (await this.props.items().check(values) === false) return;
        let ret = await this.props.items().saveCur(values);
        if (ret === true) {
            nav.pop();
        }
        else {
            let repeated = this.props.repeated;
            this.tonvaForm.formView.setError(repeated.name, repeated.err);
        }
        return;
    }
    render() {
        let content:any;
        let {title, steps, stepHeader} = this.props;
        let {formRows, items} = this.props;
        if (steps !== undefined) {
            content = <MultiStep className="mt-4" header={stepHeader} steps={steps} first="step1" onSubmit={this.onSubmit} />;
        }
        else if (formRows !== undefined) {
            content = <TonvaForm ref={f => this.tonvaForm=f}
                className="m-3"
                formRows={formRows} 
                onSubmit={this.onSubmit} initValues={items().cur} />;
        }
        else {
            content = 'ObjViewProps: no steps and no formRows';
        }
        return <Page header={'新增'+title}>
            {content}
        </Page>
    }
}

@observer
class Info<T extends DevObjBase> extends React.Component<ObjViewProps<T>> {
    private menuItems = [
        {caption:'修改' + this.props.title, action:this.editItem.bind(this), icon:'edit' },
        {caption:'删除', action:this.deleteItem.bind(this), icon:'trash-o' }
    ];
    async deleteItem() {
        if (window.confirm('真的要删除吗？系统删除时并不会检查相关引用，请谨慎') === true) {
            await this.props.items().del();
            nav.pop();
        }
    }
    editItem() {
        nav.push(<Edit {...this.props} />);
    }
    render() {
        let item = this.props.items().cur;
        let actions = [];
        let ex = this.props.extraMenuActions;
        if (ex !== undefined) actions.push(...ex);
        actions.push(...this.menuItems);
        let canEdit = this.props.canEdit;
        let right:any;
        if (canEdit && canEdit(item) === true) {
            right = <DropdownActions actions={actions} className="btn-primary mr-2" />;
		}
		//<this.props.info {...item} />
        return <Page header={this.props.title + ' - 详细资料'} right={right}>
            {React.createElement(this.props.info, item)}
        </Page>;
    }
}

class Edit<T extends DevObjBase> extends React.Component<ObjViewProps<T>> {
    private actions = [
        {caption:'删除', action:this.deleteItem.bind(this), icon:'trash-o' }
    ];
    constructor(props: ObjViewProps<T>) {
        super(props);
        this.onSubmit = this.onSubmit.bind(this);
    }
    async onSubmit(values:any):Promise<SubmitResult> {
        if (await this.props.items().check(values) === false) return;
        await this.props.items().saveCur(values);
        nav.pop();
        return;
    }
    async deleteItem() {
        if (window.confirm('真的要删除吗？系统删除时并不会检查相关引用，请谨慎') === true) {
            await this.props.items().del();
            nav.pop();
        }
    }
    render() {
        let right = <DropdownActions actions={this.actions} className="btn-primary mr-2" />
        return <Page header={'修改 '+this.props.title} right={right} back="close">
            <TonvaForm 
                className="m-3"
                formRows={this.props.formRows} 
                onSubmit={this.onSubmit} initValues={this.props.items().cur} />
        </Page>;
    }
}
