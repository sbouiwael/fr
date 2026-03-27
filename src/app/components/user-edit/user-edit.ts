import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { UserService, UpdateUserPayload } from '../../services/user-service';
import { Role } from '../../models/user';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-edit.html',
  styleUrls: ['./user-edit.css'],
})
export class UserEdit implements OnInit {
  form: FormGroup;
  errorMessage = '';
  loading = false;
  loadingData = true;
  userId!: number;

  roles: Role[] = ['PM', 'PMO', 'DEV', 'QA', 'DEVOPS', 'RH', 'ADMIN'];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['DEV', Validators.required],
      weeklyCapacity: [0, [Validators.required, Validators.min(0)]],
      password: [''],
      active: [true],
    });
  }

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));

    this.userService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.form.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          weeklyCapacity: user.weeklyCapacity,
          active: user.active ?? true,
          password: '',
        });
        this.loadingData = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingData = false;
        this.errorMessage = 'Error loading user data';
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const v = this.form.value;

    const payload: UpdateUserPayload = {
      firstName: v.firstName,
      lastName: v.lastName,
      email: v.email,
      role: v.role,
      weeklyCapacity: Number(v.weeklyCapacity),
      active: !!v.active,
    };

    // Only include password if user typed a new one
    if (v.password && v.password.trim()) {
      payload.password = v.password;
    }

    this.userService.updateUser(this.userId, payload).subscribe({
      next: () => this.router.navigateByUrl('/users'),
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.errorMessage = 'Error updating user';
      },
    });
  }
}
