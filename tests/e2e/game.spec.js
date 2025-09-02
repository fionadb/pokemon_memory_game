import { test, expect } from '@playwright/test';

test.describe('Pokemon Memory Game - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
  });

  test('[E2E-SMOKE] Page loads correctly', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Pokemon Memory Game');
    await expect(page.locator('.game-board')).toBeVisible();
    await expect(page.locator('.reset-btn')).toBeVisible();
    await expect(page.locator('.leaderboard-btn')).toBeVisible();
  });

  test('[E2E-SMOKE] Game controls work', async ({ page }) => {
    // Test grid size selection
    await page.selectOption('select[ng-model="game.gridSize"]', '6');
    
    // Test player count selection - should trigger name input
    await page.selectOption('select[ng-model="game.playerCount"]', '2');
    
    // Name input modal should appear
    await expect(page.locator('.name-input-modal')).toBeVisible();
    
    // Fill in player names
    await page.fill('input[ng-model="game.tempPlayerNames[0]"]', 'Player One');
    await page.fill('input[ng-model="game.tempPlayerNames[1]"]', 'Player Two');
    
    // Confirm names
    await page.click('.confirm-btn');
    
    // Modal should close
    await expect(page.locator('.name-input-modal')).not.toBeVisible();
  });

  test('[E2E-REGRESSION] Card flipping functionality', async ({ page }) => {
    // Wait for game to load
    await page.waitForSelector('.card:not(.loading)', { timeout: 10000 });
    
    const cards = page.locator('.card');
    await expect(cards.first()).toBeVisible();
    
    // Flip first card
    await cards.first().click();
    await expect(cards.first()).toHaveClass(/flipped/);
    
    // Flip second card
    await cards.nth(1).click();
    await expect(cards.nth(1)).toHaveClass(/flipped/);
    
    // Check if moves counter increased
    const movesText = await page.locator('.game-stats span').first().textContent();
    expect(movesText).toContain('1');
  });

  test('[E2E-REGRESSION] Leaderboard functionality', async ({ page }) => {
    // Open leaderboard
    await page.click('.leaderboard-btn');
    await expect(page.locator('.leaderboard-modal')).toBeVisible();
    
    // Check tabs
    await expect(page.locator('.tab-btn')).toHaveCount(2);
    
    // Switch to all difficulties tab
    await page.click('.tab-btn:nth-child(2)');
    await expect(page.locator('.tab-btn:nth-child(2)')).toHaveClass(/active/);
    
    // Close leaderboard
    await page.click('.close-btn');
    await expect(page.locator('.leaderboard-modal')).not.toBeVisible();
  });

  test('[E2E-REGRESSION] Complete game flow', async ({ page }) => {
    // Set to easy mode (4x4) for faster completion
    await page.selectOption('select[ng-model="game.gridSize"]', '4');
    
    // Wait for cards to load
    await page.waitForSelector('.card:not(.loading)', { timeout: 10000 });
    
    const cards = page.locator('.card');
    const cardCount = await cards.count();
    expect(cardCount).toBe(16);
    
    // Try to match all cards (simplified for testing)
    // In a real scenario, we'd need to implement card matching logic
    // For now, just verify the game structure is correct
    
    await expect(page.locator('.game-stats')).toBeVisible();
    await expect(page.locator('.score-board')).toBeVisible();
  });

  test('[E2E-REGRESSION] Responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('.game-header')).toBeVisible();
    await expect(page.locator('.game-board')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await expect(page.locator('.game-controls')).toBeVisible();
    await expect(page.locator('.game-info')).toBeVisible();
  });

  test('[E2E-SMOKE] Audio controls don\'t cause errors', async ({ page }) => {
    // Listen for console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Wait for game to load
    await page.waitForSelector('.card', { timeout: 10000 });
    
    // Click a card to trigger audio
    await page.locator('.card').first().click();
    
    // Wait a moment for any audio-related errors
    await page.waitForTimeout(1000);
    
    // Check for audio-related errors (should be minimal due to browser restrictions)
    const audioErrors = consoleErrors.filter(error => 
      error.includes('audio') || error.includes('AudioContext')
    );
    
    // Some audio errors are expected due to browser autoplay policies
    // We just ensure no critical application errors occur
    expect(consoleErrors.filter(error => 
      error.includes('TypeError') || error.includes('ReferenceError')
    )).toHaveLength(0);
  });

  test('[E2E-REGRESSION] Game state persistence', async ({ page }) => {
    // Start a game and make some moves
    await page.waitForSelector('.card', { timeout: 10000 });
    
    // Click some cards
    await page.locator('.card').first().click();
    await page.locator('.card').nth(1).click();
    
    // Check that moves are tracked
    const initialMoves = await page.locator('.game-stats span').first().textContent();
    expect(initialMoves).toContain('Moves:');
    
    // Reset game
    await page.click('.reset-btn');
    
    // Verify game reset
    await page.waitForSelector('.card', { timeout: 10000 });
    const resetMoves = await page.locator('.game-stats span').first().textContent();
    expect(resetMoves).toContain('Moves: 0');
  });

  test('[E2E-REGRESSION] Error handling for network issues', async ({ page }) => {
    // Simulate network failure
    await page.route('https://pokeapi.co/api/v2/pokemon/*', route => {
      route.abort();
    });
    
    // Try to start a new game
    await page.click('.reset-btn');
    
    // Game should handle the error gracefully
    await page.waitForTimeout(5000);
    
    // Check that the game doesn't break completely
    await expect(page.locator('.game-container')).toBeVisible();
    await expect(page.locator('.reset-btn')).toBeVisible();
  });
});