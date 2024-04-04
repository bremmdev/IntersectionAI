import { getClient } from "./azure-client";

//limit: 100 requests per 5 minutes
export async function checkRateLimit(
  userId: string,
  timeWindow: number = 300,
  limit: number = 100
) {
  const tableClient = getClient();

  // Get the start of the time window based on the time window
  const start = Date.now() - timeWindow * 1000;

  let count = 0;

  try {
    //count the number of entities in the time window for this user
    const entities = tableClient.listEntities({
      queryOptions: {
        filter: `PartitionKey eq '${userId}' and RowKey ge '${start}'`,
      },
    });
    for await (const _ of entities) {
      count++;
    }

    if (count >= limit) {
      return {
        error: "Rate limit exceeded",
      };
    }

    await tableClient.createEntity({
      partitionKey: userId,
      rowKey: Date.now().toString(),
    });
  } catch (error) {
    console.error(error);
  }
}
