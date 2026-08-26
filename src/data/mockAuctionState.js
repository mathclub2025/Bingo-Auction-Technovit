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
  {
    id: 'team-1',
    name: 'Theorem Titans',
    number: 12,
    coins: 50000,
    numbers: [3, 7, 12, 19],
    rank: 4,
    captain: { name: 'Aarav Sharma', regNo: '22BCE1024' },
    members: [
      { name: 'Aarav Sharma', regNo: '22BCE1024', role: 'Captain', addedAt: 'Initial' },
      { name: 'Riya Gupta', regNo: '22BCE1089', role: 'Teammate', addedAt: 'Round 1' },
      { name: 'Kavya Nair', regNo: '22BSE0312', role: 'Teammate', addedAt: 'Round 1' },
    ],
  },
  {
    id: 'team-2',
    name: 'Prime Pioneers',
    number: 4,
    coins: 45000,
    numbers: [2, 11, 23],
    rank: 8,
    captain: { name: 'Aditya Verma', regNo: '22BSE0452' },
    members: [
      { name: 'Aditya Verma', regNo: '22BSE0452', role: 'Captain', addedAt: 'Initial' },
      { name: 'Sneha Patel', regNo: '22BCE1140', role: 'Teammate', addedAt: 'Round 1' },
    ],
  },
  {
    id: 'team-3',
    name: 'Vector Vanguards',
    number: 17,
    coins: 38000,
    numbers: [5, 29],
    rank: 12,
    captain: { name: 'Rohan Mehta', regNo: '23BIT0128' },
    members: [
      { name: 'Rohan Mehta', regNo: '23BIT0128', role: 'Captain', addedAt: 'Initial' },
    ],
  },
  {
    id: 'team-4',
    name: 'Integral Innovators',
    number: 9,
    coins: 52000,
    numbers: [8, 14, 33, 44],
    rank: 2,
    captain: { name: 'Ananya Rao', regNo: '22BCE2050' },
    members: [
      { name: 'Ananya Rao', regNo: '22BCE2050', role: 'Captain', addedAt: 'Initial' },
      { name: 'Devansh Joshi', regNo: '22BCE2091', role: 'Teammate', addedAt: 'Round 1' },
    ],
  },
  {
    id: 'team-5',
    name: 'Matrix Mavericks',
    number: 15,
    coins: 41000,
    numbers: [18, 25, 49],
    rank: 9,
    captain: { name: 'Vikram Singh', regNo: '21BCE0411' },
    members: [
      { name: 'Vikram Singh', regNo: '21BCE0411', role: 'Captain', addedAt: 'Initial' },
    ],
  },
  {
    id: 'team-6',
    name: 'Limit Legends',
    number: 22,
    coins: 49500,
    numbers: [1, 30],
    rank: 6,
    captain: { name: 'Priya Iyer', regNo: '22BIT0095' },
    members: [
      { name: 'Priya Iyer', regNo: '22BIT0095', role: 'Captain', addedAt: 'Initial' },
    ],
  },
];

// Pre-registered Student Directory for registration verification simulation
export const mockStudentDirectory = {
  '22BCE1024': 'Aarav Sharma',
  '22BCE1089': 'Riya Gupta',
  '22BSE0312': 'Kavya Nair',
  '22BSE0452': 'Aditya Verma',
  '22BCE1140': 'Sneha Patel',
  '23BIT0128': 'Rohan Mehta',
  '22BCE2050': 'Ananya Rao',
  '22BCE2091': 'Devansh Joshi',
  '21BCE0411': 'Vikram Singh',
  '22BIT0095': 'Priya Iyer',
  '22BCE1580': 'Siddharth Roy',
  '22BSE0845': 'Neha Kulkarni',
  '23BCE0294': 'Arjun Reddy',
  '23BSE0119': 'Diya Sen',
  '22BIT0412': 'Karan Agarwal',
};

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
