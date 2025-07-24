import { TestBed } from '@angular/core/testing';
import { FileHunterService } from './file-hunter.service';

describe('FilesService', () => {
  let service: FileHunterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileHunterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
