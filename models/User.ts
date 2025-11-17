import { Schema, model, models } from "mongoose";

const UserLoginSchema = new Schema(
  {
    name: { type: String },
    login: { type: String, required: true },
    parol: { type: String, required: true },
    role: { type: String },
  },
  { timestamps: true }
);

const UserLoginCollection =
  models.UserLoginCollection || model("UserLoginCollection", UserLoginSchema);

export default UserLoginCollection;
