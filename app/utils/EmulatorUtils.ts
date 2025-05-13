export class EmulatorUtils {

    static appendParams(args: string[], argsString: string, separator: string) {
        if (argsString) {
            const params = this.splitArgs(argsString, separator);
            params.forEach((param) => {
                const sanitizedParam = param.trimEnd();
                if (sanitizedParam) {
                    const space = sanitizedParam.indexOf(' ');
                    if (space > -1) {
                        args.push(separator + sanitizedParam.substring(0, space));
                        args.push(sanitizedParam.substring(space + 1).trimEnd().replace(/"/g, ''));
                    } else {
                        args.push(separator + sanitizedParam);
                    }
                }
            });
        }
    }

    private static splitArgs(args: string, separator: string): string[] {
        const argsArray = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < args.length; i++) {
            const char = args[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === separator && (!inQuotes && (i === 0 || args[i - 1] === ' '))) {
                argsArray.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        if (current) {
            argsArray.push(current);
        }
        return argsArray;
    }
}
