"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = require("mongoose");
const adminSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Name is required."],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required."],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Password is required."],
        minlength: [8, "Password must be at least 8 characters long."],
        select: false,
    },
    role: {
        type: String,
        enum: ["admin"],
        default: "admin",
    },
}, { timestamps: true });
// Hash the password whenever it is set or changed.
adminSchema.pre("save", async function () {
    if (!this.isModified("password"))
        return;
    this.password = await bcryptjs_1.default.hash(this.password, 12);
});
adminSchema.methods.comparePassword = async function (candidate) {
    return bcryptjs_1.default.compare(candidate, this.password);
};
const Admin = (0, mongoose_1.model)("Admin", adminSchema);
exports.default = Admin;
//# sourceMappingURL=admin.model.js.map