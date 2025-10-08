// src/app/core/services/pokemon.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PokemonService } from './pokemon.service';
import { Pokemon, PokemonListResponse } from '../../shared/models/pokemon.model';

describe('PokemonService', () => {
  let service: PokemonService;
  let httpMock: HttpTestingController;
  const baseUrl = 'https://pokeapi.co/api/v2';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PokemonService],
    });

    service = TestBed.inject(PokemonService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPokemonList', () => {
    it('should fetch pokemon list with default parameters', (done) => {
      const mockResponse: PokemonListResponse = {
        count: 1279,
        next: 'https://pokeapi.co/api/v2/pokemon?offset=20&limit=20',
        previous: null,
        results: [
          { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
          { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
        ],
      };

      service.getPokemonList().subscribe((data) => {
        expect(data).toEqual(mockResponse);
        expect(data.results.length).toBe(2);
        expect(data.results[0].name).toBe('bulbasaur');
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=20`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should fetch pokemon list with custom offset and limit', (done) => {
      const mockResponse: PokemonListResponse = {
        count: 1279,
        next: null,
        previous: 'https://pokeapi.co/api/v2/pokemon?offset=0&limit=50',
        results: [],
      };

      service.getPokemonList(50, 50).subscribe((data) => {
        expect(data).toEqual(mockResponse);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/pokemon?offset=50&limit=50`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle errors when fetching pokemon list', (done) => {
      const errorMessage = 'Erro no servidor. Tente novamente mais tarde';

      service.getPokemonList().subscribe({
        next: () => fail('should have failed with 500 error'),
        error: (error) => {
          expect(error.message).toContain('Erro no servidor');
          done();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=20`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getPokemonDetails', () => {
    const mockPokemon: Partial<Pokemon> = {
      id: 25,
      name: 'pikachu',
      types: [
        {
          slot: 1,
          type: { name: 'electric', url: 'https://pokeapi.co/api/v2/type/13/' },
        },
      ],
      height: 4,
      weight: 60,
      sprites: {} as any,
      stats: [],
      abilities: [],
      species: { name: 'pikachu', url: '' },
    };

    it('should fetch pokemon details by name', (done) => {
      service.getPokemonDetails('pikachu').subscribe((data) => {
        expect(data.name).toBe('pikachu');
        expect(data.id).toBe(25);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/pokemon/pikachu`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPokemon);
    });

    it('should fetch pokemon details by id', (done) => {
      service.getPokemonDetails(25).subscribe((data) => {
        expect(data.name).toBe('pikachu');
        expect(data.id).toBe(25);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/pokemon/25`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPokemon);
    });

    it('should cache pokemon details', (done) => {
      // Primeira requisição
      service.getPokemonDetails('pikachu').subscribe(() => {
        // Segunda requisição (deve usar cache)
        service.getPokemonDetails('pikachu').subscribe((data) => {
          expect(data.name).toBe('pikachu');
          done();
        });
      });

      // Apenas uma requisição HTTP deve ser feita
      const req = httpMock.expectOne(`${baseUrl}/pokemon/pikachu`);
      req.flush(mockPokemon);
    });

    it('should handle 404 error for non-existent pokemon', (done) => {
      service.getPokemonDetails('nonexistent').subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          expect(error.message).toContain('Pokémon não encontrado');
          done();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/pokemon/nonexistent`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getAllTypes', () => {
    it('should fetch all pokemon types', (done) => {
      const mockTypes = {
        count: 20,
        next: null,
        previous: null,
        results: [
          { name: 'normal', url: 'https://pokeapi.co/api/v2/type/1/' },
          { name: 'fighting', url: 'https://pokeapi.co/api/v2/type/2/' },
          { name: 'flying', url: 'https://pokeapi.co/api/v2/type/3/' },
        ],
      };

      service.getAllTypes().subscribe((types) => {
        expect(types.length).toBe(3);
        expect(types).toContain('normal');
        expect(types).toContain('fighting');
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/type`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTypes);
    });

    it('should filter out unknown and shadow types', (done) => {
      const mockTypes = {
        count: 22,
        next: null,
        previous: null,
        results: [
          { name: 'normal', url: 'https://pokeapi.co/api/v2/type/1/' },
          { name: 'unknown', url: 'https://pokeapi.co/api/v2/type/10001/' },
          { name: 'shadow', url: 'https://pokeapi.co/api/v2/type/10002/' },
        ],
      };

      service.getAllTypes().subscribe((types) => {
        expect(types.length).toBe(1);
        expect(types).toContain('normal');
        expect(types).not.toContain('unknown');
        expect(types).not.toContain('shadow');
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/type`);
      req.flush(mockTypes);
    });

    it('should cache types after first fetch', (done) => {
      const mockTypes = {
        count: 20,
        next: null,
        previous: null,
        results: [{ name: 'normal', url: 'https://pokeapi.co/api/v2/type/1/' }],
      };

      // Primeira requisição
      service.getAllTypes().subscribe(() => {
        // Segunda requisição (deve usar cache)
        service.getAllTypes().subscribe((types) => {
          expect(types.length).toBe(1);
          done();
        });
      });

      // Apenas uma requisição HTTP deve ser feita
      const req = httpMock.expectOne(`${baseUrl}/type`);
      req.flush(mockTypes);
    });
  });

  describe('searchPokemon', () => {
    const mockPokemons: Partial<Pokemon>[] = [
      {
        id: 1,
        name: 'bulbasaur',
        types: [],
        stats: [],
        abilities: [],
        sprites: {} as any,
        height: 7,
        weight: 69,
        species: { name: '', url: '' },
      },
      {
        id: 2,
        name: 'ivysaur',
        types: [],
        stats: [],
        abilities: [],
        sprites: {} as any,
        height: 10,
        weight: 130,
        species: { name: '', url: '' },
      },
      {
        id: 25,
        name: 'pikachu',
        types: [],
        stats: [],
        abilities: [],
        sprites: {} as any,
        height: 4,
        weight: 60,
        species: { name: '', url: '' },
      },
    ];

    it('should filter pokemon by name', () => {
      const result = service.searchPokemon('pika', mockPokemons as Pokemon[]);
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('pikachu');
    });

    it('should filter pokemon by id', () => {
      const result = service.searchPokemon('25', mockPokemons as Pokemon[]);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(25);
    });

    it('should return all pokemon when search term is empty', () => {
      const result = service.searchPokemon('', mockPokemons as Pokemon[]);
      expect(result.length).toBe(3);
    });

    it('should be case insensitive', () => {
      const result = service.searchPokemon('PIKA', mockPokemons as Pokemon[]);
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('pikachu');
    });

    it('should return empty array when no match', () => {
      const result = service.searchPokemon('xyz', mockPokemons as Pokemon[]);
      expect(result.length).toBe(0);
    });
  });

  describe('filterByTypes', () => {
    const mockPokemons: Partial<Pokemon>[] = [
      {
        id: 1,
        name: 'bulbasaur',
        types: [
          { slot: 1, type: { name: 'grass', url: '' } },
          { slot: 2, type: { name: 'poison', url: '' } },
        ],
        stats: [],
        abilities: [],
        sprites: {} as any,
        height: 7,
        weight: 69,
        species: { name: '', url: '' },
      },
      {
        id: 25,
        name: 'pikachu',
        types: [{ slot: 1, type: { name: 'electric', url: '' } }],
        stats: [],
        abilities: [],
        sprites: {} as any,
        height: 4,
        weight: 60,
        species: { name: '', url: '' },
      },
    ];

    it('should filter pokemon by single type', () => {
      const result = service.filterByTypes(['electric'], mockPokemons as Pokemon[]);
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('pikachu');
    });

    it('should filter pokemon by multiple types', () => {
      const result = service.filterByTypes(['grass', 'poison'], mockPokemons as Pokemon[]);
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('bulbasaur');
    });

    it('should return all pokemon when types array is empty', () => {
      const result = service.filterByTypes([], mockPokemons as Pokemon[]);
      expect(result.length).toBe(2);
    });
  });

  describe('clearCache', () => {
    it('should clear all cached data', (done) => {
      const mockPokemon: Partial<Pokemon> = {
        id: 25,
        name: 'pikachu',
        types: [],
        stats: [],
        abilities: [],
        sprites: {} as any,
        height: 4,
        weight: 60,
        species: { name: '', url: '' },
      };

      // Cache some data
      service.getPokemonDetails('pikachu').subscribe(() => {
        // Clear cache
        service.clearCache();

        // Should make new HTTP request
        service.getPokemonDetails('pikachu').subscribe(() => {
          done();
        });

        const req = httpMock.expectOne(`${baseUrl}/pokemon/pikachu`);
        req.flush(mockPokemon);
      });

      const req = httpMock.expectOne(`${baseUrl}/pokemon/pikachu`);
      req.flush(mockPokemon);
    });
  });
});
