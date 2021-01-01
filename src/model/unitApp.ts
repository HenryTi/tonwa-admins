export interface Role {
    id: number;
    name: string;
    discription: string;
    count: number;
}

export interface RoleMember {
    id: number;
    name: string;
    nick: string;
    icon: string;
    assigned: string;
}