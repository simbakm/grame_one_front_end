import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo-icon">G</div>
          <h2>GrameOne Admin Portal</h2>
          <p>Sign in to access content management and system administration</p>
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label for="username">Username or Email</label>
            <div class="input-wrapper">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <input
                type="text"
                id="username"
                name="username"
                [(ngModel)]="username"
                required
                placeholder="Enter your username"
                [disabled]="isLoading"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <div class="input-wrapper">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              <input
                type="password"
                id="password"
                name="password"
                [(ngModel)]="password"
                required
                placeholder="Enter your password"
                [disabled]="isLoading"
              />
            </div>
          </div>

          <div *ngIf="errorMessage" class="error-banner">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>{{ errorMessage }}</span>
          </div>

          <button type="submit" class="btn-submit" [disabled]="isLoading || !loginForm.valid">
            <span *ngIf="!isLoading">Sign In</span>
            <span *ngIf="isLoading" class="spinner-label">
              <span class="spinner"></span> Signing in...
            </span>
          </button>
        </form>

        <div class="login-footer">
          <p>Default credentials: <strong>admin</strong> / <strong>admin123</strong></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
      padding: 20px;
    }
    .login-card {
      width: 100%;
      max-width: 420px;
      background: #1E293B;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }
    .login-header {
      text-align: center;
      margin-bottom: 28px;
    }
    .logo-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: white;
      font-size: 24px;
      font-weight: 800;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
    .login-header h2 {
      color: #F8FAFC;
      font-size: 22px;
      font-weight: 700;
      margin: 0 0 6px;
    }
    .login-header p {
      color: #94A3B8;
      font-size: 13px;
      margin: 0;
    }
    .form-group {
      margin-bottom: 20px;
    }
    .form-group label {
      display: block;
      color: #CBD5E1;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-wrapper svg {
      position: absolute;
      left: 14px;
      color: #64748B;
    }
    .input-wrapper input {
      width: 100%;
      padding: 12px 14px 12px 42px;
      background: #0F172A;
      border: 1px solid #334155;
      border-radius: 10px;
      color: #F8FAFC;
      font-size: 14px;
      outline: none;
      transition: all 0.2s;
    }
    .input-wrapper input:focus {
      border-color: #10B981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
    }
    .error-banner {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #FCA5A5;
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;
    }
    .btn-submit {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .spinner-label {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .login-footer {
      margin-top: 24px;
      text-align: center;
      font-size: 12px;
      color: #64748B;
    }
    .login-footer strong {
      color: #94A3B8;
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  onSubmit(): void {
    if (!this.username || !this.password) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.isLoading = false;
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = typeof err.error === 'string' ? err.error : (err.error?.message || 'Invalid username or password');
      }
    });
  }
}
