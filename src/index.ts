import { run, HandlerContext } from "@xmtp/message-kit";
import { generateBrianPayload } from "./lib/utils.js";
import { v4 as uuidv4 } from "uuid";
import { getRedisClient } from "./lib/redis.js";
import axios from "axios";
import {
  BOT_COMMAND_ACTIONS_REPLY,
  BOT_COMMAND_HELP_REPLY,
  BOT_COMMAND_IDLE_REPLY,
  BOT_COMMAND_RESET_REPLY,
  BOT_COMMAND_START_REPLY,
  brianAgentEndpoint,
} from "./lib/const.js";
import { Request } from "./lib/types.js";

// Define the CurrentStep type
type CurrentStep = "idle" | "chatting";

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
    } else if (userMessage === "/help") {
      await context.send(BOT_COMMAND_HELP_REPLY);
    } else if (userMessage === "/start") {
      inMemoryCacheStep.set(sender.address, "chatting");
      await context.send(BOT_COMMAND_START_REPLY);
    } else if (userMessage === "/reset") {
      inMemoryCacheStep.set(sender.address, "idle");
      await context.send(BOT_COMMAND_RESET_REPLY);
    }
    // If the user is in the chatting step, generate a new conversation with Brian API
    else if (inMemoryCacheStep.get(sender.address) === "chatting") {
      console.log("Starting conversation with Brian API");
      const brianPayload = await generateBrianPayload(context, 15);
      const brianHeaders = {
        "x-brian-api-key": process.env.BRIAN_API_KEY,
        "Content-Type": "application/json",
      };

      try {
        const response = await axios.post(brianAgentEndpoint, brianPayload, {
          headers: brianHeaders,
        });
        const data = response.data;
        console.log("Data: ", data);
        //Ask request
        if (data.result && data.result.answer) {
          console.log("Answer found");
          await context.send(data.result.answer);
        }
        //Tx request
        if (data.result[0].type === "write") {
          // get transactions from Brian result
          const requestsLength = data.result.length;
          let stepsLength: number[] = [];
          for (let i = 0; i < requestsLength; i++) {
            stepsLength.push(data.result[i].data.steps?.length || 0);
          }
          // require length of transactions > stepsLength
          if (!stepsLength) {
            throw new Error("No transactions found");
          }
          //Define the requests array
          const requests: Request[] = [];
          for (let i = 0; i < requestsLength; i++) {
            const resultData = data.result[i].data;
            const request: Request = {
              description: resultData.description,
              chainId: resultData.steps[0].chainId,
              tokenIn: resultData.fromToken.address,
              steps: [],
              stepsLength: stepsLength[i],
            };

            for (let j = 0; j < (stepsLength[i] || 0); j++) {
              const step = resultData.steps[j];
              request.steps.push({
                from: step.from,
                to: step.to,
                data: step.data,
                value: step.value,
              });
            }
            requests.push(request);
          }

          // Send description for each request to user
          for (let i = 0; i < requests.length; i++) {
            const description = requests[i].description;
            await context.send(description);
          }
          const conversationId = uuidv4();
          console.log("Conversation ID: ", conversationId);
          const redisClient = getRedisClient();

          // Data to store for the Frame transaction
          const frameData = {
            address: sender.address,
            requests: requests,
            requestsLength: requestsLength,
          };

          // Save the conversation in Redis to be used within the frame
          await redisClient.set(conversationId, JSON.stringify(frameData));
          await context.send(
            `${process.env.FRAME_URL}/frames/brian-tx?id=${conversationId}`
          );
        }
        //read request
        else if (data.result[0].type === "read") {
          console.log("Read transaction found");
          await context.send(data.result[0].data.description);
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
