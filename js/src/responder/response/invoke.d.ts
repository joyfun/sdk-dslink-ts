import { Response } from "../response";
import { LocalNode } from "../node_state";
import { Responder } from "../responder";
import { DSError } from "../../common/interfaces";
export declare type OnInvokeClosed = (response: InvokeResponse) => void;
export declare type OnInvokeSend = (response: InvokeResponse, m: any) => void;
export declare type OnReqParams = (resp: InvokeResponse, m: any) => boolean;
declare class InvokeResponseUpdate {
    status: string;
    columns: any[];
    updates: any[];
    meta: {
        [key: string]: any;
    };
    constructor(status: string, updates: any[], columns: any[], meta: {
        [key: string]: any;
    });
}
export declare class InvokeResponse extends Response {
    readonly parentNode: LocalNode;
    readonly node: LocalNode;
    readonly name: string;
    constructor(responder: Responder, rid: number, parentNode: LocalNode, node: LocalNode, name: string);
    pendingData: InvokeResponseUpdate[];
    _hasSentColumns: boolean;
    updateStream(updates: any[], options?: {
        columns?: any[];
        streamStatus?: string;
        meta?: {
            [key: string]: any;
        };
        autoSendColumns?: boolean;
    }): void;
    onReqParams: OnReqParams;
    updateReqParams(m: any): void;
    startSendingData(currentTime: number, waitingAckId: number): void;
    close(err?: DSError): void;
    _err: DSError;
    onClose: OnInvokeClosed;
    onSendUpdate: OnInvokeSend;
    _close(): void;
}
export {};