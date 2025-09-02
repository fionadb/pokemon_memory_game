export interface Card {
  id: string;
  pokemonId: number;
  name: string;
  imageUrl: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
}

export interface GameSettings {
  gridSize: number;
  numberOfPlayers: number;
}

export interface GameState {
  cards: Card[];
  flippedCards: Card[];
  matchedPairs: number;
  currentPlayer: number;
  playerScores: number[];
  isGameWon: boolean;
  moves: number;
}
