import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService, Question, Grade, Subject, AnswerOption } from '../../services/api.service';
import { environment } from '../../../environments/environment';

interface UnitGroup {
  unitName: string;
  questions: Question[];
}

interface TopicGroup {
  topicName: string;
  units: UnitGroup[];
}

@Component({
  selector: 'app-questions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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
      <!-- FILTERS ROW: ONLY GRADE & SUBJECT + SEARCH -->
      <div class="card" style="margin-bottom:1.5rem; padding:1.25rem; background:var(--bg-card); border-top:4px solid var(--primary);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.85rem;">
          <div style="font-weight:600; font-size:0.95rem; color:var(--primary);">
            🎯 Select Grade &amp; Subject
          </div>
          @if (loadingQuestions || loadingSubjects) {
            <div style="font-size:0.8rem; color:var(--primary); display:flex; align-items:center; gap:0.35rem;">
              <span class="spin-icon">⟳</span> Loading questions...
            </div>
          }
        </div>

        <!-- 2 FILTERS: GRADE & SUBJECT -->
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem; width:100%;">
          <!-- 1. Grade -->
          <div class="filter-col">
            <label class="form-label" style="font-size:0.85rem; font-weight:600;">1. Select Grade</label>
            <select class="form-input fixed-select" [(ngModel)]="filterGradeId" (change)="onGradeChange()">
              <option [ngValue]="null">All Grades</option>
              @for (g of grades; track g.id) {
                <option [ngValue]="g.id">{{ g.name }}</option>
              }
            </select>
          </div>

          <!-- 2. Subject -->
          <div class="filter-col">
            <label class="form-label" style="font-size:0.85rem; font-weight:600; display:flex; justify-content:space-between;">
              <span>2. Select Subject</span>
              @if (loadingSubjects) { <span style="color:var(--primary); font-size:0.75rem;">⟳</span> }
            </label>
            <select class="form-input fixed-select" [(ngModel)]="filterSubjectId" (change)="applyFilter()" [disabled]="loadingSubjects">
              <option [ngValue]="null">{{ loadingSubjects ? '⟳ Loading...' : 'All Subjects' }}</option>
              @for (s of subjects; track s.id) {
                <option [ngValue]="s.id">{{ s.name }}</option>
              }
            </select>
          </div>
        </div>

        <!-- SEARCH ROW WITH ENTER TRIGGER -->
        <div style="display:flex; gap:0.75rem; align-items:flex-end; margin-top:1.1rem; pt:1rem; border-top:1px solid var(--border-color);">
          <div class="form-group" style="margin:0; flex:1;">
            <label class="form-label" style="font-size:0.8rem;">Search by Question ID (e.g. 7M01) or Text</label>
            <input class="form-input"
                   [(ngModel)]="filterSearchInput"
                   (keyup.enter)="applyFilter()"
                   placeholder="Type question ID or keyword, then press Enter or click Search..." />
          </div>
          <button class="btn btn-primary" (click)="applyFilter()" style="padding:0.65rem 1.4rem;">
            🔍 Search
          </button>
        </div>
      </div>

      <!-- MAIN QUESTIONS LIST AREA -->
      @if (loadingQuestions) {
        <div class="card" style="text-align:center; padding:3.5rem; background:var(--bg-card);">
          <div class="spin-icon" style="font-size:2.2rem; color:var(--primary); margin-bottom:0.75rem;">⟳</div>
          <div style="font-size:1.1rem; font-weight:600; color:var(--text-light);">Fetching Questions...</div>
          <div style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem;">Loading question set for selected Grade &amp; Subject.</div>
        </div>
      } @else {
        <!-- TOPIC & UNIT BANNERS WITH GROUPED QUESTIONS -->
        @if (paginatedQuestions.length > 0) {
          <div style="display:flex; flex-direction:column; gap:1.5rem;">
            @for (topicGroup of groupedTopics; track topicGroup.topicName; let topicIdx = $index) {
              <div class="topic-section card" style="padding:0; overflow:hidden; border:1px solid #1e5138;">

                <!-- 1. TOPIC BANNER (Dark Green Background) -->
                <div [style.background]="getTopicBannerBg(topicIdx)"
                     style="padding:0.85rem 1.25rem; color:#ffffff; font-weight:700; font-size:1.1rem; display:flex; justify-content:space-between; align-items:center; letter-spacing:0.3px;">
                  <div style="display:flex; align-items:center; gap:0.6rem;">
                    <span style="font-size:1.2rem;">📚</span>
                    <span>Topic: {{ topicGroup.topicName }}</span>
                  </div>
                  <span style="font-size:0.8rem; background:rgba(255,255,255,0.2); padding:0.25rem 0.65rem; border-radius:12px; font-weight:600;">
                    {{ getTopicQuestionCount(topicGroup) }} question(s)
                  </span>
                </div>

                <div style="padding:1rem; display:flex; flex-direction:column; gap:1rem; background:var(--bg-card);">
                  @for (unitGroup of topicGroup.units; track unitGroup.unitName) {
                    <div style="border:1px solid var(--border-color); border-radius:8px; overflow:hidden;">

                      <!-- 2. UNIT BANNER (Light / Medium Green Background) -->
                      <div style="background:#2d6a4f; color:#ffffff; padding:0.65rem 1rem; font-weight:600; font-size:0.95rem; display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; align-items:center; gap:0.5rem;">
                          <span>📖</span>
                          <span>Unit: {{ unitGroup.unitName }}</span>
                        </div>
                        <span style="font-size:0.75rem; background:rgba(255,255,255,0.2); padding:0.2rem 0.5rem; border-radius:10px;">
                          {{ unitGroup.questions.length }} Qs
                        </span>
                      </div>

                      <!-- 3. QUESTION ROWS UNDER THIS UNIT (COLLAPSIBLE SINGLE LINE) -->
                      <div style="display:flex; flex-direction:column; divide-y:1px solid var(--border-color);">
                        @for (q of unitGroup.questions; track q.id) {
                          <div style="border-bottom:1px solid var(--border-color); background:var(--bg-card);">

                            <!-- SINGLE LINE COLLAPSED VIEW -->
                            <div (click)="toggleExpand(q.id)"
                                 style="padding:0.75rem 1rem; display:flex; justify-content:space-between; align-items:center; cursor:pointer; user-select:none; transition:background 0.15s;"
                                 class="question-single-row">
                              <div style="display:flex; align-items:center; gap:0.75rem; flex:1; min-width:0; overflow:hidden; padding-right:1rem;">
                                <!-- Chevron expand/collapse icon -->
                                <span style="font-weight:bold; color:var(--primary); font-size:0.9rem; min-width:18px;">
                                  {{ isExpanded(q.id) ? '▼' : '▶' }}
                                </span>

                                <!-- Question ID Code -->
                                <span class="badge badge-info" style="font-size:0.8rem; font-weight:700; white-space:nowrap;">
                                  ID: {{ q.questionCode || formatQuestionCode(q) }}
                                </span>

                                <!-- Single Line Truncated Question Text -->
                                <span style="font-size:0.95rem; font-weight:500; color:var(--text-light); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1;">
                                  {{ truncateText(q.questionText, 85) }}
                                </span>
                              </div>

                              <!-- Badges Right Side -->
                              <div style="display:flex; gap:0.4rem; align-items:center; flex-shrink:0;">
                                <!-- Concept Badge -->
                                @if (getConceptName(q)) {
                                  <span class="badge" style="background:rgba(59,130,246,0.1); color:#3b82f6; font-size:0.75rem; border:1px solid rgba(59,130,246,0.3);">
                                    💡 {{ getConceptName(q) }}
                                  </span>
                                }
                                <span class="badge" [class]="getDifficultyClass(q.difficulty)" style="font-size:0.75rem;">{{ q.difficulty }}</span>
                                <span class="badge" [class]="getStatusClass(q.status)" style="font-size:0.75rem;">{{ q.status }}</span>
                              </div>
                            </div>

                            <!-- EXPANDED DETAILED VIEW -->
                            @if (isExpanded(q.id)) {
                              <div style="padding:1.25rem; background:var(--bg-input); border-top:1px solid var(--border-color);">

                                <!-- EDIT INLINE FORM OR DETAILS -->
                                @if (editingQuestionId === q.id) {
                                  <div style="background:var(--bg-card); padding:1.25rem; border-radius:10px; border:2px solid var(--primary); margin-bottom:1rem;">
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

                                      <!-- Picture / Diagram Upload (Single Media Field) -->
                                      <div class="form-group" style="grid-column: 1 / -1; margin:0;">
                                        <label class="form-label" style="font-size:0.8rem;">🖼️ Picture / Diagram Upload (Optional)</label>
                                        <div style="display:flex; gap:0.5rem; align-items:center;">
                                          <input #editImgInput type="file" accept="image/*" class="form-input" style="flex:1; font-size:0.8rem;" />
                                          <button class="btn btn-primary" style="font-size:0.8rem; padding:0.4rem 0.75rem;" (click)="uploadEditMedia(q.id, editImgInput)">
                                            📤 Upload to R2
                                          </button>
                                        </div>
                                        @if (editFormImageUrl) {
                                          <div style="font-size:0.8rem; color:var(--primary); margin-top:0.35rem;">
                                            Current Media: <code>{{ editFormImageUrl }}</code>
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
                                } @else {
                                  <!-- FULL QUESTION READ VIEW -->
                                  <div style="display:flex; justify-content:space-between; margin-bottom:0.75rem; flex-wrap:wrap; gap:0.5rem;">
                                    <div style="display:flex; gap:0.5rem; align-items:center;">
                                      <span style="font-size:0.85rem; color:var(--primary); font-weight:600;">
                                        💡 Concept: {{ getConceptName(q) || 'General' }}
                                      </span>
                                    </div>
                                    <div style="display:flex; gap:0.5rem;">
                                      <button class="btn btn-secondary" style="padding:0.3rem 0.75rem; font-size:0.8rem;" (click)="openEditModal(q)">
                                        ✏️ Edit Question
                                      </button>
                                      <button class="btn btn-secondary" style="padding:0.3rem 0.75rem; font-size:0.8rem; background:rgba(239,68,68,0.15); color:#ef4444; border-color:rgba(239,68,68,0.3);" (click)="deleteQuestion(q.id)">
                                        🗑️ Delete
                                      </button>
                                    </div>
                                  </div>

                                  <!-- Reading Story -->
                                  @if (q.comprehensionText) {
                                    <div style="margin-bottom:0.75rem; font-size:0.9rem; color:var(--text-light); background:var(--bg-card); padding:0.85rem; border-radius:8px; border-left:3px solid var(--primary); white-space:pre-line;">
                                      <strong style="color:var(--primary);">Reading Passage:</strong>
                                      <p style="margin-top:0.35rem; margin-bottom:0;">{{ q.comprehensionText }}</p>
                                    </div>
                                  }

                                  <!-- Picture / Diagram -->
                                  @if (q.imageUrl || q.diagramUrl) {
                                    <div style="margin-bottom:0.75rem; background:var(--bg-card); padding:0.5rem; border-radius:8px; text-align:center;">
                                      <img [src]="resolveImageUrl(q.imageUrl || q.diagramUrl)" style="max-height:220px; max-width:100%; border-radius:6px; object-fit:contain;" alt="Question Picture" />
                                    </div>
                                  }

                                  <div style="font-size:1.05rem; font-weight:600; margin-bottom:1rem; color:var(--text-light);">
                                    {{ q.questionText }}
                                  </div>

                                  <!-- Options Grid -->
                                  @if (q.answerOptions && q.answerOptions.length > 0) {
                                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin-bottom:0.75rem;">
                                      @for (opt of q.answerOptions; track opt.id) {
                                        <div [style.background]="opt.isCorrect ? 'var(--badge-success-bg)' : 'var(--bg-card)'"
                                             [style.border]="opt.isCorrect ? '1px solid var(--primary)' : '1px solid var(--border-color)'"
                                             style="border-radius:6px; padding:0.6rem 0.85rem; font-size:0.9rem; display:flex; align-items:center; gap:0.5rem;">
                                          <span>{{ opt.isCorrect ? '✅' : '○' }}</span>
                                          <span>{{ opt.optionText }}</span>
                                        </div>
                                      }
                                    </div>
                                  }

                                  @if (q.explanation) {
                                    <div style="font-size:0.85rem; color:var(--text-muted); background:var(--bg-card); padding:0.65rem; border-radius:6px; border-left:3px solid var(--primary);">
                                      <strong>Explanation:</strong> {{ q.explanation }}
                                    </div>
                                  }
                                }
                              </div>
                            }
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- 4. PAGINATION CONTROLS AT BOTTOM -->
          <div class="card" style="margin-top:1.5rem; padding:1rem 1.25rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; background:var(--bg-card);">
            <!-- Page Size Dropdown -->
            <div style="display:flex; align-items:center; gap:0.5rem; font-size:0.85rem;">
              <span>Questions per page:</span>
              <select class="form-input" style="width:auto; padding:0.3rem 0.6rem; font-size:0.85rem;" [(ngModel)]="pageSize" (change)="onPageSizeChange()">
                <option [ngValue]="10">10</option>
                <option [ngValue]="25">25</option>
                <option [ngValue]="50">50</option>
                <option [ngValue]="100">100</option>
              </select>
            </div>

            <!-- Items Counter -->
            <div style="font-size:0.88rem; color:var(--text-muted); font-weight:500;">
              Showing {{ getShowingStart() }} – {{ getShowingEnd() }} of {{ filteredQuestions.length }} total questions
            </div>

            <!-- View More / Page Nav Buttons -->
            <div style="display:flex; gap:0.5rem; align-items:center;">
              @if (hasMoreQuestionsToDisplay()) {
                <button class="btn btn-primary" style="padding:0.45rem 1rem; font-size:0.85rem;" (click)="showMoreQuestions()">
                  ➕ View More (Show next {{ Math.min(pageSize, filteredQuestions.length - displayedCount) }})
                </button>
              } @else if (filteredQuestions.length > pageSize) {
                <button class="btn btn-secondary" style="padding:0.45rem 1rem; font-size:0.85rem;" (click)="resetPagination()">
                  ↩️ Reset to Page 1
                </button>
              }
            </div>
          </div>
        } @else {
          <!-- EMPTY STATE -->
          <div class="card" style="text-align:center; padding:3.5rem; color:var(--text-muted);">
            <div style="font-size:2.5rem; margin-bottom:0.75rem;">❓</div>
            <div style="font-size:1.1rem; font-weight:600;">No questions found for the selected grade/subject filter.</div>
            <div style="font-size:0.85rem; margin-top:0.25rem;">Try selecting a different Grade or Subject, or searching by ID (e.g. "7M01").</div>
          </div>
        }
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
    }
    .question-single-row:hover {
      background: rgba(16,185,129,0.06) !important;
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
  questions: Question[] = [];
  filteredQuestions: Question[] = [];

  // Paginated display subset
  paginatedQuestions: Question[] = [];
  groupedTopics: TopicGroup[] = [];

  // Filters (Only Grade & Subject now)
  filterGradeId: number | null = null;
  filterSubjectId: number | null = null;
  filterSearchInput = '';

  // Pagination Parameters
  pageSize = 10;
  displayedCount = 10;

  // Loading States
  loadingSubjects = false;
  loadingQuestions = false;

  // Expanded Row States
  expandedQuestions: { [qId: number]: boolean } = {};

  // Inline Question Editing
  editingQuestionId: number | null = null;
  editFormText = '';
  editFormComprehensionText = '';
  editFormImageUrl = '';
  editFormDifficulty = 'MEDIUM';
  editFormStatus = 'APPROVED';
  editFormExplanation = '';
  editFormOptions: AnswerOption[] = [];

  protected Math = Math;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getGrades().subscribe(g => {
      this.grades = g;
      const g7 = g.find(x => x.name.includes('7') || x.code.includes('7')) || g[g.length - 1];
      if (g7) this.filterGradeId = g7.id;

      this.onGradeChange();
    });
  }

  // 1. Grade Change -> Load Subjects for this Grade
  onGradeChange() {
    this.loadingSubjects = true;
    this.loadingQuestions = true;

    this.api.getSubjects(this.filterGradeId || undefined).subscribe(s => {
      this.subjects = s;
      this.loadingSubjects = false;
      const math = s.find(sub => sub.name.toLowerCase().includes('math')) || s[0];
      this.filterSubjectId = math ? math.id : (s.length ? s[0].id : null);

      this.loadQuestions();
    });
  }

  // 2. Load Questions & Apply Filters
  loadQuestions() {
    this.loadingQuestions = true;
    this.api.getQuestions().subscribe(q => {
      this.questions = q;
      this.applyFilter();
      this.loadingQuestions = false;
    });
  }

  applyFilter() {
    const qTerm = this.filterSearchInput.trim().toLowerCase();

    this.filteredQuestions = this.questions.filter(q => {
      // 1. Grade Filter
      if (this.filterGradeId !== null) {
        const qGradeId = q.concept?.unit?.topic?.subject?.grade?.id;
        if (qGradeId && qGradeId !== this.filterGradeId) return false;
      }

      // 2. Subject Filter
      if (this.filterSubjectId !== null) {
        const qSubId = q.concept?.unit?.topic?.subject?.id;
        if (qSubId && qSubId !== this.filterSubjectId) return false;
      }

      // 3. Search Term (Question Code, ID, or Text)
      if (qTerm) {
        const qCode = (q.questionCode || this.formatQuestionCode(q)).toLowerCase();
        const qNum = String(q.questionNumber || q.id || '');
        const matchSearch = qCode.includes(qTerm) ||
                      qNum === qTerm ||
                      q.questionText.toLowerCase().includes(qTerm) ||
                      Boolean(q.comprehensionText && q.comprehensionText.toLowerCase().includes(qTerm)) ||
                      Boolean(q.explanation && q.explanation.toLowerCase().includes(qTerm));
        if (!matchSearch) return false;
      }

      return true;
    });

    // Reset pagination to first page when filter changes
    this.displayedCount = this.pageSize;
    this.updatePaginatedQuestions();
  }

  updatePaginatedQuestions() {
    this.paginatedQuestions = this.filteredQuestions.slice(0, this.displayedCount);
    this.buildTopicGroups();
  }

  // Build hierarchical Topic -> Unit -> Question structure for displaying with Banners
  buildTopicGroups() {
    const topicMap = new Map<string, Map<string, Question[]>>();

    for (const q of this.paginatedQuestions) {
      const topicName = q.concept?.unit?.topic?.name || 'General Topic';
      const unitName  = q.concept?.unit?.name || 'General Unit';

      if (!topicMap.has(topicName)) {
        topicMap.set(topicName, new Map<string, Question[]>());
      }
      const unitMap = topicMap.get(topicName)!;
      if (!unitMap.has(unitName)) {
        unitMap.set(unitName, []);
      }
      unitMap.get(unitName)!.push(q);
    }

    this.groupedTopics = [];
    topicMap.forEach((unitMap, topicName) => {
      const units: UnitGroup[] = [];
      unitMap.forEach((questions, unitName) => {
        units.push({ unitName, questions });
      });
      this.groupedTopics.push({ topicName, units });
    });
  }

  getTopicQuestionCount(topicGroup: TopicGroup): number {
    return topicGroup.units.reduce((acc, u) => acc + u.questions.length, 0);
  }

  getTopicBannerBg(index: number): string {
    const colors = ['#1b4332', '#14532d', '#064e3b', '#0f5132'];
    return colors[index % colors.length];
  }

  // Single-line Expand/Collapse Toggle
  toggleExpand(qId: number) {
    this.expandedQuestions[qId] = !this.expandedQuestions[qId];
  }

  isExpanded(qId: number): boolean {
    return Boolean(this.expandedQuestions[qId]);
  }

  truncateText(text: string, limit: number): string {
    if (!text) return '';
    if (text.length <= limit) return text;
    return text.substring(0, limit).trim() + '...';
  }

  getConceptName(q: Question): string {
    return q.concept?.name || '';
  }

  formatQuestionCode(q: Question): string {
    if (q.questionCode) return q.questionCode;
    const num = q.questionNumber || q.id || 1;
    return `7M${String(num).padStart(2, '0')}`;
  }

  // Pagination Helpers
  showMoreQuestions() {
    this.displayedCount += this.pageSize;
    this.updatePaginatedQuestions();
  }

  onPageSizeChange() {
    this.displayedCount = this.pageSize;
    this.updatePaginatedQuestions();
  }

  hasMoreQuestionsToDisplay(): boolean {
    return this.displayedCount < this.filteredQuestions.length;
  }

  resetPagination() {
    this.displayedCount = this.pageSize;
    this.updatePaginatedQuestions();
  }

  getShowingStart(): number {
    return this.filteredQuestions.length === 0 ? 0 : 1;
  }

  getShowingEnd(): number {
    return Math.min(this.displayedCount, this.filteredQuestions.length);
  }

  resolveImageUrl(rawUrl?: string): string {
    if (!rawUrl || !rawUrl.trim()) return '';
    const url = rawUrl.trim();
    if (url.includes('cloudflarestorage.com')) {
      const parts = url.split('/grameone/');
      const key = parts.length > 1 ? parts[1] : url;
      return `${environment.apiUrl}/media/files/${key}`;
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${environment.apiUrl}/media/files/${url}`;
  }

  // Inline Question Editing
  openEditModal(q: Question) {
    this.editingQuestionId = q.id;
    this.editFormText = q.questionText;
    this.editFormComprehensionText = q.comprehensionText || '';
    this.editFormImageUrl = q.imageUrl || q.diagramUrl || '';
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

  uploadEditMedia(qId: number, fileInput: HTMLInputElement) {
    if (!fileInput.files || fileInput.files.length === 0) return;
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'image');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${environment.apiUrl}/questions/${qId}/upload-media`, true);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const res = JSON.parse(xhr.responseText);
        if (res.imageUrl) this.editFormImageUrl = res.imageUrl;
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

  deleteQuestion(id: number) {
    if (confirm('Delete this question and all its options?')) {
      this.api.deleteQuestion(id).subscribe(() => {
        this.questions = this.questions.filter(q => q.id !== id);
        this.applyFilter();
      });
    }
  }

  getDifficultyClass(d: string) { return d === 'EASY' ? 'badge-success' : d === 'HARD' ? 'badge-danger' : 'badge-warning'; }
  getStatusClass(s: string) { return s === 'APPROVED' ? 'badge badge-success' : s === 'REJECTED' ? 'badge badge-danger' : 'badge badge-warning'; }
}
