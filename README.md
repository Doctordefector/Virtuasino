# Virtuasino - Virtual Casino Games

A simplified casino gaming platform inspired by Stake.com, featuring popular games with virtual currency. Built with vanilla JavaScript and modern HTML5/CSS3.

## Features

- **Four Classic Games:**
  - Dice (Stake-style with roll under/over)
  - Plinko (customizable rows and risk levels)
  - Crash (with classic multiplier curve)
  - Mines (3x3 and 5x5 grids)

- **Virtual Currency System:**
  - Start with 10,000 Virtual Credits
  - Local storage for balance persistence
  - Reset balance option

- **Modern UI/UX:**
  - Dark theme with green/red accents
  - Responsive design for all devices
  - Smooth animations and transitions
  - Game history tracking

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/virtuasino.git
cd virtuasino
```

2. Open the project:
- Simply open `index.html` in a modern web browser
- Or serve it using a local development server:
  ```bash
  python -m http.server 8000
  # or
  npx serve
  ```

## Usage

### Dice Game
- Choose your bet amount
- Set your target number
- Click "Roll Under" or "Roll Over"
- Win if the roll matches your prediction

### Plinko Game
- Select number of rows (8-16)
- Choose risk level (low/medium/high)
- Place your bet and drop the ball
- Watch it bounce to your multiplier

### Crash Game
- Enter bet amount
- Set auto-cashout multiplier (optional)
- Place bet and watch the multiplier climb
- Cashout before it crashes

### Mines Game
- Select grid size (3x3 or 5x5)
- Choose number of mines
- Click tiles to reveal them
- Cashout or continue for higher multipliers

## Technical Details

- **No Dependencies:** Pure JavaScript/HTML/CSS
- **Client-side Only:** No server required
- **Local Storage:** Game progress saved in browser
- **Responsive Design:** Works on all screen sizes
- **Modern Features:** CSS Grid, Flexbox, Canvas API

## Security

- Cryptographically secure random number generation
- No real money transactions
- All processing done client-side
- No external API calls

## Disclaimer

This is a virtual casino for entertainment purposes only. No real money or cryptocurrency is involved. The games are designed to demonstrate front-end development skills and should not be used for gambling. 