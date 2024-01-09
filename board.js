function div(cls = '', parent) {
  const div = document.createElement('div');
  if (cls) div.className = cls;
  if (parent) parent.appendChild(div);
  return div;
}

function cellHtml(id, index, i, j) {
  const cellDiv = div(`cell ${(i + (j % 2)) % 2 ? 'dark' : 'light'}`);
  cellDiv.id = `$${id}`;
  div('', cellDiv);
  const idDiv = div('id', cellDiv);
  div('index', idDiv).innerHTML = String(index);
  div('dash', idDiv).innerHTML = ' - ';
  div('coord', idDiv).innerHTML = String(id);
  return cellDiv;
}

/**
 * @returns {{cellDivs: Element[], root: Element, board: Element}}
 */
function createBoardHtml() {
  const outer = div('board_outer');
  const middle = div('board_middle', outer)
  const inner = div('board_inner', middle);

  const cellDivs = [];

  // Top row of file ("column") indicators
  FILE_HEADERS.forEach(str => inner.appendChild(div('gutter_label')).innerHTML = str);
  CELL_DATA.forEach((rank, j) => {
    inner.appendChild(div('gutter_label')).innerHTML = String(8 - j);
    rank.forEach(([id, index], i) => {
      const cell = inner.appendChild(cellHtml(id, index, i, j));
      cellDivs.push(cell);
    });
    inner.appendChild(div('gutter_label')).innerHTML = String(8 - j);
  });
  FILE_HEADERS.forEach(str => inner.appendChild(div('gutter_label')).innerHTML = str);

  return {root: outer, cellDivs: cellDivs.reverse(), board: inner};
}

/**
 * @param {string} [uid] A unique id for this LocalState. Used, for example, to namespace radio button names (which are otherwise global). Defaults to a Math.random value.
 * @returns {LocalState}
 */
function createBoard(uid) {
  const {root: board, board: inner, cellDivs} = createBoardHtml();
  document.body.appendChild(board);

  const L = {
    G: parseFen(FEN_NEW_GAME),
    uid: uid || String(Math.random()).slice(2),
    currentOverlay: '',
    html: {
      root: board,
      board: inner,
      cells: cellDivs,
    },
    arrowMap: new Map,
    validationMode: 'strict',
    reflectTimer: 0,
    currentCell_i: NO_CELL_I,
    currentCell_n: NO_CELL,
    currentTarget_i: NO_CELL_I,
    //history: undefined,
    historyIndex: 0,
    autoPlayTimer: 0,
  };

  board.addEventListener('contextmenu', e => e.preventDefault()); // hide context menu
  board.addEventListener('pointerdown', e => {
    e.target.releasePointerCapture(e.pointerId); // Must release touch events otherwise e.target won't update onpointerup (ht @@DIYFractal)
    e.preventDefault();

    console.log('pointerdown-->', e);

    M.pointerDownStatus = true;
    M.pointerDownX = e.clientX;
    M.pointerDownY = e.clientY;
    M.pointerDownButton = {1: 'lmb', 2: 'rmb', 4: 'mmb'}[e.button] ?? '';
    const cell = e.target.id?.slice(1);
    M.pointerDownCellI = idToIndex[cell] ?? NO_CELL_I;
    M.pointerOverCellI = M.pointerDownCellI;

    switch (e.button) {
      case 0: { // lmb
        // We deselect the cell if we clicked on the same cell without dragging it
        const wasSelected = M.pointerDownCellI === L.currentCell_i;
        M.deselectCell = cell === '' ? true : wasSelected;
        if (!wasSelected && S.autoArrowClear) clearArrows(L);
        if (((L.G.black | L.G.white) & (1n << M.pointerDownCellI)) === 0n) {
          // Clicking on an empty cell should not select it
          M.deselectCell = false;
          L.currentCell_i = NO_CELL_I;
          L.currentCell_n = NO_CELL;
        } else {
          setCurrent(L, e.target.id?.slice(1));
        }

        reflect(L);
        const {color, icon} = getPieceIconAt(L.G, 1n << M.pointerDownCellI);
        if (icon) {
          M.currentDragIcon = board.appendChild(document.createElement('div'));
          M.currentDragIcon.className = `flying cell`;
          M.currentDragIcon.innerHTML = `<p class="${color}">${icon}</p>`;
          M.currentDragIcon.style.left = (e.clientX - board.offsetLeft) - Math.floor(e.target.offsetWidth / 2) + 'px';
          M.currentDragIcon.style.top = (e.clientY - board.offsetTop) - Math.floor(e.target.offsetHeight / 2) + 'px';
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
  board.addEventListener('pointermove', e => {
    e.preventDefault();
    // console.log('pointermove-->', e)

    const old = M.pointerOverCellI;
    M.deselectCell = false;
    M.pointerOverCellI = idToIndex[e.target.id?.slice(1)];
    if (M.pointerDownStatus) {
      if (M.currentDragIcon && M.pointerOverCellI !== undefined) {
        M.currentDragIcon.style.left = (e.clientX - board.offsetLeft) - Math.floor(e.target.offsetWidth / 2) + 'px';
        M.currentDragIcon.style.top = (e.clientY - board.offsetTop) - Math.floor(e.target.offsetHeight / 2) + 'px';
      }
      if (!M.pointerDragging) {
        if (Math.pow(M.pointerDownX - e.clientX, 2) + Math.pow(M.pointerDownY - e.clientY, 2) > 1000) {
          // "if moved more than n px"
          M.pointerDragging = true;
        }
      }
      if (M.pointerDragging) {
        if (M.pointerOverCellI !== undefined && M.pointerDownButton === 'rmb' && old !== M.pointerOverCellI) {
          // Update the arrow

          const dx = Number((M.pointerOverCellI % 8n) - (M.pointerDownCellI % 8n));
          const dy = Number((M.pointerOverCellI / 8n) - (M.pointerDownCellI / 8n));

          const ow = L.html.cells[M.pointerDownCellI].offsetWidth;
          const oh = L.html.cells[M.pointerDownCellI].offsetHeight;

          if (!M.currentArrow) {
            M.currentArrow = board.appendChild(document.createElement('div'));
            M.currentArrow.className = 'arrow';
            // Absolute positioning of the arrow on the board
            M.currentArrow.style.top = L.html.cells[M.pointerDownCellI].offsetTop + 'px';
            M.currentArrow.style.left = L.html.cells[M.pointerDownCellI].offsetLeft + 'px';
          }
          const odlx = dx === 0 ? ow * 0.5 : dx > 0 ? ow * 0.2 : ow * 0.8;
          const odly = dy === 0 ? oh * 0.5 : dy > 0 ? oh * 0.2 : oh * 0.8;
          // Relative positioning to the cell
          M.currentArrow.style.marginLeft = odlx + 'px';
          M.currentArrow.style.marginTop = odly - 20 + 'px';
          // The length of the (base of the) arrow is the number of cells _between_ source and target cells, plus half a cell, plus a orientation-dependant length (odlx/y) for the starting cell
          const a = ow * dx + (dx === 0 ? 0 : dx > 0 ? -ow * 0.3 : ow * 0.2);
          const ody = oh * dy + (dy === 0 ? 0 : dy > 0 ? -oh * 0.3 : oh * 0.2);
          const c = Math.sqrt(Math.pow(a, 2) + Math.pow(ody, 2));

          const arrowHeadCompensation = 50;
          M.currentArrow.style.width = Math.floor(c) - arrowHeadCompensation + 'px';

          const angle = -90 + Math.atan2(a, ody) * -(180 / Math.PI);
          M.currentArrow.style.transform = `rotateZ(${angle}deg)`;
        }
      }
    }
  });
  board.addEventListener('pointerup', e => {
    e.preventDefault();
    // console.log('pointerup-->', e)

    M.pointerDragging = false;
    M.pointerDownStatus = false;
    reflect(L);
    if (M.currentDragIcon) {
      board.removeChild(M.currentDragIcon);
      M.currentDragIcon = undefined;
      const pointerUpCellI = idToIndex[e.target.id?.slice(1)] ?? NO_CELL_I;
      if (M.pointerDownCellI !== undefined && M.pointerDownCellI !== pointerUpCellI) {
        const fromn = 1n << M.pointerDownCellI;
        const ton = 1n << pointerUpCellI;
        if (L.validationMode === 'none' || canMove(L.G, M.pointerDownCellI, pointerUpCellI, fromn, ton, false, L.currentTarget_i) === 'ok') {
          makeCompleteMoveIncHistory(L, M.pointerDownCellI, pointerUpCellI, fromn, ton, L.G.promotionDefault);
          if (L.autoArrowClear === 'move' || S.autoArrowClear === 'move') clearArrows(L);
          L.currentCell_i = NO_CELL_I;
          L.currentCell_n = NO_CELL;
          reflect(L);
          //const hashes = getBoardHash(H);
          //console.log('board hash:', hashes)
          //console.log(Object.keys(hashes).map(key => `${key}: ${String(hashes[key]).length}`));
        }
      }
    }

    if (M.deselectCell) {
      L.currentCell_i = NO_CELL_I;
      L.currentCell_n = NO_CELL;
      M.deselectCell = false;
    }

    if (M.currentArrow) {
      if (M.pointerDownCellI !== undefined && M.pointerOverCellI !== undefined && M.pointerDownCellI !== M.pointerOverCellI) {
        const key = `${M.pointerDownCellI}-${M.pointerOverCellI}`;
        // There is an arrow to paint? Save it. Unless there already was one, then delete it.
        if (L.arrowMap.has(key)) {
          board.removeChild(L.arrowMap.get(key));
          board.removeChild(M.currentArrow);
          L.arrowMap.delete(key);
        } else {
          L.arrowMap.set(key, M.currentArrow);
        }
      } else {
        board.removeChild(M.currentArrow);
      }
    } else {
      if (M.pointerDownButton === 'rmb') {
        const pointerUpCellI = idToIndex[e.target.id?.slice(1)] ?? NO_CELL_I;
        if (pointerUpCellI !== NO_CELL_I && M.pointerDownCellI === pointerUpCellI) {
          // Select cell. Just toggle the class name
          e.target.classList.toggle('lit');
        }
      }
    }
    M.currentArrow = undefined;
    M.pointerDownCellI = NO_CELL_I;
  });

  return L;
}

