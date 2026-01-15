import { BASE_URL } from "./config";

export type MessageResponse = {
  message: string;
  status: string;
};

export async function getMessage(): Promise<MessageResponse> {
  const res = await fetch(`${BASE_URL}/`);
  if (!res.ok) {
    throw new Error("Failed to fetch");
  }
  return res.json();
}
