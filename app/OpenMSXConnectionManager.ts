import { OpenMSXConnector } from './OpenMSXConnector';
import { XMLParser } from 'fast-xml-parser';

export class OpenMSXConnectionManager {

    private connections: Map<number, OpenMSXConnector> = new Map();

    constructor() {}

    async executeCommand(pid: number, command: string): Promise<any> {
        let connection = this.connections.get(pid);
        if (!connection) {
            connection = await this.initializeConnection(pid);
        }
        return new Promise<any>((resolve, reject) => {
            connection.sendCommand(command);
            connection.openmsx.on('data', buffer => {
                const data = buffer.toString();
                const parser = new XMLParser({
                    ignoreAttributes: false,
                });
                const result = parser.parse(data);
                if (result.reply) {
                    const success = result.reply['@_result'] === 'ok';
                    const content = result.reply['#text'];
                    connection.openmsx.removeAllListeners('data');
                    resolve({ success, content });
                }
            });
        });
    }

    disconnect(pid: number) {
        const connection = this.connections.get(pid);
        if (connection) {
            connection.disconnect();
            this.connections.delete(pid);    
        }
    }

    private async initializeConnection(pid: number): Promise<OpenMSXConnector> {
        const openmsxConnector = new OpenMSXConnector(pid, this);
        await openmsxConnector.connect();
        this.connections.set(pid, openmsxConnector);
        return openmsxConnector;
    }
}
