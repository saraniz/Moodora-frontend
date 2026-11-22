/** The person using this browser. One profile per device, no server account. */
export interface User {
  /** Display name */
  name: string;
  email: string;
  /** Data URL of the profile photo, or "" when none is set */
  avatar: string;
}

/** Marks someone as signed in. Passwords are never stored. */
export interface Session {
  email: string;
  name: string;
}
