import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

function createDBConnection(uri) {
  const db = mongoose.createConnection(uri, {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
  });

  db.on('error', function(error) {
    console.error(`DB :: Connection Failed to ${this.name} ${JSON.stringify(error)}`);
    db.close().catch(() => console.error(`DB : Failed to close connection to ${this.name}`));
  })

  db.on('connected', function() {
    mongoose.set('debug', function(col, method, query, doc) {
      //console.debug(`DB :: connected to ${this.conn.name} ${col}.${method}(${JSON.stringify(query)},${JSON.stringify(doc)})`);
    });
    console.info(`DB :: connected to ${this.name}`);
  });

  db.on('disconnected', function() {
    console.info(`DB :: disconnected to ${this.name}`);
  })

  return db;
}

export const coreConnection = createDBConnection(process.env.MONGO_URI);