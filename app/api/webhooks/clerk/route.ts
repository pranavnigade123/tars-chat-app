import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  // Get webhook secret from environment
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("CLERK_WEBHOOK_SECRET is not set");
  }

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // Verify all headers present
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create Svix instance
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify webhook signature
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Invalid signature", { status: 401 });
  }

  // Process event
  const eventType = evt.type;

  try {
    switch (eventType) {
      case "user.created":
        await handleUserCreated(evt.data);
        break;
      case "user.updated":
        await handleUserUpdated(evt.data);
        break;
      case "user.deleted":
        await handleUserDeleted(evt.data);
        break;
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return new Response("Webhook processed", { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response("Webhook processing failed", { status: 500 });
  }
}

async function handleUserCreated(data: any) {
  try {
    await convex.mutation(api.users.syncUser, {
      clerkId: data.id,
      name:
        `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
        data.email_addresses[0]?.email_address ||
        "Anonymous User",
      email: data.email_addresses[0]?.email_address || "",
      profileImage: data.image_url,
    });
    console.log(`User created: ${data.id}`);
  } catch (error) {
    console.error("Failed to create user in Convex:", error);
    throw error;
  }
}

async function handleUserUpdated(data: any) {
  try {
    await convex.mutation(api.users.syncUser, {
      clerkId: data.id,
      name:
        `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
        data.email_addresses[0]?.email_address ||
        "Anonymous User",
      email: data.email_addresses[0]?.email_address || "",
      profileImage: data.image_url,
    });
    console.log(`User updated: ${data.id}`);
  } catch (error) {
    console.error("Failed to update user in Convex:", error);
    throw error;
  }
}

async function handleUserDeleted(data: any) {
  try {
    await convex.mutation(api.users.deleteUser, {
      clerkId: data.id,
    });
    console.log(`User deleted: ${data.id}`);
  } catch (error) {
    console.error("Failed to delete user from Convex:", error);
    throw error;
  }
}
