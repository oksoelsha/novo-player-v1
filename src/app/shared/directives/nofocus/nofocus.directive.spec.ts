import { ElementRef } from '@angular/core';
import { NoFocusDirective } from './nofocus.directive';

let element: ElementRef;

describe('NoFocusDirective', () => {
  it('should create an instance', () => {
    const directive = new NoFocusDirective(element);
    expect(directive).toBeTruthy();
  });
});
