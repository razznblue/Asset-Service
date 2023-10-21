import mongoose from 'mongoose';
import { coreConnection } from '../db.js';

const CollectionName = "Folder";

const FolderSchema = new mongoose.Schema (
  {
    name: { type: String },
    driveId: { type: String },
    category: { type: String }
  }, { timestamps: true, versionKey: false, collection: CollectionName }
);

export const Folder = coreConnection.model(CollectionName, FolderSchema);