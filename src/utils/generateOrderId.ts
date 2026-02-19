import Counter from "../models/Counter";

export const generateOrderId = async (): Promise<string> => {
  const counter = await Counter.findByIdAndUpdate(
    { _id: "orderId" },
    { $inc: { seq: 1 } },
    { returnDocument: "after", upsert: true },
  );

  const seq = counter.seq;
  // Pad the sequence number to 3 digits (e.g., 1 -> 001, 10 -> 010, 100 -> 100)
  const paddedSeq = seq.toString().padStart(3, "0");

  return `SV-1000-${paddedSeq}`;
};
