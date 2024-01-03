import * as fs from 'fs';
import * as net from 'net';
import { htonl, ntohl } from 'network-byte-order';
import * as NES from 'node-expose-sspi';
import { SecBufferDesc } from 'node-expose-sspi';
import * as os from 'os';
import * as path from 'path';
import { PlatformUtils } from './utils/PlatformUtils';
import { OpenMSXConnectionManager } from './OpenMSXConnectionManager';
//import { XMLParser } from 'fast-xml-parser';

// This class was based on the following implementation:
// https://github.com/S0urceror/DeZog/blob/v1.3.5/src/remotes/openmsx/openmsxremote.ts
export class OpenMSXConnector {
	openmsx: net.Socket;
	pid: number;
	connected: boolean;

	constructor(pid: number, private connectionManager: OpenMSXConnectionManager) {
		this.pid = pid;
		this.connected = false;
	}

	async connect(): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			try {
				this.openmsx = await this.connectOpenMSX();
				this.connected = true;
			} catch (error) {
				reject();
			}
	
			this.openmsx.on('timeout', () => {
			});
			this.openmsx.on('error', err => {
			});
			this.openmsx.on('close', () => {
				this.connected = false;
			});

			if (PlatformUtils.isWindows()) {
				await this.authorize();
			}

			this.openmsx.write('<openmsx-control>', cb => {
				resolve();
			});	
		});
	}

	async sendCommand(cmd: string): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this.openmsx.write('<command>' + cmd + '</command>', (err) => {
				resolve();
			});
		});
	}

	disconnect() {
		if (this.connected) {
			this.openmsx.destroy();
			this.connected = false;
		}
	}

	private async connectOpenMSX(): Promise<net.Socket> {
		return new Promise<net.Socket>(async (resolve, reject) => {
			try {
				let username: string;
				if (PlatformUtils.isWindows()) {
					username = 'default';
				} else {
					username = os.userInfo().username;
				}

				let folder = path.join(os.tmpdir(), 'openmsx-' + username);
				let socketpath: string = path.join(folder, 'socket.' + this.pid);
				if (!PlatformUtils.isWindows()) {
					const client = net.createConnection(socketpath);
					var timer = setTimeout(() => {
						client.destroy();
						reject(new Error(`Timeout connecting to OpenMSX`));
					}, 15000);
					client.on('connect', () => {
						clearTimeout(timer);
						resolve(client);
					});
					client.on('error', (err: Error) => {
						try {
							fs.unlinkSync(socketpath);
						} catch (er) {
							//ignore
						}
					});
				} else {
					let ports: Buffer = fs.readFileSync(socketpath);
					let port = Number.parseInt(ports.toString());
					const client = net.createConnection(port);
					var timer = setTimeout(() => {
						client.destroy();
						reject(new Error(`Timeout connecting to OpenMSX:${port}`));
					}, 15000);
					client.on('connect', () => {
						clearTimeout(timer);
						resolve(client);
					});
					client.on('error', (err: Error) => {
						try {
							fs.unlinkSync(socketpath);
						} catch (er) {
							//ignore
						}
					});
				}
			} catch {
				reject(new Error('Error connecting to OpenMSX'));
			}
		});
	}

	private async waitResponse(): Promise<ArrayBuffer> {
		return new Promise<ArrayBuffer>(async (resolve, reject) => {
			this.openmsx.once('readable', () => {
				let buflen: Buffer;
				while (null == (buflen = this.openmsx.read(4))) { };
				let len: number = ntohl(buflen, 0);
				let chunk: Buffer;
				while (null == (chunk = this.openmsx.read(len))) { };
				if (len != chunk.byteLength) {
					reject(new Error(`Not the expected length ${len}:${chunk.byteLength}`));
				}
				resolve(chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength));
			});
		})
	}

	private async authorize(): Promise<boolean> {
		return new Promise<boolean>(async (resolve, reject) => {
			// This library can only be installed through npm using node version 14 (used 14.17.5). Installing it
			// using node 16.x did not work (error messages were about needing Python, Micrsoft Studio tools, and
			// even with that it didn't work in the end)
			const nes = require('node-expose-sspi');
			
			const credInput = {
				packageName: 'Negotiate',
				credentialUse: 'SECPKG_CRED_OUTBOUND' as NES.CredentialUseFlag,
			} as NES.AcquireCredHandleInput;

			const clientCred = nes.sspi.AcquireCredentialsHandle(credInput);
			const packageInfo = nes.sspi.QuerySecurityPackageInfo('Negotiate');

			// Challenge
			var input: NES.InitializeSecurityContextInput = {
				credential: clientCred.credential,
				targetName: '',
				cbMaxToken: packageInfo.cbMaxToken
			};
			let clientSecurityContext = nes.sspi.InitializeSecurityContext(input);
			if (clientSecurityContext.SECURITY_STATUS !== 'SEC_I_CONTINUE_NEEDED') {
				throw new Error('Authentication error');
			}
			let len: number = clientSecurityContext.SecBufferDesc.buffers[0].byteLength;
			var blen: Uint8Array = new Uint8Array(4);
			htonl(blen, 0, len);
			let buffer: Uint8Array = new Uint8Array(clientSecurityContext.SecBufferDesc.buffers[0]);

			this.openmsx.write(blen);
			this.openmsx.write(buffer);
			let response: ArrayBuffer;
			try {
				response = await this.waitResponse();
			} catch (error) {
				reject(error);
				return;
			}

			// Response
			let secBufferDesc: SecBufferDesc = {
				ulVersion: 0,
				buffers: [response],
			};
			input = {
				credential: clientCred.credential,
				targetName: '',
				SecBufferDesc: secBufferDesc,
				cbMaxToken: packageInfo.cbMaxToken,
				contextHandle: clientSecurityContext.contextHandle,
				targetDataRep: 'SECURITY_NETWORK_DREP',
			};
			clientSecurityContext = nes.sspi.InitializeSecurityContext(input);

			len = clientSecurityContext.SecBufferDesc.buffers[0].byteLength;
			var blen: Uint8Array = new Uint8Array(4);
			htonl(blen, 0, len);
			buffer = new Uint8Array(clientSecurityContext.SecBufferDesc.buffers[0]);

			this.openmsx.write(blen);
			this.openmsx.write(buffer);

			try {
				response = await this.waitResponse();
			} catch (error) {
				reject(error);
				return;
			}
			resolve(true);
		});
	}
}
