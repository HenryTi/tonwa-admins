import { CAppBase, IConstructor } from "tonva";
import 'bootstrap/dist/css/bootstrap.css';
import { CUqBase } from "./CBase";
//import { VMain } from './tonvaApp/main';
//import { CMe } from "me/CMe";
import { CHome } from "Home";

export class CApp extends CAppBase {
    //get uqs(): UQs { return this._uqs };

    cHome: CHome;
    //cMe: CMe;
    /*
    cPosts: CPosts;
    cMedia: CMedia;
    cTemplets: CTemplets;
    */

    protected newC<T extends CUqBase>(type: IConstructor<T>): T {
        return new type(this);
    }

    protected async internalStart() {
        this.cHome = this.newC(CHome);
        //this.cMe = this.newC(CMe);
        /*
        this.cPosts = this.newC(CPosts);
        this.cMedia = this.newC(CMedia);
        this.cTemplets = this.newC(CTemplets);
        */
        //this.showMain();
        this.cHome.start();
    }

    /*
    showMain(initTabName?: string) {
        this.openVPage(VMain, initTabName);
    }
    */
}
