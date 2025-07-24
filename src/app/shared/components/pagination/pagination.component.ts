import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.sass']
})
export class PaginationComponent implements OnInit {

  @Input() pageSize: number;
  @Input() hideFirstAndLastNav: boolean;
  @Output() page: EventEmitter<number> = new EventEmitter<number>();
  currentPage = 0;
  totalPages = 0;
  private totalInputValue: number;

  constructor() { }

  @Input()
  get total(): number { return this.totalInputValue; }
  set total(value: number) {
    this.totalInputValue = value;
    this.calculateTotalPages();
  }

  ngOnInit(): void {
    this.calculateTotalPages();
  }

  getCurrentPage(): number {
    return this.currentPage + 1;
  }

  nextPage() {
    this.currentPage++;
    this.page.emit(this.currentPage);
  }

  previousPage() {
    this.currentPage--;
    this.page.emit(this.currentPage);
  }

  lastPage() {
    this.currentPage = this.totalPages - 1;
    this.page.emit(this.currentPage);
  }

  firstPage() {
    this.currentPage = 0;
    this.page.emit(this.currentPage);
  }

  reset() {
    this.currentPage = 0;
  }

  private calculateTotalPages() {
    this.totalPages = Math.trunc((this.total - 1) / this.pageSize) + 1;
  }
}
