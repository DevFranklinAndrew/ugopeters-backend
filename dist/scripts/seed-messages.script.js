"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const env_configuration_1 = __importDefault(require("../configurations/env.configuration"));
const message_model_1 = __importDefault(require("../models/message.model"));
/**
 * Seeds a batch of contact messages so the admin inbox has enough data to
 * demonstrate pagination (8 per page), the read/unread filter, and the reason
 * filter. Idempotent: every seeded doc uses an `@seed.example` email, so a
 * re-run clears the previous batch first and leaves real submissions untouched.
 * Run with `npm run seed:messages`.
 */
const SEED_DOMAIN = "seed.example";
const COUNT = 26; // → 4 pages at 8/page (8, 8, 8, 2)
const REASONS = [
    "Strategic Partnership",
    "Real Estate Consulting",
    "Speaking Engagement",
    "Executive Mentorship",
    "Media Inquiry",
];
const NAMES = [
    "Adaeze Nwankwo",
    "Emeka Okafor",
    "Ngozi Okonjo",
    "David Mensah",
    "Fatima Bello",
    "Tunde Adeyemi",
    "Chioma Eze",
    "Kwame Asante",
    "Amara Diallo",
    "Ifeoma Nwosu",
    "Sekou Traore",
    "Zainab Sadiq",
    "Obinna Ekwueme",
    "Lerato Molefe",
    "Yusuf Abubakar",
    "Grace Wanjiru",
    "Chidi Obi",
    "Nadia Hassan",
    "Samuel Otieno",
    "Bisi Ogunleye",
    "Kofi Mensah",
    "Halima Yusuf",
    "Uche Kalu",
    "Thabo Nkosi",
    "Aisha Bello",
    "Peter Nnamdi",
];
const SUBJECTS = {
    "Strategic Partnership": [
        "Joint venture in Abuja real estate",
        "Advisory partnership across our portfolio",
        "Co-investment in a mixed-use development",
    ],
    "Real Estate Consulting": [
        "Underwriting review for a residential pipeline",
        "Institutional structuring for a new fund",
        "Feasibility study — Lekki commercial plot",
    ],
    "Speaking Engagement": [
        "Keynote — Africa Fintech Summit",
        "Panel on the strategy-execution gap",
        "Closing address at our leadership retreat",
    ],
    "Executive Mentorship": [
        "Mentorship for an early-stage SME",
        "Leadership coaching for our MD cohort",
        "Guidance on scaling a brokerage",
    ],
    "Media Inquiry": [
        "Interview request — 2026 tax system",
        "Comment for a feature on African real estate",
        "Podcast appearance on execution discipline",
    ],
};
const BODY_TEMPLATES = [
    "Dear Ugo,\n\nI hope this note finds you well. We have followed your work closely and believe there is a strong fit with what we are building. Could we schedule a short call in the coming weeks to explore this further?\n\nWarm regards,",
    "Hello Ugo,\n\nI am reaching out regarding the subject above. We would value your perspective and are flexible on timing and format. Please let me know what works best for your schedule.\n\nBest,",
    "Ugo,\n\nThank you for the impact of your recent work — it resonated deeply with our team. We would be honored to engage you and are happy to share more context on a call whenever convenient.\n\nSincerely,",
];
const buildMessages = () => {
    const now = Date.now();
    const HOURS = 60 * 60 * 1000;
    return Array.from({ length: COUNT }, (_, i) => {
        const name = NAMES[i % NAMES.length];
        const reason = REASONS[i % REASONS.length];
        const subjects = SUBJECTS[reason];
        const subject = subjects[i % subjects.length];
        const body = BODY_TEMPLATES[i % BODY_TEMPLATES.length];
        const first = name.split(" ")[0].toLowerCase();
        // Spread timestamps ~6h apart so the newest-first ordering is meaningful.
        const createdAt = new Date(now - i * 6 * HOURS);
        return {
            name,
            email: `${first}.${i}@${SEED_DOMAIN}`,
            reason,
            subject,
            message: `${body}\n${name}`,
            // Older half trends read; newest stay unread — gives the filter something to show.
            read: i >= 8 && i % 3 !== 0,
            createdAt,
            updatedAt: createdAt,
        };
    });
};
const seedMessages = async () => {
    try {
        await mongoose_1.default.connect(env_configuration_1.default.MONGO_URI);
        console.log("[seed] Connected to MongoDB");
        const removed = await message_model_1.default.deleteMany({
            email: new RegExp(`@${SEED_DOMAIN}$`),
        });
        if (removed.deletedCount) {
            console.log(`[seed] Cleared ${removed.deletedCount} previous seed messages.`);
        }
        const docs = buildMessages();
        // Disable auto-timestamps so our spread-out createdAt values persist.
        await message_model_1.default.insertMany(docs, { timestamps: false });
        const unread = docs.filter((d) => !d.read).length;
        console.log(`[seed] Done. Inserted ${docs.length} messages (${unread} unread) → ${Math.ceil(docs.length / 8)} pages at 8/page.`);
    }
    catch (error) {
        console.error("[seed] Failed:", error instanceof Error ? error.message : error);
        process.exitCode = 1;
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log("[seed] Disconnected.");
    }
};
seedMessages();
//# sourceMappingURL=seed-messages.script.js.map