import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-container" [class.sidebar-open]="isSidebarOpen">
      <!-- Sidebar -->
      <aside class="sidebar" [class.closed]="!isSidebarOpen">
        <div class="sidebar-header">
          <div class="sidebar-logo">G</div>
          <span class="sidebar-title">GrameOne</span>
        </div>

        <nav class="sidebar-nav" (click)="onNavItemSelected()">
          <div class="sidebar-nav-header">
            <span class="sidebar-nav-heading">Navigation</span>
            <button class="sidebar-close" type="button" (click)="closeSidebar(); $event.stopPropagation()" aria-label="Close navigation">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div>
            <div class="nav-group-label">Overview</div>
            <ul class="nav-list">
              <li class="nav-item" routerLinkActive="active">
                <a routerLink="/dashboard">
                  <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                  </svg>
                  Dashboard
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div class="nav-group-label">Academic Hierarchy</div>
            <ul class="nav-list">
              <li class="nav-item" routerLinkActive="active">
                <a routerLink="/grades">
                  <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                  Grades
                </a>
              </li>
              <li class="nav-item" routerLinkActive="active">
                <a routerLink="/subjects">
                  <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  Subjects
                </a>
              </li>
              <li class="nav-item" routerLinkActive="active">
                <a routerLink="/topics">
                  <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h10M7 12h10M7 17h10"/>
                  </svg>
                  Topics
                </a>
              </li>
              <li class="nav-item" routerLinkActive="active">
                <a routerLink="/questions">
                  <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Questions
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div class="nav-group-label">Publishing &amp; Imports</div>
            <ul class="nav-list">
              <li class="nav-item" routerLinkActive="active">
                <a routerLink="/csv-import">
                  <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                  CSV Import
                </a>
              </li>
              <li class="nav-item" routerLinkActive="active">
                <a routerLink="/package-publishing">
                  <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                  Package Publisher
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div class="nav-group-label">Administration</div>
            <ul class="nav-list">
              <li class="nav-item" routerLinkActive="active" *ngIf="isAdmin">
                <a routerLink="/users">
                  <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                  User Management
                </a>
              </li>
              <li class="nav-item" routerLinkActive="active">
                <a routerLink="/licenses">
                  <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                  </svg>
                  Licenses
                </a>
              </li>
              <li class="nav-item" routerLinkActive="active">
                <a routerLink="/subscriptions">
                  <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                  Subscription Plans
                </a>
              </li>
              <li class="nav-item" routerLinkActive="active">
                <a routerLink="/system-metrics">
                  <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                  System Metrics
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      <!-- Main Content -->
      <div class="main-wrapper" (click)="onMainWrapperClick()">
        <!-- Topbar -->
        <header class="topbar">
          <button class="sidebar-toggle" (click)="toggleSidebar(); $event.stopPropagation()" aria-label="Toggle navigation">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <div class="search-box">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" placeholder="Search grades, subjects, questions, licenses..." (input)="onSearch($event)">
          </div>

          <div class="user-profile">
            <div class="status-indicator">
              <span class="dot-online"></span>
              <span>{{ username }} ({{ userRole }})</span>
            </div>

            <button class="btn-action-top" (click)="openChangePasswordModal()" title="Change Password">
              🔑 Password
            </button>

            <button class="btn-action-top btn-logout" (click)="onLogout()" title="Sign Out">
              🚪 Logout
            </button>
          </div>
        </header>

        <!-- Routed Page Content -->
        <div class="page-body" style="padding:0; overflow-y:auto; flex:1;">
          <router-outlet />
        </div>
      </div>
      <div class="sidebar-backdrop" *ngIf="isSidebarOpen && isSmallScreen" (click)="toggleSidebar()"></div>
    </div>

    <!-- Change Password Modal -->
    <div class="modal-backdrop" *ngIf="showPasswordModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Change Password</h3>
          <button type="button" class="btn-close" (click)="closePasswordModal()">&times;</button>
        </div>
        <form (ngSubmit)="onChangePasswordSubmit()">
          <div class="modal-body">
            <div class="form-group">
              <label>Current Password *</label>
              <input type="password" [(ngModel)]="pwdData.oldPassword" name="oldPassword" required placeholder="Enter current password" />
            </div>
            <div class="form-group">
              <label>New Password *</label>
              <input type="password" [(ngModel)]="pwdData.newPassword" name="newPassword" required placeholder="Enter new password" />
            </div>
            <div class="form-group">
              <label>Confirm New Password *</label>
              <input type="password" [(ngModel)]="confirmPassword" name="confirmPassword" required placeholder="Confirm new password" />
            </div>
            <div *ngIf="pwdError" class="modal-error">{{ pwdError }}</div>
            <div *ngIf="pwdSuccess" class="modal-success">{{ pwdSuccess }}</div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-secondary" (click)="closePasswordModal()">Cancel</button>
            <button type="submit" class="btn-primary" [disabled]="isChangingPwd">
              {{ isChangingPwd ? 'Updating...' : 'Update Password' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .btn-action-top {
      background: #334155;
      color: #F8FAFC;
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      margin-left: 8px;
    }
    .btn-logout {
      background: rgba(239, 68, 68, 0.15);
      color: #EF4444;
      border-color: rgba(239, 68, 68, 0.3);
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
      max-width: 400px;
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
    .form-group input {
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
    .modal-success {
      color: #10B981;
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
    .btn-primary {
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: white;
      border: none;
      padding: 8px 14px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-secondary {
      background: #334155;
      color: #F8FAFC;
      border: none;
      padding: 8px 14px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }
  `]
})
export class ShellComponent implements OnInit {
  isSidebarOpen = true;
  isSmallScreen = false;

  showPasswordModal = false;
  isChangingPwd = false;
  pwdError = '';
  pwdSuccess = '';
  confirmPassword = '';

  pwdData = {
    username: '',
    oldPassword: '',
    newPassword: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  get username(): string {
    return this.authService.currentUserValue?.username || 'admin';
  }

  get userRole(): string {
    const r = this.authService.currentUserValue?.role;
    if (r === 'ROLE_ADMIN' || r === 'ADMIN') return 'Admin';
    return 'Staff';
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin;
  }

  ngOnInit(): void {
    this.isSmallScreen = window.matchMedia('(max-width: 900px)').matches;
    if (this.isSmallScreen) {
      this.isSidebarOpen = false;
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.isSmallScreen = window.matchMedia('(max-width: 900px)').matches;
    this.isSidebarOpen = !this.isSmallScreen;
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    if (this.isSmallScreen) {
      this.isSidebarOpen = false;
    }
  }

  onNavItemSelected(): void {
    this.closeSidebar();
  }

  onMainWrapperClick(): void {
    this.closeSidebar();
  }

  onSearch(event: Event): void {
    const q = (event.target as HTMLInputElement).value.toLowerCase();
    console.log('Search:', q);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openChangePasswordModal(): void {
    this.showPasswordModal = true;
    this.pwdError = '';
    this.pwdSuccess = '';
    this.pwdData = {
      username: this.username,
      oldPassword: '',
      newPassword: ''
    };
    this.confirmPassword = '';
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
  }

  onChangePasswordSubmit(): void {
    if (!this.pwdData.oldPassword || !this.pwdData.newPassword) {
      this.pwdError = 'Please enter both current and new password.';
      return;
    }

    if (this.pwdData.newPassword !== this.confirmPassword) {
      this.pwdError = 'New password and confirmation do not match.';
      return;
    }

    this.isChangingPwd = true;
    this.pwdError = '';
    this.pwdSuccess = '';

    this.authService.changePassword(this.pwdData).subscribe({
      next: () => {
        this.isChangingPwd = false;
        this.pwdSuccess = 'Password changed successfully!';
        setTimeout(() => this.closePasswordModal(), 1200);
      },
      error: (err) => {
        this.isChangingPwd = false;
        this.pwdError = typeof err.error === 'string' ? err.error : (err.error?.message || 'Could not update password.');
      }
    });
  }
}
