import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface ImportResult { imported: number; skipped: number; errors: string[]; }

@Component({
  selector: 'app-csv-import',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="content-header">
      <div>
        <div class="breadcrumbs">Publishing &rsaquo; Question Import</div>
        <h1 class="page-title">CSV Question Import</h1>
      </div>
      <button class="btn btn-primary" (click)="downloadTemplate()">
        📥 Download CSV Template
      </button>
    </div>

    <div style="padding: 0 1.75rem 1.75rem; max-width:850px; margin:0 auto;">

      <!-- CSV Format Guide -->
      <div class="card" style="margin-bottom:1.5rem;">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
          <div class="card-title">📋 CSV Format Reference</div>
          <button class="btn btn-secondary" style="font-size:0.8rem; padding:0.35rem 0.75rem;" (click)="downloadTemplate()">
            📥 Download Sample (.csv)
          </button>
        </div>
        <p style="color:var(--text-muted); font-size:0.875rem; margin-bottom:1rem;">
          Your CSV file must include the following columns. <code>QuestionNumber</code> is auto-formatted to e.g. <code>7M01</code>.
        </p>
        <div style="overflow-x:auto;">
          <table class="custom-table">
            <thead>
              <tr>
                @for (h of csvHeaders; track $index) {
                  <th style="white-space:nowrap; font-size:0.78rem;">{{ h }}</th>
                }
              </tr>
            </thead>
            <tbody>
              <tr style="font-size:0.82rem;">
                <td>Grade 7</td><td>Mathematics</td><td>Algebra</td><td>Unit 1</td>
                <td>Solving Eqns</td><td>1</td><td>Solve 2x + 5 = 11</td><td>x = 3</td>
                <td>x = 4</td><td>x = 5</td><td>x = 6</td><td>A</td><td>MEDIUM</td><td>Subtract 5 then divide by 2</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Upload Drop Zone -->
      <div class="card" style="margin-bottom:1.5rem;">
        <div class="card-header"><div class="card-title">📂 Upload CSV File</div></div>

        <!-- Idle / file selected state -->
        @if (!isImporting && !isDone) {
          <div class="upload-zone"
               (click)="fileInput.click()"
               (dragover)="$event.preventDefault()"
               (drop)="onDrop($event)"
               [class.is-dragging]="isDragging"
               (dragenter)="isDragging = true"
               (dragleave)="isDragging = false">
            <input #fileInput type="file" accept=".csv" style="display:none" (change)="onFileSelected($event)" />
            <div style="font-size:2.5rem; margin-bottom:0.75rem;">📄</div>
            @if (selectedFile) {
              <div style="color:var(--primary); font-weight:600; font-size:1rem;">{{ selectedFile.name }}</div>
              <div style="color:var(--text-muted); font-size:0.85rem; margin-top:0.25rem;">
                {{ (selectedFile.size / 1024).toFixed(1) }} KB &bull; Click to change
              </div>
            } @else {
              <div style="color:var(--text-muted);">Drag &amp; drop your CSV here, or <span style="color:var(--primary);">click to browse</span></div>
              <div style="color:var(--text-dark); font-size:0.8rem; margin-top:0.25rem;">Supports .csv files only</div>
            }
          </div>

          @if (selectedFile) {
            <button class="btn btn-primary" style="width:100%; margin-top:1rem; justify-content:center;" (click)="importCsv()">
              🚀 Start Import
            </button>
          }
        }

        <!-- Active import progress state -->
        @if (isImporting) {
          <div style="padding: 0.5rem 0.5rem 0.25rem; width:100%;">

            <!-- 4-Step Indicator -->
            <div style="display:flex; justify-content:center; align-items:flex-start; gap:0; margin-bottom:1.5rem;">
              @for (step of importSteps; track step.key; let last = $last) {
                <div style="display:flex; align-items:flex-start;">
                  <div style="display:flex; flex-direction:column; align-items:center; gap:0.35rem; min-width:72px;">
                    <div [style.background]="getStepBg(step.key)"
                         [style.border]="getStepBorderStyle(step.key)"
                         style="width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1rem; transition:all 0.4s;">
                      @if (isStepComplete(step.key)) { ✅ }
                      @else if (currentStage === step.key) { <span class="spin-icon">⟳</span> }
                      @else { <span style="font-size:0.72rem; color:var(--text-muted);">{{ step.num }}</span> }
                    </div>
                    <div style="font-size:0.72rem; text-align:center; white-space:nowrap;"
                         [style.color]="currentStage === step.key ? 'var(--primary)' : isStepComplete(step.key) ? '#10b981' : 'var(--text-dark)'">
                      {{ step.label }}
                    </div>
                  </div>
                  @if (!last) {
                    <div style="width:44px; height:2px; margin-top:18px; flex-shrink:0; transition:background 0.4s;"
                         [style.background]="isStepComplete(step.key) ? '#10b981' : 'var(--border-color)'"></div>
                  }
                </div>
              }
            </div>

            <!-- Upload progress bar (real %) -->
            @if (currentStage === 'uploading') {
              <div style="margin-bottom:1rem;">
                <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-muted); margin-bottom:0.4rem;">
                  <span>Uploading {{ selectedFile?.name }}...</span>
                  <span style="color:var(--primary); font-weight:700;">{{ uploadProgress }}%</span>
                </div>
                <div style="background:var(--bg-input); border-radius:99px; height:10px; overflow:hidden;">
                  <div style="height:100%; border-radius:99px; background:linear-gradient(90deg, #10b981, #3b82f6); transition:width 0.3s ease;"
                       [style.width]="uploadProgress + '%'"></div>
                </div>
              </div>
            }

            <!-- Reading / Processing shimmer bar -->
            @if (currentStage === 'reading' || currentStage === 'processing') {
              <div style="margin-bottom:1rem;">
                <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-muted); margin-bottom:0.4rem;">
                  <span>{{ currentStage === 'reading' ? 'Reading &amp; validating CSV file...' : 'Processing rows &amp; saving to database...' }}</span>
                  <span class="spin-icon" style="color:var(--primary);">⟳</span>
                </div>
                <div style="background:var(--bg-input); border-radius:99px; height:10px; overflow:hidden;">
                  <div class="shimmer-bar"></div>
                </div>
              </div>
            }

            <div style="text-align:center; font-size:0.82rem; color:var(--text-muted); margin-top:0.25rem;">
              {{ selectedFile?.name }} &bull; {{ ((selectedFile?.size ?? 0) / 1024).toFixed(1) }} KB
            </div>
          </div>
        }
      </div>

      <!-- Result Card -->
      @if (result) {
        <div class="card" [style.border]="result.errors.length > 0 ? '1px solid #f59e0b' : '1px solid var(--primary)'">
          <div class="card-header">
            <div class="card-title">
              {{ result.errors.length === 0 ? '✅' : '⚠️' }} Import Results
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:1rem; margin-bottom:1rem;">
            <div style="text-align:center; padding:1.25rem 1rem; background:var(--badge-success-bg); border-radius:10px;">
              <div style="font-size:2.2rem; font-weight:800; color:var(--primary);">{{ result.imported }}</div>
              <div style="font-size:0.8rem; color:var(--text-muted); margin-top:0.25rem;">Imported</div>
            </div>
            <div style="text-align:center; padding:1.25rem 1rem; background:var(--bg-input); border-radius:10px;">
              <div style="font-size:2.2rem; font-weight:800; color:#f59e0b;">{{ result.skipped }}</div>
              <div style="font-size:0.8rem; color:var(--text-muted); margin-top:0.25rem;">Skipped</div>
            </div>
            <div style="text-align:center; padding:1.25rem 1rem; background:var(--bg-input); border-radius:10px;">
              <div style="font-size:2.2rem; font-weight:800; color:#ef4444;">{{ result.errors.length }}</div>
              <div style="font-size:0.8rem; color:var(--text-muted); margin-top:0.25rem;">Errors</div>
            </div>
          </div>
          @if (result.errors.length > 0) {
            <div style="margin-bottom:1rem;">
              <div style="font-weight:600; margin-bottom:0.5rem; color:#f59e0b;">⚠️ Error Details</div>
              @for (err of result.errors; track $index) {
                <div style="font-size:0.85rem; color:#ef4444; padding:0.35rem 0.6rem; background:rgba(239,68,68,0.08); border-radius:5px; margin-bottom:0.25rem;">
                  {{ err }}
                </div>
              }
            </div>
          } @else {
            <div style="color:var(--primary); font-size:0.9rem; margin-bottom:1rem;">✅ All rows were imported successfully!</div>
          }

          @if (questionsNeedingImage.length > 0) {
            <div style="margin-top:1.5rem; padding-top:1.25rem; border-top:1px dashed var(--border-color);">
              <div style="font-weight:700; font-size:1.05rem; color:var(--primary); margin-bottom:0.75rem;">
                🖼️ Image &amp; Diagram Upload Prompt ({{ questionsNeedingImage.length }} questions requiring pictures)
              </div>
              <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">
                The following questions were flagged for pictures or diagrams in your CSV. Select an image for each question to upload directly to Cloudflare R2:
              </p>

              @for (q of questionsNeedingImage; track q.id) {
                <div style="background:var(--bg-input); border-radius:10px; padding:1rem; margin-bottom:1rem; border:1px solid var(--border-color);">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                    <span style="font-weight:700; color:var(--primary); font-size:0.88rem;">[{{ q.questionCode }}] Question #{{ q.questionNumber }} &bull; {{ q.grade }} - {{ q.subject }}</span>
                  </div>
                  <div style="font-weight:600; font-size:0.92rem; margin-bottom:0.5rem; color:var(--text-dark);">
                    {{ q.questionText }}
                  </div>
                  @if (q.comprehensionText) {
                    <div style="font-size:0.82rem; color:var(--text-muted); font-style:italic; background:var(--bg-card); padding:0.5rem; border-radius:6px; margin-bottom:0.5rem;">
                      📖 Reading Story: {{ q.comprehensionText.substring(0, 120) }}...
                    </div>
                  }
                  <div style="display:flex; gap:0.75rem; align-items:center; margin-top:0.75rem;">
                    <input #imgInput type="file" accept="image/*" class="form-input" style="font-size:0.8rem; flex:1;" />
                    <button class="btn btn-primary" style="font-size:0.8rem; padding:0.4rem 0.85rem;" (click)="uploadImageForQuestion(q.id, imgInput)">
                      📤 Upload Picture to R2
                    </button>
                  </div>

                  @if (isImageUploading(q.id)) {
                    <div style="font-size:0.8rem; color:var(--primary); margin-top:0.5rem;">⟳ Uploading picture to Cloudflare R2...</div>
                  }
                  @if (isImageSuccess(q.id)) {
                    <div style="font-size:0.8rem; color:#10b981; margin-top:0.5rem;">✅ Picture uploaded successfully to R2!</div>
                  }
                  @if (getImageError(q.id)) {
                    <div style="font-size:0.8rem; color:#ef4444; margin-top:0.5rem;">❌ {{ getImageError(q.id) }}</div>
                  }
                </div>
              }
            </div>
          }

          <button class="btn btn-secondary" style="margin-top:1rem;" (click)="reset()">📂 Import Another File</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .upload-zone {
      border: 2px dashed var(--border-color);
      border-radius: 12px;
      padding: 2.5rem;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
      min-height: 140px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .upload-zone:hover, .upload-zone.is-dragging {
      border-color: var(--primary);
      background: rgba(16,185,129,0.05);
    }
    .spin-icon {
      display: inline-block;
      animation: spin 0.9s linear infinite;
    }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .shimmer-bar {
      height: 100%;
      border-radius: 99px;
      background: linear-gradient(90deg, transparent 0%, #10b981 40%, #3b82f6 60%, transparent 100%);
      background-size: 300% 100%;
      animation: shimmer 1.6s ease-in-out infinite;
      width: 100%;
    }
    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class CsvImportComponent {
  selectedFile: File | null = null;
  isDragging = false;
  result: ImportResult | null = null;
  isImporting = false;
  isDone = false;
  uploadProgress = 0;
  currentStage = '';

  csvHeaders = ['Grade','Subject','Topic','Unit','Concept','QuestionNumber','QuestionText','OptionA','OptionB','OptionC','OptionD','CorrectOption','Difficulty','Explanation','ComprehensionText','ImagePath','DiagramPath'];

  importSteps = [
    { key: 'reading',    label: 'Read File',  num: '1' },
    { key: 'uploading',  label: 'Upload',     num: '2' },
    { key: 'processing', label: 'Processing', num: '3' },
    { key: 'done',       label: 'Complete',   num: '4' },
  ];

  private stageOrder = ['reading', 'uploading', 'processing', 'done'];
  questionsNeedingImage: any[] = [];
  imageUploadStatus: { [qId: number]: { uploading: boolean; success: boolean; url?: string; error?: string } } = {};

  constructor(private http: HttpClient) {}

  isStepComplete(key: string): boolean {
    const cur = this.stageOrder.indexOf(this.currentStage);
    const idx = this.stageOrder.indexOf(key);
    return cur > idx;
  }

  getStepBg(key: string): string {
    if (this.isStepComplete(key)) return 'rgba(16,185,129,0.12)';
    if (this.currentStage === key) return 'rgba(59,130,246,0.12)';
    return 'var(--bg-input)';
  }

  getStepBorderStyle(key: string): string {
    if (this.isStepComplete(key)) return '2px solid #10b981';
    if (this.currentStage === key) return '2px solid #3b82f6';
    return '2px solid var(--border-color)';
  }

  downloadTemplate() {
    const csv = "Grade,Subject,Topic,Unit,Concept,QuestionNumber,QuestionText,OptionA,OptionB,OptionC,OptionD,CorrectOption,Difficulty,Explanation,ComprehensionText,ImagePath,DiagramPath\n"
      + "Grade 7,Mathematics,Numbers & Algebra,Unit 1: Addition,Solving Linear Equations,1,What is 2x + 5 when x = 3?,10,11,12,13,B,MEDIUM,Substitute x=3 to get 11.,,,\n"
      + "Grade 7,English,Reading & Comprehension,Unit 1: Prose,Main Idea,2,What is the main theme of the story?,Courage,Friendship,Greed,Kindness,A,EASY,Refer to paragraph 2.,Long ago in a small village near the Zambezi river...,,\n"
      + "Grade 7,Science,Measures & Geometry,Unit 1: Shapes,Angles,3,Which angle is shown in the diagram?,Acute,Right,Obtuse,Reflex,B,MEDIUM,90 degree angle marked in red.,,,diagram_q3.png\n";
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', 'grameone_questions_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) { this.selectedFile = input.files[0]; this.result = null; }
  }

  onDrop(event: DragEvent) {
    event.preventDefault(); this.isDragging = false;
    const file = event.dataTransfer?.files[0];
    if (file?.name.endsWith('.csv')) { this.selectedFile = file; this.result = null; }
  }

  importCsv() {
    if (!this.selectedFile) return;
    this.result = null;
    this.isImporting = true;
    this.isDone = false;
    this.uploadProgress = 0;

    // Stage 1: Reading (brief validation delay)
    this.currentStage = 'reading';
    setTimeout(() => this.doUpload(), 700);
  }

  private doUpload() {
    if (!this.selectedFile) return;

    // Stage 2: Real XHR upload with progress tracking
    this.currentStage = 'uploading';
    const formData = new FormData();
    formData.append('file', this.selectedFile);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${environment.apiUrl}/csv/import`, true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        this.uploadProgress = Math.round((e.loaded / e.total) * 100);
      }
    };

    xhr.upload.onload = () => {
      this.uploadProgress = 100;
      this.currentStage = 'processing'; // Stage 3: Server side processing
    };

    xhr.onload = () => {
      this.currentStage = 'done';       // Stage 4: Complete
      this.isImporting = false;
      this.isDone = true;
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          this.result = { imported: res.imported ?? 0, skipped: res.skipped ?? 0, errors: res.errors ?? [] };
          this.questionsNeedingImage = res.questionsNeedingImage ?? [];
        } catch {
          this.result = { imported: 0, skipped: 0, errors: ['Server returned unexpected response.'] };
          this.questionsNeedingImage = [];
        }
      } else {
        this.result = { imported: 0, skipped: 0, errors: [`Server error ${xhr.status}: ${xhr.statusText || 'Import failed.'}`] };
        this.questionsNeedingImage = [];
      }
    };

    xhr.onerror = () => {
      this.currentStage = '';
      this.isImporting = false;
      this.result = { imported: 0, skipped: 0, errors: ['Connection error connecting to backend API.'] };
    };

    xhr.send(formData);
  }

  isImageUploading(questionId: number): boolean {
    const s = this.imageUploadStatus[questionId];
    return s ? Boolean(s.uploading) : false;
  }

  isImageSuccess(questionId: number): boolean {
    const s = this.imageUploadStatus[questionId];
    return s ? Boolean(s.success) : false;
  }

  getImageError(questionId: number): string | undefined {
    const s = this.imageUploadStatus[questionId];
    return s ? s.error : undefined;
  }

  uploadImageForQuestion(questionId: number, fileInput: HTMLInputElement, type: string = 'image') {
    if (!fileInput.files || fileInput.files.length === 0) return;
    const file = fileInput.files[0];

    this.imageUploadStatus[questionId] = { uploading: true, success: false };

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    this.http.post<any>(`${environment.apiUrl}/questions/${questionId}/upload-media`, formData).subscribe({
      next: (res) => {
        const publicUrl = res.imageUrl || res.diagramUrl;
        this.imageUploadStatus[questionId] = { uploading: false, success: true, url: publicUrl };
      },
      error: (err) => {
        this.imageUploadStatus[questionId] = { uploading: false, success: false, error: err.message || 'Upload failed' };
      }
    });
  }

  reset() {
    this.selectedFile = null;
    this.result = null;
    this.questionsNeedingImage = [];
    this.imageUploadStatus = {};
    this.isImporting = false;
    this.isDone = false;
    this.uploadProgress = 0;
    this.currentStage = '';
  }
}
