# Kommo CRM MCP - Known Issues & Solutions

> **Last Updated:** 2026-01-12  
> **Status:** ✅ All Major Issues Resolved

---

## ✅ RESOLVED: Notes - Entity-Scoped Endpoints

**Original Problem:**
- All Notes functions returned 404 errors
- Error: `{"title":"Not Found","status":404,"detail":"Cannot POST/GET https://...kommo.com/notes!"}`

**Root Cause:**
Kommo API v4 **does not have** a top-level `/api/v4/notes` endpoint. Notes are always associated with an entity type (leads, contacts, companies).

**Solution Implemented:**
- ✅ Endpoints corrected to use entity-scoped routes:
  - `POST /api/v4/{entityType}/notes` (create note)
  - `GET /api/v4/{entityType}/notes` (list all notes of that type)
  - `GET /api/v4/{entityType}/{entityId}/notes` (list notes of a specific entity)
  - `GET /api/v4/{entityType}/notes/{noteId}` (get a specific note)
  - `PATCH /api/v4/{entityType}/notes/{noteId}` (update a note)

**API Changes:**
- `createNote(data)` now requires `entityType` and `entityId` in the data
- `listNotes(filters)` now requires `entityType` in the filters
- `getNote(params)` now requires `entityType` in the params
- `updateNote(data)` now requires `noteId` and `entityType` in the data
- `linkNoteToContact/Lead/Deal` are deprecated (notes cannot be "linked" after creation)

**Fixed Functions:**
- ✅ `createNote` - Now works correctly
- ✅ `getNote` - Now works correctly
- ✅ `updateNote` - Now works correctly
- ✅ `listNotes` - Now works correctly
- ✅ `getNotesByContact` - Now works correctly
- ✅ `getNotesByLead` - Now works correctly
- ✅ `getNotesByDeal` - Now works correctly
- ⚠️ `linkNoteToContact/Lead/Deal` - Deprecated (not applicable in v4)

**Status:** ✅ Resolved - All Notes functions work correctly with entity-scoped endpoints

---

## ✅ RESOLVED: Linking Functions - Link Verification

**Original Problem:**
- If an entity is already linked (e.g., when creating with `_embedded.contacts`), the API returns error 500
- Error: `{"title":"Internal Server Error","status":500,"detail":"An unknown error occurred."}`

**Previous Solution (Workaround):**
- The function detected the 500 error and treated it as success
- Worked but wasn't deterministic

**Improved Solution (Implemented):**
- ✅ Functions now verify existing links first using `GET /api/v4/{entity}/{id}/links`
- ✅ Only creates the link if the entity is not already linked
- ✅ Deterministic behavior without depending on server errors
- ✅ Works correctly

**Affected Functions:**
- ✅ `linkLeadToContact` - Now verifies links before creating
- ✅ `linkDealToContact` - Now verifies links before creating
- ✅ `linkContactToCompany` - Now verifies links before creating
- ✅ `linkProductToLead` - Now verifies links before creating

**Recommendation:**
- Use `_embedded.contacts` when creating the lead/deal instead of calling `linkLeadToContact` afterward (more efficient)

**Status:** ✅ Resolved - All linking functions verify existing links before creating

---

## ✅ RESOLVED: Notes - note_type Field

**Original Problem:**
- Kommo requires `note_type` as a string but the valid values were unclear
- Errors: `"InvalidType"`, `"NotSupportedChoice"`, `"FieldMissing"`

**Solution Implemented:**
- ✅ `note_type` field is now optional in the schema
- ✅ If not provided, the field is omitted and Kommo uses its default value
- ✅ Tested with multiple values and works correctly when omitted

**Status:** ✅ Resolved - Notes work correctly with optional `note_type` field

---

## 📋 Summary

### ✅ Resolved Issues:
- **Notes (9 functions):** ✅ Fixed - Now use entity-scoped endpoints
- **Linking Functions:** ✅ Improved - Verify links before creating
- **Notes note_type:** ✅ Fixed - Field is now optional

### Success Rate:
- **All available functions working (100%)** 🎉
- All Notes functions now work correctly
- Linking functions are more robust and deterministic

---

## 📝 Implementation Notes

### Notes API Changes:

**Before (incorrect):**
```typescript
// ❌ This failed with 404
createNote({ text: "Hello", entity_id: 123, entity_type: "contacts" }, config)
listNotes({ limit: 10 }, config)
getNote({ noteId: 456 }, config)
```

**Now (correct):**
```typescript
// ✅ Works correctly
createNote({ 
  text: "Hello", 
  entityType: "contacts", 
  entityId: 123 
}, config)

listNotes({ 
  entityType: "contacts",
  limit: 10 
}, config)

getNote({ 
  noteId: 456,
  entityType: "contacts"
}, config)
```

### Linking Functions:

**Before (workaround):**
```typescript
// ❌ Treated 500 error as success
try {
  await linkLeadToContact(leadId, contactId, config);
} catch (error) {
  if (error.status === 500) {
    // Assume it's already linked
  }
}
```

**Now (deterministic):**
```typescript
// ✅ Verifies links before creating
await linkLeadToContact(leadId, contactId, config);
// Function internally checks if link exists first
```

---

## 🔍 Known Kommo API Limitations

### 1. Pipeline Filter Doesn't Work

**Issue:** `GET /api/v4/leads?pipeline_id={id}` may return leads from other pipelines

**Workaround:** Filter results client-side by checking `lead.pipeline_id === targetPipelineId`

**Status:** ⚠️ Known limitation - Workaround implemented in client code

### 2. Maximum Items Per Page

**Issue:** Kommo API limits results to 250 items per page

**Workaround:** Use pagination with `page` and `limit` parameters

**Status:** ⚠️ Known limitation - Handled by pagination utilities

---

## 📚 References

- **Kommo API Documentation:** https://developers.kommo.com/reference/kommo-api-reference
- **Current Status:** See `docs/STATUS.md`
- **Setup Guide:** See `docs/SETUP.md`
- **Roadmap:** See `docs/ROADMAP.md`
- **Main README:** See `README.md`

---

**Last Updated:** 2026-01-12
