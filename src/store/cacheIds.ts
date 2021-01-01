import {CacheIds, User} from 'tonva';
import {Unit, DevUQ, DevApp, DevBus, DevServer} from '../model';
import {mainApi, devApi} from '../api';

class CacheUnits extends CacheIds<Unit> {
    protected async _loadIds(ids:number[]):Promise<Unit[]> {
        return;
    }
    protected async _loadId(id:number):Promise<Unit> {
        return await mainApi.unit(id);
    }
}

class CacheUqs extends CacheIds<DevUQ> {
    protected async _loadIds(ids:number[]):Promise<DevUQ[]> {
        return;
    }
    protected async _loadId(id:number):Promise<DevUQ> {
        return await devApi.uq(id);
    }
}

class CacheApps extends CacheIds<DevApp> {
    protected async _loadIds(ids:number[]):Promise<DevApp[]> {
        return;
    }
    protected async _loadId(id:number):Promise<DevApp> {
        return await devApi.app(id);
    }
}

class CacheBuses extends CacheIds<DevBus> {
    protected async _loadIds(ids:number[]):Promise<DevBus[]> {
        return;
    }
    protected async _loadId(id:number):Promise<DevBus> {
        let ret = await devApi.bus(id);
        return ret;
    }
}

class CacheUsers extends CacheIds<User> {
    protected async _loadIds(ids:number[]):Promise<User[]> {
        return;
    }
    protected async _loadId(id:number):Promise<User> {
        let ret = await mainApi.user(id);
        return ret;
    }
}

class CacheServers extends CacheIds<DevServer> {
    protected async _loadIds(ids:number[]):Promise<DevServer[]> {
        return;
    }
    protected async _loadId(id:number):Promise<DevServer> {
        return await devApi.server(id);
    }
}

class Caches {
    units: CacheUnits;
    uqs: CacheUqs;
    apps: CacheApps;
    buses: CacheBuses;
    servers: CacheServers;
    users: CacheUsers;

    constructor() {
        this.reset();
    }

    reset() {
        this.units = new CacheUnits();
        this.uqs = new CacheUqs();
        this.apps = new CacheApps();
        this.buses = new CacheBuses();
        this.servers = new CacheServers();
        this.users = new CacheUsers();
    }
};

export const caches:Caches = new Caches();
