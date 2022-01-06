import * as React from 'react';
import { VPage, Page, nav, FA } from 'tonva';
import { AppController } from '.';
import { LMR } from 'tonva';
import { DevUQ } from 'model';

export class UqBindPage extends VPage<AppController> {
    private uq: DevUQ;
    //private accesses: string[];
    //private accessChecked:{[name:string]:boolean};
    async open(uq: DevUQ) {
        this.uq = uq;
        this.openPage(this.page);
    }

    private saveUqBind = async () => {
        await this.controller.saveUqBind(this.uq/*, acc*/);
        this.closePage(2);
    }

    private removeUqBind = async () => {
        await this.controller.removeUqBind(this.uq);
        nav.pop();
    }

    private setMainUQ = async () => {
        this.controller.saveSetUqMain(this.uq);
        this.closePage();
    }

    private page = (): JSX.Element => {
        //let {uq/*, bind_access*/} = this.uqAccess;
        let { owner, name, discription } = this.uq;
        let btnLeft: any, btnRight: any;
        if (this.controller.isBinded(this.uq) === true) {
            if (this.controller.isMain(this.uq) === false) {
                btnLeft = <button className="btn btn-primary btn-sm" onClick={this.setMainUQ}>设为主UQ</button>;
            }
            else {
                btnLeft = <div><FA className="text-warning" name="star-o" /> 主UQ</div>;
            }
            btnRight = <button className="btn btn-outline-danger btn-sm" onClick={this.removeUqBind}>取消关联</button>;
        }
        else {
            btnLeft = <button className="btn btn-primary btn-sm" onClick={this.saveUqBind}>保存关联</button>;
        }
        //let btnDelete = <button className="btn btn-outline-danger btn-sm" onClick={this.removeUqBind}>取消关联</button>;
        /*
        if (bind_access !== null && bind_access !== undefined) {
            btnDelete = <button className="btn btn-outline-danger btn-sm" onClick={this.removeUqBind}>取消关联</button>;
        }
        */
        /*
        let checkAccessList:any;
        if (this.accesses) {
            checkAccessList = <div className="mt-3">
            {
                this.accesses.map(v => {
                    let checked = this.accessChecked[v];
                    return <label key={v} className="d-inline-block me-4">
                        <input onChange={this.onCheckChanged}
                            style={{width:'1.1rem', height:'1.1rem'}} 
                            name={v} type="checkbox" defaultChecked={checked} />&nbsp;{v}
                    </label>;
                })
            }
            </div>;
        }
        */
        return <Page header="关联UQ">
            <div className="m-3 py-3 px-3 bg-white border">
                <div>{owner} / {name}</div>
                <div className="text-muted">{discription}</div>
                {/*checkAccessList*/}
                <LMR className="pt-3" right={btnRight}>{btnLeft}</LMR>
            </div>
        </Page>;
    }
}