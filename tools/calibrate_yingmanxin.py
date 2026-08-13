#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
盈满鑫全量数据校准工具
========================
用途：将官方标准利益演示数据自动匹配到 data_yingmanxin_addcv.json 的 key，
      生成差异报告与待补清单，可选执行 JSON 更新。

数据口径：
- data_yingmanxin.json：千元保费口径 {cv, div, maturity}
- data_yingmanxin_addcv.json：千元保费口径的"红利现价（交清增额）"
- 官方模板：万元保费或具体金额展示，本脚本会自动按 premium/1000 还原为千元口径

标准输入格式（JSON）：
{
  "meta": {"source": "官方在线下载模板", "date": "2026-08-13"},
  "cases": [
    {
      "gender": 1,          // 0=男，1=女
      "age": 62,
      "payTerm": 3,
      "period": 6,
      "premium": 1000000,   // 年交保费（元），用于还原千元口径
      "data": {
        "1": {"addcv": 11.230},
        "2": {"addcv": 35.110},
        ...
      }
    }
  ]
}

只校准 addcv（红利现价/交清增额），不碰 cv/div/maturity 等已有主数据。
"""

import json
import os
import sys
import argparse
from collections import defaultdict
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ADDCV_PATH = os.path.join(BASE_DIR, "data_yingmanxin_addcv.json")
REPORT_DIR = os.path.join(BASE_DIR, ".workbuddy", "reports")


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def parse_key(key):
    """{gender}_{age}_{payTerm}_{period}_{year} -> tuple"""
    parts = key.split("_")
    return int(parts[0]), int(parts[1]), int(parts[2]), int(parts[3]), int(parts[4])


def build_key(gender, age, pay_term, period, year):
    return f"{gender}_{age}_{pay_term}_{period}_{year}"


def analyze_coverage(addcv):
    """输出当前 addcv 覆盖矩阵"""
    records = [parse_key(k) for k in addcv.keys()]

    genders = sorted(set(r[0] for r in records))
    ages = sorted(set(r[1] for r in records))
    pay_terms = sorted(set(r[2] for r in records))
    periods = sorted(set(r[3] for r in records))

    matrix = defaultdict(lambda: defaultdict(set))
    for r in records:
        matrix[(r[2], r[3])][r[0]].add(r[1])

    # 小数位数统计
    decimals = defaultdict(int)
    for v in addcv.values():
        s = f"{v:.10f}".rstrip("0")
        if "." in s:
            d = len(s.split(".")[1])
        else:
            d = 0
        decimals[min(d, 5)] += 1

    incomplete = []
    for (pay_term, period), gender_ages in sorted(matrix.items()):
        for gender in sorted(gender_ages):
            for age in sorted(gender_ages[gender]):
                expected = set(range(1, period + 1))
                actual = set(
                    r[4] for r in records
                    if r[0] == gender and r[1] == age and r[2] == pay_term and r[3] == period
                )
                if actual != expected:
                    incomplete.append({
                        "gender": gender, "age": age,
                        "payTerm": pay_term, "period": period,
                        "missingYears": sorted(expected - actual)
                    })

    return {
        "totalKeys": len(addcv),
        "genderRange": genders,
        "ageRange": [min(ages), max(ages)],
        "ageCount": len(ages),
        "payTerms": pay_terms,
        "periods": periods,
        "matrix": {
            f"{pt}年交_{pd}年期": {
                f"性别{g}": {
                    "ageMin": min(ages_g),
                    "ageMax": max(ages_g),
                    "ageCount": len(ages_g),
                    "keyCount": len(ages_g) * pd
                }
                for g, ages_g in sorted(ga.items())
            }
            for (pt, pd), ga in sorted(matrix.items())
        },
        "decimalDistribution": dict(decimals),
        "incompleteCases": incomplete
    }


def read_standard_data(path):
    """读取官方标准数据，支持 .json 与 .xlsx"""
    ext = os.path.splitext(path)[1].lower()
    if ext == ".json":
        return load_json(path)
    if ext in (".xlsx", ".xls"):
        return read_standard_excel(path)
    raise ValueError(f"不支持的标准数据格式: {ext}")


def read_standard_excel(path):
    """
    Excel 标准数据约定格式：
    每行一个案例，列：gender, age, payTerm, period, premium, year1_addcv, year2_addcv, ...
    表头第一行为字段名，从 year1_addcv 开始按年度顺序排列。
    """
    try:
        import openpyxl
    except ImportError:
        raise ImportError("读取 Excel 需要 openpyxl，请执行 pip install openpyxl")

    wb = openpyxl.load_workbook(path, data_only=True)
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))
    if len(rows) < 2:
        raise ValueError("Excel 数据为空")

    headers = [str(h) if h is not None else "" for h in rows[0]]
    meta_idx = {
        "gender": next((i for i, h in enumerate(headers) if "gender" in h.lower() or "性别" in h), None),
        "age": next((i for i, h in enumerate(headers) if h.lower() == "age" or "年龄" in h), None),
        "payTerm": next((i for i, h in enumerate(headers) if "payterm" in h.lower() or "交费期间" in h), None),
        "period": next((i for i, h in enumerate(headers) if h.lower() == "period" or "保险期间" in h), None),
        "premium": next((i for i, h in enumerate(headers) if "premium" in h.lower() or "年交保费" in h), None),
    }
    if None in meta_idx.values():
        raise ValueError(f"Excel 缺少必要列，当前表头: {headers}")

    year_cols = [(i, h) for i, h in enumerate(headers) if h.lower().startswith("year") or h.startswith("第")]
    year_cols.sort(key=lambda x: int("".join(filter(str.isdigit, x[1]))))

    cases = []
    for row in rows[1:]:
        if all(v is None for v in row):
            continue
        gender = int(row[meta_idx["gender"]])
        age = int(row[meta_idx["age"]])
        pay_term = int(row[meta_idx["payTerm"]])
        period = int(row[meta_idx["period"]])
        premium = float(row[meta_idx["premium"]])

        data = {}
        for idx, (col_i, _) in enumerate(year_cols, start=1):
            val = row[col_i]
            if val is None:
                continue
            data[str(idx)] = {"addcv": float(val)}

        cases.append({
            "gender": gender, "age": age,
            "payTerm": pay_term, "period": period,
            "premium": premium, "data": data
        })

    return {"meta": {"source": path}, "cases": cases}


def normalize_addcv(case):
    """
    将案例中的 addcv 还原为"元/千元保费"口径。

    支持两种输入口径：
    - addcv: 已经是"元/千元保费"口径，与 JSON 一致，直接保留
    - addcv_display: 官方模板展示金额（元），需要还原

    官方模板金额 = addcv(千元口径) * (premium / 1000)
    因此千元口径 = 模板金额 / (premium / 1000)
    """
    premium = float(case.get("premium", 1_000_000))
    scale = premium / 1000.0
    normalized = {}
    for year, vals in case.get("data", {}).items():
        if "addcv" in vals:
            # 已经是千元保费口径
            normalized[year] = round(float(vals["addcv"]), 6)
        elif "addcv_display" in vals:
            # 官方模板展示金额，需要还原
            normalized[year] = round(float(vals["addcv_display"]) / scale, 6)
        else:
            normalized[year] = 0.0
    return normalized


def calibrate(addcv, standard):
    """
    匹配标准数据与当前 addcv，返回差异报告。
    """
    matched = []
    mismatched = []
    missing = []

    for case in standard.get("cases", []):
        gender = case["gender"]
        age = case["age"]
        pay_term = case["payTerm"]
        period = case["period"]
        norm = normalize_addcv(case)

        for year_str, std_val in norm.items():
            year = int(year_str)
            key = build_key(gender, age, pay_term, period, year)
            cur_val = addcv.get(key)

            if cur_val is None:
                missing.append({
                    "key": key, "gender": gender, "age": age,
                    "payTerm": pay_term, "period": period, "year": year,
                    "standard": round(std_val, 6)
                })
                continue

            diff = round(std_val - cur_val, 6)
            if abs(diff) < 0.0005:
                matched.append({
                    "key": key, "current": cur_val, "standard": std_val,
                    "diff": diff
                })
            else:
                mismatched.append({
                    "key": key, "gender": gender, "age": age,
                    "payTerm": pay_term, "period": period, "year": year,
                    "current": cur_val, "standard": std_val, "diff": diff
                })

    return {
        "matchedCount": len(matched),
        "mismatchedCount": len(mismatched),
        "missingCount": len(missing),
        "matched": matched,
        "mismatched": mismatched,
        "missing": missing
    }


def apply_calibration(addcv, standard):
    """用标准数据更新 addcv，返回更新后的副本与更新清单"""
    updated = dict(addcv)
    updates = []
    for case in standard.get("cases", []):
        norm = normalize_addcv(case)
        for year_str, std_val in norm.items():
            year = int(year_str)
            key = build_key(case["gender"], case["age"], case["payTerm"], case["period"], year)
            old = updated.get(key)
            new_val = round(std_val, 6)
            updated[key] = new_val
            updates.append({"key": key, "old": old, "new": new_val})
    return updated, updates


def write_report(report, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    save_json(path, report)


def main():
    parser = argparse.ArgumentParser(description="盈满鑫 addcv 全量数据校准工具")
    parser.add_argument("--analyze", action="store_true", help="仅分析当前覆盖矩阵")
    parser.add_argument("--standard", "-s", help="官方标准数据文件（.json 或 .xlsx）")
    parser.add_argument("--apply", action="store_true", help="确认后将标准数据写入 data_yingmanxin_addcv.json")
    parser.add_argument("--report", "-r", help="差异报告输出路径，默认 .workbuddy/reports/yingmanxin_calibration_YYYYMMDD_HHMMSS.json")
    args = parser.parse_args()

    addcv = load_json(ADDCV_PATH)

    if args.analyze:
        coverage = analyze_coverage(addcv)
        print(json.dumps(coverage, ensure_ascii=False, indent=2))
        return

    if not args.standard:
        print("请提供 --standard 官方标准数据文件，或使用 --analyze 分析当前覆盖")
        sys.exit(1)

    standard = read_standard_data(args.standard)
    coverage = analyze_coverage(addcv)
    result = calibrate(addcv, standard)

    if args.apply:
        updated, updates = apply_calibration(addcv, standard)
        save_json(ADDCV_PATH, updated)
        result["appliedUpdates"] = len(updates)
        print(f"已更新 {len(updates)} 个键到 {ADDCV_PATH}")
    else:
        result["appliedUpdates"] = 0

    report = {
        "generatedAt": datetime.now().isoformat(),
        "addcvPath": ADDCV_PATH,
        "coverage": coverage,
        "standardSource": standard.get("meta", {}),
        "calibration": result
    }

    report_path = args.report or os.path.join(
        REPORT_DIR,
        f"yingmanxin_calibration_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    )
    write_report(report, report_path)
    print(f"差异报告已保存: {report_path}")

    # 控制台摘要
    print("\n=== 校准摘要 ===")
    print(f"标准案例数: {len(standard.get('cases', []))}")
    print(f"已匹配: {result['matchedCount']}")
    print(f"不匹配: {result['mismatchedCount']}")
    print(f"缺失键: {result['missingCount']}")
    if result["mismatchedCount"]:
        print("\n不匹配示例（前5条）:")
        for m in result["mismatched"][:5]:
            print(f"  {m['key']}: 当前={m['current']} 标准={m['standard']} 差={m['diff']}")


if __name__ == "__main__":
    main()
