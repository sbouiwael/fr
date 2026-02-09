import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskDependencies } from './task-dependencies';

describe('TaskDependencies', () => {
  let component: TaskDependencies;
  let fixture: ComponentFixture<TaskDependencies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDependencies]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskDependencies);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
