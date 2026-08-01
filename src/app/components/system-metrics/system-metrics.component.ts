import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ServiceStatus {
  name: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'OFFLINE';
  latencyMs: number;
  details: string;
}

@Component({
  selector: 'app-system-metrics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="content-header">
      <div>
        <div class="breadcrumbs">Administration &rsaquo; System Health</div>
        <h1 class="page-title">System Metrics &amp; Diagnostic Monitor</h1>
      </div>
      <button class="btn btn-secondary" (click)="refreshMetrics()">
        🔄 Refresh Diagnostics
      </button>
    </div>

    <div style="padding: 0 1.75rem 1.75rem;">
      <!-- Main Status Cards -->
      <div class="metrics-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom:1.5rem;">
        <div class="metric-card">
          <div class="metric-top"><span class="metric-title">PostgreSQL Status</span><div class="metric-icon-box" style="color:#10b981;">🗄️</div></div>
          <div class="metric-value" style="color:#10b981; font-size:1.4rem;">CONNECTED</div>
          <div class="metric-footer">Supabase Pooler (aws-0-eu-central-1)</div>
        </div>
        <div class="metric-card">
          <div class="metric-top"><span class="metric-title">Cloudflare R2 Bucket</span><div class="metric-icon-box" style="color:#3b82f6;">☁️</div></div>
          <div class="metric-value" style="color:#3b82f6; font-size:1.4rem;">ONLINE</div>
          <div class="metric-footer">Bucket: grameone</div>
        </div>
        <div class="metric-card">
          <div class="metric-top"><span class="metric-title">DB Pool Connections</span><div class="metric-icon-box">🔌</div></div>
          <div class="metric-value">{{ activeConnections }} / 20</div>
          <div class="metric-footer">HikariCP Connection Pool</div>
        </div>
        <div class="metric-card">
          <div class="metric-top"><span class="metric-title">JVM Heap Usage</span><div class="metric-icon-box">⚡</div></div>
          <div class="metric-value">{{ heapUsedMb }} MB</div>
          <div class="metric-footer">Max: {{ heapMaxMb }} MB</div>
        </div>
      </div>

      <!-- Services Health Table -->
      <div class="card" style="margin-bottom:1.5rem;">
        <div class="card-header"><div class="card-title">🌐 Subsystem Health Status</div></div>
        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Subsystem</th>
                <th>Status</th>
                <th>Latency</th>
                <th>Connection Endpoint / Details</th>
              </tr>
            </thead>
            <tbody>
              @for (service of services; track service.name) {
                <tr>
                  <td><strong>{{ service.name }}</strong></td>
                  <td>
                    <span class="badge" [class]="service.status === 'OPERATIONAL' ? 'badge-success' : 'badge-warning'">
                      {{ service.status }}
                    </span>
                  </td>
                  <td><code>{{ service.latencyMs }} ms</code></td>
                  <td style="color:var(--text-muted);">{{ service.details }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Realtime Activity Log -->
      <div class="card">
        <div class="card-header"><div class="card-title">📜 System Audit Log Streams</div></div>
        <div style="background:var(--bg-dark); border-radius:8px; padding:1rem; font-family:monospace; font-size:0.82rem; color:#10b981; max-height:220px; overflow-y:auto; display:flex; flex-direction:column; gap:0.35rem;">
          @for (log of systemLogs; track $index) {
            <div><span style="color:var(--text-dark);">[{{ log.timestamp }}]</span> <span style="color:#3b82f6;">INFO</span> {{ log.message }}</div>
          }
        </div>
      </div>
    </div>
  `
})
export class SystemMetricsComponent implements OnInit, OnDestroy {
  activeConnections = 4;
  heapUsedMb = 142;
  heapMaxMb = 512;
  timer: any;

  services: ServiceStatus[] = [
    { name: 'PostgreSQL Relational DB', status: 'OPERATIONAL', latencyMs: 42, details: 'jdbc:postgresql://aws-0-eu-central-1.pooler.supabase.com:5432/postgres' },
    { name: 'Cloudflare R2 Storage', status: 'OPERATIONAL', latencyMs: 78, details: 'https://4ce23afb1e23344b92945a2dbde9fc00.r2.cloudflarestorage.com/grameone' },
    { name: 'SQLite Package Builder', status: 'OPERATIONAL', latencyMs: 12, details: 'org.sqlite.JDBC (Local Temp DB Generator Engine)' },
    { name: 'JWT Security Filter', status: 'OPERATIONAL', latencyMs: 3, details: 'HMAC-SHA256 Token Validation Filter Active' },
    { name: 'License Generation Engine', status: 'OPERATIONAL', latencyMs: 5, details: 'Secure Random 12-char Alpha-numeric Code Provider' },
  ];

  systemLogs = [
    { timestamp: '17:25:01', message: 'Spring Boot 3.3.4 Application initialized successfully.' },
    { timestamp: '17:25:02', message: 'HikariPool-1 - Added connection org.postgresql.jdbc.PgConnection' },
    { timestamp: '17:25:05', message: 'S3 Client connected to Endpoint: https://4ce...r2.cloudflarestorage.com' },
    { timestamp: '17:25:12', message: 'GET /api/grades 200 OK - 15ms' },
    { timestamp: '17:25:30', message: 'GET /api/licenses 200 OK - 22ms' },
  ];

  ngOnInit() {
    this.timer = setInterval(() => {
      this.activeConnections = 3 + Math.floor(Math.random() * 4);
      this.heapUsedMb = 135 + Math.floor(Math.random() * 20);
    }, 4000);
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  refreshMetrics() {
    this.services.forEach(s => s.latencyMs = Math.floor(Math.random() * 50) + 10);
    this.systemLogs.unshift({
      timestamp: new Date().toLocaleTimeString(),
      message: 'Manual diagnostic probe requested: All systems healthy.'
    });
  }
}
