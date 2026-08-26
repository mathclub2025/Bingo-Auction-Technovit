export const initialTeamsData = [];

export const mockAuctionRounds = {
  roundName: 'Round 2: Fibonacci & Prime Numbers',
  activeItem: {
    id: 'NUM-12',
    symbol: 'Fn',
    symbolName: 'Fibonacci Sequence Card #12',
    description: 'Item 12 completes sequence paths for horizontal & vertical bingo lines.',
    basePrice: 5000,
    timeRemaining: '01:45',
    qualificationChallenge: {
      question: 'Solve for x: If F(7) = 13 and F(6) = 8, what is F(8) / 7 rounded to nearest integer?',
      correctAnswer: '3',
    },
  },
};

export const mockMilestones = [
  { id: 'm-1', name: 'Starting Gate (50k Coins)', status: 'passed' },
  { id: 'm-2', name: '3 Numbers Acquired', status: 'passed' },
  { id: 'm-3', name: 'Fibonacci Line Match (5 Numbers)', status: 'active' },
  { id: 'm-4', name: 'Bingo Double Line (10 Numbers)', status: 'locked' },
  { id: 'm-5', name: 'Grand Tournament Finalist', status: 'locked' },
];

export const mockCoinHistory = {
  'team-1': [
    { id: 'tx-1', description: 'Starting tournament balance', round: 'Kickoff', amount: 50000 },
    { id: 'tx-2', description: 'Acquired Number #7 in Round 1', round: 'Round 1', amount: -6000 },
    { id: 'tx-3', description: 'Bonus coins for fastest qualification', round: 'Round 1', amount: 2000 },
    { id: 'tx-4', description: 'Acquired Number #18 in Round 1', round: 'Round 1', amount: -5500 },
    { id: 'tx-5', description: 'Incorrect answer penalty', round: 'Round 2', amount: -1000 },
  ],
  'team-2': [
    { id: 'tx-201', description: 'Starting tournament balance', round: 'Kickoff', amount: 50000 },
    { id: 'tx-202', description: 'Acquired Number #5 in Round 1', round: 'Round 1', amount: -8000 },
  ],
  'team-3': [
    { id: 'tx-301', description: 'Starting tournament balance', round: 'Kickoff', amount: 50000 },
    { id: 'tx-302', description: 'Acquired Number #14 in Round 1', round: 'Round 1', amount: -7000 },
    { id: 'tx-303', description: 'Bonus coins for challenge solution', round: 'Round 1', amount: 5000 },
  ],
  'team-4': [
    { id: 'tx-401', description: 'Starting tournament balance', round: 'Kickoff', amount: 50000 },
    { id: 'tx-402', description: 'Acquired Number #2 in Round 1', round: 'Round 1', amount: -4000 },
    { id: 'tx-403', description: 'Acquired Number #9 in Round 1', round: 'Round 1', amount: -6000 },
    { id: 'tx-404', description: 'Fastest solver bonus prize', round: 'Round 1', amount: 15000 },
  ],
  'team-5': [
    { id: 'tx-501', description: 'Starting tournament balance', round: 'Kickoff', amount: 50000 },
    { id: 'tx-502', description: 'Acquired Number #1 in Round 1', round: 'Round 1', amount: -12000 },
  ],
  'team-6': [
    { id: 'tx-601', description: 'Starting tournament balance', round: 'Kickoff', amount: 50000 },
    { id: 'tx-602', description: 'Acquired Number #6 in Round 1', round: 'Round 1', amount: -10000 },
  ],
};
