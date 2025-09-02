import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Card } from '../models/card.model';

@Component({
  selector: 'app-card',
  imports: [CommonModule],
  templateUrl: './card.html',
  styleUrl: './card.css'
})
export class CardComponent {
  @Input() card!: Card;
  @Output() cardClicked = new EventEmitter<string>();

  onCardClick(): void {
    if (!this.card.isFlipped && !this.card.isMatched) {
      this.cardClicked.emit(this.card.id);
    }
  }
}
