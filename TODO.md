TODO


BIG ITEMS, as of Dec 25th 2024
- Perf improvements
  - Make db calls *actually* async. So instead of awaiting every call, effectively making things synchronous, treat the calls as promises and only await when needed. Let them run in the background otherwise
  - batch calls as much as possible
    - for example, if simulating more than one game, batch the calls instead of calling to the DB for every call
    - might need local storage for this if the objects are too big for memory
  - local storage cache layer?
    - look into places where we write to the DB, and maybe we can cache instead.
    - But also look into places where we read from the DB. Maybe we can cache frequent reads.
- front end
  - well, develop more of the frontend to create a usable game
- simulation logic
  - make it better. has problems right now


- get rid of browser/server option






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
- [bug/improvement] We're using `stores` all wrong. Learn how to use it correctly and fix.
- [improvement] seasonId is brittle. In some places we expect season start year, other places season ID.
  - idea: change id to be `${start_year}-${season_type}` eg: `2024-regular_season`.
- [improvement] Performance
  - dogshit browser perf. Idk if I've done something wrong, but sqlite-wasm is ~1000x slower than sqlite in node.
  - good news is the code is dogshit perf wise anyways, so lots of room for improvement.
  - specific problems:
    - fetching schedule from DB every time instead of storing in mem
    - lots of unbatched queries (teams, players, results)
- [improvement] Look into standardizing imports (use sveltekit alias for all imports?)


Bugs:
- Standings should not only sort by win-percentage, as they do now, but use games played as a tie-breaker. Currently, a team with a record of 2-0 might be above a team with a record of 3-0.

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
