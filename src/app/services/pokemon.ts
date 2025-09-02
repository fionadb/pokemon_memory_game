import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { Pokemon } from '../models/card.model';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private baseUrl = 'https://pokeapi.co/api/v2/pokemon';

  constructor(private http: HttpClient) { }

  getRandomPokemon(count: number): Observable<Pokemon[]> {
    const pokemonIds = this.generateRandomIds(count, 151); // First generation Pokemon
    const requests = pokemonIds.map(id => 
      this.http.get<Pokemon>(`${this.baseUrl}/${id}`)
    );
    
    return forkJoin(requests);
  }

  private generateRandomIds(count: number, max: number): number[] {
    const ids = new Set<number>();
    while (ids.size < count) {
      ids.add(Math.floor(Math.random() * max) + 1);
    }
    return Array.from(ids);
  }
}
