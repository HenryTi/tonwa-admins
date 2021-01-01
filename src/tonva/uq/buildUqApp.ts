import fs from 'fs';
import { Action, Book, Query, Sheet, Tuid, UqEnum, UqMan, UQsMan, Map, History, Tag, Pending, Entity, ArrFields, Field } from './index';
import { nav } from '../components';
import { AppConfig } from '../app';
//import { env } from 'tonva/tool';

//const uqAppPath = 'src/UqApp';
const red = '\x1b[41m%s\x1b[0m';
let lastBuildTime:number = 0;
let gUqOwnerMap:{[key:string]:string};

export interface UqAppOptions extends Partial<AppConfig> {
	uqAppName: string;
	uqAppVersion: string;
	uqAppUnitId: number;
	uqAppSrcPath?: string;
	uqOwnerMap?: {[key:string]: string};
}

export async function uqAppStart(options: UqAppOptions) {
	let {uqAppName, uqAppVersion: appVersion, uqAppUnitId: appUnitId} = options;
	process.env.REACT_APP_UNIT = String(appUnitId);
	nav.forceDevelopment = true;
	await nav.init();
	await UQsMan.load(uqAppName, appVersion, undefined);
}
export async function buildUqApp(options: UqAppOptions) {
	let {uqAppSrcPath, uqOwnerMap} = options;
	if (!uqAppSrcPath) uqAppSrcPath = 'src/UqApp';
	gUqOwnerMap = uqOwnerMap || {};
	for (let i in gUqOwnerMap) {
		gUqOwnerMap[i.toLowerCase()] = gUqOwnerMap[i];
	}
	if (lastBuildTime > 0) {
	//if (Date.now() - lastBuildTime < 30*1000) {
		console.log(red, 'quit !');
		return;
	}
	if (!fs.existsSync(uqAppSrcPath)) {
		fs.mkdirSync(uqAppSrcPath);
	}
	let tsAppName = buildTsAppName(options);
	saveTsFile(uqAppSrcPath, 'appName', tsAppName);
	let tsAppConfig = buildTsAppConfig(options);
	saveTsFileIfNotExists(uqAppSrcPath, 'appConfig', tsAppConfig);
	let tsIndex = buildTsIndex();
	saveTsFile(uqAppSrcPath, 'index', tsIndex);
	let tsCApp = buildTsCApp();
	saveTsFileIfNotExists(uqAppSrcPath, 'CApp', tsCApp);
	let tsCBase = buildTsCBase();
	saveTsFile(uqAppSrcPath, 'CBase', tsCBase);
	let tsVMain = buildTsVMain();
	saveTsFileIfNotExists(uqAppSrcPath, 'VMain', tsVMain, 'tsx');

	saveTsFile(uqAppSrcPath, 'uqs', '');
	fs.unlinkSync(uqAppSrcPath + '/uqs.ts');
	await buildUqsFolder(uqAppSrcPath + '/uqs', options);
};

function saveTsFileIfNotExists(uqAppSrcPath:string, fileName:string, content:string, suffix:string = 'ts') {
	let tsFile = `${uqAppSrcPath}/${fileName}.${suffix}`;
	if (fs.existsSync(tsFile) === true) return;
	saveTsFile(uqAppSrcPath, fileName, content, suffix);
}
function saveTsFile(uqAppSrcPath:string, fileName:string, content:string, suffix:string = 'ts') {
	let srcFile = `${uqAppSrcPath}/${fileName}.${suffix}.txt`;
	let tsFile = `${uqAppSrcPath}/${fileName}.${suffix}`;
	if (!fs.existsSync(srcFile)) {
		if (fs.existsSync(tsFile)) {
			fs.renameSync(tsFile, srcFile);
		}
	}
	fs.writeFileSync(tsFile, content);
	lastBuildTime = Date.now();
	console.log(red, `${tsFile} is built`);
}
function overrideTsFile(uqAppSrcPath:string, fileName:string, content:string, suffix:string = 'ts') {
	let tsFile = `${uqAppSrcPath}/${fileName}.${suffix}`;
	fs.writeFileSync(tsFile, content);
	lastBuildTime = Date.now();
	console.log(red, `${tsFile} is built`);
}
function buildTsHeader() {
	return `//=== UqApp builder created on ${new Date()} ===//`;
}
function buildTsAppName(options: UqAppOptions):string {
	let {uqAppName, appName} = options;
	return `${buildTsHeader()}
export const appName = '${uqAppName || appName}';
`;
}
function buildTsAppConfig(options: UqAppOptions):string {
	let {version, noUnit, tvs, oem, htmlTitle} = options;
	function toString(s:string) {
		if (s === undefined) return;
		if (s === null) return null;
		return `'${s}'`;
	}
	return `${buildTsHeader()}
import { AppConfig } from "tonva";
import { appName } from "./appName";

export const appConfig: AppConfig = {
    appName: appName,
	version: ${toString(version)},
	noUnit: ${noUnit},
    tvs: ${JSON.stringify(tvs)},
	oem: ${toString(oem)},
	htmlTitle: ${toString(htmlTitle)},
};
`;
}
function buildTsIndex():string {
	return `${buildTsHeader()}
export { appConfig } from './appConfig';
export { CUqApp, CUqBase, CUqSub } from './CBase';
export { CApp } from './CApp';
export * from './uqs';
`;
}
function buildTsCApp():string {
	return `${buildTsHeader()}
import { CUqApp } from "./CBase";
import { VMain } from "./VMain";

export class CApp extends CUqApp {
	protected async internalStart(isUserLogin: boolean) {
		this.openVPage(VMain, undefined, this.dispose);
	}
}
`;	
}
function buildTsCBase():string {
	return `${buildTsHeader()}
import { CSub, CBase, CAppBase, IConstructor } from 'tonva';
import { UQs } from './uqs';
import { CApp } from './CApp';

export abstract class CUqBase extends CBase {
	get cApp(): CApp { return this._cApp; }
	protected get uqs(): UQs { return this._uqs as UQs };
}

export abstract class CUqSub<T extends CUqBase> extends CSub<T> {
	get cApp(): CApp { return this._cApp; }
	protected get uqs(): UQs { return this._uqs as UQs };
	get owner(): T { return this._owner as T }
}

export abstract class CUqApp extends CAppBase {
	get uqs(): UQs { return this._uqs };

	protected newC<T extends CUqBase>(type: IConstructor<T>): T {
		let c = new type(this);
		c.init();
		return c;
	}
}
`;
}
function buildTsVMain() {
	return `${buildTsHeader()}
import { VPage, Page } from 'tonva';
import { CApp } from './CApp';

export class VMain extends VPage<CApp> {
	async open(param?: any, onClosePage?: (ret:any)=>void) {
		this.openPage(this.render, param, onClosePage);
	}

	render = (param?: any): JSX.Element => {
		return <Page header="TEST">
			<div className="m-3">
				<div>{this.renderMe()}</div>
				<div className="mb-5">同花样例主页面</div>
			</div>
		</Page>;
	}
}
`;
}

async function buildUqsFolder(uqsFolder:string, options: UqAppOptions) {
	await uqAppStart(options);

	let uqsMan = UQsMan.value;
	let coll = uqsMan.getUqCollection();
	
	let promiseArr:Promise<void>[] = [];
	let uqs:UqMan[] = [];
	for (let i in coll) {
		let lowerI = i.toLowerCase();
		if (lowerI !== i) continue;
		uqs.push(coll[i]);
	}
	
	if (!uqsMan.id) {
		let error = options.uqAppName + ' not defined!';
		throw new Error(error);
	}

	for (let uq of uqs) {
		promiseArr.push(loadUqEntities(uq));
	}
	await Promise.all(promiseArr);

	if (!fs.existsSync(uqsFolder)) {
		fs.mkdirSync(uqsFolder);
	}
	let tsUqsIndexHeader = buildTsHeader();
	let tsUqsIndexContent = `\n\nexport interface UQs {`;
	let tsUqsExports = '\n\n';
	for (let uq of uqs) {
		let {uqOwner, uqName} = uq;
		let o1 = getUqOwnerName(uqOwner);
		let n1 = getUqName(uqName);
		let tsUq = buildTsUq(uq);
		overrideTsFile(uqsFolder, o1+n1, tsUq);
		tsUqsIndexHeader += `\nimport { ${o1}${n1} } from './${o1}${n1}';`;
		tsUqsIndexContent += `\n\t${o1}${n1}: ${o1}${n1}.Uq${o1}${n1};`;
		tsUqsExports += `\nexport type {${o1}${n1}} from './${o1}${n1}';`;
	}

	overrideTsFile(uqsFolder, 'index', 
		tsUqsIndexHeader + tsUqsIndexContent + '\n}' + tsUqsExports + '\n');
}

function buildTsUq(uq: UqMan) {
	let ret = buildTsHeader();
	ret += '\nimport { UqTuid, UqQuery, UqAction, UqSheet/*, Map, Tag*/ } from "tonva";';

	//for (let uq of uqs) {
		ret += '\n';
		ret += '\n//===============================';
		ret += `\n//======= UQ ${uq.name} ========`;
		ret += '\n//===============================';
		ret += '\n';
		ret += buildUQ(uq);
		ret += '\n';
		ret += '\n';
	//}
	/*
	ret += '\n//===============================';
	ret += `\n//============= UQs =============`;
	ret += '\n//===============================';
	ret += '\nexport interface UQs {';
	for (let uq of uqs) {
		let {uqOwner, uqName} = uq;
		let o1 = getUqOwnerName(uqOwner);
		let n1 = getUqName(uqName);
		ret += `\n\t${o1}${n1}: ${o1}${n1}.Uq;`;
	}
	ret += '\n}\n';
	*/
	return ret;
}

function capitalCaseString(s:string):string {
	let parts = s.split(/[-._]/);
	return parts.map(v => firstCharUppercase(v)).join('');
}

function camelCaseString(s:string):string {
	let parts = s.split(/[-._]/);
	let len = parts.length;
	parts[0] = firstCharLowercase(parts[0]);
	for (let i=1; i<len; i++) {
		parts[1] = firstCharUppercase(parts[1]);
	}
	return parts.join('');
}
function entityName(s:string):string {
	return capitalCaseString(s);
}

function getUqOwnerName(uqOwner:string) {
	let uo = gUqOwnerMap[uqOwner.toLowerCase()];
	if (uo === undefined) return '';
	if (uo.length === 0) return '';
	return capitalCaseString(uo);
}

function getUqName(uqName:string) {
	return capitalCaseString(uqName);
}

function uqBlock<T extends Entity>(entity: T, build: (entity: T)=>string) {
	let {name} = entity;
	if (name.indexOf('$') > 0) return '';
	let entityCode = build(entity);
	if (!entityCode) return '';
	return '\n' + entityCode;
}

function uqEntityInterface<T extends Entity>(entity: T, buildInterface: (entity: T)=>string) {
	let {name} = entity;
	if (name.indexOf('$') > 0) return '';
	let entityCode = buildInterface(entity);
	if (!entityCode) return '';
	//return uqFirstLine(entity) + 
	return '\n' + entityCode + '\n';
}

const aCode = 'a'.charCodeAt(0);
const zCode = 'z'.charCodeAt(0);
function firstCharUppercase(s:string) {
	if (!s) return '';
	let c = s.charCodeAt(0);
	if (c >= aCode && c <= zCode) {
		return String.fromCharCode(c - 0x20) + s.substr(1);
	}
	return s;
}
const ACode = 'A'.charCodeAt(0);
const ZCode = 'Z'.charCodeAt(0);
function firstCharLowercase(s:string) {
	if (!s) return '';
	let c = s.charCodeAt(0);
	if (c >= ACode && c <= ZCode) {
		return String.fromCharCode(c + 0x20) + s.substr(1);
	}
	return s;
}

async function loadUqEntities(uq:UqMan):Promise<void> {
	await uq.loadAllSchemas();
	/*
	let arr: Promise<any>[] = [];
    uq.actionArr.forEach(v => arr.push(v.loadSchema()));
    uq.enumArr.forEach(v => arr.push(v.loadSchema()));
    uq.sheetArr.forEach(v => arr.push(v.loadSchema()));
    uq.queryArr.forEach(v => arr.push(v.loadSchema()));
    uq.bookArr.forEach(v => arr.push(v.loadSchema()));
    uq.mapArr.forEach(v => arr.push(v.loadSchema()));
    uq.historyArr.forEach(v => arr.push(v.loadSchema()));
    uq.pendingArr.forEach(v => arr.push(v.loadSchema()));
	uq.tagArr.forEach(v => arr.push(v.loadSchema()));
	await Promise.all(arr);
	*/
}

function buildUQ(uq:UqMan) {
	let {uqOwner, uqName} = uq;
	let ts:string = `export namespace ${getUqOwnerName(uqOwner)}${getUqName(uqName)} {`;
	uq.tuidArr.forEach(v => ts += uqEntityInterface<Tuid>(v, buildTuidInterface));
    uq.actionArr.forEach(v => ts += uqEntityInterface<Action>(v, buildActionInterface));
    uq.enumArr.forEach(v => ts += uqEntityInterface<UqEnum>(v, buildEnumInterface));
    uq.sheetArr.forEach(v => ts += uqEntityInterface<Sheet>(v, buildSheetInterface));
    uq.queryArr.forEach(v => ts += uqEntityInterface<Query>(v, buildQueryInterface));
    uq.bookArr.forEach(v => ts += uqEntityInterface<Book>(v, buildBookInterface));
    uq.mapArr.forEach(v => ts += uqEntityInterface<Map>(v, buildMapInterface));
    uq.historyArr.forEach(v => ts += uqEntityInterface<History>(v, buildHistoryInterface));
    uq.pendingArr.forEach(v => ts += uqEntityInterface<Pending>(v, buildPendingInterface));
	uq.tagArr.forEach(v => ts += uqEntityInterface<Tag>(v, buildTagInterface));

	ts += `\n\nexport interface Uq${getUqOwnerName(uqOwner)}${getUqName(uqName)} {`;
	uq.tuidArr.forEach(v => ts += uqBlock<Tuid>(v, buildTuid));
    uq.actionArr.forEach(v => ts += uqBlock<Action>(v, buildAction));
    //uq.enumArr.forEach(v => ts += uqBlock<UqEnum>(v, buildEnum));
    uq.sheetArr.forEach(v => ts += uqBlock<Sheet>(v, buildSheet));
    uq.queryArr.forEach(v => ts += uqBlock<Query>(v, buildQuery));
    uq.bookArr.forEach(v => ts += uqBlock<Book>(v, buildBook));
    uq.mapArr.forEach(v => ts += uqBlock<Map>(v, buildMap));
    uq.historyArr.forEach(v => ts += uqBlock<History>(v, buildHistory));
    uq.pendingArr.forEach(v => ts += uqBlock<Pending>(v, buildPending));
	uq.tagArr.forEach(v => ts += uqBlock<Tag>(v, buildTag));
	ts += '\n}\n}\n';
	return ts;
}

function buildFields(fields: Field[], indent:number = 1) {
	if (!fields) return;
	let ts = '';
	for (let f of fields) {
		ts += buildField(f, indent);
	}
	return ts;
}

const fieldTypeMap:{[type:string]:string} = {
	"char": "string",
	"text": "string",
	"id": "number",
	"int": "number",
	"bigint": "number",
	"smallint": "number",
	"tinyint": "number",
};
function buildField(field: Field, indent:number = 1) {
	let {type} = field;
	let s = fieldTypeMap[type];
	if (!s) s = 'any';
	return `\n${'\t'.repeat(indent)}${field.name}: ${s};`;
}

function buildArrs(arrFields: ArrFields[]):string {
	if (!arrFields) return '';
	let ts = '\n';
	for (let af of arrFields) {
		ts += `\t${camelCaseString(af.name)}: {`;
		ts += buildFields(af.fields, 2);
		ts += '\n\t}[];\n';
	}
	return ts;
}

const typeMap:{[type:string]:string} = {
	action: 'Action',
	query: 'Query',
}
function buildReturns(entity:Entity, returns:ArrFields[]):string {
	if (!returns) return;
	//let {typeName} = entity;
	//let type = typeMap[typeName] || typeName;
	let {sName} = entity;
	sName = capitalCaseString(sName);
	let ts = '';
	for (let ret of returns) {
		let retName = capitalCaseString(ret.name);
		ts += `interface Return${sName}${retName} {`;
		ts += buildFields(ret.fields);
		ts += '\n}\n';
	}

	ts += `interface Result${sName} {\n`;
	for (let ret of returns) {
		let retName = capitalCaseString(ret.name);
		ts += `\t${ret.name}: Return${sName}${retName}[];\n`;
	}
	ts += '}';
	return ts;
}

function buildTuid(tuid: Tuid) {
	let ts = `\t${entityName(tuid.sName)}: UqTuid<Tuid${capitalCaseString(tuid.sName)}>;`;
	return ts;
}

function buildTuidInterface(tuid: Tuid) {
	let ts = `export interface Tuid${capitalCaseString(tuid.sName)} {`;
	ts += buildFields(tuid.fields);
	ts += '\n}';
	return ts;
}

function buildAction(action: Action) {
	let ts = `\t${entityName(action.sName)}: UqAction<Param${capitalCaseString(action.sName)}, Result${capitalCaseString(action.sName)}>;`;
	return ts;
}

function buildActionInterface(action: Action) {
	let ts = `export interface Param${capitalCaseString(action.sName)} {`;
	ts += buildFields(action.fields);
	ts += buildArrs(action.arrFields);
	ts += '\n}\n';
	ts += buildReturns(action, action.returns);
	return ts;
}

function buildEnumInterface(enm: UqEnum) {
	let {schema} = enm;
	if (!schema) return;
	let {values} = schema;
	let ts = `export enum Uq${capitalCaseString(enm.sName)} {`;
	let first:boolean = true;
	for (let i in values) {
		if (first === false) {
			ts += ',';
		}
		else {
			first = false;
		}
		let v = values[i];
		ts += '\n\t' + i + ' = ';
		if (typeof v === 'string') {
			ts += '"' + v + '"';
		}
		else {
			ts += v;
		}
	}
	return ts += '\n};'
}

function buildQuery(query: Query) {
	let {sName} = query;
	let ts = `\t${entityName(sName)}: UqQuery<Param${capitalCaseString(sName)}, Result${capitalCaseString(sName)}>;`;
	return ts;
}

function buildQueryInterface(query: Query) {
	let ts = `export interface Param${capitalCaseString(query.sName)} {`;
	ts += buildFields(query.fields);
	ts += '\n}\n';
	ts += buildReturns(query, query.returns);
	return ts;
}

function buildSheet(sheet: Sheet) {
	let {sName, verify} = sheet;
	let cName = capitalCaseString(sName);
	let v = verify? `Verify${cName}` : 'any';
	let ts = `\t${entityName(sName)}: UqSheet<Sheet${cName}, ${v}>;`;
	return ts;
}

function buildSheetInterface(sheet: Sheet) {
	let {sName, fields, arrFields, verify} = sheet;
	let ts = `export interface Sheet${capitalCaseString(sName)} {`;
	ts += buildFields(fields);
	ts += buildArrs(arrFields);
	ts += '}';

	if (verify) {
		let {returns} = verify;
		ts += `\nexport interface Verify${capitalCaseString(sName)} {`;
		for (let item of returns) {
			let {name:arrName, fields} = item;
			ts += '\n\t' + arrName + ': {';
			ts += buildFields(fields, 2);
			ts += '\n\t}[];';
		}
		ts += '\n}';
	}
	return ts;
}

function buildBook(book: Book):string {
	return;
}

function buildBookInterface(book: Book):string {
	return;
}

function buildMap(map: Map):string {
	return;
}

function buildMapInterface(map: Map):string {
	return;
}

function buildHistory(history: History):string {
	return;
}

function buildHistoryInterface(history: History):string {
	return;
}

function buildPending(pending: Pending):string {
	return;
}

function buildPendingInterface(pending: Pending):string {
	return;
}

function buildTag(tag: Tag):string {
	return;
}

function buildTagInterface(tag: Tag):string {
	return;
}
