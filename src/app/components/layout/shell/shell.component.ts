import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-container">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="sidebar-logo">G</div>
          <span class="sidebar-title">GrameOne</span>
        </div>

        <nav class="sidebar-nav">
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
      <div class="main-wrapper">
        <!-- Topbar -->
        <header class="topbar">
          <div class="search-box">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" placeholder="Search grades, subjects, questions, licenses..." (input)="onSearch($event)">
          </div>
          <div class="user-profile">
            <div class="status-indicator">
              <span class="dot-online"></span>
              <span>Supabase &amp; R2 Online</span>
            </div>
            <div class="avatar">A</div>
          </div>
        </header>

        <!-- Routed Page Content -->
        <div class="page-body" style="padding:0; overflow-y:auto; flex:1;">
          <router-outlet />
        </div>
      </div>
    </div>
  `
})
export class ShellComponent {
  onSearch(event: Event): void {
    const q = (event.target as HTMLInputElement).value.toLowerCase();
    console.log('Search:', q);
  }
}
