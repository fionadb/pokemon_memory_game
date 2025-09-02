import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Card, GameState, Pokemon } from '../models/card.model';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private gameStateSubject = new BehaviorSubject<GameState>({
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    currentPlayer: 1,
    playerScores: [0, 0],
    isGameWon: false,
    moves: 0
  });

  public gameState$ = this.gameStateSubject.asObservable();

  constructor() { }

  initializeGame(gridSize: number, numberOfPlayers: number, pokemon: Pokemon[]): void {
    const totalCards = gridSize * gridSize;
    const pairsNeeded = totalCards / 2;
    
    // Create pairs of cards
    const cards: Card[] = [];
    for (let i = 0; i < pairsNeeded; i++) {
      const pokemonData = pokemon[i % pokemon.length];
      const cardId1 = `${pokemonData.id}-1`;
      const cardId2 = `${pokemonData.id}-2`;
      
      const card1: Card = {
        id: cardId1,
        pokemonId: pokemonData.id,
        name: pokemonData.name,
        imageUrl: pokemonData.sprites.other['official-artwork'].front_default || pokemonData.sprites.front_default,
        isFlipped: false,
        isMatched: false
      };
      
      const card2: Card = {
        id: cardId2,
        pokemonId: pokemonData.id,
        name: pokemonData.name,
        imageUrl: pokemonData.sprites.other['official-artwork'].front_default || pokemonData.sprites.front_default,
        isFlipped: false,
        isMatched: false
      };
      
      cards.push(card1, card2);
    }

    // Shuffle the cards
    this.shuffleArray(cards);

    const newGameState: GameState = {
      cards,
      flippedCards: [],
      matchedPairs: 0,
      currentPlayer: 1,
      playerScores: new Array(numberOfPlayers).fill(0),
      isGameWon: false,
      moves: 0
    };

    this.gameStateSubject.next(newGameState);
  }

  flipCard(cardId: string): void {
    const currentState = this.gameStateSubject.value;
    
    if (currentState.flippedCards.length >= 2 || currentState.isGameWon) {
      return;
    }

    const card = currentState.cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) {
      return;
    }

    card.isFlipped = true;
    currentState.flippedCards.push(card);
    currentState.moves++;

    if (currentState.flippedCards.length === 2) {
      setTimeout(() => {
        this.checkForMatch();
      }, 1000);
    }

    this.gameStateSubject.next({...currentState});
  }

  private checkForMatch(): void {
    const currentState = this.gameStateSubject.value;
    const [card1, card2] = currentState.flippedCards;

    if (card1.pokemonId === card2.pokemonId) {
      // Match found
      card1.isMatched = true;
      card2.isMatched = true;
      currentState.matchedPairs++;
      currentState.playerScores[currentState.currentPlayer - 1]++;
      
      // Check if game is won
      if (currentState.matchedPairs === currentState.cards.length / 2) {
        currentState.isGameWon = true;
      }
    } else {
      // No match - flip cards back
      card1.isFlipped = false;
      card2.isFlipped = false;
      
      // Switch player in multiplayer mode
      if (currentState.playerScores.length > 1) {
        currentState.currentPlayer = currentState.currentPlayer === 1 ? 2 : 1;
      }
    }

    currentState.flippedCards = [];
    this.gameStateSubject.next({...currentState});
  }

  resetGame(): void {
    const currentState = this.gameStateSubject.value;
    currentState.cards.forEach(card => {
      card.isFlipped = false;
      card.isMatched = false;
    });
    
    this.shuffleArray(currentState.cards);
    
    const newGameState: GameState = {
      ...currentState,
      flippedCards: [],
      matchedPairs: 0,
      currentPlayer: 1,
      playerScores: new Array(currentState.playerScores.length).fill(0),
      isGameWon: false,
      moves: 0
    };

    this.gameStateSubject.next(newGameState);
  }

  private shuffleArray(array: any[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
