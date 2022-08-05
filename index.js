import express from "express";
import { customAlphabet } from "nanoid";
import mongoose from "mongoose";
import "dotenv/config";
import mongodb from "./mongodb.js";
import cors from "cors";
const app = express();

const nanoid = customAlphabet(
  "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  8
);

function log(msg) {
  console.log(`[${new Date()}] | ${msg}`);
}

mongoose.connect(process.env.MONGODB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());
app.use(cors());

app.post("/v1/create", async (req, res) => {
  const text = req.body.text;
  const id = nanoid();
  const findExistingText = await mongodb.findOne({ text: text });
  const time = +new Date();
  if (text === undefined || text.length === 0) {
    res.status(400).send({ message: "No text entered." });
  } else {
    if (findExistingText === null) {
      try {
        const db = new mongodb({ text: text, id: id, time: time });
        db.save();
        log(`New Slice: ${text}, id: ${id}`);
        res.status(200).send({ message: "Success", id: id });
      } catch (e) {
        res.status(500).send({ message: `Internal server error: ${e}` });
      }
    } else {
      res
        .status(302)
        .send({ message: "Already exists", id: findExistingText.id });
      log(`Redirect Slice: ${text}, id: ${id}`);
    }
  }
});

app.get("/v1/search/:id", async (req, res) => {
  const id = req.params.id;
  const findExistingId = await mongodb.findOne({ id: id });
  if (findExistingId === null) {
    res
      .status(404)
      .send({ id: id, message: `Couldn't find text corresponding to ${id}` });
  } else {
    res.status(200).send({
      text: findExistingId.text,
      id: id,
      message: "Success",
      time: findExistingId.time,
    });
  }
});

const port = process.env.PORT || 8001;

app.listen(port, () => {
  console.log(`[Pasteque] Listening on port ${port}`);
});
