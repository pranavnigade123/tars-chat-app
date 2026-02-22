export interface ClerkWebhookEvent {
  type: "user.created" | "user.updated" | "user.deleted";
  data: ClerkUserData;
}

export interface ClerkUserData {
  id: string;
  first_name: string;
  last_name: string;
  email_addresses: Array<{
    email_address: string;
    id: string;
  }>;
  image_url: string;
  created_at: number;
  updated_at: number;
}
