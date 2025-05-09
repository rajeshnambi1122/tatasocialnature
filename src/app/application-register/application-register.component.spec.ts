import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationRegisterComponent } from './application-register.component';

describe('ApplicationRegisterComponent', () => {
  let component: ApplicationRegisterComponent;
  let fixture: ComponentFixture<ApplicationRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationRegisterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicationRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
