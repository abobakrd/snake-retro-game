# Retro Snake Game

[Play it now](https://demoapp-13866.web.app/)

### The classic snake game from pre-smartphone era! 

The reason i choose to not use a HTML canvas is because i wanted to learn more about how components work in a very dynamic way in React. 

### Features
- **Classic gamemode:** Snake as you know it - a new piece of food item shows up everytime you eat the current one. This mode does not have levels.
- **Modern gamemode:** a level based mode where you must eat all the food items. Eat all food items and level up. The higher the level, the more food items to eat and more bombs to watch out for.
- **Wallhack:** allows the snake to go through the wall and continue on the other side (inversion).
- **Scoring:** the game saves all the game sessions which includes metadata like time played, score and level. There is also a global leaderboard that updates when you hit a new personal score record or you beat another player's record score.
- **Login system:** In order take advantage of the saving system and recording your scores, you must log in. You can register with email or log in anonymously which is session based (you cannot login to same account if you clear browser cookies).

### Built with
- **Frontend:**
 - React
 - HTML
 - CSS
- **Backend:** Google Firebase
 - Auth Web SDK
 - Firestore Web SDK
 - Firebase Local Emulator suite for local development and testing.
 - Firebase CLI
- create-react-app