import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id?: number;
  username: string;
  email: string;
  role: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api`;
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getStoredUser(): AuthResponse | null {
    const data = localStorage.getItem('grameone_user');
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  public get currentUserValue(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  public get isLoggedIn(): boolean {
    return !!this.currentUserValue && !!this.currentUserValue.token;
  }

  public get isAdmin(): boolean {
    return this.currentUserValue?.role === 'ROLE_ADMIN' || this.currentUserValue?.role === 'ADMIN';
  }

  login(credentials: { username: string; password: String }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('grameone_user', JSON.stringify(response));
        this.currentUserSubject.next(response);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('grameone_user');
    this.currentUserSubject.next(null);
  }

  changePassword(data: { username: string; oldPassword: String; newPassword: String }): Observable<string> {
    return this.http.post(`${this.apiUrl}/auth/change-password`, data, { responseType: 'text' });
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  createUser(userData: { username: string; email: string; password: String; role?: String }): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, userData);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }
}
