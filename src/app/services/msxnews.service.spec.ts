import { TestBed } from '@angular/core/testing';

import { MsxnewsService } from './msxnews.service';

describe('MsxnewsService', () => {
  let service: MsxnewsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MsxnewsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
