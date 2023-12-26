# Yacge (Yet Another Chess Game Engine)

This is a relatively full blown web interface for chess games.

It started out as a simple tool to validate my chess engine as I was writing the rules, but kind then feature creep made me add more features and all the things I'd probably want to see.

It's not finished. It will probably never be finished. It's mostly here to serve my needs while trying to teach a computer to play chess. Don't expect much from that but it is what it is.

(_I have no real name for this app and Yace was already taken so I just went with Yacge instead)

# Features

- Chess board with draggable pieces. Touchscreen too (mostly). Allowing you to play a local game of regular chess
- Supports all the rules of chess
  - Regular piece moves, en passant, castling, promotion, 50 half-move rule, threefold repeat rule
  - Note: promotion target has to be picked from debug menu before moving the pawn, sorry. Most of the time you want queen, anyways :)
- Material and material-based scoring
- Right-mouse button arrows and cell selection
- Load a FEN, auto generate FEN from current board state
- Load a PGN
  - Back/forward, play, like a movie
  - Individual moves can be clicked to for quick jumps
- Debug section
  - Disable enforcement of chess rules when making moves
  - Display various internal layer states
  - Show cell ID's and (internal) index
  - Option to show all valid-but-blocked moves rather than just valid moves
    - (This will also show these blocked moves when you're checked or pinned)

# Installation

Eh. None :)

What you see is what you get. No dependencies, no installation or anything. Just drag chess.html into a browser page and it should just work.

Alternatively you could fire up a local webserver and serve it that way, it doesn't really matter tbh.

# Why

I wanted to train a computer to play chess.

In order to validate rules I had to write a move validtor, which is basically a chess engine. And so I did.

In order to validate my rules I wrote a simple web UI to confirm (rather than write tests, feh).

And this ultimately is what became of it.

For the ultimate "why", the answer is much simpler: cause I wanted to :) It's fun!

# TODO

- Evaluation (a tentative score based on a pseudo/legit moves heuristic)
  - I'd really love to create a graph based on this like you get from chess.com
- Properly record moves made into a move list, it's currently only built to support playback of PGN games, which feels kind of backwards now
  - This includes the ability to create an alternative move while in the middle of some game and creating and recording an alternative line
- Properly abstract the code so you can have multiple boards in the same page
  - (The point of this is to support a neural network learning the game and I want to show it play multiple games at once)
- Add stockfish to it? Or some other established open source engine, to play moves and what not.
- Flip board (black down)
- Show names when playing back PGN? Maybe more meta data.
- Support and show certain markers like `?!` etc.

# TOFIX

- Looks like I created arrows at a fixed width, even though the board scales with available window space. Oops
- PGN import hasn't been thoroughly tested. Probably needs a fix or two to be more generic.
- Touch drag of pieces needs to cancel event, currently not useful
- Is castling state tracking broken when playing back PGN? In general? Or just a visual glitch?

# Future

Eh, don't expect much and you won't be disappointed :)

This was just a hobby thing that serves as a foundation of another project.

