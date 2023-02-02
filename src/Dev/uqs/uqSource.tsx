import * as React from 'react';
import { Page } from 'tonva';
import { UqActionProps } from './uqActionProps';

interface UqSourceProps extends UqActionProps {
    source: string;
}

export class UqSource extends React.Component<UqSourceProps> {
    private source: string;
    constructor(props: UqSourceProps) {
        super(props);
        this.source = props.source;
        this.state = {
            files: undefined,
        }
    }
    onCopyToClipborad = () => {
        navigator.clipboard.writeText(this.source);
        alert('代码已拷贝到剪贴板');
    }
    render() {
        const right = <div className="text-white cursor-pointer p-2" onClick={this.onCopyToClipborad}>拷贝到剪贴板</div>;
        return <Page header={'源码 - ' + this.props.uq.name} right={right}>
            <div className="py-2 px-3">
                <pre style={{ whiteSpace: 'pre-wrap' }}>{this.source}</pre>
            </div>
        </Page>
    }
}
