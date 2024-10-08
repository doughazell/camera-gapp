import { TestBed } from '@angular/core/testing';

import { AppscriptService } from './appscript.service';

describe('AppscriptService', () => {
  let service: AppscriptService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppscriptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
