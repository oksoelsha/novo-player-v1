import { TestBed } from '@angular/core/testing';

import { WebmsxService } from './webmsx.service';

describe('WebmsxService', () => {
  let service: WebmsxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebmsxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
