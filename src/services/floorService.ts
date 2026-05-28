
import {
  ref,
  get,
} from "firebase/database";

import { database } from "./firebase";

// =======================================
// GET FLOOR LINES
// =======================================

export async function getFloorLines() {

  try {

    // ESP DATABASE STRUCTURE

    const snapshot =
      await get(
        ref(
          database,
          "Lines"
        )
      );

    if (
      !snapshot.exists()
    ) {
      return {};
    }

    return snapshot.val();

  } catch (error) {

    console.error(
      "Get Floor Lines Error:",
      error
    );

    return {};
  }
}
