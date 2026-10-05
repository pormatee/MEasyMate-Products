# QingYun Commercial V1 — Seller Runbook

## Offer
- Full trial: 7 days
- Launch price: 79 THB one-time
- V1: permanent
- Launch entitlement: Commercial V2 upgrade free
- Contact: https://lin.ee/T80LRHU

## Issue an activation code
From the QingYun commercial worktree:

```bash
python projects/qingyun/seller/qingyun_activation.py \
  --install-id "CUSTOMER_INSTALLATION_ID" \
  --order-ref "ORDER_REFERENCE"
```

Send only the value after `ACTIVATION_CODE=` to the customer.

## Seller key
Private key:
`/data/data/com.termux/files/home/.measymate/keys/qingyun-commercial-v1-private.pem`

This private key MUST NOT be committed or sent to customers.
Back it up securely. Losing it prevents issuing new licenses under key `5cfd0fb222332b17`.

## Local sales ledger
Each issued code appends a non-PII technical record to:
`~/.measymate/qingyun-sales/activations.jsonl`

## Customer activation
Customer opens QingYun Commercial, taps Unlock, pastes the signed code, then taps Activate.
The code is installation-bound and carries:
- permanent V1 = YES
- free V2 upgrade = YES
- campaign = LAUNCH_79
