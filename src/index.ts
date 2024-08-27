import { run, HandlerContext } from "@xmtp/message-kit";
import { generateBrianPayload } from "./lib/utils.js";
import axios from "axios";
import { brianAgentEndpoint } from "./lib/const.js";

run(async (context: HandlerContext) => {
  // Get the message and the address from the sender
  const { content, sender } = context.message;

  if (content.content && typeof content.content === "string") {
    const brianPayload = await generateBrianPayload(context, 15);
    const brianHeaders = {
      "x-brian-api-key": process.env.BRIAN_API_KEY,
      "Content-Type": "application/json",
    };

    // Call the Brian API endpoint with the brianPayload
    try {
      const response = await axios.post(brianAgentEndpoint, brianPayload, { headers: brianHeaders });
      const data = response.data;

      console.log("Status: ", response.status);
      console.log("Data: ", data);

      // If the answer is an array, Brian found a possible transaction
      if (Array.isArray(data.result)) {
        await context.send(data.result[0].data.description);
      }

      // If the answer is not an array, Brian keeps the conversation going
      else {
        await context.send(data.result.answer);
      }
    } catch (error: any) {
      console.log("Status: ", error.response.status);
      console.log("Data: ", error.response.data);
      await context.send(error.response.data.error);
    }

    //console.log(brianPayload);
  } else {
    await context.send("This is not a string");
  }
});
