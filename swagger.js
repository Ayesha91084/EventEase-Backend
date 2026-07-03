const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'EventEase API Documentation',
    description: 'Multi-Vendor Event Management System API Documentation (Auto-Generated)',
  },
  host: 'localhost:5000',
  schemes: ['http', 'https'],
  // 👇 Yeh tags lagane se auto-grouping ho jaye gi routes ke mutabiq
  tags: [
    { name: 'Authentication', description: 'User login, signup, and token verification' },
    { name: 'Bookings', description: 'Event booking and scheduling endpoints' },
    { name: 'Payments', description: 'Stripe gateway integration logs' },
    { name: 'Admin', description: 'System telemetry and management controls' },
    { name: 'Vendors', description: 'Vendor profiles, onboarding, and locations' },
    { name: 'Chat', description: 'Real-time communication logs' },
    { name: 'Ratings & Feedback', description: 'Vendor review management' }
  ]
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./server.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);