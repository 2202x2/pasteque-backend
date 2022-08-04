import mongoose from "mongoose";

export const schema = mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
});

export const model = mongoose.model("pasteque", schema);

export default model;
