export class Game {
    name: string;
    sha1Code: string;
    size: number;
    machine!: string;

    romA: string | undefined;
    romB: string | undefined;
    extensionRom: string | undefined;
    extensionRom2: string | undefined;
    diskA: string | undefined;
    diskB: string | undefined;
    tape: string | undefined;
    harddisk: string | undefined;
    laserdisc: string | undefined;

    title: string | undefined;
    system: string | undefined;
    company: string | undefined;
    year: string | undefined;
    country: string | undefined;
    dump: string | undefined;
    mapper: string | undefined;
    start: string | undefined;
    remark: string | undefined;
    knownDumps!: number | undefined;

    generationMSXId: number | undefined;
    generations: number | undefined;
    sounds: number | undefined;
    genre1: number | undefined;
    genre2: number | undefined;
    screenshotSuffix: string | undefined;
    colecoScreenshot: string | undefined;
    spectravideoScreenshot: string | undefined;
    segaScreenshot: string | undefined;

    listing: string | undefined;

    fddMode: number | undefined;
    inputDevice: number | undefined;
    connectGFX9000: boolean | undefined;

    favorite: boolean | undefined;

    infoFile: string | undefined;

    bluemsxArguments: string | undefined;
    bluemsxOverrideSettings: boolean | undefined;

    webmsxMachine: number | undefined;

    emuliciousArguments: string | undefined;
    emuliciousOverrideSettings: boolean | undefined;

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

    setGenerationMSXId(generationMSXId: number | undefined) {
        this.generationMSXId = generationMSXId;
    }

    setTitle(title: string | undefined) {
        this.title = title;
    }

    setSystem(system: string | undefined) {
        this.system = system;
    }

    setCompany(company: string | undefined) {
        this.company = company;
    }

    setYear(year: string | undefined) {
        this.year = year;
    }

    setCountry(country: string | undefined) {
        this.country = country;
    }

    setDump(dump: string | undefined) {
        this.dump = dump;
    }

    setMapper(mapper: string | undefined) {
        this.mapper = mapper;
    }

    setStart(start: string | undefined) {
        this.start = start;
    }

    setRemark(remark: string | undefined) {
        this.remark = remark;
    }

    setKnownDumps(knownDumps: number | undefined) {
        this.knownDumps = knownDumps;
    }

    setScreenshotSuffix(screenshotSuffix: string | undefined) {
        this.screenshotSuffix = screenshotSuffix;
    }

    setColecoScreenshot(colecoScreenshot: string | undefined) {
        this.colecoScreenshot = colecoScreenshot;
    }

    setSpectravideoScreenshot(spectravideoScreenshot: string | undefined) {
        this.spectravideoScreenshot = spectravideoScreenshot;
    }

    setSegaScreenshot(segaScreenshot: string | undefined) {
        this.segaScreenshot = segaScreenshot;
    }

    setGenerations(generations: number | undefined) {
        this.generations = generations;
    }

    setSounds(sounds: number | undefined) {
        this.sounds = sounds;
    }

    setGenre1(genre1: number | undefined) {
        this.genre1 = genre1;
    }

    setGenre2(genre2: number | undefined) {
        this.genre2 = genre2;
    }

    setListing(listing: string) {
        this.listing = listing;
    }

    setFddMode(fddMode: number | undefined) {
        this.fddMode = fddMode;
    }

    setInputDevice(inputDevice: number | undefined) {
        this.inputDevice = inputDevice;
    }

    setConnectGFX9000(connectGFX9000: boolean | undefined) {
        this.connectGFX9000 = connectGFX9000;
    }

    setFavorite(flag: boolean | undefined) {
        this.favorite = flag;
    }

    setInfoFile(infoFile: string | undefined) {
        this.infoFile = infoFile;
    }

    setBluemsxArguments(bluemsxArguments: string | undefined) {
        this.bluemsxArguments = bluemsxArguments;
    }

    setBluemsxOverrideSettings(flag: boolean | undefined) {
        this.bluemsxOverrideSettings = flag;
    }

    setWebmsxMachine(machine: number | undefined) {
        this.webmsxMachine = machine;
    }

    setEmuliciousArguments(emuliciousArguments: string | undefined) {
        this.emuliciousArguments = emuliciousArguments;
    }

    setEmuliciousOverrideSettings(flag: boolean | undefined) {
        this.emuliciousOverrideSettings = flag;
    }
}
