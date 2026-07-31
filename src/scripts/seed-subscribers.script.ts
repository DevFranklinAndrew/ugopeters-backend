import mongoose from "mongoose";
import envConfig from "../configurations/env.configuration";
import Subscriber, { type ISubscriber } from "../models/subscriber.model";

/**
 * Seeds a batch of newsletter subscribers so the admin page has enough data to
 * demonstrate pagination (10 per page), email search, and the period filter.
 * Idempotent: every seeded doc uses an `@seed.example` email, so a re-run clears
 * the previous batch first and leaves real subscribers untouched.
 * Run with `npm run seed:subscribers`.
 */

const SEED_DOMAIN = "seed.example";
const COUNT = 24; // → 3 pages at 10/page (10, 10, 4)

const HANDLES = [
  "adaeze.nwankwo",
  "emeka.okafor",
  "ngozi.okonjo",
  "david.mensah",
  "fatima.bello",
  "tunde.adeyemi",
  "chioma.eze",
  "kwame.asante",
  "amara.diallo",
  "ifeoma.nwosu",
  "sekou.traore",
  "zainab.sadiq",
  "obinna.ekwueme",
  "lerato.molefe",
  "yusuf.abubakar",
  "grace.wanjiru",
  "chidi.obi",
  "nadia.hassan",
  "samuel.otieno",
  "bisi.ogunleye",
  "kofi.mensah",
  "halima.yusuf",
  "uche.kalu",
  "thabo.nkosi",
];

const buildSubscribers = (): Array<
  Pick<ISubscriber, "email"> & { createdAt: Date; updatedAt: Date }
> => {
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  return Array.from({ length: COUNT }, (_, i) => {
    const handle = HANDLES[i % HANDLES.length];
    // Spread ~2 days apart so newest-first ordering and the period filter
    // (last 7 / 30 days) have something meaningful to show.
    const createdAt = new Date(now - i * 2 * DAY);

    return {
      email: `${handle}.${i}@${SEED_DOMAIN}`,
      createdAt,
      updatedAt: createdAt,
    };
  });
};

const seedSubscribers = async (): Promise<void> => {
  try {
    await mongoose.connect(envConfig.MONGO_URI);
    console.log("[seed] Connected to MongoDB");

    const removed = await Subscriber.deleteMany({
      email: new RegExp(`@${SEED_DOMAIN}$`),
    });
    if (removed.deletedCount) {
      console.log(
        `[seed] Cleared ${removed.deletedCount} previous seed subscribers.`,
      );
    }

    const docs = buildSubscribers();
    // Disable auto-timestamps so our spread-out createdAt values persist.
    await Subscriber.insertMany(docs, { timestamps: false });

    console.log(
      `[seed] Done. Inserted ${docs.length} subscribers → ${Math.ceil(docs.length / 10)} pages at 10/page.`,
    );
  } catch (error) {
    console.error(
      "[seed] Failed:",
      error instanceof Error ? error.message : error,
    );
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("[seed] Disconnected.");
  }
};

seedSubscribers();
