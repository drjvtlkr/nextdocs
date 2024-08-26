"use server";

import { nanoid } from "nanoid";
import { liveblocks } from "../liveblocks";
import { revalidatePath } from "next/cache";
import { getAccessType, parseStringify } from "../utils";
import { redirect } from "next/navigation";

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
      defaultAccesses: [],
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
    const hasAccess = Object.keys(room.usersAccesses).includes(userId);

    if (!hasAccess) {
      throw new Error("You do not have access tp this document");
    }

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

export const getDocuments = async ({
  email
}: {
  email:string
}) => {
  try {
    const rooms = await liveblocks.getRooms({userId: email});

    //TODO: BRING THIS BACK ON LATER ON
    // const hasAccess = Object.keys(room.usersAccesses).includes(userId);

    // if (!hasAccess) {
    //   throw new Error("You do not have access tp this document");
    // }

    return parseStringify(rooms);
  } catch (error) {
    console.log(`Error happend while getting a room : ${error}`);
  }
};

export const updateDocumentAccess = async({roomId, email, userType, updatedBy}:ShareDocumentParams)=>{
  try {
    const usersAccesses: RoomAccesses={
      [email]: getAccessType(userType) as AccessType
    }

    const room = await liveblocks.updateRoom(roomId,{usersAccesses})

    if(room){
      const notificationId = nanoid();

      await liveblocks.triggerInboxNotification({
        userId: email,
        kind: '$documentAccess',
        subjectId: notificationId,
        activityData:{
          userType,
          title: `You have been granted  ${userType} access to the document by ${updatedBy.name}`,
          avatar: updatedBy.avatar,
          updatedBy: updatedBy.name,
          email: updatedBy.email
        }
      })
    }

    revalidatePath(`/documents/${roomId}`)
    return parseStringify(room)
  } catch (error) {
    console.error(error);
    console.log("error happened while updating the document accesses", error);
    
  }
}

export const removeCollaborator = async({roomId, email}: {roomId: string, email: string})=>{
  try {
    const room = await liveblocks.getRoom(roomId)

    if(room.metadata.email === email) {
      throw new Error(`You can not remove yoursellf  from the document`)
    }

    const updatedRoom = await liveblocks.updateRoom(roomId, {
      usersAccesses:{
        [email]: null
      }
    })

    revalidatePath(`/documents/${roomId}`)
    return parseStringify(updatedRoom)
  } catch (error) {
    console.error(error);
    console.log("error happend while reomvong the collaborator", error);
    
  }
}

export const deleteDocument = async(roomId: string)=>{
  try {
    await liveblocks.deleteRoom(roomId)
    revalidatePath('/')
    redirect('/')
  } catch (error) {
    console.error(error);
    console.log("error happened while dleteing the document", error);
    
  }  
}