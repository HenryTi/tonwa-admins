import React from 'react';
import { PageHeaderProps } from './pageHeader';

const scrollAfter = 20; // 20ms之后，scroll执行
export class Scroller {
    private el: HTMLBaseElement;
    constructor(el: HTMLBaseElement) {
        this.el = el;
    }

    scrollToTop():void {
        setTimeout(() => this.el.scrollTo(0, 0), scrollAfter);
    }
    scrollToBottom():void {
        setTimeout(() => this.el.scrollTo(0, this.el.scrollTop + this.el.offsetHeight), scrollAfter);
    }
}

export interface ScrollProps {
    onScroll?: (e:any) => void;
    onScrollTop?: (scroller: Scroller) => Promise<boolean>;
	onScrollBottom?: (scroller: Scroller) => Promise<void>;
	className?: string;
}
interface ScrollViewProps extends ScrollProps {
	className?: string;
	style?: React.CSSProperties;
}
const scrollTimeGap = 100;
abstract class ScrollViewBase<T extends ScrollViewProps> extends React.Component<T, null> {
    private bottomTime:number = 0;
	private topTime:number = 0;
	private div: HTMLDivElement;

	protected refDiv = (div:HTMLDivElement) => {
		if (!div) {
			if (this.div) {
				this.div.removeEventListener('resize', this.onResize)
			}
			return;
		}
		this.div = div;
		this.div.addEventListener('resize', this.onResize);
	}

	private onResize = (ev:UIEvent) => {
		console.error('div resize');
	};

    protected onScroll = async (e:any) => {
        let {onScroll, onScrollTop, onScrollBottom} = this.props;
        if (onScroll) onScroll(e);
        let el = e.target as HTMLBaseElement;
        let scroller = new Scroller(el);
        if (el.scrollTop < 30) {
            if (onScrollTop !== undefined) {
                let topTime = new Date().getTime();
                if (topTime-this.topTime > scrollTimeGap) {
                    this.topTime = topTime;
					onScrollTop(scroller).then(ret => {
						 // has more
						if (ret === true) {
							let sh = el.scrollHeight;
							let top = 200;
							if (top > sh) top = sh;
							el.scrollTop = top;
						}
					});
                }
            }
        }
        if (el.scrollTop + el.offsetHeight > el.scrollHeight - 30) {
            //this.eachChild(this, 'bottom');
            if (onScrollBottom !== undefined) {
                let bottomTime = new Date().getTime();
                if (bottomTime - this.bottomTime > scrollTimeGap) {
                    this.bottomTime = bottomTime;
                    onScrollBottom(scroller);
                }
            }
        }
    }
    private eachChild(c:any, direct:'top'|'bottom') {
        let { props } = c;
        if (props === undefined)
            return;
        let { children } = props;
        if (children === undefined)
            return;
        React.Children.forEach(children, (child, index) => {
            let {_$scroll} = child as any;
            if (_$scroll) _$scroll(direct);
            console.log(child.toString());
            this.eachChild(child, direct);
        });
	}
}

export class ScrollView extends ScrollViewBase<ScrollViewProps> {
    render() {
		let {className, style} = this.props;
		return <div ref={this.refDiv} className="tv-page"
			onScroll={this.onScroll} style={style}>
			<article className={className}>
				{this.props.children}
			</article>
		</div>;
    }
}

export interface PageWebNav {
	navHeader?: JSX.Element; 
	navRawHeader?: JSX.Element; 
	navFooter?: JSX.Element; 
	navRawFooter?: JSX.Element; 
	renderPageHeader?: (props:PageHeaderProps)=>JSX.Element;
}
interface WebNavScrollViewProps extends ScrollViewProps {
	webNav: PageWebNav;
}

export class WebNavScrollView extends ScrollViewBase<WebNavScrollViewProps> {
    render() {
		let {className, style, webNav} = this.props;
		let {navHeader, navRawHeader, navFooter, navRawFooter} = webNav;
		let vHeader:any, vFooter:any;
		if (navRawHeader) vHeader = navRawHeader;
		else if (navHeader) vHeader = <header><main>{navHeader}</main></header>
		if (navRawFooter) vFooter = navRawFooter;
		else if (navFooter) vFooter = <footer><main>{navFooter}</main></footer>

		return <div ref={this.refDiv} className="tv-page-webnav"
			onScroll={this.onScroll} style={style}>
			{vHeader}
			<article className={className}>
				{this.props.children}
			</article>
			{vFooter}
		</div>;
    }
}
