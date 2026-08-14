import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Toast Notification -->
    <div class="toast" [class.toast-visible]="toast.visible" [class.toast-error]="toast.error">
      <span class="toast-icon">{{ toast.error ? '✗' : '✓' }}</span>
      {{ toast.message }}
    </div>

    <!-- Delete Confirm Modal -->
    <div class="modal-backdrop" *ngIf="showDeleteModal">
      <div class="modal-card delete-modal">
        <div class="modal-header">
          <div class="modal-warning-icon">
            <svg width="28" height="28" fill="none" stroke="#EF4444" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                    d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
          </div>
          <h3 class="modal-title-danger">Confirm Delete</h3>
        </div>
        <div class="modal-body">
          <p class="delete-warning-text">
            You are about to permanently delete user <strong style="color:#F8FAFC;">{{ pendingDeleteUser?.username }}</strong>.
          </p>
          <p class="delete-warning-text-bold">This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-modal-cancel" (click)="cancelDelete()">Cancel</button>
          <button class="btn-modal-delete" (click)="confirmDelete()" [disabled]="isDeleting">
            {{ isDeleting ? 'Deleting...' : 'Yes, Delete' }}
          </button>
        </div>
      </div>
    </div>

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
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of users">
              <td>
                <div style="display:flex; align-items:center; gap:10px;">
                  <div class="user-circle">{{ (u.username || '?').charAt(0).toUpperCase() }}</div>
                  <strong style="color: #F8FAFC;">{{ u.username }}</strong>
                </div>
              </td>
              <td>{{ u.email }}</td>
              <td>
                <span class="badge" [class.badge-admin]="u.role === 'ROLE_ADMIN' || u.role === 'ADMIN'">
                  {{ u.role }}
                </span>
              </td>
              <td>
                <div style="display:flex; gap:6px; align-items:center;">
                  <button
                    class="action-btn action-btn-edit"
                    title="Edit user"
                    (click)="openEditUserModal(u)"
                    [disabled]="u.username === 'admin'"
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button
                    class="action-btn action-btn-delete"
                    title="Delete user"
                    (click)="requestDeleteUser(u)"
                    [disabled]="u.username === 'admin'"
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="users.length === 0">
              <td colspan="4" style="text-align: center; padding: 24px; color: #94A3B8;">
                No users found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add / Edit User Modal -->
      <div class="modal-backdrop" *ngIf="showAddModal">
        <div class="modal-card">
          <div class="modal-header">
            <h3>{{ editingUser ? 'Edit User' : 'Add New System User' }}</h3>
            <button type="button" class="btn-close" (click)="closeAddUserModal()">&times;</button>
          </div>
          <form (ngSubmit)="onAddUserSubmit()">
            <div class="modal-body">
              <div class="form-group">
                <label>Username *</label>
                <input type="text" [(ngModel)]="newUser.username" name="username" required
                       placeholder="e.g. john_doe" [disabled]="!!editingUser" />
              </div>
              <div class="form-group">
                <label>Email Address *</label>
                <input type="email" [(ngModel)]="newUser.email" name="email" required
                       placeholder="e.g. john@grameone.com" />
              </div>
              <div class="form-group">
                <label>{{ editingUser ? 'New Password (leave blank to keep current)' : 'Password *' }}</label>
                <input type="password" [(ngModel)]="newUser.password" name="password"
                       [required]="!editingUser" placeholder="Enter password" />
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
                {{ isSubmitting ? (editingUser ? 'Saving...' : 'Creating...') : (editingUser ? 'Save Changes' : 'Create User') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ── Toast ── */
    .toast {
      position: fixed;
      bottom: 28px;
      left: 50%;
      transform: translateX(-50%) translateY(80px);
      background: #1E293B;
      border: 1px solid rgba(255,255,255,0.12);
      color: #F8FAFC;
      padding: 12px 24px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      z-index: 2000;
      opacity: 0;
      pointer-events: none;
      transition: transform 0.3s ease, opacity 0.3s ease;
    }
    .toast.toast-visible { opacity: 1; transform: translateX(-50%) translateY(0); }
    .toast-icon { font-size: 16px; }
    .toast.toast-error { border-color: rgba(239,68,68,0.4); }
    .toast.toast-error .toast-icon { color: #EF4444; }
    .toast:not(.toast-error) .toast-icon { color: #10B981; }

    /* ── User circle ── */
    .user-circle {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
      flex-shrink: 0;
      box-shadow: 0 0 0 2px rgba(16,185,129,0.3);
    }

    /* ── Edit / Delete icon buttons ── */
    .action-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border-radius: 7px;
      border: none;
      cursor: pointer;
      transition: opacity 0.15s, transform 0.15s;
    }
    .action-btn:hover:not(:disabled) { opacity: 0.8; transform: scale(1.1); }
    .action-btn:disabled { opacity: 0.35; cursor: not-allowed; }
    .action-btn-edit  { background: rgba(59,130,246,0.18); color: #3B82F6; }
    .action-btn-delete { background: rgba(239,68,68,0.18); color: #EF4444; }

    /* ── Delete Confirm Modal ── */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1500;
    }
    .delete-modal {
      border-color: rgba(239,68,68,0.3) !important;
    }
    .modal-card {
      background: #1E293B;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 14px;
      width: 100%;
      max-width: 440px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }
    .modal-header {
      padding: 20px 24px 0;
      display: flex;
      align-items: center;
      gap: 14px;
      border-bottom: none;
    }
    .modal-warning-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: rgba(239,68,68,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .modal-title-danger {
      margin: 0;
      color: #EF4444;
      font-size: 18px;
      font-weight: 700;
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
      margin-left: auto;
    }
    .modal-body { padding: 16px 24px; }
    .delete-warning-text {
      color: #CBD5E1;
      font-size: 14px;
      margin: 0 0 10px;
      line-height: 1.6;
    }
    .delete-warning-text-bold {
      color: #EF4444;
      font-size: 14px;
      font-weight: 800;
      margin: 0;
      border: 2px solid rgba(239,68,68,0.4);
      border-radius: 8px;
      padding: 8px 12px;
      background: rgba(239,68,68,0.08);
    }
    .modal-footer {
      padding: 16px 24px;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      border-top: 1px solid rgba(255,255,255,0.06);
    }
    .btn-modal-cancel {
      background: #334155;
      color: #F8FAFC;
      border: none;
      padding: 9px 18px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-modal-delete {
      background: #EF4444;
      color: #fff;
      border: none;
      padding: 9px 18px;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-modal-delete:disabled { opacity: 0.55; cursor: not-allowed; }

    /* ── Table card ── */
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
  `]
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  isLoading = true;
  showAddModal = false;
  editingUser: User | null = null;
  isSubmitting = false;
  modalError = '';

  showDeleteModal = false;
  pendingDeleteUser: User | null = null;
  isDeleting = false;

  toast = { visible: false, message: '', error: false };
  private toastTimer: any;

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

  showToast(message: string, error = false) {
    clearTimeout(this.toastTimer);
    this.toast = { visible: true, message, error };
    this.toastTimer = setTimeout(() => { this.toast.visible = false; }, 3000);
  }

  loadUsers(): void {
    this.isLoading = true;
    this.authService.getUsers().subscribe({
      next: (data) => { this.users = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  openAddUserModal(): void {
    this.editingUser = null;
    this.showAddModal = true;
    this.modalError = '';
    this.newUser = { username: '', email: '', password: '', role: 'ROLE_ADMIN' };
  }

  openEditUserModal(u: User): void {
    this.editingUser = u;
    this.showAddModal = true;
    this.modalError = '';
    this.newUser = { username: u.username, email: u.email || '', password: '', role: u.role };
  }

  closeAddUserModal(): void {
    this.showAddModal = false;
    this.editingUser = null;
  }

  onAddUserSubmit(): void {
    if (!this.newUser.username || !this.newUser.email || (!this.newUser.password && !this.editingUser)) {
      this.modalError = 'Please fill out all required fields.';
      return;
    }

    this.isSubmitting = true;
    this.modalError = '';

    if (this.editingUser) {
      // Update user - send only changed fields
      const payload: any = { email: this.newUser.email, role: this.newUser.role };
      if (this.newUser.password) payload.password = this.newUser.password;
      this.authService.updateUser(this.editingUser.id!, payload).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.closeAddUserModal();
          this.loadUsers();
          this.showToast('User updated successfully.');
        },
        error: (err) => {
          this.isSubmitting = false;
          this.modalError = typeof err.error === 'string' ? err.error : (err.error?.message || 'Could not update user.');
        }
      });
    } else {
      this.authService.createUser(this.newUser).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.closeAddUserModal();
          this.loadUsers();
          this.showToast('User created successfully.');
        },
        error: (err) => {
          this.isSubmitting = false;
          this.modalError = typeof err.error === 'string' ? err.error : (err.error?.message || 'Could not create user.');
        }
      });
    }
  }

  requestDeleteUser(u: User): void {
    if (u.username === 'admin') return;
    this.pendingDeleteUser = u;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.pendingDeleteUser = null;
  }

  confirmDelete(): void {
    if (!this.pendingDeleteUser?.id) return;
    this.isDeleting = true;
    this.authService.deleteUser(this.pendingDeleteUser.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.pendingDeleteUser = null;
        this.loadUsers();
        this.showToast('User deleted successfully.');
      },
      error: (err) => {
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.pendingDeleteUser = null;
        this.showToast('Failed to delete user: ' + (err.error || err.message), true);
      }
    });
  }
}
