/** @ignore */
export declare type Listener<T> = (value: T) => void;
/** @ignore */
export declare class Stream<T> {
    /** @ignore */
    _listeners: Set<Listener<T>>;
    /** @ignore */
    _updating: boolean;
    /** @ignore */
    _value: T;
    /** @ignore */
    _cached: boolean;
    /** @ignore */
    _onStartListen: () => void;
    /** @ignore */
    _onAllCancel: () => void;
    /** @ignore */
    _onListen: (listener: Listener<T>) => void;
    /** @ignore */
    _onClose: () => void;
    constructor(onStartListen?: () => void, onAllCancel?: () => void, onListen?: (listener: Listener<T>) => void, cached?: boolean);
    listen(listener: Listener<T>, useCache?: boolean): StreamSubscription<T>;
    unlisten(listener: Listener<T>): void;
    add(val: T): boolean;
    /** @ignore */
    protected _dispatch(): void;
    hasListener(): boolean;
    isClosed: boolean;
    close(): void;
    reset(): void;
}
/** @ignore */
export interface Closable {
    close(): void;
}
export declare class StreamSubscription<T> implements Closable {
    /** @ignore */
    _stream: Stream<T>;
    /** @ignore */
    _listener: Listener<T>;
    /** @ignore */
    constructor(stream: Stream<T>, listener: Listener<T>);
    /**
     * Close the subscription.
     */
    close(): void;
}
/** @ignore */
export declare class Completer<T> {
    _resolve: Function;
    _reject: Function;
    isCompleted: boolean;
    readonly future: Promise<T>;
    complete(val: T): void;
    completeError(val: any): void;
}
/** @ignore */
export declare function sleep(ms?: number): Promise<any>;
