import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PokemonService } from './pokemon.service';
import { environment } from '../../../../environment';
import { Pokemon, PokemonListResponse, PokemonSpecies } from '../../shared/models/pokemon.model';

describe('PokemonService', () => {
  let service: PokemonService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.baseUrl;

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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PokemonService]
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
    const mockListResponse: PokemonListResponse = {
      count: 2,
      next: null,
      previous: null,
      results: [
        { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
        { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' }
      ]
    };

    it('should return pokemon list', () => {
      service.getPokemonList().subscribe(response => {
        expect(response).toEqual(mockListResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=20`);
      expect(req.request.method).toBe('GET');
      req.flush(mockListResponse);
    });

    it('should handle custom offset and limit', () => {
      service.getPokemonList(10, 5).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/pokemon?offset=10&limit=5`);
      expect(req.request.method).toBe('GET');
    });
  });

  describe('getPokemonDetails', () => {
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

  const mockPokemon: Pokemon = {
      id: 1,
      name: 'bulbasaur',
      types: [{ slot: 1, type: { name: 'grass', url: '' } }],
      sprites: mockSprites,
      stats: [],
      weight: 69,
      height: 7,
      abilities: [],
      species: { name: 'bulbasaur', url: '' }
    };    it('should return pokemon details from API when not cached', () => {
      service.getPokemonDetails(1).subscribe(pokemon => {
        expect(pokemon).toEqual(mockPokemon);
      });

      const req = httpMock.expectOne(`${baseUrl}/pokemon/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPokemon);
    });

    it('should return cached pokemon details when available', () => {
      // First call to cache the data
      service.getPokemonDetails(1).subscribe();
      const req = httpMock.expectOne(`${baseUrl}/pokemon/1`);
      req.flush(mockPokemon);

      // Second call should use cache
      service.getPokemonDetails(1).subscribe(pokemon => {
        expect(pokemon).toEqual(mockPokemon);
      });

      // Should not make another HTTP request
      httpMock.expectNone(`${baseUrl}/pokemon/1`);
    });
  });

  describe('getPokemonSpecies', () => {
    const mockSpecies: PokemonSpecies = {
      genera: [],
      flavor_text_entries: [],
      evolution_chain: { url: '' }
    };

    it('should return pokemon species', () => {
      service.getPokemonSpecies(1).subscribe(species => {
        expect(species).toEqual(mockSpecies);
      });

      const req = httpMock.expectOne(`${baseUrl}/pokemon-species/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSpecies);
    });
  });

  describe('getAllTypes', () => {
    const mockTypes = {
      results: [
        { name: 'normal', url: '' },
        { name: 'fighting', url: '' },
        { name: 'unknown', url: '' }
      ]
    };

    it('should return filtered pokemon types', () => {
      service.getAllTypes().subscribe(types => {
        expect(types).toEqual(['normal', 'fighting']);
        expect(types).not.toContain('unknown');
      });

      const req = httpMock.expectOne(`${baseUrl}/type`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTypes);
    });

    it('should return cached types on subsequent calls', () => {
      // First call to cache the data
      service.getAllTypes().subscribe();
      const req = httpMock.expectOne(`${baseUrl}/type`);
      req.flush(mockTypes);

      // Second call should use cache
      service.getAllTypes().subscribe();
      httpMock.expectNone(`${baseUrl}/type`);
    });
  });

  describe('searchPokemon', () => {
    const mockPokemonList: Pokemon[] = [
      { 
        id: 1, 
        name: 'bulbasaur', 
        types: [], 
        sprites: mockSprites, 
        stats: [], 
        weight: 0, 
        height: 0, 
        abilities: [],
        species: { name: 'bulbasaur', url: '' }
      },
      { 
        id: 2, 
        name: 'ivysaur', 
        types: [], 
        sprites: mockSprites, 
        stats: [], 
        weight: 0, 
        height: 0, 
        abilities: [],
        species: { name: 'ivysaur', url: '' }
      }
    ];

    it('should filter pokemon by name', () => {
      const result = service.searchPokemon('bulba', mockPokemonList);
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('bulbasaur');
    });

    it('should filter pokemon by id', () => {
      const result = service.searchPokemon('2', mockPokemonList);
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('ivysaur');
    });

    it('should return all pokemon when search term is empty', () => {
      const result = service.searchPokemon('', mockPokemonList);
      expect(result).toEqual(mockPokemonList);
    });
  });

  describe('filterByTypes', () => {
    const mockPokemonList: Pokemon[] = [
      { 
        id: 1, 
        name: 'bulbasaur', 
        types: [{ slot: 1, type: { name: 'grass', url: '' } }],
        sprites: mockSprites,
        stats: [],
        weight: 0,
        height: 0,
        abilities: [],
        species: { name: 'bulbasaur', url: '' }
      },
      { 
        id: 2, 
        name: 'charmander', 
        types: [{ slot: 1, type: { name: 'fire', url: '' } }],
        sprites: mockSprites,
        stats: [],
        weight: 0,
        height: 0,
        abilities: [],
        species: { name: 'charmander', url: '' }
      }
    ];

    it('should filter pokemon by type', () => {
      const result = service.filterByTypes(['grass'], mockPokemonList);
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('bulbasaur');
    });

    it('should return all pokemon when no types are specified', () => {
      const result = service.filterByTypes([], mockPokemonList);
      expect(result).toEqual(mockPokemonList);
    });
  });

  describe('clearCache', () => {
    it('should clear both pokemon and types cache', () => {
      // Populate caches
      service.getPokemonDetails(1).subscribe();
      service.getAllTypes().subscribe();
      
      const pokemonReq = httpMock.expectOne(`${baseUrl}/pokemon/1`);
      const typesReq = httpMock.expectOne(`${baseUrl}/type`);
      
      pokemonReq.flush({ id: 1, name: 'bulbasaur' });
      typesReq.flush({ results: [] });

      // Clear cache
      service.clearCache();

      // Verify new requests are made after cache clear
      service.getPokemonDetails(1).subscribe();
      service.getAllTypes().subscribe();

      httpMock.expectOne(`${baseUrl}/pokemon/1`);
      httpMock.expectOne(`${baseUrl}/type`);
    });
  });
});
