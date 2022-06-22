export class RelatedGame {
    name: string;
    company: string;
    year: string;
    generationMSXId: number;

    constructor(name: string, company: string, year: string, generationMSXId: number) {
        this.name = name;
        this.company = company;
        this.year = year;
        this.generationMSXId = generationMSXId;
    }
}
