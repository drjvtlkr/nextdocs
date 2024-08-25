"use server";

import { nanoid } from "nanoid";
import { liveblocks } from "../liveblocks";
import { revalidatePath } from "next/cache";
import { parseStringify } from "../utils";

export const createDocument = async ({
  userId,
  email,
}: CreateDocumentParams) => {
  const roomId = nanoid();

  try {
    const metadata = {
      createrId: userId,
      email,
      title: "Untitled",
    };

    const usersAccesses: RoomAccesses = {
      [email]: ["room:write"],
    };

    const room = await liveblocks.createRoom(roomId, {
      metadata,
      usersAccesses,
      defaultAccesses: ["room:write"],
    });

    revalidatePath("/");

    return parseStringify(room);
  } catch (error) {
    console.error(error, "Error happend while creating a room");
  }
};

export const getDocument = async ({
  roomId,
  userId,
}: {
  roomId: string;
  userId: string;
}) => {
  try {
    const room = await liveblocks.getRoom(roomId);

    //TODO: BRING THIS BACK ON LATER ON
    // const hasAccess = Object.keys(room.usersAccesses).includes(userId);

    // if (!hasAccess) {
    //   throw new Error("You do not have access tp this document");
    // }

    return parseStringify(room);
  } catch (error) {
    console.log(`Error happend while getting a room : ${error}`);
  }
};

export const updateDocument =  async(roomId: string, title: string)=>{
  try {
    const updatedRoom = await liveblocks.updateRoom(roomId, {
      metadata:{
        title
      }
    })

    revalidatePath(`/documents/${roomId}`)
    return parseStringify(updatedRoom)
  } catch (error) {
    console.error(error);
    console.log("Error happened while updating a room",error);
    
  }
}