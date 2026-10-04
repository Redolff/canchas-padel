import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const noAuthGuard: CanActivateFn = () => {
  if (!localStorage.getItem('auth_token')) return true;
  return inject(Router).createUrlTree(['/dashboard']);
};
