/**
 * For each index, representing a cell index, list an array of cell indices where this rook
 * could potentially move to or capture from that cell (provided the board state allows it).
 * Note: In a normal game it is not possible to have pawns on the last two ranks (closest to the player)
 *
 * Generated through:
 *   for (let x=0; x<8; ++x) {
 *     for (let y=0; y<8; ++y) {
 *       const n = x + y*8;
 *       rookCellToMoveCells[n] = [];
 *       for (let i=0; i<8; ++i) {
 *         if (i !== y) rookCellToMoveCells[n].push(BigInt(i + y*8));
 *         if (i !== x) rookCellToMoveCells[n].push(BigInt(x + i*8));
 *       }
 *     }
 *   }
 *
 * @type {BigInt[][]}
 */
export const rookCellToMoveCells = [
  [ 1n,   8n,  2n, 16n,  3n, 24n, 4n,  32n,  5n, 40n, 6n,  48n,  7n, 56n],
  [ 1n,   1n,  2n, 17n,  3n, 25n, 4n,  33n,  5n, 41n, 6n,  49n,  7n, 57n],
  [ 2n,   1n, 10n,  2n,  3n, 26n, 4n,  34n,  5n, 42n, 6n,  50n,  7n, 58n],
  [ 3n,   1n, 11n,  2n, 19n, 3n,  4n,  35n,  5n, 43n, 6n,  51n,  7n, 59n],
  [ 4n,   1n, 12n,  2n, 20n, 3n,  28n,  4n,  5n, 44n, 6n,  52n,  7n, 60n],
  [ 5n,   1n, 13n,  2n, 21n, 3n,  29n,  4n, 37n,  5n, 6n,  53n,  7n, 61n],
  [ 6n,   1n, 14n,  2n, 22n, 3n,  30n,  4n, 38n,  5n, 46n,  6n,  7n, 62n],
  [ 7n,   1n, 15n,  2n, 23n, 3n,  31n,  4n, 39n,  5n, 47n,  6n, 55n,  7n],
  [ 8n,   8n, 10n, 16n, 11n, 24n, 12n, 32n, 13n, 40n, 14n, 48n, 15n, 56n],
  [ 8n,   1n, 10n, 17n, 11n, 25n, 12n, 33n, 13n, 41n, 14n, 49n, 15n, 57n],
  [ 8n,   2n, 10n, 10n, 11n, 26n, 12n, 34n, 13n, 42n, 14n, 50n, 15n, 58n],
  [ 8n,   3n, 11n, 10n, 19n, 11n, 12n, 35n, 13n, 43n, 14n, 51n, 15n, 59n],
  [ 8n,   4n, 12n, 10n, 20n, 11n, 28n, 12n, 13n, 44n, 14n, 52n, 15n, 60n],
  [ 8n,   5n, 13n, 10n, 21n, 11n, 29n, 12n, 37n, 13n, 14n, 53n, 15n, 61n],
  [ 8n,   6n, 14n, 10n, 22n, 11n, 30n, 12n, 38n, 13n, 46n, 14n, 15n, 62n],
  [ 8n,   7n, 15n, 10n, 23n, 11n, 31n, 12n, 39n, 13n, 47n, 14n, 55n, 15n],
  [ 16n, 17n,  8n, 16n, 19n, 24n, 20n, 32n, 21n, 40n, 22n, 48n, 23n, 56n],
  [ 16n,  1n, 17n, 17n, 19n, 25n, 20n, 33n, 21n, 41n, 22n, 49n, 23n, 57n],
  [ 16n,  2n, 17n, 10n, 19n, 26n, 20n, 34n, 21n, 42n, 22n, 50n, 23n, 58n],
  [ 16n,  3n, 17n, 11n, 19n, 19n, 20n, 35n, 21n, 43n, 22n, 51n, 23n, 59n],
  [ 16n,  4n, 17n, 12n, 20n, 19n, 28n, 20n, 21n, 44n, 22n, 52n, 23n, 60n],
  [ 16n,  5n, 17n, 13n, 21n, 19n, 29n, 20n, 37n, 21n, 22n, 53n, 23n, 61n],
  [ 16n,  6n, 17n, 14n, 22n, 19n, 30n, 20n, 38n, 21n, 46n, 22n, 23n, 62n],
  [ 16n,  7n, 17n, 15n, 23n, 19n, 31n, 20n, 39n, 21n, 47n, 22n, 55n, 23n],
  [ 24n, 25n,  8n, 26n, 16n, 24n, 28n, 32n, 29n, 40n, 30n, 48n, 31n, 56n],
  [ 24n,  1n, 25n, 26n, 17n, 25n, 28n, 33n, 29n, 41n, 30n, 49n, 31n, 57n],
  [ 24n,  2n, 25n, 10n, 26n, 26n, 28n, 34n, 29n, 42n, 30n, 50n, 31n, 58n],
  [ 24n,  3n, 25n, 11n, 26n, 19n, 28n, 35n, 29n, 43n, 30n, 51n, 31n, 59n],
  [ 24n,  4n, 25n, 12n, 26n, 20n, 28n, 28n, 29n, 44n, 30n, 52n, 31n, 60n],
  [ 24n,  5n, 25n, 13n, 26n, 21n, 29n, 28n, 37n, 29n, 30n, 53n, 31n, 61n],
  [ 24n,  6n, 25n, 14n, 26n, 22n, 30n, 28n, 38n, 29n, 46n, 30n, 31n, 62n],
  [ 24n,  7n, 25n, 15n, 26n, 23n, 31n, 28n, 39n, 29n, 47n, 30n, 55n, 31n],
  [ 32n, 33n,  8n, 34n, 16n, 35n, 24n, 32n, 37n, 40n, 38n, 48n, 39n, 56n],
  [ 32n,  1n, 33n, 34n, 17n, 35n, 25n, 33n, 37n, 41n, 38n, 49n, 39n, 57n],
  [ 32n,  2n, 33n, 10n, 34n, 35n, 26n, 34n, 37n, 42n, 38n, 50n, 39n, 58n],
  [ 32n,  3n, 33n, 11n, 34n, 19n, 35n, 35n, 37n, 43n, 38n, 51n, 39n, 59n],
  [ 32n,  4n, 33n, 12n, 34n, 20n, 35n, 28n, 37n, 44n, 38n, 52n, 39n, 60n],
  [ 32n,  5n, 33n, 13n, 34n, 21n, 35n, 29n, 37n, 37n, 38n, 53n, 39n, 61n],
  [ 32n,  6n, 33n, 14n, 34n, 22n, 35n, 30n, 38n, 37n, 46n, 38n, 39n, 62n],
  [ 32n,  7n, 33n, 15n, 34n, 23n, 35n, 31n, 39n, 37n, 47n, 38n, 55n, 39n],
  [ 40n, 41n,  8n, 42n, 16n, 43n, 24n, 44n, 32n, 40n, 46n, 48n, 47n, 56n],
  [ 40n,  1n, 41n, 42n, 17n, 43n, 25n, 44n, 33n, 41n, 46n, 49n, 47n, 57n],
  [ 40n,  2n, 41n, 10n, 42n, 43n, 26n, 44n, 34n, 42n, 46n, 50n, 47n, 58n],
  [ 40n,  3n, 41n, 11n, 42n, 19n, 43n, 44n, 35n, 43n, 46n, 51n, 47n, 59n],
  [ 40n,  4n, 41n, 12n, 42n, 20n, 43n, 28n, 44n, 44n, 46n, 52n, 47n, 60n],
  [ 40n,  5n, 41n, 13n, 42n, 21n, 43n, 29n, 44n, 37n, 46n, 53n, 47n, 61n],
  [ 40n,  6n, 41n, 14n, 42n, 22n, 43n, 30n, 44n, 38n, 46n, 46n, 47n, 62n],
  [ 40n,  7n, 41n, 15n, 42n, 23n, 43n, 31n, 44n, 39n, 47n, 46n, 55n, 47n],
  [ 48n, 49n,  8n, 50n, 16n, 51n, 24n, 52n, 32n, 53n, 40n, 48n, 55n, 56n],
  [ 48n,  1n, 49n, 50n, 17n, 51n, 25n, 52n, 33n, 53n, 41n, 49n, 55n, 57n],
  [ 48n,  2n, 49n, 10n, 50n, 51n, 26n, 52n, 34n, 53n, 42n, 50n, 55n, 58n],
  [ 48n,  3n, 49n, 11n, 50n, 19n, 51n, 52n, 35n, 53n, 43n, 51n, 55n, 59n],
  [ 48n,  4n, 49n, 12n, 50n, 20n, 51n, 28n, 52n, 53n, 44n, 52n, 55n, 60n],
  [ 48n,  5n, 49n, 13n, 50n, 21n, 51n, 29n, 52n, 37n, 53n, 53n, 55n, 61n],
  [ 48n,  6n, 49n, 14n, 50n, 22n, 51n, 30n, 52n, 38n, 53n, 46n, 55n, 62n],
  [ 48n,  7n, 49n, 15n, 50n, 23n, 51n, 31n, 52n, 39n, 53n, 47n, 55n, 55n],
  [ 56n, 57n,  8n, 58n, 16n, 59n, 24n, 60n, 32n, 61n, 40n, 62n, 48n, 56n],
  [ 56n,  1n, 57n, 58n, 17n, 59n, 25n, 60n, 33n, 61n, 41n, 62n, 49n, 57n],
  [ 56n,  2n, 57n, 10n, 58n, 59n, 26n, 60n, 34n, 61n, 42n, 62n, 50n, 58n],
  [ 56n,  3n, 57n, 11n, 58n, 19n, 59n, 60n, 35n, 61n, 43n, 62n, 51n, 59n],
  [ 56n,  4n, 57n, 12n, 58n, 20n, 59n, 28n, 60n, 61n, 44n, 62n, 52n, 60n],
  [ 56n,  5n, 57n, 13n, 58n, 21n, 59n, 29n, 60n, 37n, 61n, 62n, 53n, 61n],
  [ 56n,  6n, 57n, 14n, 58n, 22n, 59n, 30n, 60n, 38n, 61n, 46n, 62n, 62n],
  [ 56n,  7n, 57n, 15n, 58n, 23n, 59n, 31n, 60n, 39n, 61n, 47n, 62n, 55n]
];
