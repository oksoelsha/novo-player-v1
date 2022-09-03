import * as path from 'path';
import * as fs from 'fs';
import { PlatformUtils } from './utils/PlatformUtils';
import { UpdateListerner } from './UpdateListerner';
import { SettingsService } from './SettingsService';
import { XMLParser } from 'fast-xml-parser';

export class EmulatorRepositoryService implements UpdateListerner {

    private repositoryInfo: Map<string, RepositoryData>;
    private knownDumps: Map<RepositorySoftwareData, number>;

    constructor(private settingsService: SettingsService) {
        settingsService.addListerner(this);
        this.init();
    }

    getRepositoryInfo(): Map<string, RepositoryData> {
        return this.repositoryInfo;
    }

    getKnownDumps(repositoryData: RepositoryData): number {
        return this.knownDumps.get(repositoryData.softwareData);
    }

    reinit(): void {
        this.init();
    }

    private init(): void {
        const self = this;
        this.repositoryInfo = new Map<string, RepositoryData>();
        this.knownDumps = new Map<RepositorySoftwareData, number>();
        const softwaredbFilenames: string[] = [
            PlatformUtils.getOpenmsxSoftwareDb(this.settingsService.getSettings().openmsxPath),
            path.join(__dirname, 'extra/msxdskdb.xml'),
            path.join(__dirname, 'extra/msxcaswavdb.xml')
        ];
        const parser = new XMLParser();
        /*
        const options = {
            parseTrueNumberOnly: true,
            tagValueProcessor: (val: any, tagName: any) => val.replace(/&amp;/g, '&').replace(/&#34;/g, '"').replace(/&#38;/g, '&').replace(/&#39;/g, "'")
        }
        */
        for(const softwaredbFilename of softwaredbFilenames) {
            if (fs.existsSync(softwaredbFilename)) {
                fs.readFile(softwaredbFilename, function (err, data) {
                    const result = parser.parse(data.toString());
                    for (const s in result.softwaredb.software) {
                        const software = result.softwaredb.software;
                        const softwareData = new RepositorySoftwareData(software[s].title, software[s].system,
                            software[s].company, software[s].year, software[s].country);
                        if (Object.prototype.toString.call(software[s].dump) === '[object Array]') {
                            for (const y in software[s].dump) {
                                self.processDump(softwareData, software[s].dump[y]);
                            }
                        } else {
                            self.processDump(softwareData, software[s].dump);
                        }
                    }
                });
            }
        }
    }

    private processDump(softwareData: RepositorySoftwareData, dump: any): void {
        if (dump.hasOwnProperty('rom')) {
            const repositoryData = new RepositoryData(softwareData);

            if (dump.hasOwnProperty('original')) {
                repositoryData.setDump(dump.original);
            }

            if (dump.rom.hasOwnProperty('type')) {
                repositoryData.setMapper(dump.rom.type);
            } else {
                repositoryData.setMapper('Mirrored ROM');
            }

            if (dump.rom.hasOwnProperty('start')) {
                repositoryData.setStart(dump.rom.start);
            }

            if (dump.rom.hasOwnProperty('remark')) {
                repositoryData.setRemark(dump.rom.remark);
            }

            this.updateMaps(dump.rom.hash, repositoryData);
        }
        if (dump.hasOwnProperty('megarom')) {
            const repositoryData = new RepositoryData(softwareData);

            if (dump.hasOwnProperty('original')) {
                repositoryData.setDump(dump.original);
            }

            repositoryData.setMapper(dump.megarom.type);

            if (dump.megarom.hasOwnProperty('remark')) {
                repositoryData.setRemark(dump.megarom.remark);
            }

            this.updateMaps(dump.megarom.hash, repositoryData);
        }
        if (dump.hasOwnProperty('dsk')) {
            const repositoryData = new RepositoryData(softwareData);

            if (dump.dsk.hasOwnProperty('remark')) {
                repositoryData.setRemark(dump.dsk.remark.text);
            }

            this.updateMaps(dump.dsk.format.hash, repositoryData);
        }
        if (dump.hasOwnProperty('cas')) {
            const repositoryData = new RepositoryData(softwareData);

            if (dump.cas.hasOwnProperty('remark')) {
                repositoryData.setRemark(dump.cas.remark.text);
            }

            if (dump.cas.hasOwnProperty('start')) {
                repositoryData.setStart(dump.cas.start.text);
            }

            for (const f in dump.cas.format) {
                this.updateMaps(dump.cas.format[f].hash, repositoryData);
            }
        }
    }

    private updateMaps(hash: string, repositoryData: RepositoryData) {
        this.repositoryInfo.set(hash, repositoryData);

        const count = this.knownDumps.get(repositoryData.softwareData);
        if (count) {
            this.knownDumps.set(repositoryData.softwareData, count + 1);
        } else {
            this.knownDumps.set(repositoryData.softwareData, 1);
        }
    }
}

class RepositorySoftwareData {
    title: string;
    system: string;
    company: string;
    year: string;
    country: string;

    constructor(title: string, system: string, company: string, year: string, country: string) {
        this.title = title;
        this.system = system;
        this.company = company;
        this.year = year;
        this.country = country;
    }
}

export class RepositoryData {
    softwareData: RepositorySoftwareData;

    dump: string;
    mapper: string;
    start: string;
    remark: string;

    constructor(softwareData: RepositorySoftwareData) {
        this.softwareData = softwareData;
    }

    setDump(dump: string) {
        this.dump = dump;
    }

    setMapper(mapper: string) {
        this.mapper = mapper;
    }

    setStart(start: string) {
        this.start = start;
    }

    setRemark(remark: string) {
        this.remark = remark;
    }
}
