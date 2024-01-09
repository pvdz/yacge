// This FEN represents the start of any game
const FEN_NEW_GAME = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const FEN_EMPTY_GAME = '8/8/8/8/8/8/8/8 w KQkq - 0 1';

/**
 * @param fen {string}
 * @returns {Game}
 */
function parseFen(fen) {
  // FEN
  // r4rk1/ppb2ppp/2p5/8/4B3/3QP3/PPP2PPq/R4RK1 w kQ e5 25 60
  //
  // | r4rk1/ppb2ppp/2p5/8/4B3/3QP3/PPP2PPq/R4RK1 |   w  |  kqKQ  |    e5     |    25   |   60
  // |--------------------------------------------|------|--------|--------------------|---------
  // | board                                      | turn | castle | enpassant | 50turn | turns
  //
  // - from white's point of view, the FEN fills the board from top-left (A8) to right (H8) to bottom (A1 - H1)
  // - str.split(' ') -> [board, turn, castling, en passant square, 50 turn counter, total full moves]
  // - lower case is black, upper case is white
  // - castling is qkQK or - if no castling is possible
  // - board to split by `/`, starting at a1 to a8, each row is entirely filled (empty cells padded)
  // - numbers represent that many consecutive empty cells

  const [board = '', turn = '', castling = '', enPassant = '', halfTurnsSince = '', fullTurns = ''] = fen.trim().replace(/\s+/g, ' ').split(' ');

  const currentTurn = turn === 'w' ? 'white' : 'black';
  const canCastleBlackKingside = castling.includes('k');
  const canCastleBlackQueenside = castling.includes('q');
  const canCastleWhiteKingside = castling.includes('K');
  const canCastleWhiteQueenside = castling.includes('Q');
  const enPassantAt = enPassant === '-' ? NO_CELL_I : (idToIndex[String(enPassant).trim().replace(/ /g, '').toLowerCase()] ?? NO_CELL_I);
  const turn50limit = parseInt(halfTurnsSince, 10);
  const currentTurnCounter = parseInt(fullTurns, 10);

  let black = 0n;
  let white = 0n;
  let rooks = 0n;
  let bishops = 0n;
  let knights = 0n;
  let queens = 0n;
  let kings = 0n;
  let pawns = 0n;

  let li = 0n;
  for (const line of board.split('/').reverse()) {
    let ci = li * 8n;
    li += 1n;
    for (const c of line.split('').reverse()) {
      const bit = 1n << ci;
      switch (c) {
        case '0': break; // fail?
        case '1': break;
        case '2': ci += 1n; break;
        case '3': ci += 2n; break;
        case '4': ci += 3n; break;
        case '5': ci += 4n; break;
        case '6': ci += 5n; break;
        case '7': ci += 6n; break;
        case '8': ci += 7n; break; // redundant
        case 'k': {
          black |= bit;
          kings |= bit;
          break;
        }
        case 'K': {
          white |= bit;
          kings |= bit;
          break;
        }
        case 'q': {
          black |= bit;
          queens |= bit;
          break;
        }
        case 'Q': {
          white |= bit;
          queens |= bit;
          break;
        }
        case 'r': {
          black |= bit;
          rooks |= bit;
          break;
        }
        case 'R': {
          white |= bit;
          rooks |= bit;
          break;
        }
        case 'b': {
          black |= bit;
          bishops |= bit;
          break;
        }
        case 'B': {
          white |= bit;
          bishops |= bit;
          break;
        }
        case 'n': {
          black |= bit;
          knights |= bit;
          break;
        }
        case 'N': {
          white |= bit;
          knights |= bit;
          break;
        }
        case 'p': {
          black |= bit;
          pawns |= bit;
          break;
        }
        case 'P': {
          white |= bit;
          pawns |= bit;
          break;
        }
      }
      ci += 1n;
    }
  }

  return {
    turnWhite: currentTurn === 'white',
    castleKingsideWhite: canCastleWhiteKingside,
    castleQueensideWhite: canCastleWhiteQueenside,
    castleKingsideBlack: canCastleBlackKingside,
    castleQueensideBlack: canCastleBlackQueenside,
    enpassant: enPassantAt,
    fiftyTurnCounter: turn50limit,
    fullTurnCounter: currentTurnCounter,
    promotionDefault: 'queen',
    black,
    white,
    rooks,
    bishops,
    knights,
    queens,
    kings,
    pawns,
    threefold: new Map,
  };
}

if (typeof module !== 'undefined' && module?.exports !== undefined) {
  module.exports.parseFen = parseFen;
  module.exports.FEN_NEW_GAME = FEN_NEW_GAME;
}
