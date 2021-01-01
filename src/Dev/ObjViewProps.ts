import { DevObjBase } from "model";
import { ObjItems } from "store/dev";
import { Action } from "tonva";
import { FormRow, Step } from "tonva-form";

export interface ObjViewProps<T extends DevObjBase> {
    title: string;
    row: (item:T) => JSX.Element;
    items: () => ObjItems<T>;
    repeated: {name:string; err:string};
    info: new (props:any) => React.Component;
    extraMenuActions?: Action[];
    formRows?: FormRow[];
    steps?: {[step:string]: Step};
    stepHeader?: (step:Step, num:number) => JSX.Element;
    canEdit?: (t:T) => boolean;
};

