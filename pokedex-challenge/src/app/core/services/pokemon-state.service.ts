import { Injectable, signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PokemonService } from './pokemon.service';
import { PaginationState, Pokemon } from '../../shared/models/pokemon.model';
@Injectable({
  providedIn: 'root',
})
export class PokemonStateService {
  private pokemonService = inject(PokemonService);

  // Signals privados
  private _allPokemonState = signal<Pokemon[]>([]);
  private _loadingState = signal<boolean>(false);
  private _errorState = signal<string | null>(null);
  private _searchTermState = signal<string>('');
  private _selectedTypesState = signal<string[]>([]);
  private _currentPageState = signal<number>(1);
  private _pageSizeState = signal<number>(20);
  private _totalItemsState = signal<number>(0);

  // Signals publicos
  allPokemon = this._allPokemonState.asReadonly();
  loading = this._loadingState.asReadonly();
  error = this._errorState.asReadonly();
  searchTerm = this._searchTermState.asReadonly();
  selectedTypes = this._selectedTypesState.asReadonly();
  currentPage = this._currentPageState.asReadonly();
  private _allLoadedPokemons = signal<Pokemon[]>([]);

  private pokemonFilteredByName = computed(() => {
    const term = this._searchTermState();
    const pokemons = this._allLoadedPokemons();

    if (!term.trim()) {
      return pokemons;
    }

    return this.pokemonService.searchPokemon(term, pokemons);
  });

  filteredPokemons = computed(() => {
    const types = this._selectedTypesState();
    const pokemonsFilteredByName = this.pokemonFilteredByName();

    if (types.length === 0) {
      return pokemonsFilteredByName;
    }

    return this.pokemonService.filterByTypes(types, pokemonsFilteredByName);
  });

  currentPagePokemons = computed(() => {
    // Se temos termos de busca ou filtros, usa a lista filtrada
    if (this._searchTermState() || this._selectedTypesState().length > 0) {
      const filtered = this.filteredPokemons();
      const page = this._currentPageState();
      const pageSize = this._pageSizeState();
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      return filtered.slice(startIndex, endIndex);
    }

    const page = this._currentPageState();
    const pageSize = this._pageSizeState();
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return this._allLoadedPokemons().slice(startIndex, endIndex);
  });

  paginationState = computed<PaginationState>(() => {
    const filteredItems = this.filteredPokemons();
    const totalItems = filteredItems.length;
    const pageSize = this._pageSizeState();
    const currentPage = this._currentPageState();

    return {
      currentPage,
      totalPages: Math.ceil(totalItems / pageSize),
      pageSize,
      totalItems,
    };
  });

  readonly availableTypes = toSignal(this.pokemonService.getAllTypes(), {
    initialValue: [],
  });

  async loadInitialPokemons(limit: number = 151): Promise<void> {
    this._loadingState.set(true);
    this._errorState.set(null);

    try {
      const listResponse = await this.pokemonService.getPokemonList(0, limit).toPromise();

      if (!listResponse) {
        throw new Error('Erro ao carregar lista de Pokémon');
      }

      const totalItems = Math.min(listResponse.count, limit);
      this._totalItemsState.set(totalItems);

      const pokemons = await this.pokemonService.getPokemonBatch(listResponse.results).toPromise();

      if (pokemons) {
        this._allLoadedPokemons.set(pokemons);
        this._allPokemonState.set(pokemons);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      this._errorState.set(errorMessage);
      console.error('Error loading pokemons:', err);
    } finally {
      this._loadingState.set(false);
    }
  }


  updateSearchTerm(term: string) {
    this._searchTermState.set(term);
    this._currentPageState.set(1);
  }

  addTypeFilter(type: string) {
    this._selectedTypesState.update((current) => {
      if (current.includes(type)) return current;
      return [...current, type];
    });
    this._currentPageState.set(1);
  }

  removeTypeFilter(type: string) {
    this._selectedTypesState.update((current) => current.filter((t) => t !== type));
    this._currentPageState.set(1);
  }

  toggleTypeFilter(type: string) {
    const current = this._selectedTypesState();
    if (current.includes(type)) {
      this.removeTypeFilter(type);
    } else {
      this.addTypeFilter(type);
    }
  }

  clearFilters() {
    this._searchTermState.set('');
    this._selectedTypesState.set([]);
    this._currentPageState.set(1);
  }

  async goToPage(page: number) {
    const maxPage = this.paginationState().totalPages;
    if (page < 1 || page > maxPage) return;

    this._currentPageState.set(page);

    const pageSize = this._pageSizeState();
    const offset = (page - 1) * pageSize;
    const totalItems = this._totalItemsState();
    const adjustedPageSize = Math.min(pageSize, totalItems - offset);
    
    this._loadingState.set(true);
    try {
      const listResponse = await this.pokemonService.getPokemonList(offset, adjustedPageSize).toPromise();
      if (listResponse) {
        const newPokemons = await this.pokemonService.getPokemonBatch(listResponse.results).toPromise();
        if (newPokemons) {
          this._allPokemonState.set(newPokemons);
        }
      }
    } catch (err) {
      console.error('Error loading pokemons for page:', page, err);
      this._errorState.set('Erro ao carregar pokémons');
    } finally {
      this._loadingState.set(false);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async nextPage() {
    const current = this._currentPageState();
    await this.goToPage(current + 1);
  }

  async previousPage() {
    const current = this._currentPageState();
    await this.goToPage(current - 1);
  }

  setPageSize(size: number) {
    this._pageSizeState.set(size);
    this._currentPageState.set(1);
  }

  reset() {
    this._allPokemonState.set([]);
    this._loadingState.set(false);
    this._errorState.set(null);
    this.clearFilters();
  }
}
