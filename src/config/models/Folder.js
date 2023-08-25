import mongoose from 'mongoose';
import { coreConnection } from '../db.js';

const CollectionName = "Folder";

const AdminSchema = new mongoose.Schema (
  {
    driveFolderId: { type: String },
  }, { timestamps: false, versionKey: false, collection: CollectionName }
);

export const Folder = coreConnection.model(CollectionName, AdminSchema);