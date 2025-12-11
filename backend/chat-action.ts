"use server";
import { sql } from "@vercel/postgres";
import { requireUserId, UUID } from "@/backend/account-action";
import { pusherServer } from "@/lib/pusher";

/**
 * Create or fetch a direct conversation id with the given user.
 * Returns the conversation id. Also, upserts both participants.
 *
 * @param otherUserId UUID of the other participant
 * @throws Error if otherUserId equals current user or on DB failure
 */
export async function getOrCreateDirectConversation(
  otherUserId: UUID,
): Promise<number> {
  const me = await requireUserId();
  if (!otherUserId) throw new Error("otherUserId is required");
  if (me === otherUserId)
    throw new Error("Cannot start a conversation with yourself");

  const { rows: conv } = await sql<{ id: number }>`
    INSERT INTO conversations (type, u_min, u_max)
    VALUES ('direct', LEAST(${me}::uuid, ${otherUserId}::uuid), GREATEST(${me}::uuid, ${otherUserId}::uuid))
    ON CONFLICT (u_min, u_max) WHERE type = 'direct'
    DO UPDATE SET updated_at = now()
    RETURNING id;
  `;

  const cid = conv[0]?.id;
  if (!cid) throw new Error("Failed to get or create conversation");
  await sql`
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES (${cid}, ${me}::uuid)
    ON CONFLICT (conversation_id, user_id) DO NOTHING;
  `;

  await sql`
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES (${cid}, ${otherUserId}::uuid)
    ON CONFLICT (conversation_id, user_id) DO NOTHING;
  `;

  return cid;
}

/**
 * Get conversation header info for a direct chat.
 */
export type ConversationHeader = {
  conversationId: number;
  type: "direct" | "group";
  otherUserId: UUID;
  otherUserName: string;
  otherUserEmail: string;
};

export async function getConversationHeader(
  conversationId: number,
): Promise<ConversationHeader> {
  const me = await requireUserId();

  const { rows } = await sql<{
    conversation_id: number;
    type: "direct" | "group";
    other_user_id: UUID;
    other_user_name: string;
    other_user_email: string;
  }>`
    SELECT
      c.id      AS conversation_id,
      c.type    AS type,
      u.id      AS other_user_id,
      u.name    AS other_user_name,
      u.email   AS other_user_email
    FROM conversations c
    JOIN conversation_participants pm
    ON pm.conversation_id = c.id AND pm.user_id = ${me}::uuid
    JOIN conversation_participants po
    ON po.conversation_id = c.id AND po.user_id <> ${me}::uuid
    JOIN users u ON u.id = po.user_id
    WHERE c.id = ${conversationId} AND c.type = 'direct'
    LIMIT 1;
  `;

  if (!rows.length)
    throw new Error(
      "Conversation not found or not a direct chat, or you are not a participant.",
    );

  const r = rows[0];
  return {
    conversationId: r.conversation_id,
    type: r.type,
    otherUserId: r.other_user_id,
    otherUserName: r.other_user_name,
    otherUserEmail: r.other_user_email,
  };
}

/**
 * Send message into a conversation that the current user participate in.
 * - Sets sender's last_read_message_id to the new message id
 */

export type SentMessage = {
  id: number;
  conversationId: number;
  senderId: UUID;
  body: string | null;
  createdAt: string;
};

export async function sendTextMessage(
  conversationId: number,
  body: string,
): Promise<SentMessage> {
  const me = await requireUserId();
  if (!conversationId || Number.isNaN(conversationId))
    throw new Error("Invalid conversation id");

  const text = (body ?? "").trim();
  if (!text) throw new Error("Message body is required");

  const { rows: msg } = await sql<{ id: number; created_at: string }>`
    INSERT INTO messages (conversation_id, sender_id, type, body)
    VALUES (${conversationId}, ${me}::uuid, 'text', ${text})
    RETURNING id, created_at;
 `;
  const newId = msg[0].id;
  const createdAt = msg[0].created_at;

  await sql`
    UPDATE conversations
    SET last_message_id = ${newId}, updated_at = now()
    WHERE id = ${conversationId};
 `;

  await sql`
    UPDATE conversation_participants
    SET last_read_message_id = GREATEST(COALESCE(last_read_message_id, 0), ${newId})
    WHERE conversation_id = ${conversationId} AND user_id = ${me}::uuid;
`;

  await pusherServer.trigger(`conversation-${conversationId}`, "message:new", {
    id: newId,
    conversationId,
    senderId: me,
    body: text,
    createdAt,
  });

  return {
    id: newId,
    conversationId,
    senderId: me,
    body: text,
    createdAt,
  };
}

/**
 * Cursor-based message listing.
 */

export type FetchedMessage = {
  id: number;
  conversationId: number;
  senderId: UUID;
  body: string | null;
  createdAt: string;
};

export type ListRes = {
  items: SentMessage[];
  nowPageNumber: number; // 현재 페이지 번호 (1 기반)
  totalPages: number;
  totalCount: number;
};

const PAGE_SIZE = 25;

export async function listMessages(
  conversationId: number,
  opts?: { page?: number; totalPages?: number; totalCount?: number },
): Promise<ListRes> {
  let page = opts?.page ?? 1;
  const totalPages = opts?.totalPages ?? 0;
  const totalCount = opts?.totalCount ?? 0;
  if (page < 1) page = 1;
  if (totalPages > 0 && page > totalPages) page = totalPages;

  const offset = totalPages === 0 ? 0 : (page - 1) * PAGE_SIZE;

  const { rows } = await sql<{
    id: number;
    sender_id: UUID;
    body: string | null;
    created_at: string;
  }>`
    SELECT id, sender_id, body, created_at
    FROM messages
    WHERE conversation_id = ${conversationId}
    ORDER BY id ASC
    LIMIT ${PAGE_SIZE} OFFSET ${offset}
`;

  const items: FetchedMessage[] = rows.map((r) => ({
    id: r.id,
    conversationId,
    senderId: r.sender_id,
    body: r.body,
    createdAt: r.created_at,
  }));

  return {
    items,
    nowPageNumber: totalPages === 0 ? 0 : page,
    totalPages,
    totalCount,
  };
}

/**
 * Get pagination meta (total pages & count) for a conversation.
 * Useful for initial request to know which page number to load first.
 */
export async function getMessagePageMeta(
  conversationId: number,
): Promise<{ totalPages: number; totalCount: number }> {
  const me = await requireUserId();
  if (!conversationId || Number.isNaN(Number(conversationId)))
    throw new Error("Invalid Conversation id");

  // participant check
  const { rowCount } = await sql`
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = ${conversationId} AND user_id = ${me}::uuid
    LIMIT 1
  `;
  if (!rowCount)
    throw new Error("You are not a participant of this conversation.");

  // count messages
  const { rows: countRows } = await sql<{ cnt: number }>`
    SELECT COUNT(*)::int AS cnt
    FROM messages
    WHERE conversation_id = ${conversationId};
  `;
  const totalCount = countRows[0]?.cnt ?? 0;
  const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / PAGE_SIZE);

  return { totalPages, totalCount };
}

/**
 * List my direct conversations with chat preview
 */

export type ConversationPreview = {
  conversationId: number;
  otherUserId: UUID;
  otherUserName: string;
  otherUserEmail: string;
  lastMessageId: number | null;
  lastMessageBody: string | null;
  lastMessageAt: string | null;
};

export async function listMyDirectChats(opts?: {
  limit?: number;
  offset?: number;
}): Promise<ConversationPreview[]> {
  const me = await requireUserId();
  const limit = Math.min(Math.max(opts?.limit ?? 20, 1), 100);
  const offset = Math.max(opts?.offset ?? 0, 0);

  const { rows } = await sql<{
    conversation_id: number;
    other_user_id: UUID;
    other_user_name: string;
    other_user_email: string;
    last_message_id: number | null;
    last_message_body: string | null;
    last_message_at: string | null;
  }>`
    SELECT 
      c.id AS conversation_id,
      u.id AS other_user_id,
      u.name AS other_user_name,
      u.email AS other_user_email,
      lm.id AS last_message_id,
      lm.body AS last_message_body,
      lm.created_at AS last_message_at
    FROM conversation_participants p
    JOIN conversations c ON c.id = p.conversation_id
    JOIN conversation_participants po ON po.conversation_id = c.id AND po.user_id <> p.user_id
    JOIN users u ON u.id = po.user_id
    LEFT JOIN LATERAL ( 
      SELECT m.id, m.body, m.created_at
      FROM messages m 
      WHERE m.conversation_id = c.id
      ORDER BY m.id DESC 
      LIMIT 1
      ) lm ON TRUE
    WHERE p.user_id = ${me}::uuid AND c.type = 'direct'
    ORDER BY COALESCE(lm.created_at, c.updated_at) DESC NULLS LAST
    LIMIT ${limit} OFFSET ${offset}
  `;

  return rows.map((r) => ({
    conversationId: r.conversation_id,
    otherUserId: r.other_user_id,
    otherUserName: r.other_user_name,
    otherUserEmail: r.other_user_email,
    lastMessageId: r.last_message_id,
    lastMessageBody: r.last_message_body,
    lastMessageAt: r.last_message_at,
  }));
}
