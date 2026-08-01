import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Concept, Unit } from '../../services/api.service';

@Component({
  selector: 'app-concepts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="content-header">
      <div>
        <div class="breadcrumbs">Academic Hierarchy &rsaquo; Concept Management</div>
        <h1 class="page-title">Concepts</h1>
      </div>
      <button class="btn btn-primary" (click)="showForm = !showForm">➕ Add Concept</button>
    </div>
    <div style="padding: 0 1.75rem 1.75rem;">
      @if (showForm) {
        <div class="card" style="margin-bottom:1.5rem;">
          <div class="card-header"><div class="card-title">Add New Concept</div></div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
            <div class="form-group">
              <label class="form-label">Unit</label>
              <select class="form-input" [(ngModel)]="formUnitId">
                @for (u of units; track u.id) {
                  <option [value]="u.id">{{ u.name }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Concept Name</label>
              <input class="form-input" [(ngModel)]="formName" placeholder="e.g. Order of Operations" />
            </div>
            <div class="form-group" style="grid-column:1/-1;">
              <label class="form-label">Summary</label>
              <textarea class="form-input" [(ngModel)]="formSummary" rows="2" placeholder="Brief concept summary..."></textarea>
            </div>
            <div class="form-group" style="grid-column:1/-1;">
              <label class="form-label">Key Takeaways</label>
              <textarea class="form-input" [(ngModel)]="formKeyTakeaways" rows="2" placeholder="Key points students will learn..."></textarea>
            </div>
          </div>
          <div style="display:flex; gap:0.75rem; margin-top:1rem;">
            <button class="btn btn-primary" (click)="saveConcept()">Create Concept</button>
            <button class="btn btn-secondary" (click)="showForm = false">Cancel</button>
          </div>
        </div>
      }
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(340px,1fr)); gap:1.25rem;">
        @for (c of concepts; track c.id) {
          <div class="card">
            <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:0.75rem;">
              <div class="metric-icon-box" style="font-size:1.25rem;">💡</div>
              <span class="badge badge-info">{{ c.unit?.name }}</span>
            </div>
            <div style="font-size:1.1rem; font-weight:700; margin-bottom:0.5rem;">{{ c.name }}</div>
            @if (c.summary) {
              <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.75rem;">{{ c.summary }}</div>
            }
            @if (c.keyTakeaways) {
              <div style="font-size:0.8rem; background:var(--bg-input); border-radius:6px; padding:0.5rem;">
                <strong style="color:var(--primary);">Key Takeaways:</strong><br>{{ c.keyTakeaways }}
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class ConceptsComponent implements OnInit {
  concepts: Concept[] = [];
  units: Unit[] = [];
  showForm = false;
  formName = ''; formSummary = ''; formKeyTakeaways = ''; formUnitId: number | null = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getUnits().subscribe(u => { this.units = u; if (u.length) this.formUnitId = u[0].id; });
    this.api.getConcepts().subscribe(c => this.concepts = c);
  }

  saveConcept() {
    if (!this.formUnitId) return;
    this.api.createConcept(this.formUnitId, { name: this.formName, summary: this.formSummary, keyTakeaways: this.formKeyTakeaways })
      .subscribe(c => { this.concepts.push(c); this.showForm = false; });
  }
}
