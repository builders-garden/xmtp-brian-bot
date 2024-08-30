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
  "Hey there, I'm Brian Agent. Available commands:\n/start - Start chatting with Brian API\n/actions - Show this list of commands";
export const BOT_COMMAND_RESET_REPLY =
  "Conversation reset. Type /start to start a new conversation with Brian Agent.";
export const BOT_COMMAND_HELP_REPLY =
  "Hey there, I'm Brian Agent. Available commands:\n/start - Start chatting with Brian API\n/actions - Show this list of commands \n/reset - Reset the conversation with Brian Agent \n/help - Show this list of commands";
export const BOT_COMMAND_START_REPLY =
  "Great! You can start chatting with Brian Agent. Type /actions to see the list of actions you can perform.";
export const BOT_COMMAND_IDLE_REPLY =
  "Hey there, I'm Brian Agent. Available commands:\n/start - Start chatting with Brian API\n/actions - Show this list of commands";
