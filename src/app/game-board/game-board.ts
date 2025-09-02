import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GameService } from '../services/game';
import { PokemonService } from '../services/pokemon';
import { CardComponent } from '../card/card';
import { GameSettingsComponent } from '../game-settings/game-settings';
import { GameState, GameSettings } from '../models/card.model';

@Component({
  selector: 'app-game-board',
  imports: [CommonModule, CardComponent, GameSettingsComponent],
  templateUrl: './game-board.html',
  styleUrl: './game-board.css'
})
export class GameBoardComponent implements OnInit, OnDestroy {
  gameState: GameState | null = null;
  currentSettings: GameSettings = { gridSize: 4, numberOfPlayers: 1 };
  isLoading = false;
  gameStarted = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private gameService: GameService,
    private pokemonService: PokemonService
  ) {}

  ngOnInit(): void {
    this.gameService.gameState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.gameState = state;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSettingsChanged(settings: GameSettings): void {
    this.currentSettings = settings;
  }

  onStartGame(): void {
    this.isLoading = true;
    this.gameStarted = true;
    
    const totalCards = this.currentSettings.gridSize * this.currentSettings.gridSize;
    const pairsNeeded = totalCards / 2;
    
    this.pokemonService.getRandomPokemon(pairsNeeded).subscribe({
      next: (pokemon) => {
        this.gameService.initializeGame(
          this.currentSettings.gridSize,
          this.currentSettings.numberOfPlayers,
          pokemon
        );
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching Pokemon:', error);
        this.isLoading = false;
      }
    });
  }

  onCardClicked(cardId: string): void {
    this.gameService.flipCard(cardId);
  }

  onResetGame(): void {
    this.gameService.resetGame();
  }

  onNewGame(): void {
    this.gameStarted = false;
    this.gameState = null;
  }

  getGridClass(): string {
    if (!this.gameState) return '';
    const size = Math.sqrt(this.gameState.cards.length);
    return `grid-${size}x${size}`;
  }

  getWinner(): string {
    if (!this.gameState || !this.gameState.isGameWon) return '';
    
    if (this.gameState.playerScores.length === 1) {
      return 'Congratulations! You won!';
    } else {
      const player1Score = this.gameState.playerScores[0];
      const player2Score = this.gameState.playerScores[1];
      
      if (player1Score > player2Score) {
        return 'Player 1 Wins!';
      } else if (player2Score > player1Score) {
        return 'Player 2 Wins!';
      } else {
        return "It's a Tie!";
      }
    }
  }

  trackByCardId(index: number, card: any): string {
    return card.id;
  }
}
