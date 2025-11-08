# LiveKit Migration Guide for Banter

## Overview

This document describes the complete migration from Agora.io to LiveKit + COTURN for WebRTC communications.

## Database Schema Changes

### Changed Fields:
1. **ChatRoom.agoraChannel** → **ChatRoom.livekitRoomName**
2. **CallLog.agoraChannel** → **CallLog.livekitRoomName**

### Removed Fields:
1. **ChatRoomMember.agoraUid** (LiveKit uses string identities instead of numeric UIDs)

## Migration SQL for Existing Databases

```sql
-- Rename agoraChannel to livekitRoomName in ChatRoom
ALTER TABLE "ChatRoom"
RENAME COLUMN "agoraChannel" TO "livekitRoomName";

-- Rename agoraChannel to livekitRoomName in CallLog
ALTER TABLE "CallLog"
RENAME COLUMN "agoraChannel" TO "livekitRoomName";

-- Remove agoraUid from ChatRoomMember (if it exists)
ALTER TABLE "ChatRoomMember"
DROP COLUMN IF EXISTS "agoraUid";

-- Update indexes
DROP INDEX IF EXISTS "ChatRoom_agoraChannel_key";
DROP INDEX IF EXISTS "ChatRoom_agoraChannel_idx";
DROP INDEX IF EXISTS "CallLog_agoraChannel_idx";

CREATE UNIQUE INDEX "ChatRoom_livekitRoomName_key" ON "ChatRoom"("livekitRoomName");
CREATE INDEX "ChatRoom_livekitRoomName_idx" ON "ChatRoom"("livekitRoomName");
CREATE INDEX "CallLog_livekitRoomName_idx" ON "CallLog"("livekitRoomName");
```

## Fresh Installation

For fresh installations:
```bash
cd backend
npx prisma generate
npx prisma db push
# or
npx prisma migrate dev --name init
```

## Environment Variables

Update your `.env` file:

```env
# Remove these:
# AGORA_APP_ID=...
# AGORA_APP_CERTIFICATE=...
# AGORA_TOKEN_EXPIRY=...

# Add these:
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_SERVER_URL=wss://livekit.banter.app
LIVEKIT_TOKEN_EXPIRY=3600

COTURN_HOST=turn.banter.app
COTURN_PORT=3478
COTURN_TLS_PORT=5349
COTURN_SECRET=your_coturn_static_secret
```

## Backend Dependencies

```bash
cd backend
npm uninstall agora-access-token
npm install @livekit/server-sdk@^2.8.1
npm install express@^4.21.2  # Downgrade from 5.x
npm install @types/express@^4.17.21
npm install
```

## Mobile Dependencies

```bash
cd mobile
npm uninstall react-native-agora agora-react-native-rtm
npm install @livekit/react-native-webrtc
npm install
```

## Verification Steps

After migration:

1. **Verify Database Schema:**
```sql
-- Check ChatRoom
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'ChatRoom' AND column_name = 'livekitRoomName';

-- Check CallLog
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'CallLog' AND column_name = 'livekitRoomName';

-- Verify agoraUid is removed
SELECT column_name FROM information_schema.columns
WHERE table_name = 'ChatRoomMember' AND column_name = 'agoraUid';
-- Should return 0 rows
```

2. **Test Backend:**
```bash
cd backend
npm run build
npm test
npm run dev
```

3. **Test Mobile:**
```bash
cd mobile
npm start
# Test on physical device via Expo Go
```

## Breaking Changes

⚠️ **Important:** This migration includes breaking changes:

1. **Token Format:** LiveKit uses JWT tokens instead of Agora tokens
2. **Room Names:** Different format (`room_xxx` vs channel names)
3. **Participant IDs:** String-based identities vs numeric UIDs
4. **API Responses:** Different field names in call/room responses

## Rollback Plan

If you need to rollback:

```bash
# Backend
git checkout HEAD~2 backend/

# Mobile
git checkout HEAD~2 mobile/

# Database (restore from backup)
pg_restore -d banter_db backup.sql
```

## Support

For LiveKit documentation: https://docs.livekit.io/
For COTURN setup: https://github.com/coturn/coturn
