import * as path from "path";
import * as fs from "fs";
import { TCard, TDatabase } from "./schema";

const dbLocation = path.resolve(process.cwd(), "lib", "./db.json");

export const getDb = (): TDatabase => {
  return JSON.parse(fs.readFileSync(dbLocation).toString());
};

const writeToDb = (...changes: ((database: TDatabase) => void)[]) => {
  const db = getDb();
  changes.forEach((change) => change(db));

  fs.writeFileSync(dbLocation, JSON.stringify(db, null, 2));
};

export const addCardByAscii = (ascii: string, card: TCard) => {
  writeToDb((db) => {
    db.positions[ascii] = {
      card,
    };
  });

  return card;
};

export const getCardByAscii = (ascii: string): TCard | undefined => {
  const db = getDb();

  return db.positions[ascii]?.card;
};
