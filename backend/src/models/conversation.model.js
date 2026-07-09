import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    campground: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campground",
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  { timestamps: true },
);

// Tworzy indeks dla pól campground i participants.
// Dzięki temu MongoDB nie musi przeszukiwać całej kolekcji,
// tylko korzysta z indeksu, co znacząco przyspiesza wyszukiwanie.
ConversationSchema.index({ campground: 1, participants: 1 });

export const Conversation = mongoose.model("Conversation", ConversationSchema);
