/**
 * 4 Official Bingo Card Sets (5x5 matrices with numbers 1-25)
 */
export const BINGO_CARD_SETS = {
  1: [
    [14, 3, 21, 7, 18],
    [9, 25, 12, 2, 16],
    [22, 5, 19, 11, 1],
    [8, 15, 4, 20, 24],
    [6, 17, 10, 23, 13]
  ],
  2: [
    [2, 19, 8, 24, 11],
    [15, 5, 21, 13, 7],
    [25, 10, 16, 4, 20],
    [1, 23, 9, 18, 14],
    [12, 6, 22, 17, 3]
  ],
  3: [
    [20, 11, 5, 18, 23],
    [2, 15, 24, 8, 17],
    [14, 7, 19, 3, 10],
    [25, 13, 1, 22, 6],
    [9, 21, 12, 16, 4]
  ],
  4: [
    [7, 24, 13, 2, 19],
    [11, 5, 20, 16, 9],
    [22, 15, 1, 25, 14],
    [4, 18, 10, 8, 23],
    [17, 12, 21, 3, 6]
  ]
};

/**
 * Generates all 12 lines (5 horizontal rows, 5 vertical columns, 2 diagonals) for a 5x5 grid
 */
function getGridLines(grid) {
  const lines = [];

  // 5 Horizontal Rows
  for (let r = 0; r < 5; r++) {
    lines.push(grid[r]);
  }

  // 5 Vertical Columns
  for (let c = 0; c < 5; c++) {
    const col = [];
    for (let r = 0; r < 5; r++) {
      col.push(grid[r][c]);
    }
    lines.push(col);
  }

  // 2 Diagonals
  const diag1 = [];
  const diag2 = [];
  for (let i = 0; i < 5; i++) {
    diag1.push(grid[i][i]);
    diag2.push(grid[i][4 - i]);
  }
  lines.push(diag1);
  lines.push(diag2);

  return lines;
}

/**
 * Evaluates a team's numbers against their assigned Bingo Card Set.
 * Win Rule: Even if ANY ONE line (horizontal, vertical, or diagonal) is completed (5/5), the team WINS!
 *
 * @param {number|string} setNumber - 1, 2, 3, or 4
 * @param {number[]} numbersCollected - array of won numbers e.g. [7, 14, 20]
 * @returns {{ isWinner: boolean, completedLinesCount: number, requiredNumbers: number[] }}
 */
export function evaluateBingoCard(setNumber = 1, numbersCollected = []) {
  const setKey = Number(setNumber) || 1;
  const grid = BINGO_CARD_SETS[setKey] || BINGO_CARD_SETS[1];
  const collectedSet = new Set((numbersCollected || []).map(Number));

  const lines = getGridLines(grid);
  let isWinner = false;
  let completedLinesCount = 0;
  const requiredNumbersSet = new Set();

  for (const line of lines) {
    const missingNumbers = line.filter(num => !collectedSet.has(num));

    if (missingNumbers.length === 0) {
      // Completed full line (horizontal, vertical, or diagonal)
      isWinner = true;
      completedLinesCount++;
    } else if (missingNumbers.length === 1) {
      // 1 number away from completing this line
      requiredNumbersSet.add(missingNumbers[0]);
    }
  }

  const requiredNumbers = Array.from(requiredNumbersSet).sort((a, b) => a - b);

  return {
    isWinner,
    completedLinesCount,
    requiredNumbers
  };
}
