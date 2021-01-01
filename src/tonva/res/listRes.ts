import { KeyValueRes, Res } from './res';

export interface ListRes extends KeyValueRes {
    none: string;
}

/*eslint no-template-curly-in-string: 0*/
export const listRes:Res<ListRes> = {
    _: {
        none: '[none]',
    },
    zh: {
        _: {
            none: '[无]',
        }
    },
}
