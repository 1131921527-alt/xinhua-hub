#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
新华Hub 演算器健康度检查工具
================================
扫描 10 个演算器，输出结构化健康评分报告。

检查维度：
1. 数据可信度 - 数据量、覆盖范围、结构一致性
2. 移动端适配 - viewport、响应式、触控友好
3. 导出功能 - html2canvas/toBlob/预览/保存
4. 代码质量 - 错误处理、输入校验、代码规范
5. 维护性 - 外部CSS引用、代码行数、内联数据比例
"""

import json
import os
import re
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CALCULATORS = [
    {
        "id": "yingmanxin", "name": "盈满鑫", "file": "calculator-yingmanxin.html",
        "data_files": ["data_yingmanxin.json", "data_yingmanxin_addcv.json"],
        "data_source": "external"
    },
    {
        "id": "hongan", "name": "宏安", "file": "calculator-hongan.html",
        "data_files": ["data_hongan.json"], "data_source": "external"
    },
    {
        "id": "hongxilai", "name": "宏禧来", "file": "calculator-hongxilai.html",
        "data_files": ["data_hongxilai.json"], "data_source": "external"
    },
    {
        "id": "hongyuan", "name": "宏愿", "file": "calculator-hongyuan.html",
        "data_files": ["data_hongyuan.json"], "data_source": "external"
    },
    {
        "id": "fusheng", "name": "福盛世家", "file": "calculator-fusheng.html",
        "data_files": [], "data_source": "inline"
    },
    {
        "id": "hongkun", "name": "宏坤", "file": "calculator-hongkun.html",
        "data_files": [], "data_source": "inline"
    },
    {
        "id": "hongtai", "name": "宏泰", "file": "calculator-hongtai.html",
        "data_files": [], "data_source": "inline"
    },
    {
        "id": "hongyu", "name": "宏御", "file": "calculator-hongyu.html",
        "data_files": [], "data_source": "inline"
    },
    {
        "id": "huacai", "name": "华彩", "file": "calculator-huacai.html",
        "data_files": [], "data_source": "inline"
    },
    {
        "id": "hengxiang", "name": "恒享", "file": "calculator-hengxiang.html",
        "data_files": [], "data_source": "inline"
    },
]


def read_file(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def check_data(calc, base_dir):
    """检查数据可信度"""
    result = {"score": 0, "max": 5, "details": []}

    if calc["data_source"] == "external":
        total_keys = 0
        for df in calc["data_files"]:
            path = os.path.join(base_dir, df)
            if not os.path.exists(path):
                result["details"].append(f"⚠ 数据文件缺失: {df}")
                continue
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            keys = len(data)
            total_keys += keys
            result["details"].append(f"✓ {df}: {keys:,} keys")

        if total_keys > 50000:
            result["score"] = 5
        elif total_keys > 10000:
            result["score"] = 4
        elif total_keys > 2000:
            result["score"] = 3
        elif total_keys > 500:
            result["score"] = 2
        else:
            result["score"] = 1

        result["total_keys"] = total_keys
    else:
        # 内联数据 - 检查 HTML 内的数据量
        html_path = os.path.join(base_dir, calc["file"])
        content = read_file(html_path)

        # 查找 CALC_DATA_INLINE 或类似大块数据
        inline_match = re.search(r'CALC_DATA_INLINE\s*=\s*(\{[^;]+\})', content)
        if inline_match:
            try:
                data_str = inline_match.group(1)
                data = json.loads(data_str)
                keys = len(data)
                result["details"].append(f"✓ 内联数据: {keys:,} keys")
                result["total_keys"] = keys
                if keys > 5000:
                    result["score"] = 5
                elif keys > 1000:
                    result["score"] = 4
                elif keys > 100:
                    result["score"] = 3
                else:
                    result["score"] = 2
            except json.JSONDecodeError:
                result["details"].append("⚠ 内联数据JSON解析失败")
                result["score"] = 2
        else:
            # 检查是否有其他形式的数据表
            # 查找千元基准表
            rate_matches = re.findall(r'(\d+_\d+_\d+)\s*:', content)
            if len(rate_matches) > 50:
                result["details"].append(f"✓ 内联基准表: ~{len(rate_matches)} 条")
                result["total_keys"] = len(rate_matches)
                result["score"] = 4
            else:
                result["details"].append("⚠ 未找到明显的数据表，可能使用公式计算")
                result["score"] = 3
                result["total_keys"] = 0

    return result


def check_mobile(calc, base_dir):
    """检查移动端适配"""
    result = {"score": 0, "max": 5, "details": []}
    html_path = os.path.join(base_dir, calc["file"])
    content = read_file(html_path)

    # viewport meta
    has_viewport = "viewport" in content and ("width=device-width" in content or "initial-scale" in content)
    if has_viewport:
        result["score"] += 1
        result["details"].append("✓ viewport meta 已设置")
    else:
        result["details"].append("✗ 缺少 viewport meta")

    # 响应式 CSS
    has_media = "@media" in content
    if has_media:
        result["score"] += 1
        result["details"].append("✓ 有 @media 响应式规则")
    else:
        result["details"].append("✗ 缺少 @media 响应式规则")

    # theme.css 引用
    has_theme = "theme.css" in content
    if has_theme:
        result["score"] += 1
        result["details"].append("✓ 引用 theme.css")
    else:
        result["details"].append("✗ 未引用 theme.css")

    # calc-common.css 引用
    has_calc_common = "calc-common.css" in content
    if has_calc_common:
        result["score"] += 1
        result["details"].append("✓ 引用 calc-common.css")
    else:
        result["details"].append("△ 未引用 calc-common.css（部分演算器用内联覆盖）")

    # 移动端预览逻辑（showImagePreview / 长按保存）
    has_mobile_preview = "showImagePreview" in content or "长按" in content or "wechat" in content.lower() or "weixin" in content.lower()
    if has_mobile_preview:
        result["score"] += 1
        result["details"].append("✓ 有移动端预览/长按保存逻辑")
    else:
        result["details"].append("△ 未检测到移动端预览逻辑")

    return result


def check_export(calc, base_dir):
    """检查导出功能"""
    result = {"score": 0, "max": 5, "details": []}
    html_path = os.path.join(base_dir, calc["file"])
    content = read_file(html_path)

    # html2canvas
    has_html2canvas = "html2canvas" in content
    if has_html2canvas:
        result["score"] += 2
        result["details"].append("✓ 使用 html2canvas 截图导出")
    else:
        result["details"].append("✗ 未使用 html2canvas")

    # toBlob / toDataURL
    has_blob = "toBlob" in content or "toDataURL" in content
    if has_blob:
        result["score"] += 1
        result["details"].append("✓ 有 toBlob/toDataURL 导出")
    else:
        result["details"].append("△ 无 toBlob/toDataURL")

    # showSaveFilePicker / a.click() 下载
    has_save = "showSaveFilePicker" in content or "a.click()" in content or "download" in content
    if has_save:
        result["score"] += 1
        result["details"].append("✓ 有文件保存逻辑")
    else:
        result["details"].append("△ 无文件保存逻辑")

    # 图片预览弹窗
    has_preview = "preview" in content.lower() or "modal" in content.lower() or "弹" in content
    if has_preview:
        result["score"] += 1
        result["details"].append("✓ 有图片预览弹窗")
    else:
        result["details"].append("△ 无图片预览弹窗")

    return result


def check_code_quality(calc, base_dir):
    """检查代码质量"""
    result = {"score": 0, "max": 5, "details": []}
    html_path = os.path.join(base_dir, calc["file"])
    content = read_file(html_path)

    # try-catch 错误处理
    try_count = content.count("try{") + content.count("try {") + content.count("try\n")
    if try_count >= 2:
        result["score"] += 2
        result["details"].append(f"✓ 有 {try_count} 处 try-catch 错误处理")
    elif try_count >= 1:
        result["score"] += 1
        result["details"].append(f"△ 有 {try_count} 处 try-catch")
    else:
        result["details"].append("✗ 无 try-catch 错误处理")

    # 输入校验
    has_validation = "isNaN" in content or "parseFloat" in content or "parseInt" in content
    if has_validation:
        result["score"] += 1
        result["details"].append("✓ 有输入校验逻辑")
    else:
        result["details"].append("△ 输入校验不明显")

    # 代码行数
    lines = content.count("\n")
    if lines < 700:
        result["score"] += 1
        result["details"].append(f"✓ 代码量适中 ({lines} 行)")
    elif lines < 1200:
        result["score"] += 1
        result["details"].append(f"△ 代码量偏大 ({lines} 行)")
    else:
        result["details"].append(f"⚠ 代码量过大 ({lines} 行)")
        result["score"] += 0

    # NaN 防护
    has_nan_guard = "NaN" in content or "isFinite" in content
    if has_nan_guard:
        result["score"] += 1
        result["details"].append("✓ 有 NaN/Infinity 防护")
    else:
        result["details"].append("△ NaN 防护不明显")

    return result


def check_maintainability(calc, base_dir):
    """检查维护性"""
    result = {"score": 0, "max": 5, "details": []}
    html_path = os.path.join(base_dir, calc["file"])
    content = read_file(html_path)
    file_size = os.path.getsize(html_path)

    # 外部 CSS 引用
    css_links = re.findall(r'<link[^>]+href="([^"]+\.css)"', content)
    if len(css_links) >= 2:
        result["score"] += 2
        result["details"].append(f"✓ 引用 {len(css_links)} 个外部CSS: {css_links}")
    elif len(css_links) >= 1:
        result["score"] += 1
        result["details"].append(f"△ 引用 {len(css_links)} 个外部CSS: {css_links}")
    else:
        result["details"].append("✗ 无外部CSS引用，全内联")

    # 文件大小
    if file_size < 50000:
        result["score"] += 2
        result["details"].append(f"✓ 文件大小适中 ({file_size/1024:.0f}KB)")
    elif file_size < 200000:
        result["score"] += 1
        result["details"].append(f"△ 文件偏大 ({file_size/1024:.0f}KB)")
    else:
        result["details"].append(f"⚠ 文件过大 ({file_size/1024:.0f}KB)")
        result["score"] += 0

    # 数据与代码分离
    if calc["data_source"] == "external":
        result["score"] += 1
        result["details"].append("✓ 数据与代码分离（外部JSON）")
    else:
        inline_ratio = 0
        if file_size > 0:
            # 估算内联数据占比
            inline_match = re.search(r'CALC_DATA_INLINE\s*=\s*\{', content)
            if inline_match:
                start = inline_match.start()
                # 找到匹配的结束位置（简化估算）
                rest = content[start:]
                # 粗略估计数据块大小
                brace_count = 0
                end_pos = 0
                for i, c in enumerate(rest):
                    if c == '{':
                        brace_count += 1
                    elif c == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            end_pos = i
                            break
                data_size = end_pos
                inline_ratio = data_size / file_size

        if inline_ratio > 0.5:
            result["details"].append(f"⚠ 内联数据占比高 ({inline_ratio*100:.0f}%)")
            result["score"] += 0
        elif inline_ratio > 0.1:
            result["score"] += 1
            result["details"].append(f"△ 内联数据占比中等 ({inline_ratio*100:.0f}%)")
        else:
            result["score"] += 1
            result["details"].append("✓ 内联数据占比低")

    return result


def generate_report(base_dir):
    """生成完整报告"""
    report = {
        "generatedAt": datetime.now().isoformat(),
        "baseDir": base_dir,
        "calculators": []
    }

    for calc in CALCULATORS:
        entry = {
            "id": calc["id"],
            "name": calc["name"],
            "file": calc["file"],
            "dataSource": calc["data_source"],
            "dimensions": {}
        }

        entry["dimensions"]["dataCredibility"] = check_data(calc, base_dir)
        entry["dimensions"]["mobileAdaptation"] = check_mobile(calc, base_dir)
        entry["dimensions"]["exportFunction"] = check_export(calc, base_dir)
        entry["dimensions"]["codeQuality"] = check_code_quality(calc, base_dir)
        entry["dimensions"]["maintainability"] = check_maintainability(calc, base_dir)

        # 总分
        total_score = sum(d["score"] for d in entry["dimensions"].values())
        total_max = sum(d["max"] for d in entry["dimensions"].values())
        entry["totalScore"] = total_score
        entry["totalMax"] = total_max
        entry["percentage"] = round(total_score / total_max * 100, 1)

        report["calculators"].append(entry)

    return report


def print_report(report):
    """打印可读的报告"""
    print("=" * 70)
    print("  新华Hub 演算器健康度检查报告")
    print(f"  生成时间: {report['generatedAt']}")
    print("=" * 70)

    # 排序：按总分降序
    calcs = sorted(report["calculators"], key=lambda x: x["percentage"], reverse=True)

    for calc in calcs:
        print(f"\n{'─' * 70}")
        print(f"  {calc['name']} ({calc['file']})")
        print(f"  数据来源: {'外部JSON' if calc['dataSource'] == 'external' else '内联数据'}")
        print(f"  总分: {calc['totalScore']}/{calc['totalMax']} ({calc['percentage']}%)")
        print(f"{'─' * 70}")

        stars = "★" * (calc['totalScore'] // 5) + "☆" * (calc['totalMax'] // 5 - calc['totalScore'] // 5)
        print(f"  健康指数: {stars}")

        for dim_name, dim in calc["dimensions"].items():
            dim_label = {
                "dataCredibility": "数据可信度",
                "mobileAdaptation": "移动端适配",
                "exportFunction": "导出功能",
                "codeQuality": "代码质量",
                "maintainability": "维护性"
            }.get(dim_name, dim_name)
            dim_stars = "★" * dim["score"] + "☆" * (dim["max"] - dim["score"])
            print(f"\n  [{dim_label}] {dim_stars} ({dim['score']}/{dim['max']})")
            for d in dim["details"]:
                print(f"    {d}")

    # 汇总表
    print(f"\n{'=' * 70}")
    print("  汇总排名")
    print(f"{'=' * 70}")
    print(f"  {'演算器':<12} {'数据':>6} {'移动':>6} {'导出':>6} {'质量':>6} {'维护':>6} {'总分':>8}")
    print(f"  {'─'*12} {'─'*6} {'─'*6} {'─'*6} {'─'*6} {'─'*6} {'─'*8}")

    for calc in calcs:
        dims = calc["dimensions"]
        print(f"  {calc['name']:<12} "
              f"{dims['dataCredibility']['score']}/{dims['dataCredibility']['max']:>2}   "
              f"{dims['mobileAdaptation']['score']}/{dims['mobileAdaptation']['max']:>2}   "
              f"{dims['exportFunction']['score']}/{dims['exportFunction']['max']:>2}   "
              f"{dims['codeQuality']['score']}/{dims['codeQuality']['max']:>2}   "
              f"{dims['maintainability']['score']}/{dims['maintainability']['max']:>2}   "
              f"{calc['totalScore']}/{calc['totalMax']} ({calc['percentage']}%)")


if __name__ == "__main__":
    report = generate_report(BASE_DIR)

    # 保存 JSON 报告
    report_dir = os.path.join(BASE_DIR, ".workbuddy", "reports")
    os.makedirs(report_dir, exist_ok=True)
    report_path = os.path.join(report_dir, f"calculator_health_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    # 打印可读报告
    print_report(report)
    print(f"\n\nJSON 报告已保存: {report_path}")
