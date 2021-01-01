import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { FA } from 'tonva';
import { observable } from 'mobx';
//import { observer } from 'mobx-react';

const groupStart = '///++++++';
const groupEnd = '------///';

export abstract class Section {
    rowId: number;
	render: () => JSX.Element;
	renderHtml() {
		return ReactDOMServer.renderToStaticMarkup(this.render());
	}
	afterMount() {}
	isMe(name:string):boolean {return false;}
}

class StringSection extends Section {
    text: string;
    constructor(text:string) {
        super(); 
        this.text = text;
    }
    render = (): JSX.Element => {
        if (this.text.trim().length === 0) return null;
        let parts = this.text.split('\n');
        return <>{parts.map((v, i) => v.length === 0?
            <div key={i}>&nbsp;</div> :
            <div key={i}>{v}</div>
        )}</>;
    }
}

class GroupSection extends Section {
	name: string;
    group: string[];
    @observable collaps: 1|2|3;
    constructor(name:string, group:string[]) {
		super();
		this.name = name;
        this.group = group;
        this.collaps = 1;
	}
	get elId() {return 'g' + this.rowId}
	get cId() {return 'c' + this.rowId}
	setCollaps(c:1|2|3) {
		this.collaps = c;
		let el = document.getElementById(this.elId);
		let elIcon = el.firstElementChild;
		if (elIcon) {
			let fa:string;
			switch (c) {
				case 1: fa = 'fa fa-spin text-primary'; break;
				case 2: fa = 'fa fa-arrow-circle-down text-success'; break;
				case 3: fa = 'fa fa-arrow-circle-up text-success'; break;
			}
			elIcon.className = fa;			
		}
		if (c === 3) {
             let content = ReactDOMServer.renderToStaticMarkup(<div id={this.cId}>
                {
                    this.group.map((v, i) => {
                        if (v.trim().length === 0) return null;
                        return <pre style={{whiteSpace: 'pre-wrap'}} key={i}>{v}</pre>
                    })
                }
			</div>);
			const range = document.createRange();
			range.selectNode(el);
			const child = range.createContextualFragment(content);
			el.parentNode.insertBefore(child, el.nextSibling);
		}
		else {
			let c = document.getElementById(this.cId);
			if (c) {
				c.parentNode.removeChild(c);
			}
		}
	}
	isMe(name:string):boolean {
		return this.name === name;
	}
	private onClick = () => {
		let c = this.collaps;
		if (c === 1) return;
		if (c === 2) c = 3;
		else c = 2;
		this.setCollaps(c);
	}
	afterMount() {
		let el = document.getElementById(this.elId);
		if (el) {
			el.addEventListener('click', this.onClick);
		}
	}
    render = /*observer(*/():JSX.Element => {
        //let groupId = 'text-group-' + index;
        let line = this.group[0];
        let title: string;
        let p0 = 0, p = line.indexOf('\n');
        if (p < 0) p = undefined;
        else {
            let l = line.indexOf('(');
            if (l < p) p = l;
        }
        title = line.substring(p0, p);

		let titleIcon:any, content:any;
		if (this.collaps === 1) {
			titleIcon = <FA name='spinner' className='text-primary fa-spin' />;
		}
        else if (this.collaps===3) {
            titleIcon = <FA name='arrow-circle-up' className='text-success' />;
            content = <div id={this.cId}>
                {
                    this.group.map((v, i) => {
                        if (v.trim().length === 0) return null;
                        return <pre style={{whiteSpace: 'pre-wrap'}} key={i}>{v}</pre>
                    })
                }
            </div>;
        }
        else {
            titleIcon = <FA name='arrow-circle-down' className='text-success' />;
        }
        return <>
            <div id={this.elId} className="cursor-pointer text-primary" onClick={this.onClick}>{titleIcon} <u>{title}</u></div>
            {content}
        </>;
    }//);
}

class EndSection extends Section {
	name: string;
	constructor(name:string) {super(); this.name = name}
}

class ErrorSection extends Section {
    error: string[];
    constructor(error:string[]) {super(); this.error = error}
    render = ():JSX.Element => {
        return <div className="text-danger">
            <FA name="exclamation-circle" />&nbsp;
            {this.error.join().split('\n').map((v, index)=><React.Fragment key={index}>{v}<br/></React.Fragment>)}
        </div>;
    }
}

export class ResultSections {
    private text: string;
    private p: number;
    private group: string[];
    private stop: boolean;
    @observable hasError: boolean = false;
    @observable seconds: number;
    //readonly sections: (string | string[])[] = [];
    private sectionId: number = 1;
	@observable readonly sections: Section[] = []; //observable.array([], {deep: true});
	private containerElement: HTMLDivElement

	constructor(containerElement: HTMLDivElement) {
		this.containerElement = containerElement;
	}

    add(text:string):void {
        this.stop = false;
        if (this.text === undefined) {
            this.p = 0;
            this.text = text;
        }
        else {
            this.text = this.text + text;
        }
        if (this.text.length < 10) return;
        while (this.stop === false) {
            this.addToGroup();
            this.addText();
        }
	}
	
	private addHtml(text:string) {
		const range = document.createRange();
		range.selectNode(this.containerElement);
		const child = range.createContextualFragment(text);
		this.containerElement.appendChild(child);
	};

    private addSection(section:Section) {
        section.rowId = this.sectionId;
        this.sectionId++;
		this.sections.push(section);
		/*
        let len = this.sections.length;
        if (len > 500) {
            this.sections.splice(0, len - 500);
		}
		*/
		let html = section.renderHtml();
		this.addHtml(html);
		section.afterMount();
    }

    private mayStart(token:string):boolean {
        let len = this.text.length - token.length;
        if (this.p < len) return false;
        for (let i=0; i<len; i++) {
            if (this.text.charCodeAt(this.p + i) !== token.charCodeAt(i)) return false;
        }
        return true;
    }

    private parse():Section {
        let type: string = '';
		let len = this.group.length;
        for (let i=0; i<len; i++) {
            let ln = this.group[i];
            let pos = ln.indexOf('\n');
            if (pos < 0) {
                type += ln;
                continue;
            }
            type += ln.substr(0, pos);
            for (let s=0; s<i+1; s++) this.group.shift();
            this.group.unshift(ln.substr(pos+1));
            switch (type) {
                default:
				case '': 
                    return new GroupSection(type, this.group);
                case 'error': 
                    this.hasError = true;
                    return new ErrorSection(this.group);
            }            
        }
		return new EndSection(type);
	}

    private addToGroup():void {
        if (this.group === undefined) return;
        if (this.text === undefined) return;
        let p = this.text.indexOf(groupEnd, this.p);
        if (p < 0) {
            if (this.mayStart(groupEnd) === true) return;
            this.group.push(this.p === 0? this.text : this.text.substr(this.p));
            this.p = 0;
            this.text = undefined;
            this.stop = true;
            return;
        }
		this.group.push(this.text.substring(this.p, p));
		let sec = this.parse();
		if (sec.render !== undefined) {
			this.addSection(sec);
		}
		else {
			let n = (sec as EndSection).name;
			let len = this.sections.length;
			for (let i=len-1; i>=0; i--) {
				let sec = this.sections[i];
				if (!sec) continue;
				if (sec.isMe(n) === true) {
					(sec as GroupSection).setCollaps(2);
					break;
				}
			}
		}
        this.group = undefined;
        this.p = p + 9;
    }

    private addText():void {
        if (this.text === undefined) return;
        let p = this.text.indexOf(groupStart, this.p);
        if (p < 0) {
            if (this.mayStart(groupStart) === true) return;
            this.addSection(new StringSection(this.p === 0? this.text : this.text.substr(this.p)));
            this.p = 0;
            this.text = undefined;
            this.stop = true;
            return;
		}
		let sec = this.text.substring(this.p, p);
        this.addSection(new StringSection(sec));
        this.p = p + 9;
        this.group = [];
    }
}
