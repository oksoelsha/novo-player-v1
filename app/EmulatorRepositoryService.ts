import * as path from 'path';
import * as fs from 'fs';
import { PlatformUtils } from './utils/PlatformUtils';
import { UpdateListerner } from './UpdateListerner';
import { SettingsService } from './SettingsService';
import { XMLParser } from 'fast-xml-parser';

export class EmulatorRepositoryService implements UpdateListerner {

    private repositoryInfo: Map<string, RepositoryData>;

    constructor(private settingsService: SettingsService) {
        settingsService.addListerner(this);
        this.init();
    }

    getRepositoryInfo(): Map<string, RepositoryData> {
        return this.repositoryInfo;
    }

    reinit(): void {
        this.init();
    }

    private init(): void {
        const self = this;
        const gamesDataMap: Map<string, RepositoryData> = new Map<string, RepositoryData>();
        const softwaredbFilenames: string[] = [
            PlatformUtils.getOpenmsxSoftwareDb(this.settingsService.getSettings().openmsxPath),
            path.join(__dirname, 'extra/msxdskdb.xml'),
            path.join(__dirname, 'extra/msxcaswavdb.xml')
        ];
        const parser = new XMLParser();
        /*
        let options = {
            parseTrueNumberOnly: true,
            tagValueProcessor: (val: any, tagName: any) => val.replace(/&amp;/g, '&').replace(/&#34;/g, '"').replace(/&#38;/g, '&').replace(/&#39;/g, "'")
        }
        */
        for(const softwaredbFilename of softwaredbFilenames) {
            if (fs.existsSync(softwaredbFilename)) {
                fs.readFile(softwaredbFilename, function (err, data) {
                    let result = parser.parse(data.toString());
                    for (const s in result.softwaredb.software) {
                        let software = result.softwaredb.software;

                        if (Object.prototype.toString.call(software[s].dump) === '[object Array]') {
                            for (const y in software[s].dump) {
                                self.processDump(software[s], software[s].dump[y], gamesDataMap);
                            }
                        } else {
                            self.processDump(software[s], software[s].dump, gamesDataMap);
                        }
                    }
                });
            }
        }
        this.repositoryInfo = gamesDataMap;
    }

    private processDump(software: any, dump: any, gamesDataMap: Map<string, RepositoryData>): void {
        if (dump.hasOwnProperty('rom')) {
            const repositoryData = new RepositoryData(software.title, software.system, software.company,
                software.year, software.country);

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

            gamesDataMap.set(dump.rom.hash, repositoryData);
        }
        if (dump.hasOwnProperty('megarom')) {
            const repositoryData = new RepositoryData(software.title, software.system, software.company,
                software.year, software.country);

            if (dump.hasOwnProperty('original')) {
                repositoryData.setDump(dump.original);
            }

            repositoryData.setMapper(dump.megarom.type);

            if (dump.megarom.hasOwnProperty('remark')) {
                repositoryData.setRemark(dump.megarom.remark);
            }

            gamesDataMap.set(dump.megarom.hash, repositoryData);
        }
        if (dump.hasOwnProperty('dsk')) {
            const repositoryData = new RepositoryData(software.title, software.system, software.company,
                software.year, software.country);

            if (dump.dsk.hasOwnProperty('remark')) {
                repositoryData.setRemark(dump.dsk.remark.text);
            }

            gamesDataMap.set(dump.dsk.format.hash, repositoryData);
        }
        if (dump.hasOwnProperty('cas')) {
            const repositoryData = new RepositoryData(software.title, software.system, software.company,
                software.year, software.country);

            if (dump.cas.hasOwnProperty('remark')) {
                repositoryData.setRemark(dump.cas.remark.text);
            }

            if (dump.cas.hasOwnProperty('start')) {
                repositoryData.setStart(dump.cas.start.text);
            }

            for (const f in dump.cas.format) {
                gamesDataMap.set(dump.cas.format[f].hash, repositoryData);
            }
        }
    }
}

export class RepositoryData {
    title: string;
    system: string;
    company: string;
    year: string;
    country: string;

    dump: string;
    mapper: string;
    start: string;
    remark: string;

    constructor(title: string, system: string, company: string, year: string, country: string) {
        this.title = title;
        this.system = system;
        this.company = company;
        this.year = year;
        this.country = country;
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
