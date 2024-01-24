import {
  FILE_MASKS,
  NO_CELL,
  NO_CELL_I,
  idToIndex,
  CELL_I_E1,
  CELL_I_C1,
  CELL_I_G1,
  CELL_I_E8,
  CELL_N_A1,
  CELL_N_D1,
  CELL_N_H1,
  CELL_N_F1,
  CELL_I_C8,
  CELL_N_A8,
  CELL_N_D8,
  CELL_I_G8,
  CELL_N_H8,
  CELL_N_F8,
  RANK_3,
  RANK_7,
  RANK_MASKS,
  indexToId,
  CELL_I_F8,
  CELL_I_F1, CELL_I_H1, CELL_I_A1, CELL_I_A8, CELL_I_H8, CELL_I_D1, CELL_I_D8
} from './constants.js';
import {whitePawnsThatCanCaptureOn, blackPawnsThatCanCaptureOn, whitePawnsThatCanMoveTo, blackPawnsThatCanMoveTo } from './pawns.js';
import {singleBitToIndex} from './single-bit.js';
import {getFenishString, getFenString} from './serialize.js';
import {knightMoves} from './knights.js';
import {kingMoves} from './kings.js';
import {$$, $$$, assert} from './utils.js';
import {displayHistory, moveHistoryPointer, reflectHistory} from './history.js';

// Some inspiration: https://www.chessprogramming.org/Bitboards

/**
 * @param G {Game}
 * @param fromi {BigInt} The index (0..63)
 * @param toi {BigInt} The index (0..63)
 * @param fromn {BigInt} A single bit is set, representing the field to move from
 * @param ton {BigInt} A single bit is set, representing the field to move to
 */
export function makeMove(G, fromi, toi, fromn = 1n << fromi, ton = 1n << toi) {
  // This function only actually moves a piece from one cell to another and updates state accordingly.
  // Note: the move may be an invalid chess move (!).
  // Note: result will not apply pawn promotion (see makeCompleteMove for that)
  // Castling and en-passant is handled explicitly
  // The result should be able to be used for "is checked" validations

  const isWhite = G.white & fromn;
  const clearToFrom = BigInt.asUintN(64, ~(fromn | ton));

  if ((G.pawns & fromn) || ((G.white | G.black) & ton)) G.fiftyTurnCounter = 0;
  else G.fiftyTurnCounter += 1;

  const isCapture = (G.white | G.black) & ton;
  const isPawnMove = G.pawns & fromn;

  if (isWhite) {
    G.black &= clearToFrom;
    G.white = (G.white & clearToFrom) | ton;
  } else {
    G.white &= clearToFrom;
    G.black = (G.black & clearToFrom) | ton;
  }

  // Whatever the state, switch the turn to the opponent color.
  G.turnWhite = !isWhite;

  // Have to confirm whether this is castling because it requires a slightly different board update.
  // There are four cases (two sides on each side of the board) and must be a king.
  // In particular, the rook from that side needs to be put to the other side of the new position of the king.

  if (G.kings & fromn) {
    // Note: we only need to update the rooks (and opp color) here. General move logic will move the king.
    if (isWhite && fromi === CELL_I_E1) {
      if (toi === CELL_I_C1) {
        // Queen side
        G.white |= CELL_N_A1 | CELL_N_D1;
        G.white ^= CELL_N_A1;
        G.rooks |= CELL_N_A1 | CELL_N_D1;
        G.rooks ^= CELL_N_A1;
      } else if (toi === CELL_I_G1) {
        // King side
        G.white |= CELL_N_H1 | CELL_N_F1;
        G.white ^= CELL_N_H1;
        G.rooks |= CELL_N_H1 | CELL_N_F1;
        G.rooks ^= CELL_N_H1;
      } else {
        // Either way, this king moved so it burned their opp to castle
        G.castleKingsideWhite = false;
        G.castleQueensideWhite = false;
      }
    } else if (!isWhite && fromi === CELL_I_E8) {
      // Note: have not explicitly asserted black to occupy e8, only that white
      // did not, so we explicitly set it first before the toggle (-> xor)
      if (toi === CELL_I_C8) {
        // Queen side
        G.black |= CELL_N_A8 | CELL_N_D8;
        G.black ^= CELL_N_A8;
        G.rooks |= CELL_N_A8 | CELL_N_D8;
        G.rooks ^= CELL_N_A8;
      } else if (toi === CELL_I_G8) {
        // King side
        G.black |= CELL_N_H8 | CELL_N_F8;
        G.black ^= CELL_N_H8;
        G.rooks |= CELL_N_H8 | CELL_N_F8;
        G.rooks ^= CELL_N_H8;
      } else {
        // Either way, this king moved so it burned their opp to castle
        G.castleKingsideBlack = false;
        G.castleQueensideBlack = false;
      }
    }
  }

  // If you move a rook, you can't castle that side
  if (G.rooks & fromn) {
    if (isWhite) {
      if (fromi === CELL_I_A1) G.castleQueensideWhite = false;
      else if (fromi === CELL_I_H1) G.castleKingsideWhite = false;
    } else {
      if (fromi === CELL_I_A8) G.castleQueensideBlack = false;
      else if (fromi === CELL_I_H8) G.castleKingsideBlack = false;
    }
  }

  // Check for en passant when capturing with pawn.
  // We could assert that an empty capture implies en passant capture. But it's too ugly and hacky.
  if (isPawnMove && !isCapture) {
    const dx = (fromi - toi) % 8n;
    let removePasser = true;
    if (fromi + 1n === G.enpassant && dx === -1n) {
      //console.log('capturing en-passant up-left');
    } else if (fromi - 1n === G.enpassant && dx === -7n) {
      //console.log('capturing en-passant up-right');
    } else if (fromi + 1n === G.enpassant && dx === 7n) {
      //console.log('capturing en-passant down-left');
    } else if (fromi - 1n === G.enpassant && dx === 1n) {
      //console.log('capturing en-passant down-right');
    } else {
      // Not capturing en passant
      removePasser = false;
    }
    if (removePasser) {
      // Must remove the pawn that tried to pass
      const epn = 1n << G.enpassant;
      G.pawns = (G.pawns | epn) ^ epn;
      if (isWhite) G.black = (G.black | epn) ^ epn;
      else G.white = (G.white | epn) ^ epn;
    }
  }

  // Track a pawn "two square advance", moving two cells from any starting position, if so store it in the en-passant state
  G.enpassant = NO_CELL_I;
  if (isPawnMove) {
    if (isStartingEnPassant(fromi, toi)) {
      // (We don't need to store the pawn for black and white at the same time so use same storage for them)
      G.enpassant = toi;
    }
  }

  // Check which piece is being moved and then unset the `from` cell and set the `to` cell for that state

  G.kings = (G.kings & fromn ? ton : 0n) | (G.kings & clearToFrom);
  G.queens = (G.queens & fromn ? ton : 0n) | (G.queens & clearToFrom);
  G.rooks = (G.rooks & fromn ? ton : 0n) | (G.rooks & clearToFrom);
  G.knights = (G.knights & fromn ? ton : 0n) | (G.knights & clearToFrom);
  G.bishops = (G.bishops & fromn ? ton : 0n) | (G.bishops & clearToFrom);
  G.pawns = (G.pawns & fromn ? ton : 0n) | (G.pawns & clearToFrom);
}

/**
 * @param G {Game}
 * @param fromi {BigInt} The index (0..63)
 * @param toi {BigInt} The index (0..63)
 * @param fromn {BigInt} A single bit is set, representing the field to move from
 * @param ton {BigInt} A single bit is set, representing the field to move to
 * @param promotionDefault {'' | 'queen' | 'rook' | 'knight' | 'bishop'}
 */
export function makeCompleteMove(G, fromi, toi, fromn = 1n << fromi, ton = 1n << toi, promotionDefault = '', updateThreefold = true) {
  const isWhite = G.white & fromn;
  const wasWhiteTurn = G.turnWhite;
  const isPawnMove = G.pawns & fromn;

  if (isWhite && !wasWhiteTurn) G.fullTurnCounter += 1; // Illegal but if mode is enabled, back to back same color moves should increment counter too

  makeMove(G, fromi, toi, fromn, ton);

  // Track pawn promotion
  if (isPawnMove) {
    // We need to apply promotion when a pawn reaches the back rank. The `from` does not matter.
    if (isWhite ? (toi >= 56n && toi <= 63n) : (toi >= 0n && toi <= 7n)) {
      // it was a beautiful butterfly
      if (promotionDefault) {
        // Leave the color, scrub the pawn from the `toi` cell, add a <piece> to the `toi` cell. We know it was set above.
        G.pawns ^= ton;
        if (promotionDefault === 'queen') G.queens |= ton;
        else if (promotionDefault === 'rook') G.rooks |= ton;
        else if (promotionDefault === 'knight') G.knights |= ton;
        else if (promotionDefault === 'bishop') G.bishops |= ton;
        else FIXME;
      } else {
        // Look, this was never meant to be a full fledged board. What can I say.
        console.log('Going to crash now because there is no promotion popup and no default piece was given. oopsie.');
        TODO // ask.
      }
    } else {
      // Not promotion
    }
  }

  if (!isWhite) G.fullTurnCounter += 1; // A "whole" turn is both players. The full move counter flips after every move by black.
  if (updateThreefold) recordBoardState(G);
  G.prevFrom = fromi;
  G.prevTo = toi;
}

/**
 * @param L {LocalState}
 * @param fromi {BigInt} The index (0..63)
 * @param toi {BigInt} The index (0..63)
 * @param fromn {BigInt} A single bit is set, representing the field to move from
 * @param ton {BigInt} A single bit is set, representing the field to move to
 * @param promotionDefault {'' | 'queen' | 'rook' | 'knight' | 'bishop'}
 */
export function makeCompleteMoveIncHistory(L, fromi, toi, fromn = 1n << fromi, ton = 1n << toi, promotionDefault = '') {
  // console.log('-->', L.history.index, L.history.moves[L.history.index + 1])
  // const prev = L.history.moves[L.history.index + 1];

  const next = L.history.moves[L.history.index + 1];
  if (next?.from === indexToId[fromi] && next?.to === indexToId[toi]) {
    // Same move as next in the move list; just move the pointer...
    console.log('Only moving history');
    reflectHistory(L, 1);
  } else {
    L.history.moves.length = L.history.index + 1;
    const fromWhiteCell = (L.G.white & fromn) > 0n;
    makeCompleteMove(L.G, fromi, toi, fromn, ton, promotionDefault);
    // Note: the full turn is flaky when moving the same color twice (in particular for white). Black always flips after the move so we subtract one.
    const move = {turn: L.G.fullTurnCounter - (fromWhiteCell ? 0 : 1), fen: getFenString(L.G), white: fromWhiteCell, from: indexToId[fromi], to: indexToId[toi], piece: '?', an: '??'};
    L.history.moves.push(move);
    moveHistoryPointer(L, 1);
    displayHistory(L);
  }
}

/**
 * @param {Game} G
 * @param {boolean} forWhite
 * @param {string} piece
 * @param {string} tos
 * @param {string} fromFile
 * @param {string} fromRank
 * @param {boolean} [debug]
 * @returns {{i: BigInt, n: BigInt}}
 */
export function findSourceCellFromPgnMove(G, forWhite, piece, tos, fromFile, fromRank, debug = false) {
  if (debug) console.log('findSourceCellFromPgnMove:', 'white:', forWhite, ', to:', tos, ', file hint:', fromFile, ', rank hint:', fromRank)
  // Given a game move relative to the current state of the game (PGN), resolve the source cell from which the move starts.
  // More complicated than it needs to be.

  // http://www6.chessclub.com/help/PGN-spec -> pgn viewers must be worst case pedantic. If an ambiguity arises with one of the two pieces pinned (unable to capture), it is not considered ambiguous.
  // -> https://www.chessclub.com/help/PGN-spec
  // https://chess.stackexchange.com/questions/1864/is-this-case-considered-an-ambiguity-or-not
  // https://chess.stackexchange.com/questions/1817/how-are-pgn-ambiguities-handled

  /**
   * @type {BigInt}
   */
  const turnMask = forWhite ? G.white : G.black;
  /**
   * @type {BigInt}
   */
  const oppoMask = forWhite ? G.black : G.white;

  const toi = idToIndex[tos];
  const ton = 1n << toi;

  switch (piece) {
    case 'P': {
      // Find the pawn of given color that can move to given coordinate. Have to check moves and captures. Only assume disambiguation when there are actually more than one possible.
      const pawns = G.pawns & turnMask;
      if (debug) console.log(forWhite ? 'White' : 'Black', 'pawns:', $$(pawns));
      // If the target cell is taken then it must be the opponent (for otherwise the move is illegal)
      // If the cell is taken, we only consider possible attacking pawns. Otherwise we only consider possible moving pawns.
      const capturing = oppoMask & ton;
      if (debug) console.log('To cell taken?', Boolean(capturing), $$(capturing));
      const eligible = (forWhite ? (capturing ? whitePawnsThatCanCaptureOn[toi] : whitePawnsThatCanMoveTo[toi]) : (capturing ? blackPawnsThatCanCaptureOn[toi] : blackPawnsThatCanMoveTo[toi]));
      if (debug) console.log('Eligibility mask:', $$(eligible));
      const candidates = eligible & pawns;
      if (debug) console.log('Candidate', forWhite ? 'white' : 'black', 'pawns:', $$(candidates), ', for a', capturing ? 'capture' : 'move');
      // We now have at most two pawns to choose from.
      // - When there's one pawn, that's the one we must use, period
      // - When moving, we simply take the pawn closest to the target cell, period.
      //   - If not a single bit result then mask with the third or sixth rank to confirm that it's occupied. That should tell us enough.
      // - When capturing, the fromFile should be set so we don't need to disambiguate any further
      if (capturing) {
        assert(Boolean(fromFile), true, 'pawn capturing should have a fromFile annotation');
        const fileMask = FILE_MASKS[fromFile.toLowerCase()];
        if (debug) console.log('fileMask:', $$(fileMask));
        assert(Boolean(fileMask !== undefined), true, 'the from file should be a-h');
        const target = candidates & fileMask;
        if (debug) console.log('target:', $$(target));
        const index = singleBitToIndex.get(target);
        if (debug) console.log('index:', $$(index));
        assert(Boolean(index !== undefined), true, 'should now have a single bit');
        return {i: index, n: target};
      } else {
        const maybeTarget = singleBitToIndex.get(candidates);
        if (debug) console.log('Single bit index of', candidates, ':', maybeTarget);
        if (maybeTarget === undefined) {
          // So this is a doubled pawn on the second and third rank and the third rank is moving forward. Get the third rank.
          const rank = forWhite ? RANK_3 : RANK_7;
          const target = candidates & rank;
          if (debug) console.log('doubled pawn:', $$(candidates), '\nand', $$(rank), '\nis', $$(target))
          const index = singleBitToIndex.get(target);
          assert(Boolean(index !== undefined), true, 'should now have a single bit');
          return {i: index, n: target};
        } else {
          return {i: maybeTarget, n: candidates};
        }
      }
    }

    case 'K': {
      // In general a player only ever has one king and there is no legal way of obtaining more than one.
      // If the game does have multiple, we should try to just move the first one, or if there's a "from" coordinate, just use that verbatim.

      if (debug) console.log('turnmask', $$(turnMask))
      let kings = G.kings & turnMask;
      if (debug) console.log('a', $$(kings))
      const only = singleBitToIndex.get(kings);
      if (debug) console.log('b', $$(only))
      if (only !== undefined) {
        // This is the common case. Anything else is not an actual game of chess.
        return {i: only, n: kings};
      }

      // Try to reduce the number of kings by looking at realistic valid moves
      kings = kings & kingMoves[toi];
      if (debug) console.log('step1:', $$(kings));
      if (fromFile) kings &= FILE_MASKS[fromFile.toLowerCase()];
      if (debug) console.log('step2:', $$(kings));
      if (fromRank) kings &= RANK_MASKS[fromRank.toLowerCase()];
      if (debug) console.log('step3:', $$(kings));
      const filtered = singleBitToIndex.get(kings);
      if (debug) console.log('step4:', $$(filtered));
      if (filtered !== undefined) {
        return {i: filtered, n: kings};
      }

      throw new Error('No single king to move...? Giving up.');
    }

    case 'Q': {
      // There can be multiple queens after promotion

      let queens = G.queens & turnMask;
      const only = singleBitToIndex.get(queens);
      if (debug) console.log('Queens:', $$(queens), 'only:', only);
      if (only !== undefined) {
        // This is the common case.
        return {i: only, n: queens};
      }

      // Try to apply the disambiguation hints

      if (fromFile) queens &= FILE_MASKS[fromFile.toLowerCase()];
      if (fromRank) queens &= RANK_MASKS[fromRank.toLowerCase()];
      const filtered = singleBitToIndex.get(queens);
      if (debug) console.log('Queens filtered:', $$(queens), 'only:', filtered);
      if (filtered !== undefined) {
        return {i: filtered, n: queens};
      }

      // Despite disambiguation there are still multiple queen candidates left. Eliminate queens that are blocked or even pinned.
      // For each, check if the move would be valid. Discard queens that are invalid (like if they're pinned to the king).
      // After that we should have one queen left... We optimistically bail when we have one queen left (and assume the move is legit)

      for (let i=0n; i<64n; ++i) {
        const n = (1n << i);
        if (queens & n) {
          if (debug) console.log('Considering queen moving from', indexToId[i], 'to', indexToId[toi], $$(queens));
          const can = canQueenMove(G, i, toi, n, ton);
          if (debug) console.log('- can:', can);
          if (can !== 'ok') { // expensive
            if (can === 'blocked') if (debug) console.log('- This queen is blocked from moving to to', indexToId[toi]);
            else if (debug) console.log('- It is not valid for this queen to move to', indexToId[toi]);
            // Remove
            queens ^= n;
            if (debug) console.log('- After discarding this queen:', $$(queens));
            // Check if we have one queen _now_. Very most likely, at this point, we should be finished. And otherwise repeat :)
            const filtered = singleBitToIndex.get(queens);
            if (filtered !== undefined) {
              return {i: filtered, n: queens};
            }
            continue;
          }

          const {state, byn} = doesMoveLeaveChecked(G, forWhite, i, toi, n, ton); // expensive
          if (state === 'checked') {
            if (debug) console.log('- This queen cannot move from', indexToId[i], 'to', indexToId[toi], 'because it would leave its king checked (byn=', byn, singleBitToIndex.get(byn), indexToId[singleBitToIndex.get(byn)], ')');
            if (debug) console.log('Discarding', $$(n))
            // Remove
            queens ^= n;
            if (debug) console.log('- After discarding this queen:', $$(queens));
            // Check if we have one queen _now_. Very most likely, at this point, we should be finished. And otherwise repeat :)
            const filtered = singleBitToIndex.get(queens);
            if (filtered !== undefined) {
              return {i: filtered, n: queens};
            }
          }
        }
      }

      throw new Error('No single queen to move...?');
    }

    case 'R': {
      let rooks = G.rooks & turnMask;
      const only = singleBitToIndex.get(rooks);
      if (debug) console.log('Rooks:', $$(rooks), 'only:', only);
      if (only !== undefined) {
        // This is a common case in the endgame
        // It could be that this move is also invalid for this last piece... But we should not need to confirm it.
        return {i: only, n: rooks};
      }

      // Try to apply the disambiguation hints

      if (fromFile) rooks &= FILE_MASKS[fromFile.toLowerCase()];
      if (fromRank) rooks &= RANK_MASKS[fromRank.toLowerCase()];
      const filtered = singleBitToIndex.get(rooks);
      if (debug) console.log('Rooks filtered:', $$(rooks), 'only:', filtered);
      if (filtered !== undefined) {
        // It could be that this move is also invalid for this last piece... But we should not need to confirm it.
        // This is a relatively common case when the rooks are doubled
        return {i: filtered, n: rooks};
      }

      // Small optimization; only consider rooks in the same rank or file as the target cell, often avoids expensive move checks
      rooks = rooks & (RANK_MASKS[tos[1]] | FILE_MASKS[tos[0]]);
      const crossed = singleBitToIndex.get(rooks);
      if (debug) console.log('Rooks crossed:', $$(rooks), 'only:', crossed);
      if (crossed !== undefined) {
        // It could be that this move is also invalid for this last piece... But we should not need to confirm it.
        // This is a relatively common case when the rooks are doubled
        return {i: crossed, n: rooks};
      }

      // Despite disambiguation there are still multiple rook candidates left. Eliminate rooks that are blocked or even pinned.
      // For each, check if the move would be valid. Discard rooks that are invalid (like if they're pinned to the king).
      // After that we should have one rook left... We optimistically bail when we have one rook left (and assume the move is legit)

      for (let i=0n; i<64n; ++i) {
        const n = (1n << i);
        if (rooks & n) {
          if (debug) console.log('Considering rook moving from', indexToId[i], 'to', indexToId[toi], $$(rooks));
          const can = canRookMove(G, i, toi, n, ton);
          if (debug) console.log('- can:', can);
          if (can !== 'ok') { // expensive
            if (can === 'blocked') if (debug) console.log('- This rook is blocked from moving to to', indexToId[toi]);
            else if (debug) console.log('- It is not valid for this rook to move to', indexToId[toi]);
            // Remove
            rooks ^= n;
            if (debug) console.log('- After discarding this rook:', $$(rooks));
            // Check if we have one rook _now_. Very most likely, at this point, we should be finished. And otherwise repeat :)
            const filtered = singleBitToIndex.get(rooks);
            if (filtered !== undefined) {
              // It could be that this move is also invalid for this last piece... But we should not need to confirm it.
              return {i: filtered, n: rooks};
            }
            continue;
          }

          const {state, byn} = doesMoveLeaveChecked(G, forWhite, i, toi, n, ton); // expensive
          if (state === 'checked') {
            if (debug) console.log('- This rook cannot move from', indexToId[i], 'to', indexToId[toi], 'because it would leave its king checked (byn=', byn, singleBitToIndex.get(byn), indexToId[singleBitToIndex.get(byn)], ')');
            if (debug) console.log('Discarding', $$(n))
            // Remove
            rooks ^= n;
            if (debug) console.log('- After discarding this rook:', $$(rooks));
            // Check if we have one rook _now_. Very most likely, at this point, we should be finished. And otherwise repeat :)
            const filtered = singleBitToIndex.get(rooks);
            if (filtered !== undefined) {
              // It could be that this move is also invalid for this last piece... But we should not need to confirm it.
              return {i: filtered, n: rooks};
            }
          }
        }
      }

      throw new Error('No single rook to move...?');
    }

    case 'N': {
      let knights = G.knights & turnMask;
      const only = singleBitToIndex.get(knights);
      if (debug) console.log('Knights:', $$(knights), 'only:', only);
      if (only !== undefined) {
        // This is a common case as knights are some of the earliest pieces to be traded
        // It could be that this move is also invalid for this last piece... But we should not need to confirm it.
        return {i: only, n: knights};
      }

      // Try to apply the disambiguation hints

      if (fromFile) knights &= FILE_MASKS[fromFile.toLowerCase()];
      if (fromRank) knights &= RANK_MASKS[fromRank.toLowerCase()];
      const filtered = singleBitToIndex.get(knights);
      if (debug) console.log('Knights filtered:', $$(knights), 'only:', filtered);
      if (filtered !== undefined) {
        // It could be that this move is also invalid for this last piece... But we should not need to confirm it.
        // This is a relatively common case when the knights are doubled
        return {i: filtered, n: knights};
      }

      // Small optimization; only consider knights that can attack the target cell
      knights = knights & knightMoves[toi];
      const nit = singleBitToIndex.get(knights);
      if (debug) console.log('Knights that can reach target cell:', $$(knights), 'only:', nit);
      if (nit !== undefined) {
        // It could be that this move is also invalid for this last piece... But we should not need to confirm it.
        // This is a relatively common case when the knights are doubled
        return {i: nit, n: knights};
      }

      // Despite disambiguation there are still multiple knight candidates left. Eliminate knights that are blocked or even pinned.
      // For each, check if the move would be valid. Discard knights that are invalid (like if they're pinned to the king).
      // After that we should have one knight left... We optimistically bail when we have one knight left (and assume the move is legit)

      for (let i=0n; i<64n; ++i) {
        const n = (1n << i);
        if (knights & n) {
          if (debug) console.log('Considering knight moving from', indexToId[i], 'to', indexToId[toi], $$(knights));
          // I don't think "block" and "can" checks are necessary here because we applied the knightMoves
          // mask already and knights can't be blocked by other pieces. The capture may not be possible but in that case
          // it applies to all knights in this set so that's not a validation step that helps with disambiguation.

          //const can = canKnightMove(G, i, toi, n, ton);
          //if (debug) console.log('- can:', can);
          //if (can !== 'ok') { // expensive
          //  if (can === 'blocked') if (debug) console.log('- This knight is blocked from moving to to', indexToId[toi]);
          //  else if (debug) console.log('- It is not valid for this knight to move to', indexToId[toi]);
          //  // Remove
          //  knight ^= n;
          //  if (debug) console.log('- After discarding this knight:', $$(knight));
          //  // Check if we have one knight _now_. Very most likely, at this point, we should be finished. And otherwise repeat :)
          //  const filtered = singleBitToIndex.get(knight);
          //  if (filtered !== undefined) {
          //    // It could be that this move is also invalid for this last piece... But we should not need to confirm it.
          //    return {i: filtered, n: knight};
          //  }
          //  continue;
          //}

          const {state, byn} = doesMoveLeaveChecked(G, forWhite, i, toi, n, ton); // expensive
          if (state === 'checked') {
            if (debug) console.log('- This knight cannot move from', indexToId[i], 'to', indexToId[toi], 'because it would leave its king checked (byn=', byn, singleBitToIndex.get(byn), indexToId[singleBitToIndex.get(byn)], ')');
            if (debug) console.log('Discarding', $$(n))
            // Remove
            knights ^= n;
            if (debug) console.log('- After discarding this knight:', $$(knights));
            // Check if we have one knight _now_. Very most likely, at this point, we should be finished. And otherwise repeat :)
            const filtered = singleBitToIndex.get(knights);
            if (filtered !== undefined) {
              // It could be that this move is also invalid for this last piece... But we should not need to confirm it.
              return {i: filtered, n: knights};
            }
          }
        }
      }

      throw new Error('No single knight to move...?');
    }

    case 'B': {
      let bishops = G.bishops & turnMask;
      const only = singleBitToIndex.get(bishops);
      if (debug) console.log('Bishops:', $$(bishops), 'only:', only);
      if (only !== undefined) {
        // This is a common case in the endgame
        // It could be that this move is also invalid for this last piece... But we should not need to confirm it.
        return {i: only, n: bishops};
      }

      // Try to apply the disambiguation hints

      if (fromFile) bishops &= FILE_MASKS[fromFile.toLowerCase()];
      if (fromRank) bishops &= RANK_MASKS[fromRank.toLowerCase()];
      const filtered = singleBitToIndex.get(bishops);
      if (debug) console.log('Bishops filtered:', $$(bishops), 'only:', filtered);
      if (filtered !== undefined) {
        // It could be that this move is also invalid for this last piece... But we should not need to confirm it.
        // This is a relatively common case when the bishops are doubled
        return {i: filtered, n: bishops};
      }

      // TODO: create cross maps per cell and reduce the bishops set to ones inside that mask

      // Despite disambiguation there are still multiple bishop candidates left. Eliminate bishops that are blocked or even pinned.
      // For each, check if the move would be valid. Discard bishops that are invalid (like if they're pinned to the king).
      // After that we should have one bishop left... We optimistically bail when we have one bishop left (and assume the move is legit)

      for (let i=0n; i<64n; ++i) {
        const n = (1n << i);
        if (bishops & n) {
          if (debug) console.log('Considering bishop moving from', indexToId[i], 'to', indexToId[toi], $$(bishops));
          const can = canBishopMove(G, i, toi, n, ton);
          if (debug) console.log('- can:', can);
          if (can !== 'ok') { // expensive
            if (can === 'blocked') if (debug) console.log('- This bishop is blocked from moving to to', indexToId[toi]);
            else if (debug) console.log('- It is not valid for this bishop to move to', indexToId[toi]);
            // Remove
            bishops ^= n;
            if (debug) console.log('- After discarding this bishop:', $$(bishops));
            // Check if we have one bishop _now_. Very most likely, at this point, we should be finished. And otherwise repeat :)
            const filtered = singleBitToIndex.get(bishops);
            if (filtered !== undefined) {
              // It could be that this move is also invalid for this last piece... But we should not need to confirm it.
              return {i: filtered, n: bishops};
            }
            continue;
          }

          const {state, byn} = doesMoveLeaveChecked(G, forWhite, i, toi, n, ton); // expensive
          if (state === 'checked') {
            if (debug) console.log('- This bishop cannot move from', indexToId[i], 'to', indexToId[toi], 'because it would leave its king checked (byn=', byn, singleBitToIndex.get(byn), indexToId[singleBitToIndex.get(byn)], ')');
            if (debug) console.log('Discarding', $$(n))
            // Remove
            bishops ^= n;
            if (debug) console.log('- After discarding this bishop:', $$(bishops));
            // Check if we have one bishop _now_. Very most likely, at this point, we should be finished. And otherwise repeat :)
            const filtered = singleBitToIndex.get(bishops);
            if (filtered !== undefined) {
              // It could be that this move is also invalid for this last piece... But we should not need to confirm it.
              return {i: filtered, n: bishops};
            }
          }
        }
      }

      throw new Error('No single bishop to move...?');
    }

    default: huh
  }
}

/**
 * @param G {Game}
 */
function recordBoardState(G) {
  const hash = getFenishString(G);
  const seen = G.threefold.get(hash);
  G.threefold.set(hash, seen === undefined ? 1 : seen + 1);
}

/**
 * Returns true if this would trigger a threefold draw. In that case the register is not updated.
 * Returns false if the register is updated and the state has not been seen three or more times.
 *
 * @param G {Game}
 * @param [max=3] {number} In real chess the value is 3 but if you want you can change that
 */
export function updateThreefoldOrBail(G, max = 3) {
  const hash = getFenishString(G);
  const seen = G.threefold.get(hash) ?? 0;
  //console.log('hash:', hash, seen);
  if (seen >= max) return true;
  G.threefold.set(hash, seen + 1);
  return false;
}

/**
 * @param G {Game}
 * @param fromi {BigInt} The index (0..63)
 * @param toi {BigInt} The index (0..63)
 * @param fromn {BigInt} A single bit is set, representing the field to move from
 * @param ton {BigInt} A single bit is set, representing the field to move to
 * @param [ignoreTurn] {boolean}
 * @param [targetCellI] {BigInt}
 * @returns { 'ok' | 'bad' | 'blocked' }
 */
export function canMove(G, fromi, toi, fromn = 1n << fromi, ton = 1n << toi, ignoreTurn = false, targetCellI = NO_CELL_I) {
  // Assumes the game state has one king. If there are multiple, the no-check rule is skipped.

  const filled = G.white | G.black;
  const forWhite = !!(G.white & fromn);
  if (fromn === ton) {
    //console.warn(fromi, toi, 'false: same cell')
    return 'bad';
  }
  if (!(filled & fromn)) {
    return 'bad';
  }
  if (!ignoreTurn && G.turnWhite !== forWhite) {
    // It's not your turn so you can't move
    return 'bad';
  }

  if (targetCellI !== NO_CELL_I && targetCellI !== toi) {
    return 'bad';
  }

  // First check legibility at all
  const pieceMove = canPieceMove(G, fromi, toi, fromn, ton, true);
  if (pieceMove !== 'ok') {
    return pieceMove;
  }

  // Now check if the move would leave you in a checked state
  const {state: danger} = doesMoveLeaveChecked(G, forWhite, fromi, toi, fromn, ton);
  if (danger === 'checked') return 'blocked';

  return pieceMove;
}

/**
 * Expensive
 * Only works with one king
 * Make move in temporary state and verify if the king is checked. In that case returns 'checked', else 'ok'
 *
 * @param G {Game}
 * @param forWhite {boolean}
 * @param fromi {BigInt} The index (0..63)
 * @param toi {BigInt} The index (0..63)
 * @param fromn {BigInt} A single bit is set, representing the field to move from
 * @param ton {BigInt} A single bit is set, representing the field to move to
 * @returns {{state: 'ok'} | {state: 'checked', byn: BigInt, piece: 'P' | 'Q' | 'R' | 'B' | 'N' | ''}}
 */
function doesMoveLeaveChecked(G, forWhite, fromi, toi, fromn = 1n << fromi, ton = 1n << toi) {
  // Make move in temporary state and verify if the king is checked. In that case, the move is bad.
  /**
   * @type {Game}
   */
  const T = {...G};
  makeMove(T, fromi, toi, fromn, ton);
  const kingn = T.kings & (forWhite ? T.white : T.black);
  const kingi = singleBitToIndex.get(kingn) ?? NO_CELL;

  if (kingi === NO_CELL) return {state: 'ok'};

  return isCheck(T, kingi, kingn, forWhite, forWhite ? blackPawnsThatCanCaptureOn : whitePawnsThatCanCaptureOn);
}

/**
 * @param G {Game}
 * @param fromi {BigInt} The index (0..63)
 * @param toi {BigInt} The index (0..63)
 * @param fromn {BigInt} A single bit is set, representing the field to move from
 * @param ton {BigInt} A single bit is set, representing the field to move to
 * @param skipCheckCheck {boolean}
 * @returns { 'ok' | 'bad' | 'blocked' }
 */
function canPieceMove(G, fromi, toi, fromn = 1n << fromi, ton = 1n << toi, skipCheckCheck = false) {
  // For other game validation see canMove. This only validates individual piece rules.

  if (G.pawns & fromn) {
    return canPawnMove(G, fromi, toi, fromn, ton);
  }

  if (G.rooks & fromn) {
    return canRookMove(G, fromi, toi, fromn, ton);
  }

  if (G.bishops & fromn) {
    return canBishopMove(G, fromi, toi, fromn, ton);
  }

  if (G.knights & fromn) {
    return canKnightMove(G, fromi, toi, fromn, ton);
  }

  if (G.queens & fromn) {
    return canQueenMove(G, fromi, toi, fromn, ton);
  }

  if (G.kings & fromn) {
    return canKingMove(G, fromi, toi, fromn, ton, skipCheckCheck);
  }

  throw new Error(`if its taken then it should be reflected by one of the states ${fromn} ${ton}`);
}

/**
 * @param G {Game}
 * @param fromi {BigInt} The index (0..63)
 * @param toi {BigInt} The index (0..63)
 * @param fromn {BigInt} A single bit is set, representing the field to move from
 * @param ton {BigInt} A single bit is set, representing the field to move to
 * @returns { 'ok' | 'bad' | 'blocked' }
 */
function canPawnMove(G, fromi, toi, fromn, ton) {
  // This skips validating the "from" cell and does no "left in check" validation

  //// Not sure if this will be faster or have a meaningful difference versus the below
  //// Note: this does not yet check double cell advancement between block (TODO)
  //if (G.pawns & ton) {
  //  // Capturing. Need to check from and to cell to see who's attacking who
  //  const fromWhite = G.white & fromn;
  //  const toWhite = G.white & ton;
  //  if (!toWhite !== !fromWhite) {
  //    // Capturing opponent is okay, provided it's a legal move in the first place
  //    const canCapture = G.pawns & fromn & (toWhite ? whitePawnsThatCanCaptureOn[toi] : blackPawnsThatCanCaptureOn[toi]);
  //    if (canCapture) return 'ok';
  //    return 'bad';
  //  } else {
  //    // Cannot capture your own piece. Bail.
  //    return 'blocked';
  //  }
  //} else {
  //  // Moving
  //  if ((G.white | G.black) & ton) {
  //    // Regardless of colors, a pawn can't move forward into any other piece
  //    return 'blocked';
  //  }
  //  // If the "from" cell index is lower than the "to" cell index, the pawn is moving towards black's side
  //  // (or any arbitrary position but not backwards), and it should be a white pawn, or probably won't matter
  //  // This prevents us from having to validate whether there actually was a pawn in that cell in the first place.
  //  const canMove = G.pawns & fromn & (fromi < toi ? whitePawnsThatCanMoveTo[toi] : blackPawnsThatCanMoveTo[toi]);
  //  if (canMove) return 'ok';
  //  return 'bad';
  //}


  const filled = G.white | G.black;

  if (G.white & fromn) {
    switch (toi - fromi) {
      case 7n: { // up-right
        //console.log('up-right', fromi, toi, (fromi % 8n) > 0n, (G.black & to) === 1n);
        return (fromi % 8n) === 0n ? 'bad' : fromi - 1n === G.enpassant ? 'ok' : (G.black & ton) !== 0n ? 'ok' : 'blocked';
      }
      case 8n: { // up
        //console.log('up', fromi, toi, (filled & to), (filled & to) === 0n);
        return (filled & ton) === 0n ? 'ok' : 'blocked';
      }
      case 16n: { // up 2x
        if (fromi / 8n !== 1n) return 'bad'; // Only from starting rank (rank 1 for white)
        if ((filled & (fromn << 8n)) > 0n) return 'blocked'; // Can not jump over any other piece
        if ((filled & ton) > 0n) return 'blocked'; // Can not capture any piece
        return 'ok';
      }
      case 9n: { // up-left
        //console.log('up-left', fromi, toi, (fromi % 8n) < 7n, (G.black & to) !== 0n);
        return (fromi % 8n) === 7n ? 'bad' : fromi + 1n === G.enpassant ? 'ok' : (G.black & ton) !== 0n ? 'ok' : 'blocked';
      }
      default: { // illegal move
        return 'bad';
      }
    }
  } else {
    //console.log('is black pawn',  fromi,toi, toi - fromi)
    switch (toi - fromi) {
      case -9n: { // down-right
        //console.log('down-right', (fromi % 8n) > 0n, (G.white & to) === 1n);
        return (fromi % 8n) === 0n ? 'bad' : fromi - 1n === G.enpassant ? 'ok' : (G.white & ton) !== 0n ? 'ok' : 'blocked';
      }
      case -8n: { // down
        //console.log('down', (filled & to), (filled & to) === 0n);
        return (filled & ton) === 0n ? 'ok' : 'blocked';
      }
      case -16n: { // down 2x
        return fromi / 8n !== 6n ? 'bad' : (filled & (fromn >> 8n)) !== 0n ? 'blocked' : (filled & ton) === 0n ? 'ok' : 'blocked';
      }
      case -7n: { // down-left
        //console.log('down-left', (fromi % 8n) < 7n, (G.white & to) === 1n);
        return (fromi % 8n) === 7n ? 'bad' : fromi + 1n === G.enpassant ? 'ok' : (G.white & ton) !== 0n ? 'ok' : 'blocked';
      }
      default: { // illegal move
        return 'bad';
      }
    }
  }
}

/**
 * @param fromi {BigInt}
 * @param toi {BigInt}
 * @returns {boolean}
 */
function isStartingEnPassant(fromi, toi) {
  // Pawns only move forward, so they can never (legally) return to their own 7th rank so we don't need to check/track this
  // We simply check whether the pawn is moving from their starting row and making two steps forward.
  if (fromi >= 8n && fromi <= 15n && toi >= 24n && toi <= 31n) {
    return true;
  }

  if (fromi >= 48n && fromi <= 55n && toi >= 32n && toi <= 39n) {
    return true;
  }

  return false;
}

/**
 * @param G {Game}
 * @param fromi {BigInt} The index (0..63)
 * @param toi {BigInt} The index (0..63)
 * @param from {BigInt} A single bit is set, representing the field to move from
 * @param to {BigInt} A single bit is set, representing the field to move to
 * @returns { 'ok' | 'bad' | 'blocked' }
 */
function canRookMove(G, fromi, toi, from, to) {
  // This skips validating the "from" cell and does no "left in check" validation

  const filled = G.white | G.black;

  //console.log('rook', fromi, toi, fromi % 8n, toi % 8n, fromi / 8n, toi / 8n, );
  const dx = (toi % 8n) - (fromi % 8n);
  const dy = (toi / 8n) - (fromi / 8n);
  if (dx !== 0n && dy !== 0n) {
    // Not moving on same line
    return 'bad';
  }
  if ((filled & to) !== 0n && ((G.black & from) === (G.black & to) || (G.white & from) === (G.white & to))) {
    // can't move rook to cell with piece of same color
    //console.log('target blocked by own piece');
    return 'blocked';
  }

  // We now know
  // - the from is not empty
  // - the to is not the same color as from, or empty
  // - the from and to are on the same line (implies not OOB)
  // Must now validate that in between cells are empty

  // TODO: there's a bitwise hack for this but meanwhile this is a worst-case O(6) operation :shrug:

  //console.log('- delta:', dx, dy, 'from:', fromi, 'to:', toi)
  if (dx > 1n || dx < -1n || dy > 1n || dy < -1n) {
    const step = dx === 0n ? 8n : 1n;
    //console.log('step:', step, 'moving from', fromi, indexToId[fromi], ', to', toi, indexToId[toi], ', dx', dx, ', dy', dy);
    // Force order to be incremental. It doesn't matter which cell is actually blocking (for us here). Just whether any in between is.
    let i = (fromi < toi ? fromi : toi) + step;
    let j = (fromi < toi ? toi : fromi) - step;
    //console.log('offsets: i=', fromi + step, indexToId[fromi + step], ', j=', toi - step, indexToId[toi - step]);
    for (; i<=j; i+=step) {
      if ((filled) & (1n << i)) {
        //console.log('rook is blocked at', i, indexToId[i])
        return 'blocked';
      }
    }
  }

  return 'ok';
}

/**
 * @param G {Game}
 * @param fromi {BigInt} The index (0..63)
 * @param toi {BigInt} The index (0..63)
 * @param from {BigInt} A single bit is set, representing the field to move from
 * @param to {BigInt} A single bit is set, representing the field to move to
 * @returns { 'ok' | 'bad' | 'blocked' }
 */
function canBishopMove(G, fromi, toi, from, to) {
  // This skips validating the "from" cell and does no "left in check" validation

  const filled = G.white | G.black;

  const rb = fromi < toi ? fromi : toi;
  const lt = fromi < toi ? toi : fromi;

  const dx_s = (rb % 8n) - (lt % 8n);
  const dy_s = (rb / 8n) - (lt / 8n);
  const dx_u = dx_s < 0n ? -dx_s : dx_s;
  const dy_u = dy_s < 0n ? -dy_s : dy_s;
  //console.log('bishop', fromi, toi, dx_s, dy_s, dx_u, dy_u);
  if (dx_u !== dy_u) {
    // Not moving exactly diagonal
    return 'bad';
  }
  //console.warn('bishop; from:', fromi, indexToId[fromi], ', to:', toi, indexToId[toi], ', dx:', dx_s, dy_s);
  if ((filled & to) !== 0n && ((G.black & from) === (G.black & to) || (G.white & from) === (G.white & to))) {
    // can't move rook to cell with piece of same color
    //console.log('target blocked by own piece');
    return 'blocked';
  }

  // We now know
  // - the from is not empty
  // - the to is not the same color as from, or empty
  // - the from and to are on the same diagonal (implies not OOB)
  // Must now validate that in between cells are empty

  // TODO: there's a bitwise hack for this but meanwhile this is a worst-case O(6) operation :shrug:

  if (dx_u > 1n || dy_u > 1n) {
    // Note: cell index order is right-to-left, bottom-to-top. It's a bit inverted.
    // With i<j init, always stepping to up-left (+9n) or up-right (+7n)
    const step = dx_s < 0n ? 9n : 7n;
    //console.log('step:', step, 'moving from', fromi, indexToId[fromi], ', to', toi, indexToId[toi], ', dx', dx, ', dy', dy);
    // Force order to be incremental (bottom-right to top-left).
    // It doesn't matter which cell is actually blocking (for us here). Just whether any in between is.
    let i = rb + step;
    let j = lt - step;
    //console.log('from:', fromi, indexToId[fromi], ', to:', toi, indexToId[toi], ', step=', step, ', offsets: bottomRight=', i, indexToId[i], ', topLeft=', j, indexToId[j], ', dx=', dx_s, ', i is', (fromi < toi ? fromi : toi), '+', step);
    for (; i<=j; i+=step) {
      //console.log('loop; i=', i, indexToId[i], ', j=', j, indexToId[j]);
      if (filled & (1n << i)) {
        //console.log('rook is blocked at', i, indexToId[i])
        return 'blocked';
      }
    }
  }

  return 'ok';
}

/**
 * @param G {Game}
 * @param fromi {BigInt} The index (0..63)
 * @param toi {BigInt} The index (0..63)
 * @param from {BigInt} A single bit is set, representing the field to move from
 * @param to {BigInt} A single bit is set, representing the field to move to
 * @returns { 'ok' | 'bad' | 'blocked' }
 */
function canKnightMove(G, fromi, toi, from, to) {
  // This skips validating the "from" cell and does no "left in check" validation

  // Knights have at most 8 squares to go to
  // We have to do bounds checks. We could also do a 64 key mask lookup table, one for each cell, mask it against black or white.
  // If the cell is occupied with the same color as the knight, the move is invalid. Otherwise, the move is valid.
  // This would also be a viable strat for doing check validation for knights ((own_color & knights) -> knight_attacks & kings & opp_color)
  // There's theoretical max of 10 knights, but in practice you rarely see more than two for one player, I think more than three is extreme.

  const possibleMoves = knightMoves[fromi];
  if (!(possibleMoves & to)) {
    return 'bad';
  }
  //console.log('ok?', fromi, toi, possibleMoves)
  //console.log(possibleMoves.toString(2).padStart(64, '0'))

  // Consider this attack of the white knight:
  //    possible    black                   attacks      valid moves
  //    ........    ..11..1.    11..11.1    ........     ........
  //    ........    .....111    11111...    ........     ........
  //    ........    ....1...    1111.111    ........     ........
  //    ........  ^ ........  = 11111111  & ........  =  ........
  //    ........    ..1.....    11.11111    ........     ........
  //    ...1.1..    .....1..    11111.11    ...1.1..     ...1....
  //    ..1...1.    ......1.    111111.1    ..1...1.     ..1.....
  //    ....N...    ....N...    11111111    ....N...     ....N...
  const validMoves = (possibleMoves ^ ((G.white & from) ? G.white : G.black)) & possibleMoves;
  //console.log('possible:', boardToString(possibleMoves));
  //console.log('valid:', boardToString(validMoves));
  //console.log('verdict:', (validMoves & to) ? 'ok' : 'blocked')
  return (validMoves & to) ? 'ok' : 'blocked';
}

/**
 * @param G {Game}
 * @param fromi {BigInt} The index (0..63)
 * @param toi {BigInt} The index (0..63)
 * @param from {BigInt} A single bit is set, representing the field to move from
 * @param to {BigInt} A single bit is set, representing the field to move to
 * @returns { 'ok' | 'bad' | 'blocked' }
 */
function canQueenMove(G, fromi, toi, from, to) {
  // This skips validating the "from" cell and does no "left in check" validation
  // Note: both the rook and bishop checks will exit early if the move is not orthogonal/diagonal. No need to do that here.

  const rookable = canRookMove(G, fromi, toi, from, to);
  //console.log('--rookable:', rookable);
  if (rookable !== 'bad') return rookable; // ok or blocked
  return canBishopMove(G, fromi, toi, from, to);
}

/**
 * @param G {Game}
 * @param fromi {BigInt} The index (0..63)
 * @param toi {BigInt} The index (0..63)
 * @param from {BigInt} A single bit is set, representing the field to move from
 * @param to {BigInt} A single bit is set, representing the field to move to
 * @param skipCheckCheck {boolean}
 * @returns { 'ok' | 'bad' | 'blocked' }
 */
export function canKingMove(G, fromi, toi, from, to, skipCheckCheck = false, debug = false) {
  // This skips validating the "from" cell and optionally skips the "left in check" validation

  // The king can only move one square. However, it needs to also validate whether or not it would be in check after moving.
  // In Diagonal directions, walk up to the nearest piece or wall.
  // - If the piece is an opponent king, queen, or bishop, return check
  // - If the piece is an opponent pawn and on the opponent side of the king, return check
  // - Otherwise;
  // In horizontal directions, walk up to the nearest piece or wall.
  // - If the piece is an opponent king, queen, or rook, return check
  // - Otherwise;
  // Find the knight attack pattern for the position of the king
  // - If that position would attack any opponent knights, return check
  // - Otherwise;
  // There should be no other ways to be checked, so
  // - return ok
  // Worst case you have to check 31 squares plus the knight check (which will check all knight
  // attacks with two bitwose ops) and maybe the pawn attacks separately. That's not so bad.
  // However, if we have to do this for every move check of a whole board it'll get a bit inefficient.

  // For a king move, we can omit the check along the straight path that it moves (eg. horizontal move can not change a rook/queen
  // attack so only the new neighbor cell needs to be checked for being the king. plus all the other things. maybe not that impactful.)
  // The check-check only needs to be applied for "ok" cases, though. That may not be too bad.
  // We could cache it based on position and each direction, only needing revalidation if that segment changed.
  // The segment is even fairly cell agnostic, although checking it through the different layers may prove difficult.

  const isWhite = Boolean(G.white & from);
  const kingColorMask = isWhite ? G.white : G.black;

  let possibleMoves = kingMoves[fromi];
  if (!(possibleMoves & to)) {
    return 'bad';
  }

  const validMoves = (possibleMoves ^ kingColorMask) & possibleMoves;
  if (!(validMoves & to)) return 'blocked';

  // If the move is a castle move then we need to check the intermediary step as well
  let castleMid_i = 0n;
  if (fromi === CELL_I_E1 && toi === CELL_I_C1) {
    if (!G.castleQueensideWhite) return 'blocked'; // or bad? eh.
    castleMid_i = CELL_I_D1;
  }
  else if (fromi === CELL_I_E1 && toi === CELL_I_G1) {
    if (!G.castleKingsideWhite) return 'blocked'; // or bad? eh.
    castleMid_i = CELL_I_F1;
  }
  else if (fromi === CELL_I_E8 && toi === CELL_I_C8) {
    if (!G.castleQueensideBlack) return 'blocked'; // or bad? eh.
    castleMid_i = CELL_I_D8;
  }
  else if (fromi === CELL_I_E8 && toi === CELL_I_G8) {
    if (!G.castleKingsideBlack) return 'blocked'; // or bad? eh.
    castleMid_i = CELL_I_F8;
  }

  // If castling...
  if (castleMid_i) {
    const filled = G.white | G.black;
    const castleMid = 1n << castleMid_i;
    // Need to check fixed position from-mid-to for being empty and attacked (checked). And I guess confirm the castle is even there.
    return (
      // Check if the king is currently in check
      isCheck(
        G,
        fromi,
        from,
        isWhite,
        isWhite ? blackPawnsThatCanCaptureOn : whitePawnsThatCanCaptureOn
      ).state === 'ok'
      &&
      // Check if the target cell is being attacked or blocked
      !(filled & to) &&
      isCheck(
        // Need to move the king because otherwise its old position might block a ray. I don't think we need to OR the `to` but :shrug:
        {
          ...G,
          kings: (G.kings ^ from) | to,
          white: isWhite ? (G.white ^ from) | to : G.white,
          black: !isWhite ? (G.black ^ from) | to : G.black
        },
        toi,
        to,
        isWhite,
        isWhite ? blackPawnsThatCanCaptureOn : whitePawnsThatCanCaptureOn
      ).state === 'ok'
      &&
      // Check if the target cell is being attacked or blocked
      !(filled & castleMid) &&
      isCheck(
        // Need to move the king because otherwise its old position might block a ray. I don't think we need to OR the `to` but :shrug:
        {
          ...G,
          kings: (G.kings ^ from) | castleMid,
          white: isWhite ? (G.white ^ from) | castleMid : G.white,
          black: !isWhite ? (G.black ^ from) | castleMid : G.black
        },
        castleMid_i,
        castleMid,
        isWhite,
        isWhite ? blackPawnsThatCanCaptureOn : whitePawnsThatCanCaptureOn
      ).state === 'ok'
    ) ? 'ok' : 'blocked';
  }

  if (skipCheckCheck) return 'ok';

  //console.log('\n', $$$({
  //  ...G,
  //  kings: (G.kings ^ from) | to,
  //  white: isWhite ? (G.white ^ from) | to : G.white,
  //  black: !isWhite ? (G.black ^ from) | to : G.black
  //}, 'checking check'))
  const H = {
    ...G,
    kings: (G.kings ^ from) | to,
    white: isWhite ? (G.white ^ from) | to : G.white,
    black: !isWhite ? (G.black ^ from) | to : G.black
  };
  const finalCheckCheck = isCheck(
    // Need to move the king because otherwise its old position might block a ray. I don't think we need to OR the `to` but :shrug:
    H,
    singleBitToIndex.get(to), // Assumes there is one king...
    to,
    isWhite,
    isWhite ? blackPawnsThatCanCaptureOn : whitePawnsThatCanCaptureOn
  );

  if (debug) console.log('final:', finalCheckCheck, indexToId[finalCheckCheck.byn],$$(finalCheckCheck.byn),'\n', singleBitToIndex.get(G.kings & kingColorMask), indexToId[singleBitToIndex.get(G.kings & kingColorMask)])
  return finalCheckCheck.state !== 'ok' ? 'blocked' : 'ok';
}

/**
 * @param G {Game}
 * @param at_i {BigInt}
 * @param at_n {BigInt}
 * @param forWhite {boolean}
 * @param pawnCellAttacks {BigInt[]}
 * @param [debug] {boolean}
 * @returns {{state: 'ok' | 'checked', byn: BigInt, piece: 'P' | 'Q' | 'R' | 'B' | 'N' | ''}}
 */
export function isCheck(G, at_i, at_n, forWhite, pawnCellAttacks, debug=false) {
  // Assumes the cell at given index to be containing a king of given color. Does not verify this.
  // (This way we can pass the same state for neighbor king moves without the need to update any
  // states since a king can't check itself. This even works for castling.)

  // - check forward diagonals
  //   - queens and bishops, and for (only) the neighbor cell also kings and pawns
  // - check backward diagonals
  //   - queens and bishops, and for (only) the neighbor cell also kings (no pawns)
  // - check horizontal and vertical ray
  //   - queens and rooks and king for the neighbor cell
  // - check knight attacks

  // Alternatively, we can build an attack map. For every piece we determine which cells it currently
  // attacks or covers. The problem here is that we don't have a good easy way of iterating over all
  // the pieces. That said, we can AND all the piece maps with the color, iterate through them, update
  // the attack map, and then there's just a map to apply to any king move.

  // We can also focus on just the 9 king squares and skip anything else.

  const colorMapOfKingColor = forWhite ? G.white : G.black;
  const colorMapOfOpp = forWhite ? G.black : G.white;
  const filled = G.black | G.white;

  // For all rays, scan the ray until the first piece or the edge, skipping empty cells
  const xStart = at_i % 8n;
  const yStart = at_i / 8n;
  let x = 0n;
  let y = 0n;
  let index = 0n;

  // rook, rightward
  x = xStart;
  y = yStart;
  index = at_n;
  while (x > 0n) {
    --x;
    index >>= 1n;
    const {state, byn} = isRayCheck(G, filled, index, G.rooks, colorMapOfKingColor);
    if (debug && state === 'checked') console.log(at_i, 'checked by', (G.queens & byn) ? 'queen' : 'rook', '→ byn=', byn);
    if (state === 'end') break;
    if (state === 'checked') return { state: 'checked', byn: index, piece: (G.queens & byn) ? 'Q' : 'R' };
  }

  // rook, leftward
  x = xStart;
  y = yStart;
  index = at_n;
  while (x < 7n) {
    ++x;
    index <<= 1n;
    const {state, byn} = isRayCheck(G, filled, index, G.rooks, colorMapOfKingColor);
    if (debug && state === 'checked') console.log(at_i, 'checked by', (G.queens & byn) ? 'queen' : 'rook', '← byn=', byn);
    if (state === 'end') break;
    if (state === 'checked') return { state: 'checked', byn: index, piece: (G.queens & byn) ? 'Q' : 'R' };
  }

  // rook, downward
  x = xStart;
  y = yStart;
  index = at_n;
  while (y > 0n) {
    --y;
    index >>= 8n;
    const {state, byn} = isRayCheck(G, filled, index, G.rooks, colorMapOfKingColor);
    if (debug && state === 'checked') console.log(at_i, 'checked by', (G.queens & byn) ? 'queen' : 'rook', '↓ byn=', byn);
    if (state === 'end') break;
    if (state === 'checked') return { state: 'checked', byn: index, piece: (G.queens & byn) ? 'Q' : 'R' };
  }

  // rook, upward
  x = xStart;
  y = yStart;
  index = at_n;
  while (y < 7n) {
    ++y;
    index <<= 8n;
    const {state, byn} = isRayCheck(G, filled, index, G.rooks, colorMapOfKingColor);
    if (debug && state === 'checked') console.log(at_i, 'checked by', (G.queens & byn) ? 'queen' : 'rook', '↑ byn=', byn);
    if (state === 'end') break;
    if (state === 'checked') return { state: 'checked', byn: index, piece: (G.queens & byn) ? 'Q' : 'R' };
  }

  // bishop, right-down-ward
  x = xStart;
  y = yStart;
  index = at_n;
  while (x > 0n && y > 0n) {
    --x;
    --y;
    index = 1n << (x + y * 8n); // to bottom-right
    const {state, byn} = isRayCheck(G, filled, index, G.bishops, colorMapOfKingColor);
    if (debug && state === 'checked') console.log(at_i, 'checked by', (G.queens & byn) ? 'queen' : 'rook', '↘ byn=', byn);
    if (state === 'end') break;
    if (state === 'checked') return { state: 'checked', byn: index, piece: (G.queens & byn) ? 'Q' : 'B' };
  }

  // bishop, left-down-ward
  x = xStart;
  y = yStart;
  index = at_n;
  while (x < 7n && y > 0n) {
    ++x;
    --y;
    index = 1n << (x + y * 8n); // to the bottom-left
    const {state, byn} = isRayCheck(G, filled, index, G.bishops, colorMapOfKingColor);
    if (debug && state === 'checked') console.log(at_i, 'checked by', (G.queens & byn) ? 'queen' : 'rook', '↙ byn=', byn);
    if (state === 'end') break;
    if (state === 'checked') return { state: 'checked', byn: index, piece: (G.queens & byn) ? 'Q' : 'B' };
  }

  // bishop, right-up-ward
  x = xStart;
  y = yStart;
  index = at_n;
  while (x > 0n && y < 7n) {
    --x;
    ++y;
    index = 1n << (x + y * 8n); // to the top-right
    const {state, byn} = isRayCheck(G, filled, index, G.bishops, colorMapOfKingColor);
    if (debug && state === 'checked') console.log(at_i, 'checked by', (G.queens & byn) ? 'queen' : 'rook', '↗ byn=', byn);
    if (state === 'end') break;
    if (state === 'checked') return { state: 'checked', byn: index, piece: (G.queens & byn) ? 'Q' : 'B' };
  }

  // bishop, left-up-ward
  x = xStart;
  y = yStart;
  index = at_n;
  while (x < 7n && y < 7n) {
    ++x;
    ++y;
    index = 1n << (x + y * 8n); // to the top-left
    const {state, byn} = isRayCheck(G, filled, index, G.bishops, colorMapOfKingColor);
    if (debug && state === 'checked') console.log(at_i, 'checked by', (G.queens & byn) ? 'queen' : 'rook', '↖ byn=', byn);
    if (state === 'end') break;
    if (state === 'checked') return { state: 'checked', byn: index, piece: (G.queens & byn) ? 'Q' : 'B' };
  }

  // knight
  const knightMayCheckFrom = knightMoves[at_i];
  const oppKnights = (G.knights & colorMapOfOpp) & G.knights;
  const byKnights = knightMayCheckFrom & oppKnights;
  if (debug && Boolean(byKnights)) console.log(at_i, 'checked by knight, byn=', byKnights);
  if (byKnights) {
    return { state: 'checked', byn: byKnights, piece: 'N' };
  }

  // king
  // There should be only one opp king, but this will check if any neighbor cell of the cell being
  // checked for being in check has an opp king. If any king neighbors it, the cell is under attack.
  const oppKings = (G.kings & colorMapOfOpp) & G.kings;
  const neighborCells = kingMoves[at_i];
  const byKings = neighborCells & oppKings;
  if (debug && Boolean(byKings)) console.log(at_i, 'checked by king, byn=', byKings);
  if (byKings) {
    return { state: 'checked', byn: byKings, piece: 'N' };
  }

  // pawns
  // Find all pawns of the given color, determine the cells they attack, check if king is one of them
  const oppPawns = (G.pawns & colorMapOfOpp) & G.pawns;
  const potentialCellAttackers = pawnCellAttacks[at_i];
  const attackingPawns = oppPawns & potentialCellAttackers;
  if (debug && attackingPawns) console.log(indexToId[at_i], 'is checked by pawn, byn=', attackingPawns);
  if (debug && attackingPawns) console.log('attacking pawns:', $$(attackingPawns))
  if (attackingPawns) {
    return { state: 'checked', byn: attackingPawns, piece: 'P' };
  }

  return { state: 'ok', byn: NO_CELL, piece: '' };
}

/**
 * (No bounds checks applied)
 *
 * @param G {Game}
 * @param filled {BigInt}
 * @param n {BigInt}
 * @param rayTypeField {BigInt} G.rooks or G.bishops
 * @param colorMap {BigInt} G.white or G.black
 * @returns {{state: 'empty' | 'checked' | 'end', byn: BigInt}}
 * */
function isRayCheck(G, filled, n, rayTypeField, colorMap) {
  if (filled & n) {
    if (colorMap & n) {
      // Same color piece. End of the ray. No problem.
      return { state: 'end', byn: n };
    }

    if ((G.queens | rayTypeField) & n) {
      // Opponent color piece, queen or rook/bishop.
      return { state: 'checked', byn: n };
    }

    // else it must be a non-attacking opponent piece. End of the ray.
    return { state: 'end', byn: n };
  }

  return { state: 'empty', byn: n };
}

/**
 * @param G {Game}
 * @returns {{white: {rooks: number, knights: number, pawns: number, bishops: number, queens: number}, black: {rooks: number, knights: number, pawns: number, bishops: number, queens: number}}}
 */
export function getMaterial(G) {
  // The lack of popcount (and even clz) for bigint actually makes this a bit of an awkward process.
  // We just walk the board (64 cell max) and check each piece layer. If there's a match we update the state.
  const state = {
    white: {
      pawns: 0,
      //kings: 0,
      queens: 0,
      knights: 0,
      bishops: 0,
      rooks: 0,
    },
    black: {
      pawns: 0,
      //kings: 0,
      queens: 0,
      knights: 0,
      bishops: 0,
      rooks: 0,
    },
  };

  for (let i=0n; i<64n; ++i) {
    const n = 1n << i;
    (G.rooks & n)
    ? ((G.white & n) ? ++state.white.rooks : ++state.black.rooks)
    : (G.bishops & n)
    ? ((G.white & n) ? ++state.white.bishops : ++state.black.bishops)
    : (G.knights & n)
    ? ((G.white & n) ? ++state.white.knights : ++state.black.knights)
    : (G.queens & n)
    ? ((G.white & n) ? ++state.white.queens : ++state.black.queens)
    //: (G.kings & n) // king doesn't count for material
    //? ((G.white & n) ? ++state.white.kings : ++state.black.rooks)
    : (G.pawns & n)
    ? ((G.white & n) ? ++state.white.pawns : ++state.black.pawns)
    : ' ';
  }

  return state;
}

/**
 * @param material {{rooks: number, knights: number, pawns: number, bishops: number, queens: number}}}
 * @returns number
 */
export function points(material) {
  // If a promoted piece replaces a captured piece then it will count for points.
  // However, a double queen only counts once.
  return (
    8 - Math.max(0, Math.min(8, material.pawns)) +
    (2 - Math.max(0, Math.min(2, material.knights))) * 3 +
    (2 - Math.max(0, Math.min(2, material.bishops))) * 3 +
    (2 - Math.max(0, Math.min(2, material.rooks))) * 5 +
    (1 - Math.max(0, Math.min(1, material.queens))) * 8
  );
}
