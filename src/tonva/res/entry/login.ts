import { Res } from '../res';

export interface LoginRes {
    a: string;
}

export const loginRes: Res<LoginRes> = {
    _: {
        a: 'd',
    }
}
