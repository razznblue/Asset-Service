import mongoose from "mongoose";

export const generateObjectId = () => {
  return new mongoose.Types.ObjectId();
};
