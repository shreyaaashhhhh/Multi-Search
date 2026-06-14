require('dotenv').config();
const { MongoClient } = require('mongodb');
const uri = process.env.DBURL;
(async () => {
  try {
    if (!uri) throw new Error('DBURL not set in .env');
    const client = new MongoClient(uri);
    await client.connect();
    console.log('Mongo connected OK');
    await client.close();
  } catch (e) {
    console.error('Connection test failed:');
    console.error(e);
    process.exit(1);
  }
})();
