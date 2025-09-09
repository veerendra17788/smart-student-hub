const mongoose = require('mongoose');
require('dotenv').config();

async function cleanupEvents() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const Event = require('./models/Event');
    
    // Delete events with dates before September 9, 2025
    const result = await Event.deleteMany({
      date: { $lt: new Date('2025-09-09') }
    });
    
    console.log('Deleted', result.deletedCount, 'old events');
    
    // Show remaining events
    const remainingEvents = await Event.find({}).sort({ date: 1 });
    console.log('\nRemaining events:');
    remainingEvents.forEach(event => {
      console.log(`- ${event.title} | ${event.date.toISOString().split('T')[0]} | ${event.type}`);
    });
    
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

cleanupEvents();
