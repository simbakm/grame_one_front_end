import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Grade, GradeVersion } from '../../services/api.service';

@Component({
  selector: 'app-package-publishing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="content-header">
      <div>
        <div class="breadcrumbs">Publishing &rsaquo; Package Distribution</div>
        <h1 class="page-title">Package Publisher</h1>
      </div>
    </div>

    <div style="padding: 0 1.75rem 1.75rem;">
      <div style="display:grid; grid-template-columns:1fr 1.6fr; gap:1.5rem;">
        <!-- Publish Form -->
        <div>
          <div class="card">
            <div class="card-header"><div class="card-title">🚀 Publish New Package</div></div>
            <div class="form-group">
              <label class="form-label">Select Grade</label>
              <select class="form-input" [(ngModel)]="selectedGradeId" (change)="loadHistory()">
                <option value="">-- Select Grade --</option>
                @for (g of grades; track g.id) {
                  <option [value]="g.id">{{ g.name }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Changelog / Release Notes</label>
              <textarea class="form-input" [(ngModel)]="changelog" rows="4"
                        placeholder="e.g. Added algebra questions, fixed topic structure..."></textarea>
            </div>
            <button class="btn btn-primary" style="width:100%; justify-content:center;"
                    [disabled]="!selectedGradeId || publishing" (click)="publish()">
              @if (publishing) {
                <span class="spin-icon">⟳</span> Building &amp; Uploading to R2...
              } @else {
                📦 Build SQLite + Upload to Cloudflare R2
              }
            </button>

            @if (publishResult) {
              <div style="margin-top:1rem; padding:0.75rem; border-radius:8px; border:1px solid var(--primary); background:var(--badge-success-bg);">
                <div style="color:var(--primary); font-weight:600; margin-bottom:0.25rem;">✅ Published Successfully!</div>
                <div style="font-size:0.85rem; color:var(--text-muted);">Version: <strong>{{ publishResult.version }}</strong></div>
                <div style="font-size:0.8rem; color:var(--text-muted);">{{ publishResult.packageR2Url }}</div>
              </div>
            }
          </div>

          <!-- How it works -->
          <div class="card" style="margin-top:1.5rem;">
            <div class="card-header"><div class="card-title">ℹ️ How Publishing Works</div></div>
            <div style="font-size:0.85rem; color:var(--text-muted); display:flex; flex-direction:column; gap:0.6rem;">
              <div>1️⃣ Spring Boot queries all content for the selected grade from PostgreSQL</div>
              <div>2️⃣ Generates a structured <code>content.db</code> SQLite database</div>
              <div>3️⃣ Bundles media files referenced in content</div>
              <div>4️⃣ Creates <code>grade_v1.0.zip</code> archive</div>
              <div>5️⃣ Uploads ZIP to Cloudflare R2 storage</div>
              <div>6️⃣ Registers version in <code>grade_versions</code> table</div>
              <div>7️⃣ Mobile apps detect new version on next check-in</div>
            </div>
          </div>
        </div>

        <!-- Version History -->
        <div>
          <div class="card">
            <div class="card-header">
              <div class="card-title">📜 Version History</div>
              @if (selectedGradeId) {
                <span class="badge badge-info">{{ selectedGradeName }}</span>
              }
            </div>
            @if (!selectedGradeId) {
              <div style="text-align:center; padding:3rem; color:var(--text-muted);">Select a grade to view history</div>
            }
            @if (selectedGradeId && versions.length === 0) {
              <div style="text-align:center; padding:2rem; color:var(--text-muted);">No versions published yet.</div>
            }
            @for (v of versions; track v.id) {
              <div style="padding:1rem; border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:flex-start;">
                <div style="flex:1;">
                  <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
                    <span style="font-weight:700; color:var(--text-light);">v{{ v.version }}</span>
                    @if (v.isLatest) { <span class="badge badge-success">Latest</span> }
                  </div>
                  <div style="font-size:0.8rem; color:var(--text-muted);">
                    {{ v.publishedAt | date:'medium' }} &bull;
                    {{ v.packageSizeBytes ? (v.packageSizeBytes / 1048576).toFixed(1) + ' MB' : 'Size unknown' }}
                  </div>
                  @if (v.changelog) {
                    <div style="font-size:0.82rem; color:var(--text-muted); margin-top:0.3rem; font-style:italic;">{{ v.changelog }}</div>
                  }
                  @if (v.checksumSha256) {
                    <div style="font-size:0.75rem; color:var(--text-dark); margin-top:0.2rem;">SHA256: {{ v.checksumSha256 }}</div>
                  }
                </div>
                @if (!v.isLatest) {
                  <button class="btn btn-secondary" style="padding:0.35rem 0.8rem; font-size:0.8rem;" (click)="rollback(v.version)">⏪ Rollback</button>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`.spin-icon { display:inline-block; animation: spin 1s linear infinite; }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`]
})
export class PackagePublishingComponent implements OnInit {
  grades: Grade[] = [];
  versions: GradeVersion[] = [];
  selectedGradeId: number | '' = '';
  changelog = '';
  publishing = false;
  publishResult: GradeVersion | null = null;

  get selectedGradeName(): string {
    const g = this.grades.find(g => g.id === Number(this.selectedGradeId));
    return g?.name || '';
  }

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getGrades().subscribe(g => this.grades = g);
  }

  loadHistory() {
    if (!this.selectedGradeId) return;
    this.api.getVersionHistory(Number(this.selectedGradeId)).subscribe(v => this.versions = v);
  }

  publish() {
    if (!this.selectedGradeId) return;
    this.publishing = true;
    this.api.publishPackage(Number(this.selectedGradeId), this.changelog).subscribe({
      next: (v) => { this.publishResult = v; this.publishing = false; this.loadHistory(); },
      error: () => { alert('Publishing failed — ensure backend is running.'); this.publishing = false; }
    });
  }

  rollback(version: string) {
    if (!this.selectedGradeId) return;
    if (!confirm(`Rollback to v${version}?`)) return;
    this.api.rollbackVersion(Number(this.selectedGradeId), version).subscribe(() => this.loadHistory());
  }
}
