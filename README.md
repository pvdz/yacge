# Yacge (Yet Another Chess Game Engine)

This is a relatively full blown web interface for chess games.

It started out as a simple tool to validate my chess engine as I was writing the rules, but kind then feature creep made me add more features and all the things I'd probably want to see.

It's not finished. It will probably never be finished. It's mostly here to serve my needs while trying to teach a computer how to play chess. Don't expect much from that but it is what it is.

(_I have no real name for this app and Yace was already taken so I just went with Yacge instead)

# Features

- Chess board with draggable pieces. Touch supported too. Allowing you to play a local game of regular chess
- Supports all the rules of chess
  - Regular piece moves, en passant, castling, promotion, 50 half-move rule, threefold repeat rule
  - Note: promotion target has to be picked from debug menu before moving the pawn, sorry. Most of the time you want queen, anyways :)
- Material and material-based scoring
- Right-mouse button arrows and cell selection
- Load a FEN, auto generate FEN from current board state
- Import a PGN
- Back/forward and play a set of moves like a movie
  - Individual moves can be clicked to for quick navs back and forth
- Debug section
  - Disable enforcement of chess rules when making moves
  - Display various internal layer states
  - Show cell ID's and (internal) index
  - Option to show all valid-but-blocked moves rather than just valid moves
    - (This will also show these blocked moves when you're checked or pinned)

# Installation

Eh. None :)

What you see is what you get. No dependencies, no installation or anything. Just drag chess.html into a browser tab and it should just work.

Alternatively you could fire up a local webserver and serve it that way, it doesn't really matter tbh.

# How

Aside from vanilla web tech and zero dependencies (at the time of writing), the chess engine uses "bitboards", ht https://www.chessprogramming.org/Bitboards for inspiration.

The core representation is a set of 8 "layers": a mask for both players and one for each of the six piece types.

Putting these layers on top of each other, as bit masks, you can get a mask of pieces of that color.

There is no other internal representation of the board for the sake of rule validation or evaluation.

This means, for example, that material evaluation involves walking each of the 64 cells and bit testing whether the cell is filled, and if so, which of the pieces is occupying it and then which color. It's a bit expensive but since it's capped at 64 cells it's not so bad.

On the other side, things like knight checks are super simple: `White & VALID_KNIGHT_MOVES[x]`. This tells you whether white can cover/attack cell x and even where these knights are.

I'm aware that there's more efficient ways to do the "ray scans" for bishops, rooks, and queens using bitboards. I currently haven't invested too much time into that since the worst case number of cells is 25 for a queen or 14 for a rook / bishop. And the amortized count is far lower than that. While interesting, it was not the kind problem I wanted to solve here :)

Let's face it; If you want efficiency, you're probably not going to be eyeing a vanilla JS implementation anyways (when there's plenty of wasm engines out there that did already hammer out perf).

# Why

I wanted to train a computer to play chess.

In order to validate rules I had to write a move validtor, which is basically a chess engine. And so I did.

In order to validate my rules I wrote a simple web UI to confirm (rather than write tests, feh).

And this ultimately is what became of it.

For the ultimate "why", the answer is much simpler: cause I wanted to :) It's fun!

# TODO

- Evaluation (a tentative score based on a pseudo/legit moves heuristic)
  - I'd really love to create a graph based on this like you get from chess.com and so I do expect to add this later
- Support alternate paths so you can jump back to a loaded pgn game while exploring alternative lines
- Add [stockfish](https://github.com/nmrugg/stockfish.js) to [it](https://github.com/bjedrzejewski/stockfish-js)? Or some other established open source engine, to play moves and what not.
- Show names when playing back PGN? Maybe more meta data.
- Support and show certain markers like `?!` etc.
- Mini mode, where board is not maximized and menu's are minimal such that we can more efficiently put multiple boards on the same page
  - Will probably add this once I get to that stage in the neural network training, where it becomes relevant :)
- Fast(er) mode, which disables certain controls (like FEN generation etc) to reduce overhead only used for the sake of interaction

# TOFIX

- Looks like I created arrows at a fixed width, even though the board scales with available window space. Oops
- PGN import hasn't been thoroughly tested. Probably needs a fix or two to be more generic.
- Is castling state tracking broken when playing back PGN? In general? Or just a visual glitch?
- When scrolled the drag is broken (ugh). Needs scroll offset adjustment I think.

# Future

Eh, don't expect much and you won't be disappointed :)

This was just a hobby thing that serves as a foundation of another project.
