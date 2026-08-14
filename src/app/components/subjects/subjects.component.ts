import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Subject, Grade, Topic, Unit, Concept, Question } from '../../services/api.service';

type DrillLevel = 'subjects' | 'topics' | 'units' | 'concepts' | 'questions';

interface Breadcrumb { label: string; action?: () => void; }

@Component({
  selector: 'app-subjects',
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
      <div class="modal-card">
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
          <p class="delete-warning-text">⚠️ You are about to permanently delete this subject and <strong>all its associated data</strong> (topics, units, concepts and questions).</p>
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

    <div class="content-header">
      <div>
        <div class="breadcrumbs">Academic Hierarchy &rsaquo; Subject Management &amp; Drilldown</div>
        <h1 class="page-title">Subjects</h1>
      </div>
      <div style="display:flex; align-items:center; gap:0.75rem;">
        @if (isLoading) {
          <div style="font-size:0.82rem; color:var(--primary); display:flex; align-items:center; gap:0.4rem;">
            <span class="spin-icon">⟳</span> Loading...
          </div>
        }
        @if (currentLevel === 'subjects') {
          <button class="btn btn-primary" (click)="showForm = !showForm">➕ Add Subject</button>
        }
      </div>
    </div>

    <div style="padding: 0 1.75rem 1.75rem;">
      <!-- Breadcrumb Trail -->
      @if (currentLevel !== 'subjects') {
        <div class="card" style="margin-bottom:1.25rem; padding:0.85rem 1.25rem; background:var(--bg-input);">
          <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
            @for (crumb of breadcrumbs; track $index; let last = $last) {
              @if (!last) {
                <span (click)="crumb.action && crumb.action()" style="color:var(--text-muted); cursor:pointer;"
                      onmouseover="this.style.color='#10b981'" onmouseout="this.style.color='#9ca3af'">{{ crumb.label }}</span>
                <span style="color:var(--text-dark);">&rsaquo;</span>
              } @else {
                <span style="color:var(--primary); font-weight:600;">{{ crumb.label }}</span>
              }
            }
          </div>
        </div>
      }

      @if (currentLevel === 'subjects') {
        <!-- Grade Filter Pills -->
        <div style="display:flex; gap:0.75rem; margin-bottom:1.25rem; flex-wrap:wrap;">
          <button class="badge" [class]="selectedGradeId === null ? 'badge-success' : 'badge-info'"
                  (click)="filterByGrade(null)">All Grades</button>
          @for (grade of grades; track grade.id) {
            <button class="badge" [class]="selectedGradeId === grade.id ? 'badge-success' : 'badge-info'"
                    (click)="filterByGrade(grade.id)">{{ grade.name }}</button>
          }
        </div>

        @if (showForm) {
          <div class="card" style="margin-bottom:1.5rem;">
            <div class="card-header"><div class="card-title">Add New Subject</div></div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
              <div class="form-group">
                <label class="form-label">Grade</label>
                <select class="form-input" [(ngModel)]="formGradeId">
                  @for (g of grades; track g.id) {
                    <option [value]="g.id">{{ g.name }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Language</label>
                <select class="form-input" [(ngModel)]="formLang">
                  <option value="English">English</option>
                  <option value="Shona">Shona</option>
                  <option value="Ndebele">Ndebele</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Subject Name</label>
                <input class="form-input" [(ngModel)]="formName" placeholder="e.g. Mathematics" />
              </div>
              <div class="form-group">
                <label class="form-label">Code</label>
                <input class="form-input" [(ngModel)]="formCode" placeholder="e.g. MATH" />
              </div>
            </div>
            <div style="display:flex; gap:0.75rem; margin-top:1rem;">
              <button class="btn btn-primary" (click)="saveSubject()">Create Subject</button>
              <button class="btn btn-secondary" (click)="showForm = false">Cancel</button>
            </div>
          </div>
        }
      }

      <!-- LOADING SKELETON -->
      @if (isLoading) {
        <div class="metrics-grid">
          @for (i of skeletonItems; track $index) {
            <div class="metric-card skeleton-card" style="min-height:130px;">
              <div style="width:40%; height:0.7rem; border-radius:4px; background:var(--bg-input); margin-bottom:0.75rem;"></div>
              <div style="width:70%; height:1.2rem; border-radius:4px; background:var(--bg-input); margin-bottom:0.5rem;"></div>
              <div style="width:50%; height:0.65rem; border-radius:4px; background:var(--bg-input);"></div>
            </div>
          }
        </div>
      } @else {

        <!-- SUBJECTS CARDS GRID — compact, matches grade cards -->
        @if (currentLevel === 'subjects') {
          <div class="metrics-grid">
            @for (subject of filteredSubjects; track subject.id) {
              <div class="metric-card" (click)="drillToTopics(subject)" style="cursor:pointer;">
                <div class="metric-top">
                  <span class="metric-title">{{ subject.grade?.name || 'Subject' }}</span>
                  <div style="display:flex; gap:0.4rem;" (click)="$event.stopPropagation()">
                    <button class="action-btn action-btn-delete" title="Delete subject" (click)="requestDelete(subject.id)">
                      <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="metric-value">{{ subject.name }}</div>
                <div class="metric-footer">Click to view topics &rarr;</div>
              </div>
            }
            @if (filteredSubjects.length === 0) {
              <div class="card" style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--text-muted);">
                No subjects found for the selected grade filter.
              </div>
            }
          </div>
        }

        <!-- LEVEL 2: TOPICS CARDS -->
        @if (currentLevel === 'topics') {
          <div class="metrics-grid">
            @for (top of topics; track top.id) {
              <div class="metric-card" (click)="drillToUnits(top)" style="cursor:pointer;">
                <div class="metric-top">
                  <span class="metric-title">Topic #{{ top.topicNumber || 1 }}</span>
                  <div class="metric-icon-box">📌</div>
                </div>
                <div class="metric-value">{{ top.name }}</div>
                <div class="metric-footer">Click to view units &rarr;</div>
              </div>
            }
            @if (topics.length === 0) {
              <div class="card" style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--text-muted);">No topics found.</div>
            }
          </div>
        }

        <!-- LEVEL 3: UNITS CARDS -->
        @if (currentLevel === 'units') {
          <div class="metrics-grid">
            @for (u of units; track u.id) {
              <div class="metric-card" (click)="drillToConcepts(u)" style="cursor:pointer;">
                <div class="metric-top">
                  <span class="metric-title">Unit #{{ u.unitNumber || 1 }}</span>
                  <div class="metric-icon-box">📑</div>
                </div>
                <div class="metric-value">{{ u.name }}</div>
                <div class="metric-footer">Click to view concepts &rarr;</div>
              </div>
            }
            @if (units.length === 0) {
              <div class="card" style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--text-muted);">No units found.</div>
            }
          </div>
        }

        <!-- LEVEL 4: CONCEPTS CARDS -->
        @if (currentLevel === 'concepts') {
          <div class="metrics-grid">
            @for (c of concepts; track c.id) {
              <div class="metric-card" (click)="drillToQuestions(c)" style="cursor:pointer;">
                <div class="metric-top">
                  <span class="metric-title">Concept</span>
                  <div class="metric-icon-box">💡</div>
                </div>
                <div class="metric-value" style="font-size:1.2rem;">{{ c.name }}</div>
                <div style="font-size:0.8rem; color:var(--text-muted); margin:0.5rem 0;">{{ c.summary || 'Summary unavailable' }}</div>
                <div class="metric-footer">Click to view questions &rarr;</div>
              </div>
            }
            @if (concepts.length === 0) {
              <div class="card" style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--text-muted);">No concepts found.</div>
            }
          </div>
        }

        <!-- LEVEL 5: QUESTIONS -->
        @if (currentLevel === 'questions') {
          <div style="display:flex; flex-direction:column; gap:1rem;">
            @for (q of questions; track q.id) {
              <div class="card">
                <div style="display:flex; justify-content:space-between; margin-bottom:0.75rem; flex-wrap:wrap; gap:0.5rem;">
                  <span class="badge badge-info" style="font-size:0.9rem; font-weight:700;">🔑 {{ q.questionCode || ('7M' + q.id) }}</span>
                  <span class="badge badge-success">{{ q.difficulty }}</span>
                </div>
                <div style="font-size:1.05rem; font-weight:600; margin-bottom:1rem;">{{ q.questionText }}</div>
                @if (q.answerOptions) {
                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin-bottom:0.75rem;">
                    @for (opt of q.answerOptions; track opt.id) {
                      <div [style.background]="opt.isCorrect ? 'var(--badge-success-bg)' : 'var(--bg-input)'"
                           [style.border]="opt.isCorrect ? '1px solid var(--primary)' : '1px solid var(--border-color)'"
                           style="border-radius:6px; padding:0.5rem 0.75rem; font-size:0.875rem;">
                        {{ opt.isCorrect ? '✅' : '⚪' }} {{ opt.optionText }}
                      </div>
                    }
                  </div>
                }
              </div>
            }
            @if (questions.length === 0) {
              <div class="card" style="text-align:center; padding:3rem; color:var(--text-muted);">No questions found.</div>
            }
          </div>
        }
      }
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
    .modal-card {
      background: #1E293B;
      border: 1px solid rgba(239,68,68,0.3);
      border-radius: 14px;
      width: 100%;
      max-width: 420px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }
    .modal-header {
      padding: 20px 24px 0;
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .modal-warning-icon {
      flex-shrink: 0;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: rgba(239,68,68,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal-title-danger { margin: 0; color: #EF4444; font-size: 18px; font-weight: 700; }
    .modal-body { padding: 16px 24px; }
    .delete-warning-text { color: #CBD5E1; font-size: 14px; margin: 0 0 10px; line-height: 1.6; }
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
    .btn-modal-cancel { background: #334155; color: #F8FAFC; border: none; padding: 9px 18px; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-modal-delete { background: #EF4444; color: #fff; border: none; padding: 9px 18px; border-radius: 8px; font-weight: 700; cursor: pointer; }
    .btn-modal-delete:disabled { opacity: 0.55; cursor: not-allowed; }

    /* ── Red delete icon button ── */
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
    .action-btn:hover { opacity: 0.8; transform: scale(1.1); }
    .action-btn-delete { background: rgba(239,68,68,0.18); color: #EF4444; }

    /* ── Spinner ── */
    .spin-icon { display:inline-block; animation: spin 1s linear infinite; }
    @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
    .skeleton-card { animation: pulse 1.5s ease-in-out infinite; }
    @keyframes pulse { 0%, 100% { opacity:1; } 50% { opacity:0.4; } }
  `]
})
export class SubjectsComponent implements OnInit {
  grades: Grade[] = [];
  subjects: Subject[] = [];
  filteredSubjects: Subject[] = [];
  topics: Topic[] = [];
  units: Unit[] = [];
  concepts: Concept[] = [];
  questions: Question[] = [];

  currentLevel: DrillLevel = 'subjects';
  breadcrumbs: Breadcrumb[] = [];
  isLoading = false;
  skeletonItems = Array(6).fill(0);

  selectedGradeId: number | null = null;
  showForm = false;
  formName = ''; formCode = ''; formLang = 'English'; formGradeId: number | null = null;

  activeSubject: Subject | null = null;
  activeTopic: Topic | null = null;
  activeUnit: Unit | null = null;

  // Delete confirm
  showDeleteModal = false;
  pendingDeleteId: number | null = null;
  isDeleting = false;

  // Toast
  toast = { visible: false, message: '', error: false };
  private toastTimer: any;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.isLoading = true;
    this.api.getGrades().subscribe(g => { this.grades = g; if (g.length) this.formGradeId = g[0].id; });
    this.api.getSubjects().subscribe(s => {
      this.subjects = s;
      this.filteredSubjects = s;
      this.isLoading = false;
    });
  }

  showToast(message: string, error = false) {
    clearTimeout(this.toastTimer);
    this.toast = { visible: true, message, error };
    this.toastTimer = setTimeout(() => { this.toast.visible = false; }, 3000);
  }

  filterByGrade(gradeId: number | null) {
    this.selectedGradeId = gradeId;
    this.filteredSubjects = gradeId ? this.subjects.filter(s => s.grade?.id === gradeId) : this.subjects;
  }

  resetToSubjects() {
    this.currentLevel = 'subjects';
    this.breadcrumbs = [];
  }

  drillToTopics(subject: Subject) {
    this.activeSubject = subject;
    this.currentLevel = 'topics';
    this.isLoading = true;
    this.breadcrumbs = [
      { label: 'All Subjects', action: () => this.resetToSubjects() },
      { label: subject.name }
    ];
    this.api.getTopics(subject.id).subscribe(t => { this.topics = t; this.isLoading = false; });
  }

  drillToUnits(topic: Topic) {
    this.activeTopic = topic;
    this.currentLevel = 'units';
    this.isLoading = true;
    this.breadcrumbs = [
      { label: 'All Subjects', action: () => this.resetToSubjects() },
      { label: this.activeSubject?.name || 'Subject', action: () => this.drillToTopics(this.activeSubject!) },
      { label: topic.name }
    ];
    this.api.getUnits(topic.id).subscribe(u => { this.units = u; this.isLoading = false; });
  }

  drillToConcepts(unit: Unit) {
    this.activeUnit = unit;
    this.currentLevel = 'concepts';
    this.isLoading = true;
    this.breadcrumbs = [
      { label: 'All Subjects', action: () => this.resetToSubjects() },
      { label: this.activeSubject?.name || 'Subject', action: () => this.drillToTopics(this.activeSubject!) },
      { label: this.activeTopic?.name || 'Topic', action: () => this.drillToUnits(this.activeTopic!) },
      { label: unit.name }
    ];
    this.api.getConcepts(unit.id).subscribe(c => { this.concepts = c; this.isLoading = false; });
  }

  drillToQuestions(concept: Concept) {
    this.currentLevel = 'questions';
    this.isLoading = true;
    this.breadcrumbs = [
      { label: 'All Subjects', action: () => this.resetToSubjects() },
      { label: this.activeSubject?.name || 'Subject', action: () => this.drillToTopics(this.activeSubject!) },
      { label: this.activeTopic?.name || 'Topic', action: () => this.drillToUnits(this.activeTopic!) },
      { label: this.activeUnit?.name || 'Unit', action: () => this.drillToConcepts(this.activeUnit!) },
      { label: concept.name }
    ];
    this.api.getQuestions({ conceptId: concept.id }).subscribe(q => { this.questions = q; this.isLoading = false; });
  }

  saveSubject() {
    if (!this.formGradeId) return;
    this.api.createSubject(this.formGradeId, { name: this.formName, code: this.formCode, language: this.formLang })
      .subscribe(s => { this.subjects.push(s); this.filteredSubjects = this.subjects; this.showForm = false; });
  }

  requestDelete(id: number) {
    this.pendingDeleteId = id;
    this.showDeleteModal = true;
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.pendingDeleteId = null;
  }

  confirmDelete() {
    if (!this.pendingDeleteId) return;
    this.isDeleting = true;
    const id = this.pendingDeleteId;
    this.api.deleteSubject(id).subscribe({
      next: () => {
        this.subjects = this.subjects.filter(s => s.id !== id);
        this.filteredSubjects = this.filteredSubjects.filter(s => s.id !== id);
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.pendingDeleteId = null;
        this.showToast('Subject deleted successfully.');
      },
      error: () => {
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.pendingDeleteId = null;
        this.showToast('Failed to delete subject.', true);
      }
    });
  }
}
