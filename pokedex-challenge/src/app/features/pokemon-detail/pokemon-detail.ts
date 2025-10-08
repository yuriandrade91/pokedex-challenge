// src/app/features/pokemon-detail/pokemon-detail.component.ts

import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { LoadingService } from '../../core/services/loading.service';
import { PokemonService } from '../../core/services/pokemon.service';
import { forkJoin } from 'rxjs';
import {
  Pokemon,
  PokemonSpecies,
  STAT_NAMES,
  TYPE_COLORS,
} from '../../shared/models/pokemon.model';

@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pokemon-detail.html',
  styleUrl: './pokemon-detail.scss',
})
export class PokemonDetail implements OnInit {
  private _activatedRoute = inject(ActivatedRoute);
  private _location = inject(Location);
  private _meta = inject(Meta);
  private _title = inject(Title);
  private _loadingService = inject(LoadingService);
  private _pokemonService = inject(PokemonService);

  // Signals
  pokemon = signal<Pokemon | null>(null);
  species = signal<PokemonSpecies | null>(null);
  error = signal<string | null>(null);
  activeTab = signal<'about' | 'stats' | 'evolution'>('about');

  loading = this._loadingService.loading;

  ngOnInit(): void {
    const id = this._activatedRoute.snapshot.paramMap.get('id')!;
    this._loadingService.show();

    forkJoin({
      pokemon: this._pokemonService.getPokemonDetails(id),
      species: this._pokemonService.getPokemonSpecies(Number(id)),
    }).subscribe({
      next: ({ pokemon, species }) => {
        if (pokemon && species) {
          this.pokemon.set(pokemon);
          this.species.set(species);
          this.setupSEO(pokemon);
          this.error.set(null);
        } else {
          this.error.set('Pokémon não encontrado');
          this._location.back();
        }
      },
      error: (err) => {
        console.error('Erro ao carregar dados do Pokémon:', err);
        this.error.set('Erro ao carregar dados do Pokémon');
        this._location.back();
      },
      complete: () => this._loadingService.hide(),
    });
  }

  private setupSEO(pokemon: Pokemon): void {
    const name = this.capitalize(pokemon.name);
    const types = pokemon.types.map((t) => this.capitalize(t.type.name)).join(', ');

    this._title.setTitle(`${name} - Pokédex`);
    this._meta.updateTag({
      name: 'description',
      content: `Informações detalhadas sobre ${name}. Tipos: ${types}. Veja estatísticas, habilidades e muito mais.`,
    });
    this._meta.updateTag({
      property: 'og:title',
      content: `${name} - Pokédex`,
    });
    this._meta.updateTag({
      property: 'og:description',
      content: `Explore informações sobre ${name}`,
    });

    const imageUrl = pokemon.sprites.other['official-artwork'].front_default;
    if (imageUrl) {
      this._meta.updateTag({
        property: 'og:image',
        content: imageUrl,
      });
    }
  }

  goBack(): void {
    this._location.back();
  }

  setActiveTab(tab: 'about' | 'stats' | 'evolution'): void {
    this.activeTab.set(tab);
  }

  getTypeColor(type: string): string {
    return TYPE_COLORS[type] || '#777';
  }

  getGradientColors(): string {
    const pokemon = this.pokemon();
    if (!pokemon || !pokemon.types.length) {
      return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }

    const primaryType = pokemon.types[0].type.name;
    const color = this.getTypeColor(primaryType);

    return `linear-gradient(135deg, ${color} 0%, ${this.darkenColor(color, 20)} 100%)`;
  }

  private darkenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = ((num >> 8) & 0x00ff) - amt;
    const B = (num & 0x0000ff) - amt;

    return `#${(
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)}`;
  }

  formatPokemonNumber(id: number): string {
    return `#${id.toString().padStart(3, '0')}`;
  }

  capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  formatHeight(height: number): string {
    return `${(height / 10).toFixed(1)}m`;
  }

  formatWeight(weight: number): string {
    return `${(weight / 10).toFixed(1)}kg`;
  }

  getStatName(statName: string): string {
    return STAT_NAMES[statName] || statName;
  }

  getStatPercentage(baseStat: number): number {
    const maxStat = 255;
    return (baseStat / maxStat) * 100;
  }

  getStatColor(baseStat: number): string {
    if (baseStat >= 100) return '#66bb6a';
    if (baseStat >= 60) return '#ffa726';
    return '#ef5350';
  }

  getDescription(): string {
    const species = this.species();
    if (!species) return '';

    const ptEntry = species.flavor_text_entries.find((entry) => entry.language.name === 'en');

    return ptEntry ? ptEntry.flavor_text.replace(/\f/g, ' ') : '';
  }

  getGenus(): string {
    const species = this.species();
    if (!species) return '';

    const ptGenus = species.genera.find((genus) => genus.language.name === 'en');

    return ptGenus ? ptGenus.genus : '';
  }

  getTotalStats(): number {
    const pokemon = this.pokemon();
    if (!pokemon) return 0;

    return pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/pokemon-placeholder.png';
  }
}
