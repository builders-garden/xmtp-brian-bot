import { run, HandlerContext } from "@xmtp/message-kit";
import { generateBrianPayload } from "./lib/utils.js";
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
          await context.send(data.result[0].data.description);
        } else {
          await context.send(data.result.answer);
        }
      } catch (error: any) {
        console.log("Status: ", error.response.status);
        console.log("Data: ", error.response.data);
        await context.send(error.response.data.error);
      }
    }
    else {
      await context.send(BOT_COMMAND_IDLE_REPLY);
    }
  }
});
