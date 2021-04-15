import { Login } from '../components';

export async function createLogin():Promise<Login> {
	let importCLogin = await import('./CLogin');
	return new importCLogin.CLogin(undefined);
}
