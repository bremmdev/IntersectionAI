import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/azure-client";

export async function POST(request: NextRequest) {
  const tableClient = getClient();

  let deleteCount = 0;

  //get authorization bearer token
  const authorization = request.headers.get("authorization");
  if (authorization !== `Bearer ${process.env.PURGE_RATE_LIMIT_KEY}`) {
    return NextResponse.json({error: "Unauthorized"}, { status: 401 });
  }

  //purge entities older than 15 minutes
  const purgeEndTime = Date.now() - 15 * 60 * 1000;
  try {
    const purgeEntities = tableClient.listEntities({
      queryOptions: {
        filter: `RowKey lt '${purgeEndTime}'`,
      },
    });
    for await (const entity of purgeEntities) {
      await tableClient.deleteEntity(
        entity.partitionKey as string,
        entity.rowKey as string
      );
      deleteCount++;
    }
  } catch (error) {
    console.error(error);
  }

  return NextResponse.json({ deleteCount });
}
