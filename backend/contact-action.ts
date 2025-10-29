"use server";
import { sql } from "@vercel/postgres";

import { auth } from "@/auth";
import { getUser } from "@/backend/account-action";

// Basic types
export type UUID = string;
export type FriendStatus = "pending" | "accepted" | "rejected" | "cancelled";

export type FriendshipRow = {
  id: number;
  requester_id: UUID;
  addressee_id: UUID;
  status: FriendStatus;
  requested_at: string | null;
  responded_at: string | null;
  accepted_at: string | null;
  cancelled_at: string | null;
  rejected_at: string | null;
  u_min: UUID;
  u_max: UUID;
};

type FriendListRow = {
  id: number;
  friend_id: UUID;
  status: FriendStatus;
  requested_at: string | null;
  accepted_at: string | null;
};

// Utility: require authenticated user and return their id
async function requireUserId(): Promise<UUID> {
  const session = await auth();
  const user = await getUser(session?.user?.email || "");
  if (!user?.id) {
    throw new Error("Unauthorized");
  }
  return user.id as UUID;
}

// ---- Friends Core Actions -------------------------------------------------

/**
 * Send or reopen a friend request to `toUserId`.
 * - Reopens only when previous status was 'rejected' or 'cancelled'.
 * - No-op if already pending/accepted.
 */
export async function sendFriendRequest(toUserId: UUID) {
  const me = await requireUserId();
  if (me === toUserId)
    throw new Error("You cannot send a request to yourself.");

  // Optional: block table check (if you created user_blocks)
  // If you didn't create user_blocks, you can remove this WITH clause and WHERE NOT chk.blocked.
  const { rows } = await sql<FriendshipRow>`
  WITH chk AS (
    SELECT FALSE::boolean AS blocked
)
  INSERT INTO friendships (requester_id, addressee_id, status)
  SELECT ${me}::uuid, ${toUserId}::uuid, 'pending'
  FROM chk
  WHERE NOT chk.blocked
  ON CONFLICT (u_min, u_max)
  DO UPDATE SET
  status = CASE
  WHEN friendships.status IN ('rejected','cancelled') THEN 'pending'
  ELSE friendships.status
  END,
    requested_at = CASE
  WHEN friendships.status IN ('rejected','cancelled') THEN now()
  ELSE friendships.requested_at
  END,
    responded_at = NULL,
    accepted_at  = NULL,
    cancelled_at = NULL,
    rejected_at  = NULL
  RETURNING *;
  `;

  if (!rows.length)
    throw new Error("Unable to send request (blocked or conflict).");
  return rows[0];
}

/**
 * Accept a pending friend request.
 * Only the addressee can accept.
 */
export async function acceptFriendRequest(friendshipId: number) {
  const me = await requireUserId();
  const { rows } = await sql<FriendshipRow> /* sql */ `
    UPDATE friendships
    SET status = 'accepted',
        responded_at = now(),
        accepted_at = now()
    WHERE id = ${friendshipId}
      AND addressee_id = ${me}
      AND status = 'pending'
    RETURNING *;
  `;
  if (!rows.length) throw new Error("Invalid friendship or already handled.");
  return rows[0];
}

/**
 * Reject a pending friend request.
 * Only the addressee can reject.
 */
export async function rejectFriendRequest(friendshipId: number) {
  const me = await requireUserId();
  const { rows } = await sql<FriendshipRow> /* sql */ `
    UPDATE friendships
    SET status = 'rejected',
        responded_at = now(),
        rejected_at = now()
    WHERE id = ${friendshipId}
      AND addressee_id = ${me}
      AND status = 'pending'
    RETURNING *;
  `;
  if (!rows.length) throw new Error("Invalid friendship or already handled.");
  return rows[0];
}

/**
 * Cancel a pending friend request that I sent.
 */
export async function cancelFriendRequest(friendshipId: number) {
  const me = await requireUserId();
  const { rows } = await sql<FriendshipRow> /* sql */ `
    UPDATE friendships
    SET status = 'cancelled',
        responded_at = now(),
        cancelled_at = now()
    WHERE id = ${friendshipId}
      AND requester_id = ${me}
      AND status = 'pending'
    RETURNING *;
  `;
  if (!rows.length) throw new Error("Invalid friendship or already handled.");
  return rows[0];
}

/**
 * List accepted friends for the current user.
 */
export async function listFriends() {
  const me = await requireUserId();
  const { rows } = await sql<
    FriendListRow & { friend_name: string; friend_email: string }
  > /* sql */ `
    SELECT
      f.id,
      CASE WHEN f.requester_id = ${me} THEN f.addressee_id ELSE f.requester_id END AS friend_id,
      u.name AS friend_name,
      u.email AS friend_email,
      f.status,
      f.requested_at,
      f.accepted_at
    FROM friendships f
    JOIN users u ON u.id = CASE WHEN f.requester_id = ${me} THEN f.addressee_id ELSE f.requester_id END
    WHERE (f.requester_id = ${me} OR f.addressee_id = ${me})
      AND f.status = 'accepted'
    ORDER BY f.accepted_at DESC NULLS LAST, f.requested_at DESC;
  `;
  return rows;
}

/**
 * List pending requests. type = 'incoming' | 'outgoing' | 'all'
 */
export async function listPendingRequests(
  type: "incoming" | "outgoing" | "all" = "incoming",
) {
  const me = await requireUserId();

  if (type === "incoming") {
    const { rows } = await sql<FriendshipRow> /* sql */ `
      SELECT f.*, u.name AS requester_name, u.email AS requester_email
      FROM friendships f
      JOIN users u ON u.id = f.requester_id
      WHERE addressee_id = ${me} AND status = 'pending'
      ORDER BY requested_at DESC;
    `;
    return rows;
  }
  if (type === "outgoing") {
    const { rows } = await sql<FriendshipRow> /* sql */ `
      SELECT f.*, u.name AS requester_name, u.email AS requester_email
      FROM friendships f
      JOIN users u ON u.id = f.requester_id
      WHERE requester_id = ${me} AND status = 'pending'
      ORDER BY requested_at DESC;
    `;
    return rows;
  }
  const { rows } = await sql<FriendshipRow> /* sql */ `
    SELECT f.*, u.name AS requester_name, u.email AS requester_email
    FROM friendships f
    JOIN users u ON u.id = f.requester_id
    WHERE (requester_id = ${me} OR addressee_id = ${me})
      AND status = 'pending'
    ORDER BY requested_at DESC;
  `;
  return rows;
}

/**
 * Get friendship row by other user's id (any status).
 */
export async function getFriendshipWith(otherUserId: UUID) {
  const me = await requireUserId();
  const { rows } = await sql<FriendshipRow> /* sql */ `
    SELECT * FROM friendships
    WHERE u_min = LEAST(${me}, ${otherUserId})
      AND u_max = GREATEST(${me}, ${otherUserId})
    LIMIT 1;
  `;
  return rows[0] ?? null;
}
