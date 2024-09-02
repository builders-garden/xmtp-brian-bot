// Brian Agent API endpoint
/*
export const brianAgentEndpoint =
  "https://staging-api.brianknows.org/api/v0/agent";*/

export const brianAgentEndpoint = "http://localhost:8080/api/v0/agent";

export const brianHeaders = {
  "x-brian-api-key": process.env.BRIAN_API_KEY,
  "Content-Type": "application/json",
};

// Bot commands
export const BOT_COMMAND_ACTIONS_REPLY =
  "Hello! I'm Brian Agent. You can perform the following actions:\nask - Ask web3-related questions\nswap - Swap tokens\nbridge - Bridge assets across chains\ncrosschain - Perform cross-chain swaps\ndeposit - Deposit funds into DeFi protocols\nwithdraw - Withdraw from DeFi protocols\nens - Renew or register ENS domains\nLearn more at [https://docs.brianknows.org/brian-api/apis].";
export const BOT_COMMAND_RESET_REPLY =
  "Conversation reset. Type /start to begin a new chat with Brian Agent.";
export const BOT_COMMAND_HELP_REPLY =
  "Hi! I'm Brian Agent. Here are the available commands:\n/start - Begin a conversation with Brian Agent\n/actions - Display the list of available actions \n/reset - Reset your conversation with Brian Agent \n/help - Show this list of commands";
export const BOT_COMMAND_START_REPLY =
  "Welcome! You can now start chatting with Brian Agent. Type /actions to see the available actions.";
export const BOT_COMMAND_IDLE_REPLY =
  "Hello! I'm Brian Agent. Here are the available commands:\n/start - Begin a conversation with Brian Agent\n/actions - Display the list of available actions\n/reset - Reset the conversation with Brian Agent\n/help - Show this list of commands";






