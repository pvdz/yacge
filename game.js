
/**
 * Keep object flat (!)
 *
 * @typedef {Object} Game
 * @property {boolean} turnWhite (Otherwise it's black, of course)
 * @property {boolean} castleKingsideWhite
 * @property {boolean} castleQueensideWhite
 * @property {boolean} castleKingsideBlack
 * @property {boolean} castleQueensideBlack
 * @property {BigInt} enpassant (The cell i containing a pawn that made a two cell advance in the previous turn, or NO_CELL_I. Shared by both sides since it's only relevant for the immediate next move of the opponent.)
 * @property {number} fiftyTurnCounter Half-turns (a full turn is a move by both players) since the last capture or pawn-move. At 50 the game ends in a draw. Offset 0. Increments after each player.
 * @property {number} wholeTurnCounter Full-turns (the current nth move for each player). Offset 1. Increments after each black move.
 * @property {'' | 'queen' | 'rook' | 'knight' | 'bishop'} promotionDefault
 * @property {BigInt} [prevFrom]
 * @property {BigInt} [prevTo]
 * @property {BigInt} white
 * @property {BigInt} black
 * @property {BigInt} rooks
 * @property {BigInt} bishops
 * @property {BigInt} knights
 * @property {BigInt} queens
 * @property {BigInt} kings
 * @property {BigInt} pawns
 * @property {Map<string, number>} threefold This one should only be updated when making a real move...
 */

const black = BigInt('0b'+[
  1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
].join(''));

const white = BigInt('0b'+[
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1,
].join(''));

const rooks = BigInt('0b'+[
  1, 0, 0, 0, 0, 0, 0, 1,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  1, 0, 0, 0, 0, 0, 0, 1,
].join(''));

const bishops = BigInt('0b'+[
  0, 0, 1, 0, 0, 1, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 1, 0, 0, 1, 0, 0,
].join(''));

const knights = BigInt('0b'+[
  0, 1, 0, 0, 0, 0, 1, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 1, 0, 0, 0, 0, 1, 0,
].join(''));

const queens = BigInt('0b'+[
  0, 0, 0, 1, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 1, 0, 0, 0, 0,
].join(''));

const kings = BigInt('0b'+[
  0, 0, 0, 0, 1, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 1, 0, 0, 0,
].join(''));

const pawns = BigInt('0b'+[
  0, 0, 0, 0, 0, 0, 0, 0,
  1, 1, 1, 1, 1, 1, 1, 1,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  1, 1, 1, 1, 1, 1, 1, 1,
  0, 0, 0, 0, 0, 0, 0, 0,
].join(''));

/**
 * Note: this is global UI state and will be overwritten by the state that is passed on to reflect() (and realReflect())
 * @type {Game}
 */
let H = {
  turnWhite: true,
  castleKingsideWhite: true,
  castleQueensideWhite: true,
  castleKingsideBlack: true,
  castleQueensideBlack: true,
  enpassant: NO_CELL_I,
  fiftyTurnCounter: 0,
  wholeTurnCounter: 1,
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
