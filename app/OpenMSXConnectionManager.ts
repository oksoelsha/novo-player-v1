import EventEmitter from 'events';
import { OpenMSXConnector } from './OpenMSXConnector';
import { XMLParser } from 'fast-xml-parser';

export class OpenMSXConnectionManager {

    private connections: Map<number, OpenMSXConnector> = new Map();
    private handlers: Map<number, any> = new Map();
    private updateEmitter: EventEmitter;

    constructor() {}

    async executeCommand(pid: number, command: string): Promise<any> {
        let connection = this.connections.get(pid);
        if (!connection) {
            try {
                connection = await this.initializeConnection(pid);
            } catch (error) {
                return null;
            }
        }
        const self = this;
        return new Promise<any>((resolve, reject) => {
            connection.sendCommand(command);
            const handler = this.processReply.bind(null, connection, resolve, self);
            self.handlers.set(pid, handler);
            connection.openmsx.on('data', handler);
        });
    }

    private processReply(connection: OpenMSXConnector, resolve: any, ref: OpenMSXConnectionManager, buffer: any) {
        const data = buffer.toString();
        const parser = new XMLParser({
            ignoreAttributes: false,
        });
        const result = parser.parse(data);
        if (result.reply) {
            const success = result.reply['@_result'] === 'ok';
            const content = result.reply['#text'];
            const handler = ref.handlers.get(connection.pid);
            if (handler) {
                connection.openmsx.off('data', handler);
                ref.handlers.delete(connection.pid);    
            }
            resolve({ success, content });
        }
    }

    disconnect(pid: number) {
        const connection = this.connections.get(pid);
        if (connection) {
            connection.disconnect();
            this.connections.delete(pid);    
        }
    }

    registerEventEmitter(updateEmitter: EventEmitter) {
        this.updateEmitter = updateEmitter;
    }

    private async initializeConnection(pid: number): Promise<OpenMSXConnector> {
        const openmsxConnector = new OpenMSXConnector(pid, this);
        await openmsxConnector.connect();
        this.monitorUpdates(openmsxConnector);
        this.connections.set(pid, openmsxConnector);
        return openmsxConnector;
    }

    private monitorUpdates(openmsxConnector: OpenMSXConnector) {
        openmsxConnector.openmsx.on('data', buffer => {
            const data = buffer.toString();
            const parser = new XMLParser({
                ignoreAttributes: false,
            });
            const result = parser.parse(data);
            if (result.update) {
                const type = result.update['@_type'];
                if (type === 'setting') {
                    const name = result.update['@_name'];
                    const state = result.update['#text'].toString();
                    this.updateEmitter.emit('openmsxUpdate', openmsxConnector.pid, type, name, state);
                }
            }
        });
    }
}
