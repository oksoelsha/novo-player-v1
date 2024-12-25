export class EmulatorUtils {

    static appendParams(args: string[], argsString: string, separator: string) {
        if (argsString) {
            const regex = new RegExp(String.raw`${separator}(?=(?:(?:[^"]*"){2})*[^"]*$)`, 'g');
            const params = argsString.split(regex);
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
}
