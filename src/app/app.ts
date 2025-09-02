import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameBoardComponent } from './game-board/game-board';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GameBoardComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'Pokemon Memory Game';
}
