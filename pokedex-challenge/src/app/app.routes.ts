import { ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { inject } from '@angular/core';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/pokemon-list/pokemon-list').then((m) => m.PokemonList),
    title: 'Explore todos os Pokémon',
  },
  {
    path: 'pokemon/:id',
    loadComponent: () =>
      import('./features/pokemon-detail/pokemon-detail').then((m) => m.PokemonDetail),
    resolve: {
      valid: () => import('./core/resolvers/pokemon-detail.resolver').then(m => m.pokemonDetailResolver)
    },
    title: 'Detalhes do Pokémon',
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
