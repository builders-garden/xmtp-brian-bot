import { run, HandlerContext } from "@xmtp/message-kit";
import { generateBrianPayload } from "./lib/utils.js";
import { v4 as uuidv4 } from "uuid";
import { getRedisClient } from "./lib/redis.js";
import axios from "axios";
import { BOT_COMMAND_ACTIONS_REPLY, BOT_COMMAND_HELP_REPLY, BOT_COMMAND_IDLE_REPLY, BOT_COMMAND_RESET_REPLY, BOT_COMMAND_START_REPLY, brianAgentEndpoint } from "./lib/const.js";

// Define the CurrentStep type
type CurrentStep = 'idle' | 'chatting';

// Create the in-memory cache
const inMemoryCacheStep = new Map<string, CurrentStep>();

run(async (context: HandlerContext) => {
  // Get the message and the address from the sender
  const { content, sender } = context.message;
  console.log("Received message from ", sender.address);

  if (content.content && typeof content.content === "string") {
    const userMessage = content.content.trim().toLowerCase();
    if (userMessage === "/actions") {
      await context.send(BOT_COMMAND_ACTIONS_REPLY);
    } 
    else if (userMessage === "/help") {
      await context.send(BOT_COMMAND_HELP_REPLY);
    } 
    else if (userMessage === "/start") {
      inMemoryCacheStep.set(sender.address, 'chatting');
      await context.send(BOT_COMMAND_START_REPLY);
    } 
    else if (userMessage === "/reset") {
      inMemoryCacheStep.set(sender.address, 'idle');
      await context.send(BOT_COMMAND_RESET_REPLY);
    }
    // If the user is in the chatting step, generate a new conversation with Brian API
    else if (inMemoryCacheStep.get(sender.address) === 'chatting') {
      console.log("Starting conversation with Brian API");
      const brianPayload = await generateBrianPayload(context, 15);
      const brianHeaders = {
        "x-brian-api-key": process.env.BRIAN_API_KEY,
        "Content-Type": "application/json",
      };

      try {
        const response = await axios.post(brianAgentEndpoint, brianPayload, { headers: brianHeaders });
        const data = response.data;

        console.log("Status: ", response.status);
        console.log("Data: ", data);

        if (Array.isArray(data.result)) {
          // get transactions from Brian result
          const transactionsLength = data.result[0].data.steps?.length;
          console.log("Transactions length: ", transactionsLength);
          // require length of transactions > 0
          if (!transactionsLength) {
            throw new Error("No transactions found");
          }
          // send description to user
          const description = data.result[0].data.description;
          await context.send(description);
          const conversationId = uuidv4();
          console.log("Conversation ID: ", conversationId);
          const redisClient = getRedisClient();

          // Transactions object array
          let transactions: any[] = [];
          for (let i = 0; i < transactionsLength; i++) {
            transactions.push({
              from: data.result[0].data.steps[i].from,
              to: data.result[0].data.steps[i].to,
              data: data.result[0].data.steps[i].data,
              value: data.result[0].data.steps[i].value,
            });
          }
          // Data to store for the Frame transaction
          const frameData = {
            address: sender.address,
            description: description,
            transactions: transactions,
            transactionsLength: transactionsLength,
          };
          console.log("Frame data: ", frameData);

          // Save the conversation in Redis to be used within the frame 
          await redisClient.set(conversationId, JSON.stringify(frameData));
          await context.send(
            `${process.env.FRAME_URL}/frames/brian-tx?id=${conversationId}`
          );
        } else {
          await context.send(data.result.answer);
        }
      } catch (error: any) {
        console.log("Status: ", error.response.status);
        console.log("Data: ", error.response.data);
        await context.send(error.response.data.error);
      }
    }
    // If the user is not in the chatting step, and the message is not a command, send the idle message
    else {
      await context.send(BOT_COMMAND_IDLE_REPLY);
    }
  }
});
