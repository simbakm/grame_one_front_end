import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Question, Grade, Subject, Topic, Unit, Concept, AnswerOption } from '../../services/api.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-questions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="content-header">
      <div>
        <div class="breadcrumbs">Academic Hierarchy &rsaquo; Question Management</div>
        <h1 class="page-title">Questions</h1>
      </div>
      <div style="display:flex; gap:0.75rem;">
        <a routerLink="/csv-import" class="btn btn-secondary">📥 CSV Import</a>
      </div>
    </div>

    <div style="padding: 0 1.75rem 1.75rem;">
      <!-- HIERARCHICAL CASCADING FILTERS WITH FIXED WIDTH DROPDOWNS -->
      <div class="card" style="margin-bottom:1.5rem; padding:1.25rem; background:var(--bg-card); border-top:4px solid var(--primary);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.85rem;">
          <div style="font-weight:600; font-size:0.95rem; color:var(--primary);">
            🎯 Hierarchical Content Filters
          </div>
          @if (loadingQuestions || loadingSubjects || loadingTopics || loadingUnits || loadingConcepts) {
            <div style="font-size:0.8rem; color:var(--primary); display:flex; align-items:center; gap:0.35rem;">
              <span class="spin-icon">⟳</span> Fetching content details...
            </div>
          }
        </div>

        <!-- 5 EQUAL FIXED-WIDTH COLUMNS GRID -->
        <div style="display:grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap:0.75rem; width:100%;">

          <!-- 1. Grade -->
          <div class="filter-col">
            <label class="form-label" style="font-size:0.8rem; white-space:nowrap;">1. Grade</label>
            <select class="form-input fixed-select" [(ngModel)]="filterGradeId" (change)="onGradeChange()">
              <option [ngValue]="null">All Grades</option>
              @for (g of grades; track g.id) {
                <option [ngValue]="g.id">{{ g.name }}</option>
              }
            </select>
          </div>

          <!-- 2. Subject -->
          <div class="filter-col">
            <label class="form-label" style="font-size:0.8rem; white-space:nowrap; display:flex; justify-content:space-between;">
              <span>2. Subject</span>
              @if (loadingSubjects) { <span style="color:var(--primary); font-size:0.75rem;">⟳</span> }
            </label>
            <select class="form-input fixed-select" [(ngModel)]="filterSubjectId" (change)="onSubjectChange()" [disabled]="loadingSubjects">
              <option [ngValue]="null">{{ loadingSubjects ? '⟳ Loading...' : 'All Subjects' }}</option>
              @for (s of subjects; track s.id) {
                <option [ngValue]="s.id">{{ s.name }}</option>
              }
            </select>
          </div>

          <!-- 3. Topic -->
          <div class="filter-col">
            <label class="form-label" style="font-size:0.8rem; white-space:nowrap; display:flex; justify-content:space-between;">
              <span>3. Topic</span>
              @if (loadingTopics) { <span style="color:var(--primary); font-size:0.75rem;">⟳</span> }
            </label>
            <select class="form-input fixed-select" [(ngModel)]="filterTopicId" (change)="onTopicChange()" [disabled]="loadingTopics">
              <option [ngValue]="null">{{ loadingTopics ? '⟳ Loading...' : 'All Topics' }}</option>
              @for (t of topics; track t.id) {
                <option [ngValue]="t.id">{{ t.name }}</option>
              }
            </select>
          </div>

          <!-- 4. Unit -->
          <div class="filter-col">
            <label class="form-label" style="font-size:0.8rem; white-space:nowrap; display:flex; justify-content:space-between;">
              <span>4. Unit</span>
              @if (loadingUnits) { <span style="color:var(--primary); font-size:0.75rem;">⟳</span> }
            </label>
            <select class="form-input fixed-select" [(ngModel)]="filterUnitId" (change)="onUnitChange()" [disabled]="loadingUnits">
              <option [ngValue]="null">{{ loadingUnits ? '⟳ Loading...' : 'All Units' }}</option>
              @for (u of units; track u.id) {
                <option [ngValue]="u.id">{{ u.name }}</option>
              }
            </select>
          </div>

          <!-- 5. Concept -->
          <div class="filter-col">
            <label class="form-label" style="font-size:0.8rem; white-space:nowrap; display:flex; justify-content:space-between;">
              <span>5. Concept</span>
              @if (loadingConcepts) { <span style="color:var(--primary); font-size:0.75rem;">⟳</span> }
            </label>
            <select class="form-input fixed-select" [(ngModel)]="filterConceptId" (change)="applyFilter()" [disabled]="loadingConcepts">
              <option [ngValue]="null">{{ loadingConcepts ? '⟳ Loading...' : 'All Concepts' }}</option>
              @for (c of concepts; track c.id) {
                <option [ngValue]="c.id">{{ c.name }}</option>
              }
            </select>
          </div>
        </div>

        <!-- SEARCH ROW WITH ENTER TRIGGER AND DEDICATED SEARCH BUTTON -->
        <div style="display:flex; gap:0.75rem; align-items:flex-end; margin-top:1.1rem; pt:1rem; border-top:1px solid var(--border-color);">
          <div class="form-group" style="margin:0; flex:1;">
            <label class="form-label" style="font-size:0.8rem;">Search by Question ID (e.g. 7M01 or 1) or Text</label>
            <input class="form-input"
                   [(ngModel)]="filterSearchInput"
                   (keyup.enter)="applyFilter()"
                   placeholder="Type question ID (e.g. 7M01) or text, then press Enter or click Search..." />
          </div>
          <button class="btn btn-primary" (click)="applyFilter()" style="padding:0.65rem 1.4rem;">
            🔍 Search
          </button>
        </div>
      </div>

      <!-- MAIN PAGE QUESTIONS AREA WITH LOADING SPINNER -->
      @if (loadingQuestions) {
        <div class="card" style="text-align:center; padding:3.5rem; background:var(--bg-card);">
          <div class="spin-icon" style="font-size:2.2rem; color:var(--primary); margin-bottom:0.75rem;">⟳</div>
          <div style="font-size:1.1rem; font-weight:600; color:var(--text-light);">Fetching Questions...</div>
          <div style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem;">Updating question list for selected hierarchy parameters.</div>
        </div>
      } @else {
        <div style="display:flex; flex-direction:column; gap:1.25rem;">
          @for (q of filteredQuestions; track q.id) {
            <div class="card" style="position:relative;">

              <!-- EDIT QUESTION INLINE FORM -->
              @if (editingQuestionId === q.id) {
                <div style="background:var(--bg-input); padding:1.25rem; border-radius:10px; border:2px solid var(--primary); margin-bottom:1rem;">
                  <div style="font-weight:700; font-size:1rem; margin-bottom:0.75rem; color:var(--primary); display:flex; justify-content:space-between; align-items:center;">
                    <span>✏️ Edit Question Details (ID: {{ q.questionCode || formatQuestionCode(q) }})</span>
                    <button class="btn btn-secondary" style="padding:0.2rem 0.6rem; font-size:0.8rem;" (click)="cancelEdit()">✕ Cancel</button>
                  </div>

                  <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.85rem;">
                    <div class="form-group" style="grid-column: 1 / -1; margin:0;">
                      <label class="form-label" style="font-size:0.8rem;">Question Text</label>
                      <textarea class="form-input" [(ngModel)]="editFormText" rows="3"></textarea>
                    </div>

                    <!-- Reading Comprehension Passage -->
                    <div class="form-group" style="grid-column: 1 / -1; margin:0;">
                      <label class="form-label" style="font-size:0.8rem;">📖 Reading Comprehension Passage / Story (Optional)</label>
                      <textarea class="form-input" [(ngModel)]="editFormComprehensionText" rows="3" placeholder="Enter story passage if this question is based on reading comprehension..."></textarea>
                    </div>

                    <!-- Image / Diagram Upload -->
                    <div class="form-group" style="grid-column: 1 / -1; margin:0;">
                      <label class="form-label" style="font-size:0.8rem;">🖼️ Picture / Diagram Upload (Optional)</label>
                      <div style="display:flex; gap:0.5rem; align-items:center;">
                        <input #editImgInput type="file" accept="image/*" class="form-input" style="flex:1; font-size:0.8rem;" />
                        <button class="btn btn-primary" style="font-size:0.8rem; padding:0.4rem 0.75rem;" (click)="uploadEditMedia(q.id, editImgInput)">
                          📤 Upload to R2
                        </button>
                      </div>
                      @if (editFormImageUrl || editFormDiagramUrl) {
                        <div style="font-size:0.8rem; color:var(--primary); margin-top:0.35rem;">
                          Current Picture: <code>{{ editFormImageUrl || editFormDiagramUrl }}</code>
                        </div>
                      }
                    </div>

                    <div class="form-group" style="margin:0;">
                      <label class="form-label" style="font-size:0.8rem;">Difficulty</label>
                      <select class="form-input" [(ngModel)]="editFormDifficulty">
                        <option value="EASY">EASY</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HARD">HARD</option>
                      </select>
                    </div>

                    <div class="form-group" style="margin:0;">
                      <label class="form-label" style="font-size:0.8rem;">Status</label>
                      <select class="form-input" [(ngModel)]="editFormStatus">
                        <option value="APPROVED">APPROVED</option>
                        <option value="DRAFT">DRAFT</option>
                      </select>
                    </div>

                    <div class="form-group" style="grid-column: 1 / -1; margin:0;">
                      <label class="form-label" style="font-size:0.8rem;">Explanation</label>
                      <textarea class="form-input" [(ngModel)]="editFormExplanation" rows="2"></textarea>
                    </div>
                  </div>

                  <!-- Options -->
                  <div style="margin-top:0.85rem;">
                    <label class="form-label" style="font-weight:600; color:var(--primary); font-size:0.85rem;">Answer Options</label>
                    <div style="display:flex; flex-direction:column; gap:0.4rem; margin-top:0.35rem;">
                      @for (opt of editFormOptions; track $index) {
                        <div style="display:flex; gap:0.6rem; align-items:center;">
                          <input type="radio" name="correctOpt_{{ q.id }}" [checked]="opt.isCorrect" (change)="setCorrectOption($index)" />
                          <input class="form-input" [(ngModel)]="opt.optionText" style="flex:1; padding:0.4rem 0.6rem;" placeholder="Option text" />
                          <span style="font-size:0.75rem; color:var(--text-muted);">{{ opt.isCorrect ? '✅ Correct' : 'Option' }}</span>
                        </div>
                      }
                    </div>
                  </div>

                  <div style="display:flex; gap:0.75rem; margin-top:1rem;">
                    <button class="btn btn-primary" (click)="saveQuestionEdit(q)">💾 Save Changes</button>
                    <button class="btn btn-secondary" (click)="cancelEdit()">Cancel</button>
                  </div>
                </div>
              }

              <!-- REGULAR QUESTION DISPLAY -->
              <div style="display:flex; justify-content:space-between; margin-bottom:0.75rem; flex-wrap:wrap; gap:0.5rem;">
                <div style="display:flex; gap:0.5rem; align-items:center;">
                  <span class="badge badge-info" style="font-size:0.95rem; font-weight:700; background:rgba(59,130,246,0.15); color:#3b82f6;">
                    🔑 ID: {{ q.questionCode || formatQuestionCode(q) }}
                  </span>
                  <span class="badge" [class]="getDifficultyClass(q.difficulty)">{{ q.difficulty }}</span>
                </div>

                <div style="display:flex; gap:0.5rem; align-items:center;">
                  <span class="badge" [class]="getStatusClass(q.status)">{{ q.status }}</span>
                  <button class="btn btn-secondary" style="padding:0.3rem 0.75rem; font-size:0.8rem;" (click)="openEditModal(q)">
                    ✏️ Edit Question
                  </button>
                </div>
              </div>

              <!-- 1. Interactive Reading Story Toggle Control -->
              @if (q.comprehensionText) {
                <div style="margin-bottom:0.75rem;">
                  <button class="btn btn-secondary" style="font-size:0.8rem; padding:0.35rem 0.75rem;" (click)="toggleStory(q.id)">
                    📖 {{ isStoryVisible(q.id) ? 'Hide Reading Passage' : 'View Reading Passage' }}
                  </button>
                  @if (isStoryVisible(q.id)) {
                    <div style="margin-top:0.5rem; font-size:0.9rem; color:var(--text-light); background:var(--bg-input); padding:0.85rem; border-radius:8px; border-left:3px solid var(--primary); white-space:pre-line;">
                      <strong style="color:var(--primary);">Reading Passage:</strong>
                      <p style="margin-top:0.35rem; margin-bottom:0;">{{ q.comprehensionText }}</p>
                    </div>
                  }
                </div>
              }

              <!-- 2. Interactive Picture / Diagram Toggle Control -->
              @if (q.imageUrl || q.diagramUrl) {
                <div style="margin-bottom:0.75rem;">
                  <button class="btn btn-secondary" style="font-size:0.8rem; padding:0.35rem 0.75rem;" (click)="toggleDiagram(q.id)">
                    🖼️ {{ isDiagramVisible(q.id) ? 'Hide Picture / Diagram' : 'View Picture / Diagram' }}
                  </button>
                  @if (isDiagramVisible(q.id)) {
                    <div style="margin-top:0.5rem; background:var(--bg-input); padding:0.5rem; border-radius:8px; text-align:center;">
                      <img [src]="q.imageUrl || q.diagramUrl" style="max-height:220px; max-width:100%; border-radius:6px; object-fit:contain;" alt="Question Picture" />
                    </div>
                  }
                </div>
              }

              <div style="font-size:1.15rem; font-weight:600; margin-bottom:1rem; color:var(--text-light);">
                {{ q.questionText }}
              </div>

              @if (q.answerOptions && q.answerOptions.length > 0) {
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin-bottom:0.75rem;">
                  @for (opt of q.answerOptions; track opt.id) {
                    <div [style.background]="opt.isCorrect ? 'var(--badge-success-bg)' : 'var(--bg-input)'"
                         [style.border]="opt.isCorrect ? '1px solid var(--primary)' : '1px solid var(--border-color)'"
                         style="border-radius:6px; padding:0.6rem 0.85rem; font-size:0.9rem; display:flex; align-items:center; gap:0.5rem;">
                      <span>{{ opt.isCorrect ? '✅' : '○' }}</span>
                      <span>{{ opt.optionText }}</span>
                    </div>
                  }
                </div>
              }

              @if (q.explanation) {
                <div style="font-size:0.85rem; color:var(--text-muted); background:var(--bg-input); padding:0.65rem; border-radius:6px; border-left:3px solid var(--primary);">
                  <strong>Explanation:</strong> {{ q.explanation }}
                </div>
              }
            </div>
          }

          @if (filteredQuestions.length === 0) {
            <div class="card" style="text-align:center; padding:3.5rem; color:var(--text-muted);">
              <div style="font-size:2.5rem; margin-bottom:0.75rem;">❓</div>
              <div style="font-size:1.1rem; font-weight:600;">No questions found for the selected filters.</div>
              <div style="font-size:0.85rem; margin-top:0.25rem;">Try searching by ID (e.g., "1" or "7M01") or adjusting your cascading grade/subject filters.</div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .filter-col {
      min-width: 0;
      width: 100%;
    }
    .fixed-select {
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      display: block;
    }
    .spin-icon {
      display: inline-block;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class QuestionsComponent implements OnInit {
  grades: Grade[] = [];
  subjects: Subject[] = [];
  topics: Topic[] = [];
  units: Unit[] = [];
  concepts: Concept[] = [];
  questions: Question[] = [];
  filteredQuestions: Question[] = [];

  // Filter Selections
  filterGradeId: number | null = null;
  filterSubjectId: number | null = null;
  filterTopicId: number | null = null;
  filterUnitId: number | null = null;
  filterConceptId: number | null = null;
  filterSearchInput = '';

  // Loading States
  loadingSubjects = false;
  loadingTopics = false;
  loadingUnits = false;
  loadingConcepts = false;
  loadingQuestions = false;

  // Inline Question Editing
  editingQuestionId: number | null = null;
  editFormText = '';
  editFormComprehensionText = '';
  editFormImageUrl = '';
  editFormDiagramUrl = '';
  editFormDifficulty = 'MEDIUM';
  editFormStatus = 'APPROVED';
  editFormExplanation = '';
  editFormOptions: AnswerOption[] = [];

  // Toggle Visibility for Reading Passage and Diagrams
  visibleStories: { [qId: number]: boolean } = {};
  visibleDiagrams: { [qId: number]: boolean } = {};

  toggleStory(qId: number) {
    this.visibleStories[qId] = !this.visibleStories[qId];
  }
  isStoryVisible(qId: number): boolean {
    return this.visibleStories[qId] !== false; // default open
  }

  toggleDiagram(qId: number) {
    this.visibleDiagrams[qId] = !this.visibleDiagrams[qId];
  }
  isDiagramVisible(qId: number): boolean {
    return this.visibleDiagrams[qId] !== false; // default open
  }

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getGrades().subscribe(g => {
      this.grades = g;
      const g7 = g.find(x => x.name.includes('7') || x.code.includes('7')) || g[g.length - 1];
      if (g7) this.filterGradeId = g7.id;

      this.onGradeChange();
    });
  }

  // 1. Grade Change -> Load Subjects
  onGradeChange() {
    this.loadingSubjects = true;
    this.loadingTopics = true;
    this.loadingUnits = true;
    this.loadingConcepts = true;
    this.loadingQuestions = true;

    this.api.getSubjects(this.filterGradeId || undefined).subscribe(s => {
      this.subjects = s;
      this.loadingSubjects = false;
      const math = s.find(sub => sub.name.toLowerCase().includes('math')) || s[0];
      this.filterSubjectId = math ? math.id : (s.length ? s[0].id : null);

      this.onSubjectChange();
    });
  }

  // 2. Subject Change -> Load Topics
  onSubjectChange() {
    this.loadingTopics = true;
    this.loadingUnits = true;
    this.loadingConcepts = true;
    this.loadingQuestions = true;

    this.api.getTopics(this.filterSubjectId || undefined).subscribe(t => {
      this.topics = t;
      this.loadingTopics = false;
      this.filterTopicId = t.length ? t[0].id : null;

      this.onTopicChange();
    });
  }

  // 3. Topic Change -> Load Units
  onTopicChange() {
    this.loadingUnits = true;
    this.loadingConcepts = true;
    this.loadingQuestions = true;

    this.api.getUnits(this.filterTopicId || undefined).subscribe(u => {
      this.units = u;
      this.loadingUnits = false;
      this.filterUnitId = u.length ? u[0].id : null;

      this.onUnitChange();
    });
  }

  // 4. Unit Change -> Load Concepts
  onUnitChange() {
    this.loadingConcepts = true;
    this.loadingQuestions = true;

    this.api.getConcepts(this.filterUnitId || undefined).subscribe(c => {
      this.concepts = c;
      this.loadingConcepts = false;
      this.filterConceptId = c.length ? c[0].id : null;

      this.loadQuestions();
    });
  }

  // 5. Load Questions & Apply Filter
  loadQuestions() {
    this.loadingQuestions = true;
    this.api.getQuestions().subscribe(q => {
      this.questions = q;
      this.applyFilter();
      this.loadingQuestions = false;
    });
  }

  formatQuestionCode(q: Question): string {
    if (q.questionCode) return q.questionCode;
    const num = q.questionNumber || q.id || 1;
    return `7M${String(num).padStart(2, '0')}`;
  }

  applyFilter() {
    const qTerm = this.filterSearchInput.trim().toLowerCase();

    this.filteredQuestions = this.questions.filter(q => {
      const qCode = (q.questionCode || this.formatQuestionCode(q)).toLowerCase();
      const qNum = String(q.questionNumber || q.id || '');

      let matchSearch = true;
      if (qTerm) {
        matchSearch = qCode.includes(qTerm) ||
                      qNum === qTerm ||
                      q.questionText.toLowerCase().includes(qTerm) ||
                      Boolean(q.comprehensionText && q.comprehensionText.toLowerCase().includes(qTerm)) ||
                      Boolean(q.explanation && q.explanation.toLowerCase().includes(qTerm));
      }

      return matchSearch;
    });
  }

  openEditModal(q: Question) {
    this.editingQuestionId = q.id;
    this.editFormText = q.questionText;
    this.editFormComprehensionText = q.comprehensionText || '';
    this.editFormImageUrl = q.imageUrl || '';
    this.editFormDiagramUrl = q.diagramUrl || '';
    this.editFormDifficulty = q.difficulty;
    this.editFormStatus = q.status;
    this.editFormExplanation = q.explanation || '';
    this.editFormOptions = q.answerOptions ? JSON.parse(JSON.stringify(q.answerOptions)) : [
      { optionText: 'Option A', isCorrect: true },
      { optionText: 'Option B', isCorrect: false },
      { optionText: 'Option C', isCorrect: false },
      { optionText: 'Option D', isCorrect: false },
    ];
  }

  uploadEditMedia(qId: number, fileInput: HTMLInputElement, type: string = 'image') {
    if (!fileInput.files || fileInput.files.length === 0) return;
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${environment.apiUrl}/questions/${qId}/upload-media`, true);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const res = JSON.parse(xhr.responseText);
        if (res.imageUrl) this.editFormImageUrl = res.imageUrl;
        if (res.diagramUrl) this.editFormDiagramUrl = res.diagramUrl;
      }
    };
    xhr.send(formData);
  }

  setCorrectOption(index: number) {
    this.editFormOptions.forEach((opt, idx) => opt.isCorrect = (idx === index));
  }

  saveQuestionEdit(q: Question) {
    const payload: Partial<Question> = {
      questionText: this.editFormText,
      comprehensionText: this.editFormComprehensionText,
      imageUrl: this.editFormImageUrl,
      diagramUrl: this.editFormDiagramUrl,
      difficulty: this.editFormDifficulty,
      status: this.editFormStatus,
      explanation: this.editFormExplanation,
      answerOptions: this.editFormOptions,
    };

    this.api.updateQuestion(q.id, payload).subscribe({
      next: (updated) => {
        const idx = this.questions.findIndex(x => x.id === updated.id);
        if (idx !== -1) this.questions[idx] = updated;
        this.cancelEdit();
        this.applyFilter();
      },
      error: () => {
        // Fallback local update
        q.questionText = this.editFormText;
        q.comprehensionText = this.editFormComprehensionText;
        q.imageUrl = this.editFormImageUrl;
        q.diagramUrl = this.editFormDiagramUrl;
        q.difficulty = this.editFormDifficulty;
        q.explanation = this.editFormExplanation;
        q.status = this.editFormStatus;
        q.answerOptions = this.editFormOptions;
        this.cancelEdit();
        this.applyFilter();
      }
    });
  }

  cancelEdit() {
    this.editingQuestionId = null;
  }

  getDifficultyClass(d: string) { return d === 'EASY' ? 'badge-success' : d === 'HARD' ? 'badge-danger' : 'badge-warning'; }
  getStatusClass(s: string) { return s === 'APPROVED' ? 'badge badge-success' : s === 'REJECTED' ? 'badge badge-danger' : 'badge badge-warning'; }
}
