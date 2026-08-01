import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService, DashboardStats, License } from '../../services/api.service';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="content-header">
      <div>
        <div class="breadcrumbs">Overview &rsaquo; System Summary</div>
        <h1 class="page-title">Dashboard</h1>
      </div>
      <div style="display:flex; gap:0.75rem; align-items:center;">
        @if (loading) {
          <span style="font-size:0.82rem; color:var(--text-muted);">⟳ Loading live data...</span>
        }
        @if (!loading && lastRefreshed) {
          <span style="font-size:0.78rem; color:var(--text-muted);">Updated {{ lastRefreshed }}</span>
        }
        <button class="btn btn-secondary" (click)="loadStats()" style="font-size:0.82rem; padding:0.35rem 0.75rem;">
          🔄 Refresh
        </button>
        <a routerLink="/csv-import" class="btn btn-secondary">
          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
          Import CSV
        </a>
        <a routerLink="/package-publishing" class="btn btn-primary">
          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Publish Grade
        </a>
      </div>
    </div>

    <div style="padding: 0 1.75rem 1.75rem;">

      @if (error) {
        <div style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:10px; padding:1rem 1.25rem; margin-bottom:1.5rem; color:#ef4444; font-size:0.88rem;">
          ⚠️ {{ error }} — Showing last known data.
        </div>
      }

      <!-- Metrics Cards -->
      <div class="metrics-grid">
        <a routerLink="/questions" style="text-decoration:none;">
          <div class="metric-card" [class.metric-loading]="loading">
            <div class="metric-top">
              <span class="metric-title">Total Questions</span>
              <div class="metric-icon-box" style="color:#10b981; background:rgba(16,185,129,0.12);">❓</div>
            </div>
            <div class="metric-value" style="color:#10b981;">{{ loading ? '...' : (stats?.totalQuestions ?? 0) }}</div>
            <div class="metric-footer" style="color:#10b981;">In PostgreSQL master DB &rarr;</div>
          </div>
        </a>

        <a routerLink="/package-publishing" style="text-decoration:none;">
          <div class="metric-card" [class.metric-loading]="loading">
            <div class="metric-top">
              <span class="metric-title">Active R2 Packages</span>
              <div class="metric-icon-box" style="color:#3b82f6; background:rgba(59,130,246,0.12);">📦</div>
            </div>
            <div class="metric-value" style="color:#3b82f6;">{{ loading ? '...' : (stats?.totalR2Packages ?? 0) }}</div>
            <div class="metric-footer" style="color:#3b82f6;">Live packages on Cloudflare R2 &rarr;</div>
          </div>
        </a>

        <a routerLink="/licenses" style="text-decoration:none;">
          <div class="metric-card" [class.metric-loading]="loading">
            <div class="metric-top">
              <span class="metric-title">Active Licenses</span>
              <div class="metric-icon-box" style="color:#8b5cf6; background:rgba(139,92,246,0.12);">✅</div>
            </div>
            <div class="metric-value" style="color:#8b5cf6;">{{ loading ? '...' : (stats?.activeLicenses ?? 0) }}</div>
            <div class="metric-footer" style="color:#8b5cf6;">Bound to mobile devices &rarr;</div>
          </div>
        </a>

        <a routerLink="/licenses" style="text-decoration:none;">
          <div class="metric-card" [class.metric-loading]="loading">
            <div class="metric-top">
              <span class="metric-title">Pending Activations</span>
              <div class="metric-icon-box" style="color:#f59e0b; background:rgba(245,158,11,0.12);">⏳</div>
            </div>
            <div class="metric-value" style="color:#f59e0b;">{{ loading ? '...' : (stats?.pendingLicenses ?? 0) }}</div>
            <div class="metric-footer" style="color:#f59e0b;">Waiting for mobile binding &rarr;</div>
          </div>
        </a>
      </div>

      <!-- Secondary stats row -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:0.75rem; margin-bottom:1.5rem;">
        <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:10px; padding:0.85rem 1rem; display:flex; gap:0.75rem; align-items:center;">
          <span style="font-size:1.4rem;">🏫</span>
          <div>
            <div style="font-size:0.75rem; color:var(--text-muted);">Total Grades</div>
            <div style="font-size:1.2rem; font-weight:700; color:var(--text-light);">{{ stats?.totalGrades ?? 0 }}</div>
          </div>
        </div>
        <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:10px; padding:0.85rem 1rem; display:flex; gap:0.75rem; align-items:center;">
          <span style="font-size:1.4rem;">🔑</span>
          <div>
            <div style="font-size:0.75rem; color:var(--text-muted);">Total Licenses Generated</div>
            <div style="font-size:1.2rem; font-weight:700; color:var(--text-light);">{{ stats?.totalLicenses ?? 0 }}</div>
          </div>
        </div>
        <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:10px; padding:0.85rem 1rem; display:flex; gap:0.75rem; align-items:center;">
          <span style="font-size:1.4rem;">⛔</span>
          <div>
            <div style="font-size:0.75rem; color:var(--text-muted);">Expired Licenses</div>
            <div style="font-size:1.2rem; font-weight:700; color:#ef4444;">{{ stats?.expiredLicenses ?? 0 }}</div>
          </div>
        </div>
        <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:10px; padding:0.85rem 1rem; display:flex; gap:0.75rem; align-items:center;">
          <span style="font-size:1.4rem;">📊</span>
          <div>
            <div style="font-size:0.75rem; color:var(--text-muted);">Activation Rate</div>
            <div style="font-size:1.2rem; font-weight:700; color:#10b981;">
              {{ getActivationRate() }}%
            </div>
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div class="charts-grid">
        <div class="card">
          <div class="card-header">
            <div class="card-title">📈 Mobile Activations — Last 6 Months</div>
            <span style="font-size:0.75rem; color:var(--text-muted);">Live from database</span>
          </div>
          <div style="height: 280px; position: relative;">
            @if (loading) {
              <div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);font-size:0.9rem;">⟳ Loading chart data...</div>
            } @else {
              <canvas #growthChart></canvas>
            }
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">📚 Questions per Grade</div>
            <span style="font-size:0.75rem; color:var(--text-muted);">Live from database</span>
          </div>
          <div style="height: 280px; position: relative;">
            @if (loading) {
              <div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);font-size:0.9rem;">⟳ Loading chart data...</div>
            } @else {
              <canvas #distChart></canvas>
            }
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">⚡ Quick Administration Actions</div>
        </div>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
          <a routerLink="/licenses" class="btn btn-secondary" style="justify-content:center; padding:1.25rem;">
            ➕ Generate Activation Code
          </a>
          <a routerLink="/hierarchy" class="btn btn-secondary" style="justify-content:center; padding:1.25rem;">
            🌳 Academic Hierarchy
          </a>
          <a routerLink="/package-publishing" class="btn btn-secondary" style="justify-content:center; padding:1.25rem;">
            🚀 Publish SQLite Package
          </a>
          <a routerLink="/system-metrics" class="btn btn-secondary" style="justify-content:center; padding:1.25rem;">
            ⚡ System Health Monitor
          </a>
        </div>
      </div>

      <!-- Recent Activations Table -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">🔒 Recent Mobile Activations</div>
          <a routerLink="/licenses" class="btn btn-secondary" style="font-size:0.8rem; padding:0.4rem 0.85rem;">View All</a>
        </div>
        @if (!loading && (!stats?.recentActivations || stats!.recentActivations.length === 0)) {
          <div style="text-align:center; padding:2rem; color:var(--text-muted); font-size:0.9rem;">
            No mobile activations recorded yet.
          </div>
        }
        @if (stats?.recentActivations && stats!.recentActivations.length > 0) {
          <div class="table-container">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Activation Code</th>
                  <th>License Type</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Device ID</th>
                  <th>Activated On</th>
                </tr>
              </thead>
              <tbody>
                @for (lic of stats!.recentActivations; track lic.id) {
                  <tr>
                    <td><code style="color:#10b981;">{{ lic.activationCode }}</code></td>
                    <td>
                      <span class="badge" [style.background]="lic.licenseType === 'FREE' ? 'rgba(245,158,11,0.12)' : 'rgba(59,130,246,0.12)'"
                            [style.color]="lic.licenseType === 'FREE' ? '#f59e0b' : '#3b82f6'">
                        {{ lic.licenseType }}
                      </span>
                    </td>
                    <td>{{ lic.subscriptionDurationMonths ? lic.subscriptionDurationMonths + 'M Plan' : '—' }}</td>
                    <td>
                      <span class="badge" [class]="getBadgeClass(lic.status)">{{ lic.status }}</span>
                    </td>
                    <td style="font-size:0.8rem; color:var(--text-muted);">{{ lic.deviceId ? lic.deviceId.substring(0, 14) + '...' : '—' }}</td>
                    <td>{{ lic.activationDate ? (lic.activationDate | date:'dd MMM yyyy') : '—' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

    </div>
  `,
  styles: [`
    .metric-loading .metric-value {
      opacity: 0.5;
      animation: pulse 1.2s ease-in-out infinite alternate;
    }
    @keyframes pulse {
      from { opacity: 0.3; }
      to { opacity: 0.7; }
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('growthChart') growthChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('distChart') distChartRef!: ElementRef<HTMLCanvasElement>;

  stats: DashboardStats | null = null;
  loading = true;
  error = '';
  lastRefreshed = '';

  private growthChartInstance: Chart | null = null;
  private distChartInstance: Chart | null = null;

  readonly CHART_COLORS = ['#10b981','#3b82f6','#8b5cf6','#ec4899','#f59e0b','#06b6d4','#64748b','#ef4444'];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadStats();
  }

  ngAfterViewInit() {
    // Charts are rendered after stats load
  }

  loadStats() {
    this.loading = true;
    this.error = '';

    this.api.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
        this.lastRefreshed = new Date().toLocaleTimeString();
        // Slight delay so Angular renders the canvases
        setTimeout(() => this.renderCharts(), 100);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Could not load live stats from backend.';
        this.lastRefreshed = new Date().toLocaleTimeString();
      }
    });
  }

  getActivationRate(): string {
    if (!this.stats || this.stats.totalLicenses === 0) return '0';
    return Math.round((this.stats.activeLicenses / this.stats.totalLicenses) * 100).toString();
  }

  renderCharts() {
    if (!this.stats) return;
    this.renderGrowthChart();
    this.renderDistributionChart();
  }

  private renderGrowthChart() {
    if (!this.growthChartRef?.nativeElement) return;
    if (this.growthChartInstance) this.growthChartInstance.destroy();

    const { labels, data } = this.stats!.activationsByMonth;

    this.growthChartInstance = new Chart(this.growthChartRef.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Mobile Activations',
          data,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.12)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#10b981',
          pointRadius: 5,
          pointHoverRadius: 7,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#9ca3af', font: { size: 12 } } },
          tooltip: { backgroundColor: '#1f2937', titleColor: '#f9fafb', bodyColor: '#9ca3af' }
        },
        scales: {
          x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(75,85,99,0.3)' } },
          y: { ticks: { color: '#9ca3af', stepSize: 1 }, grid: { color: 'rgba(75,85,99,0.3)' }, beginAtZero: true }
        }
      }
    });
  }

  private renderDistributionChart() {
    if (!this.distChartRef?.nativeElement) return;
    if (this.distChartInstance) this.distChartInstance.destroy();

    const { labels, data } = this.stats!.contentDistribution;
    const hasData = data.some(v => v > 0);

    if (!hasData) {
      // Render placeholder if no questions yet
      this.distChartInstance = new Chart(this.distChartRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: ['No questions yet'],
          datasets: [{ data: [1], backgroundColor: ['#374151'], borderWidth: 0 }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: '#6b7280', boxWidth: 12 } } }
        }
      });
      return;
    }

    this.distChartInstance = new Chart(this.distChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: this.CHART_COLORS.slice(0, labels.length),
          borderWidth: 2,
          borderColor: '#111827',
          hoverOffset: 8,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#9ca3af', boxWidth: 12, padding: 16 } },
          tooltip: { backgroundColor: '#1f2937', titleColor: '#f9fafb', bodyColor: '#9ca3af' }
        }
      }
    });
  }

  getBadgeClass(status: string): string {
    if (status === 'ACTIVE') return 'badge badge-success';
    if (status === 'PENDING') return 'badge badge-warning';
    if (status === 'EXPIRED') return 'badge badge-danger';
    return 'badge badge-info';
  }
}
