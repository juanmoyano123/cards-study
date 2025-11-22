-- Cleanup script for old draft flashcards
-- This script removes draft flashcards that were created before the fix
-- Run this ONCE after deploying the persistence fix

-- Show draft cards before cleanup
SELECT
    COUNT(*) as total_draft_cards,
    COUNT(DISTINCT user_id) as affected_users
FROM flashcards
WHERE status = 'draft' AND deleted_at IS NULL;

-- Optional: Preview which cards will be deleted
-- Uncomment to see details before running the delete
/*
SELECT
    id,
    user_id,
    question,
    created_at,
    status
FROM flashcards
WHERE status = 'draft' AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 100;
*/

-- Soft delete all draft cards (recommended - can be recovered if needed)
UPDATE flashcards
SET deleted_at = NOW()
WHERE status = 'draft'
  AND deleted_at IS NULL;

-- Alternative: Hard delete draft cards and their stats (permanent - use with caution)
/*
-- First delete card stats
DELETE FROM card_stats
WHERE card_id IN (
    SELECT id FROM flashcards
    WHERE status = 'draft' AND deleted_at IS NULL
);

-- Then delete the flashcards
DELETE FROM flashcards
WHERE status = 'draft' AND deleted_at IS NULL;
*/

-- Show results
SELECT
    COUNT(*) as remaining_draft_cards
FROM flashcards
WHERE status = 'draft' AND deleted_at IS NULL;

-- Verify all new cards are active
SELECT
    status,
    COUNT(*) as count
FROM flashcards
WHERE deleted_at IS NULL
GROUP BY status
ORDER BY status;
