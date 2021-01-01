// typescript version of krasimir/navigo

export type RouteFunc = (params?:string|{[name:string]:string}, query?:string) => void;

export interface NamedRoute {
	as: string;
	uses: RouteFunc;
	hooks?: Hooks;
}
export interface Hooks {
	before: (done:()=>void, params:object) => void;
	after: (params:object) => void;
	leave: (params:object) => void;
	already: (params:object) => void;
}
interface Handler {
	handler: RouteFunc;
	hooks: Hooks;
}
interface LastResolved {
	url: string;
	query: string;
	hooks: Hooks;
	params?: {[name:string]:string};
	name?: string;
}
interface Route {
	route: string|RegExp;
	handler: RouteFunc,
	name: string,
	hooks: Hooks
}

export class Navigo {
	private static PARAMETER_REGEXP = /([:*])(\w+)/g;
	private static WILDCARD_REGEXP = /\*/g;
	private static REPLACE_VARIABLE_REGEXP = '([^\\/]+)';   	// 单\，编译错误 ([^\/]+)
	private static REPLACE_WILDCARD = `(?:.*)`;
	private static FOLLOWED_BY_SLASH_REGEXP = '(?:\\/$|$)';		// 单\，编译错误 (?:\/$|$)
	private static MATCH_REGEXP_FLAGS = '';

	private static isPushStateAvailable() {
		return !!(
		  typeof window !== 'undefined' &&
		  window.history &&
		  window.history.pushState
		);
	}
	
	private static clean(s:string|RegExp) {
		if (s instanceof RegExp) return s;
		return Navigo.cleanUrl(s);
	}
	private static cleanUrl(s:string) {
		return s.replace(/\/+$/, '').replace(/^\/+/, '^/');
	}

	private static regExpResultToParams(match:any[], names:string[]) {
		if (names.length === 0) return null;
		if (!match) return null;
		return match
		  .slice(1, match.length)
		  .reduce((params, value, index) => {
				if (params === null) params = {};
				params[names[index]] = decodeURIComponent(value);
				return params;
		  }, null);
	}
	  
	private static replaceDynamicURLParts(route:string|RegExp) {
		let paramNames:string[] = [], regexp:RegExp;
	  
		if (route instanceof RegExp) {
			regexp = route;
		}
		else {
			regexp = new RegExp(
				route.replace(Navigo.PARAMETER_REGEXP, function (full, dots, name) {
						paramNames.push(name);
						return Navigo.REPLACE_VARIABLE_REGEXP;
					})
					.replace(Navigo.WILDCARD_REGEXP, Navigo.REPLACE_WILDCARD) + Navigo.FOLLOWED_BY_SLASH_REGEXP
				, Navigo.MATCH_REGEXP_FLAGS);
		}
		return { regexp, paramNames };
	}
	  
	private static getUrlDepth(url:string):number {
		return url.replace(/\/$/, '').split('/').length;
	}
	  
	private static compareUrlDepth(urlA:string, urlB:string) {
		return Navigo.getUrlDepth(urlB) - Navigo.getUrlDepth(urlA);
	}
	  
	private static findMatchedRoutes(url:string, routes:Route[] = []) {
		return routes.map(route => {
			let { regexp, paramNames } = Navigo.replaceDynamicURLParts(Navigo.clean(route.route));
			let match = url.replace(/^\/+/, '/').match(regexp);
			let params = Navigo.regExpResultToParams(match, paramNames);
			return match ? { match, route, params } : false;
		}).filter(m => m);
	}
	  
	private static match(url:string, routes:Route[]) {
		return Navigo.findMatchedRoutes(url, routes)[0] || false;
	}
	  
	private static root(url:string, routes:Route[]) {
		const colonExp = RegExp('\\/:\\D(\\w*)', 'g');
		const exp = ''; // '($|\\/)';  // 单\，编译报错 ($|\/)
		let matched = routes.map(
			route => {
				let r = route.route;
				if (r === '' || r === '*') return url;
				if (typeof r === 'string') {
					r = r.replace(colonExp, '\\/\\w+');
				}
				let routeExp = r + exp;
				let ret = url.split(new RegExp(routeExp))[0];
				return ret;
			}
		);
		let fallbackURL = Navigo.cleanUrl(url);
		let len = matched.length;
		if (len === 0) return fallbackURL;
		let matched0 = matched[0];
		if (len === 1) return matched0;
		return matched.reduce((result, url) => {
			if (result.length > url.length) result = url;
			return result;
		}, matched0);
	}
	  
	private static isHashChangeAPIAvailable() {
		return typeof window !== 'undefined' && 'onhashchange' in window;
	}
	  
	private static extractGETParameters(url:string):string {
		return url.split(/\?(.*)?$/).slice(1).join('');
	}
	  
	private static getOnlyURL(url:string, useHash:boolean, hash:string) {
		let onlyURL = url, split:string[];
		var cleanGETParam = (str:string) => str.split(/\?(.*)?$/)[0];
	  
		if (typeof hash === 'undefined') {
			// To preserve BC
			hash = '#';
		}
	  
		if (Navigo.isPushStateAvailable() && !useHash) {
		  	onlyURL = cleanGETParam(url).split(hash)[0];
		}
		else {
			split = url.split(hash);
			onlyURL = split.length > 1 ? cleanGETParam(split[1]) : cleanGETParam(split[0]);
		}
		return onlyURL;
	}
	  
	private static manageHooks(handler:RouteFunc, hooks:Hooks, params?:any, exHooks?:Hooks) {
		if (hooks && typeof hooks === 'object') {
			if (hooks.before) {
				hooks.before((shouldRoute = true) => {
				if (!shouldRoute) return;
				handler();
				hooks.after && hooks.after(params);
				}, params);
				return;
			}
			else if (hooks.after) {
				handler();
				hooks.after && hooks.after(params);
				return;
			}
		}
		handler();
	}
	  
	private static isHashedRoot(url:string, useHash:boolean, hash:string) {
		if (Navigo.isPushStateAvailable() && !useHash) {
		  return false;
		}
	  
		if (!url.match(hash)) {
		  return false;
		}
	  
		let split = url.split(hash);
	  
		return split.length < 2 || split[1] === '';
	}
	
	private root:string;
	private _routes:Route[] = [];
	private _useHash:boolean;
	private _hash:string;
	private _paused:boolean;
	private _destroyed:boolean;
	private _lastRouteResolved:LastResolved;
	private _notFoundHandler:Handler;
	private _defaultHandler:Handler;
	private _usePushState:boolean;
	private _genericHooks:Hooks;
	private _historyUpdateMethod: 'pushState' | 'replaceState'; // HistoryUpdateMethod;
	private timout: any; //NodeJS.Timeout;

	constructor(r:string = null, useHash:boolean = false, hash:string = '#') {
		this.root = null;
		this._useHash = useHash;
		this._hash = (!hash)? '#' : hash;
		this._paused = false;
		this._destroyed = false;
		this._lastRouteResolved = null;
		this._notFoundHandler = null;
		this._defaultHandler = null;
		this._usePushState = !useHash && Navigo.isPushStateAvailable();
		//this._onLocationChange = this._onLocationChange.bind(this);
		this._genericHooks = null;
		this._historyUpdateMethod = 'pushState';
	
		if (r) {
			this.root = useHash ? r.replace(/\/$/, '/' + this._hash) : r.replace(/\/$/, '');
		} else if (useHash) {
			this.root = this._cLoc().split(this._hash)[0].replace(/\/$/, '/' + this._hash);
		}
	
		this._listen();
		this.updatePageLinks();
	}
  
	navigate(path:string, absolute:boolean = false):Navigo {
		let to:string;
		path = path || '';
		if (this._usePushState) {
			to = (!absolute ? this._getRoot() + '/' : '') + path.replace(/^\/+/, '/');
			to = to.replace(/([^:])(\/{2,})/g, '$1/');
			this._historyUpdate({}, '', to);
			this.resolve();
		}
		else if (typeof window !== 'undefined') {
			path = path.replace(new RegExp('^' + this._hash), '');
			let {location} = window;
			location.href = location.href
				.replace(/#$/, '')
				.replace(new RegExp(this._hash + '.*$'), '') + this._hash + path;
		}
		return this;
	}

	on(routeFunc:RouteFunc, hooks?:Hooks):Navigo;
	on(url:string, routeFunc:RouteFunc, hooks?:Hooks):Navigo;
	on(regex:RegExp, routeFunc:RouteFunc, hooks?:Hooks):Navigo;
	on(options: {[url:string]: RouteFunc|NamedRoute}):Navigo;
	on(...args:any[]):Navigo {
		let arg0 = args[0];
		let arg1 = args[1];
		switch (typeof arg0) {
			case 'function':
				this._defaultHandler = { handler: arg0, hooks: arg1 };
				if (!this._notFoundHandler) {
					this._notFoundHandler = this._defaultHandler;
				}
				break;
			case 'object':
				let orderedRoutes = Object.keys(arg0).sort(Navigo.compareUrlDepth);
				orderedRoutes.forEach(route => this.on(route, arg0[route]));
				break;
			default:
				if (args.length < 2) break;
				if (arg0 === '/') {
					this._defaultHandler = { 
						handler: typeof arg1 === 'object'? arg1.uses : arg1, 
						hooks: args[2],
					};
					break;
				}
				this._add(arg0, arg1, args[2]);
				break;
		}
		return this;
	}

	off(handler:RouteFunc):Navigo {
		if (this._defaultHandler !== null && handler === this._defaultHandler.handler) {
			this._defaultHandler = null;
		}
		else if (this._notFoundHandler !== null && handler === this._notFoundHandler.handler) {
			this._notFoundHandler = null;
		}
		this._routes = this._routes.reduce((result, r) => {
			if (r.handler !== handler) result.push(r);
			return result;
		}, []);
		return this;
	}

	notFound(handler:RouteFunc, hooks:Hooks):Navigo {
		this._notFoundHandler = { handler, hooks };
		return this;
	}

	resolve(current?:string) {
		let c = current || this._cLoc();
		let root = this._getRoot();
		let url = c.replace(root, '');
	
		if (this._useHash) {
			const exp = '^\\/';  // 单\，编译报错 ^\/
			url = url.replace(new RegExp(exp + this._hash), '/');
		}
	
		let GETParameters = Navigo.extractGETParameters(current || this._cLoc());
		let onlyURL = Navigo.getOnlyURL(url, this._useHash, this._hash);
	
		if (this._paused) return false;
	
		if (
			this._lastRouteResolved &&
			onlyURL === this._lastRouteResolved.url &&
			GETParameters === this._lastRouteResolved.query
		) {
			if (this._lastRouteResolved.hooks && this._lastRouteResolved.hooks.already) {
				this._lastRouteResolved.hooks.already(this._lastRouteResolved.params);
			}
			return false;
		}
	
		let matched = Navigo.match(onlyURL, this._routes);
	
		let manageHooks = (handler:Handler) => {
			Navigo.manageHooks(() => {
				Navigo.manageHooks(() => {
					this._callLeave();
					this._lastRouteResolved = {
						url: onlyURL,
						query: GETParameters, 
						hooks: handler.hooks
					};
					handler.handler(GETParameters);
				}, handler.hooks);
			}, this._genericHooks);
		}

		if (matched === false) {
			if (this._defaultHandler && (
				onlyURL === '' ||
				onlyURL === '/' ||
				onlyURL === this._hash ||
				Navigo.isHashedRoot(onlyURL, this._useHash, this._hash)
			)) {
				/*
				Navigo.manageHooks(() => {
					Navigo.manageHooks(() => {
						this._callLeave();
						this._lastRouteResolved = {
							url: onlyURL,
							query: GETParameters, 
							hooks: this._defaultHandler.hooks
						};
						this._defaultHandler.handler(GETParameters);
					}, this._defaultHandler.hooks);
				}, this._genericHooks);
				*/
				manageHooks(this._defaultHandler);
				return true;
			}
			else if (this._notFoundHandler) {
				/*
				Navigo.manageHooks(() => {
					Navigo.manageHooks(() => {
						this._callLeave();
						this._lastRouteResolved = {
							url: onlyURL,
							query: GETParameters,
							hooks: this._notFoundHandler.hooks
						};
						this._notFoundHandler.handler(GETParameters);
					}, this._notFoundHandler.hooks);
				}, this._genericHooks);
				*/
				manageHooks(this._notFoundHandler);
			}
			return false;	
		}
		let m = matched;
		if (m) {
			this._callLeave();
			this._lastRouteResolved = {
				url: onlyURL,
				query: GETParameters,
				hooks: m.route.hooks,
				params: m.params,
				name: m.route.name
			};
			let handler = m.route.handler;
			Navigo.manageHooks(() => {
				Navigo.manageHooks(() => {
					m.route.route instanceof RegExp ?
					handler(...(m.match.slice(1, m.match.length))) :
					handler(m.params, GETParameters);
				}, m.route.hooks, m.params, this._genericHooks);
			}, this._genericHooks, m.params);
			return m;
		}
	}

	destroy() {
		this._routes = [];
		this._destroyed = true;
		this._lastRouteResolved = null;
		this._genericHooks = null;
		clearTimeout(this.timout);
		if (typeof window !== 'undefined') {
			window.removeEventListener('popstate', this._onLocationChange);
			window.removeEventListener('hashchange', this._onLocationChange);
		}
	}

	updatePageLinks() {
		//var self = this;
		if (typeof document === 'undefined') return;
			this._findLinks().forEach(link => {
			if (!link.hasListenerAttached) {
				link.addEventListener('click', (e: React.MouseEvent<HTMLElement>) => {
					if((e.ctrlKey || e.metaKey) && e.currentTarget.tagName.toLowerCase() === 'a'){ return false; }
					var location = this.getLinkPath(link);
		
					if (!this._destroyed) {
						e.preventDefault();
						this.navigate(location.replace(/\/+$/, '').replace(/^\/+/, '/'));
					}
				});
				link.hasListenerAttached = true;
			}
		});
	}

	generate(name:string, data:any = {}) {
		let result = this._routes.reduce((result, route) => {
			if (route.name === name) {
				result = route.route.toString();
				for (let key in data) {
					result = result.replace(':' + key, data[key]);
				}
			}
			return result;
		}, '');
	
		return this._useHash ? this._hash + result : result;
	}

	link(path:string) {
		return this._getRoot() + path;
	}

	pause(status:boolean = true) {
		this._paused = status;
		if (status) {
			this._historyUpdateMethod = 'replaceState';
		}
		else {
			this._historyUpdateMethod = 'pushState';
		}
	}

	resume() {
		this.pause(false);
	}

	historyAPIUpdateMethod(value:'pushState' | 'replaceState') {
		if (typeof value === 'undefined') return this._historyUpdateMethod;
		this._historyUpdateMethod = value;
		return value;
	}

	disableIfAPINotAvailable() {
		if (!Navigo.isPushStateAvailable()) {
			this.destroy();
		}
	}

	lastRouteResolved() {
		return this._lastRouteResolved;
	}

	getLinkPath(link:any) {
		return link.getAttribute('href');
	}

	hooks(hooks:Hooks) {
		this._genericHooks = hooks;
	}

	private _add(route:string|RegExp, handler:RouteFunc|NamedRoute, hooks:Hooks) {
		if (typeof route === 'string') {
			route = encodeURI(route);
		}
		this._routes.push(
			typeof handler === 'object' ?
			{
				route,
				handler: handler.uses,
				name: handler.as,
				hooks: hooks || handler.hooks
			} 
			:
			{
				route,
				handler, 
				name: undefined,
				hooks,
			}
		);
		return this._add;
	}

	private _historyUpdate(data:any, title:string, url?:string) {
		switch (this._historyUpdateMethod) {
			default: throw Error('unknow history method ' + this._historyUpdateMethod);
			case 'pushState': window.history.pushState(data, title, url); return;
			case 'replaceState': window.history.replaceState(data, title, url); return;
		}
	}

	private _getRoot() {
		if (this.root !== null) return this.root;
		let cLoc = this._cLoc();
		let cLocRoot = cLoc.split('?')[0];
		this.root = Navigo.root(cLocRoot, this._routes);
		return this.root;
	}

	private _listen() {
		if (this._usePushState) {
			window.addEventListener('popstate', this._onLocationChange);
		}
		else if (Navigo.isHashChangeAPIAvailable()) {
			window.addEventListener('hashchange', this._onLocationChange);
		}
		else {
			let cached = this._cLoc();
	
			let check = () => {
				let current = this._cLoc();
				if (cached !== current) {
					cached = current;
					this.resolve();
				}
				if (this.timout) clearTimeout(this.timout);
				this.timout = setTimeout(check, 200);
			};
			check();
		}
	}

	private _cLoc() {
		if (typeof window !== 'undefined') {
			//if (typeof window.__NAVIGO_WINDOW_LOCATION_MOCK__ !== 'undefined') {
			//	return window.__NAVIGO_WINDOW_LOCATION_MOCK__;
			//}
			return Navigo.cleanUrl(window.location.href);
		}
		return '';
	}

	private _findLinks() {
		return [].slice.call(document.querySelectorAll('[data-navigo]'));
	}

	private _onLocationChange = () => {
		console.log('_onLocationChange');
		this.resolve();
	}

	private _callLeave() {
		const lastRouteResolved = this._lastRouteResolved;	
		if (lastRouteResolved) {
			let {params, hooks} = lastRouteResolved;
			if (hooks) {
				if (hooks.leave) {
					hooks.leave(params);
				}
			}
		}
	}
}

//export default Navigo;
export const navigo = new Navigo();
