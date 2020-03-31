import {DsError, StreamStatus} from '../common/interfaces';

export interface RequestUpdater {
  onUpdate(status: string, updates: any[], columns: any[], meta: {[key: string]: any}, error: DsError): void;

  onDisconnect(): void;

  onReconnect(): void;
}

export class RequesterUpdate {
  constructor(public streamStatus: StreamStatus, public error?: DsError) {}
}
