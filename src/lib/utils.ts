import { HandlerContext } from "@xmtp/message-kit";
import { BrianPayloadType, SortDirection } from "./types.js";

/**
 * Generates a valid Brian payload
 *
 * @param context The HandlerContext object
 * @param limit The number of messages to get from the conversation
 * @returns The valid BrianPayloadType object
 **/

export const generateBrianPayload = async (context: HandlerContext, limit: number): Promise<BrianPayloadType> => {
  // Get the last [limit] + 20 messages from the conversation
  const messages = await context.conversation.messages({
    limit: limit + 20,
    direction: SortDirection.SORT_DIRECTION_DESCENDING,
  });

  // Filter the first 16 elements that are of type string
  const filteredMessages = messages.filter((message) => typeof message.content === "string").slice(0, 16);

  // Create the brianPayload object
  const brianPayload: BrianPayloadType = {
    prompt: filteredMessages.shift()?.content, // Gets the last message from the user and reduces the array
    address: context.message.sender.address,
    messages: filteredMessages.map((message) => ({
      sender: message.senderAddress === context.message.sender.address ? "user" : "brian",
      content: message.content,
    })),
  };

  return brianPayload;
};
