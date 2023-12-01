export interface EventMessage {
  __logStoreChainId: string,
  __logStoreChannelId: string,
  address: string,
  blockHash: string,
  data: string,
  logIndex: number,
  topics: string[],
  transactionHash: string,
}