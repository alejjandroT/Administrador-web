import { TestBed } from '@angular/core/testing';

import { UbicacionesService } from './ubicaciones.service';

describe('UbicacionesService', () => {
  let service: UbicacionesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UbicacionesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
