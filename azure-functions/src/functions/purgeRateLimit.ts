import { app, InvocationContext, Timer } from "@azure/functions";

export async function purgeRateLimit(
  myTimer: Timer,
  context: InvocationContext
): Promise<void> {
  try {
    const res = await fetch(process.env.PURGE_RATE_LIMIT_ENDPOINT as string, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${process.env.PURGE_RATE_LIMIT_KEY}`,
      },
    });
    const data = await res.json();
  } catch (error) {
    context.log("error", error);
  }
}

app.timer("purgeRateLimit", {
  //every hour
  schedule: "0 0 * * * *",
  handler: purgeRateLimit,
});
