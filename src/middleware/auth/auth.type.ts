export type AuthResult =
    | { success: true; keyId: string }
    | { success: false; error: string };
