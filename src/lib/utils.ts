import { HandlerContext } from "@xmtp/message-kit";
import {
  BrianContextMessageType,
  BrianPayloadType,
  SortDirection,
} from "./types.js";

/**
 * Generates a valid Brian payload
 *
 * @param context The HandlerContext object
 * @param limit The number of messages to get from the conversation
 * @returns The valid BrianPayloadType object
 **/

export const generateBrianPayload = async (
  context: HandlerContext,
  limit: number
): Promise<BrianPayloadType> => {
  if (process.env.BRIAN_CONTEX_MODE === "standard") {
    // Get the last [limit] + 20 messages from the conversation
    const messages = await context.conversation.messages({
      limit: limit + 20,
      direction: SortDirection.SORT_DIRECTION_DESCENDING,
    });

    // Filter the first 16 elements that are of type string
    const filteredMessages = messages
      .filter((message) => typeof message.content === "string")
      .slice(0, 16);

    // Create the brianPayload object
    const brianPayload: BrianPayloadType = {
      prompt: filteredMessages.shift()?.content, // Gets the last message from the user and reduces the array
      address: context.message.sender.address,
      messages: filteredMessages.map((message) => ({
        sender:
          message.senderAddress === context.message.sender.address
            ? "user"
            : "brian",
        content: message.content,
      })),
    };

    return brianPayload;
  }

  // Get the last 100 messages from the conversation
  const messages = await context.conversation.messages({
    limit: 100,
    direction: SortDirection.SORT_DIRECTION_DESCENDING,
  });

  // Filter messages after the last "/reset" command
  const lastResetIndex = messages.findIndex(
    (message) =>
      typeof message.content === "string" &&
      message.content.trim().toLowerCase() === "/reset"
  );
  const relevantMessages =
    lastResetIndex !== -1 ? messages.slice(0, lastResetIndex) : messages;

  const shouldRemoveMessage = (content: string): boolean =>
    sensitivePatterns.some((pattern) =>
      content.toLowerCase().includes(pattern.toLowerCase())
    );

  // Filter and process messages
  const filteredMessages: BrianContextMessageType[] = relevantMessages
    .filter(
      (message) =>
        typeof message.content === "string" &&
        !shouldRemoveMessage(message.content)
    )
    .map((message) => ({
      sender:
        message.senderAddress === context.message.sender.address
          ? "user"
          : "brian",
      content: message.content as string,
    }));

  console.log("Filtered messages: ", filteredMessages);

  // Create the brianPayload object
  const brianPayload: BrianPayloadType = {
    prompt: filteredMessages.pop()?.content || "", // Gets the last message from the user
    address: context.message.sender.address,
    messages: filteredMessages,
  };

  return brianPayload;
};

const sensitivePatterns = [
  "the action you asked for is not recognized",
  "incorrect intent recognition",
  "hey there, i'm brian",
  "great! you can start",
  "/start",
  "/help",
  "/reset",
];
