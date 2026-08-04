# -*- coding: utf-8 -*-
"""
xinhua-hub 手机端真实业务场景验收脚本（任务0）

模拟真实使用链路：
    打开网站 -> 找产品(3次点击内) -> 在线测算 -> 查看结果 -> 下载图片 -> 微信发给客户

用法：
    python qa/mobile_scenario_test.py                 # 全量 5 款演算器 × 3 档金额
    python qa/mobile_scenario_test.py yingmanxin      # 只跑指定演算器
    python qa/mobile_scenario_test.py --diag          # 只诊断不落图（快速）

产出：qa/screenshots/YYYY-MM-DD/mobile/
    01_home_mobile.png              首页手机端首屏（4大入口是否一屏可见）
    02_home_full_mobile.png         首页整页
    {key}_{档位}_input.png          输入区
    {key}_{档位}_result.png         结果区（网页）
    {key}_{档位}_export.png         真实下载的 PNG
    {key}_{档位}_wechat.png         模拟微信聊天窗口内查看该 PNG 的效果
    _mobile_report.txt              诊断报告（溢出/尺寸/一致性）
"""
import base64
import datetime
import json
import os
import struct
import subprocess
import sys
import time

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(BASE)

TODAY = datetime.date.today().strftime("%Y-%m-%d")
OUT = os.path.join(BASE, "qa", "screenshots", TODAY, "mobile")
os.makedirs(OUT, exist_ok=True)

PORT = 8801
MOBILE = {"width": 390, "height": 844}

# 三档金额：小单 / 中单 / 大单（大金额是最容易撑爆表格的）
TIERS = [
    ("10w", 100000),
    ("100w", 1000000),
    ("1000w", 10000000),
]

CALCS = [
    {"key": "yingmanxin", "file": "calculator-yingmanxin.html", "label": "盈满鑫",
     "export_root": "#exportRoot", "kind": "template"},
    {"key": "hongan", "file": "calculator-hongan.html", "label": "宏安世家",
     "export_root": "#planArea", "kind": "live"},
    {"key": "hengxiang", "file": "calculator-hengxiang.html", "label": "恒享人生",
     "export_root": "#planArea", "kind": "live"},
    {"key": "hongyu", "file": "calculator-hongyu.html", "label": "宏御世家",
     "export_root": "#planArea", "kind": "live"},
    {"key": "hongyuan", "file": "calculator-hongyuan.html", "label": "宏愿人生",
     "export_root": "#planArea", "kind": "live"},
]

INPUT_SEL = [".input-card", ".card", "form", ".controls"]
RESULT_SEL = ["#planArea", ".plan", "#resultArea"]

JS_INIT = r"""
window.__capBlob = null;
URL.createObjectURL = function(blob){ window.__capBlob = blob; return 'blob:fake#'+Math.random().toString(36).slice(2); };
try { Object.defineProperty(window, 'showSaveFilePicker', { value: undefined, configurable: true }); } catch(e){}
HTMLAnchorElement.prototype.click = function(){};
if(typeof window.showToast !== 'function'){ window.showToast = function(msg){ console.log('[toast]', msg); }; }
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

# 溢出/挤压检测：返回问题单元格明细
JS_OVERFLOW = r"""
(rootSel) => {
  const root = document.querySelector(rootSel);
  if(!root) return {err: 'root not found: ' + rootSel};
  const out = {wOverflow: [], hOverflow: [], tables: []};
  root.querySelectorAll('table').forEach((t, ti) => {
    const r = t.getBoundingClientRect();
    out.tables.push({idx: ti, cls: t.className, w: Math.round(r.width),
                     fs: getComputedStyle(t).fontSize});
    t.querySelectorAll('th,td').forEach(c => {
      const txt = (c.textContent || '').trim();
      if(!txt) return;
      if(c.scrollWidth > c.clientWidth + 1){
        out.wOverflow.push({tag: c.tagName, cls: c.className, txt: txt.slice(0, 18),
                            sw: c.scrollWidth, cw: c.clientWidth,
                            fs: getComputedStyle(c).fontSize});
      }
      if(c.scrollHeight > c.clientHeight + 1){
        out.hOverflow.push({tag: c.tagName, cls: c.className, txt: txt.slice(0, 18),
                            sh: c.scrollHeight, ch: c.clientHeight});
      }
    });
  });
  const rr = root.getBoundingClientRect();
  out.rootW = Math.round(rr.width);
  out.rootH = Math.round(root.scrollHeight);
  return out;
}
"""

saved, problems, rows = [], [], []


def png_size(path):
    try:
        with open(path, "rb") as f:
            d = f.read(33)
        return struct.unpack(">II", d[16:24])
    except Exception:
        return (0, 0)


def run_calc(page):
    for sel in ['button:has-text("生成利益演示")', 'button:has-text("生成")',
                'button:has-text("计算")', '#calcBtn', '.calc-btn']:
        try:
            page.click(sel, timeout=2000)
            break
        except Exception:
            continue
    else:
        try:
            page.evaluate("if(typeof generate==='function') generate(); "
                          "else if(typeof calculate==='function') calculate();")
        except Exception:
            pass
    try:
        page.wait_for_function("""() => {
            const km = document.getElementById('kmMaturity');
            return km && km.textContent !== '\u2014' && km.textContent !== '-';
        }""", timeout=15000)
    except Exception:
        pass
    page.wait_for_timeout(500)


def set_premium(page, val):
    page.evaluate("""(v) => {
        const el = document.getElementById('premium');
        if(!el) return false;
        el.value = String(v);
        el.dispatchEvent(new Event('input', {bubbles:true}));
        el.dispatchEvent(new Event('change', {bubbles:true}));
        return true;
    }""", val)


def wechat_shot(browser, png_path, out_path, title):
    """把导出的 PNG 塞进模拟微信聊天窗口(390px)截图，检验手机上直接看清不清楚"""
    if not os.path.exists(png_path):
        return
    with open(png_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    w, h = png_size(png_path)
    html = f"""<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
 body{{margin:0;background:#EDEDED;font-family:"PingFang SC","Microsoft YaHei",sans-serif;}}
 .bar{{height:44px;background:#EDEDED;border-bottom:1px solid #D9D9D9;display:flex;
       align-items:center;justify-content:center;font-size:17px;font-weight:600;color:#000;}}
 .chat{{padding:12px 10px;}}
 .row{{display:flex;justify-content:flex-end;align-items:flex-start;gap:8px;}}
 .bubble{{max-width:75%;background:#95EC69;border-radius:6px;padding:3px;}}
 .bubble img{{display:block;width:100%;height:auto;border-radius:4px;}}
 .av{{width:36px;height:36px;border-radius:4px;background:#1E40AF;color:#fff;font-size:12px;
      display:flex;align-items:center;justify-content:center;flex-shrink:0;}}
 .meta{{text-align:center;color:#8A8A8A;font-size:11px;margin:10px 0 0;}}
</style></head><body>
<div class="bar">王先生</div>
<div class="chat"><div class="row"><div class="bubble"><img src="data:image/png;base64,{b64}"></div>
<div class="av">我</div></div>
<div class="meta">{title} ｜ 原图 {w}×{h}px ｜ 微信内显示宽约 285px</div></div>
</body></html>"""
    tmp = os.path.join(OUT, "_wechat_tmp.html")
    with open(tmp, "w", encoding="utf-8") as f:
        f.write(html)
    p = browser.new_page(viewport=MOBILE, is_mobile=True, device_scale_factor=2)
    try:
        p.goto("file:///" + tmp.replace("\\", "/"), wait_until="load", timeout=20000)
        p.wait_for_timeout(400)
        p.screenshot(path=out_path, full_page=True)
        saved.append(out_path)
    except Exception as e:
        problems.append(f"wechat {title}: {e}")
    finally:
        p.close()
        try:
            os.remove(tmp)
        except Exception:
            pass


def check_home(browser, port):
    """首页：4大入口是否手机端一屏/两屏内可见，点击层级是否 <=3"""
    url = f"http://localhost:{port}/index.html"
    p = browser.new_page(viewport=MOBILE, is_mobile=True, device_scale_factor=2)
    p.add_init_script(JS_INIT)
    try:
        p.goto(url, wait_until="networkidle", timeout=30000)
        p.wait_for_timeout(700)
        info = p.evaluate("""() => {
            const want = ['产品演算器','培训中心','红利实现率','销售问答'];
            const res = [];
            want.forEach(w => {
                let hit = null;
                document.querySelectorAll('a,button,.ct-card,.quick-card').forEach(el => {
                    if(hit) return;
                    if((el.textContent||'').includes(w)) hit = el;
                });
                if(!hit){ res.push({name:w, found:false}); return; }
                const r = hit.getBoundingClientRect();
                res.push({name:w, found:true, top:Math.round(r.top+window.scrollY),
                          h:Math.round(r.height), href: hit.getAttribute('href')||''});
            });
            return {entries:res, vh:window.innerHeight,
                    docH:document.documentElement.scrollHeight,
                    docW:document.documentElement.scrollWidth, vw:window.innerWidth};
        }""")
        p.screenshot(path=os.path.join(OUT, "01_home_firstscreen.png"))
        saved.append(os.path.join(OUT, "01_home_firstscreen.png"))
        h = p.evaluate("document.documentElement.scrollHeight")
        p.screenshot(path=os.path.join(OUT, "02_home_full.png"),
                     clip={"x": 0, "y": 0, "width": 390, "height": min(h, 6000)})
        saved.append(os.path.join(OUT, "02_home_full.png"))
        return info
    except Exception as e:
        problems.append(f"home: {e}")
        return {}
    finally:
        p.close()


def main():
    args = [a for a in sys.argv[1:]]
    diag_only = "--diag" in args
    only = set(a.lower() for a in args if not a.startswith("--"))
    targets = [c for c in CALCS if not only or c["key"].lower() in only]

    proc = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT)], cwd=BASE,
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1.5)
    home_info = {}
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as pw:
            browser = pw.chromium.launch(args=["--no-sandbox"])

            if not only:
                home_info = check_home(browser, PORT)
                print("[首页] ", json.dumps(home_info, ensure_ascii=False))

            for c in targets:
                key, fn, label = c["key"], c["file"], c["label"]
                url = f"http://localhost:{PORT}/{fn}"
                for tname, prem in TIERS:
                    tag = f"{key}_{tname}"
                    p = browser.new_page(viewport=MOBILE, is_mobile=True, device_scale_factor=2)
                    p.add_init_script(JS_INIT)
                    rec = {"key": key, "label": label, "tier": tname, "premium": prem}
                    try:
                        p.goto(url, wait_until="networkidle", timeout=30000)
                        p.wait_for_timeout(600)
                        set_premium(p, prem)
                        run_calc(p)

                        # 网页端：页面级横向滚动 + 结果区溢出
                        pg = p.evaluate("""() => ({
                            docW: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
                            vw: window.innerWidth })""")
                        rec["hscroll"] = pg["docW"] <= pg["vw"] + 2
                        live = p.evaluate(JS_OVERFLOW, "#planArea")
                        rec["live_wof"] = len(live.get("wOverflow", []))
                        rec["live_detail"] = live.get("wOverflow", [])[:4]

                        if not diag_only:
                            for sel in INPUT_SEL:
                                el = p.query_selector(sel)
                                if el and el.is_visible():
                                    el.screenshot(path=os.path.join(OUT, f"{tag}_input.png"))
                                    saved.append(os.path.join(OUT, f"{tag}_input.png"))
                                    break
                            for sel in RESULT_SEL:
                                el = p.query_selector(sel)
                                if el and el.is_visible():
                                    el.screenshot(path=os.path.join(OUT, f"{tag}_result.png"))
                                    saved.append(os.path.join(OUT, f"{tag}_result.png"))
                                    break

                        # 触发真实下载
                        res = p.evaluate("""async () => {
                            try { await downloadImage(); } catch(e){ return {err:String(e)}; }
                            const blob = window.__capBlob;
                            if(!blob) return {err:'no blob'};
                            const dataUrl = await new Promise(r=>{const rd=new FileReader();
                                rd.onload=()=>r(rd.result); rd.readAsDataURL(blob);});
                            return {dataUrl};
                        }""")
                        # 导出模板/导出源区域的溢出（导出后 DOM 仍在）
                        exp = p.evaluate(JS_OVERFLOW, c["export_root"])
                        rec["exp_wof"] = len(exp.get("wOverflow", []))
                        rec["exp_hof"] = len(exp.get("hOverflow", []))
                        rec["exp_detail"] = exp.get("wOverflow", [])[:5]
                        rec["exp_tables"] = exp.get("tables", [])

                        if "dataUrl" in res:
                            ep = os.path.join(OUT, f"{tag}_export.png")
                            with open(ep, "wb") as f:
                                f.write(base64.b64decode(res["dataUrl"].split(",", 1)[1]))
                            saved.append(ep)
                            w, h = png_size(ep)
                            rec["png"] = f"{w}x{h}"
                            rec["png_kb"] = round(os.path.getsize(ep) / 1024)
                            if w < 1500:
                                problems.append(f"{tag}: 导出宽度 {w}px < 1600 标准")
                        else:
                            rec["png"] = "FAIL"
                            problems.append(f"{tag} export: {res}")
                        if rec.get("exp_wof"):
                            problems.append(f"{tag}: 导出区 {rec['exp_wof']} 处单元格横向溢出")
                        if not rec.get("hscroll"):
                            problems.append(f"{tag}: 手机端页面横向滚动")
                    except Exception as e:
                        rec["err"] = str(e)[:120]
                        problems.append(f"{tag}: {e}")
                    finally:
                        p.close()
                    rows.append(rec)
                    print(f"[{tag}] png={rec.get('png')} 网页溢出={rec.get('live_wof')} "
                          f"导出溢出={rec.get('exp_wof')} 横滚OK={rec.get('hscroll')}")

                    if not diag_only:
                        wechat_shot(browser, os.path.join(OUT, f"{tag}_export.png"),
                                    os.path.join(OUT, f"{tag}_wechat.png"),
                                    f"{label} 年交{prem:,}")
            browser.close()
    finally:
        proc.terminate()

    total = sum(os.path.getsize(p) for p in saved if os.path.exists(p))
    rp = os.path.join(OUT, "_mobile_report.txt")
    with open(rp, "w", encoding="utf-8") as f:
        f.write(f"xinhua-hub 手机端真实场景验收  {TODAY}\n")
        f.write(f"截图 {len(saved)} 张 / {total/1024/1024:.1f}MB\n\n")
        if home_info:
            f.write("== 首页4大入口 ==\n")
            for e in home_info.get("entries", []):
                f.write(f"  {e.get('name'):8s} found={e.get('found')} "
                        f"top={e.get('top')}px href={e.get('href')}\n")
            f.write(f"  视口高={home_info.get('vh')} 页面高={home_info.get('docH')} "
                    f"页面宽={home_info.get('docW')}/{home_info.get('vw')}\n\n")
        f.write("== 三档金额导出实测 ==\n")
        f.write(f"{'演算器':12s}{'档位':7s}{'导出PNG':14s}{'KB':7s}"
                f"{'网页溢出':9s}{'导出溢出':9s}{'横滚':6s}\n")
        for r in rows:
            f.write(f"{r['label']:12s}{r['tier']:7s}{str(r.get('png')):14s}"
                    f"{str(r.get('png_kb','')):7s}{str(r.get('live_wof')):9s}"
                    f"{str(r.get('exp_wof')):9s}{'OK' if r.get('hscroll') else 'FAIL':6s}\n")
        f.write("\n== 溢出明细 ==\n")
        for r in rows:
            if r.get("exp_wof") or r.get("live_wof"):
                f.write(f"[{r['label']} {r['tier']}]\n")
                for d in r.get("exp_detail", []):
                    f.write(f"   导出 {d['tag']}.{d['cls']} '{d['txt']}' "
                            f"{d['sw']}>{d['cw']} fs={d['fs']}\n")
                for d in r.get("live_detail", []):
                    f.write(f"   网页 {d['tag']}.{d['cls']} '{d['txt']}' "
                            f"{d['sw']}>{d['cw']} fs={d['fs']}\n")
        f.write("\n== 问题 ==\n")
        f.write("".join(f"- {x}\n" for x in problems) if problems else "无\n")

    print(f"\n报告 -> {rp}")
    print(f"共 {len(saved)} 张 / {total/1024/1024:.1f}MB")
    if problems:
        print("问题：")
        for x in problems:
            print("  -", x)
    else:
        print("无异常")


if __name__ == "__main__":
    main()
