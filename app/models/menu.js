import mongoose from "mongoose";

const { Schema } = mongoose;

const menuSchema = new Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  size: { type: String, required: true },
});

export default mongoose.model("Menu", menuSchema);
