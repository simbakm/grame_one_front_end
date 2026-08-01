import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Grade, Subject, Topic, Unit, Concept, Question } from '../../services/api.service';

type HierarchyLevel = 'grades' | 'subjects' | 'topics' | 'units' | 'concepts' | 'questions';

interface BreadcrumbItem { label: string; action?: () => void; }

@Component({
  selector: 'app-hierarchy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="content-header">
      <div>
        <div class="breadcrumbs">Academic Hierarchy &rsaquo; Interactive Drilldown</div>
        <h1 class="page-title">Hierarchy Explorer</h1>
      </div>
    </div>

    <div style="padding: 0 1.75rem 1.75rem;">
      <!-- Breadcrumb Trail -->
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

      <!-- Loading -->
      @if (loading) {
        <div class="card" style="text-align:center; padding:3rem;">
          <div style="color:var(--primary); font-size:1.5rem; margin-bottom:0.5rem;">⟳</div>
          <div style="color:var(--text-muted);">Loading...</div>
        </div>
      }

      <!-- Grades Level -->
      @if (!loading && currentLevel === 'grades') {
        <div class="metrics-grid">
          @for (grade of grades; track grade.id) {
            <div class="metric-card" (click)="loadSubjects(grade)">
              <div class="metric-top">
                <span class="metric-title">{{ grade.code }}</span>
                <div class="metric-icon-box">📚</div>
              </div>
              <div class="metric-value">{{ grade.name }}</div>
              <div class="metric-footer">Click to view subjects &rarr;</div>
            </div>
          }
        </div>
      }

      <!-- Subjects Level -->
      @if (!loading && currentLevel === 'subjects') {
        <div class="metrics-grid">
          @for (subject of subjects; track subject.id) {
            <div class="metric-card" (click)="loadTopics(subject)">
              <div class="metric-top">
                <span class="metric-title">{{ subject.language || 'English' }}</span>
                <div class="metric-icon-box">📖</div>
              </div>
              <div class="metric-value">{{ subject.name }}</div>
              <div class="metric-footer">Click to view topics &rarr;</div>
            </div>
          }
        </div>
      }

      <!-- Topics Level -->
      @if (!loading && currentLevel === 'topics') {
        <div class="metrics-grid">
          @for (topic of topics; track topic.id) {
            <div class="metric-card" (click)="loadUnits(topic)">
              <div class="metric-top">
                <span class="metric-title">Topic #{{ topic.topicNumber || 1 }}</span>
                <div class="metric-icon-box">📌</div>
              </div>
              <div class="metric-value">{{ topic.name }}</div>
              <div class="metric-footer">Click to view units &rarr;</div>
            </div>
          }
        </div>
      }

      <!-- Units Level -->
      @if (!loading && currentLevel === 'units') {
        <div class="metrics-grid">
          @for (unit of units; track unit.id) {
            <div class="metric-card" (click)="loadConcepts(unit)">
              <div class="metric-top">
                <span class="metric-title">Unit #{{ unit.unitNumber || 1 }}</span>
                <div class="metric-icon-box">📑</div>
              </div>
              <div class="metric-value">{{ unit.name }}</div>
              <div class="metric-footer">Click to view concepts &rarr;</div>
            </div>
          }
        </div>
      }

      <!-- Concepts Level -->
      @if (!loading && currentLevel === 'concepts') {
        <div class="metrics-grid">
          @for (concept of concepts; track concept.id) {
            <div class="metric-card" (click)="loadQuestions(concept)">
              <div class="metric-top">
                <span class="metric-title">Concept</span>
                <div class="metric-icon-box">💡</div>
              </div>
              <div class="metric-value" style="font-size:1.3rem;">{{ concept.name }}</div>
              <div style="font-size:0.8rem; color:var(--text-muted); margin:0.5rem 0;">{{ concept.summary || 'Summary unavailable' }}</div>
              <div class="metric-footer">Click to view questions &rarr;</div>
            </div>
          }
        </div>
      }

      <!-- Questions Level -->
      @if (!loading && currentLevel === 'questions') {
        <div style="display:flex; flex-direction:column; gap:1rem;">
          @if (questions.length === 0) {
            <div class="card" style="text-align:center; padding:3rem; color:var(--text-muted);">No questions found.</div>
          }
          @for (q of questions; track q.id) {
            <div class="card">
              <div style="display:flex; justify-content:space-between; margin-bottom:0.75rem;">
                <span class="badge badge-info">{{ q.questionType }}</span>
                <span class="badge" [class]="getDifficultyClass(q.difficulty)">{{ q.difficulty }}</span>
              </div>
              <div style="font-size:1.1rem; font-weight:600; margin-bottom:1rem;">{{ q.questionText }}</div>
              @if (q.answerOptions) {
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin-bottom:0.75rem;">
                  @for (opt of q.answerOptions; track opt.id) {
                    <div style="padding:0.5rem 0.75rem; border-radius:6px;"
                         [style.background]="opt.isCorrect ? 'var(--badge-success-bg)' : 'var(--bg-input)'"
                         [style.border]="opt.isCorrect ? '1px solid var(--primary)' : '1px solid var(--border-color)'"
                         style="font-size:0.875rem;">
                      {{ opt.isCorrect ? '✅' : '⚪' }} {{ opt.optionText }}
                    </div>
                  }
                </div>
              }
              @if (q.explanation) {
                <div style="font-size:0.85rem; color:var(--text-muted); background:var(--bg-input); padding:0.5rem; border-radius:6px;">
                  <strong>Explanation:</strong> {{ q.explanation }}
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `
})
export class HierarchyComponent implements OnInit {
  currentLevel: HierarchyLevel = 'grades';
  breadcrumbs: BreadcrumbItem[] = [{ label: 'Grades' }];
  loading = false;

  grades: Grade[] = [];
  subjects: Subject[] = [];
  topics: Topic[] = [];
  units: Unit[] = [];
  concepts: Concept[] = [];
  questions: Question[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loading = true;
    this.api.getGrades().subscribe(g => { this.grades = g; this.loading = false; });
  }

  loadSubjects(grade: Grade) {
    this.loading = true;
    this.currentLevel = 'subjects';
    this.breadcrumbs = [
      { label: 'Grades', action: () => this.resetToGrades() },
      { label: grade.name }
    ];
    this.api.getSubjects(grade.id).subscribe(s => { this.subjects = s; this.loading = false; });
  }

  loadTopics(subject: Subject) {
    this.loading = true;
    this.currentLevel = 'topics';
    this.breadcrumbs = [
      { label: 'Grades', action: () => this.resetToGrades() },
      { label: subject.grade?.name || 'Grade', action: () => this.loadSubjects(subject.grade as Grade) },
      { label: subject.name }
    ];
    this.api.getTopics(subject.id).subscribe(t => { this.topics = t; this.loading = false; });
  }

  loadUnits(topic: Topic) {
    this.loading = true;
    this.currentLevel = 'units';
    this.breadcrumbs = [
      { label: 'Grades', action: () => this.resetToGrades() },
      { label: topic.subject?.grade?.name || 'Grade' },
      { label: topic.subject?.name || 'Subject', action: () => this.loadTopics(topic.subject as Subject) },
      { label: topic.name }
    ];
    this.api.getUnits(topic.id).subscribe(u => { this.units = u; this.loading = false; });
  }

  loadConcepts(unit: Unit) {
    this.loading = true;
    this.currentLevel = 'concepts';
    this.breadcrumbs = [
      { label: 'Grades', action: () => this.resetToGrades() },
      { label: unit.topic?.subject?.name || 'Subject' },
      { label: unit.topic?.name || 'Topic', action: () => this.loadUnits(unit.topic as Topic) },
      { label: unit.name }
    ];
    this.api.getConcepts(unit.id).subscribe(c => { this.concepts = c; this.loading = false; });
  }

  loadQuestions(concept: Concept) {
    this.loading = true;
    this.currentLevel = 'questions';
    this.breadcrumbs = [
      { label: 'Grades', action: () => this.resetToGrades() },
      { label: concept.unit?.topic?.subject?.name || 'Subject' },
      { label: concept.unit?.name || 'Unit', action: () => this.loadConcepts(concept.unit as Unit) },
      { label: concept.name }
    ];
    this.api.getQuestions({ conceptId: concept.id }).subscribe(q => { this.questions = q; this.loading = false; });
  }

  resetToGrades() {
    this.currentLevel = 'grades';
    this.breadcrumbs = [{ label: 'Grades' }];
  }

  getDifficultyClass(difficulty: string): string {
    if (difficulty === 'EASY') return 'badge badge-success';
    if (difficulty === 'HARD') return 'badge badge-danger';
    return 'badge badge-warning';
  }
}
