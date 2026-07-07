---
name: ZCR Blockchain Workflow Fields
description: Blockchain workflow fields added to Dog type and how they map to the system diagram
---

## Workflow: Dog → Microchip Data ↔ Blockchain → Breed History → Health Records → Breeder Certification

Source diagram: `attached_assets/WhatsApp_Image_2026-06-26_at_17.33.37_1783365752721.jpeg`

## Dog Type Additions

```typescript
blockchainTxHash?: string;           // auto-generated hex on addDog
blockchainSyncStatus: BlockchainSyncStatus; // 'pending' | 'confirmed' | 'failed'
blockchainConfirmedAt?: string;      // date string YYYY-MM-DD
breederCertification?: BreederCertification; // { certNumber, issuedDate, status }
```

`addDog` now returns the created `Dog` object (not void), auto-generates txHash + cert.

## UI surfaces

- **add.tsx** — `BlockchainConfirmCard` overlay shows 5-step chain after registration; numbered sections (①–⑤) match workflow order; "Submit to Blockchain & Register" CTA
- **dog/[id].tsx** — 4th "Chain" tab = `ChainTab` vertical node diagram; blockchain sync badge on hero card; check-decagram on chip card

## Status types in ChainTab

`status: 'confirmed' | 'partial' | 'pending' | 'failed'`
- confirmed → primary gold, check-circle
- partial → warning amber, alert-circle
- failed → destructive red, close-circle
- pending → muted, clock-outline

**Why:** `failed` must be distinct from `pending` — a failed blockchain submission is not the same as one that hasn't run yet.

## GoldButton

Added optional `style?: StyleProp<ViewStyle>` prop to allow external margin/spacing overrides.
