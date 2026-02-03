import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: 'a'
})
export class NoFocusDirective {
  constructor(private element: ElementRef) {}

  @HostListener('click') onClick() {
    this.element.nativeElement.blur();
  }
}
