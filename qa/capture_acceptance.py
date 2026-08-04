# -*- coding: utf-8 -*-
"""
xinhua-hub 验收截图自动采集脚本（长期规范工具）

用法：
    python qa/capture_acceptance.py                  # 采集全量核心页面
    python qa/capture_acceptance.py yingmanxin home  # 只采集指定 key

产出：qa/screenshots/YYYY-MM-DD/
    命名规范： 日期_页面_功能_设备.png （无功能时 日期_页面_设备.png）

    2026-08-04_home_pc.png                    桌面端整页
    2026-08-04_home_mobile.png                手机端整页概览
    2026-08-04_home_firstscreen_mobile.png    手机端首屏（高清 2x）
    2026-08-04_yingmanxin_input_mobile.png    演算器输入区
    2026-08-04_yingmanxin_result_mobile.png   演算器计算结果区
    2026-08-04_yingmanxin_export_mobile.png   真实 downloadImage() 导出的 PNG
    _manifest.txt                             截图清单 + 尺寸 + 问题记录

体积控制：整页概览 1x 采样，首屏/区域 2x 高清，导出 PNG 保留原始质量。
"""
import base64
import datetime
import os
import struct
import subprocess
import sys
import time

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(BASE)

TODAY = datetime.date.today().strftime("%Y-%m-%d")
OUT = os.path.join(BASE, "qa", "screenshots", TODAY)
os.makedirs(OUT, exist_ok=True)

PORT = 8799
DESKTOP = {"width": 1440, "height": 900}
MOBILE = {"width": 390, "height": 844}
MAX_FULLPAGE_H = 12000   # 整页截图最大高度（CSS px），超出只截前段

# kind=calc : 演算器（输入区 / 结果区 / 导出PNG）
# kind=page : 普通页面（桌面整页 + 手机整页 + 手机首屏）
PAGES = [
    {"key": "home",        "file": "index.html",                        "kind": "page", "label": "首页"},
    {"key": "yingmanxin",  "file": "calculator-yingmanxin.html",        "kind": "calc", "label": "盈满鑫演算器"},
    {"key": "hongan",      "file": "calculator-hongan.html",            "kind": "calc", "label": "宏安世家演算器"},
    {"key": "hengxiang",   "file": "calculator-hengxiang.html",         "kind": "calc", "label": "恒享人生演算器"},
    {"key": "hongyu",      "file": "calculator-hongyu.html",            "kind": "calc", "label": "宏御世家演算器"},
    {"key": "hongyuan",    "file": "calculator-hongyuan.html",          "kind": "calc", "label": "宏愿人生演算器"},
    {"key": "dividend",    "file": "dividend.html",                     "kind": "page", "label": "红利实现率查询台"},
    {"key": "hongli_2025", "file": "dividend-2025-interpretation.html", "kind": "page", "label": "2025红利深度解读"},
    {"key": "hongli_doc",  "file": "hongli-realization.html",           "kind": "page", "label": "红利实现率详细说明"},
    {"key": "sales_qa",         "file": "sales-qa.html",                  "kind": "page", "label": "销售问答索引"},
    {"key": "sales_qa_yiyi",    "file": "sales-qa-yiyi.html",             "kind": "page", "label": "客户异议"},
    {"key": "sales_qa_fenhong", "file": "sales-qa-fenhong.html",          "kind": "page", "label": "分红险话术"},
    {"key": "sales_qa_yanglao", "file": "sales-qa-yanglao.html",          "kind": "page", "label": "养老规划"},
    {"key": "sales_qa_chuancheng","file": "sales-qa-chuancheng.html",     "kind": "page", "label": "财富传承"},
    {"key": "sales_qa_hk",       "file": "sales-qa-hk.html",               "kind": "page", "label": "香港保险"},
    {"key": "sales_qa_gaoke",    "file": "sales-qa-gaoke.html",           "kind": "page", "label": "高客经营"},
    {"key": "company",     "file": "company-intro.html",                "kind": "page", "label": "公司介绍"},
]

INPUT_SEL = [".input-card", ".card", "form", ".controls"]
RESULT_SEL = ["#planArea", ".plan", "#resultArea"]

JS_INIT = """
window.__capBlob = null;
URL.createObjectURL = function(blob){ window.__capBlob = blob; return 'blob:fake#'+Math.random().toString(36).slice(2); };
try { Object.defineProperty(window, 'showSaveFilePicker', { value: undefined, configurable: true }); } catch(e){}
HTMLAnchorElement.prototype.click = function(){};
// 兜底：部分页面 showToast 在导出分支中不可见，避免流程中断
if(typeof window.showToast !== 'function'){ window.showToast = function(msg){ console.log('[toast]', msg); }; }
// 兜底：宏御(canvas 绘制) 用 canvas.toBlob 而非 URL.createObjectURL，截获 blob
(function(){
  const orig = HTMLCanvasElement.prototype.toBlob;
  if(orig && !orig.__capPatched){
    HTMLCanvasElement.prototype.toBlob = function(cb, type, quality){
      orig.call(this, function(blob){ if(blob) window.__capBlob = blob; if(cb) cb(blob); }, type, quality);
    };
    HTMLCanvasElement.prototype.toBlob.__capPatched = true;
  }
})();
"""

saved, problems = [], []


def png_size(path):
    try:
        with open(path, "rb") as f:
            d = f.read(33)
        return struct.unpack(">II", d[16:24])
    except Exception:
        return (0, 0)


def fname(key, device, func=None):
    return os.path.join(OUT, f"{TODAY}_{key}_{func}_{device}.png" if func
                        else f"{TODAY}_{key}_{device}.png")


def shot_full(page, path):
    """整页截图，超长时只截前段避免文件过大"""
    h = page.evaluate("Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)")
    if h > MAX_FULLPAGE_H:
        w = page.evaluate("window.innerWidth")
        page.screenshot(path=path, clip={"x": 0, "y": 0, "width": w, "height": MAX_FULLPAGE_H})
        problems.append(f"{os.path.basename(path)}: 页面过长({h}px)，仅截取前 {MAX_FULLPAGE_H}px")
    else:
        page.screenshot(path=path, full_page=True)
    saved.append(path)


def shot_el(page, selectors, path, label):
    for sel in selectors:
        try:
            el = page.query_selector(sel)
            if el and el.is_visible():
                el.screenshot(path=path)
                saved.append(path)
                return True
        except Exception:
            continue
    problems.append(f"{label}: 未找到区域 {selectors}")
    return False


def run_calc(page):
    for sel in ['button:has-text("生成利益演示")', 'button:has-text("生成")',
                'button:has-text("计算")', '#calcBtn', '.calc-btn']:
        try:
            page.click(sel, timeout=2500)
            # V3.1: 等待异步数据加载并填充核心指标卡（#kmMaturity 不再是占位符"—"）
            page.wait_for_function("""() => {
                const km = document.getElementById('kmMaturity');
                return km && km.textContent !== '\u2014' && km.textContent !== '-';
            }""", timeout=10000)
            return
        except Exception:
            continue
    try:
        page.evaluate("if(typeof generate==='function') generate(); "
                      "else if(typeof calculate==='function') calculate();")
    except Exception:
        pass


def check_hscroll(page, key):
    r = page.evaluate("""() => {
        const de=document.documentElement, b=document.body;
        const docW=Math.max(de.scrollWidth,b.scrollWidth);
        return {docW, vw:window.innerWidth};
    }""")
    if r["docW"] > r["vw"] + 2:
        problems.append(f"{key}: 手机端页面级横向滚动 docW={r['docW']} > 视口{r['vw']}")
        return False
    return True


def main():
    only = set(a.lower() for a in sys.argv[1:])
    targets = [p for p in PAGES if not only or p["key"].lower() in only]
    if not targets:
        print("[ERR] 无匹配 key，可选：", ", ".join(p["key"] for p in PAGES))
        return

    proc = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT)], cwd=BASE,
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1.5)
    hscroll_ok = []
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as pw:
            browser = pw.chromium.launch(args=["--no-sandbox"])

            for item in targets:
                key, fn, kind, label = item["key"], item["file"], item["kind"], item["label"]
                url = f"http://localhost:{PORT}/{fn}"

                # ---------------- 桌面端 ----------------
                pc = browser.new_page(viewport=DESKTOP, device_scale_factor=1)
                pc.add_init_script(JS_INIT)
                try:
                    pc.goto(url, wait_until="networkidle", timeout=30000)
                    pc.wait_for_timeout(600)
                    if kind == "calc":
                        shot_el(pc, INPUT_SEL, fname(key, "pc", "input"), f"{key} pc输入区")
                        run_calc(pc)
                        pc.wait_for_timeout(900)
                        shot_el(pc, RESULT_SEL, fname(key, "pc", "result"), f"{key} pc结果区")
                    else:
                        shot_full(pc, fname(key, "pc"))
                except Exception as e:
                    problems.append(f"{key} pc: {e}")
                finally:
                    pc.close()

                # ---------------- 手机端 ----------------
                mo = browser.new_page(viewport=MOBILE, is_mobile=True, device_scale_factor=1)
                mo.add_init_script(JS_INIT)
                try:
                    mo.goto(url, wait_until="networkidle", timeout=30000)
                    mo.wait_for_timeout(600)
                    ok = check_hscroll(mo, key)
                    hscroll_ok.append((key, ok))
                    shot_full(mo, fname(key, "mobile"))          # 整页概览 1x
                except Exception as e:
                    problems.append(f"{key} mobile: {e}")
                finally:
                    mo.close()

                # ------------- 手机端高清（首屏 / 区域 / 导出） -------------
                hd = browser.new_page(viewport=MOBILE, is_mobile=True, device_scale_factor=2)
                hd.add_init_script(JS_INIT)
                try:
                    hd.goto(url, wait_until="networkidle", timeout=30000)
                    hd.wait_for_timeout(600)
                    if kind == "calc":
                        shot_el(hd, INPUT_SEL, fname(key, "mobile", "input"), f"{key} 手机输入区")
                        run_calc(hd)
                        hd.wait_for_timeout(900)
                        shot_el(hd, RESULT_SEL, fname(key, "mobile", "result"), f"{key} 手机结果区")
                        res = hd.evaluate("""async () => {
                            try { await downloadImage(); } catch(e){ return {err:String(e)}; }
                            const blob = window.__capBlob;
                            if(!blob) return {err:'no blob'};
                            const dataUrl = await new Promise(r=>{const rd=new FileReader();
                                rd.onload=()=>r(rd.result); rd.readAsDataURL(blob);});
                            const html = document.body.innerHTML;
                            return {dataUrl, reserve:html.includes('储备期'),
                                    foot:html.includes('新华资料库 xinhua-hub')};
                        }""")
                        if "dataUrl" in res:
                            p = fname(key, "mobile", "export")
                            with open(p, "wb") as f:
                                f.write(base64.b64decode(res["dataUrl"].split(",", 1)[1]))
                            saved.append(p)
                            w, h = png_size(p)
                            print(f"  [导出] {key}: {w}x{h} "
                                  f"{'储备期OK' if res.get('reserve') else '储备期-'} "
                                  f"{'署名OK' if res.get('foot') else '署名缺失'}")
                            if w < 1500:
                                problems.append(f"{key}: 导出宽度仅 {w}px，低于 1600px 标准")
                            if not res.get("foot"):
                                problems.append(f"{key}: 导出图缺少底部署名")
                        else:
                            problems.append(f"{key} export: {res}")
                    else:
                        hd.screenshot(path=fname(key, "mobile", "firstscreen"))
                        saved.append(fname(key, "mobile", "firstscreen"))
                except Exception as e:
                    problems.append(f"{key} 高清: {e}")
                finally:
                    hd.close()

                print(f"[OK] {label} ({key})")
            browser.close()
    finally:
        proc.terminate()

    total = sum(os.path.getsize(p) for p in saved if os.path.exists(p))
    with open(os.path.join(OUT, "_manifest.txt"), "w", encoding="utf-8") as f:
        f.write(f"xinhua-hub 验收截图清单  {TODAY}\n共 {len(saved)} 张 / {total/1024/1024:.1f}MB\n\n")
        for p in sorted(saved):
            if not os.path.exists(p):
                continue
            w, h = png_size(p)
            f.write(f"{os.path.basename(p):56s} {w}x{h}  {os.path.getsize(p)/1024:.0f}KB\n")
        f.write("\n手机端横向滚动检查：\n")
        for k, ok in hscroll_ok:
            f.write(f"  {k:12s} {'PASS 无横向滚动' if ok else 'FAIL 存在横向滚动'}\n")
        f.write("\n遇到的问题：\n")
        f.write("".join(f"- {x}\n" for x in problems) if problems else "无\n")

    print(f"\n共 {len(saved)} 张 / {total/1024/1024:.1f}MB -> {OUT}")
    print("横向滚动：", " ".join(f"{k}={'PASS' if ok else 'FAIL'}" for k, ok in hscroll_ok))
    if problems:
        print("问题：")
        for x in problems:
            print("  -", x)
    else:
        print("无异常")


if __name__ == "__main__":
    main()
