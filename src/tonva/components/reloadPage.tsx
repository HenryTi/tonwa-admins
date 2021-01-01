import * as React from 'react';
import { nav } from './nav';
import { Page } from './page/page';

interface Props {
    message: string,
    seconds: number
}

interface State {
    seconds: number
}

export class ReloadPage extends React.Component<Props, State> {
    private timerHandler:any;
    constructor(props:Props) {
		super(props);
		let {seconds} = props;
		if (seconds===undefined) return;
        this.state = {seconds};
		if (seconds <= 0) return;
        this.timerHandler = setInterval(() => {
			let {seconds} = this.state;
            seconds--;
            if (seconds <= 0) {
                this.reload();
            }
            else {
                this.setState({seconds: seconds});
            }
        }, 1000);
    }
    private reload = () => {
        clearInterval(this.timerHandler);
        nav.reload();
    }
    render() {
		let {seconds} = this.state;
		let title:string, msg:string;		
		if (seconds > 0) {
			title = '程序升级中...';
			msg = this.state.seconds + '秒钟之后自动重启动';
		}
		else {
			title = '程序需要升级';
			msg = '请点击下面按钮重启';
		}
        return <Page header={false}>
            <div className="text-center p-5">
                <div className="text-info py-5">
					<span className="text-danger">{title}</span>
					<br/>
					{msg}
                    <br/>
                    <span className="small text-muted">{this.props.message}</span>
                </div>
                <button className="btn btn-danger" onClick={this.reload}>立刻重启</button>
            </div>
        </Page>;
    }
}

interface ConfirmReloadPageProps {
    confirm: (ok: boolean)=>Promise<void>;
}
export const ConfirmReloadPage = (props: ConfirmReloadPageProps):JSX.Element => {
    return <Page header="升级软件" back="close">
        <div className="py-5 px-3 my-5 mx-2 border bg-white rounded">
            <div className="text-center text-info">
                升级将清除所有本机缓冲区内容，并从服务器重新安装程序！
            </div>
            <div className="text-center mt-5">
                <button className="btn btn-danger mr-3" onClick={()=>props.confirm(true)}>确认升级</button>
            </div>
        </div>
    </Page>;
    // <button className="btn btn-outline-danger" onClick={()=>props.confirm(false)}>暂不</button>
}
