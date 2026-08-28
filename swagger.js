const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'EventEase API Documentation',
    description: 'Multi-Vendor Event Management System API Documentation',
    version: '1.0.0'
  },
  host: 'localhost:5000',
  schemes: ['http', 'https'],
  
  // 🔐 Bearer Security Definition
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'Enter your JWT token in the format: Bearer <your_token>'
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],

  tags: [
    { name: 'Authentication', description: 'User login and signup' },
    { name: 'Bookings', description: 'Event booking endpoints' },
    { name: 'Payments', description: 'Stripe gateway integration' },
    { name: 'Admin', description: 'Management controls' },
    { name: 'Vendors', description: 'Vendor profiles and locations' },
    { name: 'Chat', description: 'Real-time communication' },
    { name: 'Ratings & Feedback', description: 'Vendor reviews' }
  ]
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./server.js'];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log("⚡ Swagger JSON file refreshed with Auth Support!");
});