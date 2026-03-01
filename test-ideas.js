// Test ideas for drag functionality testing
const testIdeas = [
  {
    id: 'idea-1',
    title: 'Machine Learning Project',
    description: 'Build a recommendation system for e-commerce',
    category: 'Tech',
    tags: ['AI', 'Python', 'TensorFlow'],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: [],
    connections: ['idea-2', 'idea-3'],
    position: { x: 200, y: 150 }
  },
  {
    id: 'idea-2',
    title: 'Data Visualization',
    description: 'Create interactive dashboards for business analytics',
    category: 'Design',
    tags: ['React', 'D3.js', 'Charts'],
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: [],
    connections: ['idea-1', 'idea-4'],
    position: { x: 450, y: 100 }
  },
  {
    id: 'idea-3',
    title: 'Mobile App Development',
    description: 'Native iOS and Android app with React Native',
    category: 'Mobile',
    tags: ['React Native', 'iOS', 'Android'],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: [],
    connections: ['idea-1', 'idea-5'],
    position: { x: 100, y: 300 }
  },
  {
    id: 'idea-4',
    title: 'API Design',
    description: 'RESTful API with GraphQL integration',
    category: 'Backend',
    tags: ['Node.js', 'GraphQL', 'MongoDB'],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: [],
    connections: ['idea-2'],
    position: { x: 600, y: 200 }
  },
  {
    id: 'idea-5',
    title: 'UI/UX Research',
    description: 'User experience research and prototyping',
    category: 'Design',
    tags: ['Figma', 'Prototyping', 'User Research'],
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: [],
    connections: ['idea-3'],
    position: { x: 300, y: 400 }
  }
];

console.log('Test ideas created for drag testing:');
testIdeas.forEach((idea, index) => {
  console.log(`${index + 1}. ${idea.title} (${idea.connections.length} connections)`);
});

// Add to localStorage
localStorage.setItem('ideaWeaverIdeas', JSON.stringify(testIdeas));
console.log('✅ Test ideas added to localStorage! Refresh the page to see them.');

// Instructions for testing
console.log('\n📋 Testing Instructions:');
console.log('1. Refresh the page to load the test ideas');
console.log('2. Switch to "Graph" view to test IdeaGraph drag');
console.log('3. Switch to "Mindmap" view to test EnhancedMindMap drag');
console.log('4. Try dragging individual nodes and connected node groups');
console.log('5. Test zoom in/out and pan functionality');
console.log('6. Check frame rates and smooth movement');
