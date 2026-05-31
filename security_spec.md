# Phase 0: Payload-First Security Spec & Test Plan

This document details the Zero-Trust security design for the **Optimalisasi Reproduksi Ternak Berau** database.

## 1. Data Invariants

1. **Role Boundary**: A user's profile role exists in `["petugas", "adminkab"]`. Users cannot self-upgrade their roles. Profile modifications can only be performed by actual `adminkab` accounts or the user themselves (with strict immutable field locks on their own role).
2. **Identity Integrity**: All livestock records (`penandaan`, `inseminasi`, `kebuntingan`, `kelahiran`) must be authored by the currently authenticated user match (where the officer field `namaPetugas` and registration credentials match the signed-in user).
3. **Immutable History**: All historic tracking timestamps `createdAt` and identity IDs like `idEartagInduk` or `nomorEartagAnak` are immutable after initial registration.
4. **Input Size Limits**: All string inputs are constrained in length (e.g., tags and names must be <= 128 characters) to prevent Denial-of-Wallet (DoW) database exhaustion.

---

## 2. The "Dirty Dozen" Vulnerability Payloads

The following 12 JSON payloads must fail validation and return `PERMISSION_DENIED`.

### Payload 1: Role Escalation on Profile Creation
*   **Target Collection**: `/users/{userId}`
*   **Attack Vector**: Self-assigning the role of `adminkab` during initial registration without admin verification.
*   **Payload**:
    ```json
    {
      "username": "attacker",
      "password": "compromisedpassword",
      "namaPetugas": "Malicious Attacker",
      "role": "adminkab",
      "createdAt": "2026-05-31T10:00:00Z"
    }
    ```

### Payload 2: Shadow Field Injection (Ghost Fields)
*   **Target Collection**: `/users/{userId}`
*   **Attack Vector**: Over-injecting an unauthorized field `isGlobalAdmin` to trigger backdoor permissions.
*   **Payload**:
    ```json
    {
      "username": "petugas_hacker",
      "password": "password",
      "namaPetugas": "Normal Officer",
      "role": "petugas",
      "isGlobalAdmin": true,
      "createdAt": "2026-05-31T10:00:00Z"
    }
    ```

### Payload 3: Identity Spoofing on Record Creation
*   **Target Collection**: `/penandaan/{recordId}`
*   **Attack Vector**: Authenticated user `petugas_a` writes a Penandaan record under `namaPetugas: "Admin Dinas Berau"` to frame the administrator.
*   **Payload**:
    ```json
    {
      "namaPetugas": "Admin Dinas Berau",
      "tanggalPenandaan": "2026-05-31",
      "idEartagInduk": "ET-640101-ABCD",
      "namaPeternak": "Pak Tani",
      "kecamatan": "TANJUNG REDEB",
      "desa": "Karang Ambun",
      "rumpunTernak": "Sapi Bali",
      "jenisKelamin": "Betina"
    }
    ```

### Payload 4: Invalid Enumeration Bypass (Value Poisoning)
*   **Target Collection**: `/penandaan/{recordId}`
*   **Attack Vector**: Injecting an invalid sex category `jenisKelamin: "BukanHewan"`.
*   **Payload**:
    ```json
    {
      "namaPetugas": "Real Officer",
      "tanggalPenandaan": "2026-05-31",
      "idEartagInduk": "ET-640101-ABCD",
      "namaPeternak": "Pak Tani",
      "kecamatan": "TANJUNG REDEB",
      "desa": "Karang Ambun",
      "rumpunTernak": "Sapi Bali",
      "jenisKelamin": "BukanHewan"
    }
    ```

### Payload 5: Large Length Denial-of-Wallet (DoW) Payload
*   **Target Collection**: `/penandaan/{recordId}`
*   **Attack Vector**: Submitting a massive 2MB string in the `keterangan` field to run up database hosting storage costs.
*   **Payload**:
    ```json
    {
      "namaPetugas": "Real Officer",
      "tanggalPenandaan": "2026-05-31",
      "idEartagInduk": "ET-640101-ABCD",
      "namaPeternak": "Pak Tani",
      "kecamatan": "TANJUNG REDEB",
      "desa": "Karang Ambun",
      "rumpunTernak": "Sapi Bali",
      "keterangan": "A".repeat(2 * 1024 * 1024)
    }
    ```

### Payload 6: ID Poisoning Attack
*   **Target Document Path**: `/penandaan/POISON_$_JUNK_CHARACTER_%20_LONG_STRING_OVER_1000Chars_...`
*   **Attack Vector**: Attempting to write a document with an extremely long path ID containing invalid characters.
*   **Payload**: `{ "idEartagInduk": "ET-999" }`

### Payload 7: Overwriting Immutable Original Fields
*   **Target Update Operation**: `/penandaan/record_123` (Update)
*   **Attack Vector**: Modifying the original registered tag ID `idEartagInduk` to retroactively tamper with data.
*   **Payload (Update)**:
    ```json
    {
      "idEartagInduk": "ET-NEW-FRAUDULENT-ID"
    }
    ```

### Payload 8: Anonymous Document Writes
*   **Target Collection**: `/penandaan/{recordId}`
*   **Attack Vector**: Making a write query without passing a valid bearer authentication header block.
*   **Payload**: *(Any valid record write while unauthenticated).*

### Payload 9: Skip Status Steps/Invalid Update Sequence
*   **Target Update Operation**: `/kebuntingan/{recordId}`
*   **Attack Vector**: Injecting arbitrary state values outside of the defined `umurKebuntingan` enumeration (values 1 through 9).
*   **Payload**:
    ```json
    {
      "umurKebuntingan": "15"
    }
    ```

### Payload 10: Non-Verified Email Privilege Spoofing
*   **Target Operation**: `/users/{userId}` (Admin queries)
*   **Attack Vector**: Authenticated user with email `admin@berau.go.id` but with `email_verified == false` attempts administrative access.
*   **Payload**: *(Any retrieve query of other user lists).*

### Payload 11: Blanket Read Scraping Attack
*   **Target Operation**: `/users` (List)
*   **Attack Vector**: Regular `petugas` attempting to list the passwords and personal details of all users in the system.
*   **Payload**: `getDocs(collection(db, "users"))`

### Payload 12: Orphaned Child Birth Registration
*   **Target Collection**: `/kelahiran/{recordId}`
*   **Attack Vector**: Registrants registering a calving child record with a spoofed `nomorEartagAnak` that is empty or does not meet structural specifications.
*   **Payload**:
    ```json
    {
      "namaPetugas": "Officer",
      "tanggalLahirAnak": "2026-05-31",
      "idEartagInduk": "ET-INVALID-99",
      "namaPeternak": "Farmer",
      "kecamatan": "TANJUNG REDEB",
      "desa": "Karang Ambun",
      "nomorEartagAnak": "",
      "jenisKelaminAnak": "Jantan"
    }
    ```

---

## 3. Test Runner Specification (`firestore.rules.test.ts`)

```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { setDoc, collection, doc, updateDoc, getDocs } from "firebase/firestore";

let testEnv: RulesTestEnvironment;

describe("Zero-Trust Firestore Fortress Security Rules", () => {
  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "gen-lang-client-0586015962",
      firestore: {
        rules: `
          rules_version = '2';
          service cloud.firestore {
            // Fortress Rules
          }
        `
      }
    });
  });

  after(async () => {
    await testEnv.cleanup();
  });

  it("should fail role escalation on user creation", async () => {
    const unauthenticatedDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(
      setDoc(doc(unauthenticatedDb, "users/hacker"), {
        username: "hacker",
        password: "password",
        role: "adminkab"
      })
    );
  });
});
```
