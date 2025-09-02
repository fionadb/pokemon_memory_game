# 🎮 Pokemon Memory Game

A fun and interactive memory game featuring Pokemon characters, built with AngularJS, TypeScript, and modern web technologies. Test your memory skills while catching them all!

## 🎯 Features

### 🎮 Core Gameplay
- **Memory Card Game**: Match pairs of Pokemon cards
- **Multiple Difficulty Levels**: 4x4 (Easy), 6x6 (Medium), 8x8 (Hard)
- **Single & Multiplayer**: Play solo or compete with a friend
- **Dynamic Layouts**: Each game generates a unique visual layout
- **Power-ups**: Special cards that reveal other cards temporarily

### 🏆 Competitive Features
- **Leaderboard System**: Track high scores across all difficulties
- **Player Names**: Customize player names for personalized experience
- **Performance Bonuses**: Perfect game and speed bonuses
- **Streak System**: Build combos for higher scores

### 🎨 Enhanced Experience
- **Real Pokemon Data**: Fetched from the PokeAPI
- **Type-based Colors**: Cards display Pokemon type colors
- **Sound Effects**: Audio feedback for actions
- **Animations**: Smooth card flips, sparkles, and celebrations
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Fireworks Celebration**: Epic victory animations

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     POKEMON MEMORY GAME                        │
├─────────────────────────────────────────────────────────────────┤
│                    PRESENTATION LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │    HTML     │  │     CSS     │  │ ANGULARJS   │            │
│  │   Template  │  │   Styling   │  │  Binding    │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
├─────────────────────────────────────────────────────────────────┤
│                   CONTROLLER LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              GAME CONTROLLER                                │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │ │
│  │  │    Game     │ │   Player    │ │ Leaderboard │          │ │
│  │  │  Management │ │ Management  │ │ Management  │          │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘          │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │ │
│  │  │   Audio     │ │   Message   │ │   Layout    │          │ │
│  │  │   System    │ │   System    │ │  Generator  │          │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘          │ │
│  └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                     SERVICE LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   POKEMON   │  │    LOCAL    │  │   TIMER     │            │
│  │     API     │  │   STORAGE   │  │   SERVICE   │            │
│  │   SERVICE   │  │   SERVICE   │  │             │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
├─────────────────────────────────────────────────────────────────┤
│                      DATA LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   POKEMON   │  │ LEADERBOARD │  │    GAME     │            │
│  │    DATA     │  │    DATA     │  │    STATE    │            │
│  │ (PokeAPI)   │  │(localStorage)│ │  (Memory)   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
├─────────────────────────────────────────────────────────────────┤
│                   EXTERNAL SERVICES                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   POKEAPI   │  │    AXIOS    │  │   BROWSER   │            │
│  │  (REST API) │  │ HTTP CLIENT │  │   STORAGE   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

### 🏗️ Component Architecture

#### 🎮 Game Controller
- **Core Logic**: Manages game state, rules, and flow
- **Card Management**: Handles card creation, shuffling, and matching
- **Player Management**: Tracks scores, turns, and statistics
- **Event Handling**: Processes user interactions and game events

#### 🎨 Presentation Layer
- **Dynamic Templates**: AngularJS-powered reactive UI
- **CSS Animations**: Smooth transitions and visual effects
- **Responsive Layout**: Adaptive design for all screen sizes
- **Real-time Updates**: Live score tracking and game state

#### 🔧 Service Layer
- **Pokemon API Integration**: Fetches real Pokemon data
- **Persistence Service**: Manages leaderboard storage
- **Audio Service**: Provides sound effects and feedback
- **Timer Service**: Tracks game duration and performance

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pokemon_memory_game
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🎮 How to Play

### 🎯 Basic Gameplay

1. **Choose Difficulty**
   - **Easy (4x4)**: 16 cards, 8 pairs - Perfect for beginners
   - **Medium (6x6)**: 36 cards, 18 pairs - Moderate challenge
   - **Hard (8x8)**: 64 cards, 32 pairs - Expert level

2. **Select Players**
   - **Single Player**: Play against the clock
   - **Two Players**: Take turns, highest score wins

3. **Enter Player Names** (Optional)
   - Customize your experience with personal names
   - Names appear in the leaderboard

4. **Start Playing**
   - Click cards to flip them
   - Find matching Pokemon pairs
   - Remember card positions for better performance

### 🏆 Scoring System

#### Base Points
- **Each Match**: +1 point
- **Perfect Game**: +5 bonus points (minimum moves)
- **Speed Bonus**: +3 bonus points (under 60 seconds)

#### Streak Bonuses
- **3+ Matches**: Streak notifications and sound effects
- **5+ Matches**: Legendary streak status
- **Consecutive Matches**: Maintain your current turn

#### Power-ups
- **Random Appearance**: ~10% chance per game
- **Effect**: Reveals all cards temporarily
- **Strategy**: Use wisely to memorize positions

### 🎨 Interactive Elements

#### Card States
- **Face Down**: Shows Pokeball design
- **Flipped**: Reveals Pokemon artwork and type
- **Matched**: Highlighted with type-based colors
- **Power-up**: Glowing effect with lightning bolt

#### Visual Feedback
- **Match Effects**: Sparkles and color bursts
- **Shake Animation**: Non-matching cards
- **Fireworks**: Victory celebration
- **Dynamic Messages**: Encouraging and funny feedback

## 🏆 Leaderboard System

### Features
- **Difficulty-based Rankings**: Separate leaderboards for each difficulty
- **Comprehensive Stats**: Score, time, moves, and date
- **Top 10 Tracking**: Best performances per difficulty
- **Persistent Storage**: Scores saved locally in browser

### Viewing Leaderboards
1. Click the **🏆 Leaderboard** button
2. Switch between **Current Difficulty** and **All Difficulties**
3. View detailed statistics for each entry
4. Compare your performance with previous games

### Score Ranking
Scores are ranked by:
1. **Highest Score** (primary)
2. **Fastest Time** (secondary)
3. **Fewest Moves** (tertiary)

## 🧪 Testing

### Test Categories

#### 🔥 Smoke Tests
Quick verification that core features work:
```bash
npm run test:smoke
```

#### 🔄 Regression Tests
Comprehensive functionality testing:
```bash
npm run test:regression
```

#### 🌐 End-to-End Tests
Full user journey testing:
```bash
npm run test:e2e
```

#### 📊 All Tests
Run complete test suite:
```bash
npm run test:all
```

### Test Coverage
- **Unit Tests**: Controller logic and utilities
- **Integration Tests**: Component interactions
- **E2E Tests**: User interface and workflows
- **Cross-browser Testing**: Chrome, Firefox, Safari
- **Mobile Testing**: Responsive design validation

## 🛠️ Development

### Project Structure
```
pokemon_memory_game/
├── src/
│   ├── app.ts              # Main game controller
│   ├── index.html          # HTML template
│   ├── styles/
│   │   └── main.css        # Styling and animations
│   └── assets/
│       └── pokeball.svg    # Game assets
├── tests/
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── e2e/               # End-to-end tests
├── dist/                   # Built files
└── package.json           # Dependencies and scripts
```

### Available Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run dev` - TypeScript watch mode
- `npm test` - Run unit tests
- `npm run test:e2e` - Run E2E tests

### Key Technologies
- **TypeScript**: Type-safe development
- **AngularJS**: Reactive UI framework
- **Jest**: Unit testing framework
- **Playwright**: E2E testing framework
- **Axios**: HTTP client for API calls
- **CSS3**: Modern styling and animations

## 🎨 Customization

### Adding New Pokemon
The game automatically fetches random Pokemon from generations 1-151. To modify:

1. Update `maxPokemonId` in `generateRandomPokemonIds()`
2. Add custom Pokemon data in `fetchPokemon()` fallback

### Modifying Difficulty Levels
Add new grid sizes in:
1. HTML select options
2. `getDifficultyName()` method
3. Update CSS grid calculations

### Custom Messages
Modify the `funnyMessages` object to add your own:
- Match messages
- No-match messages
- Streak messages
- Victory messages
- Power-up messages

## 🐛 Troubleshooting

### Common Issues

#### Cards Not Loading
- **Check internet connection** - Game requires API access
- **Refresh the page** - Temporary network issues
- **Clear browser cache** - Outdated files

#### Audio Not Working
- **Browser autoplay policies** - Click anywhere to enable audio
- **Check device volume** - Ensure system audio is on
- **Try different browser** - Some browsers restrict audio

#### Leaderboard Issues
- **Clear browser storage** - Reset if corrupted
- **Check localStorage** - Ensure browser supports it
- **Privacy mode** - May not persist data

### Performance Tips
- **Close other tabs** - Free up browser memory
- **Use latest browser** - Better performance and features
- **Stable internet** - For Pokemon image loading

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Maintain test coverage above 80%
- Use semantic commit messages
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **PokeAPI** - Amazing Pokemon data API
- **Pokemon Company** - Original Pokemon designs
- **AngularJS Team** - Fantastic framework
- **Jest & Playwright** - Excellent testing tools

## 🔗 Links

- [PokeAPI Documentation](https://pokeapi.co/)
- [AngularJS Guide](https://angularjs.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/)
- [Jest Testing Framework](https://jestjs.io/)
- [Playwright Testing](https://playwright.dev/)

---

**Happy Gaming! Gotta Catch 'Em All! 🎮✨**