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
  console.log('reflect attempt...');
  // Debounce visual representation but store the state to show
  lastReflectGame = G;
  if (reflectTimer !== undefined) return console.log('debounced...');
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
  console.log('reflecting...');
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
  console.log('material:', material);
  const whiteMaterial = `${blackPawn.repeat(8 - material.black.pawns)} ${blackKnight.repeat(2 - material.black.knights)} ${blackBishop.repeat(2 - material.black.bishops)} ${blackRook.repeat(2 - material.black.rooks)} ${blackQueen.repeat(1 - material.black.queens)}`;
  const whitePoints = whiteMaterial.replace(new RegExp(`(${blackPawn}*) *(${blackKnight}*) *(${blackBishop}*) *(${blackQueen}*) *(${blackRook}*)`), (s, p, b, n, r, q) => `${(p?.length??0) + ((b?.length??0) * 3) + ((n?.length??0) * 3) + ((r?.length??0) * 5) + ((q?.length??0) * 8)}`);
  const blackMaterial = `${blackPawn.repeat(8 - material.white.pawns)} ${blackKnight.repeat(2 - material.white.knights)} ${blackBishop.repeat(2 - material.white.bishops)} ${blackRook.repeat(2 - material.white.rooks)} ${blackQueen.repeat(1 - material.white.queens)}`;
  const blackPoints = blackMaterial.replace(new RegExp(`(${blackPawn}*) *(${blackKnight}*) *(${blackBishop}*) *(${blackQueen}*) *(${blackRook}*)`), (s, p, b, n, r, q) => `${(p?.length??0) + ((b?.length??0) * 3) + ((n?.length??0) * 3) + ((r?.length??0) * 5) + ((q?.length??0) * 8)}`);
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

$board.addEventListener('contextmenu', e => e.preventDefault()); // hide context menu
$board.addEventListener('pointerdown', e => {
  e.preventDefault();

  pointerDown = true;
  pointerDownX = e.clientX;
  pointerDownY = e.clientY;
  pointerDownButton = {1: 'lmb', 2: 'rmb', 4: 'mmb'}[e.button] ?? '';
  const cell = e.target.id?.slice(1);
  pointerDownCellI = idToIndex[cell] ?? NO_CELL_I;
  pointerOverCellI = pointerDownCellI;

  switch (e.button) {
    case 0: { // lmb
      console.log('pointerdown, lmb:', e);

      // We deselect the cell if we clicked on the same cell without dragging it
      const wasSelected = pointerDownCellI === currentCell_i;
      deselectCell = cell === '' ? true : wasSelected;
      if (!wasSelected && autoArrowClear) clearArrows();
      if (((H.black | H.white) & (1n << pointerDownCellI)) === 0n) {
        // Clicking on an empty cell should not select it
        deselectCell = false;
        currentCell_i = NO_CELL_I;
        currentCell = NO_CELL;
      } else {
        setCurrent(e.target.id?.slice(1));
      }

      reflect(H);
      const {color, icon} = getPieceIconAt(H, 1n << pointerDownCellI);
      if (icon) {
        currentDragIcon = $board.appendChild(document.createElement('div'));
        currentDragIcon.className = `flying cell`;
        currentDragIcon.innerHTML = `<p class="${color}">${icon}</p>`;
        currentDragIcon.style.left = (e.clientX - $board.offsetLeft) - Math.floor(e.target.offsetWidth / 2) + 'px';
        currentDragIcon.style.top = (e.clientY - $board.offsetTop) - Math.floor(e.target.offsetHeight / 2) + 'px';
      }
      break;
    }
    case 2: { // rmb
      // Start drawing arrow from the current cell to the current hovering cell
      console.log('pointerdown, rmb:', e);
      break;
    }
    case 4: { // middle
      console.log('pointerdown, mmb:', e);
      break;
    }
    default: {
      console.log('pointerdown, ??b:', e);
    }
  }

  return false;
});
$board.addEventListener('pointermove', e => {
  const old = pointerOverCellI;
  deselectCell = false;
  pointerOverCellI = idToIndex[e.target.id?.slice(1)];
  if (pointerDown) {
    if (currentDragIcon && pointerOverCellI !== undefined) {
      currentDragIcon.style.left = (e.clientX - $board.offsetLeft) - Math.floor(e.target.offsetWidth / 2) + 'px';
      currentDragIcon.style.top = (e.clientY - $board.offsetTop) - Math.floor(e.target.offsetHeight / 2) + 'px';
    }
    if (!pointerDragging) {
      if (Math.pow(pointerDownX - e.clientX, 2) + Math.pow(pointerDownY - e.clientY, 2) > 1000) {
        // "if moved more than n px"
        pointerDragging = true;
      }
    }
    if (pointerDragging) {
      if (pointerOverCellI !== undefined && pointerDownButton === 'rmb' && old !== pointerOverCellI) {
        // Update the arrow

        const dx = Number((pointerOverCellI % 8n) - (pointerDownCellI % 8n));
        const dy = Number((pointerOverCellI / 8n) - (pointerDownCellI / 8n));

        const ow = divs[pointerDownCellI].offsetWidth;
        const oh = divs[pointerDownCellI].offsetHeight;

        if (!currentArrow) {
          currentArrow = $board.appendChild(document.createElement('div'));
          currentArrow.className = 'arrow';
          // Absolute positioning of the arrow on the board
          currentArrow.style.top = divs[pointerDownCellI].offsetTop + 'px';
          currentArrow.style.left = divs[pointerDownCellI].offsetLeft + 'px';
        }
        const odlx = dx === 0 ? ow * 0.5 : dx > 0 ? ow * 0.2 : ow * 0.8;
        const odly = dy === 0 ? oh * 0.5 : dy > 0 ? oh * 0.2 : oh * 0.8;
        // Relative positioning to the cell
        currentArrow.style.marginLeft = odlx + 'px';
        currentArrow.style.marginTop = odly - 20 + 'px';
        // The length of the (base of the) arrow is the number of cells _between_ source and target cells, plus half a cell, plus a orientation-dependant length (odlx/y) for the starting cell
        const a = ow * dx + (dx === 0 ? 0 : dx > 0 ? -ow * 0.3 : ow * 0.2);
        const ody = oh * dy + (dy === 0 ? 0 : dy > 0 ? -oh * 0.3 : oh * 0.2);
        const c = Math.sqrt(Math.pow(a, 2) + Math.pow(ody, 2));

        const arrowHeadCompensation = 50;
        currentArrow.style.width = Math.floor(c) - arrowHeadCompensation + 'px';

        const angle = -90 + Math.atan2(a, ody) * -(180 / Math.PI);
        currentArrow.style.transform = `rotateZ(${angle}deg)`;
      }
    }
  }
});
$board.addEventListener('pointerup', e => {
  e.preventDefault();

  pointerDragging = false;
  pointerDown = 0;
  reflect(H);
  if (currentDragIcon) {
    $board.removeChild(currentDragIcon);
    currentDragIcon = undefined;
    const pointerUpCellI = idToIndex[e.target.id?.slice(1)] ?? NO_CELL_I;
    if (pointerDownCellI !== undefined && pointerDownCellI !== pointerUpCellI) {
      const fromn = 1n << pointerDownCellI;
      const ton = 1n << pointerUpCellI;
      if (validationMode === 'none' || canMove(H, pointerDownCellI, pointerUpCellI, fromn, ton) === 'ok') {
        makeMove(H, pointerDownCellI, pointerUpCellI, fromn, ton, true, H.promotionDefault);
        currentCell_i = NO_CELL_I;
        currentCell = NO_CELL;
        reflect(H);
        //const hashes = getBoardHash(H);
        //console.log('board hash:', hashes)
        //console.log(Object.keys(hashes).map(key => `${key}: ${String(hashes[key]).length}`));
      }
    }
  }

  if (deselectCell) {
    currentCell_i = NO_CELL_I;
    currentCell = NO_CELL;
    deselectCell = false;
  }

  if (currentArrow) {
    if (pointerDownCellI !== undefined && pointerOverCellI !== undefined && pointerDownCellI !== pointerOverCellI) {
      const key = `${pointerDownCellI}-${pointerOverCellI}`;
      // There is an arrow to paint? Save it. Unless there already was one, then delete it.
      if (arrowMap.has(key)) {
        $board.removeChild(arrowMap.get(key));
        $board.removeChild(currentArrow);
        arrowMap.delete(key);
      } else {
        arrowMap.set(key, currentArrow);
      }
    } else {
      $board.removeChild(currentArrow);
    }
  } else {
    if (pointerDownButton === 'rmb') {
      const pointerUpCellI = idToIndex[e.target.id?.slice(1)] ?? NO_CELL_I;
      if (pointerUpCellI !== NO_CELL_I && pointerDownCellI === pointerUpCellI) {
        // Select cell. Just toggle the class name
        e.target.classList.toggle('lit');
      }
    }
  }
  currentArrow = undefined;
  pointerDownCellI = NO_CELL_I;
});
$castling.addEventListener('change', e => { if (e.target.id) { H[e.target.id.slice(1)] = !H[e.target.id.slice(1)]; reflect(H); } });
$fens.addEventListener('pointerup', e => { if (e.target.previousElementSibling?.value) { H = parseFen(e.target.previousElementSibling.value); reflect(H); } });

