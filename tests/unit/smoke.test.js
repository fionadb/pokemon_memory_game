/**
 * SMOKE TESTS - Basic functionality verification
 * These tests ensure core features work without deep validation
 */

describe('Pokemon Memory Game - Smoke Tests', () => {
    let gameController;
    let mockScope;
    let mockTimeout;

    beforeEach(() => {
        // Mock AngularJS dependencies
        mockScope = {
            $apply: jest.fn()
        };
        mockTimeout = jest.fn((fn, delay) => {
            if (typeof fn === 'function') {
                setTimeout(fn, delay || 0);
            }
            return { cancel: jest.fn() };
        });
        mockTimeout.cancel = jest.fn();

        // Reset mocks
        jest.clearAllMocks();
        
        // Mock successful Pokemon API response
        global.axios.get.mockResolvedValue({
            data: {
                id: 1,
                name: 'pikachu',
                sprites: {
                    front_default: 'sprite-url',
                    other: {
                        'official-artwork': {
                            front_default: 'artwork-url'
                        }
                    }
                },
                types: [{ type: { name: 'electric' } }]
            }
        });
    });

    test('[SMOKE] GameController should initialize successfully', () => {
        gameController = new GameController(mockScope, mockTimeout);
        
        expect(gameController).toBeDefined();
        expect(gameController.gridSize).toBe(4);
        expect(gameController.playerCount).toBe(1);
        expect(gameController.cards).toEqual([]);
        expect(gameController.players).toHaveLength(1);
    });

    test('[SMOKE] Game should start with default settings', async () => {
        gameController = new GameController(mockScope, mockTimeout);
        
        await gameController.resetGame();
        
        expect(gameController.loading).toBe(false);
        expect(gameController.gameWon).toBe(false);
        expect(gameController.moves).toBe(0);
        expect(gameController.cards.length).toBeGreaterThan(0);
    });

    test('[SMOKE] Player name input should work', () => {
        gameController = new GameController(mockScope, mockTimeout);
        
        gameController.showPlayerNameInput();
        expect(gameController.showNameInput).toBe(true);
        expect(gameController.tempPlayerNames).toHaveLength(1);
        
        gameController.tempPlayerNames[0] = 'TestPlayer';
        gameController.confirmPlayerNames();
        
        expect(gameController.players[0].name).toBe('TestPlayer');
        expect(gameController.showNameInput).toBe(false);
    });

    test('[SMOKE] Leaderboard should toggle visibility', () => {
        gameController = new GameController(mockScope, mockTimeout);
        
        expect(gameController.showLeaderboard).toBe(false);
        
        gameController.toggleLeaderboard();
        expect(gameController.showLeaderboard).toBe(true);
        
        gameController.toggleLeaderboard();
        expect(gameController.showLeaderboard).toBe(false);
    });

    test('[SMOKE] Card flip should work', () => {
        gameController = new GameController(mockScope, mockTimeout);
        gameController.cards = [
            { pokemon: { id: 1, name: 'pikachu' }, isFlipped: false, isMatched: false, id: 0 },
            { pokemon: { id: 2, name: 'bulbasaur' }, isFlipped: false, isMatched: false, id: 1 }
        ];
        
        gameController.flipCard(0);
        
        expect(gameController.cards[0].isFlipped).toBe(true);
        expect(gameController.flippedCards).toContain(0);
    });

    test('[SMOKE] Audio should initialize without errors', () => {
        gameController = new GameController(mockScope, mockTimeout);
        
        expect(() => {
            gameController.playSound(440, 0.1);
        }).not.toThrow();
    });

    test('[SMOKE] Game settings should change', () => {
        gameController = new GameController(mockScope, mockTimeout);
        
        gameController.gridSize = 6;
        gameController.playerCount = 2;
        gameController.onGridSizeChange();
        
        expect(gameController.gridSize).toBe(6);
        expect(gameController.playerCount).toBe(2);
    });

    test('[SMOKE] Leaderboard should load and save', () => {
        global.localStorage.getItem.mockReturnValue('[]');
        
        gameController = new GameController(mockScope, mockTimeout);
        
        expect(global.localStorage.getItem).toHaveBeenCalledWith('pokemonMemoryLeaderboard');
        
        gameController.clearLeaderboard();
        expect(global.localStorage.setItem).toHaveBeenCalled();
    });
});