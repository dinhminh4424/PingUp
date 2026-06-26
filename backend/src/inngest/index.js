import { Inngest } from "inngest";
import User from "../models/User.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "pingup-app" });

// FUNCTION CREATE
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk", triggers: [{ event: "clerk/user.created" }] },
  async ({ event }) => {
    const { id, first_name, last_name, email_address, image_url } = event.data;
    let username = email_address[0].email_address.split("@")[0];

    const user = await User.findOne({ username });

    if (user) {
      username = username + Math.floor(Math.random() * 10000);
    }

    const userData = {
      _id: id,
      email: email_address[0].email_address,
      full_name: last_name + " " + first_name,
      username: username,
      profile_picture: image_url,
    };

    await User.create(userData);
  },
);

// FUNCTION UPDATE
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk", triggers: [{ event: "clerk/user.update" }] },
  async ({ event }) => {
    const { id, first_name, last_name, email_address, image_url } = event.data;

    const useUpdateData = {
      email: email_address[0].email_address,
      full_name: last_name + " " + first_name,
      profile_picture: image_url,
    };

    await User.findByIdAndUpdate(id, useUpdateData);
  },
);

// FUNCTION DELETE
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk", triggers: [{ event: "clerk/user.delete" }] },
  async ({ event }) => {
    const { id } = event.data;

    await User.findByIdAndDelete(id);
  },
);

// Create an empty array where we'll export future Inngest functions
export const functions = [syncUserCreation, syncUserUpdation, syncUserDeletion];
