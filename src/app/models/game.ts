export class Game {
    name: string;
    sha1Code: string;
    size: number;
    machine: string;

    romA: string;
    romB: string;
    extensionRom: string;
    extensionRom2: string;
    diskA: string;
    diskB: string;
    tape: string;
    harddisk: string;
    laserdisc: string;

    title: string;
    system: string;
    company: string;
    year: string;
    country: string;
    dump: string;
    mapper: string;
    start: string;
    remark: string;
    knownDumps: number;

    generationMSXId: number;
    generations: number;
    sounds: number;
    genre1: number;
    genre2: number;
    screenshotSuffix: string;

    listing: string;

    fddMode: number;
    inputDevice: number;
    connectGFX9000: boolean;

    favorite: boolean;

    infoFile: string;

    bluemsxArguments: string;
    bluemsxOverrideSettings: boolean;

    webmsxMachine: number;

    emuliciousArguments: string;
    emuliciousOverrideSettings: boolean;

    public readonly MASK_GENERATION_MSX = 1;
    public readonly MASK_GENERATION_MSX2 = 2;
    public readonly MASK_GENERATION_MSX2PLUS = 4;
    public readonly MASK_GENERATION_TURBO_R = 8;

    public readonly MASK_SOUND_PSG = 1;
    public readonly MASK_SOUND_SCC = 2;
    public readonly MASK_SOUND_SCC_I = 4;
    public readonly MASK_SOUND_PCM = 8;
    public readonly MASK_SOUND_MSX_MUSIC = 16;
    public readonly MASK_SOUND_MSX_AUDIO = 32;
    public readonly MASK_SOUND_MOONSOUND = 64;
    public readonly MASK_SOUND_MIDI = 128;

    constructor(name: string, sha1Code: string, size: number) {
        this.name = name;
        this.sha1Code = sha1Code;
        this.size = size;
    }

    setMachine(machine: string) {
        this.machine = machine;
    }

    setRomA(romA: string) {
        this.romA = romA;
    }

    setRomB(romB: string) {
        this.romB = romB;
    }

    setExtensionRom(extensionRom: string) {
        this.extensionRom = extensionRom;
    }

    setExtensionRom2(extensionRom: string) {
        this.extensionRom2 = extensionRom;
    }

    setDiskA(diskA: string) {
        this.diskA = diskA;
    }

    setDiskB(diskB: string) {
        this.diskB = diskB;
    }

    setTape(tape: string) {
        this.tape = tape;
    }

    setHarddisk(harddisk: string) {
        this.harddisk = harddisk;
    }

    setLaserdisc(laserdisc: string) {
        this.laserdisc = laserdisc;
    }

    setGenerationMSXId(generationMSXId: number) {
        this.generationMSXId = generationMSXId;
    }

    setTitle(title: string) {
        this.title = title;
    }

    setSystem(system: string) {
        this.system = system;
    }

    setCompany(company: string) {
        this.company = company;
    }

    setYear(year: string) {
        this.year = year;
    }

    setCountry(country: string) {
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

    setKnownDumps(knownDumps: number) {
        this.knownDumps = knownDumps;
    }

    setScreenshotSuffix(screenshotSuffix: string) {
        this.screenshotSuffix = screenshotSuffix;
    }

    setGenerations(generations: number) {
        this.generations = generations;
    }

    setSounds(sounds: number) {
        this.sounds = sounds;
    }

    setGenre1(genre1: number) {
        this.genre1 = genre1;
    }

    setGenre2(genre2: number) {
        this.genre2 = genre2;
    }

    setListing(listing: string) {
        this.listing = listing;
    }

    setFddMode(fddMode: number) {
        this.fddMode = fddMode;
    }

    setInputDevice(inputDevice: number) {
        this.inputDevice = inputDevice;
    }

    setConnectGFX9000(connectGFX9000: boolean) {
        this.connectGFX9000 = connectGFX9000;
    }

    setFavorite(flag: boolean) {
        this.favorite = flag;
    }

    setInfoFile(infoFile: string) {
        this.infoFile = infoFile;
    }

    setBluemsxArguments(bluemsxArguments: string) {
        this.bluemsxArguments = bluemsxArguments;
    }

    setBluemsxOverrideSettings(flag: boolean) {
        this.bluemsxOverrideSettings = flag;
    }

    setWebmsxMachine(machine: number) {
        this.webmsxMachine = machine;
    }

    setEmuliciousArguments(emuliciousArguments: string) {
        this.emuliciousArguments = emuliciousArguments;
    }

    setEmuliciousOverrideSettings(flag: boolean) {
        this.emuliciousOverrideSettings = flag;
    }
}
