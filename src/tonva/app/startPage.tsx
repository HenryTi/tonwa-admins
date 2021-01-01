import { AppConfig, CAppBase } from './CAppBase';
import { nav } from '../components';

export async function startPage(CApp: new (config: AppConfig) => CAppBase, appConfig: AppConfig) {
	let {htmlTitle} = appConfig;
	if (htmlTitle) {
		document.title = htmlTitle;
	}
	let html = document.getElementsByTagName('html');
	let html0 = html[0];
	if (html0) {
		let version = html0?.getAttribute('data-version');
		if (version) appConfig.version = version;
	}
	
	nav.setSettings(appConfig);
	//nav.isRouting = true;
	//await nav.init();
	//let {appName, version, tvs} = appConfig;
	//await UQsMan.load(appName, version, tvs);
	//nav.resolveRoute();

	let cApp = new CApp(appConfig);
	cApp.init();
    await cApp.start();
}
