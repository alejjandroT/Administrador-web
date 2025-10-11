import { TestBed } from '@angular/core/testing';

import { BrigadistasService } from './brigadistas.service';

describe('BrigadistasService', () => {
  let service: BrigadistasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrigadistasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
