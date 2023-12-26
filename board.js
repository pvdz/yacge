
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

const FILE_HEADERS = ['', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', ''];
const CELL_DATA = [
  [['a8', '63'], ['b8', '62'], ['c8', '61'], ['d8', '60'], ['e8', '59'], ['f8', '58'], ['g8', '57'], ['h8', '56']],
  [['a7', '55'], ['b7', '54'], ['c7', '53'], ['d7', '52'], ['e7', '54'], ['f7', '50'], ['g7', '49'], ['h7', '48']],
  [['a6', '47'], ['b6', '46'], ['c6', '45'], ['d6', '44'], ['e6', '45'], ['f6', '42'], ['g6', '41'], ['h6', '40']],
  [['a5', '39'], ['b5', '38'], ['c5', '37'], ['d5', '36'], ['e5', '36'], ['f5', '34'], ['g5', '33'], ['h5', '32']],
  [['a4', '31'], ['b4', '30'], ['c4', '29'], ['d4', '28'], ['e4', '27'], ['f4', '26'], ['g4', '25'], ['h4', '24']],
  [['a3', '23'], ['b3', '22'], ['c3', '21'], ['d3', '20'], ['e3', '19'], ['f3', '18'], ['g3', '17'], ['h3', '16']],
  [['a2', '15'], ['b2', '14'], ['c2', '13'], ['d2', '12'], ['e2', '11'], ['f2', '10'], ['g2',  '9'], ['h2',  '8']],
  [['a1',  '7'], ['b1',  '6'], ['c1',  '5'], ['d1',  '4'], ['e1',  '3'], ['f1',  '2'], ['g1',  '1'], ['h1',  '0']],
];

function createBoardHtml() {
  const outer = div('board_outer');
  const middle = div('board_middle', outer)
  const inner = div('board_inner', middle);
  inner.id = '$board';

  // Top row of file ("column") indicators
  FILE_HEADERS.forEach(str => inner.appendChild(div('gutter_label')).innerHTML = str);
  CELL_DATA.forEach((rank, j) => {
    inner.appendChild(div('gutter_label')).innerHTML = String(8 - j);
    rank.forEach(([id, index], i) => {
      inner.appendChild(cellHtml(id, index, i, j));
    });
    inner.appendChild(div('gutter_label')).innerHTML = String(8 - j);
  });
  FILE_HEADERS.forEach(str => inner.appendChild(div('gutter_label')).innerHTML = str);

  return outer;
}

const board = createBoardHtml();
document.body.appendChild(board);

board.addEventListener('contextmenu', e => e.preventDefault()); // hide context menu
board.addEventListener('pointerdown', e => {
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
        currentDragIcon = board.appendChild(document.createElement('div'));
        currentDragIcon.className = `flying cell`;
        currentDragIcon.innerHTML = `<p class="${color}">${icon}</p>`;
        currentDragIcon.style.left = (e.clientX - board.offsetLeft) - Math.floor(e.target.offsetWidth / 2) + 'px';
        currentDragIcon.style.top = (e.clientY - board.offsetTop) - Math.floor(e.target.offsetHeight / 2) + 'px';
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
  const old = pointerOverCellI;
  deselectCell = false;
  pointerOverCellI = idToIndex[e.target.id?.slice(1)];
  if (pointerDown) {
    if (currentDragIcon && pointerOverCellI !== undefined) {
      currentDragIcon.style.left = (e.clientX - board.offsetLeft) - Math.floor(e.target.offsetWidth / 2) + 'px';
      currentDragIcon.style.top = (e.clientY - board.offsetTop) - Math.floor(e.target.offsetHeight / 2) + 'px';
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
          currentArrow = board.appendChild(document.createElement('div'));
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
board.addEventListener('pointerup', e => {
  e.preventDefault();

  pointerDragging = false;
  pointerDown = 0;
  reflect(H);
  if (currentDragIcon) {
    board.removeChild(currentDragIcon);
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
        board.removeChild(arrowMap.get(key));
        board.removeChild(currentArrow);
        arrowMap.delete(key);
      } else {
        arrowMap.set(key, currentArrow);
      }
    } else {
      board.removeChild(currentArrow);
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
