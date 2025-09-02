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
    isPowerUp?: boolean;
}

interface Player {
    score: number;
    streak: number;
    powerUps: number;
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
    public streakCount: number = 0;
    public showStreak: boolean = false;
    public currentMessage: string = '';
    public messageTimeout: any;
    public perfectGameBonus: boolean = false;
    public speedBonus: boolean = false;
    private gameTimer: any;
    private audioContext: AudioContext | null = null;

    private funnyMessages = {
        match: [
            "🎉 Gotcha! That's a perfect match!",
            "⚡ Electric connection! You caught them both!",
            "🔥 Fire move! Absolutely blazing!",
            "💫 Stellar! Two peas in a Pokeball!",
            "🌟 Amazing! You're becoming a legend!",
            "🎯 Bullseye! Pokemon trainer skills activated!",
            "🚀 Blast off! Another fantastic match!",
            "💎 Diamond tier! Incredible memory!",
            "🎪 Spectacular! The crowd goes wild!",
            "🌈 Rainbow power! Perfect harmony!"
        ],
        noMatch: [
            "💭 Hmm... not quite right, trainer!",
            "🤔 Close, but no Pokeball this time!",
            "😅 Oops! Even masters make mistakes!",
            "🎪 Almost! The suspense is killing me!",
            "🎲 Nope! Roll those dice again!",
            "🌪️ Whiff! Better luck next flip!",
            "🤷 Whoopsie! Try a different approach!",
            "🎭 Plot twist! Not the match we expected!",
            "🎨 Mix and match... well, just mix for now!",
            "🧩 Puzzle piece doesn't fit yet!"
        ],
        streak: [
            "🔥 ON FIRE! {count} matches in a row!",
            "⚡ LIGHTNING STREAK! {count} consecutive wins!",
            "🌟 UNSTOPPABLE! {count} match combo!",
            "🚀 ROCKET POWERED! {count} perfect moves!",
            "💫 COSMIC! {count} stellar matches!",
            "🎯 SHARPSHOOTER! {count} bullseyes!",
            "👑 ROYAL! {count} majestic matches!"
        ],
        gameWon: [
            "🏆 CHAMPION! You caught 'em all like a true master!",
            "👑 LEGENDARY! You're the very best, like no one ever was!",
            "🎊 MAGNIFICENT! Pokemon Master status achieved!",
            "⭐ OUTSTANDING! Gotta catch 'em all - MISSION COMPLETE!",
            "🎉 PHENOMENAL! Professor Oak would be so proud!",
            "🌟 INCREDIBLE! You've become a Pokemon legend!",
            "💎 FLAWLESS! A performance worthy of the Hall of Fame!"
        ],
        powerUp: [
            "💥 POWER-UP ACTIVATED! Double vision mode!",
            "⚡ ELECTRIC BOOST! Cards revealed briefly!",
            "🔮 MYSTIC SIGHT! Peek into the future!",
            "🌟 STAR POWER! Extra hint incoming!"
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
        // Enhanced match sound with harmony
        this.playSound(523, 0.1);
        this.playSound(659, 0.1);
        setTimeout(() => this.playSound(659, 0.1), 100);
        setTimeout(() => this.playSound(784, 0.2), 200);
        setTimeout(() => this.playSound(1047, 0.15), 300);
    }

    private playStreakSound(): void {
        // Special streak sound
        const notes = [440, 523, 659, 784, 880];
        notes.forEach((note, index) => {
            setTimeout(() => this.playSound(note, 0.1, 'triangle'), index * 50);
        });
    }

    private playNoMatchSound(): void {
        this.playSound(400, 0.2, 'square');
        setTimeout(() => this.playSound(300, 0.3, 'square'), 150);
    }

    private playVictorySound(): void {
        // Epic victory fanfare
        const melody = [523, 659, 784, 1047, 1319, 1047, 784, 1047];
        melody.forEach((note, index) => {
            setTimeout(() => this.playSound(note, 0.3), index * 150);
        });
    }

    private playPowerUpSound(): void {
        // Rising power-up sound
        for (let i = 0; i < 8; i++) {
            setTimeout(() => this.playSound(400 + (i * 100), 0.1, 'triangle'), i * 50);
        }
    }

    private showMessage(message: string, duration: number = 3000): void {
        this.currentMessage = message;
        if (this.messageTimeout) {
            this.$timeout.cancel(this.messageTimeout);
        }
        this.messageTimeout = this.$timeout(() => {
            this.currentMessage = '';
            this.$scope.$apply();
        }, duration);
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

    private getRandomMessage(type: 'match' | 'noMatch' | 'gameWon' | 'streak' | 'powerUp', params?: any): string {
        const messages = this.funnyMessages[type];
        let message = messages[Math.floor(Math.random() * messages.length)];
        
        if (type === 'streak' && params?.count) {
            message = message.replace('{count}', params.count);
        }
        
        return message;
    }

    private addPowerUpCard(): void {
        // Add power-up card randomly (10% chance per pair)
        if (Math.random() < 0.1 && this.cards.length > 4) {
            const randomIndex = Math.floor(Math.random() * this.cards.length);
            if (!this.cards[randomIndex].isPowerUp) {
                this.cards[randomIndex].isPowerUp = true;
            }
        }
    }

    private activatePowerUp(): void {
        this.players[this.currentPlayer].powerUps++;
        this.playPowerUpSound();
        this.showMessage(this.getRandomMessage('powerUp'));
        
        // Briefly reveal all cards
        this.cards.forEach(card => {
            if (!card.isMatched && !card.isFlipped) {
                card.isFlipped = true;
            }
        });

        this.$timeout(() => {
            this.cards.forEach(card => {
                if (!card.isMatched && card.isFlipped && !this.flippedCards.includes(this.cards.indexOf(card))) {
                    card.isFlipped = false;
                }
            });
            this.$scope.$apply();
        }, 1000);
    }

    private initializePlayers(): void {
        this.players = [];
        for (let i = 0; i < this.playerCount; i++) {
            this.players.push({ score: 0, streak: 0, powerUps: 0 });
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
        this.streakCount = 0;
        this.currentMessage = '';
        this.perfectGameBonus = false;
        this.speedBonus = false;

        this.initializePlayers();

        try {
            await this.loadPokemonCards();
            this.shuffleCards();
            this.addPowerUpCard();
            this.startTimer();
            this.showMessage("🎮 Game started! Find matching Pokemon pairs! 🎮");
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
            
            // Get artwork URL with better fallback handling
            const artworkUrl = response.data.sprites.other?.['official-artwork']?.front_default;
            const spriteUrl = response.data.sprites.front_default;
            
            return {
                id: response.data.id,
                name: response.data.name,
                sprite: spriteUrl || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
                artwork: artworkUrl || spriteUrl || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
                types: response.data.types.map((type: any) => type.type.name),
                cry: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`
            };
        } catch (error) {
            console.error(`Error fetching Pokemon ${id}:`, error);
            // Return a fallback Pokemon with working image URLs
            return {
                id: id,
                name: `Pokemon ${id}`,
                sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
                artwork: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
                types: ['normal']
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

        // Check for power-up activation
        if (card.isPowerUp && !card.isMatched) {
            this.activatePowerUp();
            card.isPowerUp = false;
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
            this.players[this.currentPlayer].streak++;
            this.comboCount++;
            this.streakCount++;
            this.lastMatchedPokemon = card1.pokemon.name;

            this.playMatchSound();
            this.showMatchEffect(index1, index2);

            // Enhanced messages based on performance
            let matchMessage = this.getRandomMessage('match');
            if (this.streakCount >= 3) {
                this.playStreakSound();
                matchMessage = this.getRandomMessage('streak', { count: this.streakCount });
                this.showStreak = true;
                this.$timeout(() => {
                    this.showStreak = false;
                    this.$scope.$apply();
                }, 2500);
            }

            this.showMessage(`${matchMessage} - ${card1.pokemon.name.toUpperCase()} matched!`);

            if (this.comboCount > 1) {
                this.showCombo = true;
                this.$timeout(() => {
                    this.showCombo = false;
                    this.$scope.$apply();
                }, 2000);
            }

            // Check for game completion
            if (this.cards.every(card => card.isMatched)) {
                this.gameWon = true;
                this.stopTimer();
                this.calculateBonuses();
                this.showFireworks = true;
                this.playVictorySound();

                this.$timeout(() => {
                    this.showFireworks = false;
                    this.$scope.$apply();
                }, 5000);
            }
        } else {
            // Reset streaks on mismatch
            this.players[this.currentPlayer].streak = 0;
            this.comboCount = 0;
            this.streakCount = 0;
            
            this.playNoMatchSound();
            this.shakeCard(index1);
            this.shakeCard(index2);
            
            const noMatchMessage = this.getRandomMessage('noMatch');
            this.showMessage(`${noMatchMessage} - ${card1.pokemon.name} ≠ ${card2.pokemon.name}`);

            this.$timeout(() => {
                card1.isFlipped = false;
                card2.isFlipped = false;

                if (this.playerCount === 2) {
                    this.currentPlayer = (this.currentPlayer + 1) % 2;
                }
                this.$scope.$apply();
            }, 1200);
        }

        this.flippedCards = [];
        this.$scope.$apply();
    }

    private calculateBonuses(): void {
        const minimumMoves = this.gridSize * this.gridSize / 2;
        this.perfectGameBonus = this.moves <= minimumMoves;
        this.speedBonus = this.elapsedTime < 60;
        
        if (this.perfectGameBonus) {
            this.players[this.currentPlayer].score += 5;
        }
        if (this.speedBonus) {
            this.players[this.currentPlayer].score += 3;
        }
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
        if (card.isFlipped) {
            // Use artwork if available, fallback to sprite, then to a default image
            return card.pokemon.artwork || card.pokemon.sprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${card.pokemon.id}.png`;
        }
        return 'assets/pokeball.svg';
    }

    public handleImageError(event: any, card: Card): void {
        console.warn(`Image failed to load for ${card.pokemon.name}, using fallback`);
        // Fallback to sprite if artwork fails
        if (event.target.src === card.pokemon.artwork) {
            event.target.src = card.pokemon.sprite;
        } else {
            // If sprite also fails, use direct GitHub URL
            event.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${card.pokemon.id}.png`;
        }
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
        if (this.currentMessage) {
            return this.currentMessage;
        }
        if (this.gameWon) {
            let message = this.getRandomMessage('gameWon');
            if (this.perfectGameBonus && this.speedBonus) {
                message += " 🌟 PERFECT + SPEED BONUS! 🌟";
            } else if (this.perfectGameBonus) {
                message += " 💎 PERFECT GAME BONUS! 💎";
            } else if (this.speedBonus) {
                message += " ⚡ SPEED BONUS! ⚡";
            }
            return message;
        }
        return '';
    }

    public getStreakMessage(): string {
        if (this.streakCount >= 5) return `🔥 LEGENDARY ${this.streakCount}x STREAK! 🔥`;
        if (this.streakCount >= 3) return `⚡ ${this.streakCount}x STREAK! ⚡`;
        return '';
    }
}

// AngularJS module and controller registration
angular.module('pokemonMemoryGame', [])
    .controller('GameController', ['$scope', '$timeout', GameController]);

// Ensure the module is available globally
(window as any).angular = angular;