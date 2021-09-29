import { NextApiHandler } from "next";
import { z } from "zod";
import { addCardByAscii, getCardByAscii, getDb } from "../../lib/db";
import { Card } from "../../lib/schema";

const handler: NextApiHandler = (req, res) => {
  res.json(getDb());
};

export default handler;
