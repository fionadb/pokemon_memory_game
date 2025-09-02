/**
 * REGRESSION TESTS - Comprehensive functionality verification
 * These tests ensure existing features continue to work after changes
 */

describe('Pokemon Memory Game - Regression Tests', () => {
    let gameController;
    let mockScope;
    let mockTimeout;

    beforeEach(() => {
        mockScope = { $apply: jest.fn() };
        mockTimeout = jest.fn((fn, delay) => {
            if (typeof fn === 'function') {
                // Execute immediately for tests
                fn();
            }
            return { cancel: jest.fn() };
        });
        mockTimeout.cancel = jest.fn();
        jest.clearAllMocks();
        
        global.axios.get.mockResolvedValue({
            data: {
                id: 1,
                name: 'pikachu',
                sprites: { front_default: 'sprite-url', other: { 'official-artwork': { front_default: 'artwork-url' } } },
                types: [{ type: { name: 'electric' } }]
            }
        });
    });

    test('[REGRESSION] Match detection should work correctly', () => {
        gameController = new GameController(mockScope, mockTimeout);
        gameController.cards = [
            { pokemon: { id: 1, name: 'pikachu' }, isFlipped: false, isMatched: false, id: 0 },
            { pokemon: { id: 1, name: 'pikachu' }, isFlipped: false, isMatched: false, id: 1 },
            { pokemon: { id: 2, name: 'bulbasaur' }, isFlipped: false, isMatched: false, id: 2 },
            { pokemon: { id: 2, name: 'bulbasaur' }, isFlipped: false, isMatched: false, id: 3 }
        ];
        
        // Flip two matching cards
        gameController.flipCard(0);
        gameController.flipCard(1);
        
        expect(gameController.flippedCards).toEqual([0, 1]);
        expect(gameController.moves).toBe(1);
        
        // Manually trigger checkMatch for test
        gameController.checkMatch();
        
        expect(gameController.cards[0].isMatched).toBe(true);
        expect(gameController.cards[1].isMatched).toBe(true);
        expect(gameController.players[0].score).toBe(1);
    });

    test('[REGRESSION] Non-matching cards should flip back', () => {
        gameController = new GameController(mockScope, mockTimeout);
        gameController.cards = [
            { pokemon: { id: 1, name: 'pikachu' }, isFlipped: false, isMatched: false, id: 0 },
            { pokemon: { id: 2, name: 'bulbasaur' }, isFlipped: false, isMatched: false, id: 1 }
        ];
        
        gameController.flipCard(0);
        gameController.flipCard(1);
        
        // Manually trigger checkMatch for test
        gameController.checkMatch();
        
        // Cards should be flipped back immediately due to mock timeout
        expect(gameController.cards[0].isFlipped).toBe(false);
        expect(gameController.cards[1].isFlipped).toBe(false);
        expect(gameController.players[0].score).toBe(0);
    });

    test('[REGRESSION] Game completion should trigger correctly', () => {
        gameController = new GameController(mockScope, mockTimeout);
        gameController.cards = [
            { pokemon: { id: 1, name: 'pikachu' }, isFlipped: true, isMatched: true, id: 0 },
            { pokemon: { id: 1, name: 'pikachu' }, isFlipped: true, isMatched: true, id: 1 }
        ];
        
        // Set up flipped cards to trigger match check
        gameController.flippedCards = [0, 1];
        gameController.checkMatch();
        
        expect(gameController.gameWon).toBe(true);
    });

    test('[REGRESSION] Leaderboard should store and retrieve correctly', () => {
        const mockLeaderboard = JSON.stringify([
            { name: 'TestPlayer', score: 10, time: 60, moves: 8, gridSize: 4, difficulty: 'Easy', date: '1/1/2024' }
        ]);
        global.localStorage.getItem.mockReturnValue(mockLeaderboard);
        
        gameController = new GameController(mockScope, mockTimeout);
        
        expect(gameController.leaderboard).toHaveLength(1);
        expect(gameController.leaderboard[0].name).toBe('TestPlayer');
        
        gameController.addToLeaderboard('NewPlayer', 15);
        expect(global.localStorage.setItem).toHaveBeenCalled();
    });

    test('[REGRESSION] Power-up functionality should work', () => {
        gameController = new GameController(mockScope, mockTimeout);
        gameController.cards = [
            { pokemon: { id: 1, name: 'pikachu' }, isFlipped: false, isMatched: false, id: 0, isPowerUp: true }
        ];
        
        gameController.flipCard(0);
        
        expect(gameController.players[0].powerUps).toBe(1);
        expect(gameController.cards[0].isPowerUp).toBe(false);
    });

    test('[REGRESSION] Streak counting should work correctly', () => {
        gameController = new GameController(mockScope, mockTimeout);
        gameController.cards = [
            { pokemon: { id: 1, name: 'pikachu' }, isFlipped: false, isMatched: false, id: 0 },
            { pokemon: { id: 1, name: 'pikachu' }, isFlipped: false, isMatched: false, id: 1 },
            { pokemon: { id: 2, name: 'bulbasaur' }, isFlipped: false, isMatched: false, id: 2 },
            { pokemon: { id: 2, name: 'bulbasaur' }, isFlipped: false, isMatched: false, id: 3 }
        ];
        
        // First match
        gameController.flipCard(0);
        gameController.flipCard(1);
        gameController.checkMatch();
        
        expect(gameController.streakCount).toBe(1);
        expect(gameController.players[0].streak).toBe(1);
        
        // Second match
        gameController.flipCard(2);
        gameController.flipCard(3);
        gameController.checkMatch();
        
        expect(gameController.streakCount).toBe(2);
    });

    test('[REGRESSION] Different grid sizes should generate correct card counts', async () => {
        gameController = new GameController(mockScope, mockTimeout);
        
        // Test 4x4 grid
        gameController.gridSize = 4;
        await gameController.resetGame();
        expect(gameController.cards).toHaveLength(16);
        
        // Test 6x6 grid
        gameController.gridSize = 6;
        await gameController.resetGame();
        expect(gameController.cards).toHaveLength(36);
        
        // Test 8x8 grid
        gameController.gridSize = 8;
        await gameController.resetGame();
        expect(gameController.cards).toHaveLength(64);
    });

    test('[REGRESSION] Two-player mode should alternate turns', () => {
        gameController = new GameController(mockScope, mockTimeout);
        gameController.playerCount = 2;
        gameController.initializePlayers();
        gameController.cards = [
            { pokemon: { id: 1, name: 'pikachu' }, isFlipped: false, isMatched: false, id: 0 },
            { pokemon: { id: 2, name: 'bulbasaur' }, isFlipped: false, isMatched: false, id: 1 }
        ];
        
        expect(gameController.currentPlayer).toBe(0);
        
        // Make a non-matching move
        gameController.flipCard(0);
        gameController.flipCard(1);
        gameController.checkMatch();
        
        // Turn should switch after non-matching move
        expect(gameController.currentPlayer).toBe(1);
    });

    test('[REGRESSION] Bonus calculation should work correctly', () => {
        gameController = new GameController(mockScope, mockTimeout);
        gameController.gridSize = 4;
        gameController.moves = 8; // Minimum moves for 4x4
        gameController.elapsedTime = 45; // Under 60 seconds
        
        gameController.calculateBonuses();
        
        expect(gameController.perfectGameBonus).toBe(true);
        expect(gameController.speedBonus).toBe(true);
        expect(gameController.players[0].score).toBe(8); // 5 + 3 bonus points
    });
});