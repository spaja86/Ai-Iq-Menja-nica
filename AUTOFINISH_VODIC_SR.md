# AUTOFINISH Kodovi - Brzi Vodič (Serbian)

## 🎯 Šta je Urađeno?

Sistem za generisanje i upravljanje sa **550 AUTOFINISH kodova**.

---

## 📋 Kako Funkcioniše?

### Korak 1: Generiši 550 Kodova

```bash
POST /api/codes/generate-batch
{
  "count": 550,
  "code_type": "autofinish",
  "discount_percentage": 10.0,
  "valid_days": 365
}
```

**Rezultat**: 
- Krerano 550 kodova: `AUTOFINISH-001`, `AUTOFINISH-002`, ..., `AUTOFINISH-550`
- Svi su u statusu `PENDING` (čekaju na procesiranje)
- Dobio si `batch_id` za praćenje (npr. `AUTOFINISH-BATCH-20260220120000`)

---

### Korak 2: Procesiraj Kodove

#### Opcija A: SVE Odjednom ⚡

```bash
POST /api/codes/process-batch/{batch_id}
```

**Efekat**: Svih 550 kodova se aktivira (PENDING → ACTIVE)

#### Opcija B: Jedan Po Jedan (Sekvencijalno) 🔄

```bash
# 1. Uzmi prvi kod koji čeka
GET /api/codes/?status=pending&sequence_number=1

# 2. Procesiraj ga
POST /api/codes/process/{code_id}

# 3. Ponovi za sledeći
GET /api/codes/?status=pending&sequence_number=2
POST /api/codes/process/{code_id}

# ... i tako dalje do 550
```

**Efekat**: Procesiraš kodove jedan po jedan po redosledu

---

### Korak 3: Upravljaj Preko "Pečeva" (PATCH) 🔧

Možeš da menjaš bilo koji kod bilo kada:

```bash
PATCH /api/codes/{code_id}
{
  "discount_percentage": 15.0,
  "description": "Specijalna promocija",
  "status": "active"
}
```

**Efekat**: Samo ta polja se menjaju, ostala ostaju ista

---

### Korak 4: Prati Napredak 📊

```bash
GET /api/codes/batch/{batch_id}/stats
```

**Rezultat**:
```json
{
  "batch_id": "AUTOFINISH-BATCH-20260220120000",
  "total_codes": 550,
  "pending": 100,    // 100 čeka
  "active": 450,     // 450 aktivno
  "used": 0,         // 0 iskorišćeno
  "expired": 0,
  "disabled": 0
}
```

---

## 🎮 Primeri Upotrebe

### Primer 1: Generiši Sve Kodove

```bash
curl -X POST "http://localhost:8000/api/codes/generate-batch" \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "count": 550,
    "discount_percentage": 10.0
  }'
```

✅ **Dobio si**: 550 kodova AUTOFINISH-001 do AUTOFINISH-550

---

### Primer 2: Procesiraj Prvi Kod

```bash
# Nađi prvi kod
curl -X GET "http://localhost:8000/api/codes/?sequence_number=1&status=pending" \
  -H "Authorization: Bearer {admin_token}"

# Procesiraj ga (npr. ID = 1)
curl -X POST "http://localhost:8000/api/codes/process/1" \
  -H "Authorization: Bearer {admin_token}"
```

✅ **Rezultat**: AUTOFINISH-001 je sada ACTIVE

---

### Primer 3: Procesiraj Drugi Kod

```bash
# Nađi drugi kod
curl -X GET "http://localhost:8000/api/codes/?sequence_number=2&status=pending" \
  -H "Authorization: Bearer {admin_token}"

# Procesiraj ga (npr. ID = 2)
curl -X POST "http://localhost:8000/api/codes/process/2" \
  -H "Authorization: Bearer {admin_token}"
```

✅ **Rezultat**: AUTOFINISH-002 je sada ACTIVE

---

### Primer 4: Procesiraj SVE Odjednom

```bash
# Ako želiš da procesiraš sve odjednom
BATCH_ID="AUTOFINISH-BATCH-20260220120000"

curl -X POST "http://localhost:8000/api/codes/process-batch/${BATCH_ID}" \
  -H "Authorization: Bearer {admin_token}"
```

✅ **Rezultat**: Svih 550 kodova je ACTIVE

---

### Primer 5: Promeni Popust Na Kodu

```bash
# Promeni kod #5 da ima 15% umesto 10%
curl -X PATCH "http://localhost:8000/api/codes/5" \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "discount_percentage": 15.0,
    "description": "VIP kod sa većim popustom"
  }'
```

✅ **Rezultat**: AUTOFINISH-005 sada ima 15% popusta

---

### Primer 6: Proveri Koliko Si Uradio

```bash
BATCH_ID="AUTOFINISH-BATCH-20260220120000"

curl -X GET "http://localhost:8000/api/codes/batch/${BATCH_ID}/stats" \
  -H "Authorization: Bearer {admin_token}"
```

✅ **Rezultat**: 
```json
{
  "total_codes": 550,
  "pending": 545,     // još 545 čeka
  "active": 5,        // aktivirao si 5
  "used": 0
}
```

---

## 🔄 Redosled Rada

1. **Generiši**: Napravi 550 kodova
2. **Procesiraj**: Aktiviraj ih jedan po jedan (ili sve odjednom)
3. **Upravljaj**: Menjaj preko PATCH kad treba
4. **Prati**: Gledaj statistiku koliko si uradio

---

## 📊 Statusi Kodova

- **PENDING** 🟡 - Kreiran, čeka procesiranje
- **ACTIVE** 🟢 - Procesiran, spreman za upotrebu
- **USED** 🔵 - Iskorišćen
- **EXPIRED** 🔴 - Istekao
- **DISABLED** ⚫ - Onemogućen

---

## 🎯 Prednosti Sistema

### ✅ **Sekvencijalno Procesiranje**
Možeš da procesiraš kodove jedan po jedan:
- AUTOFINISH-001 (procesiraj)
- Sačekaj/proveri
- AUTOFINISH-002 (procesiraj)
- Sačekaj/proveri
- ... i tako dalje do 550

### ✅ **Upravljanje Preko Pečeva**
Možeš da menjaš kodove bez brisanja:
```bash
PATCH /api/codes/{id}  # Promeni šta god treba
```

### ✅ **Praćenje Napretka**
Vidiš tačno koliko si uradio:
- Koliko čeka (pending)
- Koliko je aktivno (active)
- Koliko je iskorišćeno (used)

### ✅ **Fleksibilnost**
- Aktiviraj sve odjednom ili jedan po jedan
- Menjaj popuste i bonuse
- Deaktiviraj kodove ako treba
- Praćenje ko je kreirao i ko koristio

---

## 🚀 Brzi Start

### 1. Pokreni Server
```bash
cd backend
uvicorn app.main:app --reload
```

### 2. Otvori API Dokumentaciju
```
http://localhost:8000/api/docs
```

### 3. Generiši Kodove
Klikni na `POST /api/codes/generate-batch`  
Unesi: `{"count": 550, "discount_percentage": 10.0}`  
Klikni **Execute**

### 4. Procesiraj Kodove
Klikni na `POST /api/codes/process-batch/{batch_id}`  
Unesi batch_id koji si dobio  
Klikni **Execute**

### 5. Proveri Status
Klikni na `GET /api/codes/batch/{batch_id}/stats`  
Klikni **Execute**

---

## 💡 Saveti

### Za Sekvencijalno Procesiranje
```bash
# Procesiranje jedan po jedan sa petljom
for i in {1..550}; do
  # Nađi kod sa sequence_number = $i
  CODE_ID=$(curl -X GET "http://localhost:8000/api/codes/?sequence_number=$i&status=pending&limit=1" \
    -H "Authorization: Bearer {token}" | jq '.[0].id')
  
  # Procesiraj ga
  curl -X POST "http://localhost:8000/api/codes/process/${CODE_ID}" \
    -H "Authorization: Bearer {token}"
  
  echo "Procesiran kod #$i"
  sleep 1  # Sačekaj sekundu
done
```

### Za Grupno Procesiranje
```bash
# Sve odjednom
curl -X POST "http://localhost:8000/api/codes/process-batch/{batch_id}" \
  -H "Authorization: Bearer {token}"
```

---

## ❓ Pitanja i Odgovori

### P: Kako da vidim sve kodove?
```bash
GET /api/codes/?batch_id={batch_id}
```

### P: Kako da promenim jedan kod?
```bash
PATCH /api/codes/{code_id}
{"discount_percentage": 15.0}
```

### P: Kako da vidim samo kodove koji čekaju?
```bash
GET /api/codes/?status=pending
```

### P: Kako da procesiram samo jedan kod?
```bash
POST /api/codes/process/{code_id}
```

### P: Kako da vidim koliko sam uradio?
```bash
GET /api/codes/batch/{batch_id}/stats
```

---

## ✅ Zaključak

Sada imaš sistem gde možeš:

1. ✅ Generisati 550 AUTOFINISH kodova
2. ✅ Procesirati ih jedan po jedan (sekvencijalno)
3. ✅ Upravljati njima preko "pečeva" (PATCH)
4. ✅ Pratiti napredak u realnom vremenu
5. ✅ Menjati popuste i bonuse
6. ✅ Videti statistiku korišćenja

**Sve je spremno za korišćenje!** 🎉

---

## 📖 Detaljna Dokumentacija

Za više detalja vidi: `AUTOFINISH_CODES.md` (engleski, tehnički vodič)

---

**Datum**: 20. Februar 2026  
**Verzija**: 1.0.0  
**Status**: ✅ Spremno za produkciju
