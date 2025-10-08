import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

export const pokemonDetailResolver: ResolveFn<boolean> = (route) => {
  const router = inject(Router);
  const id = route.paramMap.get('id');

  if (!id || isNaN(Number(id)) || Number(id) <= 0) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
