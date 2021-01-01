import { env } from './env';

export class LocalData {
    user = env.localDb.child('user');
    guest = env.localDb.child('guest');
    unit = env.localDb.child('unit');

    private _user:string;
    private _guest:string;
    private _unit:string;
    readToMemory() {
        this._user = this.user.get();
        this._guest = this.guest.get();
        this._unit = this.unit.get();
    }
    saveToLocalStorage() {
        this.user.set(this._user);
        this.guest.set(this._guest);
        this.unit.set(this._unit);
    }

    logoutClear() {
        [
            this.user,
            this.unit,
        ].forEach(d => d.remove());
    }
}
