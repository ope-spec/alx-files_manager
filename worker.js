import Queue from 'bull';
import imageThumbnail from 'image-thumbnail';
import { promises as fs } from 'fs';
import { ObjectID } from 'mongodb';
import dbClient from './utils/db';

// Define Bull queues
const fileQueue = new Queue('fileQueue', 'redis://127.0.0.1:6379');
const userQueue = new Queue('userQueue', 'redis://127.0.0.1:6379');

// Function to generate thumbnail
async function generateThumbnail(width, localPath) {
  const thumbnail = await imageThumbnail(localPath, { width });
  return thumbnail;
}

// Process fileQueue
fileQueue.process(async (job, done) => {
  console.log('Processing file...');
  const { fileId, userId } = job.data;

  // Validate input data
  if (!fileId) {
    done(new Error('Missing fileId'));
    return;
  }
  if (!userId) {
    done(new Error('Missing userId'));
    return;
  }

  try {
    const filesCollection = dbClient.db.collection('files');
    const idObject = new ObjectID(fileId);
    const file = await filesCollection.findOne({ _id: idObject });

    if (!file) {
      console.log('File not found');
      done(new Error('File not found'));
      return;
    }

    const fileName = file.localPath;
    const thumbnail500 = await generateThumbnail(500, fileName);
    const thumbnail250 = await generateThumbnail(250, fileName);
    const thumbnail100 = await generateThumbnail(100, fileName);

    console.log('Writing files to system');
    const image500 = `${file.localPath}_500`;
    const image250 = `${file.localPath}_250`;
    const image100 = `${file.localPath}_100`;

    await Promise.all([
      fs.writeFile(image500, thumbnail500),
      fs.writeFile(image250, thumbnail250),
      fs.writeFile(image100, thumbnail100),
    ]);

    done();
  } catch (error) {
    done(error);
  }
});

// Process userQueue
userQueue.process(async (job, done) => {
  const { userId } = job.data;
  if (!userId) {
    done(new Error('Missing userId'));
    return;
  }

  try {
    const usersCollection = dbClient.db.collection('users');
    const idObject = new ObjectID(userId);
    const user = await usersCollection.findOne({ _id: idObject });

    if (user) {
      console.log(`Welcome ${user.email}!`);
      done();
    } else {
      console.log('User not found');
      done(new Error('User not found'));
    }
  } catch (error) {
    done(error);
  }
});
