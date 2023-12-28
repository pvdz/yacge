/**
 * @param {string} [cls]
 * @param {Element} [parent]
 * @param {...Element} children
 * @returns {Element}
 */
function div(cls = '', parent, ...children) {
  const div = document.createElement('div');
  if (cls) div.className = cls;
  if (parent) parent.appendChild(div);
  children.forEach(e => div.appendChild(e));
  return div;
}

/**
 * @param {string} legend
 * @param {Element} [parent]
 * @returns {Element}
 */
function fieldset(legend, parent) {
  const fs = document.createElement('fieldset');
  fs.appendChild(document.createElement('legend')).innerHTML = legend;
  if (parent) parent.appendChild(fs);
  return fs;
}

/**
 * @param {string} iClass
 * @param {string} iType
 * @param {string} iId
 * @param {string} iName
 * @param {string} iValue
 * @param {boolean} iChecked
 * @param {string} sClass
 * @param {string} sValue
 * @param {boolean} [dimmable]
 * @returns {Element[]} [label, input] (an array for easier local consts)
 */
function toggle(iClass, iType, iId, iName, iValue, iChecked, sClass, sValue, dimmable) {
  const label = document.createElement('label');
  const input = document.createElement('input');
  const span = document.createElement('label');

  label.appendChild(input);
  label.appendChild(span);

  input.className = iClass;
  input.type = iType;
  input.id = iId;
  input.name = iName;
  input.value = iValue;
  if (iChecked) input.checked = true;

  span.className = sClass + (dimmable ? ' dimmable' : '');
  span.innerHTML = sValue;

  return [label, input];
}

/**
 * @param {string} wrapperClass
 * @param {string} [inputClass]
 * @param {string} [inputStyle]
 * @param {string} [inputPattern]
 * @param {string} [inputValue]
 * @param {string} buttonText
 * @param {Function} [handler]
 * @returns {{input: Element, wrap: Element}}
 */
function inputAndGo(wrapperClass, inputClass, inputStyle, inputPattern, inputValue, buttonText, handler) {
  const wrap = div(wrapperClass);

  const input = document.createElement('input');
  if (inputClass) input.id = inputClass;
  if (inputStyle) input.style = inputStyle;
  if (inputPattern) input.pattern = inputPattern;
  if (inputValue) input.value = inputValue;
  wrap.appendChild(input);

  const go = document.createElement('button');
  go.innerHTML = buttonText;
  if (handler) go.addEventListener('pointerup', handler);
  wrap.appendChild(go);

  return {wrap, input};
}

/**
 * @param {string} type
 * @param {string} name
 * @param {string} value
 * @param {string} text
 * @param {string} [id]
 * @param {boolean} [checked]
 * @returns {HTMLLabelElement}
 */
function labeledInput(type, name, value, text, id, checked = false) {
  const label = document.createElement('label');
  const input = document.createElement('input');
  if (id !== undefined) input.id = id;
  input.type = type;
  input.name = name;
  input.value = value;
  if (checked) input.checked = true;
  label.appendChild(input);
  label.appendChild(document.createTextNode(text));

  return label;
}

/**
 * @param {LocalState} L
 * @returns {Element}
 */
function menuTurn(L) {
  const turn = fieldset('Turn ');
  turn.style = 'float: left';

  const sml = document.createElement('small');
  sml.innerHTML = '( ↻ flip board ↻ )';
  sml.className = 'flipper';
  sml.addEventListener('pointerup', () => {
    // Very rudimentary but... super effective :D
    for (let i = L.html.board.children.length - 1; i>=0; --i) {
      L.html.board.appendChild(L.html.board.children[i]);
    }
  });
  // Bit of a hack but the whole link thing is a hack (:
  turn.children[0].appendChild(sml);

  const [labelW, inputW] = toggle('turn_input', 'radio', '', `turn_${L.uid}`, 'white', true, 'turn_button', 'white');
  div('turn_block', turn, labelW);
  const [labelB, inputB] = toggle('turn_input', 'radio', '', `turn_${L.uid}`, 'black', true, 'turn_button', 'black');
  div('turn_block', turn, labelB);

  L.html.turnWhite = inputW;
  L.html.turnBlack = inputB;

  return turn;
}

/**
 * @param {LocalState} L
 * @returns {Element}
 */
function menuCastling(L) {
  const castling = fieldset('Castling');

  const [labelQW, inputQW] = toggle('turn_input', 'checkbox', '', '', '', true, 'turn_button', 'White<br/>Queenside', true);
  const [labelKW, inputKW] = toggle('turn_input', 'checkbox', '', '', '', true, 'turn_button', 'White<br/>Kingside', true);
  const [labelQB, inputQB] = toggle('turn_input', 'checkbox', '', '', '', true, 'turn_button', 'Black<br/>Queenside', true);
  const [labelKB, inputKB] = toggle('turn_input', 'checkbox', '', '', '', true, 'turn_button', 'Black<br/>Queenside', true);

  div('turn_block', castling, labelQW);
  div('turn_block', castling, labelKW);
  div('turn_block', castling, labelQB);
  div('turn_block', castling, labelKB);

  L.html.castleQueensideWhite = inputQW;
  L.html.castleKingsideWhite = inputKW;
  L.html.castleQueensideBlack = inputQB;
  L.html.castleKingsideBlack = inputKB;

  L.html.castleQueensideWhite.addEventListener('change', () => {
    L.G.castleQueensideWhite = !L.G.castleQueensideWhite;
    reflect(L);
  });
  L.html.castleKingsideWhite.addEventListener('change', () => {
    L.G.castleKingsideWhite = !L.G.castleKingsideWhite;
    reflect(L);
  });
  L.html.castleQueensideBlack.addEventListener('change', () => {
    L.G.castleQueensideBlack = !L.G.castleQueensideBlack;
    reflect(L);
  });
  L.html.castleKingsideBlack.addEventListener('change', () => {
    L.G.castleKingsideBlack = !L.G.castleKingsideBlack;
    reflect(L);
  });

  return castling;
}

/**
 * @param {LocalState} L
 * @returns {Element}
 */
function menuEnPassant(L) {
  const label = document.createElement('label');
  label.style = 'display: inline-block; margin: 5px 0;'; // TODO
  label.innerHTML = 'En passant: ';
  const input = document.createElement('input');
  input.className = 'enpassanter';
  input.pattern = 'no|[a-hA-H] ?[45]';
  input.value = 'no';
  label.appendChild(input);

  L.html.enpassant = input;

  input.addEventListener('change', e => {
    L.G.enpassant = idToIndex[String(e.target.value).toLowerCase().replace(/ /g, '')] ?? NO_CELL_I;
    reflect(L);
  });

  return label;
}

/**
 * @param {LocalState} L
 * @returns {Element}
 */
function menuFullTurn(L) {
  const label = document.createElement('label');
  label.style = 'display: inline-block; margin: 5px 0;'; // TODO
  label.innerHTML = 'Full turn: ';
  const input = document.createElement('input');
  input.className = 'enpassanter'; // TODO
  input.pattern = '\\d+';
  input.value = '1';
  label.appendChild(input);

  L.html.turns = input;

  input.addEventListener('change', e => {
    L.G.fullTurnCounter = parseInt(e.target.value, 10) || 0;
  });

  return label;
}

/**
 * @param {LocalState} L
 * @returns {Element}
 */
function menuFiftyTurnRule(L) {
  const label = document.createElement('label');
  label.style = 'display: inline-block; margin: 5px 0;'; // TODO
  label.innerHTML = '50 turn: ';
  const input = document.createElement('input');
  input.className = 'enpassanter'; // TODO
  input.pattern = '\\d+';
  input.value = '0';
  label.appendChild(input);

  L.html.turn50 = input;

  input.addEventListener('change', e => {
    L.G.fiftyTurnCounter = parseInt(e.target.value, 10) || 0;
  });

  return label;
}

/**
 * @param {LocalState} L
 * @returns {Element}
 */
function menuThreefold(L) {
  const div = document.createElement('span');
  div.innerHTML = 'Threefold repeat: ';
  const span = document.createElement('span');
  div.appendChild(span);

  L.html.three = span;

  return div;
}

/**
 * @param {LocalState} L
 * @returns {Element}
 */
function menuMaterial(L) {
  const fs = fieldset('Material');

  const divWhite = document.createElement('div');
  divWhite.innerHTML = 'White: ';
  const spanWhite = document.createElement('span');
  divWhite.appendChild(spanWhite);
  fs.appendChild(divWhite);

  const divBlack = document.createElement('div');
  divBlack.innerHTML = 'Black: ';
  const spanBlack = document.createElement('span');
  divBlack.appendChild(spanBlack);
  fs.appendChild(divBlack);

  L.html.materialWhite = spanWhite;
  L.html.materialBlack = spanBlack;

  return fs;
}

/**
 * @param {LocalState} L
 * @returns {Element}
 */
function menuCurrentGame(L) {
  const current = fieldset('Current game');

  current.appendChild(menuTurn(L));
  current.appendChild(menuCastling(L));
  div('', current, menuEnPassant(L), menuFullTurn(L))//.style = 'clear: left';
  div('', current, menuFiftyTurnRule(L), menuThreefold(L));
  current.appendChild(menuMaterial(L));

  return current;
}

/**
 * @param {LocalState} L
 * @returns {Element}
 */
function menuMoveList(L) {
  const moveList = fieldset('Move list');
  moveList.className = 'move_player'; // TODO: use better name?

  const group = div('move_player_controls', moveList);

  const bb = document.createElement('button');
  bb.className = 'move_player_button';
  bb.innerHTML = '&lt;&lt;';
  bb.addEventListener('pointerup', () => reflectHistory(L, -Infinity));
  group.appendChild(bb);

  const b = document.createElement('button');
  b.className = 'move_player_button';
  b.innerHTML = '&lt;';
  b.addEventListener('pointerup', () => reflectHistory(L, -1));
  group.appendChild(b);

  const pp = document.createElement('button');
  pp.className = 'move_player_button';
  pp.innerHTML = '▶︎/⏸';
  pp.addEventListener('pointerup', () => toggleHistoryAutoPlay(L));
  group.appendChild(pp);

  const f = document.createElement('button');
  f.className = 'move_player_button';
  f.innerHTML = '&gt;';
  f.addEventListener('pointerup', () => reflectHistory(L, 1));
  group.appendChild(f);

  const ff = document.createElement('button');
  ff.className = 'move_player_button';
  ff.innerHTML = '&gt;&gt;';
  ff.addEventListener('pointerup', () => reflectHistory(L, Infinity));
  group.appendChild(ff);

  const moves = document.createElement('pre');
  moves.style = 'color:#555;'; // TODO
  moveList.appendChild(moves);

  L.html.history = moves;

  return moveList;
}

/**
 * @param {LocalState} L
 * @returns {Element}
 */
function menuPng(L) {
  const png = fieldset('Png');

  const ta = document.createElement('textarea');
  ta.style.marginRight = '10px'; // TODO
  // Game of the century
  ta.value = `
[Event "Third Rosenwald Trophy"]
[Site "New York, NY USA"]
[Date "1956.10.17"]
[EventDate "1956.10.07"]
[Round "8"]
[Result "0-1"]
[White "Donald Byrne"]
[Black "Robert James Fischer"]
[ECO "D92"]
[PlyCount "82"]

1. Nf3 Nf6 2. c4 g6 3. Nc3 Bg7 4. d4 O-O 5. Bf4 d5 6. Qb3 dxc4
7. Qxc4 c6 8. e4 Nbd7 9. Rd1 Nb6 10. Qc5 Bg4 11. Bg5 Na4 {!} 12.
Qa3 Nxc3 13. bxc3 Nxe4 14. Bxe7 Qb6 15. Bc4 Nxc3 16. Bc5 Rfe8+
17. Kf1 Be6 18. Bxb6 Bxc4+ 19. Kg1 Ne2+ 20. Kf1 Nxd4+ 21. Kg1
Ne2+ 22. Kf1 Nc3+ 23. Kg1 axb6 24. Qb4 Ra4 25. Qxb6 Nxd1 26. h3
Rxa2 27. Kh2 Nxf2 28. Re1 Rxe1 29. Qd8+ Bf8 30. Nxe1 Bd5 31.
Nf3 Ne4 32. Qb8 b5 33. h4 h5 34. Ne5 Kg7 35. Kg1 Bc5+ 36. Kf1
Ng3+ 37. Ke1 Bb4+ 38. Kd1 Bb3+ 39. Kc1 Ne2+ 40. Kb1 Nc3+ 41. Kc1
Rc2# 0-1
  `.trim();
  png.appendChild(ta);

  L.html.pgnInput = ta;

  const go = document.createElement('button');
  go.innerHTML = 'Load png';
  go.addEventListener('pointerup', () => loadPgn(L, L.html.pgnInput.value));
  png.appendChild(go);

  return png;
}

/**
 * @param {LocalState} L
 * @returns {Element}
 */
function menuFen(L) {
  const fen = fieldset('FEN');

  const {wrap, input} = inputAndGo('fen_input_wrapper', 'fen_input', 'width: 350px;', '([rnbqkpRNBQKP1-8\\/]+){8} [wb] [KQkq\\-]+ (-|[a-h][1-8]) \\d+ \\d+', '', 'Load', () => {
    L.G = parseFen(L.html.fenInput.value);
    reflect(L);
  });
  fen.appendChild(wrap);

  L.html.fenInput = input;

  const wrap2 = div('fen_input', fen);
  wrap2.style = 'margin-top: 5px;';
  wrap2.innerHTML = 'Current: ';

  const current = document.createElement('input');
  current.className = 'fen_current';
  wrap2.appendChild(current);

  L.html.fenCurrent = current;

  return fen;
}

/**
 * @param {LocalState} L
 * @returns {Element}
 */
function menuPromotion(L) {
  const promo = fieldset('Promotion');

  promo.appendChild(labeledInput('radio', `promo_${L.uid}`, 'queen', ' queen', undefined, true));
  promo.appendChild(labeledInput('radio', `promo_${L.uid}`, 'rook', ' rook'));
  promo.appendChild(labeledInput('radio', `promo_${L.uid}`, 'bishop', ' bishop'));
  promo.appendChild(labeledInput('radio', `promo_${L.uid}`, 'knight', ' knight'));
  promo.appendChild(labeledInput('radio', `promo_${L.uid}`, 'fail', ' (fail)'));

  promo.addEventListener('change', () => {
    L.G.promotionDefault = document.querySelector(`input[name=promo_${L.uid}]:checked`).value;
  });

  return promo;
}

/**
 * @param {LocalState} L
 * @returns {Element}
 */
function menuValidation(L) {
  const fs = fieldset('Move validation enforcement');

  fs.appendChild(labeledInput('radio', `validation_${L.uid}`, 'none', ' none '));
  fs.appendChild(labeledInput('radio', `validation_${L.uid}`, 'strict', ' strict ', undefined, true));
  const showAll = fs.appendChild(labeledInput('checkbox', '', '', ' Show all pseudo moves', '$show_pseudo_moves', true));

  fs.addEventListener('change', () => {
    L.validationMode = document.querySelector(`input[name=validation_${L.uid}]:checked`).value;
  });

  showAll.addEventListener('change', () => reflect(L.G));

  return fs;
}

/**
 * @param {LocalState} L
 * @returns {Element}
 */
function menuLayers(L) {
  const layers = fieldset('Layer view');

  layers.appendChild(labeledInput('radio', `underlay_${L.uid}`, 'none', ' none'));
  layers.appendChild(document.createTextNode(' '));
  layers.appendChild(labeledInput('radio', `underlay_${L.uid}`, 'can_move', ' canMove', undefined, true));
  layers.appendChild(document.createTextNode(' '));
  layers.appendChild(labeledInput('radio', `underlay_${L.uid}`, 'filled', ' filled'));
  layers.appendChild(document.createTextNode(' '));
  layers.appendChild(labeledInput('radio', `underlay_${L.uid}`, 'white', ' white'));
  layers.appendChild(document.createTextNode(' '));
  layers.appendChild(labeledInput('radio', `underlay_${L.uid}`, 'black', ' black'));
  layers.appendChild(document.createTextNode(' '));
  layers.appendChild(labeledInput('radio', `underlay_${L.uid}`, 'pawns', ' pawns'));
  layers.appendChild(document.createTextNode(' '));
  layers.appendChild(labeledInput('radio', `underlay_${L.uid}`, 'kings', ' kings'));
  layers.appendChild(document.createTextNode(' '));
  layers.appendChild(labeledInput('radio', `underlay_${L.uid}`, 'queens', ' queens'));
  layers.appendChild(document.createTextNode(' '));
  layers.appendChild(labeledInput('radio', `underlay_${L.uid}`, 'knights', ' knights'));
  layers.appendChild(document.createTextNode(' '));
  layers.appendChild(labeledInput('radio', `underlay_${L.uid}`, 'bishops', ' bishops'));
  layers.appendChild(document.createTextNode(' '));
  layers.appendChild(labeledInput('radio', `underlay_${L.uid}`, 'rooks', ' rooks'));
  layers.appendChild(document.createTextNode(' '));
  layers.appendChild(labeledInput('radio', `underlay_${L.uid}`, 'is_checked_white', ' isChecked.white'));
  layers.appendChild(document.createTextNode(' '));
  layers.appendChild(labeledInput('radio', `underlay_${L.uid}`, 'is_checked_black', ' isChecked.black'));

  layers.addEventListener('change', () => {
    S.currentOverlay = document.querySelector(`input[name=underlay_${L.uid}]:checked`).value;
    reflect(L);
  });

  return layers;
}

/**
 * @param {LocalState} L
 * @returns {Element}
 */
function menuCellIdHint(L) {
  const layers = fieldset('Cell ID hint');

  layers.appendChild(labeledInput('radio', `cell_id_${L.uid}`, 'cell_id_none', ' none', undefined, true));
  layers.appendChild(labeledInput('radio', `cell_id_${L.uid}`, 'cell_id_index', ' index'));
  layers.appendChild(labeledInput('radio', `cell_id_${L.uid}`, 'cell_id_coord', ' coord'));
  layers.appendChild(labeledInput('radio', `cell_id_${L.uid}`, 'cell_id_both', ' both'));

  layers.addEventListener('change', () => {
    L.html.root.classList.remove('cell_id_coord', 'cell_id_index', 'cell_id_both', 'cell_id_none');
    L.html.root.classList.add(document.querySelector(`input[name=cell_id_${L.uid}]:checked`).value);
  });

  return layers;
}

/**
 * @param {LocalState} L
 * @returns {Element}
 */
function menuArrowControl(L) {
  const layers = fieldset('Arrow drawing');

  layers.appendChild(labeledInput('radio', `auto_arrow_remove_${L.uid}`, 'none', ' none'));
  layers.appendChild(labeledInput('radio', `auto_arrow_remove_${L.uid}`, 'select', ' after cell select', undefined, true));
  layers.appendChild(labeledInput('radio', `auto_arrow_remove_${L.uid}`, 'move', ' after any move'));

  layers.addEventListener('change', () => {
    S.autoArrowClear = document.querySelector(`input[name=auto_arrow_remove_${L.uid}]:checked`).value;
  });

  const button = document.createElement('button');
  button.innerHTML = 'clear arrows now';
  button.style = 'margin-top: 10px;'; // TODO
  button.addEventListener('pointerup', () => clearArrows(L));
  layers.appendChild(document.createElement('br'));
  layers.appendChild(button);


  return layers;
}

/**
 * @param {LocalState} L
 * @returns {Element}
 */
function menuFenPresets(L) {
  const presets = fieldset('FEN presets');

  presets.appendChild(inputAndGo('', '', 'width: 350px;', '([rnbqkpRNBQKP1-8\\/]+){8} [wb] [KQkq\\-]+ (-|[a-h][1-8]) \\d+ \\d+', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', 'start').wrap);
  presets.appendChild(inputAndGo('', '', 'width: 350px;', '([rnbqkpRNBQKP1-8\\/]+){8} [wb] [KQkq\\-]+ (-|[a-h][1-8]) \\d+ \\d+', 'rnbq1bnr/pppppppp/8/4Q3/3k4/8/PPPPPPPP/RNB1KBNR b KQ - 0 1', 'queen ray check over').wrap);
  presets.appendChild(inputAndGo('', '', 'width: 350px;', '([rnbqkpRNBQKP1-8\\/]+){8} [wb] [KQkq\\-]+ (-|[a-h][1-8]) \\d+ \\d+', 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1', 'castling').wrap);
  presets.appendChild(inputAndGo('', '', 'width: 350px;', '([rnbqkpRNBQKP1-8\\/]+){8} [wb] [KQkq\\-]+ (-|[a-h][1-8]) \\d+ \\d+', 'rnbqk1nr/pppppppp/4b3/8/8/4B3/PPPPPPPP/RN1QKBNR b KQkq - 0 1', 'regression').wrap);
  presets.appendChild(inputAndGo('', '', 'width: 350px;', '([rnbqkpRNBQKP1-8\\/]+){8} [wb] [KQkq\\-]+ (-|[a-h][1-8]) \\d+ \\d+', 'rnbq1bnr/ppp2ppp/8/k2pP3/p7/8/PPPP1PPP/RNBQKBNR b - d5 0 2', 'en-passant').wrap);
  presets.appendChild(inputAndGo('', '', 'width: 350px;', '([rnbqkpRNBQKP1-8\\/]+){8} [wb] [KQkq\\-]+ (-|[a-h][1-8]) \\d+ \\d+', 'r1p1k1n1/1p1p1p1p/p1b1p1p1/1n1q1b1r/R1B1K1N1/1P1P1P1P/P1P1P1P1/1N1Q1B1R b q - 2 10', 'stress?').wrap);
  presets.appendChild(inputAndGo('', '', 'width: 350px;', '([rnbqkpRNBQKP1-8\\/]+){8} [wb] [KQkq\\-]+ (-|[a-h][1-8]) \\d+ \\d+', '4k3/8/q1q1q3/8/q3q3/8/q1q1q3/4K3 b - - 6 7', 'queened').wrap);
  presets.appendChild(inputAndGo('', '', 'width: 350px;', '([rnbqkpRNBQKP1-8\\/]+){8} [wb] [KQkq\\-]+ (-|[a-h][1-8]) \\d+ \\d+', 'rnb2bn1/ppp1pppp/7Q/4KQ1r/8/2p3k1/1PPPPPPP/RNBQ1BNR b - - 0 6', 'pgn').wrap);

  presets.addEventListener('pointerup', e => {
    if (e.target.previousElementSibling?.value) {
      L.G = parseFen(e.target.previousElementSibling.value);
      reflect(L);
    }
  });

  return presets;
}

/**
 * @param {LocalState} L
 * @returns {Element}
 */
function menuThreeStatus(L) {
  const thresh = fieldset('Threefold hash');

  const label = document.createElement('label');

  const input = document.createElement('input');
  input.style = 'width: 350px;';
  label.appendChild(input);

  L.html.thresh = input;

  thresh.appendChild(label);

  return thresh;
}

/**
 * @param {LocalState} L
 * @returns {Element}
 */
function menuPly(L) {
  const ply = fieldset('Ply executor');

  const label = document.createElement('label');
  label.innerHTML = 'AN move: ';

  const input = document.createElement('input');
  input.style = 'width: 50px;';
  input.value = 'e4';
  label.appendChild(input);
  ply.appendChild(label);

  const dry = document.createElement('button');
  dry.innerHTML = 'dry';
  dry.addEventListener('pointerup', e => {
    const ply = parsePgnPly(e.target.parentNode.querySelector('input').value, L.G.turnWhite);
    console.log('ply:', ply);
    const source = findSourceCellFromPgnMove(L.G, true, ply.piece, ply.to, ply.fromFile, ply.fromRank);
    console.log('Move is a', ply.piece, 'from', indexToId[source.i], '(', source, ') to', ply.to);
  });
  ply.appendChild(dry);

  const wet = document.createElement('button');
  wet.innerHTML = 'Apply';
  wet.addEventListener('pointerup', e => {
    const ply = parsePgnPly(e.target.parentNode.querySelector('input').value, L.G.turnWhite);
    const source = findSourceCellFromPgnMove(L.G, true, ply.piece, ply.to, ply.fromFile, ply.fromRank);
    makeCompleteMoveIncHistory(L, source.i, idToIndex[ply.to], source.n);
    if (S.autoArrowClear === 'move' || S.autoArrowClear === 'move') clearArrows(L);
    reflect(L);
  });
  ply.appendChild(wet);

  return ply;
}

/**
 * @param {LocalState} L
 * @returns {Element}
 */
function menuDebug(L) {
  const debug = fieldset('Debug');

  debug.appendChild(menuValidation(L));
  debug.appendChild(menuLayers(L));
  debug.appendChild(menuCellIdHint(L));
  debug.appendChild(menuArrowControl(L));
  debug.appendChild(menuFenPresets(L));
  debug.appendChild(menuThreeStatus(L));
  debug.appendChild(menuPly(L));

  return debug;
}

/**
 * @param {LocalState} L
 * @returns {Element}
 */
function createMenuHtml(L) {
  const menu = div('menu');

  menu.appendChild(menuCurrentGame(L));
  menu.appendChild(menuMoveList(L));
  menu.appendChild(menuPng(L));
  menu.appendChild(menuFen(L));
  menu.appendChild(menuPromotion(L));
  menu.appendChild(menuDebug(L));

  return menu;
}

/**
 * @param {LocalState} L
 * @returns {Element}
 */
function createMenu(L) {
  const menu = createMenuHtml(L);
  document.body.appendChild(menu);
}
