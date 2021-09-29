import * as z from "zod";
import { lichess } from "./fetchFromLichess";
import {
  Card,
  Database,
  LichessCloudEvalResult,
  LichessExplorerResult,
  TCard,
} from "./schema";

const ENDPOINT = "https://api.magicthegathering.io/v1";

export const api = {
  mtg: {
    searchForCard: async (search: string) => {
      const result = await fetch(
        `${ENDPOINT}/cards?name=${search}&pageSize=4`,
      ).then((res) => res.json());

      const schema = z.object({
        cards: z.array(Card),
      });

      return schema.parse(result);
    },
    cardById: async (id: string) => {
      const result = await fetch(`${ENDPOINT}/cards/${id}`).then((res) =>
        res.json(),
      );

      return Card.parse(result);
    },
  },
  db: {
    getDb: async () => {
      const result = await fetch(`/api/db`).then((res) => res.json());
      return Database.parse(result);
    },
    getCardByAscii: async (ascii: string): Promise<TCard | undefined> => {
      return fetch(`/api/card/${encodeURIComponent(ascii)}`).then((res) =>
        res.json(),
      );
    },
    setCardToAscii: (ascii: string, card: TCard) => {
      return fetch(`/api/card/${encodeURIComponent(ascii)}`, {
        method: "POST",
        body: JSON.stringify(card),
      }).then((res) => res.json());
    },
  },
  lichess: {
    getMasterGamesByFen: async (fen: string) => {
      const result = await lichess.get(
        `https://explorer.lichess.ovh/master?fen=${encodeURIComponent(
          fen,
        )}&moves=6`,
        LichessExplorerResult,
      );

      return result;
    },
    getCloudEvalByFen: async (fen: string) => {
      const result = await lichess.get(
        `https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(
          fen,
        )}&multiPv=3`,
        LichessCloudEvalResult,
      );

      return result;
    },
  },
};
