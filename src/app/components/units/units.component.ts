import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Unit, Topic } from '../../services/api.service';

@Component({
  selector: 'app-units',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="content-header">
      <div>
        <div class="breadcrumbs">Academic Hierarchy &rsaquo; Unit Management</div>
        <h1 class="page-title">Units</h1>
      </div>
      <button class="btn btn-primary" (click)="showForm = !showForm">➕ Add Unit</button>
    </div>
    <div style="padding: 0 1.75rem 1.75rem;">
      @if (showForm) {
        <div class="card" style="margin-bottom:1.5rem;">
          <div class="card-header"><div class="card-title">Add New Unit</div></div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
            <div class="form-group">
              <label class="form-label">Topic</label>
              <select class="form-input" [(ngModel)]="formTopicId">
                @for (t of topics; track t.id) {
                  <option [value]="t.id">{{ t.name }} ({{ t.subject?.name }})</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Unit Number</label>
              <input class="form-input" type="number" [(ngModel)]="formUnitNumber" />
            </div>
            <div class="form-group" style="grid-column:1/-1;">
              <label class="form-label">Unit Name</label>
              <input class="form-input" [(ngModel)]="formName" placeholder="e.g. Unit 1: Addition" />
            </div>
          </div>
          <div style="display:flex; gap:0.75rem; margin-top:1rem;">
            <button class="btn btn-primary" (click)="saveUnit()">Create Unit</button>
            <button class="btn btn-secondary" (click)="showForm = false">Cancel</button>
          </div>
        </div>
      }
      <div class="card">
        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr><th>#</th><th>Unit Name</th><th>Topic</th><th>Subject</th></tr>
            </thead>
            <tbody>
              @for (u of units; track u.id) {
                <tr>
                  <td><span class="badge badge-info">{{ u.unitNumber || '—' }}</span></td>
                  <td><strong>{{ u.name }}</strong></td>
                  <td>{{ u.topic?.name }}</td>
                  <td>{{ u.topic?.subject?.name }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class UnitsComponent implements OnInit {
  units: Unit[] = [];
  topics: Topic[] = [];
  showForm = false;
  formName = ''; formUnitNumber = 1; formTopicId: number | null = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getTopics().subscribe(t => { this.topics = t; if (t.length) this.formTopicId = t[0].id; });
    this.api.getUnits().subscribe(u => this.units = u);
  }

  saveUnit() {
    if (!this.formTopicId) return;
    this.api.createUnit(this.formTopicId, { name: this.formName, unitNumber: this.formUnitNumber })
      .subscribe(u => { this.units.push(u); this.showForm = false; });
  }
}
