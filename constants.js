const whiteKing = '♔'; //  - Unicode: \u2654 or &#9812;
const whiteQueen = '♕'; // - Unicode: \u2655 or &#9813;
const whiteRook = '♖'; //  - Unicode: \u2656 or &#9814;
const whiteBishop = '♗'; // - Unicode: \u2657 or &#9815;
const whiteKnight = '♘'; // - Unicode: \u2658 or &#9816;
const whitePawn = '♙'; //   - Unicode: \u2659 or &#9817;
const blackKing = '♚'; //  - Unicode: \u265A or &#9818;
const blackQueen = '♛'; // - Unicode: \u265B or &#9819;
const blackRook = '♜'; //  - Unicode: \u265C or &#9820;
const blackBishop = '♝'; // - Unicode: \u265D or &#9821;
const blackKnight = '♞'; // - Unicode: \u265E or &#9822;
const blackPawn = '♟'; //   - Unicode: \u265F or &#9823;

/**
 * Bit field represented like this
 *
 * H1 H2 H3 H4 H5 H6 H7 H8
 * G1 G2 G3 G4 G5 G6 G7 G8
 * F1 F2 F3 F4 F5 F6 F7 F8
 * E1 E2 E3 E4 E5 E6 E7 E8
 * D1 D2 D3 D4 D5 D6 D7 D8
 * C1 C2 C3 C4 C5 C6 C7 C8
 * B1 B2 B3 B4 B5 B6 B7 B8
 * A1 A2 A3 A4 A5 A6 A7 A8
 * */

const idToIndex = {
  a8: 63n,
  b8: 62n,
  c8: 61n,
  d8: 60n,
  e8: 59n,
  f8: 58n,
  g8: 57n,
  h8: 56n,
  a7: 55n,
  b7: 54n,
  c7: 53n,
  d7: 52n,
  e7: 51n,
  f7: 50n,
  g7: 49n,
  h7: 48n,
  a6: 47n,
  b6: 46n,
  c6: 45n,
  d6: 44n,
  e6: 43n,
  f6: 42n,
  g6: 41n,
  h6: 40n,
  a5: 39n,
  b5: 38n,
  c5: 37n,
  d5: 36n,
  e5: 35n,
  f5: 34n,
  g5: 33n,
  h5: 32n,
  a4: 31n,
  b4: 30n,
  c4: 29n,
  d4: 28n,
  e4: 27n,
  f4: 26n,
  g4: 25n,
  h4: 24n,
  a3: 23n,
  b3: 22n,
  c3: 21n,
  d3: 20n,
  e3: 19n,
  f3: 18n,
  g3: 17n,
  h3: 16n,
  a2: 15n,
  b2: 14n,
  c2: 13n,
  d2: 12n,
  e2: 11n,
  f2: 10n,
  g2: 9n,
  h2: 8n,
  a1: 7n,
  b1: 6n,
  c1: 5n,
  d1: 4n,
  e1: 3n,
  f1: 2n,
  g1: 1n,
  h1: 0n,
};
const indexToId = {
  63n: 'a8',
  62n: 'b8',
  61n: 'c8',
  60n: 'd8',
  59n: 'e8',
  58n: 'f8',
  57n: 'g8',
  56n: 'h8',
  55n: 'a7',
  54n: 'b7',
  53n: 'c7',
  52n: 'd7',
  51n: 'e7',
  50n: 'f7',
  49n: 'g7',
  48n: 'h7',
  47n: 'a6',
  46n: 'b6',
  45n: 'c6',
  44n: 'd6',
  43n: 'e6',
  42n: 'f6',
  41n: 'g6',
  40n: 'h6',
  39n: 'a5',
  38n: 'b5',
  37n: 'c5',
  36n: 'd5',
  35n: 'e5',
  34n: 'f5',
  33n: 'g5',
  32n: 'h5',
  31n: 'a4',
  30n: 'b4',
  29n: 'c4',
  28n: 'd4',
  27n: 'e4',
  26n: 'f4',
  25n: 'g4',
  24n: 'h4',
  23n: 'a3',
  22n: 'b3',
  21n: 'c3',
  20n: 'd3',
  19n: 'e3',
  18n: 'f3',
  17n: 'g3',
  16n: 'h3',
  15n: 'a2',
  14n: 'b2',
  13n: 'c2',
  12n: 'd2',
  11n: 'e2',
  10n: 'f2',
  9n: 'g2',
  8n: 'h2',
  7n: 'a1',
  6n: 'b1',
  5n: 'c1',
  4n: 'd1',
  3n: 'e1',
  2n: 'f1',
  1n: 'g1',
  0n: 'h1',
};

// Used by castling logic
const CELL_I_A1 = idToIndex['a1']
const CELL_I_C1 = idToIndex['c1']
const CELL_I_D1 = idToIndex['d1']
const CELL_I_E1 = idToIndex['e1'];
const CELL_I_F1 = idToIndex['f1'];
const CELL_I_G1 = idToIndex['g1'];
const CELL_I_H1 = idToIndex['h1'];
const CELL_I_C8 = idToIndex['c8']
const CELL_I_A8 = idToIndex['a8']
const CELL_I_D8 = idToIndex['d8']
const CELL_I_E8 = idToIndex['e8'];
const CELL_I_F8 = idToIndex['f8'];
const CELL_I_G8 = idToIndex['g8'];
const CELL_I_H8 = idToIndex['h8'];

const CELL_N_A1 = 1n << CELL_I_A1;
const CELL_N_D1 = 1n << CELL_I_D1;
const CELL_N_F1 = 1n << CELL_I_F1;
const CELL_N_H1 = 1n << CELL_I_H1;
const CELL_N_A8 = 1n << CELL_I_A8;
const CELL_N_D8 = 1n << CELL_I_D8;
const CELL_N_F8 = 1n << CELL_I_F8;
const CELL_N_H8 = 1n << CELL_I_H8;

const NO_CELL = 1n << 64n;
const NO_CELL_I = 64n;

function convertStringToBitboard(s) {
  return BigInt(`0b${s.replace('x', '0').replace(/\s/g, '')}`);
}

const FILE_A = convertStringToBitboard(`
  10000000
  10000000
  10000000
  10000000
  10000000
  10000000
  10000000
  10000000
`);
const FILE_B = convertStringToBitboard(`
  01000000
  01000000
  01000000
  01000000
  01000000
  01000000
  01000000
  01000000
`);
const FILE_C = convertStringToBitboard(`
  00100000
  00100000
  00100000
  00100000
  00100000
  00100000
  00100000
  00100000
`);
const FILE_D = convertStringToBitboard(`
  00010000
  00010000
  00010000
  00010000
  00010000
  00010000
  00010000
  00010000
`);
const FILE_E = convertStringToBitboard(`
  00001000
  00001000
  00001000
  00001000
  00001000
  00001000
  00001000
  00001000
`);
const FILE_F = convertStringToBitboard(`
  00000100
  00000100
  00000100
  00000100
  00000100
  00000100
  00000100
  00000100
`);
const FILE_G = convertStringToBitboard(`
  00000010
  00000010
  00000010
  00000010
  00000010
  00000010
  00000010
  00000010
`);
const FILE_H = convertStringToBitboard(`
  00000001
  00000001
  00000001
  00000001
  00000001
  00000001
  00000001
  00000001
`);
const FILE_MASKS = {a: FILE_A, b: FILE_B, c: FILE_C, d: FILE_D, e: FILE_E, f: FILE_F, g: FILE_G, h: FILE_H};
const RANK_1 = convertStringToBitboard(`
  00000000
  00000000
  00000000
  00000000
  00000000
  00000000
  00000000
  11111111
`);
const RANK_2 = convertStringToBitboard(`
  00000000
  00000000
  00000000
  00000000
  00000000
  00000000
  11111111
  00000000
`);
const RANK_3 = convertStringToBitboard(`
  00000000
  00000000
  00000000
  00000000
  00000000
  11111111
  00000000
  00000000
`);
const RANK_4 = convertStringToBitboard(`
  00000000
  00000000
  00000000
  00000000
  11111111
  00000000
  00000000
  00000000
`);
const RANK_5 = convertStringToBitboard(`
  00000000
  00000000
  00000000
  11111111
  00000000
  00000000
  00000000
  00000000
`);
const RANK_6 = convertStringToBitboard(`
  00000000
  00000000
  11111111
  00000000
  00000000
  00000000
  00000000
  00000000
`);
const RANK_7 = convertStringToBitboard(`
  00000000
  11111111
  00000000
  00000000
  00000000
  00000000
  00000000
  00000000
`);
const RANK_8 = convertStringToBitboard(`
  11111111
  00000000
  00000000
  00000000
  00000000
  00000000
  00000000
  00000000
`);
// Offset 1 because that makes more sense.
const RANK_MASKS = [undefined, RANK_1, RANK_2, RANK_3, RANK_4, RANK_5, RANK_6, RANK_7, RANK_8];


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
