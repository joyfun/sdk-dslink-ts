import { ClientLink, ECDH } from "../common/interfaces";
import { Completer } from "../utils/async";
import { Requester } from "../requester/requester";
import { WebSocketConnection } from "./websocket_conn";
import { Responder } from "../responder/responder";
import { PrivateKey } from "../crypto/pk";
export declare class HttpClientLink extends ClientLink {
    _onReadyCompleter: Completer<[Requester, Responder]>;
    readonly onReady: Promise<[Requester, Responder]>;
    remotePath: string;
    readonly dsId: string;
    readonly privateKey: PrivateKey;
    tokenHash: string;
    requester: Requester;
    responder: Responder;
    useStandardWebSocket: boolean;
    readonly strictTls: boolean;
    _nonce: ECDH;
    readonly nonce: ECDH;
    _wsConnection: WebSocketConnection;
    salt: string;
    updateSalt(salt: string): void;
    _wsUpdateUri: string;
    _conn: string;
    linkData: {
        [key: string]: any;
    };
    formats: string[];
    format: string;
    constructor(conn: string, dsIdPrefix: string, privateKey: PrivateKey, options?: {
        isRequester: boolean;
        isResponder: boolean;
        token?: string;
        linkData?: {
            [key: string]: any;
        };
        format?: string[] | string;
    });
    _connDelay: number;
    _connDelayTimer: any;
    connDelay(): void;
    connect(): Promise<void>;
    _wsDelay: number;
    _wsDelayTimer: any;
    reconnectWSCount: number;
    initWebsocket(reconnect?: boolean): Promise<void>;
    _closed: boolean;
    close(): void;
}