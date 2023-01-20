import * as React from 'react';
import { nav, Page } from 'tonva';
import { List, EasyDate, LMR, Muted } from 'tonva';
import { store } from '../../store';
import { UqActionProps } from './uqActionProps';
import { CompileResultPage } from './compileResultPage';
import { ButtonAsync } from 'components';

interface State {
    files: any[];
    compiled?: string;
    text?: string;
}

//const fastUpload = '快速测试';
//const thoroughlyUpload = '完全测试';
export class UqUpload extends React.Component<UqActionProps, State> {
    private fileInput: HTMLInputElement;

    constructor(props: UqActionProps) {
        super(props);
        this.state = {
            files: undefined,
        }
    }

    private onFilesChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        let upFiles: any[] = [];
        let { files } = evt.target;
        let len = files.length;
        for (let i = 0; i < len; i++) {
            upFiles.push(files[i]);
        }
        this.setState({
            files: upFiles,
        });
    }
    fileRender(file: any, index: number): JSX.Element {
        let { name, size, lastModifiedDate } = file;
        function sz(): string {
            let n: number, u: string;
            if (size < 1024) {
                n = size; u = 'b';
            }
            else if (size < 1024 * 1024) {
                n = Math.trunc((size / 1024) * 100) / 100; u = 'k';
            }
            else {
                n = Math.trunc((size / 1024 / 1024) * 100) / 100; u = 'm';
            }
            return n + ' ' + u;
        }
        return <LMR className="px-2 py-1" right={<Muted>{sz()}</Muted>}>
            <div>{name}</div>
            <div><Muted>修改日期: <EasyDate date={lastModifiedDate} /></Muted></div>
        </LMR>;
    }
    private fileClick = (file: any) => {
        let fr = new FileReader();
        fr.onload = function (f) {
            nav.push(<UqPage name={file.name} content={this.result} />)
        }
        fr.readAsText(file, "utf8");
    }
    private onSubmit = (evt: React.FormEvent<any>) => {
        evt.preventDefault();
    }

    private async upload() {
        var files: FileList = this.fileInput.files;
        var data = new FormData();
        let len = files.length;
        for (let i = 0; i < len; i++) {
            let file = files[i];
            data.append('files[]', file, file.name);
        }

        let url = store.uqServer + 'uq-compile/' + this.props.uq.id + '/upload';
        try {
            let abortController = new AbortController();

            let res = await fetch(url, {
                method: "POST",
                body: data,
                signal: abortController.signal,
                headers: buildHeaders()
            });
            nav.push(<CompileResultPage {...this.props}
                actionName="上传"
                action="upload"
                res={res} abortController={abortController} />);
        }
        catch (e) {
            console.error('%s %s', url, e);
        }
    }
    private onUpload = async () => {
        nav.ceaseTop();
        await this.upload();
    }
    render() {
        let { files } = this.state;
        let fileList: any;
        if (files !== undefined) {
            fileList = <List
                className="my-3"
                items={files}
                item={{ render: this.fileRender, onClick: this.fileClick }} />;
        }
        let button: any;
        if (files !== undefined && files.length > 0) {
            button = <div className="my-2 d-flex">
                <button className="btn btn-primary" type="submit" onClick={this.onUpload}>提交UQ</button>
            </div>;
        }
        return <Page header={'提交UQ - ' + this.props.uq.name}>
            <div className="py-2 px-3">
                <form className="my-1" encType="multipart/form-data" onSubmit={this.onSubmit}>
                    <div className="my-1">
                        <button className="btn btn-outline-success"
                            onClick={() => this.fileInput.click()}>选择UQ源代码文件</button>
                        <input
                            ref={(fileInput) => this.fileInput = fileInput}
                            type="file"
                            className="w-100 form-control-file d-none"
                            name="files" multiple={true}
                            onChange={this.onFilesChange} />
                    </div>
                    {fileList}
                    {button}
                </form>
                <pre>{this.state.compiled}</pre>
                <div>{this.state.text}</div>
            </div>
        </Page>
    }
}

interface Options {
    action: 'test' | 'deploy';
    caption: string;
    compile: string;
    //fast: string;
    //thoroughly: string;
    description: any;
}
const test: Options = {
    action: 'test',
    caption: '测试版',
    compile: '编译',
    //fast: '快速编译',
    //thoroughly: '完全编译',
    description: <>
        <li>用上传的UQ代码，生成测试数据库</li>
        <li>自动做增量快速编译。比较源代码，仅对修改的源代码，生成数据库</li>
        <li>编译器升级后，会自动完全编译</li>
    </>
}

const deploy: Options = {
    action: 'deploy',
    caption: '发布版',
    compile: '编译',
    //fast: '快速编译',
    //thoroughly: '完全编译',
    description: <>
        <li>将已经编译测试过的代码，发布到生产服务器</li>
        <li>自动做增量快速编译。比较源代码，仅对修改的源代码，生成数据库</li>
        <li>编译器升级后，会自动完全编译</li>
    </>
}

export class UqDeploy extends React.Component<UqActionProps> {
    readonly options: Options;
    constructor(props: UqActionProps) {
        super(props);
        switch (props.action) {
            case 'test':
                this.options = test;
                break;
            case 'deploy':
                this.options = deploy;
                break;
        }
    }

    private onCompile = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.disabled = true;
        nav.ceaseTop();
        //let thoroughly = false;
        await this.compile(/*thoroughly*/);
    }
    /*
    private onCompileThoroughly = async () => {
        nav.ceaseTop();
        let thoroughly = true;
        await this.compile(thoroughly);
    }
    */
    private async compile(/*isThoroughly: boolean*/) {
        let { caption, action, compile/* thoroughly, fast*/ } = this.options;
        let url = store.uqServer + 'uq-compile/' + this.props.uq.id + '/' + action;
        let actionName: string;
        /*if (isThoroughly === true) {
            actionName = thoroughly;
            url += '-thoroughly';
        }
        else {*/
        actionName = compile; //fast;
        //}
        try {
            let abortController = new AbortController();
            let res = await fetch(url, {
                method: "POST",
                signal: abortController.signal,
                headers: buildHeaders(),
            });
            nav.push(<CompileResultPage {...this.props}
                caption={caption}
                action={action}
                actionName={actionName}
                res={res} abortController={abortController} />);
        }
        catch (e) {
            console.error('%s %s', url, e);
        }
    }
    render() {
        let { caption, compile, /*fast, thoroughly, */description } = this.options;
        return <Page header={caption + ' - ' + this.props.uq.name}>
            <div className="bg-white p-3">
                <ul className="my-3">{description}</ul>
                <div className="d-flex p-3 justify-content-center">
                    <ButtonAsync className="btn btn-primary w-8c"
                        type="submit" onClick={this.onCompile}>
                        {compile}
                    </ButtonAsync>
                </div>
            </div>
        </Page>;
    }
}

interface UqPgeProps {
    name: string;
    content: string | ArrayBuffer;
}
class UqPage extends React.Component<UqPgeProps> {
    render() {
        return <Page header={this.props.name}>
            <pre className="px-3 py-2">{this.props.content}</pre>
        </Page>;
    }
}


function buildHeaders(): { [name: string]: string } {
    let headers: { [name: string]: string } = {};
    headers['user-token'] = nav.userToken;
    return headers;
}
