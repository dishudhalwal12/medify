import { FirebaseError } from "firebase/app";

function isFirebaseError(error: unknown): error is FirebaseError {
  return error instanceof FirebaseError;
}

export function normalizeFirebaseError(error: unknown): Error {
  if (!isFirebaseError(error)) {
    return error instanceof Error ? error : new Error("Something went wrong while talking to Firebase.");
  }

  switch (error.code) {
    case "auth/invalid-credential":
      return new Error(
        "Invalid email or password. If this is a brand new Firebase project, also make sure Email/Password sign-in is enabled in Firebase Authentication."
      );
    case "auth/invalid-email":
      return new Error("Enter a valid email address.");
    case "auth/email-already-in-use":
      return new Error("An account with this email already exists.");
    case "auth/weak-password":
      return new Error("Choose a stronger password with at least 6 characters.");
    case "auth/operation-not-allowed":
    case "auth/configuration-not-found":
      return new Error(
        "Email/Password authentication is not enabled for this Firebase project yet. Enable it in Firebase Console > Authentication > Sign-in method."
      );
    case "auth/invalid-api-key":
    case "auth/app-not-authorized":
    case "auth/project-not-found":
      return new Error(
        "The Firebase web configuration in .env.local does not match a working project. Recheck the API key, auth domain, project ID, and app ID."
      );
    case "auth/network-request-failed":
    case "unavailable":
    case "deadline-exceeded":
    case "storage/retry-limit-exceeded":
      return new Error("Firebase could not be reached. Check your internet connection and local firewall/VPN settings.");
    case "failed-precondition":
      return new Error("Firebase is reachable, but the request could not complete in the current state. Refresh and try again.");
    case "permission-denied":
    case "storage/unauthorized":
      return new Error(
        "Firebase rejected the request. Check your Firestore or Storage rules and make sure the signed-in user is allowed to access this data."
      );
    case "storage/canceled":
      return new Error("The upload was canceled before it finished.");
    case "storage/quota-exceeded":
      return new Error("Firebase Storage quota was exceeded. Try again later or use a smaller file.");
    case "storage/object-not-found":
    case "not-found":
      return new Error("The requested Firebase record could not be found.");
    case "cancelled":
      return new Error("The Firebase request was canceled. Try again.");
    case "resource-exhausted":
      return new Error("Firebase is rate limited right now. Wait a moment, then retry.");
    default:
      return new Error(error.message || "Firebase request failed.");
  }
}
