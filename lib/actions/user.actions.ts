"use server";

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { parseStringify } from "../utils";
import { liveblocks } from "../liveblocks";

export const getClerkUsers = async ({ userIds }: { userIds: string[] }) => {
  try {
    const { data } = await clerkClient.users.getUserList({
      emailAddress: userIds,
    });

    const users = data.map((user) => ({
      id: userIds.indexOf,
      name: `${user.firstName} ${user.lastName}`,
      email: user.emailAddresses[0].emailAddress,
      avatar: user.imageUrl,
    }));

    const sortUsers = userIds.map((email) =>
      users.find((user) => user.email === email)
    );

    return parseStringify(sortUsers);
  } catch (error) {
    console.error(error);
    console.log(`Error fetching users: ${error}`);
  }
};

export const getDocumentUsers = async ({
  roomId,
  currentUser,
  text,
}: {
  roomId: string;
  currentUser: string;
  text: string;
}) => {
  try {
    const room = await liveblocks.getRoom(roomId);
    const users = Object.keys(room.usersAccesses).filter(
      (email) => email !== currentUser
    );
    if (text.length) {
      const lowercaseText = text.toLowerCase();

      const filteredUsers = users.filter((email: string) =>
        email.toLowerCase().includes(lowercaseText)
      );
      return parseStringify(filteredUsers);
    }
  } catch (error) {
    console.error(error);
    console.log("Error fecthing document of users", error);
  }
};
