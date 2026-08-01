import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Grade {
  id: number;
  name: string;
  code: string;
  description?: string;
  sortOrder?: number;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  language?: string;
  description?: string;
  grade?: Grade;
  questionsCount?: number;
}

export interface Topic {
  id: number;
  name: string;
  code?: string;
  topicNumber?: number;
  description?: string;
  subject?: Subject;
}

export interface Unit {
  id: number;
  name: string;
  code?: string;
  unitNumber?: number;
  description?: string;
  topic?: Topic;
}

export interface Concept {
  id: number;
  name: string;
  code?: string;
  summary?: string;
  keyTakeaways?: string;
  unit?: Unit;
}

export interface AnswerOption {
  id?: number;
  optionText: string;
  isCorrect: boolean;
  explanation?: string;
  sortOrder?: number;
}

export interface Question {
  id: number;
  questionNumber?: number;
  questionCode?: string;
  questionText: string;
  comprehensionText?: string;
  questionType: string;
  difficulty: string;
  explanation?: string;
  imageUrl?: string;
  diagramUrl?: string;
  status: string;
  concept?: Concept;
  answerOptions?: AnswerOption[];
}

export interface License {
  id: number;
  activationCode: string;
  licenseType: string; // ORDINARY, FREE
  deviceId?: string;
  subscriptionDurationMonths?: number;
  validUntil?: string;
  status: string;
  activationDate?: string;
  expiryDate?: string;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  code: string;
  durationMonths: number;
  price: number;
  entitlementRules?: string;
  isActive?: boolean;
}

export interface GradeVersion {
  id: number;
  gradeId?: number;
  gradeName: string;
  version: string;
  packageR2Url: string;
  packageSizeBytes?: number;
  checksumSha256?: string;
  changelog?: string;
  isLatest: boolean;
  publishedAt?: string;
}

export interface DashboardMetrics {
  totalLicenses: number;
  pendingActivations: number;
  activeLicenses: number;
  activePackages: number;
  totalQuestions: number;
  totalGrades: number;
}

export interface DashboardStats {
  totalQuestions: number;
  totalLicenses: number;
  activeLicenses: number;
  pendingLicenses: number;
  expiredLicenses: number;
  totalR2Packages: number;
  totalGrades: number;
  activationsByMonth: { labels: string[]; data: number[] };
  contentDistribution: { labels: string[]; data: number[] };
  recentActivations: License[];
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  get BASE_URL(): string {
    return environment.apiUrl;
  }

  constructor(private http: HttpClient) {}

  private get headers(): HttpHeaders {
    const token = localStorage.getItem('grameone_token');
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  // ---- AUTH ----
  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.BASE_URL}/auth/login`, { username, password });
  }

  // ---- GRADES ----
  getGrades(): Observable<Grade[]> {
    return this.http.get<Grade[]>(`${this.BASE_URL}/grades`, { headers: this.headers }).pipe(
      catchError(() => of(MOCK_GRADES))
    );
  }

  createGrade(grade: Partial<Grade>): Observable<Grade> {
    return this.http.post<Grade>(`${this.BASE_URL}/grades`, grade, { headers: this.headers });
  }

  updateGrade(id: number, grade: Partial<Grade>): Observable<Grade> {
    return this.http.put<Grade>(`${this.BASE_URL}/grades/${id}`, grade, { headers: this.headers });
  }

  deleteGrade(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE_URL}/grades/${id}`, { headers: this.headers });
  }

  // ---- SUBJECTS ----
  getSubjects(gradeId?: number): Observable<Subject[]> {
    const url = gradeId ? `${this.BASE_URL}/subjects?gradeId=${gradeId}` : `${this.BASE_URL}/subjects`;
    return this.http.get<Subject[]>(url, { headers: this.headers }).pipe(
      catchError(() => of(MOCK_SUBJECTS))
    );
  }

  createSubject(gradeId: number, subject: Partial<Subject>): Observable<Subject> {
    return this.http.post<Subject>(`${this.BASE_URL}/subjects?gradeId=${gradeId}`, subject, { headers: this.headers });
  }

  // ---- TOPICS ----
  getTopics(subjectId?: number): Observable<Topic[]> {
    const url = subjectId ? `${this.BASE_URL}/topics?subjectId=${subjectId}` : `${this.BASE_URL}/topics`;
    return this.http.get<Topic[]>(url, { headers: this.headers }).pipe(
      catchError(() => of(MOCK_TOPICS))
    );
  }

  createTopic(subjectId: number, topic: Partial<Topic>): Observable<Topic> {
    return this.http.post<Topic>(`${this.BASE_URL}/topics?subjectId=${subjectId}`, topic, { headers: this.headers });
  }

  // ---- UNITS ----
  getUnits(topicId?: number): Observable<Unit[]> {
    const url = topicId ? `${this.BASE_URL}/units?topicId=${topicId}` : `${this.BASE_URL}/units`;
    return this.http.get<Unit[]>(url, { headers: this.headers }).pipe(
      catchError(() => of(MOCK_UNITS))
    );
  }

  createUnit(topicId: number, unit: Partial<Unit>): Observable<Unit> {
    return this.http.post<Unit>(`${this.BASE_URL}/units?topicId=${topicId}`, unit, { headers: this.headers });
  }

  // ---- CONCEPTS ----
  getConcepts(unitId?: number): Observable<Concept[]> {
    const url = unitId ? `${this.BASE_URL}/concepts?unitId=${unitId}` : `${this.BASE_URL}/concepts`;
    return this.http.get<Concept[]>(url, { headers: this.headers }).pipe(
      catchError(() => of(MOCK_CONCEPTS))
    );
  }

  createConcept(unitId: number, concept: Partial<Concept>): Observable<Concept> {
    return this.http.post<Concept>(`${this.BASE_URL}/concepts?unitId=${unitId}`, concept, { headers: this.headers });
  }

  // ---- QUESTIONS ----
  getQuestions(params?: { conceptId?: number; gradeId?: number; status?: string }): Observable<Question[]> {
    let url = `${this.BASE_URL}/questions`;
    const qs: string[] = [];
    if (params?.conceptId) qs.push(`conceptId=${params.conceptId}`);
    if (params?.gradeId) qs.push(`gradeId=${params.gradeId}`);
    if (params?.status) qs.push(`status=${params.status}`);
    if (qs.length) url += '?' + qs.join('&');
    return this.http.get<Question[]>(url, { headers: this.headers }).pipe(
      catchError(() => of(MOCK_QUESTIONS))
    );
  }

  updateQuestion(id: number, question: Partial<Question>): Observable<Question> {
    return this.http.put<Question>(`${this.BASE_URL}/questions/${id}`, question, { headers: this.headers });
  }

  // ---- LICENSES ----
  getLicenses(): Observable<License[]> {
    return this.http.get<License[]>(`${this.BASE_URL}/licenses`, { headers: this.headers }).pipe(
      catchError(() => of(MOCK_LICENSES))
    );
  }

  generateLicense(durationMonths?: number, licenseType: string = 'ORDINARY', validUntil?: string): Observable<License> {
    let url = `${this.BASE_URL}/licenses/generate?licenseType=${licenseType}`;
    if (durationMonths) url += `&durationMonths=${durationMonths}`;
    if (validUntil) url += `&validUntil=${encodeURIComponent(validUntil)}`;
    return this.http.post<License>(url, {}, { headers: this.headers });
  }

  generateBulkLicenses(count: number, durationMonths?: number, licenseType: string = 'ORDINARY', validUntil?: string): Observable<License[]> {
    let url = `${this.BASE_URL}/licenses/generate-bulk?count=${count}&licenseType=${licenseType}`;
    if (durationMonths) url += `&durationMonths=${durationMonths}`;
    if (validUntil) url += `&validUntil=${encodeURIComponent(validUntil)}`;
    return this.http.post<License[]>(url, {}, { headers: this.headers });
  }

  validateLicense(activationCode: string, deviceId: string): Observable<any> {
    return this.http.post(`${this.BASE_URL}/licenses/validate?activationCode=${activationCode}&deviceId=${deviceId}`, {});
  }

  validateMultiLicenses(codes: string[], deviceId: string): Observable<any[]> {
    return this.http.post<any[]>(`${this.BASE_URL}/licenses/validate-multi`, { activationCodes: codes, deviceId });
  }

  // ---- SUBSCRIPTIONS ----
  getSubscriptionPlans(): Observable<SubscriptionPlan[]> {
    return this.http.get<SubscriptionPlan[]>(`${this.BASE_URL}/subscriptions`, { headers: this.headers }).pipe(
      catchError(() => of(MOCK_PLANS))
    );
  }

  // ---- PACKAGES ----
  publishPackage(gradeId: number, changelog: string): Observable<GradeVersion> {
    return this.http.post<GradeVersion>(`${this.BASE_URL}/packages/publish/${gradeId}?changelog=${encodeURIComponent(changelog)}`, {}, { headers: this.headers });
  }

  getVersionHistory(gradeId: number): Observable<GradeVersion[]> {
    return this.http.get<GradeVersion[]>(`${this.BASE_URL}/packages/history/${gradeId}`, { headers: this.headers }).pipe(
      catchError(() => of(MOCK_VERSIONS))
    );
  }

  rollbackVersion(gradeId: number, version: string): Observable<GradeVersion> {
    return this.http.post<GradeVersion>(`${this.BASE_URL}/packages/rollback/${gradeId}?version=${version}`, {}, { headers: this.headers });
  }

  // ---- MEDIA ----
  uploadMedia(file: File, folder: string): Observable<{ key: string; url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    const h = this.headers.delete('Content-Type');
    return this.http.post<{ key: string; url: string }>(`${this.BASE_URL}/media/upload`, formData, { headers: h });
  }

  // ---- CSV IMPORT ----
  importCsv(file: File): Observable<{ imported: number; skipped: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.BASE_URL}/csv/import`, formData);
  }

  getTemplateUrl(): string {
    return `${this.BASE_URL}/csv/template`;
  }

  // ---- DASHBOARD ----
  getDashboardMetrics(): Observable<DashboardMetrics> {
    return of({
      totalLicenses: 24, pendingActivations: 8, activeLicenses: 16,
      activePackages: 7, totalQuestions: 142, totalGrades: 7
    });
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.BASE_URL}/dashboard/stats`, { headers: this.headers });
  }
}

// ---- MOCK DATA ----
const MOCK_GRADES: Grade[] = [
  { id: 1, name: 'Grade 1', code: 'GRADE_1', sortOrder: 1 },
  { id: 2, name: 'Grade 2', code: 'GRADE_2', sortOrder: 2 },
  { id: 3, name: 'Grade 3', code: 'GRADE_3', sortOrder: 3 },
  { id: 4, name: 'Grade 4', code: 'GRADE_4', sortOrder: 4 },
  { id: 5, name: 'Grade 5', code: 'GRADE_5', sortOrder: 5 },
  { id: 6, name: 'Grade 6', code: 'GRADE_6', sortOrder: 6 },
  { id: 7, name: 'Grade 7', code: 'GRADE_7', sortOrder: 7 },
];

const MOCK_SUBJECTS: Subject[] = [
  { id: 101, name: 'Mathematics', code: 'MATH', language: 'English', grade: MOCK_GRADES[6], questionsCount: 42 },
  { id: 102, name: 'Science & Tech', code: 'SCI', language: 'English', grade: MOCK_GRADES[6], questionsCount: 35 },
  { id: 103, name: 'Chishona', code: 'SHO', language: 'Shona', grade: MOCK_GRADES[6], questionsCount: 28 },
  { id: 104, name: 'Social Science', code: 'SOC', language: 'English', grade: MOCK_GRADES[6], questionsCount: 25 },
];

const MOCK_TOPICS: Topic[] = [
  { id: 201, name: 'Numbers & Algebra', topicNumber: 1, subject: MOCK_SUBJECTS[0] },
  { id: 202, name: 'Fractions & Decimals', topicNumber: 2, subject: MOCK_SUBJECTS[0] },
  { id: 203, name: 'Health & Safety', topicNumber: 1, subject: MOCK_SUBJECTS[1] },
];

const MOCK_UNITS: Unit[] = [
  { id: 301, name: 'Unit 1: Addition & Subtraction', unitNumber: 1, topic: MOCK_TOPICS[0] },
  { id: 302, name: 'Unit 2: Linear Equations', unitNumber: 2, topic: MOCK_TOPICS[0] },
];

const MOCK_CONCEPTS: Concept[] = [
  { id: 401, name: 'Solving Single Variable Equations', summary: 'Methods for isolation of variables', unit: MOCK_UNITS[1] },
  { id: 402, name: 'Order of Operations (BODMAS)', summary: 'Rules for mathematical evaluation order', unit: MOCK_UNITS[0] },
];

const MOCK_QUESTIONS: Question[] = [
  {
    id: 501, questionNumber: 1, questionCode: '7M01', questionText: 'What is 15% of $200?', questionType: 'MULTIPLE_CHOICE',
    difficulty: 'MEDIUM', explanation: '15/100 × 200 = $30', status: 'APPROVED',
    concept: MOCK_CONCEPTS[0],
    answerOptions: [
      { id: 1, optionText: '$20', isCorrect: false, sortOrder: 1 },
      { id: 2, optionText: '$30', isCorrect: true, sortOrder: 2 },
      { id: 3, optionText: '$40', isCorrect: false, sortOrder: 3 },
      { id: 4, optionText: '$25', isCorrect: false, sortOrder: 4 },
    ]
  },
  {
    id: 502, questionNumber: 2, questionCode: '7M02', questionText: 'Solve for x: 2x + 6 = 14', questionType: 'MULTIPLE_CHOICE',
    difficulty: 'EASY', explanation: '2x = 8 => x = 4', status: 'APPROVED',
    concept: MOCK_CONCEPTS[0],
    answerOptions: [
      { id: 5, optionText: 'x = 3', isCorrect: false, sortOrder: 1 },
      { id: 6, optionText: 'x = 4', isCorrect: true, sortOrder: 2 },
      { id: 7, optionText: 'x = 5', isCorrect: false, sortOrder: 3 },
    ]
  },
  {
    id: 503, questionNumber: 1, questionCode: '7S01', questionText: 'Which of the following is a waterborne disease?', questionType: 'MULTIPLE_CHOICE',
    difficulty: 'EASY', explanation: 'Cholera is transmitted via contaminated water.', status: 'APPROVED',
    concept: MOCK_CONCEPTS[0],
    answerOptions: [
      { id: 8, optionText: 'Malaria', isCorrect: false, sortOrder: 1 },
      { id: 9, optionText: 'Cholera', isCorrect: true, sortOrder: 2 },
      { id: 10, optionText: 'Influenza', isCorrect: false, sortOrder: 3 },
    ]
  },
];

const MOCK_LICENSES: License[] = [
  { id: 1, activationCode: 'GRAME-8X92-K4M1', licenseType: 'ORDINARY', deviceId: 'SM-G998B-ANDROID', subscriptionDurationMonths: 12, status: 'ACTIVE', expiryDate: '2027-06-30T00:00:00' },
  { id: 2, activationCode: 'GRAME-FREE-9Q5L', licenseType: 'FREE', validUntil: '2026-12-31T23:59:59', subscriptionDurationMonths: undefined, status: 'PENDING' },
  { id: 3, activationCode: 'GRAME-7M88-2W4P', licenseType: 'ORDINARY', deviceId: 'IPHONE14-PRO-IOS', subscriptionDurationMonths: 8, status: 'ACTIVE', expiryDate: '2026-11-15T00:00:00' },
  { id: 4, activationCode: 'GRAME-FREE-1K9N', licenseType: 'FREE', validUntil: '2026-12-31T23:59:59', subscriptionDurationMonths: undefined, status: 'PENDING' },
];

const MOCK_PLANS: SubscriptionPlan[] = [
  { id: 1, name: '4 Months Plan', code: 'PLAN_4M', durationMonths: 4, price: 15.00, isActive: true, entitlementRules: 'Access to 1 grade package for 4 months' },
  { id: 2, name: '8 Months Plan', code: 'PLAN_8M', durationMonths: 8, price: 28.00, isActive: true, entitlementRules: 'Access to 1 grade package for 8 months' },
  { id: 3, name: '12 Months Plan', code: 'PLAN_12M', durationMonths: 12, price: 40.00, isActive: true, entitlementRules: 'Full access for 1 year' },
];

const MOCK_VERSIONS: GradeVersion[] = [
  { id: 1, gradeName: 'Grade 7', version: '2.4', packageR2Url: 'https://4ce23afb1e23344b92945a2dbde9fc00.r2.cloudflarestorage.com/grameone/packages/grade7_v2.4.zip', packageSizeBytes: 42100500, checksumSha256: 'a9f8e7d6c5b4a3f2', isLatest: true, publishedAt: '2026-07-20T10:15:00', changelog: 'Added new algebra questions' },
];
