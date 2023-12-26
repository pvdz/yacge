/**
 * @type {Map<string, div>}
 */
const arrowMap = new Map; // <string, div>

const divs = [ // note: transposed. first element is the least significant bit (bottom right) is H1
  $h1, $g1, $f1, $e1, $d1, $c1, $b1, $a1,
  $h2, $g2, $f2, $e2, $d2, $c2, $b2, $a2,
  $h3, $g3, $f3, $e3, $d3, $c3, $b3, $a3,
  $h4, $g4, $f4, $e4, $d4, $c4, $b4, $a4,
  $h5, $g5, $f5, $e5, $d5, $c5, $b5, $a5,
  $h6, $g6, $f6, $e6, $d6, $c6, $b6, $a6,
  $h7, $g7, $f7, $e7, $d7, $c7, $b7, $a7,
  $h8, $g8, $f8, $e8, $d8, $c8, $b8, $a8,
];

/**
 * @type {'none' | 'filled' | 'white' | 'black' | 'pawns' | 'kings' | 'queens' | 'knights' | 'bishops' | 'rooks' | 'can_move' | 'is_checked_white' | 'is_checked_black' }
 */
let currentOverlay = 'none';
/**
 * @type {BigInt}
 */
let currentCell_i = NO_CELL_I;
let currentCell = currentCell_i === NO_CELL_I ? NO_CELL : (1n << currentCell_i);
let currentTarget_i = NO_CELL_I;
let deselectCell = false;
let pointerDown = false;
let pointerDownX = 0;
let pointerDownY = 0;
let pointerDownCellI = NO_CELL_I;
let pointerDownButton = '';
let pointerOverCellI = NO_CELL_I;
let currentArrow;
let pointerDragging = false;
let currentDragIcon;
let validationMode = 'strict'; // strict, none

let reflectTimer;
let lastReflectGame;

/**
 * @type {'none' | 'select' | 'opp' | 'move'}
 */
let autoArrowClear = 'select';

/**
 * @param G {Game}
 */
function reflect(G) {
  //console.log('reflect attempt...');
  // Debounce visual representation but store the state to show
  lastReflectGame = G;
  if (reflectTimer !== undefined) return;// console.log('debounced...');
  reflectTimer = setTimeout(() => realReflect(lastReflectGame), 100);
}

/**
 * @param G {Game}
 */
function realReflect(G) {
  clearTimeout(reflectTimer);
  reflectTimer = undefined;
  lastReflectGame = undefined;

  H = G;
  //console.log('reflecting...');
  console.time('reflected');
  let fenState = '';
  let fenRank = '';
  for (let i=0n; i<64n; ++i) {
    const n = 1n << i;
    const white = Boolean(G.white & n);
    const icon =
      (G.rooks & n)
      ? (white ? whiteRook : blackRook)
      : (G.bishops & n)
      ? (white ? whiteBishop : blackBishop)
      : (G.knights & n)
      ? (white ? whiteKnight : blackKnight)
      : (G.queens & n)
      ? (white ? whiteQueen : blackQueen)
      : (G.kings & n)
      ? (white ? whiteKing : blackKing)
      : (G.pawns & n)
      ? (white ? whitePawn : blackPawn)
      : '';

    divs[i].children[0].innerHTML = icon;
    if (i > 0 && i % 8n === 0n) {
      // Start of next rank after the first
      fenState = '/' + fenState;
    }
    fenState = (icon || ' ') + fenState;

    divs[i].children[0].className = G.white & n ? 'white' : 'black';
    if (i === G.prevFrom || i === G.prevTo) divs[i].classList.add('last');
    else divs[i].classList.remove('last');

    if (i === currentCell_i) divs[i].style.borderColor = 'blue';
    else switch (currentOverlay) {
      case "none": {
        divs[i].style.borderColor = 'transparent';
        break;
      }
      case "filled": {
        divs[i].style.borderColor = ((G.black | G.white) & n) ? 'orange' : 'transparent';
        break;
      }
      case "white": {
        divs[i].style.borderColor = (G.white & n) ? 'orange' : 'transparent';
        break;
      }
      case "black": {
        divs[i].style.borderColor = (G.black & n) ? 'orange' : 'transparent';
        break;
      }
      case "pawns": {
        divs[i].style.borderColor = (G.pawns & n) ? 'orange' : 'transparent';
        break;
      }
      case "kings": {
        divs[i].style.borderColor = (G.kings & n) ? 'orange' : 'transparent';
        break;
      }
      case "queens": {
        divs[i].style.borderColor = (G.queens & n) ? 'orange' : 'transparent';
        break;
      }
      case "knights": {
        divs[i].style.borderColor = (G.knights & n) ? 'orange' : 'transparent';
        break;
      }
      case "bishops": {
        divs[i].style.borderColor = (G.bishops & n) ? 'orange' : 'transparent';
        break;
      }
      case "rooks": {
        divs[i].style.borderColor = (G.rooks & n) ? 'orange' : 'transparent';
        break;
      }
      case 'can_move': {
        divs[i].style.borderColor =
          currentCell === NO_CELL
            ? 'transparent'
            : currentCell_i === i
              ? 'red'
              : {ok: 'green', bad: 'transparent', blocked: $show_pseudo_moves.checked ? 'orange' : 'transparent'}[canMove(G, currentCell_i, i, currentCell, n, validationMode === 'none')];
        break;
      }
      case 'is_checked_white': {
        divs[i].style.borderColor =
          currentTarget_i === NO_CELL_I || currentTarget_i === i
            ? {ok: 'green', checked: 'orange'}[isCheck(G, i, n, G.white, blackPawnsThatCanCaptureOn).state]
            : 'transparent';
        break;
      }
      case 'is_checked_black': {
        divs[i].style.borderColor =
          currentTarget_i === NO_CELL_I || currentTarget_i === i
            ? {ok: 'green', checked: 'orange'}[isCheck(G, i, n, G.black, whitePawnsThatCanCaptureOn).state]
            : 'transparent';
        break;
      }
    }
  }
  fenState += fenRank;

  fenState = fenState
    .replace(/ +/g, (str) => String(str.length))
    .replaceAll(whiteKing, 'K')
    .replaceAll(whiteQueen, 'Q')
    .replaceAll(whiteRook, 'R')
    .replaceAll(whiteBishop, 'B')
    .replaceAll(whiteKnight, 'N')
    .replaceAll(whitePawn, 'P')
    .replaceAll(blackKing, 'k')
    .replaceAll(blackQueen, 'q')
    .replaceAll(blackRook, 'r')
    .replaceAll(blackBishop, 'b')
    .replaceAll(blackKnight, 'n')
    .replaceAll(blackPawn, 'p')
  ;

  $fennow.value = [
    fenState,
    G.turnWhite ? 'w' : 'b',
    ((H.castleKingsideWhite ? 'K' : '') + (H.castleQueensideWhite ? 'Q' : '') + (H.castleKingsideBlack ? 'k' : '') + (H.castleQueensideBlack ? 'q' : '')) || '-',
    G.enpassant === NO_CELL_I ? '-' : indexToId[G.enpassant],
    String(G.fiftyTurnCounter),
    String(G.wholeTurnCounter),
  ].join(' ');

  $castleQueensideWhite.checked = G.castleQueensideWhite;
  $castleKingsideWhite.checked = G.castleKingsideWhite;
  $castleQueensideBlack.checked = G.castleQueensideBlack;
  $castleKingsideBlack.checked = G.castleKingsideBlack;

  $turnWhite.checked = !!G.turnWhite;
  $turnBlack.checked = !G.turnWhite;

  $enpassant.value = indexToId[G.enpassant] ?? 'no';
  $turn50.value = G.fiftyTurnCounter;
  $turns.value = G.wholeTurnCounter;

  const material = getMatrial(G);
  const whiteMaterial = `${blackPawn.repeat(8 - material.black.pawns)} ${blackKnight.repeat(2 - material.black.knights)} ${blackBishop.repeat(2 - material.black.bishops)} ${blackRook.repeat(2 - material.black.rooks)} ${blackQueen.repeat(1 - material.black.queens)}`;
  const whitePoints = getMaterialPoints(material.black);
  const blackMaterial = `${blackPawn.repeat(8 - material.white.pawns)} ${blackKnight.repeat(2 - material.white.knights)} ${blackBishop.repeat(2 - material.white.bishops)} ${blackRook.repeat(2 - material.white.rooks)} ${blackQueen.repeat(1 - material.white.queens)}`;
  const blackPoints = getMaterialPoints(material.white);
  $material_white.innerHTML = `<span class="pieces">${whiteMaterial}</span>${whitePoints > blackPoints ? ` (+${whitePoints - blackPoints})` : ''}`;
  $material_black.innerHTML = `<span class="pieces">${blackMaterial}</span>${blackPoints > whitePoints ? ` (+${blackPoints - whitePoints})` : ''}`;

  const hash = getFenishString(G);
  $three.innerHTML = G.threefold.get(hash) ?? '0';
  $thrash.value = hash;
  console.timeEnd('reflected');
}

/**
 * Serialize a bitboard to a string with newlines
 *
 * @param bitboard {BigInt}
 * @param leadingNewline {boolean?}
 * @returns {string}
 */
function $(bitboard, leadingNewline = false) {
  if (bitboard === undefined) return '$: bitboard is undefined';
  return (leadingNewline ? '\n' : '') + BigInt.asUintN(64, bitboard).toString(2).padStart(64, '0').match(/.{8}/g).join('\n')
}

/**
 * Serialize a bitboard to a string with newlines, including a preceeding newline
 *
 * @param bitboard {BigInt}
 * @returns {string}
 */
function $$(bitboard) {
  return $(bitboard, true);
}

/**
 * @param cell {string}
 */
function setCurrent(cell) {
  if (autoArrowClear === 'move') clearArrows();
  const i = cell === '' ? NO_CELL_I : (idToIndex[cell] ?? NO_CELL_I);
  //if (i === currentCell_i) {
  //  currentCell_i = NO_CELL_I;
  //  currentCell = NO_CELL;
  //} else {
    currentCell_i = i;
    currentCell = 1n << currentCell_i;
  //}
}

/**
 * @param cell {string}
 */
function setTarget(cell) {
  currentTarget_i = cell === '' ? NO_CELL_I : idToIndex[cell];
}

function clearArrows() {
  for (let i=0; i<64; ++i) divs[i].classList.remove('lit');
  arrowMap.forEach((div, key) => {
    $board.removeChild(div);
    arrowMap.delete(key);
  });
}



//$castling.addEventListener('change', e => { if (e.target.id) { H[e.target.id.slice(1)] = !H[e.target.id.slice(1)]; reflect(H); } });

