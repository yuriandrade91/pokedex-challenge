// src/app/features/pokemon-list/pokemon-list.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { PokemonStateService } from '../../core/services/pokemon-state.service';
import { PATHS } from '../../shared/constants/paths';
import { TYPE_COLORS } from '../../shared/models/pokemon.model';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pokemon-list.html',
  styleUrl: './pokemon-list.scss',
})
export class PokemonList implements OnInit {
  private _pokemonState = inject(PokemonStateService);
  private _router = inject(Router);
  private _meta = inject(Meta);
  private _title = inject(Title);

  // Signals do estado
  pokemons = this._pokemonState.currentPagePokemons;
  loading = this._pokemonState.loading;
  error = this._pokemonState.error;
  pagination = this._pokemonState.paginationState;
  searchTerm = this._pokemonState.searchTerm;
  selectedTypes = this._pokemonState.selectedTypes;
  availableTypes = this._pokemonState.availableTypes;

  // Estado local
  showFilters = signal(false);
  searchInputValue = signal('');

  private _searchTimeout?: number;

  ngOnInit() {
    this.setupSEO();
    this.loadPokemons();
  }

  /**
   * Configura meta tags para SEO
   */
  private setupSEO() {
    this._title.setTitle('Pokédex - Explore todos os Pokémon');
    this._meta.updateTag({
      name: 'description',
      content:
        'Explore a Pokédex completa com informações detalhadas sobre todos os Pokémon. Filtre por tipo e nome.',
    });
    this._meta.updateTag({
      property: 'og:title',
      content: 'Pokédex - Explore todos os Pokémon',
    });
    this._meta.updateTag({
      property: 'og:description',
      content: 'Explore a Pokédex completa com informações detalhadas sobre todos os Pokémon.',
    });
  }

  async loadPokemons(): Promise<void> {
    await this._pokemonState.loadInitialPokemons(151);
  }

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    this.searchInputValue.set(value);

    if (this._searchTimeout) {
      clearTimeout(this._searchTimeout);
    }

    this._searchTimeout = window.setTimeout(() => {
      this._pokemonState.updateSearchTerm(value);
    }, 500);
  }

  clearSearch() {
    this.searchInputValue.set('');
    this._pokemonState.updateSearchTerm('');
  }

  toggleType(type: string) {
    this._pokemonState.toggleTypeFilter(type);
  }

  isTypeSelected(type: string): boolean {
    return this.selectedTypes().includes(type);
  }

  clearAllFilters() {
    this._pokemonState.clearFilters();
    this.searchInputValue.set('');
  }

  toggleFilters() {
    this.showFilters.update((current) => !current);
  }

  viewPokemonDetails(pokemonId: number) {
    this._router.navigate([`${PATHS.POKEMON}`, pokemonId]);
  }

  async goToPage(page: number) {
    await this._pokemonState.goToPage(page);
  }

  async previousPage() {
    await this._pokemonState.previousPage();
  }

  async nextPage() {
    await this._pokemonState.nextPage();
  }

  getTypeColor(type: string) {
    return TYPE_COLORS[type] || '#777';
  }

  formatPokemonNumber(id: number): string {
    return `#${id.toString().padStart(3, '0')}`;
  }

  capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  getPageNumbers(): number[] {
    const { currentPage, totalPages } = this.pagination();
    const pages: number[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);

      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/pokemon-placeholder.png';
  }
}
