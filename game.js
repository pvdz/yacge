
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
 * The html state of a single board
 *
 * @typedef Lhtml {Object}
 * @property {Element} root
 * @property {Element[]} cells First element of cells is h1, last element is a8, going 1-8 then a-h
 * @property {Element} castleQueensideWhite
 * @property {Element} castleKingsideWhite
 * @property {Element} castleQueensideBlack
 * @property {Element} castleKingsideBlack
 * @property {Element} enpassant
 * @property {Element} turns
 * @property {Element} turn50
 * @property {Element} three
 * @property {Element} spanWhite
 * @property {Element} spanBlack
 * @property {Element} movePlayer
 * @property {Element} moves
 * @property {Element} pgnInput
 * @property {Element} fenInput
 * @property {Element} fenCurrent
 * @property {Element} turnWhite
 * @property {Element} turnBlack
 */

/**
 * The state data for one board and everything around it.
 *
 * @typedef LocalState {Object}
 * @property {Game} G The implicit game state for this board
 * @property {Lhtml} html
 * @property {'' | 'none' | 'filled' | 'white' | 'black' | 'pawns' | 'kings' | 'queens' | 'knights' | 'bishops' | 'rooks' | 'can_move' | 'is_checked_white' | 'is_checked_black' } currentOverlay (Overrides the global value)
 * @property {Map<string, Element>} arrowMap
 * @property {BigInt} currentCell_i Current selection cell index
 * @property {BigInt} currentCell_n Current selection cell bit
 * @property {BigInt} currentTarget_i Only for debugging. Will ignore any other cell when doing attack checks etc.
 * @property {'none' | 'strict'} validationMode
 * @property {number} reflectTimer
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

/**
 * (This will later allow us to spawn multiple boards, but for now it's sort of global)
 *
 * @type {LocalState}
 */
const L = createBoard();

createMenu(L);

initPgn(L, L.html.pgnInput.value);
//reflect(L.G);
