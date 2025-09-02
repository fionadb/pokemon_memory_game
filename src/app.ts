// Declare axios for TypeScript
declare const axios: any;

interface Pokemon {
    id: number;
    name: string;
    sprite: string;
    artwork: string;
    types: string[];
    cry?: string;
}

interface Card {
    pokemon: Pokemon;
    isFlipped: boolean;
    isMatched: boolean;
    id: number;
    isShaking?: boolean;
    showMatchEffect?: boolean;
}

interface Player {
    score: number;
}

class GameController {
    public gridSize: number = 4;
    public playerCount: number = 1;
    public cards: Card[] = [];
    public players: Player[] = [];
    public currentPlayer: number = 0;
    public flippedCards: number[] = [];
    public moves: number = 0;
    public gameWon: boolean = false;
    public loading: boolean = false;
    public startTime: number = 0;
    public elapsedTime: number = 0;
    public showFireworks: boolean = false;
    public lastMatchedPokemon: string = '';
    public comboCount: number = 0;
    public showCombo: boolean = false;
    private gameTimer: any;
    private audioContext: AudioContext | null = null;

    private funnyMessages = {
        match: [
            "🎉 Gotcha! That's a match!",
            "⚡ Electric! You caught 'em both!",
            "🔥 Fire move! Perfect match!",
            "💫 Stellar! Two of a kind!",
            "🌟 Amazing! You're a Pokemon Master!",
            "🎯 Bullseye! Match found!",
            "🚀 Blast off! Another match!"
        ],
        noMatch: [
            "💭 Hmm... not quite right!",
            "🤔 Close, but no Pokeball!",
            "😅 Oops! Try again, trainer!",
            "🎪 Almost! Keep trying!",
            "🎲 Nope! Roll again!",
            "🌪️ Whiff! Better luck next time!"
        ],
        gameWon: [
            "🏆 CHAMPION! You caught 'em all!",
            "👑 LEGENDARY! You're the very best!",
            "🎊 MAGNIFICENT! Pokemon Master achieved!",
            "⭐ OUTSTANDING! Gotta catch 'em all - DONE!"
        ]
    };

    constructor(private $scope: ng.IScope, private $timeout: ng.ITimeoutService) {
        this.initializeAudio();
        this.initializePlayers();
        this.resetGame();
    }

    private initializeAudio(): void {
        try {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.log('Audio context not supported');
        }
    }

    private playSound(frequency: number, duration: number, type: 'sine' | 'square' | 'triangle' = 'sine'): void {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    private playMatchSound(): void {
        this.playSound(523, 0.1);
        setTimeout(() => this.playSound(659, 0.1), 100);
        setTimeout(() => this.playSound(784, 0.2), 200);
    }

    private playNoMatchSound(): void {
        this.playSound(400, 0.2, 'square');
        setTimeout(() => this.playSound(300, 0.3, 'square'), 150);
    }

    private playVictorySound(): void {
        const notes = [523, 659, 784, 1047];
        notes.forEach((note, index) => {
            setTimeout(() => this.playSound(note, 0.3), index * 100);
        });
    }

    private showMatchEffect(index1: number, index2: number): void {
        this.cards[index1].showMatchEffect = true;
        this.cards[index2].showMatchEffect = true;

        this.$timeout(() => {
            this.cards[index1].showMatchEffect = false;
            this.cards[index2].showMatchEffect = false;
            this.$scope.$apply();
        }, 1500);
    }

    private shakeCard(index: number): void {
        this.cards[index].isShaking = true;
        this.$timeout(() => {
            this.cards[index].isShaking = false;
            this.$scope.$apply();
        }, 600);
    }

    private getRandomMessage(type: 'match' | 'noMatch' | 'gameWon'): string {
        const messages = this.funnyMessages[type];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    private initializePlayers(): void {
        this.players = [];
        for (let i = 0; i < this.playerCount; i++) {
            this.players.push({ score: 0 });
        }
        this.currentPlayer = 0;
    }

    public async resetGame(): Promise<void> {
        this.loading = true;
        this.gameWon = false;
        this.moves = 0;
        this.elapsedTime = 0;
        this.flippedCards = [];
        this.cards = [];
        this.showFireworks = false;
        this.comboCount = 0;

        this.initializePlayers();

        try {
            await this.loadPokemonCards();
            this.shuffleCards();
            this.startTimer();
        } catch (error) {
            console.error('Error loading Pokemon cards:', error);
        } finally {
            this.loading = false;
            this.$scope.$apply();
        }
    }

    private async loadPokemonCards(): Promise<void> {
        const totalCards = this.gridSize * this.gridSize;
        const uniqueCards = totalCards / 2;
        const pokemonIds = this.generateRandomPokemonIds(uniqueCards);

        const pokemonPromises = pokemonIds.map(id => this.fetchPokemon(id));
        const pokemons = await Promise.all(pokemonPromises);

        this.cards = [];
        let cardId = 0;

        pokemons.forEach(pokemon => {
            for (let i = 0; i < 2; i++) {
                this.cards.push({
                    pokemon: pokemon,
                    isFlipped: false,
                    isMatched: false,
                    id: cardId++
                });
            }
        });
    }

    private generateRandomPokemonIds(count: number): number[] {
        const ids: number[] = [];
        const maxPokemonId = 151;

        while (ids.length < count) {
            const id = Math.floor(Math.random() * maxPokemonId) + 1;
            if (!ids.includes(id)) {
                ids.push(id);
            }
        }

        return ids;
    }

    private async fetchPokemon(id: number): Promise<Pokemon> {
        try {
            const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
            const speciesResponse = await axios.get(response.data.species.url);

            return {
                id: response.data.id,
                name: response.data.name,
                sprite: response.data.sprites.front_default,
                artwork: response.data.sprites.other['official-artwork'].front_default || response.data.sprites.front_default,
                types: response.data.types.map((type: any) => type.type.name),
                cry: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`
            };
        } catch (error) {
            console.error(`Error fetching Pokemon ${id}:`, error);
            return {
                id: id,
                name: `Mystery Pokemon ${id}`,
                sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
                artwork: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
                types: ['unknown']
            };
        }
    }

    private shuffleCards(): void {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    public flipCard(index: number): void {
        const card = this.cards[index];

        if (card.isFlipped || card.isMatched || this.flippedCards.length >= 2) {
            return;
        }

        this.playSound(800, 0.1, 'triangle');

        card.isFlipped = true;
        this.flippedCards.push(index);

        if (this.flippedCards.length === 2) {
            this.moves++;
            this.$timeout(() => this.checkMatch(), 800);
        }
    }

    private checkMatch(): void {
        const [index1, index2] = this.flippedCards;
        const card1 = this.cards[index1];
        const card2 = this.cards[index2];

        if (card1.pokemon.id === card2.pokemon.id) {
            card1.isMatched = true;
            card2.isMatched = true;
            this.players[this.currentPlayer].score++;
            this.comboCount++;
            this.lastMatchedPokemon = card1.pokemon.name;

            this.playMatchSound();
            this.showMatchEffect(index1, index2);

            if (this.comboCount > 1) {
                this.showCombo = true;
                this.$timeout(() => {
                    this.showCombo = false;
                    this.$scope.$apply();
                }, 2000);
            }

            if (this.cards.every(card => card.isMatched)) {
                this.gameWon = true;
                this.stopTimer();
                this.showFireworks = true;
                this.playVictorySound();

                this.$timeout(() => {
                    this.showFireworks = false;
                    this.$scope.$apply();
                }, 5000);
            }
        } else {
            this.comboCount = 0;
            this.playNoMatchSound();
            this.shakeCard(index1);
            this.shakeCard(index2);

            this.$timeout(() => {
                card1.isFlipped = false;
                card2.isFlipped = false;

                if (this.playerCount === 2) {
                    this.currentPlayer = (this.currentPlayer + 1) % 2;
                }
                this.$scope.$apply();
            }, 300);
        }

        this.flippedCards = [];
        this.$scope.$apply();
    }

    private startTimer(): void {
        this.startTime = Date.now();
        this.gameTimer = setInterval(() => {
            this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
            this.$scope.$apply();
        }, 1000);
    }

    private stopTimer(): void {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }

    public formatTime(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    public getCardImage(card: Card): string {
        return card.isFlipped ? card.pokemon.artwork : card.pokemon.sprite;
    }

    public getTypeColor(pokemon: Pokemon): string {
        const typeColors: { [key: string]: string } = {
            fire: '#FF6B6B',
            water: '#4ECDC4',
            grass: '#95E1D3',
            electric: '#FFD93D',
            psychic: '#FF8A65',
            ice: '#87CEEB',
            dragon: '#9C88FF',
            dark: '#6C5B7B',
            fairy: '#FFB3E6',
            fighting: '#D2691E',
            poison: '#9B59B6',
            ground: '#D2B48C',
            flying: '#87CEEB',
            bug: '#90EE90',
            rock: '#A0522D',
            ghost: '#9370DB',
            steel: '#B0C4DE',
            normal: '#F5DEB3'
        };

        return typeColors[pokemon.types[0]] || '#DDD';
    }

    public getCurrentMessage(): string {
        if (this.gameWon) {
            return this.getRandomMessage('gameWon');
        }
        if (this.lastMatchedPokemon && this.comboCount > 0) {
            return this.getRandomMessage('match').replace('match', `${this.lastMatchedPokemon} match`);
        }
        return '';
    }
}

// AngularJS module and controller registration
angular.module('pokemonMemoryGame', [])
    .controller('GameController', ['$scope', '$timeout', GameController]);

// Ensure the module is available globally
(window as any).angular = angular;