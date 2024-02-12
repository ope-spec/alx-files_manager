import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const {
      DB_HOST: host = 'localhost',
      DB_PORT: port = 27017,
      DB_DATABASE: database = 'files_manager',
    } = process.env;

    this.host = host;
    this.port = port;
    this.database = database;

    const uri = `mongodb://${host}:${port}`;
    this.client = new MongoClient(uri, { useUnifiedTopology: true });
    this.client.connect();
    this.db = this.client.db(database);
  }

  isAlive() {
    return !!this.client && this.client.isConnected();
  }

  async nbUsers() {
    const usersCollection = this.db.collection('users');
    return usersCollection.countDocuments();
  }

  async nbFiles() {
    const filesCollection = this.db.collection('files');
    return filesCollection.countDocuments();
  }
}

const dbClient = new DBClient();
export default dbClient;
