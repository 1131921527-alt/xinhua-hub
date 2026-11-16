/* Native same-origin download remains usable without JavaScript. */
(() => {
  const link = document.getElementById('dividendReportDownload');
  const help = document.getElementById('reportSaveHelp');
  if (!link || !help) return;
  if (/MicroMessenger/i.test(navigator.userAgent)) {
    help.textContent = '微信内如无法下载，请点右上角“…”选择在浏览器打开，再下载；也可点“在线预览”查看完整PDF。';
    link.addEventListener('click', () => { help.setAttribute('role', 'status'); });
  }
})();
