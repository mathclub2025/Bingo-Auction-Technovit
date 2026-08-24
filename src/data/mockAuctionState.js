export const mockAuctionRounds = {
  roundName: 'Round 2: Fibonacci Sequence',
  activeItem: {
    id: '#A-204',
    name: 'The Golden Ratio',
    symbol: '\u03C6', // Greek letter phi
    symbolName: 'Phi',
    description: 'The irrational number approximately equal to 1.618. Representing beauty, harmony, and proportion.',
    basePrice: 3000,
    timeRemaining: '02:45',
    qualificationChallenge: {
      question: 'Solve for x\u00B2 - x - 1 = 0. Submit the rounded integer solution to unlock bidding.',
      correctAnswer: '2',
    }
  }
};

export const initialTeamsData = [
  { id: 'team-1', name: 'Theorem Titans', number: 12, coins: 50000, numbers: [3, 7, 12, 19], rank: 4 },
  { id: 'team-2', name: 'Prime Pioneers', number: 4, coins: 45000, numbers: [2, 11, 23], rank: 8 },
  { id: 'team-3', name: 'Vector Vanguards', number: 17, coins: 38000, numbers: [5, 29], rank: 12 },
  { id: 'team-4', name: 'Integral Innovators', number: 9, coins: 52000, numbers: [8, 14, 33, 44], rank: 2 },
  { id: 'team-5', name: 'Matrix Mavericks', number: 15, coins: 41000, numbers: [18, 25, 49], rank: 9 },
  { id: 'team-6', name: 'Limit Legends', number: 22, coins: 49500, numbers: [1, 30], rank: 6 }
];

export const mockMilestones = [
  { id: 'm1', name: 'Round 1 Passed', status: 'passed' },
  { id: 'm2', name: 'Round 2 In Progress', status: 'active' },
  { id: 'm3', name: 'Finals Locked', status: 'locked' }
];

export const mockCoinHistory = {
  'team-1': [
    { id: 'h1', description: 'Won Bid: Number 19', round: 'Round 2', amount: -350, type: 'bid-win' },
    { id: 'h2', description: 'Won Bid: Number 12', round: 'Round 2', amount: -200, type: 'bid-win' },
    { id: 'h3', description: 'Won Bid: Number 7', round: 'Round 1', amount: -150, type: 'bid-win' },
    { id: 'h4', description: 'Won Bid: Number 3', round: 'Round 1', amount: -50, type: 'bid-win' },
    { id: 'h5', description: 'Starting Balance', round: 'Initial Allocation', amount: 2000, type: 'credit' }
  ],
  'team-2': [
    { id: 'h1', description: 'Won Bid: Number 11', round: 'Round 2', amount: -500, type: 'bid-win' },
    { id: 'h2', description: 'Won Bid: Number 23', round: 'Round 2', amount: -400, type: 'bid-win' },
    { id: 'h3', description: 'Starting Balance', round: 'Initial Allocation', amount: 2000, type: 'credit' }
  ]
};
