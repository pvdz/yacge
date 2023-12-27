/**
 * @param G {Game}
 */
function reflect(G) {
  //console.trace('reflect attempt...', G);
  // Debounce visual representation but store the state to show
  L.G = G;
  if (L.reflectTimer) return;// console.log('debounced...');
  L.reflectTimer = setTimeout(() => realReflect(L.G), 100);
}

/**
 * @param G {Game}
 */
function realReflect(G) {
  clearTimeout(L.reflectTimer);
  L.reflectTimer = undefined;

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

    L.html.cells[i].children[0].innerHTML = icon;
    if (i > 0 && i % 8n === 0n) {
      // Start of next rank after the first
      fenState = '/' + fenState;
    }
    fenState = (icon || ' ') + fenState;

    L.html.cells[i].children[0].className = G.white & n ? 'white' : 'black';
    if (i === G.prevFrom || i === G.prevTo) L.html.cells[i].classList.add('last');
    else L.html.cells[i].classList.remove('last');

    if (i === L.currentCell_i) L.html.cells[i].style.borderColor = 'blue';
    else switch (L.currentOverlay || S.currentOverlay) {
      case "none": {
        L.html.cells[i].style.borderColor = 'transparent';
        break;
      }
      case "filled": {
        L.html.cells[i].style.borderColor = ((G.black | G.white) & n) ? 'orange' : 'transparent';
        break;
      }
      case "white": {
        L.html.cells[i].style.borderColor = (G.white & n) ? 'orange' : 'transparent';
        break;
      }
      case "black": {
        L.html.cells[i].style.borderColor = (G.black & n) ? 'orange' : 'transparent';
        break;
      }
      case "pawns": {
        L.html.cells[i].style.borderColor = (G.pawns & n) ? 'orange' : 'transparent';
        break;
      }
      case "kings": {
        L.html.cells[i].style.borderColor = (G.kings & n) ? 'orange' : 'transparent';
        break;
      }
      case "queens": {
        L.html.cells[i].style.borderColor = (G.queens & n) ? 'orange' : 'transparent';
        break;
      }
      case "knights": {
        L.html.cells[i].style.borderColor = (G.knights & n) ? 'orange' : 'transparent';
        break;
      }
      case "bishops": {
        L.html.cells[i].style.borderColor = (G.bishops & n) ? 'orange' : 'transparent';
        break;
      }
      case "rooks": {
        L.html.cells[i].style.borderColor = (G.rooks & n) ? 'orange' : 'transparent';
        break;
      }
      case 'can_move': {
        L.html.cells[i].style.borderColor =
          L.currentCell_n === NO_CELL
            ? 'transparent'
            : L.currentCell_i === i
              ? 'red'
              : {ok: 'green', bad: 'transparent', blocked: $show_pseudo_moves.checked ? 'orange' : 'transparent'}[canMove(G, L.currentCell_i, i, L.currentCell_n, n, L.validationMode === 'none')];
        break;
      }
      case 'is_checked_white': {
        L.html.cells[i].style.borderColor =
          L.currentTarget_i === NO_CELL_I || L.currentTarget_i === i
            ? {ok: 'green', checked: 'orange'}[isCheck(G, i, n, G.white, blackPawnsThatCanCaptureOn).state]
            : 'transparent';
        break;
      }
      case 'is_checked_black': {
        L.html.cells[i].style.borderColor =
          L.currentTarget_i === NO_CELL_I || L.currentTarget_i === i
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

  L.html.fenCurrent.value = [
    fenState,
    G.turnWhite ? 'w' : 'b',
    ((L.G.castleKingsideWhite ? 'K' : '') + (L.G.castleQueensideWhite ? 'Q' : '') + (L.G.castleKingsideBlack ? 'k' : '') + (L.G.castleQueensideBlack ? 'q' : '')) || '-',
    G.enpassant === NO_CELL_I ? '-' : indexToId[G.enpassant],
    String(G.fiftyTurnCounter),
    String(G.wholeTurnCounter),
  ].join(' ');

  L.html.castleQueensideWhite.checked = G.castleQueensideWhite;
  L.html.castleKingsideWhite.checked = G.castleKingsideWhite;
  L.html.castleQueensideBlack.checked = G.castleQueensideBlack;
  L.html.castleKingsideBlack.checked = G.castleKingsideBlack;

  L.html.turnWhite.checked = !!G.turnWhite;
  L.html.turnBlack.checked = !G.turnWhite;

  L.html.enpassant.value = indexToId[G.enpassant] ?? 'no';
  L.html.turn50.value = G.fiftyTurnCounter;
  L.html.turns.value = String(G.wholeTurnCounter).trim();

  const material = getMatrial(G);
  const whiteMaterial = `${blackPawn.repeat(Math.max(0, 8 - material.black.pawns))} ${blackKnight.repeat(Math.max(0, 2 - material.black.knights))} ${blackBishop.repeat(Math.max(0, 2 - material.black.bishops))} ${blackRook.repeat(Math.max(0, 2 - material.black.rooks))} ${blackQueen.repeat(Math.max(0, 1 - material.black.queens))}`;
  const whitePoints = getMaterialPoints(material.black);
  const blackMaterial = `${blackPawn.repeat(Math.max(0, 8 - material.white.pawns))} ${blackKnight.repeat(Math.max(0, 2 - material.white.knights))} ${blackBishop.repeat(Math.max(0, 2 - material.white.bishops))} ${blackRook.repeat(Math.max(0, 2 - material.white.rooks))} ${blackQueen.repeat(Math.max(0, 1 - material.white.queens))}`;
  const blackPoints = getMaterialPoints(material.white);
  L.html.materialWhite.innerHTML = `<span class="pieces">${whiteMaterial}</span>${whitePoints > blackPoints ? ` (+${whitePoints - blackPoints})` : ''}`;
  L.html.materialBlack.innerHTML = `<span class="pieces">${blackMaterial}</span>${blackPoints > whitePoints ? ` (+${blackPoints - whitePoints})` : ''}`;

  const hash = getFenishString(G);
  L.html.three.innerHTML = G.threefold.get(hash) ?? '0';
  $thrash.value = hash;
  console.timeEnd('reflected');
}

/**
 * @param cell {string}
 */
function setCurrent(cell) {
  if (S.autoArrowClear === 'move') clearArrows();
  const i = cell === '' ? NO_CELL_I : (idToIndex[cell] ?? NO_CELL_I);
  L.currentCell_i = i;
  L.currentCell_n = 1n << i;
}

/**
 * @param cell {string}
 */
function setTarget(cell) {
  L.currentTarget_i = cell === '' ? NO_CELL_I : idToIndex[cell];
}

function clearArrows() {
  for (let i=0; i<64; ++i) L.html.cells[i].classList.remove('lit');
  L.arrowMap.forEach((div, key) => {
    L.html.root.removeChild(div);
    L.arrowMap.delete(key);
  });
}
