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
- Support multiple leagues instead of hardcoding league id
- Look into importing more (use sveltekit alias for all imports?)
- seasonId is brittle. In some places we expect season start year, other places season ID.
  - idea: change id to be `${start_year}-${season_type}` eg: `2024-regular_season`.
- Performance
  - dogshit browser perf. Idk if I've done something wrong, but sqlite-wasm is ~1000x slower than sqlite in node.
  - good news is the code is dogshit perf wise anyways, so lots of room for improvement.

later:
- We will probably have consistency issues with our DB the way things run right now.
  - Easiest option is to restrict to one active tab
- Balancing probabilities and outcomes
- Determine ranking distribution (eg: 60 is all-star, 70 is all-nba, 80 is MVP, 90 is goat, 100 is goat++)
- Function to calculate an overall ranking
- Function to create a team of players, given a target overall ranking (maybe a few other params)
- Function to calculate a team ranking
- create a view for sortable season averages (both players/teams)
- finish possession simulation
  - add logic for end of quarter / end of game possessions (how players decide to play it) 
  - add special logic for shotClock violations (optional)

QOL
- testing in general
