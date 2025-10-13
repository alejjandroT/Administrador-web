import { Injectable } from '@angular/core';
import { CanMatch, Route, UrlSegment, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RolesGuard implements CanMatch {
  constructor(private auth: AuthService, private router: Router) {}

  canMatch(route: Route, segments: UrlSegment[]) {
    if (this.auth.isLoggedIn() && this.auth.hasRole('admin')) return true;
    this.router.navigate(['/login']);
    return false;
  }
}
