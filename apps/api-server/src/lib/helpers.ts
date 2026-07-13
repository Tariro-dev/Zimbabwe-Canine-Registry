/** Generate a short unique ID */
export function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Simulate a blockchain transaction hash */
export function genTxHash(): string {
  const hex = () => Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, "0");
  return `0x${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}`;
}

/** Today as YYYY-MM-DD */
export function today(): string {
  return new Date().toISOString().split("T")[0]!;
}

/** Current ISO timestamp */
export function nowIso(): string {
  return new Date().toISOString();
}

/** Auto-generate a breeder cert number */
export function genCertNumber(): string {
  return `ZCR-CERT-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

/** Map a DB dog row to the API Dog shape */
export function dogToApi(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    breed: row.breed,
    gender: row.gender,
    color: row.color,
    birthDate: row.birthDate,
    microchipId: row.microchipId,
    ownerId: row.ownerId,
    ownerName: row.ownerName,
    breederId: row.breederId,
    breederName: row.breederName,
    dameMicrochip: row.dameMicrochip ?? null,
    sireMicrochip: row.sireMicrochip ?? null,
    litterId: row.litterId ?? null,
    vaccineHistory: row.vaccineHistory,
    sterilizationStatus: row.sterilizationStatus,
    lastCheckup: row.lastCheckup ?? null,
    dnaHash: row.dnaHash ?? null,
    weight: row.weight ?? null,
    registrationDate: row.registrationDate,
    isStolen: row.isStolen,
    blockchainTxHash: row.blockchainTxHash ?? null,
    blockchainSyncStatus: row.blockchainSyncStatus,
    blockchainConfirmedAt: row.blockchainConfirmedAt ?? null,
    breederCertification:
      row.certNumber
        ? {
            certNumber: row.certNumber,
            issuedDate: row.certIssuedDate,
            status: row.certStatus,
          }
        : null,
  };
}
