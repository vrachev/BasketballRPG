TODO


Ideas:
- Several game modes
  - Journey to "GOAT" (eg: first pick, lots of potential)
  - Role-player (eg: starting as a middling prospect)
  - How far can you get from undrafted?
- Archtypes
  - Can choose from a default - this gives you default skills
  - But can also form your own by selecting for specific skills
- Skill system
  - Some combination of having points to allocate - like many RPGs, and
    also some dice rolling. Notably, I want to introduce some skill into
    the dice rolling, by allowing you to eg: stack dice rolls, or to
    save dice rolls for different situations
- Season actions
  - players will accumulate action capital (think mana), which will enable them
    to take certain actions, or allocate to leveling up and increasing their skills.

High Level:
- Simulatation System
  - Game
  - Season
- Player Generation System
  - Dice Roll System
  - Skill System
- Command Line Interface
- GUI

Now:
- don't calculate game win/loss everywhere, use new variables in GameStat
- continue deduplicating/centralizing stat typing and calculations
  - all stats/adv stats should be caclulated in calculateGameStats.ts, then propogated out
  - 
- use relative imports everywhere, per guidelines (tsconfig paths = bad)
- update playerSeason table after a game
- create standings table
- update standings table after game
- create a view for sortable season averages (both players/teams)
- testing in general

later:
- Balancing probabilities and outcomes
- Determine ranking distribution (eg: 60 is all-star, 70 is all-nba, 80 is MVP, 90 is goat, 100 is goat++)
- Function to calculate an overall ranking
- Function to create a team of players, given a target overall ranking (maybe a few other params)
- Function to calculate a team ranking
- finish possession simulation
  - add logic for end of quarter / end of game possessions (how players decide to play it) 
  - add special logic for shotClock violations (optional)
