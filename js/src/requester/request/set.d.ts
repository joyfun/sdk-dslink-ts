import { Requester } from "../requester";
import { Request } from "../Request";
import { Completer } from "../../utils/async";
import { DSError } from "../../common/interfaces";
import { RequesterUpdate, RequestUpdater } from "../interface";
/** @ignore */
export declare class SetController implements RequestUpdater {
    readonly completer: Completer<RequesterUpdate>;
    readonly future: Promise<RequesterUpdate>;
    readonly requester: Requester;
    readonly path: string;
    readonly value: any;
    _request: Request;
    constructor(requester: Requester, path: string, value: any, maxPermission?: number);
    onUpdate(status: string, updates: any[], columns: any[], meta: object, error: DSError): void;
    onDisconnect(): void;
    onReconnect(): void;
}