import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokemonDetail } from './pokemon-detail';

describe('PokemonDetail', () => {
  let component: PokemonDetail;
  let fixture: ComponentFixture<PokemonDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokemonDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
