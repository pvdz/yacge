function div(cls = '', parent, ...children) {
  const div = document.createElement('div');
  if (cls) div.className = cls;
  if (parent) parent.appendChild(div);
  children.forEach(e => div.appendChild(e));
  return div;
}

function fieldset(legend, parent) {
  const fs = document.createElement('fieldset');
  fs.appendChild(document.createElement('legend')).innerHTML = legend;
  if (parent) parent.appendChild(fs);
  return fs;
}

function toggle(iClass, iType, iId, iName, iValue, iChecked, sClass, sValue, dimmable) {
  // <label><input class="turn_input" type="radio" id="$turnWhite" name="turn" value="white" checked/><span class="turn_button">white</span></label>
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

  return label;
}

function inputAndGo(wrapperClass, inputClass, inputId, inputStyle, inputPattern, inputValue, buttonText, handler) {
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

  return wrap;
}

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

function menuTurn() {
  const turn = fieldset('Turn');
  //turn.id = '$turn';
  turn.style.float = 'left';
  div('turn_block', turn, toggle('turn_input', 'radio', '$turnWhite', 'turn', 'white', true, 'turn_button', 'white'));
  div('turn_block', turn, toggle('turn_input', 'radio', '$turnBlack', 'turn', 'black', false, 'turn_button', 'black'));

  return turn;
}

function menuCastling() {
  const castling = fieldset('Castling');
  //turn.id = '$castling';
  div('turn_block', castling, toggle('turn_input', 'checkbox', '$castleQueensideWhite', '', '', true, 'turn_button', 'White<br/>Queenside', true));
  div('turn_block', castling, toggle('turn_input', 'checkbox', '$castleKingsideWhite', '', '', true, 'turn_button', 'White<br/>Kingside', true));
  div('turn_block', castling, toggle('turn_input', 'checkbox', '$castleQueensideBlack', '', '', true, 'turn_button', 'Black<br/>Queenside', true));
  div('turn_block', castling, toggle('turn_input', 'checkbox', '$castleKingsideBlack', '', '', true, 'turn_button', 'Black<br/>Kingside', true));

  castling.addEventListener('change', e => {
    if (e.target.id) {
      L.G[e.target.id.slice(1)] = !L.G[e.target.id.slice(1)];
      reflect(L.G);
    }
  });

  return castling;
}

function menuEnPassant() {
  const label = document.createElement('label');
  label.style = 'display: inline-block; margin: 5px 0;'; // TODO
  label.innerHTML = 'En passant: ';
  const input = document.createElement('label');
  input.id = '$enpassant';
  input.className = 'enpassanter';
  input.pattern = 'no|[a-hA-H] ?[45]';
  input.value = 'no';
  label.appendChild(input);

  input.addEventListener('change', e => {
    L.G.enpassant = idToIndex[String(e.target.value).toLowerCase().replace(/ /g, '')] ?? NO_CELL_I;
    reflect(L.G);
  });

  return label;
}

function menuFullTurn() {
  const label = document.createElement('label');
  label.style = 'display: inline-block; margin: 5px 0;'; // TODO
  label.innerHTML = 'Full turn: ';
  const input = document.createElement('label');
  input.id = '$turns';
  input.className = 'enpassanter'; // TODO
  input.pattern = '\d+';
  input.value = '1';
  label.appendChild(input);

  input.addEventListener('change', e => {
    L.G.wholeTurnCounter = parseInt(e.target.value, 10) || 0;
  });

  return label;
}

function menuFiftyTurnRule() {
  const label = document.createElement('label');
  label.style = 'display: inline-block; margin: 5px 0;'; // TODO
  label.innerHTML = '50 turn: ';
  const input = document.createElement('label');
  input.id = '$turn50';
  input.className = 'enpassanter'; // TODO
  input.pattern = '\d+';
  input.value = '0';
  label.appendChild(input);

  input.addEventListener('change', e => {
    L.G.fiftyTurnCounter = parseInt(e.target.value, 10) || 0;
  });

  return label;
}

function menuThreefold() {
  const div = document.createElement('div');
  div.InnerHTML = 'Threefold repeat: ';
  const span = document.createElement('span');
  span.id = '$three';
  div.appendChild(span);

  return div;
}

function menuMaterial() {
  const fs = fieldset('Material');

  const divWhite = document.createElement('div');
  divWhite.innerHTML = 'White: ';
  const spanWhite = document.createElement('span');
  spanWhite.id = '$material_white';
  divWhite.appendChild(spanWhite);
  fs.appendChild(divWhite);

  const divBlack = document.createElement('div');
  divBlack.innerHTML = 'Black: ';
  const spanBlack = document.createElement('span');
  spanBlack.id = '$material_black';
  divBlack.appendChild(spanBlack);
  fs.appendChild(divBlack);

  return fs;
}

function menuCurrentGame() {
  const current = fieldset('Current game');

  current.appendChild(menuTurn());
  current.appendChild(menuCastling());
  div('', current, menuEnPassant(), menuFullTurn())//.style = 'clear: left';
  div('', current, menuFiftyTurnRule(), menuThreefold());
  current.appendChild(menuMaterial());

  return current;
}

function menuMoveList() {
  const moveList = fieldset('Move list');
  moveList.id = '$movePlayer';
  moveList.className = 'move_player'; // TODO: use better name?

  const group = div('move_player_controls', moveList);
  group.id = '$pngcontrols';

  const bb = document.createElement('button');
  //bb.id = '$zeropgn';
  bb.className = 'move_player_button';
  bb.innerHTML = '&lt;&lt;';
  bb.addEventListener('pointerup', e => fwdPgn(-Infinity));
  group.appendChild(bb);

  const b = document.createElement('button');
  //b.id = '$backpgn';
  b.className = 'move_player_button';
  b.innerHTML = '&lt;';
  b.addEventListener('pointerup', e => fwdPgn(-1));
  group.appendChild(b);

  const pp = document.createElement('button');
  //pp.id = '$togglepgn';
  pp.className = 'move_player_button';
  pp.innerHTML = '▶︎/⏸';
  pp.addEventListener('pointerup', e => togglePgn());
  group.appendChild(pp);

  const f = document.createElement('button');
  //f.id = '$fwdpgn';
  f.className = 'move_player_button';
  f.innerHTML = '&gt;';
  f.addEventListener('pointerup', e => fwdPgn(1));
  group.appendChild(f);

  const ff = document.createElement('button');
  //f.id = '$allpgn';
  ff.className = 'move_player_button';
  ff.innerHTML = '&gt;&gt;';
  ff.addEventListener('pointerup', e => fwdPgn(Infinity));
  group.appendChild(ff);

  const moves = document.createElement('pre');
  moves.id = '$moves';
  moves.style = 'color:#555;'; // TODO
  moveList.appendChild(moves);

  return moveList;
}

function menuPng() {
  const png = fieldset('Png');

  const ta = document.createElement('textarea');
  ta.id = '$pgn';
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

  const go = document.createElement('button');
  go.id = '$initpgn';
  go.innerHTML = 'Load png';
  go.addEventListener('pointerup', e => initPgn($pgn.value));
  png.appendChild(go);

  return png;
}

function menuFen() {
  const fen = fieldset('FEN');

  const wrap = inputAndGo('fen_input_wrapper', 'fen_input', '$fen_input', 'width: 350px;', '([rnbqkpRNBQKP1-8\\/]+){8} [wb] [KQkq\\-]+ (-|[a-h][1-8]) \\d+ \\d+', '', 'Load', e => reflect(parseFen($fen_input.value)));
  fen.appendChild(wrap);

  const wrap2 = div('fen_input', fen);
  wrap2.innerHTML = 'Current: ';

  const current = document.createElement('input');
  current.id = '$fennow';
  current.className = 'fen_current';
  wrap2.appendChild(current);

  return fen;
}

function menuPromotion() {
  const promo = fieldset('Promotion');

  promo.appendChild(labeledInput('radio', 'promo', 'queen', ' queen', undefined, true));
  promo.appendChild(labeledInput('radio', 'promo', 'rook', ' rook'));
  promo.appendChild(labeledInput('radio', 'promo', 'bishop', ' bishop'));
  promo.appendChild(labeledInput('radio', 'promo', 'knight', ' knight'));
  promo.appendChild(labeledInput('radio', 'promo', 'fail', ' (fail)'));

  promo.addEventListener('change', () => {
    L.G.promotionDefault = document.querySelector('input[name=promo]:checked').value;
  });

  return promo;
}

function menuValidation() {
  const fs = fieldset('Move validation enforcement');

  fs.appendChild(labeledInput('radio', 'validation', 'none', ' none '));
  fs.appendChild(labeledInput('radio', 'validation', 'strict', ' strict ', undefined, true));
  const showAll = fs.appendChild(labeledInput('checkbox', '', '', ' Show all pseudo moves', '$show_pseudo_moves', true));

  fs.addEventListener('change', e => {
    L.validationMode = document.querySelector('input[name=validation]:checked').value;
  });

  showAll.addEventListener('change', e => reflect(L.G));

  return fs;
}

function menuLayers() {
  const layers = fieldset('Layer view');

  layers.appendChild(labeledInput('radio', 'underlay', 'none', ' none'));
  layers.appendChild(document.createTextNode(' '));
  layers.appendChild(labeledInput('radio', 'underlay', 'can_move', ' canMove', undefined, true));
  layers.appendChild(document.createTextNode(' '));
  layers.appendChild(labeledInput('radio', 'underlay', 'filled', ' filled'));
  layers.appendChild(document.createTextNode(' '));
  layers.appendChild(labeledInput('radio', 'underlay', 'white', ' white'));
  layers.appendChild(document.createTextNode(' '));
  layers.appendChild(labeledInput('radio', 'underlay', 'black', ' black'));
  layers.appendChild(document.createTextNode(' '));
  layers.appendChild(labeledInput('radio', 'underlay', 'pawns', ' pawns'));
  layers.appendChild(document.createTextNode(' '));
  layers.appendChild(labeledInput('radio', 'underlay', 'kings', ' kings'));
  layers.appendChild(document.createTextNode(' '));
  layers.appendChild(labeledInput('radio', 'underlay', 'queens', ' queens'));
  layers.appendChild(document.createTextNode(' '));
  layers.appendChild(labeledInput('radio', 'underlay', 'knights', ' knights'));
  layers.appendChild(document.createTextNode(' '));
  layers.appendChild(labeledInput('radio', 'underlay', 'bishops', ' bishops'));
  layers.appendChild(document.createTextNode(' '));
  layers.appendChild(labeledInput('radio', 'underlay', 'rooks', ' rooks'));
  layers.appendChild(document.createTextNode(' '));
  layers.appendChild(labeledInput('radio', 'underlay', 'is_checked_white', ' isChecked.white'));
  layers.appendChild(document.createTextNode(' '));
  layers.appendChild(labeledInput('radio', 'underlay', 'is_checked_black', ' isChecked.black'));

  layers.addEventListener('change', e => {
    S.currentOverlay = document.querySelector('input[name=underlay]:checked').value;
    reflect(L.G);
  });

  return layers;
}

function menuCellIdHint() {
  const layers = fieldset('Cell ID hint');

  layers.appendChild(labeledInput('radio', 'cell_id', 'cell_id_none', ' none', undefined, true));
  layers.appendChild(labeledInput('radio', 'cell_id', 'cell_id_index', ' index'));
  layers.appendChild(labeledInput('radio', 'cell_id', 'cell_id_coord', ' coord'));
  layers.appendChild(labeledInput('radio', 'cell_id', 'cell_id_both', ' both'));

  layers.addEventListener('change', e => {
    $board.classList.remove('cell_id_coord', 'cell_id_index', 'cell_id_both', 'cell_id_none');
    $board.classList.add(document.querySelector('input[name=cell_id]:checked').value);
  });

  return layers;
}

function menuArrowControl() {
  const layers = fieldset('Cell ID hint');

  layers.appendChild(labeledInput('radio', 'auto_arrow_remove', 'none', ' none'));
  layers.appendChild(labeledInput('radio', 'auto_arrow_remove', 'select', ' after cell select', undefined, true));
  layers.appendChild(labeledInput('radio', 'auto_arrow_remove', 'move', ' after any move'));

  layers.addEventListener('change', e => {
    S.autoArrowClear = document.querySelector('input[name=auto_arrow_remove]:checked').value;
  });

  const button = document.createElement('button');
  button.innerHTML = 'clear arrows now';
  button.style = 'margin-top: 10px;'; // TODO
  button.addEventListener('pointerup', () => clearArrows());
  layers.appendChild(document.createElement('br'));
  layers.appendChild(button);


  return layers;
}

function menuFenPresets() {
  const presets = fieldset('Cell ID hint');
  //presets.id = '$fens'; // TODO

  presets.appendChild(inputAndGo('', '', '$fen1', 'width: 350px;', '([rnbqkpRNBQKP1-8\\/]+){8} [wb] [KQkq\\-]+ (-|[a-h][1-8]) \\d+ \\d+', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', 'start'));
  presets.appendChild(inputAndGo('', '', '$fen2', 'width: 350px;', '([rnbqkpRNBQKP1-8\\/]+){8} [wb] [KQkq\\-]+ (-|[a-h][1-8]) \\d+ \\d+', 'rnbq1bnr/pppppppp/8/4Q3/3k4/8/PPPPPPPP/RNB1KBNR b KQ - 0 1', 'queen ray check over'));
  presets.appendChild(inputAndGo('', '', '$fen3', 'width: 350px;', '([rnbqkpRNBQKP1-8\\/]+){8} [wb] [KQkq\\-]+ (-|[a-h][1-8]) \\d+ \\d+', 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1', 'castling'));
  presets.appendChild(inputAndGo('', '', '$fen4', 'width: 350px;', '([rnbqkpRNBQKP1-8\\/]+){8} [wb] [KQkq\\-]+ (-|[a-h][1-8]) \\d+ \\d+', 'rnbqk1nr/pppppppp/4b3/8/8/4B3/PPPPPPPP/RN1QKBNR b KQkq - 0 1', 'regression'));
  presets.appendChild(inputAndGo('', '', '$fen5', 'width: 350px;', '([rnbqkpRNBQKP1-8\\/]+){8} [wb] [KQkq\\-]+ (-|[a-h][1-8]) \\d+ \\d+', 'rnbq1bnr/ppp2ppp/8/k2pP3/p7/8/PPPP1PPP/RNBQKBNR b - d5 0 2', 'en-passant'));
  presets.appendChild(inputAndGo('', '', '$fen6', 'width: 350px;', '([rnbqkpRNBQKP1-8\\/]+){8} [wb] [KQkq\\-]+ (-|[a-h][1-8]) \\d+ \\d+', 'r1p1k1n1/1p1p1p1p/p1b1p1p1/1n1q1b1r/R1B1K1N1/1P1P1P1P/P1P1P1P1/1N1Q1B1R b q - 2 10', 'stress?'));
  presets.appendChild(inputAndGo('', '', '$fen7', 'width: 350px;', '([rnbqkpRNBQKP1-8\\/]+){8} [wb] [KQkq\\-]+ (-|[a-h][1-8]) \\d+ \\d+', '4k3/8/q1q1q3/8/q3q3/8/q1q1q3/4K3 b - - 6 7', 'queened'));
  presets.appendChild(inputAndGo('', '', '$fen8', 'width: 350px;', '([rnbqkpRNBQKP1-8\\/]+){8} [wb] [KQkq\\-]+ (-|[a-h][1-8]) \\d+ \\d+', 'rnb2bn1/ppp1pppp/7Q/4KQ1r/8/2p3k1/1PPPPPPP/RNBQ1BNR b - - 0 6', 'pgn'));

  presets.addEventListener('pointerup', e => {
    if (e.target.previousElementSibling?.value) {
      reflect(parseFen(e.target.previousElementSibling.value));
    }
  });

  return presets;
}

function menuThreeStatus() {
  const thresh = fieldset('Threefold hash');

  const label = document.createElement('label');

  const input = document.createElement('input');
  input.id = '$thrash';
  input.style = 'width: 350px;';
  label.appendChild(input);

  thresh.appendChild(label);

  return thresh;
}

function menuPly() {
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
    makeMove(L.G, source.i, idToIndex[ply.to], source.n);
    reflect(L.G);
  });
  ply.appendChild(wet);

  return ply;
}

function menuDebug() {
  const debug = fieldset('Debug');

  debug.appendChild(menuValidation());
  debug.appendChild(menuLayers());
  debug.appendChild(menuCellIdHint());
  debug.appendChild(menuArrowControl());
  debug.appendChild(menuFenPresets());
  debug.appendChild(menuThreeStatus());
  debug.appendChild(menuPly());

  return debug;
}

function createMenuHtml() {
  const menu = div('menu');

  menu.appendChild(menuCurrentGame());
  menu.appendChild(menuMoveList());
  menu.appendChild(menuPng());
  menu.appendChild(menuFen());
  menu.appendChild(menuPromotion());
  menu.appendChild(menuDebug());

  return menu;
}

function createMenu() {
  const menu = createMenuHtml();
  document.body.appendChild(menu);
}
