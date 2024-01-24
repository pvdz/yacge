/**
 * For each index, representing a cell index, list an array of cell indices where this bishop
 * could potentially move to or capture from that cell (provided the board state allows it).
 * Note: In a normal game it is not possible to have pawns on the last two ranks (closest to the player)
 *
 * Generated through:
 *   for (let x=0; x<8; ++x) {
 *     for (let y=0; y<8; ++y) {
 *       const n = x + y*8;
 *       bishopCellToMoveCells[n] = [];
 *       for (let i=0; i<8; ++i) {
 *         if (((x-i) + (y-i)*8) !== n && x-i>=0 && y-i>=0) bishopCellToMoveCells[n].push(BigInt((x-i) + (y-i)*8));
 *         if (((x+i) + (y-i)*8) !== n && x+i<=7 && y-i>=0) bishopCellToMoveCells[n].push(BigInt((x+i) + (y-i)*8));
 *         if (((x+i) + (y+i)*8) !== n && x+i<=7 && y+i<=7) bishopCellToMoveCells[n].push(BigInt((x+i) + (y+i)*8));
 *         if (((x-i) + (y+i)*8) !== n && x-i>=0 && y+i<=7) bishopCellToMoveCells[n].push(BigInt((x-i) + (y+i)*8));
 *       }
 *     }
 *   }
 *
 * @type {BigInt[][]}
 */
export const bishopCellToMoveCells = [
  [ 9n, 18n, 27n, 36n, 45n, 54n, 63n],
  [10n,  8n, 19n, 28n, 37n, 46n, 55n],
  [11n,  9n, 20n, 16n, 29n, 38n, 47n],
  [12n, 10n, 21n, 17n, 30n, 24n, 39n],
  [13n, 11n, 22n, 18n, 31n, 25n, 32n],
  [14n, 12n, 23n, 19n, 26n, 33n, 40n],
  [15n, 13n, 20n, 27n, 34n, 41n, 48n],
  [14n, 21n, 28n, 35n, 42n, 49n, 56n],
  [ 1n, 17n, 26n, 35n, 44n, 53n, 62n],
  [ 0n,  2n, 18n, 16n, 27n, 36n, 45n, 54n, 63n],
  [ 1n,  3n, 19n, 17n, 28n, 24n, 37n, 46n, 55n],
  [ 2n,  4n, 20n, 18n, 29n, 25n, 38n, 32n, 47n],
  [ 3n,  5n, 21n, 19n, 30n, 26n, 39n, 33n, 40n],
  [ 4n,  6n, 22n, 20n, 31n, 27n, 34n, 41n, 48n],
  [ 5n,  7n, 23n, 21n, 28n, 35n, 42n, 49n, 56n],
  [ 6n, 22n, 29n, 36n, 43n, 50n, 57n],
  [ 9n, 25n,  2n, 34n, 43n, 52n, 61n],
  [ 8n, 10n, 26n, 24n,  3n, 35n, 44n, 53n, 62n],
  [ 9n, 11n, 27n, 25n,  0n,  4n, 36n, 32n, 45n, 54n, 63n],
  [10n, 12n, 28n, 26n,  1n,  5n, 37n, 33n, 46n, 40n, 55n],
  [11n, 13n, 29n, 27n,  2n,  6n, 38n, 34n, 47n, 41n, 48n],
  [12n, 14n, 30n, 28n,  3n,  7n, 39n, 35n, 42n, 49n, 56n],
  [13n, 15n, 31n, 29n,  4n, 36n, 43n, 50n, 57n],
  [14n, 30n,  5n, 37n, 44n, 51n, 58n],
  [17n, 33n, 10n, 42n,  3n, 51n, 60n],
  [16n, 18n, 34n, 32n, 11n, 43n,  4n, 52n, 61n],
  [17n, 19n, 35n, 33n,  8n, 12n, 44n, 40n,  5n, 53n, 62n],
  [18n, 20n, 36n, 34n,  9n, 13n, 45n, 41n,  0n,  6n, 54n, 48n, 63n],
  [19n, 21n, 37n, 35n, 10n, 14n, 46n, 42n,  1n,  7n, 55n, 49n, 56n],
  [20n, 22n, 38n, 36n, 11n, 15n, 47n, 43n,  2n, 50n, 57n],
  [21n, 23n, 39n, 37n, 12n, 44n,  3n, 51n, 58n],
  [22n, 38n, 13n, 45n,  4n, 52n, 59n],
  [25n, 41n, 18n, 50n, 11n, 59n,  4n],
  [24n, 26n, 42n, 40n, 19n, 51n, 12n, 60n,  5n],
  [25n, 27n, 43n, 41n, 16n, 20n, 52n, 48n, 13n, 61n,  6n],
  [26n, 28n, 44n, 42n, 17n, 21n, 53n, 49n,  8n, 14n, 62n, 56n, 7n],
  [27n, 29n, 45n, 43n, 18n, 22n, 54n, 50n,  9n, 15n, 63n, 57n, 0n],
  [28n, 30n, 46n, 44n, 19n, 23n, 55n, 51n, 10n, 58n,  1n],
  [29n, 31n, 47n, 45n, 20n, 52n, 11n, 59n,  2n],
  [30n, 46n, 21n, 53n, 12n, 60n,  3n],
  [33n, 49n, 26n, 58n, 19n, 12n,  5n],
  [32n, 34n, 50n, 48n, 27n, 59n, 20n, 13n,  6n],
  [33n, 35n, 51n, 49n, 24n, 28n, 60n, 56n, 21n, 14n,  7n],
  [34n, 36n, 52n, 50n, 25n, 29n, 61n, 57n, 16n, 22n, 15n],
  [35n, 37n, 53n, 51n, 26n, 30n, 62n, 58n, 17n, 23n,  8n],
  [36n, 38n, 54n, 52n, 27n, 31n, 63n, 59n, 18n,  9n,  0n],
  [37n, 39n, 55n, 53n, 28n, 60n, 19n, 10n,  1n],
  [38n, 54n, 29n, 61n, 20n, 11n,  2n],
  [41n, 57n, 34n, 27n, 20n, 13n,  6n],
  [40n, 42n, 58n, 56n, 35n, 28n, 21n, 14n,  7n],
  [41n, 43n, 59n, 57n, 32n, 36n, 29n, 22n, 15n],
  [42n, 44n, 60n, 58n, 33n, 37n, 24n, 30n, 23n],
  [43n, 45n, 61n, 59n, 34n, 38n, 25n, 31n, 16n],
  [44n, 46n, 62n, 60n, 35n, 39n, 26n, 17n,  8n],
  [45n, 47n, 63n, 61n, 36n, 27n, 18n,  9n,  0n],
  [46n, 62n, 37n, 28n, 19n, 10n,  1n],
  [49n, 42n, 35n, 28n, 21n, 14n,  7n],
  [48n, 50n, 43n, 36n, 29n, 22n, 15n],
  [49n, 51n, 40n, 44n, 37n, 30n, 23n],
  [50n, 52n, 41n, 45n, 32n, 38n, 31n],
  [51n, 53n, 42n, 46n, 33n, 39n, 24n],
  [52n, 54n, 43n, 47n, 34n, 25n, 16n],
  [53n, 55n, 44n, 35n, 26n, 17n,  8n],
  [54n, 45n, 36n, 27n, 18n,  9n,  0n]
];
