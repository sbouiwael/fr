import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskAssignments } from './task-assignments';

describe('TaskAssignments', () => {
  let component: TaskAssignments;
  let fixture: ComponentFixture<TaskAssignments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskAssignments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskAssignments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
