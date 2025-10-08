import { TestBed } from '@angular/core/testing';
import { PokemonStateService } from './pokemon-state.service';
import { PokemonService } from './pokemon.service';
import { Pokemon } from '../../shared/models/pokemon.model';

describe('PokemonStateService', () => {
  let service: PokemonStateService;
  let pokemonService: jasmine.SpyObj<PokemonService>;

  const mockSprites = {
    front_default: 'url',
    front_shiny: 'url',
    back_default: 'url',
    back_shiny: 'url',
    other: {
      'official-artwork': {
        front_default: 'url',
        front_shiny: 'url'
      },
      dream_world: {
        front_default: 'url'
      }
    }
  };

  const mockPokemon: Pokemon[] = [
    {
      id: 1,
      name: 'bulbasaur',
      types: [{ slot: 1, type: { name: 'grass', url: '' } }],
      sprites: mockSprites,
      stats: [],
      weight: 69,
      height: 7,
      abilities: [],
      species: { name: 'bulbasaur', url: '' }
    },
    {
      id: 2,
      name: 'ivysaur',
      types: [{ slot: 1, type: { name: 'grass', url: '' } }],
      sprites: mockSprites,
      stats: [],
      weight: 130,
      height: 10,
      abilities: [],
      species: { name: 'ivysaur', url: '' }
    }
  ];

  beforeEach(() => {
    const spy = jasmine.createSpyObj('PokemonService', [
      'getPokemonList',
      'getPokemonBatch',
      'getAllTypes',
      'searchPokemon',
      'filterByTypes'
    ]);
    
    TestBed.configureTestingModule({
      providers: [
        PokemonStateService,
        { provide: PokemonService, useValue: spy }
      ]
    });

    service = TestBed.inject(PokemonStateService);
    pokemonService = TestBed.inject(PokemonService) as jasmine.SpyObj<PokemonService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should have empty initial state', () => {
      expect(service.allPokemon()).toEqual([]);
      expect(service.loading()).toBeFalse();
      expect(service.error()).toBeNull();
      expect(service.searchTerm()).toBe('');
      expect(service.selectedTypes()).toEqual([]);
      expect(service.currentPage()).toBe(1);
    });
  });

  describe('Search and Filter Operations', () => {
    beforeEach(() => {
      service['_allPokemonState'].set(mockPokemon);
    });

    it('should update search term and reset page', () => {
      service.updateSearchTerm('bulba');
      expect(service.searchTerm()).toBe('bulba');
      expect(service.currentPage()).toBe(1);
    });

    it('should add type filter', () => {
      service.addTypeFilter('grass');
      expect(service.selectedTypes()).toContain('grass');
      expect(service.currentPage()).toBe(1);
    });

    it('should remove type filter', () => {
      service.addTypeFilter('grass');
      service.removeTypeFilter('grass');
      expect(service.selectedTypes()).not.toContain('grass');
    });

    it('should toggle type filter', () => {
      service.toggleTypeFilter('grass');
      expect(service.selectedTypes()).toContain('grass');
      
      service.toggleTypeFilter('grass');
      expect(service.selectedTypes()).not.toContain('grass');
    });

    it('should filter pokemons by name', () => {
      pokemonService.searchPokemon.and.returnValue([mockPokemon[0]]);
      service.updateSearchTerm('bulba');
      expect(service.filteredPokemons().length).toBe(1);
      expect(service.filteredPokemons()[0].name).toBe('bulbasaur');
    });

    it('should filter pokemons by type', () => {
      pokemonService.filterByTypes.and.returnValue(mockPokemon);
      service.addTypeFilter('grass');
      expect(service.filteredPokemons()).toEqual(mockPokemon);
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      service['_allPokemonState'].set(mockPokemon);
    });

    it('should calculate pagination state correctly', () => {
      service.setPageSize(1);
      const state = service.paginationState();
      expect(state.totalPages).toBe(2);
      expect(state.currentPage).toBe(1);
      expect(state.pageSize).toBe(1);
      expect(state.totalItems).toBe(2);
    });

    it('should go to specified page', () => {
      service.setPageSize(1);
      service.goToPage(2);
      expect(service.currentPage()).toBe(2);
      expect(service.currentPagePokemons().length).toBe(1);
      expect(service.currentPagePokemons()[0].name).toBe('ivysaur');
    });

    it('should not go to invalid page numbers', () => {
      service.goToPage(0);
      expect(service.currentPage()).toBe(1);

      service.goToPage(-1);
      expect(service.currentPage()).toBe(1);
    });

    it('should navigate between pages', () => {
      service.setPageSize(1);
      
      service.nextPage();
      expect(service.currentPage()).toBe(2);
      
      service.previousPage();
      expect(service.currentPage()).toBe(1);
    });
  });

  describe('Data Loading', () => {
    it('should handle successful initial load', async () => {
      const listResponse = {
        count: 2,
        results: mockPokemon.map(p => ({ name: p.name, url: `https://pokeapi.co/api/v2/pokemon/${p.id}/` }))
      };

      pokemonService.getPokemonList.and.returnValue({ toPromise: () => Promise.resolve(listResponse) } as any);
      pokemonService.getPokemonBatch.and.returnValue({ toPromise: () => Promise.resolve(mockPokemon) } as any);

      await service.loadInitialPokemons(2);

      expect(service.loading()).toBeFalse();
      expect(service.error()).toBeNull();
      expect(service.allPokemon()).toEqual(mockPokemon);
    });

    it('should handle error in initial load', async () => {
      const error = new Error('Failed to load');
      pokemonService.getPokemonList.and.returnValue({ toPromise: () => Promise.reject(error) } as any);

      await service.loadInitialPokemons();

      expect(service.loading()).toBeFalse();
      expect(service.error()).toBe('Failed to load');
      expect(service.allPokemon()).toEqual([]);
    });

    it('should load more pokemons', () => {
      service['_allPokemonState'].set(mockPokemon);
      const newPokemon = { ...mockPokemon[0], id: 3, name: 'venusaur' };

      pokemonService.getPokemonList.and.returnValue({ 
        subscribe: (callbacks: any) => callbacks.next({ results: [{ name: 'venusaur', url: '' }] })
      } as any);

      pokemonService.getPokemonBatch.and.returnValue({ 
        subscribe: (callbacks: any) => callbacks.next([newPokemon])
      } as any);

      service.loadMorePokemons();

      expect(service.allPokemon().length).toBe(3);
      expect(service.allPokemon()[2].name).toBe('venusaur');
    });
  });

  describe('Reset', () => {
    it('should reset all state to initial values', () => {
      service['_allPokemonState'].set(mockPokemon);
      service['_loadingState'].set(true);
      service['_errorState'].set('error');
      service.updateSearchTerm('test');
      service.addTypeFilter('grass');
      service.goToPage(2);

      service.reset();

      expect(service.allPokemon()).toEqual([]);
      expect(service.loading()).toBeFalse();
      expect(service.error()).toBeNull();
      expect(service.searchTerm()).toBe('');
      expect(service.selectedTypes()).toEqual([]);
      expect(service.currentPage()).toBe(1);
    });
  });
});
