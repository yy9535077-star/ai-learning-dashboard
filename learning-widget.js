// 椰子鸡的学习任务 · Scriptable 主屏幕小组件
const SITE = "https://yy9535077-star.github.io/ai-learning-dashboard/";
const fm = FileManager.local();
const cache = fm.joinPath(fm.documentsDirectory(), "coconut-tasks-cache.json");
let tasks = [], status = "", updated = null;
try {
  const req = new Request(SITE + "tasks.json?t=" + Date.now());
  req.timeoutInterval = 12;
  const data = await req.loadJSON();
  if (!Array.isArray(data.tasks) || !data.tasks.every(t =>
    t && typeof t.text === "string" && typeof t.id === "string"))
    throw new Error("任务格式错误");
  tasks = data.tasks;
  updated = new Date().toISOString();
  status = "云端已同步";
  try { fm.writeString(cache, JSON.stringify({tasks, updated})); } catch(e) {}
} catch(e) {
  try {
    const saved = JSON.parse(fm.readString(cache));
    if (!Array.isArray(saved.tasks) || !saved.tasks.every(t =>
      t && typeof t.text === "string")) throw new Error("缓存无效");
    tasks = saved.tasks;
    updated = saved.updated;
    status = "离线 · 显示缓存";
  } catch(e) { status = "连接失败 · 打开 Scriptable 重试"; }
}
const w = new ListWidget();
w.backgroundColor = new Color("#0b1120");
w.setPadding(16,16,16,16);
w.url = SITE;
w.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);
function text(value, size, color, bold=false) {
  const t = w.addText(value);
  t.font = bold ? Font.boldSystemFont(size) : Font.systemFont(size);
  t.textColor = new Color(color);
  return t;
}
text("椰子鸡 · 学习任务",16,"#edf2ff",true);
w.addSpacer(6);
text(status,11,"#69dfb4");
w.addSpacer(12);
const family = config.widgetFamily || "large";
const limit = family === "small" ? 2 : family === "medium" ? 3 : 6;
tasks.slice(0,limit).forEach(t => {
  const row = text("• " + t.text,13,"#edf2ff");
  row.lineLimit = family === "medium" ? 1 : 2;
  w.addSpacer(8);
});
if (!tasks.length) text(status.startsWith("连接失败") ?
  "暂时无法获取任务" : "暂无云端任务",13,"#a6b3ca");
if (tasks.length > limit) text("还有 " + (tasks.length-limit) + " 项 · 点击查看",11,"#a6b3ca");
w.addSpacer();
if (updated) {
  const d = new Date(updated);
  text("更新 " + (d.getMonth()+1) + "/" + d.getDate() + " " +
    String(d.getHours()).padStart(2,"0") + ":" +
    String(d.getMinutes()).padStart(2,"0"),10,"#a6b3ca");
}
Script.setWidget(w);
if (!config.runsInWidget) await w.presentLarge();
Script.complete();
