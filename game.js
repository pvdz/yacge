
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

/**
 * The state data for the whole web page
 *
 * @typedef GlobalState {Object}
 * @property {'none' | 'filled' | 'white' | 'black' | 'pawns' | 'kings' | 'queens' | 'knights' | 'bishops' | 'rooks' | 'can_move' | 'is_checked_white' | 'is_checked_black' } currentOverlay (Global default, local state can override this)
 * @property {'none' | 'select' | 'move'} autoArrowClear Maybe we can allow individual boards to override this but why
 */

/**
 * The state data for one board and everything around it.
 *
 * @typedef LocalState {Object}
 * @property {Game} G The implicit game state for this board
 * @property {Element[]} cellDivs First element is h1, last element is a8, going 1-8 then a-h
 * @property {'' | 'none' | 'filled' | 'white' | 'black' | 'pawns' | 'kings' | 'queens' | 'knights' | 'bishops' | 'rooks' | 'can_move' | 'is_checked_white' | 'is_checked_black' } currentOverlay (Overrides the global value)
 * @property {Map<string, Element>} arrowMap
 * @property {BigInt} currentCell_i Current selection cell index
 * @property {BigInt} currentCell_n Current selection cell bit
 * @property {BigInt} currentTarget_i Only for debugging. Will ignore any other cell when doing attack checks etc.
 * @property {'none' | 'strict'} validationMode
 * @property {number} reflectTimer
 */

/**
 * Pointer related state. I like mouse state better :shrug:
 *
 * @typedef MouseState {Object}
 * @property {boolean} pointerDownStatus
 * @property {number} pointerDownX
 * @property {number} pointerDownY
 * @property {boolean} deselectCell Used to determine whether the cell should be deselected on pointerup
 * @property {BigInt} pointerDownCellI
 * @property {'lmb' | 'mmb' | 'rmb'} pointerDownButton
 * @property {BigInt} pointerOverCellI
 * @property {boolean} pointerDragging
 * @property {undefined|Element} currentDragIcon
 * @property {Element} currentArrow
 */


/**
 * @type {GlobalState}
 */
const S = {
  currentOverlay: 'can_move',
  autoArrowClear: 'select',
};

/**
 * (Global)
 * @type {MouseState}
 */
const M = {
  pointerDownStatus: false,
  pointerDownX: 0,
  pointerDownY: 0,
  pointerDownCellI: NO_CELL_I,
  pointerDownButton: 'lmb',
  pointerOverCellI: NO_CELL_I,
  currentArrow: undefined,
  pointerDragging: false,
  currentDragIcon: undefined,
  deselectCell: false,
};

createBoard();
createMenu();

/**
 * (This will later allow us to spawn multiple boards, but for now it's sort of global)
 *
 * @type {LocalState}
 */
const L = {
  G: parseFen(FEN_NEW_GAME),
  currentOverlay: '',
  cellDivs: [ // note: transposed. first element is the least significant bit (bottom right) is H1
    $h1, $g1, $f1, $e1, $d1, $c1, $b1, $a1,
    $h2, $g2, $f2, $e2, $d2, $c2, $b2, $a2,
    $h3, $g3, $f3, $e3, $d3, $c3, $b3, $a3,
    $h4, $g4, $f4, $e4, $d4, $c4, $b4, $a4,
    $h5, $g5, $f5, $e5, $d5, $c5, $b5, $a5,
    $h6, $g6, $f6, $e6, $d6, $c6, $b6, $a6,
    $h7, $g7, $f7, $e7, $d7, $c7, $b7, $a7,
    $h8, $g8, $f8, $e8, $d8, $c8, $b8, $a8,
  ],
  arrowMap: new Map,
  validationMode: 'strict',
  reflectTimer: 0,
  currentCell_i: NO_CELL_I,
  currentCell_n: NO_CELL,
  currentTarget_i: NO_CELL_I,


  // TODO next:
  // - history
  // - alt-lines?
};

//initPgn($pgn.value);
reflect(L.G);
