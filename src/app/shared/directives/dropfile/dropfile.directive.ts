import { Directive, EventEmitter, HostListener, Output, Renderer2 } from '@angular/core';

@Directive({
  selector: '[dropfile]'
})
export class DropfileDirective {

  @Output() droppedFile: EventEmitter<string> = new EventEmitter<string>();

  constructor(private renderer: Renderer2) { }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    this.highlightForDrop(event);
  }

  @HostListener('dragenter', ['$event'])
  onDragEnter(event: DragEvent) {
    this.highlightForDrop(event);
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent) {
    this.unhighlightForDrop(event);
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    this.unhighlightForDrop(event);
    if (event.dataTransfer.files.length > 0) {
      this.droppedFile.emit(event.dataTransfer.files[0].path);
    } else if (event.dataTransfer.getData("text/plain")) {
      const link = event.dataTransfer.getData("text/plain");
      if (link.startsWith('https://')) {
        this.droppedFile.emit(decodeURIComponent(link));
      }
    }
  }

  private highlightForDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.renderer.setStyle(event.target, 'background', 'skyblue');
  }

  private unhighlightForDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.renderer.setStyle(event.target, 'background', '');
  }
}
