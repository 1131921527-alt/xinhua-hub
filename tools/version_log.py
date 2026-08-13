#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
新华Hub 版本管理工具
====================
自动记录 / 查询每次改动的版本信息，追加到 docs/CHANGELOG.md。

使用方式：
  1) 记录一条新版本（改动已 commit 后运行）：
     python tools/version_log.py add "修改内容描述" --task T108 --verify "PC+手机 ALL PASS"
     - 自动提取：当前日期、git HEAD 的 commit hash、本次 commit 涉及的文件
     - 自动关联：当天 qa/screenshots/ 目录下的验收截图（若有）
     - 追加条目到 docs/CHANGELOG.md

  2) 查询某页面/文件的历史变更：
     python tools/version_log.py query --file calculator-hongan.html
     python tools/version_log.py query --since 2026-08-01

  3) 查看当前工作区待提交改动：
     python tools/version_log.py status

  4) 查看最近 N 条版本记录：
     python tools/version_log.py log --limit 10
"""

import argparse
import os
import re
import subprocess
import sys
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHANGELOG = os.path.join(BASE_DIR, "docs", "CHANGELOG.md")
SCREENSHOT_DIR = os.path.join(BASE_DIR, "qa", "screenshots")


def run_git(*args):
    """运行 git 命令并返回输出"""
    try:
        result = subprocess.run(
            ["git"] + list(args),
            cwd=BASE_DIR,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
        return result.stdout.strip()
    except Exception as e:
        return f"git 命令失败: {e}"


def get_head_info():
    """获取当前 HEAD 的 commit 信息"""
    short_hash = run_git("rev-parse", "--short", "HEAD")
    full_hash = run_git("rev-parse", "HEAD")
    subject = run_git("log", "-1", "--format=%s")
    return {"short": short_hash, "full": full_hash, "subject": subject}


def get_last_commit_files():
    """获取最近一次 commit 涉及的文件列表"""
    files = run_git("show", "--name-only", "--format=", "HEAD")
    return [f for f in files.splitlines() if f.strip()]


def get_today_screenshots():
    """获取当天 qa/screenshots/ 下的截图目录与文件"""
    today = datetime.now().strftime("%Y-%m-%d")
    results = []
    if os.path.exists(SCREENSHOT_DIR):
        for entry in os.listdir(SCREENSHOT_DIR):
            full = os.path.join(SCREENSHOT_DIR, entry)
            if entry.startswith(today) or (os.path.isdir(full) and entry.startswith(today)):
                results.append(os.path.join("qa", "screenshots", entry))
    return results


def query_file_history(file_path, limit=20):
    """查询某个文件的历史提交"""
    log = run_git("log", f"-{limit}", "--format=%h|%ad|%s", "--date=short", "--", file_path)
    if not log or log.startswith("git 命令失败"):
        return log
    lines = []
    for line in log.splitlines():
        parts = line.split("|", 2)
        if len(parts) == 3:
            lines.append({"hash": parts[0], "date": parts[1], "subject": parts[2]})
    return lines


def add_entry(description, task=None, verify=None, extra_files=None):
    """追加一条版本记录到 CHANGELOG.md"""
    head = get_head_info()
    files = get_last_commit_files()
    screenshots = get_today_screenshots()
    today = datetime.now().strftime("%Y-%m-%d")

    # 整理影响页面
    impact_files = []
    for f in files:
        if f.endswith((".html", ".json", ".js", ".css")):
            impact_files.append(f)

    # 组装条目
    lines = []
    lines.append("")
    lines.append(f"### V5.0 · {today} · {description[:40]}{'…' if len(description) > 40 else ''}")
    lines.append(f"- **内容**：{description}")
    if task:
        lines.append(f"- **任务**：{task}")
    if impact_files:
        lines.append(f"- **影响文件**（{len(impact_files)} 个）：{', '.join(impact_files[:12])}")
        if len(impact_files) > 12:
            lines.append(f"  - 及其他 {len(impact_files) - 12} 个文件")
    if verify:
        lines.append(f"- **验收**：{verify}")
    if screenshots:
        lines.append(f"- **截图**：{', '.join(screenshots)}")
    lines.append(f"- **commit**：`{head['short']}`（{head['subject']}）")
    lines.append("")

    # 追加到 CHANGELOG.md（插到"历史基线"之前，保持倒序）
    try:
        with open(CHANGELOG, "r", encoding="utf-8") as f:
            content = f.read()

        anchor = "## 历史基线"
        if anchor in content:
            new_content = content.replace(anchor, "".join(lines) + "\n" + anchor, 1)
        else:
            new_content = content.rstrip() + "\n" + "".join(lines)

        with open(CHANGELOG, "w", encoding="utf-8") as f:
            f.write(new_content)

        print("✅ 版本记录已追加到 docs/CHANGELOG.md")
        print(f"   commit: {head['short']} ({head['subject']})")
        print(f"   影响文件: {len(impact_files)} 个")
        print(f"   截图: {len(screenshots)} 条")
        return True
    except Exception as e:
        print(f"❌ 写入失败: {e}")
        return False


def show_status():
    """显示当前工作区待提交改动"""
    status = run_git("status", "--short")
    if not status or status.startswith("git 命令失败"):
        print(status or "工作区干净，无待提交改动")
        return
    print("=== 待提交改动 ===")
    print(status)
    print()
    print("提示：commit 后运行 `python tools/version_log.py add \"描述\"` 自动记录版本")


def show_log(limit=10):
    """查看最近版本记录"""
    with open(CHANGELOG, "r", encoding="utf-8") as f:
        content = f.read()
    entries = re.findall(r"### V5\.0.*?(?=\n### |\Z)", content, re.DOTALL)
    print(f"=== 最近 {min(limit, len(entries))} 条版本记录 ===")
    for entry in entries[:limit]:
        title = entry.split("\n")[0].strip()
        print(f"\n{title}")
        for line in entry.split("\n")[1:]:
            line = line.strip()
            if line.startswith("- **commit**") or line.startswith("- **日期**"):
                print(f"  {line}")


def main():
    parser = argparse.ArgumentParser(description="新华Hub 版本管理工具")
    sub = parser.add_subparsers(dest="command")

    add_p = sub.add_parser("add", help="记录一条新版本")
    add_p.add_argument("description", help="修改内容描述")
    add_p.add_argument("--task", help="任务编号，如 T108")
    add_p.add_argument("--verify", help="验收结果，如 'PC+手机 ALL PASS'")

    query_p = sub.add_parser("query", help="查询历史变更")
    query_p.add_argument("--file", help="文件路径，如 calculator-hongan.html")
    query_p.add_argument("--since", help="起始日期，如 2026-08-01")
    query_p.add_argument("--limit", type=int, default=20, help="最多显示条数")

    sub.add_parser("status", help="查看待提交改动")
    log_p = sub.add_parser("log", help="查看版本记录")
    log_p.add_argument("--limit", type=int, default=10)

    args = parser.parse_args()

    if args.command == "add":
        add_entry(args.description, args.task, args.verify)
    elif args.command == "query":
        if args.file:
            hist = query_file_history(args.file, args.limit)
            if isinstance(hist, str):
                print(hist)
            elif hist:
                print(f"=== {args.file} 的历史变更（最近 {len(hist)} 次）===")
                for h in hist:
                    print(f"  {h['date']}  {h['hash']}  {h['subject']}")
            else:
                print(f"{args.file} 无提交记录（可能未跟踪）")
        elif args.since:
            log = run_git("log", f"--since={args.since}", "--format=%h|%ad|%s", "--date=short")
            if log:
                print(f"=== {args.since} 以来的提交 ===")
                for line in log.splitlines():
                    parts = line.split("|", 2)
                    if len(parts) == 3:
                        print(f"  {parts[1]}  {parts[0]}  {parts[2]}")
            else:
                print(f"{args.since} 以来无提交")
        else:
            print("请指定 --file 或 --since")
    elif args.command == "status":
        show_status()
    elif args.command == "log":
        show_log(args.limit)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
