export enum SortDirection {
  SORT_DIRECTION_UNSPECIFIED = "SORT_DIRECTION_UNSPECIFIED",
  SORT_DIRECTION_ASCENDING = "SORT_DIRECTION_ASCENDING",
  SORT_DIRECTION_DESCENDING = "SORT_DIRECTION_DESCENDING",
}
export interface BrianPayloadType {
  prompt: string;
  address: string;
  messages: BrianContextMessageType[];
}

export interface BrianContextMessageType {
  sender: "user" | "brian";
  content: string;
}

export type Request = {
  description: string;
  action: string;
  chainId: number;
  tokenIn: string;
  tokenAmount: string;
  tokenDecimals: number;
  tokenSymbol: string;
  steps: {
    from: string;
    to: string;
    data: string;
    value: string;
  }[];
  stepsLength: number;
};
