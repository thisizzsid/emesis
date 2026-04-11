# EMESIS - API Documentation

This document describes the Next.js API routes and Firestore database structures for EMESIS.

## Next.js API Routes

### 1. Gemini AI Service (`/api/gemini`)
- **Method**: `POST`
- **Body Parameters**:
  - `text`: (string) The content to process.
  - `mode`: (string) Options:
    - `moderate`: Returns `SAFE` or `UNSAFE`.
    - `emotion`: Returns a supportive response.
    - `tags`: Returns comma-separated hashtags.
    - `title`: Returns a short title for the text.
    - `chat`: Returns an empathetic chat response.
- **Success Response**: `{ "output": "string" }`
- **Error Response**: `{ "error": "string" }` (400 or 500 status)

## Firestore Data Structures

### 1. `users` Collection
- `uid`: (string) Primary Key
- `username`: (string) Unique display name
- `displayName`: (string) Full name
- `bio`: (string) User bio
- `accentColor`: (string) Hex color code
- `createdAt`: (Timestamp)

#### Subcollections:
- `notifications`: `{ type, fromUid, fromName, message, read, createdAt, postId? }`
- `followers`: `{ ts }` (document ID is follower UID)
- `following`: `{ ts }` (document ID is followed UID)

### 2. `posts` Collection
- `id`: (string) Primary Key
- `text`: (string) Post content
- `uid`: (string) Author UID
- `username`: (string) Author display name
- `anonymous`: (boolean)
- `likes`: (array of string) UIDs of likers
- `hashtags`: (array of string)
- `location`: (string)
- `commentCount`: (number)
- `createdAt`: (Timestamp)
- `updatedAt`: (Timestamp)

#### Subcollections:
- `comments`: `{ uid, username, text, createdAt, upvotes, downvotes, parentId? }`

### 3. `stories` Collection
- `id`: (string) Primary Key
- `uid`: (string) Author UID
- `username`: (string) Author display name
- `type`: (string) `text` | `image`
- `content`: (string) Text content or Image URL
- `background`: (string) Tailwind bg class (for text stories)
- `font`: (string) Tailwind font class (for text stories)
- `createdAt`: (Timestamp)
- `expiresAt`: (Timestamp) (automatically expires after 24h)

### 4. `follows` Collection (Root)
- `follower`: (string) Follower UID
- `followed`: (string) Followed UID

### 5. `chats` Collection
- `id`: (string) Format: `uid1_uid2` (sorted alphabetically)
- `lastMessage`: (string)
- `lastUpdate`: (Timestamp)
- `uids`: (array of string) Both participant UIDs

#### Subcollections:
- `messages`: `{ uid, text, createdAt, read, delivered }`
- `typing`: `{ isTyping, lastUpdate }` (document ID is user UID)

## Security
- All Firestore access is restricted via **Firestore Security Rules**.
- Gemini AI is restricted by an API key stored in server-side environment variables.
- Input is sanitized and validated on the client before being sent to the database.
