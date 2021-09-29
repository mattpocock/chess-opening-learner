import { NextApiHandler } from "next";
import { z } from "zod";
import { addCardByAscii, getCardByAscii } from "../../../lib/db";
import { Card } from "../../../lib/schema";

const Query = z.object({
  ascii: z.string(),
});

const handler: NextApiHandler = (req, res) => {
  try {
    const query = Query.parse(req.query);

    if (req.method === "POST") {
      res.json(addCardByAscii(query.ascii, Card.parse(JSON.parse(req.body))));
    } else if (req.method === "GET") {
      res.json(getCardByAscii(query.ascii as string));
    }
  } catch (e: any) {
    console.log(e);
    res.json({ message: e.message });
  }
};

export default handler;
