// src/app/core/services/pokemon.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, forkJoin, map, of } from 'rxjs';
import {
  Pokemon,
  PokemonBasicInfo,
  PokemonListResponse,
  PokemonSpecies,
  TypeInfo,
} from '../../shared/models/pokemon.model';
import { environment } from '../../../../environment';
import { PATHS } from '../../shared/constants/paths';

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private _httpClient = inject(HttpClient);
  private _baseUrl = environment.baseUrl;

  private _pokemonCache = new Map<string, Pokemon>();
  private _typesCache: string[] | null = null;

  getPokemonList(offset: number = 0, limit: number = 20): Observable<PokemonListResponse> {
    const url = `${this._baseUrl}${PATHS.POKEMON}?offset=${offset}&limit=${limit}`;
    return this._httpClient.get<PokemonListResponse>(url);
  }

  getPokemonDetails(nameOrId: string | number): Observable<Pokemon> {
    const cacheKey = nameOrId.toString();

    if (this._pokemonCache.has(cacheKey)) {
      return of(this._pokemonCache.get(cacheKey)!);
    }

    const url = `${this._baseUrl}${PATHS.POKEMON}/${nameOrId}`;

    return this._httpClient.get<Pokemon>(url).pipe(
      map((pokemon) => {
        this._pokemonCache.set(cacheKey, pokemon);
        return pokemon;
      })
    );
  }

  getPokemonBatch(pokemonList: PokemonBasicInfo[]): Observable<Pokemon[]> {
    const requests = pokemonList.map((item) => {
      const id = this.extractIdFromUrl(item.url);
      return this.getPokemonDetails(id);
    });

    return forkJoin(requests);
  }

  getPokemonSpecies(id: number): Observable<PokemonSpecies> {
    const url = `${this._baseUrl}${PATHS.SPECIES}/${id}`;

    return this._httpClient.get<PokemonSpecies>(url);
  }

  getAllTypes(): Observable<string[]> {
    if (this._typesCache) {
      return of(this._typesCache);
    }

    const url = `${this._baseUrl}${PATHS.TYPE}`;

    return this._httpClient.get<TypeInfo>(url).pipe(
      map((response) => {
        const types = response.results
          .map((t) => t.name)
          .filter((name) => name !== 'unknown' && name !== 'shadow');

        this._typesCache = types;
        return types;
      })
    );
  }

  getPokemonByType(type: string): Observable<Pokemon[]> {
    const url = `${this._baseUrl}${PATHS.TYPE}/${type}`;

    return this._httpClient.get<any>(url).pipe(
      map((response) => {
        const pokemonRefs = response.pokemon.slice(0, 20);
        return pokemonRefs.map((p: any) => p.pokemon);
      })
    );
  }

  searchPokemon(searchTerm: string, pokemonList: Pokemon[]): Pokemon[] {
    if (!searchTerm.trim()) {
      return pokemonList;
    }

    const term = searchTerm.toLowerCase().trim();

    return pokemonList.filter(
      (pokemon) => pokemon.name.toLowerCase().includes(term) || pokemon.id.toString().includes(term)
    );
  }

  filterByTypes(types: string[], pokemonList: Pokemon[]): Pokemon[] {
    if (!types.length) {
      return pokemonList;
    }

    return pokemonList.filter((pokemon) => pokemon.types.some((t) => types.includes(t.type.name)));
  }

  clearCache(): void {
    this._pokemonCache.clear();
    this._typesCache = null;
  }

  private extractIdFromUrl(url: string): number {
    const matches = url.match(/\/(\d+)\//);
    return matches ? parseInt(matches[1], 10) : 0;
  }


}
