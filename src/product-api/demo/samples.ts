/**
 * Synthetic demo material. Clearly labelled, never real dealer or OEM data.
 * Kept isolated so it can never enter a production adapter.
 */
export const SYNTHETIC_SAMPLE_FILENAME = "SYNTHETIC-repair-order-RO-48812.txt";

export const SYNTHETIC_SAMPLE_TEXT = `SYNTHETIC SAMPLE — NOT A REAL REPAIR ORDER
Dealer: Sample Equipment Co. (demo)
Repair Order: RO-48812
Unit Serial: SYN0X4412298
Failure Date: 2026-05-04
Repair Date: 2026-05-07
Complaint: Operator reports loss of hydraulic lift power under load.
Cause: Main hydraulic pump internal wear, pressure below specification.
Correction: Replaced main hydraulic pump, purged system, verified relief pressure to spec.
Causal Part: SYN-HP-3391
Parts: SYN-HP-3391 x1 hydraulic pump; SYN-SL-1120 x2 seal kit
Authorization: none required
Prior Claim: none
`;

/** Second sample used by tests and the CSV path. */
export const SYNTHETIC_SAMPLE_CSV_FILENAME = "SYNTHETIC-repair-orders.csv";

export const SYNTHETIC_SAMPLE_CSV = `Work Order,Serial Number,Failure Date,Repair Date,Meter,Complaint,Cause,Correction,Causal Part,Parts,Labor,Parts Retention,Prior Claim
RO-48813,SYN0X4419001,2026-05-11,2026-05-12,1841,Engine derate under load,Failed turbo actuator,Replaced turbo actuator and recalibrated,SYN-TA-7712,SYN-TA-7712 x1,3.4 hrs op 4120,retained and tagged,none
`;
