import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Topic, Subject, Grade, Unit, Concept, Question } from '../../services/api.service';

type DrillLevel = 'topics' | 'units' | 'concepts' | 'questions';

interface Breadcrumb { label: string; action?: () => void; }

@Component({
  selector: 'app-topics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="content-header">
      <div>
        <div class="breadcrumbs">Academic Hierarchy &rsaquo; Topic Management &amp; Drilldown</div>
        <h1 class="page-title">Topics</h1>
      </div>
      <div style="display:flex; align-items:center; gap:0.75rem;">
        @if (isLoading) {
          <div style="font-size:0.82rem; color:var(--primary); display:flex; align-items:center; gap:0.4rem;">
            <span class="spin-icon">⟳</span> Loading...
          </div>
        }
        @if (currentLevel === 'topics') {
          <button class="btn btn-primary" (click)="showForm = !showForm">➕ Add Topic</button>
        }
      </div>
    </div>

    <div style="padding: 0 1.75rem 1.75rem;">
      <!-- Grade & Subject Selector with fixed-width dropdowns -->
      @if (currentLevel === 'topics') {
        <div class="card" style="margin-bottom:1.25rem; padding:1.1rem 1.25rem; background:var(--bg-card); border-left:4px solid var(--primary);">
          <div style="display:grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr) auto; gap:1rem; align-items:flex-end;">

            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-size:0.8rem; display:flex; justify-content:space-between;">
                <span>Select Grade</span>
                @if (loadingSubjects) { <span class="spin-icon" style="color:var(--primary);">⟳</span> }
              </label>
              <select class="form-input" style="width:100%; box-sizing:border-box; text-overflow:ellipsis;"
                      [(ngModel)]="selectedGradeId" (change)="onGradeChange()" [disabled]="loadingSubjects">
                @for (g of grades; track g.id) {
                  <option [value]="g.id">{{ g.name }}</option>
                }
              </select>
            </div>

            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-size:0.8rem; display:flex; justify-content:space-between;">
                <span>Select Subject</span>
                @if (loadingSubjects) { <span class="spin-icon" style="color:var(--primary);">⟳</span> }
              </label>
              <select class="form-input" style="width:100%; box-sizing:border-box; text-overflow:ellipsis;"
                      [(ngModel)]="selectedSubjectId" (change)="onSubjectChange()" [disabled]="loadingSubjects || isLoading">
                @if (loadingSubjects) {
                  <option>⟳ Loading subjects...</option>
                } @else {
                  @for (s of filteredSubjects; track s.id) {
                    <option [value]="s.id">{{ s.name }} ({{ s.language }})</option>
                  }
                }
              </select>
            </div>

            <div style="display:flex; align-items:center; gap:0.5rem; padding-bottom:0.1rem;">
              <span class="badge badge-success" style="font-size:0.82rem; padding:0.4rem 0.8rem; white-space:nowrap;">
                {{ getActiveGradeName() }} &bull; {{ getActiveSubjectName() }}
              </span>
            </div>
          </div>
        </div>
      }

      <!-- Breadcrumbs for Drilldown -->
      @if (currentLevel !== 'topics') {
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

      @if (showForm && currentLevel === 'topics') {
        <div class="card" style="margin-bottom:1.5rem;">
          <div class="card-header"><div class="card-title">Add New Topic</div></div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
            <div class="form-group">
              <label class="form-label">Subject</label>
              <select class="form-input" [(ngModel)]="formSubjectId">
                @for (s of subjects; track s.id) {
                  <option [value]="s.id">{{ s.name }} ({{ s.grade?.name }})</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Topic Number</label>
              <input class="form-input" type="number" [(ngModel)]="formTopicNumber" />
            </div>
            <div class="form-group" style="grid-column:1/-1;">
              <label class="form-label">Topic Name</label>
              <input class="form-input" [(ngModel)]="formName" placeholder="e.g. Numbers & Algebra" />
            </div>
          </div>
          <div style="display:flex; gap:0.75rem; margin-top:1rem;">
            <button class="btn btn-primary" (click)="saveTopic()">Create Topic</button>
            <button class="btn btn-secondary" (click)="showForm = false">Cancel</button>
          </div>
        </div>
      }

      <!-- LOADING SKELETON (shared across all levels) -->
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

        <!-- TOPICS CARDS GRID -->
        @if (currentLevel === 'topics') {
          <div class="metrics-grid">
            @for (t of topics; track t.id) {
              <div class="metric-card" (click)="drillToUnits(t)" style="cursor:pointer;">
                <div class="metric-top">
                  <span class="metric-title">Topic #{{ t.topicNumber || 1 }}</span>
                  <span class="badge badge-info" style="font-size:0.75rem;">{{ getActiveSubjectName() }}</span>
                </div>
                <div class="metric-value" style="font-size:1.4rem; margin-top:0.25rem;">{{ t.name }}</div>
                <div style="font-size:0.8rem; color:var(--text-muted); margin-top:0.3rem;">
                  {{ getActiveGradeName() }} &bull; {{ getActiveSubjectName() }}
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.75rem;">
                  <div class="metric-footer" style="color:var(--primary); margin:0;">Drill into Units &rarr;</div>
                  <button class="icon-btn" title="Delete Topic" (click)="$event.stopPropagation(); deleteTopic(t.id)">🗑️</button>
                </div>
              </div>
            }
            @if (topics.length === 0) {
              <div class="card" style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--text-muted);">
                No topics found for {{ getActiveSubjectName() }} under {{ getActiveGradeName() }}.
              </div>
            }
          </div>
        }

        <!-- LEVEL 2: UNITS DRILLDOWN CARDS -->
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
              <div class="card" style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--text-muted);">No units found for this topic.</div>
            }
          </div>
        }

        <!-- LEVEL 3: CONCEPTS DRILLDOWN CARDS -->
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
              <div class="card" style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--text-muted);">No concepts found for this unit.</div>
            }
          </div>
        }

        <!-- LEVEL 4: QUESTIONS DRILLDOWN -->
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
export class TopicsComponent implements OnInit {
  grades: Grade[] = [];
  subjects: Subject[] = [];
  filteredSubjects: Subject[] = [];
  topics: Topic[] = [];
  units: Unit[] = [];
  concepts: Concept[] = [];
  questions: Question[] = [];

  selectedGradeId: number | null = null;
  selectedSubjectId: number | null = null;

  currentLevel: DrillLevel = 'topics';
  breadcrumbs: Breadcrumb[] = [];
  isLoading = false;
  loadingSubjects = false;
  skeletonItems = Array(6).fill(0);

  activeTopic: Topic | null = null;
  activeUnit: Unit | null = null;

  showForm = false;
  formName = ''; formTopicNumber = 1; formSubjectId: number | null = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getGrades().subscribe(g => {
      this.grades = g;
      const g7 = g.find(grade => grade.name.includes('7') || grade.code.includes('7')) || g[g.length - 1];
      if (g7) this.selectedGradeId = g7.id;
      this.loadSubjectsForGrade();
    });
  }

  loadSubjectsForGrade() {
    this.loadingSubjects = true;
    this.isLoading = true;
    this.api.getSubjects(this.selectedGradeId || undefined).subscribe(s => {
      this.subjects = s;
      this.filteredSubjects = s;
      this.loadingSubjects = false;
      const math = s.find(sub => sub.name.toLowerCase().includes('math')) || s[0];
      if (math) {
        this.selectedSubjectId = math.id;
        this.formSubjectId = math.id;
      }
      this.loadTopics();
    });
  }

  onGradeChange() {
    this.loadSubjectsForGrade();
  }

  onSubjectChange() {
    this.loadTopics();
  }

  loadTopics() {
    if (!this.selectedSubjectId) {
      this.isLoading = false;
      return;
    }
    this.isLoading = true;
    this.api.getTopics(this.selectedSubjectId).subscribe(t => {
      this.topics = t;
      this.isLoading = false;
    });
  }

  getActiveGradeName(): string {
    const g = this.grades.find(x => x.id === Number(this.selectedGradeId));
    return g ? g.name : 'Grade 7';
  }

  getActiveSubjectName(): string {
    const s = this.subjects.find(x => x.id === Number(this.selectedSubjectId));
    return s ? s.name : 'Mathematics';
  }

  resetToTopics() {
    this.currentLevel = 'topics';
    this.breadcrumbs = [];
  }

  drillToUnits(topic: Topic) {
    this.activeTopic = topic;
    this.currentLevel = 'units';
    this.isLoading = true;
    this.breadcrumbs = [
      { label: 'All Topics (' + this.getActiveSubjectName() + ')', action: () => this.resetToTopics() },
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
      { label: 'All Topics', action: () => this.resetToTopics() },
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
      { label: 'All Topics', action: () => this.resetToTopics() },
      { label: this.activeTopic?.name || 'Topic', action: () => this.drillToUnits(this.activeTopic!) },
      { label: this.activeUnit?.name || 'Unit', action: () => this.drillToConcepts(this.activeUnit!) },
      { label: concept.name }
    ];
    this.api.getQuestions({ conceptId: concept.id }).subscribe(q => {
      this.questions = q;
      this.isLoading = false;
    });
  }

  saveTopic() {
    if (!this.formSubjectId) return;
    this.api.createTopic(this.formSubjectId, { name: this.formName, topicNumber: this.formTopicNumber })
      .subscribe(t => { this.topics.push(t); this.showForm = false; });
  }

  deleteTopic(id: number) {
    if (confirm('WARNING: Deleting this topic will PERMANENTLY delete all its units, concepts, questions, and options for this subject/grade! Continue?')) {
      this.api.deleteTopic(id).subscribe(() => {
        this.topics = this.topics.filter(t => t.id !== id);
      });
    }
  }
}
