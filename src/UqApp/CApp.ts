import { CAppBase, IConstructor } from "tonva";
import 'bootstrap/dist/css/bootstrap.css';
import { CUqBase } from "./CBase";
//import { VMain } from './tonvaApp/main';
//import { CMe } from "me/CMe";
import { CHome } from "Home";

export class CApp extends CAppBase {
    cHome: CHome;

    protected newC<T extends CUqBase>(type: IConstructor<T>): T {
        return new type(this);
    }

    protected async internalStart() {
        this.cHome = this.newC(CHome);
        this.cHome.start();
    }
}
