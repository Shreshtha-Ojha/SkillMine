import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextResponse, NextRequest } from "next/server";
import { getDataFromToken } from "@/helpers/getToken";

// Connect to the database
connect();

// Handle the POST request
export async function POST(request: NextRequest) {
  try {
    // Parse the request body and get checkedData (now an array of strings)
    const reqBody = await request.json();
    const { checkedData } = reqBody;

    // Ensure checkedData exists and is an array
    if (!Array.isArray(checkedData)) {
      return NextResponse.json({ error: "Missing or invalid checkedData" }, { status: 400 });
    }

    // Retrieve user ID from the token
    const userId = getDataFromToken(request);

    if (!userId) {
      return NextResponse.json({ error: "User not logged in" }, { status: 401 });
    }

    const user = await User.findById(userId);

    // Check if the user is found
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update the user's checkedData (since it's now an array of strings)
    user.checkedData = checkedData; // Directly assign the received array

    // Save the updated user data
    await user.save();

    return NextResponse.json({ message: "Checked data updated successfully", success: true });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Error while updating user data:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
