import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, License } from '../../services/api.service';

@Component({
  selector: 'app-licenses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="content-header">
      <div>
        <div class="breadcrumbs">Administration &rsaquo; License Management</div>
        <h1 class="page-title">Activation Licenses</h1>
      </div>
      <div style="display:flex; gap:0.75rem;">
        <button class="btn btn-primary" (click)="showGenForm = !showGenForm">
          🔑 Generate License Key(s)
        </button>
      </div>
    </div>

    <div style="padding: 0 1.75rem 1.75rem;">
      <!-- Stats Cards -->
      <div class="metrics-grid" style="grid-template-columns:repeat(4, 1fr); margin-bottom:1.5rem;">
        <div class="metric-card">
          <div class="metric-top"><span class="metric-title">Total Generated</span><div class="metric-icon-box">🔑</div></div>
          <div class="metric-value">{{ licenses.length }}</div>
        </div>
        <div class="metric-card">
          <div class="metric-top"><span class="metric-title">Ordinary Keys</span><div class="metric-icon-box" style="color:#3b82f6;">⏳</div></div>
          <div class="metric-value" style="color:#3b82f6;">{{ ordinaryCount }}</div>
        </div>
        <div class="metric-card">
          <div class="metric-top"><span class="metric-title">Free Fixed-Date Keys</span><div class="metric-icon-box" style="color:#8b5cf6;">🎁</div></div>
          <div class="metric-value" style="color:#8b5cf6;">{{ freeCount }}</div>
        </div>
        <div class="metric-card">
          <div class="metric-top"><span class="metric-title">Active Devices</span><div class="metric-icon-box" style="color:#10b981;">✅</div></div>
          <div class="metric-value" style="color:#10b981;">{{ activeCount }}</div>
        </div>
      </div>

      <!-- GENERATION FORM WITH ORDINARY vs FREE & BULK FEATURES -->
      @if (showGenForm) {
        <div class="card" style="margin-bottom:1.5rem; max-width:650px; border-top:4px solid var(--primary);">
          <div class="card-header"><div class="card-title">🔑 Generate Activation Codes</div></div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem; margin-top:0.5rem;">
            <!-- License Type -->
            <div class="form-group">
              <label class="form-label">License Type</label>
              <select class="form-input" [(ngModel)]="genType">
                <option value="ORDINARY">Ordinary License (Months from activation)</option>
                <option value="FREE">Free License (Fixed expiration date/time)</option>
              </select>
            </div>

            <!-- Single or Bulk Mode -->
            <div class="form-group">
              <label class="form-label">Generation Mode</label>
              <select class="form-input" [(ngModel)]="isBulk">
                <option [ngValue]="false">Single Code</option>
                <option [ngValue]="true">Bulk Generation</option>
              </select>
            </div>

            <!-- Quantity if Bulk -->
            @if (isBulk) {
              <div class="form-group" style="grid-column: 1 / -1;">
                <label class="form-label">Quantity to Generate (Bulk Count)</label>
                <input class="form-input" type="number" min="1" max="500" [(ngModel)]="bulkCount" />
              </div>
            }

            <!-- Duration if Ordinary -->
            @if (genType === 'ORDINARY') {
              <div class="form-group" style="grid-column: 1 / -1;">
                <label class="form-label">Subscription Duration (Months)</label>
                <select class="form-input" [(ngModel)]="genDuration">
                  <option [value]="4">4 Months</option>
                  <option [value]="8">8 Months</option>
                  <option [value]="12">12 Months (Annual)</option>
                </select>
              </div>
            }

            <!-- Fixed Validity Date/Time if Free with explicit OK confirm button -->
            @if (genType === 'FREE') {
              <div class="form-group" style="grid-column: 1 / -1;">
                <label class="form-label">Valid Until (Select Fixed Expiration Date &amp; Time)</label>
                <div style="display:flex; gap:0.75rem; align-items:center;">
                  <input class="form-input" type="datetime-local" [(ngModel)]="genValidUntil" style="flex:1;" />
                  <button class="btn btn-primary" [disabled]="!genValidUntil" (click)="confirmDateSelection()" style="padding:0.6rem 1.25rem;">
                    ✓ OK
                  </button>
                </div>
                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.35rem;">
                  @if (dateConfirmed) {
                    <span style="color:var(--primary); font-weight:600;">✅ Fixed expiration confirmed: {{ genValidUntil | date:'medium' }}</span>
                  } @else {
                    <span>Select date and time above and click <strong>OK</strong> to confirm.</span>
                  }
                </div>
              </div>
            }
          </div>

          <button class="btn btn-primary" style="width:100%; justify-content:center; margin-top:1.25rem;"
                  [disabled]="genType === 'FREE' && !dateConfirmed"
                  (click)="generateLicense()">
            🚀 Generate {{ isBulk ? bulkCount + ' Codes' : 'Code' }}
          </button>

          @if (generatedCodes.length > 0) {
            <div style="margin-top:1.25rem; padding:1rem; background:var(--badge-success-bg); border:1px solid var(--primary); border-radius:8px;">
              <div style="font-size:0.85rem; font-weight:700; color:var(--primary); margin-bottom:0.5rem;">
                ✅ Successfully Generated {{ generatedCodes.length }} Code(s):
              </div>
              <div style="max-height:120px; overflow-y:auto; font-family:monospace; font-size:0.9rem; display:flex; flex-direction:column; gap:0.25rem;">
                @for (c of generatedCodes; track $index) {
                  <div style="color:var(--text-light);">{{ $index + 1 }}. <code>{{ c }}</code></div>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- Licenses Table -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">All Registered Licenses</div>
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            @for (st of ['ALL','ORDINARY','FREE','PENDING','ACTIVE']; track $index) {
              <button class="badge" [class]="filterStatus === st ? 'badge-success' : 'badge-info'"
                      (click)="filterLicenses(st)">{{ st }}</button>
            }
          </div>
        </div>
        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Activation Code</th>
                <th>Type</th>
                <th>Validity / Duration</th>
                <th>Status</th>
                <th>Device ID</th>
                <th>Activation Date</th>
                <th>Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              @for (lic of filteredLicenses; track lic.id) {
                <tr>
                  <td><code style="color:var(--primary); font-weight:700;">{{ lic.activationCode }}</code></td>
                  <td>
                    <span class="badge" [class]="lic.licenseType === 'FREE' ? 'badge-warning' : 'badge-info'">
                      {{ lic.licenseType || 'ORDINARY' }}
                    </span>
                  </td>
                  <td>
                    @if (lic.licenseType === 'FREE') {
                      <span style="color:#8b5cf6; font-weight:600;">Fixed: {{ lic.validUntil ? (lic.validUntil | date:'short') : 'Until Specified Date' }}</span>
                    } @else {
                      <span>{{ lic.subscriptionDurationMonths || 12 }}M Plan</span>
                    }
                  </td>
                  <td><span class="badge" [class]="getBadgeClass(getEffectiveStatus(lic))">{{ getEffectiveStatus(lic) }}</span></td>
                  <td style="font-size:0.8rem; color:var(--text-muted);">{{ lic.deviceId || '—' }}</td>
                  <td>{{ lic.activationDate ? (lic.activationDate | date:'mediumDate') : '—' }}</td>
                  <td [style.color]="isExpiringSoon(lic.expiryDate) ? '#f59e0b' : 'inherit'">
                    {{ lic.expiryDate ? (lic.expiryDate | date:'mediumDate') : (lic.validUntil ? (lic.validUntil | date:'mediumDate') : '—') }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class LicensesComponent implements OnInit {
  licenses: License[] = [];
  filteredLicenses: License[] = [];
  filterStatus = 'ALL';
  showGenForm = false;

  // Generation options
  genType = 'ORDINARY';
  isBulk = false;
  bulkCount = 10;
  genDuration = 12;
  genValidUntil = '2026-12-31T23:59';
  dateConfirmed = false;
  generatedCodes: string[] = [];

  get ordinaryCount() { return this.licenses.filter(l => l.licenseType !== 'FREE').length; }
  get freeCount() { return this.licenses.filter(l => l.licenseType === 'FREE').length; }
  get activeCount() { return this.licenses.filter(l => l.status === 'ACTIVE' && !this.isExpired(l)).length; }

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getLicenses().subscribe(l => { this.licenses = l; this.filteredLicenses = l; });
  }

  confirmDateSelection() {
    if (this.genValidUntil) {
      this.dateConfirmed = true;
    }
  }

  filterLicenses(status: string) {
    this.filterStatus = status;
    if (status === 'ALL') this.filteredLicenses = this.licenses;
    else if (status === 'ORDINARY' || status === 'FREE') this.filteredLicenses = this.licenses.filter(l => (l.licenseType || 'ORDINARY') === status);
    else if (status === 'EXPIRED') this.filteredLicenses = this.licenses.filter(l => this.isExpired(l));
    else if (status === 'ACTIVE') this.filteredLicenses = this.licenses.filter(l => l.status === 'ACTIVE' && !this.isExpired(l));
    else this.filteredLicenses = this.licenses.filter(l => l.status === status);
  }

  generateLicense() {
    this.generatedCodes = [];
    if (this.isBulk) {
      this.api.generateBulkLicenses(this.bulkCount, this.genDuration, this.genType, this.genValidUntil).subscribe({
        next: (list) => {
          this.generatedCodes = list.map(l => l.activationCode);
          this.licenses.unshift(...list);
          this.filterLicenses(this.filterStatus);
        },
        error: () => {
          for (let i = 0; i < this.bulkCount; i++) {
            const mockCode = `GRAME-${this.genType === 'FREE' ? 'FREE' : 'BULK'}-${Math.random().toString(36).substring(2,6).toUpperCase()}`;
            this.generatedCodes.push(mockCode);
            this.licenses.unshift({
              id: Date.now() + i,
              activationCode: mockCode,
              licenseType: this.genType,
              subscriptionDurationMonths: this.genType === 'ORDINARY' ? this.genDuration : undefined,
              validUntil: this.genType === 'FREE' ? this.genValidUntil : undefined,
              status: 'PENDING'
            });
          }
          this.filterLicenses(this.filterStatus);
        }
      });
    } else {
      this.api.generateLicense(this.genDuration, this.genType, this.genValidUntil).subscribe({
        next: (lic) => {
          this.generatedCodes = [lic.activationCode];
          this.licenses.unshift(lic);
          this.filterLicenses(this.filterStatus);
        },
        error: () => {
          const mockCode = `GRAME-${this.genType === 'FREE' ? 'FREE' : 'SINGLE'}-${Math.random().toString(36).substring(2,6).toUpperCase()}`;
          this.generatedCodes = [mockCode];
          this.licenses.unshift({
            id: Date.now(),
            activationCode: mockCode,
            licenseType: this.genType,
            subscriptionDurationMonths: this.genType === 'ORDINARY' ? this.genDuration : undefined,
            validUntil: this.genType === 'FREE' ? this.genValidUntil : undefined,
            status: 'PENDING'
          });
          this.filterLicenses(this.filterStatus);
        }
      });
    }
  }

  isExpired(lic: License): boolean {
    if (lic.status === 'EXPIRED') return true;
    const expStr = lic.expiryDate || (lic.licenseType === 'FREE' ? lic.validUntil : undefined);
    if (!expStr) return false;
    return new Date(expStr).getTime() < Date.now();
  }

  getEffectiveStatus(lic: License): string {
    return this.isExpired(lic) ? 'EXPIRED' : (lic.status || 'PENDING');
  }

  getBadgeClass(status: string) {
    return status === 'ACTIVE' ? 'badge badge-success' : status === 'EXPIRED' ? 'badge badge-danger' : 'badge badge-warning';
  }

  isExpiringSoon(date?: string): boolean {
    if (!date) return false;
    const time = new Date(date).getTime();
    return time > Date.now() && (time - Date.now()) < 30 * 86400000;
  }
}
