import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {

  constructor() { }

  isOnWindows(): boolean {
    return navigator.userAgent.indexOf('Win') > -1;
  }

  isOnMac(): boolean {
    return navigator.userAgent.indexOf('Mac') > -1;
  }
}
