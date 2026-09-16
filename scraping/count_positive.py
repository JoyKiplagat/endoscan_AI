"""
UT-EndoMRI Positive/Negative Counter
Run: python count_positives.py --root /path/to/UT-EndoMRI
"""

import os
import argparse
from collections import defaultdict

def count(root):
    results = {}

    institutions = {
        "D1_MHS":  {"em": 0, "no_em": 0, "patients": [], "raters": 3,
                    "structs": ["ut","ov","em","cy","cds"]},
        "D2_TCPW": {"em": 0, "no_em": 0, "patients": [], "raters": 1,
                    "structs": ["ut","ov","em"]},
    }

    seq_missing = defaultdict(list)
    label_missing = defaultdict(list)

    for inst, meta in institutions.items():
        inst_path = os.path.join(root, inst)
        if not os.path.isdir(inst_path):
            print(f"[!] Not found: {inst_path}")
            continue

        patients = sorted(
            p for p in os.listdir(inst_path)
            if os.path.isdir(os.path.join(inst_path, p))
        )
        meta["patients"] = patients

        for pt in patients:
            pt_path = os.path.join(inst_path, pt)
            files   = set(os.listdir(pt_path))

            # Check MRI sequences
            for seq in ["T1","T1FS","T2","T2FS"]:
                fname = f"{pt}_{seq}.nii.gz"
                fname2 = f"{pt}_{seq}.nii"   # uncompressed variant
                if fname not in files and fname2 not in files:
                    seq_missing[inst].append(f"{pt}: missing {seq}")

            # Check endometrioma label
            if inst == "D1_MHS":
                has_em = any(
                    f"{pt}_em_r{r}.nii.gz" in files or f"{pt}_em_r{r}.nii" in files
                    for r in [1, 2, 3]
                )
            else:
                has_em = (f"{pt}_em.nii.gz" in files or f"{pt}_em.nii" in files)

            if has_em:
                meta["em"] += 1
            else:
                meta["no_em"] += 1

        results[inst] = meta

    # ── Print report ──────────────────────────────────────────
    print("\n" + "="*58)
    print("  UT-EndoMRI  —  Positive / Negative Count")
    print("="*58)

    total_pos = total_neg = total_pts = 0

    for inst, meta in results.items():
        n  = len(meta["patients"])
        pos = meta["em"]
        neg = meta["no_em"]
        pct = pos / n * 100 if n else 0
        bar_p = "█" * int(pct/5) + "░" * (20 - int(pct/5))

        total_pos += pos
        total_neg += neg
        total_pts += n

        print(f"\n{inst}  ({n} patients, {meta['raters']} rater(s))")
        print(f"  Positive (em label present):  {pos:3d}  {bar_p}  {pct:.0f}%")
        print(f"  Negative (no em label):       {neg:3d}")

        if seq_missing[inst]:
            print(f"\n  Missing MRI sequences ({len(seq_missing[inst])}):")
            for m in seq_missing[inst][:8]:
                print(f"    {m}")
            if len(seq_missing[inst]) > 8:
                print(f"    ... and {len(seq_missing[inst])-8} more")

    ratio = total_pos / total_neg if total_neg else float("inf")

    print(f"\n{'='*58}")
    print(f"  TOTAL  {total_pts} patients")
    print(f"  Positive (endo present):  {total_pos}")
    print(f"  Negative (no endo):       {total_neg}")
    print(f"  Pos:Neg ratio:            1 : {1/ratio:.1f}" if ratio < 1
          else f"  Pos:Neg ratio:            {ratio:.1f} : 1")
    print()

    if ratio < 0.4 or ratio > 2.5:
        print("  ⚠  Class imbalance detected.")
        print("     Consider: weighted loss, oversampling positives,")
        print("     or adding negative-only cases from GLENDA.")
    else:
        print("  ✓  Ratio looks trainable. Augmentation still recommended.")

    print(f"\n  Estimated usable T2 volumes (best sequence for soft tissue):")
    print(f"    {total_pts} patients × 1 T2 scan = ~{total_pts} volumes")
    print(f"    With 2D slice extraction (~30 slices/volume): ~{total_pts*30} slices")
    print(f"    After augmentation (10×): ~{total_pts*30*10:,} training samples")
    print("="*58 + "\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default="./UT-EndoMRI",
                        help="Path to UT-EndoMRI root directory")
    args = parser.parse_args()
    count(args.root)