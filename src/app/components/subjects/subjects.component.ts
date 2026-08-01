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

        <!-- SUBJECTS CARDS GRID -->
        @if (currentLevel === 'subjects') {
          <div class="metrics-grid">
            @for (subject of filteredSubjects; track subject.id) {
              <div class="metric-card" (click)="drillToTopics(subject)" style="cursor:pointer;">
                <div class="metric-top">
                  <span class="metric-title">{{ subject.code }}</span>
                  <span class="badge badge-info" style="font-size:0.75rem;">{{ subject.grade?.name }}</span>
                </div>
                <div class="metric-value" style="font-size:1.4rem; margin-top:0.25rem;">{{ subject.name }}</div>
                <div style="font-size:0.8rem; color:var(--text-muted); margin-top:0.3rem;">
                  Language: {{ subject.language || 'English' }} &bull; Questions: {{ subject.questionsCount || 0 }}
                </div>
                <div class="metric-footer" style="color:var(--primary); margin-top:0.75rem;">View Topics &rarr;</div>
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
    this.api.getTopics(subject.id).subscribe(t => {
      this.topics = t;
      this.isLoading = false;
    });
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
    this.api.getUnits(topic.id).subscribe(u => {
      this.units = u;
      this.isLoading = false;
    });
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
    this.api.getConcepts(unit.id).subscribe(c => {
      this.concepts = c;
      this.isLoading = false;
    });
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
    this.api.getQuestions({ conceptId: concept.id }).subscribe(q => {
      this.questions = q;
      this.isLoading = false;
    });
  }

  saveSubject() {
    if (!this.formGradeId) return;
    this.api.createSubject(this.formGradeId, { name: this.formName, code: this.formCode, language: this.formLang })
      .subscribe(s => { this.subjects.push(s); this.filteredSubjects = this.subjects; this.showForm = false; });
  }
}
