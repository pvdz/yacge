/**
 * @param {LocalState} L
 * @param {number} [steps]
 */
function reflectHistory(L, steps) {
  if (steps !== undefined) moveHistoryPointer(L, steps);

  const move = L.history.moves[L.history.index];
  const fen = move.fen;
  if (fen === undefined) {
    console.log('current L.history.index', [L.history.index], 'has no FEN cache (fen cache size:', L.history.moves.length, ')');
    return undefined;
  }
  const G = parseFen(fen);
  G.prevFrom = idToIndex[move.from];
  G.prevTo = idToIndex[move.to];
  L.G = G;
  //console.log('reflectHistory:', G, fen)
  reflect(L);
  displayHistory(L);
}

/**
 * @param {LocalState} L
 * @param steps {number}
 */
function moveHistoryPointer(L, steps) {
  setHistoryPointer(L, L.history.index + steps);
}

/**
 * @param {LocalState} L
 * @param {number} index
 */
function setHistoryPointer(L, index) {
  //console.log('setHistoryPointer:', halfTurns)
  if (isNaN(index)) return;
  L.history.index = Math.min(Math.max(0, index), L.history.moves.length - 1) || 0;
}

/**
 * @param {LocalState} L
 */
function displayHistory(L) {
  const pre = L.html.history;
  pre.innerHTML = '';

  const current = L.history.moves[L.history.index];

  pre.appendChild(document.createTextNode(`half: ${current?.turn * 2 + (current?.white ? 0 : 1)}, full: ${current?.turn},  index: ${L.history.index}\n\n`));

  const hash = {
    // '0': {hi: 0, ...L.history.moves[0]}
  };
  L.history.moves.forEach((move, hi) => {
    if (!hash[move.turn]) hash[move.turn] = {turn: move.turn};
    hash[move.turn][move.white ? 'white' : 'black'] = {hi, current: L.history.index === hi, ...move};
  });

  Object.keys(hash)
  .sort((a, b) => hash[a].turn - hash[b].turn) // asc
  .forEach((key, i) => {
    const {turn, white, black} = hash[key];

    const isTurn = turn === current?.turn;

    const turnSpan = document.createElement('span');
    turnSpan.innerHTML = i ? `${String(turn).padStart(3, ' ')}.` : ' --  ';

    if (i === 0) {
      const start = document.createElement('span');
      start.innerHTML = `Start`;
      if (0 === L.history.index) {
        start.style = 'background-color: yellow;';
      } else if (black) {
        start.className = 'load_move';
        start.addEventListener('click', () => {
          setHistoryPointer(L, 0);
          reflectHistory(L);
        });
      }
      turnSpan.appendChild(start);
    }

    const rowSpan = document.createElement('span');

    const whiteLeft = document.createElement('span');
    if (white?.current) {
      whiteLeft.style = 'background-color: yellow;';
      whiteLeft.innerHTML = `${white?.piece} ${white?.from} ${white?.to}`;
    } else if (white) {
      whiteLeft.className = 'load_move';
      whiteLeft.addEventListener('click', () => {
        setHistoryPointer(L, white.hi);
        reflectHistory(L);
      });
      whiteLeft.innerHTML = `${white?.piece} ${white?.from} ${white?.to}`;
    } else {
      whiteLeft.innerHTML = `--     `;
    }

    const blackLeft = document.createElement('span');
    if (black?.current) {
      blackLeft.style = 'background-color: yellow;';
      blackLeft.innerHTML = `${black?.piece} ${black?.from} ${black?.to}`;
    } else if (black) {
      blackLeft.className = 'load_move';
      blackLeft.addEventListener('click', () => {
        setHistoryPointer(L, black.hi);
        reflectHistory(L);
      });
      blackLeft.innerHTML = `${black?.piece} ${black?.from} ${black?.to}`;
    } else {
      blackLeft.innerHTML = `--     `;
    }

    const whiteRight = document.createElement('span');
    if (white?.current) {
      whiteRight.style = 'background-color: yellow;';
      whiteRight.innerHTML = white.an || `--     `;
    } else if (white) {
      whiteRight.className = 'load_move';
      whiteRight.addEventListener('click', () => {
        setHistoryPointer(L, white.hi);
        reflectHistory(L);
      });
      whiteRight.innerHTML = white.an || `--     `;
    } else {
      whiteRight.innerHTML = `--     `;
    }

    const blackRight = document.createElement('span');
    if (black?.current) {
      blackRight.style = 'background-color: yellow;';
      blackRight.innerHTML = black.an || `--     `;
    } else if (black) {
      blackRight.className = 'load_move';
      blackRight.addEventListener('click', () => {
        setHistoryPointer(L, black.hi);
        reflectHistory(L);
      });
      blackRight.innerHTML = black.an || `--     `;
    } else {
      blackRight.innerHTML = `--     `;
    }

    if (isTurn) rowSpan.style = 'background-color: #eee;';
    rowSpan.appendChild(turnSpan);
    if (i === 0) {
      rowSpan.appendChild(document.createTextNode('\n'));
    } else {
      rowSpan.appendChild(document.createTextNode(' '));
      rowSpan.appendChild(whiteLeft);
      rowSpan.appendChild(document.createTextNode('  '));
      rowSpan.appendChild(blackLeft);
      rowSpan.appendChild(document.createTextNode('  |  '));
      rowSpan.appendChild(whiteRight);
      rowSpan.appendChild(document.createTextNode(' '.repeat(Math.max(0, 10 - (white?.an || '').length))));
      rowSpan.appendChild(blackRight);
      rowSpan.appendChild(document.createTextNode('\n'));
    }

    pre.appendChild(rowSpan);
  });

  pre.appendChild(document.createTextNode(` --  ${history.end || '*'}`));
}

/**
 * @param {LocalState} L
 * @param {string} [str]
 * @returns {Element}
 */
function toggleHistoryAutoPlay(L, str) {
  if (L.autoPlayTimer) {
    console.log('stopping uatoplay')
    clearInterval(L.autoPlayTimer);
    L.autoPlayTimer = 0;
  } else {
    console.log('starting uatoplay')
    L.autoPlayTimer = setInterval(() => {
      moveHistoryPointer(L, 1);
      reflectHistory(L);
    }, 1000);
  }
}

/**
 * @param G {Game}
 * @param pgnGame {PgnGame}
 * @param ply {Ply|undefined}
 * @param halfGameTurn {number} Offset 1, increments for each move each player makes
 * @param fullGameTurn {number} Offset 1, increments after each move the black player makes
 * @param [debug] {boolean}
 * @returns {{turn: number, fen: string, white: boolean, from: string, to: string, an: string}}
 */
function preComputeHistoryStep(G, pgnGame, ply, halfGameTurn, fullGameTurn, debug = false) {
  const forWhite = halfGameTurn % 2 === 1; // Offset at 1 because 0 is the starting board
  const {i: fromi, n: fromn} = findSourceCellFromPgnMove(G, forWhite, ply.piece, ply.to, ply.fromFile, ply.fromRank, debug);
  const toi = idToIndex[ply.to];
  const ton = 1n << toi;
  if (debug) console.warn(`Attempting turn ${fullGameTurn}, moving a ${forWhite?'white':'black'} ${ply.piece}, from`, indexToId[fromi], 'to', indexToId[toi], ply);
  ply.fromResolved = indexToId[fromi];
  makeCompleteMove(G, fromi, toi, fromn, ton, {B:'bishop', N: 'knight', R: 'rook', Q: 'queen'}[ply.promote] ?? 'queen');
  pgnGame.fenCache[halfGameTurn] = getFenString(G);

  return {turn: fullGameTurn, fen: getFenString(G), white: forWhite, from: indexToId[fromi], to: indexToId[toi], piece: ply.piece, an: ply.raw};
}
