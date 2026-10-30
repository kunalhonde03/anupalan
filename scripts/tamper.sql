-- ANUPALAN Demo Step 9 Tamper Script
-- Demonstrates cryptographic tamper detection by maliciously modifying an audit trail entry.

UPDATE audit_log
SET reason = 'TAMPERED: Unconditional approval granted without statutory obligations.'
WHERE id = (
  SELECT id FROM audit_log
  ORDER BY sequence ASC
  LIMIT 1 OFFSET 2
);

SELECT id, sequence, actor_role, action, reason, hash
FROM audit_log
ORDER BY sequence ASC
LIMIT 5;
