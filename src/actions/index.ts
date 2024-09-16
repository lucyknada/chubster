import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import * as fs from 'fs';

export const server = {
  banAuthor: defineAction({
    input: z.object({
      author_id: z.number(),
      card_id: z.number()
    }),
    handler: async (input) => {
      if (import.meta.env.PUBLIC_BAN_AUTHORS == 0) return;
      if (input.author_id > 0) {
        const database = JSON.parse(fs.readFileSync("database.json", "utf-8") || "{}");
        fs.writeFileSync("database.json", JSON.stringify({ ...(database || []), banned_authors: [...(database?.banned_authors || []), input.author_id] }))
      }

      if (input.author_id < 0) {
        const database = JSON.parse(fs.readFileSync("database.json", "utf-8") || "{}");
        fs.writeFileSync("database.json", JSON.stringify({ ...(database || []), banned_cards: [...(database?.banned_cards || []), input.card_id] }))
      }
    }
  }),
  getBannedAuthors: defineAction({
    handler: async () => {
      if (import.meta.env.PUBLIC_BAN_AUTHORS == 0) return;
      const database = JSON.parse(fs.readFileSync("database.json", "utf-8") || "{}");
      return database.banned_authors || [];
    }
  }),
  getFilteredCards: defineAction({
    handler: async () => {
      if (import.meta.env.PUBLIC_BAN_AUTHORS == 0) return;
      const database = JSON.parse(fs.readFileSync("database.json", "utf-8") || "{}");
      return database.banned_cards || [];
    }
  }),
}