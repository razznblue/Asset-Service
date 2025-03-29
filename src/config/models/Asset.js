import mongoose from "mongoose";
import {coreConnection} from "../db.js";

const CollectionName = "Asset";

const AssetSchema = new mongoose.Schema(
  {
    fileName: {type: String},
    url: {type: String},
    filePath: {type: String},
    driveId: {type: String},
    category: {type: String},
    folder: {type: String},
  },
  {timestamps: true, versionKey: false, collection: CollectionName}
);

export const Asset = coreConnection.model(CollectionName, AssetSchema);
