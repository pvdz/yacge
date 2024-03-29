import {FEN_NEW_GAME, parseFen} from './parser.js';
import {preComputeHistoryStep, reflectHistory} from './history.js';

/**
 * @typedef {Object} Ply
 * @property {'ply'} type
 * @property {string} sub
 * @property {boolean} forWhite
 * @property {string} fromRank
 * @property {string} fromFile
 * @property {'' | 'R' | 'N' | 'B' | 'Q' | 'K'} promote
 * @property {'R' | 'N' | 'B' | 'Q' | 'K'} piece
 * @property {boolean} capture
 * @property {boolean} checked
 * @property {boolean} mated
 * @property {string} wtf
 * @property {string} raw The input for this ply
 * @property {BigInt} [fromi] Only after preComputeHistoryStep is called on it. The index (0..63) of the cell
 * @property {BigInt} [fromn] Only after preComputeHistoryStep is called on it. Bigint with the bit set that represents the cell.
 * @property {string} to The destination cell (string id) which is explicitly part of the ply
 * @property {BigInt} [toi] Only after preComputeHistoryStep is called on it. The index (0..63) of the cell
 * @property {BigInt} [ton] Only after preComputeHistoryStep is called on it. Bigint with the bit set that represents the cell.
 * @property {string|undefined} [fromResolved] Only after preComputeHistoryStep, this should hold the "from" cell id (string) for this ply. It is a computed value.
 * @property {Game} [beforeState] Only set after calling preloadPgn with the includeBeforeGameState option set. Represents the state of the game before making this move.
 */

/**
 * @typedef PgnMove {Object}
 * @property {number} turn
 * @property {Ply} white
 * @property {Ply} black
 * @property {type: 'end', value: string} end
 */

/**
 * @typedef PgnGame {Object}
 * @property {PgnMove[]} moves
 * @property {string[]} [fenCache] Only available after loadPgn. Maps the half-turn number (each move from each player counts
 *    as one half turn) to the FEN representing the board _after_ making this move. To get the "before" state you must load
 *    the previous move. Note: halfTurn offsets at 1 because 0 is the (constant) starting board state so the FEN of the board
 *    after white's first move will be in key 1.
 * @property {Game} [preloadPgn] Only set after calling preloadPgn with the includeBeforeGameState option set. Represents the state of the game at the end of the game.
 */

/**
 * @param str {string}
 * @returns {PgnGame}
 **/
function parsePgn(str) {
  // Note: this returns a game where source cell for each ply, the AN (algebraic notation) move, has not yet been resolved

  /*
  Okay so, I think we can ignore every line that starts with a `[`, then trim each line
  and concat them, which should yield a series of moves. Those moves will have to be parsed.

  ```
  [Event "Live Chess - chess"]
  [Site "Chess.com"]
  [Date "2023.12.19"]
  [Round "?"]
  [White "Mikelenders"]
  [Black "kuvos"]
  [Result "0-1"]
  [TimeControl "600"]
  [WhiteElo "836"]
  [BlackElo "835"]
  [Termination "kuvos won by resignation"]

  1. d4 Nf6 2. c4 Nc6 3. e3 d5 4. Nc3 dxc4 5. Bxc4 e6 6. e4 Nxd4 7. e5 Ng4 8. Qxg4
  Nc2+ 9. Ke2 Nxa1 10. Ne4 Nc2 11. Bg5 Be7 12. Nf6+ gxf6 13. Bxf6 Bxf6 14. exf6
  Qxf6 15. Bb5+ c6 16. Ba4 e5 17. Qe4 Bf5 18. Qc4 O-O-O 19. Bxc2 Bxc2 20. Qxc2 Qg6
  21. Qxg6 hxg6 22. Nf3 f6 23. h4 g5 24. g3 e4 25. Nd2 f5 26. Nc4 b5 27. Ne5 Rd5
  28. Nxc6 Kb7 29. Nb4 Rc5 30. Ke3 gxh4 31. gxh4 a5 32. Kd4 Kb6 33. Nd5+ Kc6 34.
  Ne7+ Kd6 35. Nxf5+ Rxf5 36. Kxe4 Rxf2 37. h5 Rxb2 38. a3 Ra2 39. Rh3 b4 40. axb4
  axb4 41. Kd3 Ra5 42. h6 Ra3+ 43. Kc2 Rxh3 0-1
  ```

  The piece abbreviation:
    K for king
    Q for queen
    R for rook
    B for bishop
    N for knight (K is already used for the king, so N is used instead)
    No abbreviation for pawns (their moves are usually notated by the destination square alone)
  The source square:
    If necessary, the appropriate row and/or column (or both) follows the piece abbreviation, like r2c4 means the rook on rank 2 moved to c4
    whereas rec4 means the rook on file e moved to c4. In extreme (contrived?) cases, both are necessary to disambiguate properly.
  The destination square:
    Each square on the board has a unique alphanumeric coordinate ranging from a1 to h8 (from left to right and bottom to top)
    The destination square is denoted after the piece abbreviation
  Capture indication:
    If a piece captures another piece, an "x" is placed before the destination square
  Check indication:
    "+" or "#" is appended to the move if it results in a check or checkmate, respectively
  Promotion indication:
    If a pawn reaches the eighth rank and promotes to a different piece, the piece abbreviation of the promoted piece is added after the destination square, separated by "="
  Castling notation:
    Kingside castling is indicated by "O-O" (one capital O for each king move)
    Queenside castling is indicated by "O-O-O" (three capital O's for each king move)

  Some examples of moves in Standard Algebraic Notation:
    e4 (pawn to e4)
    Nf3 (knight to f3)
    Bxe5 (bishop captures e5)
    Qd2+ (queen moves to d2 and gives check)
    c8=Q# (pawn promotes to queen, giving checkmate)
    O-O (kingside castling)
    O-O-O (queenside castling)

   */

  // Get the actual list of moves, which is arbitrarily broken across multiple lines (ugh?). Create a single line for the move list.
  // We remove comments, alternative lines, NAG / glyps
  const movestr =
    str
    // Remove line comments (semi-colon until EOL)
    .replace(/;.*?(\n|$)/g, '')
    // Remove "escape hatch", lines that start with %
    .replace(/^%.*\n/gm, '')
    // Remove inline comments
    .replace(/{.*?}/g, '')
    // Remove meta data, lines starting with `[`
    .replace(/^\[.*?(\n|$)/gm, '')
    // Remove newlines
    .replace(/\n/g, ' ')
    // Remove alternative game lines
    .replace(/\(.*?\)/g, '')
    // "Numeric Annotation Glyph", or "NAG"
    // https://en.wikipedia.org/wiki/Numeric_Annotation_Glyphs
    // Should be followed by a bunch of numbers. Not relevant to this tool. Currently.
    .replace(/\$\d+/g, '')
    // Fold consecutive spaces
    .replace(/ +/g, ' ')
    // Normalize move dots to be followed by a space
    .replace(/(\d+)\. */g, '$1. ')
  //console.log(movestr);

  // Break the move list into individual turns. Note that a move in PGN may have more parts than just a ply for each, like a NAG
  const moveStrings = movestr.match(/\d+\.+.+?(?=\d+\.+)|\d+\.+.+/g);
  //console.log(moveStrings);

  // The moves are very "incremental", meaning they don't statically state the "from" and "to" cell, but rather imply this based on the
  // board state of that point in the match. For example, a move may be "d4", meaning (ambiguously) a pawn moved from d2 or d3 to d4.
  // The only way to disambiguate the notation is to actually play the game out and for each move, figure out what the "from" must be. :'(
  const movePlies = moveStrings.map((mvstr) => {
    let whitePly;
    let blackPly;
    let end;
    const [moveNumber, ...parts] = mvstr.trim().split(/ +/g);
    parts.forEach((part) => {
      const r = parsePgnPly(part.trim(), !whitePly);
      if (r.type === 'ply') {
        if (!whitePly && !moveNumber.trim().endsWith('...')) {
          whitePly = r;
        } else if (!blackPly) {
          blackPly = r;
        } else {
          throw 'ply for black and white?';
        }
      } else if (r.type === 'end') {
        end = r;
        return true;
      }
      return false;
    });
    //console.log('turn', moveNumber.trim(), ':', whitePly, blackPly);
    return {turn: moveNumber, moven: parseInt(moveNumber, 10), white: whitePly, black: blackPly, end}
  });

  // It is possible that the plies of a move get split up, leading to one move appearing twice:
  // `30. Qxc7 (30. Qxd3 Rxd3 31. Rxc7 Rxa3 32. Rxe7 a5) 30... Qd1#`
  // -> `30. Qxc7 30... Qd1#`
  // The alternative path between parens will be scrubbed but it leaves `30.` and `30...` to deal with now. So that's what we do here.
  // We are going to assume that it's a full game.

  /**
   * @type {PgnMove[]}
   */
  const moves = [];
  /**
   *
   * @type {PgnGame}
   */
  const pgnGame = {moves};

  movePlies.forEach(move => {
    const moveIndex = move.moven - 1;
    //console.log('move:', move.turn, moveIndex)
    if (move.turn.endsWith('...')) {
      //console.log('has dots', move)
      // This is a move where the white ply is missing. Most likely it appeared earlier in the move list.
      if (moves[moveIndex]) {
        //console.log('known, adding', move.black)
        moves[moveIndex].black = move.black;
        if (move.end) moves[moveIndex].end = move.end; // There should only be one of these, regardless
      } else {
        //console.log('not known')
        moves[moveIndex] = move;
      }
    } else {
      if (moves[moveIndex]) {
        if (move.white) moves[moveIndex].white = move.white;
        if (move.black) moves[moveIndex].white = move.black;
        if (move.end) moves[moveIndex].end = move.end; // There should only be one of these, regardless
      } else {
        moves[moveIndex] = move;
      }
    }
  });

  //console.log('pgnGame:', pgnGame)
  return pgnGame;
}

/**
 * @param part {string}
 * @param forWhite {boolean}
 * @returns {{type: 'invalid', value: string} | {type: 'comment', value: string} | {type: 'end', value: string} | Ply}
 */
export function parsePgnPly(part, forWhite) {
  // Anatomy of a move: <piece> [source file][source rank] [x] <dest cell> [=rnbqRNBQ] [+#]

  if (!part) {
    return { type: 'invalid', value: part };
  }

  if ([
    '1-0', // White won
    '0-1', // Black won
    '1/2-1/2', // Draw
    '½-½', // Fancy draw
    '*', // Unfinished game
    '0-0', // Forfeit
    '1/2-0', // Forfeit white
    '0-1/2', // Forfeit black
    '½-0', // Fancy forfeit white
    '0-½', // Fancy forfeit black
    '+/-', // Black lost by default
    '-/+', // White lost by default
    '-/-', // Draw by default?
  ].includes(part)) {
    return { type: 'end', value: part };
  }

  if (part === 'e.p.') {
    // En passant marker, redundant
    return { type: 'comment', value: part };
  }

  // A "ply" is a half-move, or the move taken by one of the players. Each `part` has one or two plies and some optional metadata.
  const ply = part;

  // You can castle into a check so we must try to consume this first
  const checked = part[part.length - 1] === '+';
  if (checked) part = part.slice(0, -1);

  // You can castle into a mate so we must try to consume this first
  const mated = part[part.length - 1] === '#';
  if (mated) part = part.slice(0, -1);

  // Not sure if you should expect this in pasted PGNs but let's support ! ? !! !? ?! and ??
  const wtf = String({'!!': '!!', '??':'??', '?!':'?!', '!?':'!?'}[part.slice(-2)] ?? {'!':'!','?':'?'}[part[part.length - 1]] ?? '') ?? '';
  if (wtf) part = part.slice(0, wtf.length);

  if (part === 'O-O' || part === '0-0') {
    // castle king side
    return { type: 'ply', sub: 'castle', forWhite, fromFile: 'e', fromRank: forWhite ? '1' : '8', to: forWhite ? 'g1' : 'g8', promote: '', capture: false, piece: 'K', checked, mated, wtf, raw: ply };
  }

  if (part === 'O-O-O' || part === '0-0-0') {
    // castle queen side
    //console.log('okay, castling queen side for', forWhite,'... fromFile: e, fromRank:', forWhite ? '1' : '8', 'to:', forWhite ? 'c1' : 'c8')
    return { type: 'ply', sub: 'castle', forWhite, fromFile: 'e', fromRank: forWhite ? '1' : '8', to: forWhite ? 'c1' : 'c8', promote: '', capture: false, piece: 'K', checked, mated, wtf, raw: ply };
  }

  // According to wikipedia, promotions may be annotated in different ways too, e8Q, e8=Q, e8(Q), e8/Q    :(
  // We could at least cover the case of forward slash and trailing piece, I think?
  let promote = '';
  if ('RNBQK'.includes(part[part.length - 1])) {
    // pawn promotion
    if (part[part.length -2] === '=' || part[part.length -2] === '/') {
      promote = part[part.length - 1];
      part = part.slice(0, -2);
    } else {
      // If, from right to left, we encounter the piece before the dest cell, then it's (probably?) a promotion
      promote = part[part.length - 1];
      part = part.slice(0, -1);
    }
  }

  // Now the last-most two characters must be the target cell
  const target = part.slice(-2).toLowerCase();
  part = part.slice(0, -2);

  // Note: wikipedia says colon and multiplication are also used but we're going to ignore that for now because their position is unsure: https://en.wikipedia.org/wiki/Algebraic_notation_(chess)
  const capture = part[part.length - 1] === 'x';
  if (capture) part = part.slice(0, -1);

  // The right-most part may now be the source cell indicator, or half of it
  let sourceRank = ''; // row
  let sourceFile = ''; // column
  if (part[part.length - 1] >= '1' && part[part.length - 1] <= '8') {
    sourceRank = part[part.length - 1];
    part = part.slice(0, -1);
  }
  if (part[part.length - 1] >= 'a' && part[part.length - 1] <= 'h') {
    sourceFile = part[part.length - 1];
    part = part.slice(0, -1);
  }

  // The only thing that may now remain is the piece being moved. Pawn (P) is unusual but we should allow it because why not.
  const piece = String('PRNBQK'.includes(part[part.length - 1]) ? part[part.length - 1] : 'P');
  if (piece !== 'P') part = part.slice(0, -1);

  const r = {type: 'ply', sub: 'none', forWhite, fromRank: sourceRank, fromFile: sourceFile, to: target, promote, capture, piece, checked, mated, wtf, raw: ply };

  if (part) {
    console.log('oeps, from the original move', [ply], 'we were unable to consume part of it:', [part], r);
  }

  return r;
}

/**
 * Parses a PGN and pre-computes the game, resolving the source cell for every move.
 *
 * @param {string} str
 * @param {boolean} [includeBeforeGameState] Include a copy of the Game state _prior_ to making the move...
 * @param {boolean} [debug]
 * @param {string} [offsetBoardFen]
 * @returns {History}
 */
export function preloadPgn(str, {includeBeforeGameState = false, debug = false, offsetBoardFen = FEN_NEW_GAME}) {
  const pgnGame = parsePgn(str);
  pgnGame.fenCache = [offsetBoardFen];

  // Create fresh starting game.
  const G = parseFen(offsetBoardFen);

  /**
   * @type {History}
   */
  const history = {
    end: '*',
    index: 0,
    moves: [
      {
        turn: 0,
        fen: offsetBoardFen,
        white: false,
        piece: '',
        from: '',
        to: '',
        an: '',
        ...(includeBeforeGameState ? {beforeState: {...G}}: {}),
      },
    ],
  };

  // Replay the entire game, cache a FEN string after each step of the way.
  // This way we can revive a fresh board state based on these FENs.
  // This will also compute the "from" cell for every move, which we must be determined from the "current" game state...
  for (let i=0; i<pgnGame.moves.length; ++i) {
    const move = pgnGame.moves[i];
    const before = includeBeforeGameState && {...G};
    if (move.white) {
      const step = preComputeHistoryStep(G, pgnGame, move.white, i * 2 + 1, i+1, debug);
      if (before) step.beforeState = before;
      history.moves.push(step);
    }
    if (move.black) {
      const step = preComputeHistoryStep(G, pgnGame, move.black, i * 2 + 2, i+1, debug);
      if (before) step.beforeState = before;
      history.moves.push(step);
    }
    if (move.end) {
      history.end = move.end.value || '*';
      if (before) history.finalState = before;
    }
  }

  return history;
}

/**
 * @param {LocalState} L
 * @param {string} str
 * @param {boolean} [debug]
 */
export function loadPgnAndReflect(L, str, debug = false) {
  L.history = preloadPgn(str, {debug});
  reflectHistory(L);
}
