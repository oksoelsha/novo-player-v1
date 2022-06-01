import { Renderer2 } from "@angular/core";
import { DropfileDirective } from "./dropfile.directive";

let renderer: Renderer2;

describe('DropfileDirective', () => {
  it('should create an instance', () => {
    const directive = new DropfileDirective(renderer);
    expect(directive).toBeTruthy();
  });
});
