export class KeyboardUtils {

  static readonly zoomKeys = ['=', '-', '0'];

  static isZoomKeyPressed(event: KeyboardEvent): boolean {
    return !event.repeat && this.isCtrlOrCommandKeyPressed(event) && this.zoomKeys.includes(event.key);
  }

  static isCtrlOrCommandKeyPressed(event: KeyboardEvent): boolean {
    return event.ctrlKey || event.metaKey;
  }
}
