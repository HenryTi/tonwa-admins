import { DevService, DevUQ } from "model";

export interface UqActionProps {
    uq: DevUQ;
    action?: 'upload' | 'test' | 'deploy' | 'source';
    services: DevService[];
}
