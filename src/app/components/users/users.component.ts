import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding: 24px;">
      <!-- Page Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div>
          <h1 style="font-size: 24px; font-weight: 700; color: #F8FAFC; margin: 0 0 4px;">User Management</h1>
          <p style="color: #94A3B8; font-size: 14px; margin: 0;">Add and manage administrator and staff user credentials</p>
        </div>
        <button class="btn-primary" (click)="openAddUserModal()">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Add New User
        </button>
      </div>

      <!-- Users Table Card -->
      <div class="card">
        <div *ngIf="isLoading" style="padding: 32px; text-align: center; color: #94A3B8;">
          Loading users...
        </div>

        <table *ngIf="!isLoading" class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of users">
              <td>#{{ u.id }}</td>
              <td>
                <strong style="color: #F8FAFC;">{{ u.username }}</strong>
              </td>
              <td>{{ u.email }}</td>
              <td>
                <span class="badge" [class.badge-admin]="u.role === 'ROLE_ADMIN' || u.role === 'ADMIN'">
                  {{ u.role }}
                </span>
              </td>
              <td>
                <button
                  class="btn-danger-sm"
                  (click)="confirmDeleteUser(u)"
                  [disabled]="u.username === 'admin'"
                  title="Delete user"
                >
                  Delete
                </button>
              </td>
            </tr>
            <tr *ngIf="users.length === 0">
              <td colspan="5" style="text-align: center; padding: 24px; color: #94A3B8;">
                No users found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add User Modal -->
      <div class="modal-backdrop" *ngIf="showAddModal">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Add New System User</h3>
            <button type="button" class="btn-close" (click)="closeAddUserModal()">&times;</button>
          </div>
          <form (ngSubmit)="onAddUserSubmit()">
            <div class="modal-body">
              <div class="form-group">
                <label>Username *</label>
                <input type="text" [(ngModel)]="newUser.username" name="username" required placeholder="e.g. john_doe" />
              </div>
              <div class="form-group">
                <label>Email Address *</label>
                <input type="email" [(ngModel)]="newUser.email" name="email" required placeholder="e.g. john@grameone.com" />
              </div>
              <div class="form-group">
                <label>Password *</label>
                <input type="password" [(ngModel)]="newUser.password" name="password" required placeholder="Enter password" />
              </div>
              <div class="form-group">
                <label>Role</label>
                <select [(ngModel)]="newUser.role" name="role">
                  <option value="ROLE_ADMIN">Administrator (ROLE_ADMIN)</option>
                  <option value="ROLE_STAFF">Staff (ROLE_STAFF)</option>
                </select>
              </div>
              <div *ngIf="modalError" class="modal-error">{{ modalError }}</div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-secondary" (click)="closeAddUserModal()">Cancel</button>
              <button type="submit" class="btn-primary" [disabled]="isSubmitting">
                {{ isSubmitting ? 'Creating...' : 'Create User' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background: #1E293B;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      overflow: hidden;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .data-table th {
      background: #0F172A;
      color: #94A3B8;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      padding: 14px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .data-table td {
      padding: 14px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      color: #CBD5E1;
      font-size: 14px;
    }
    .badge {
      background: #334155;
      color: #CBD5E1;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 6px;
    }
    .badge-admin {
      background: rgba(16, 185, 129, 0.15);
      color: #10B981;
    }
    .btn-primary {
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: white;
      border: none;
      padding: 10px 16px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .btn-secondary {
      background: #334155;
      color: #F8FAFC;
      border: none;
      padding: 10px 16px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-danger-sm {
      background: rgba(239, 68, 68, 0.15);
      color: #EF4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
    }
    .btn-danger-sm:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-card {
      background: #1E293B;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 14px;
      width: 100%;
      max-width: 440px;
      overflow: hidden;
    }
    .modal-header {
      padding: 16px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-header h3 {
      margin: 0;
      color: #F8FAFC;
      font-size: 16px;
    }
    .btn-close {
      background: none;
      border: none;
      color: #94A3B8;
      font-size: 20px;
      cursor: pointer;
    }
    .modal-body {
      padding: 20px;
    }
    .form-group {
      margin-bottom: 16px;
    }
    .form-group label {
      display: block;
      color: #CBD5E1;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 6px;
    }
    .form-group input, .form-group select {
      width: 100%;
      padding: 10px 12px;
      background: #0F172A;
      border: 1px solid #334155;
      border-radius: 8px;
      color: #F8FAFC;
      font-size: 14px;
      box-sizing: border-box;
    }
    .modal-error {
      color: #EF4444;
      font-size: 13px;
      margin-top: 10px;
    }
    .modal-footer {
      padding: 14px 20px;
      background: #0F172A;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
  `]
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  isLoading = true;
  showAddModal = false;
  isSubmitting = false;
  modalError = '';

  newUser = {
    username: '',
    email: '',
    password: '',
    role: 'ROLE_ADMIN'
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.authService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  openAddUserModal(): void {
    this.showAddModal = true;
    this.modalError = '';
    this.newUser = { username: '', email: '', password: '', role: 'ROLE_ADMIN' };
  }

  closeAddUserModal(): void {
    this.showAddModal = false;
  }

  onAddUserSubmit(): void {
    if (!this.newUser.username || !this.newUser.email || !this.newUser.password) {
      this.modalError = 'Please fill out all required fields.';
      return;
    }

    this.isSubmitting = true;
    this.modalError = '';

    this.authService.createUser(this.newUser).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeAddUserModal();
        this.loadUsers();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.modalError = typeof err.error === 'string' ? err.error : (err.error?.message || 'Could not create user.');
      }
    });
  }

  confirmDeleteUser(u: User): void {
    if (u.username === 'admin') return;
    if (confirm(`Are you sure you want to delete user "${u.username}"?`)) {
      if (u.id) {
        this.authService.deleteUser(u.id).subscribe({
          next: () => this.loadUsers(),
          error: (err) => alert('Could not delete user: ' + (err.error || err.message))
        });
      }
    }
  }
}
