import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameSettings } from '../models/card.model';

@Component({
  selector: 'app-game-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './game-settings.html',
  styleUrl: './game-settings.css'
})
export class GameSettingsComponent {
  @Output() settingsChanged = new EventEmitter<GameSettings>();
  @Output() startGame = new EventEmitter<void>();

  gridSize: number = 4;
  numberOfPlayers: number = 1;
  
  gridSizeOptions = [
    { value: 4, label: '4x4 (16 cards)' },
    { value: 6, label: '6x6 (36 cards)' },
    { value: 8, label: '8x8 (64 cards)' }
  ];

  playerOptions = [
    { value: 1, label: '1 Player' },
    { value: 2, label: '2 Players' }
  ];

  onSettingsChange(): void {
    this.settingsChanged.emit({
      gridSize: this.gridSize,
      numberOfPlayers: this.numberOfPlayers
    });
  }

  onStartGame(): void {
    this.onSettingsChange();
    this.startGame.emit();
  }
}
