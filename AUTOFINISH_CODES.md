# AUTOFINISH Code Management System

## 📋 Overview

This system manages 550 AUTOFINISH promotional codes with sequential processing capabilities. Codes can be generated in batches, processed one by one, and managed through API endpoints (patches).

---

## 🎯 Key Features

### 1. **Batch Code Generation**
- Generate 550 unique AUTOFINISH codes
- Sequential numbering: `AUTOFINISH-001` to `AUTOFINISH-550`
- Automatic batch tracking
- Configurable benefits (discount, bonus)

### 2. **Sequential Processing**
- Process codes one by one in order
- Track processing status (pending → active)
- Automatic activation timestamps
- Batch processing support

### 3. **Flexible Management**
- Update codes through PATCH endpoints
- Individual code management
- Batch operations
- Real-time statistics

---

## 🔧 Technical Implementation

### Database Model

**Table**: `promotional_codes`

**Key Fields**:
```python
- id: Primary key
- code: Unique code string (e.g., "AUTOFINISH-001")
- code_type: Type of code (autofinish, referral, etc.)
- sequence_number: Sequential order (1-550)
- status: Current status (pending, active, used, expired, disabled)
- is_active: Boolean flag for activation
- usage_count: Number of times used
- max_uses: Maximum allowed uses
- discount_percentage: Discount amount (0-100%)
- bonus_amount: Fixed bonus amount
- valid_from/valid_until: Validity period
- created_at: Creation timestamp
- activated_at: Activation timestamp
- processed_at: Processing timestamp
- batch_id: Batch identifier for grouping
- created_by_id: Admin who created the code
```

### Code Statuses

1. **PENDING**: Code created but not activated
2. **ACTIVE**: Code processed and ready for use
3. **USED**: Code has been fully used
4. **EXPIRED**: Code passed validity period
5. **DISABLED**: Code manually disabled

---

## 📡 API Endpoints

### Admin Endpoints (Require Admin Role)

#### 1. Generate Single Code
```http
POST /api/codes/generate
Content-Type: application/json

{
  "code_type": "autofinish",
  "sequence_number": 1,
  "discount_percentage": 10.0,
  "bonus_amount": 0.0,
  "max_uses": 1,
  "valid_days": 365,
  "description": "AUTOFINISH code #1"
}
```

#### 2. Generate Batch (550 codes)
```http
POST /api/codes/generate-batch
Content-Type: application/json

{
  "count": 550,
  "code_type": "autofinish",
  "discount_percentage": 10.0,
  "bonus_amount": 0.0,
  "max_uses": 1,
  "valid_days": 365
}
```

**Response**: Array of 550 generated codes

#### 3. Process Single Code
```http
POST /api/codes/process/{code_id}
```

**Effect**: Changes code status from PENDING → ACTIVE

#### 4. Process Entire Batch
```http
POST /api/codes/process-batch/{batch_id}
```

**Effect**: Processes all codes in batch sequentially

#### 5. List Codes with Filters
```http
GET /api/codes/?code_type=autofinish&status=pending&skip=0&limit=100
```

**Query Parameters**:
- `code_type`: Filter by type
- `status`: Filter by status
- `batch_id`: Filter by batch
- `skip`: Pagination offset
- `limit`: Results per page

#### 6. Get Batch Statistics
```http
GET /api/codes/batch/{batch_id}/stats
```

**Response**:
```json
{
  "batch_id": "AUTOFINISH-BATCH-20260220120000",
  "total_codes": 550,
  "pending": 450,
  "active": 95,
  "used": 5,
  "expired": 0,
  "disabled": 0,
  "total_usage": 5
}
```

#### 7. Get Single Code
```http
GET /api/codes/{code_id}
```

#### 8. Update Code (PATCH)
```http
PATCH /api/codes/{code_id}
Content-Type: application/json

{
  "status": "active",
  "is_active": true,
  "discount_percentage": 15.0,
  "bonus_amount": 10.0,
  "description": "Updated description"
}
```

**All fields are optional** - only update what you specify.

#### 9. Delete Code
```http
DELETE /api/codes/{code_id}
```

### Public Endpoints

#### 10. Validate Code
```http
GET /api/codes/validate/{code_string}
```

**Example**: `GET /api/codes/validate/AUTOFINISH-001`

**Response**:
```json
{
  "code": "AUTOFINISH-001",
  "is_valid": true,
  "status": "active",
  "discount_percentage": 10.0,
  "bonus_amount": 0.0,
  "valid_until": "2027-02-20T12:00:00"
}
```

#### 11. Use Code (Authenticated)
```http
POST /api/codes/use
Content-Type: application/json
Authorization: Bearer {token}

{
  "code": "AUTOFINISH-001"
}
```

**Response**:
```json
{
  "code": "AUTOFINISH-001",
  "discount_percentage": 10.0,
  "bonus_amount": 0.0,
  "referral_bonus": 0.0,
  "usage_count": 1,
  "max_uses": 1,
  "status": "used"
}
```

---

## 🚀 Usage Examples

### Example 1: Generate 550 AUTOFINISH Codes

```bash
curl -X POST "http://localhost:8000/api/codes/generate-batch" \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "count": 550,
    "code_type": "autofinish",
    "discount_percentage": 10.0,
    "valid_days": 365
  }'
```

**Result**: 550 codes created with status PENDING

### Example 2: Process Codes Sequentially

```bash
# Get batch ID from previous response
BATCH_ID="AUTOFINISH-BATCH-20260220120000"

# Process entire batch
curl -X POST "http://localhost:8000/api/codes/process-batch/${BATCH_ID}" \
  -H "Authorization: Bearer {admin_token}"
```

**Result**: All 550 codes activated (PENDING → ACTIVE)

### Example 3: Process One Code at a Time

```bash
# Get first pending code
CODE_ID=$(curl -X GET "http://localhost:8000/api/codes/?status=pending&limit=1" \
  -H "Authorization: Bearer {admin_token}" | jq '.[0].id')

# Process it
curl -X POST "http://localhost:8000/api/codes/process/${CODE_ID}" \
  -H "Authorization: Bearer {admin_token}"
```

**Result**: One code activated

### Example 4: Update Code Through PATCH

```bash
curl -X PATCH "http://localhost:8000/api/codes/123" \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "discount_percentage": 15.0,
    "description": "Updated discount"
  }'
```

**Result**: Code #123 updated with new discount

### Example 5: Check Batch Progress

```bash
BATCH_ID="AUTOFINISH-BATCH-20260220120000"

curl -X GET "http://localhost:8000/api/codes/batch/${BATCH_ID}/stats" \
  -H "Authorization: Bearer {admin_token}"
```

**Result**: Statistics showing pending/active/used counts

---

## 📊 Workflow: 550 AUTOFINISH Codes

### Step 1: Generate Batch
```python
# Admin generates 550 codes
POST /api/codes/generate-batch
{
  "count": 550,
  "code_type": "autofinish",
  "discount_percentage": 10.0,
  "valid_days": 365
}

# Response includes batch_id: "AUTOFINISH-BATCH-20260220120000"
```

### Step 2: Process Sequentially

**Option A: Process All at Once**
```python
POST /api/codes/process-batch/{batch_id}
# Activates all 550 codes
```

**Option B: Process One by One**
```python
# Get codes in order
GET /api/codes/?status=pending&batch_id={batch_id}&limit=1

# Process first code
POST /api/codes/process/{code_id}

# Repeat for each code...
```

### Step 3: Manage Through Patches

```python
# Update individual codes as needed
PATCH /api/codes/{code_id}
{
  "discount_percentage": 15.0,
  "status": "active",
  "description": "Special promotion"
}
```

### Step 4: Monitor Progress

```python
# Check batch statistics
GET /api/codes/batch/{batch_id}/stats

# View all codes
GET /api/codes/?batch_id={batch_id}
```

---

## 🔒 Security Features

1. **Admin-Only Operations**
   - Code generation requires admin role
   - Processing requires admin role
   - Updates/deletes require admin role

2. **Audit Logging**
   - All batch generations logged
   - Code usage tracked
   - User actions recorded

3. **Validation**
   - Unique code constraints
   - Status validation before processing
   - Expiry date checking
   - Usage limit enforcement

---

## 📈 Code Lifecycle

```
[CREATED]
    ↓
[PENDING] ──→ Process → [ACTIVE] ──→ Use → [USED]
    │                         │
    │                         ↓
    └──→ Disable → [DISABLED]  
                              ↓
                         [EXPIRED] (time-based)
```

---

## 💡 Best Practices

### 1. Batch Generation
- Generate all 550 codes at once for consistency
- Use meaningful batch IDs for tracking
- Set appropriate validity periods

### 2. Sequential Processing
- Process in order using sequence_number
- Check status before processing
- Log processing actions

### 3. Code Management
- Use PATCH for updates (not PUT)
- Keep descriptions meaningful
- Monitor batch statistics regularly

### 4. User Experience
- Validate codes before use
- Provide clear error messages
- Track usage patterns

---

## 🧪 Testing

### Test Code Generation
```bash
# Generate test batch (10 codes)
POST /api/codes/generate-batch
{"count": 10, "code_type": "autofinish"}
```

### Test Processing
```bash
# Get batch ID
GET /api/codes/?code_type=autofinish&limit=1

# Process batch
POST /api/codes/process-batch/{batch_id}
```

### Test Usage
```bash
# Validate code
GET /api/codes/validate/AUTOFINISH-001

# Use code
POST /api/codes/use
{"code": "AUTOFINISH-001"}
```

---

## 📝 Database Migration

To create the promotional_codes table:

```bash
cd backend
alembic upgrade head
```

This will execute the migration in `alembic/versions/001_promotional_codes.py`

---

## 🎛️ Configuration

Default settings for AUTOFINISH codes:
- **Count**: 550 codes
- **Prefix**: AUTOFINISH
- **Format**: AUTOFINISH-001 to AUTOFINISH-550
- **Discount**: 10% (configurable)
- **Max Uses**: 1 per code
- **Validity**: 365 days
- **Status**: PENDING (initially)

---

## 🔍 Monitoring

### Check Batch Progress
```bash
GET /api/codes/batch/{batch_id}/stats
```

### List Active Codes
```bash
GET /api/codes/?status=active
```

### List Used Codes
```bash
GET /api/codes/?status=used
```

### Find Code by Sequence
```bash
GET /api/codes/?sequence_number=1
```

---

## 🛠️ Troubleshooting

### Issue: Code Already Exists
**Solution**: Check existing codes before generating
```bash
GET /api/codes/?code=AUTOFINISH-001
```

### Issue: Cannot Process Code
**Reason**: Code status is not PENDING
**Solution**: Check status first
```bash
GET /api/codes/{code_id}
```

### Issue: Code Not Valid
**Reasons**:
- Status is not ACTIVE
- Expired (past valid_until date)
- Usage limit reached
- is_active = false

**Solution**: Use validate endpoint to check
```bash
GET /api/codes/validate/{code_string}
```

---

## 📚 Summary

The AUTOFINISH code system provides:

✅ **550 Sequential Codes**: AUTOFINISH-001 to AUTOFINISH-550  
✅ **Batch Operations**: Generate and process all at once  
✅ **Sequential Processing**: Process codes one by one  
✅ **Flexible Management**: Update through PATCH endpoints  
✅ **Complete Tracking**: Status, usage, timestamps  
✅ **Security**: Admin-only operations, audit logging  
✅ **Validation**: Public code validation endpoint  
✅ **Statistics**: Real-time batch monitoring  

All operations support management through "pečeve" (patches) as requested! 🎉
