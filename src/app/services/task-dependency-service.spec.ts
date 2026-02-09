import { TestBed } from '@angular/core/testing';

import { TaskDependencyService } from './task-dependency-service';

describe('TaskDependencyService', () => {
  let service: TaskDependencyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskDependencyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
