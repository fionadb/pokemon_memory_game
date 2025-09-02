import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameSettings } from './game-settings';

describe('GameSettings', () => {
  let component: GameSettings;
  let fixture: ComponentFixture<GameSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameSettings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameSettings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
