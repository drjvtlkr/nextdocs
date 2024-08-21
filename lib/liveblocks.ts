import { Liveblocks } from "@liveblocks/node";


export const liveblocks = new Liveblocks({
    secret: process.env.LIVEBLOCKS_SCRET_KEY as string,
  });