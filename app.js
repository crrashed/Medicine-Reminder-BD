const $=id=>document.getElementById(id);
const KEY="medicineReminderBD";
let medicines=JSON.parse(localStorage.getItem(KEY)||"[]");
let lang=localStorage.getItem("mrbLang")||"bn";
const dict={
bn:{tagline:"সময়মতো ওষুধ, সুস্থতার যত্ন",today:"আজকের ওষুধ",enableNotifications:"🔔 নোটিফিকেশন চালু করুন",total:"মোট ওষুধ",taken:"খাওয়া হয়েছে",pending:"বাকি",todaysSchedule:"আজকের সময়সূচি",addMedicine:"＋ ওষুধ যোগ করুন",noMedicine:"এখনও কোনো ওষুধ যোগ করা হয়নি",addFirst:"প্রথম ওষুধটি যোগ করে রিমাইন্ডার সেট করুন।",progress:"আজকের অগ্রগতি",progressHint:"ওষুধ খাওয়ার পর “খাওয়া হয়েছে” চাপুন।",family:"পরিবার",familyHint:"পরিবারের সদস্যদের জন্য আলাদা ওষুধের তালিকা রাখতে পারবেন।",addFamily:"পরিবারের সদস্য যোগ করুন",prescription:"প্রেসক্রিপশন",prescriptionHint:"প্রেসক্রিপশনের ছবি আপনার ডিভাইসে সংরক্ষণ করুন।",safety:"গুরুত্বপূর্ণ",safetyText:"এই অ্যাপ ওষুধ লিখে দেয় বা ডোজ পরিবর্তনের পরামর্শ দেয় না। চিকিৎসকের প্রেসক্রিপশন অনুযায়ী তথ্য যোগ করুন। ডোজ পরিবর্তন, পার্শ্বপ্রতিক্রিয়া বা জরুরি অবস্থায় যোগ্য চিকিৎসকের পরামর্শ নিন।",home:"হোম",medicines:"ওষুধ",history:"ইতিহাস",settings:"সেটিংস",newMedicine:"নতুন ওষুধ",medicineName:"ওষুধের নাম",dose:"ডোজ",time:"সময়",food:"খাবারের সম্পর্ক",quantity:"বর্তমান পরিমাণ",cancel:"বাতিল",save:"সংরক্ষণ"},
en:{tagline:"Never miss your medicine",today:"Today's Medicines",enableNotifications:"🔔 Enable Notifications",total:"Total",taken:"Taken",pending:"Pending",todaysSchedule:"Today's Schedule",addMedicine:"＋ Add Medicine",noMedicine:"No medicines added yet",addFirst:"Add your first medicine and set a reminder.",progress:"Today's Progress",progressHint:"Tap “Taken” after taking a medicine.",family:"Family",familyHint:"Keep separate medicine lists for family members.",addFamily:"Add Family Member",prescription:"Prescription",prescriptionHint:"Store a prescription photo on your device.",safety:"Important",safetyText:"This app does not prescribe medicines or change dosages. Enter information according to a healthcare professional's prescription. Contact a qualified professional for dosage changes, side effects, or emergencies.",home:"Home",medicines:"Medicines",history:"History",settings:"Settings",newMedicine:"New Medicine",medicineName:"Medicine Name",dose:"Dose",time:"Time",food:"Food",quantity:"Current Quantity",cancel:"Cancel",save:"Save"}
};
function save(){localStorage.setItem(KEY,JSON.stringify(medicines))}
function applyLang(){document.querySelectorAll("[data-i18n]").forEach(el=>{let k=el.dataset.i18n;if(dict[lang][k])el.textContent=dict[lang][k]});document.documentElement.lang=lang}
function dateText(){let d=new Date();$("todayDate").textContent=d.toLocaleDateString(lang==="bn"?"bn-BD":"en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
function render(){
  const today=new Date().toISOString().slice(0,10);
  medicines.forEach(m=>{if(m.date!==today){m.date=today;m.status="pending"}}); save();
  $("totalCount").textContent=medicines.length;
  const taken=medicines.filter(m=>m.status==="taken").length;
  $("takenCount").textContent=taken;
  $("pendingCount").textContent=medicines.length-taken;
  const pct=medicines.length?Math.round(taken/medicines.length*100):0;
  $("progressText").textContent=pct+"%"; $("progressBar").style.width=pct+"%";
  $("emptyState").style.display=medicines.length?"none":"block";
  $("medicineList").innerHTML=medicines.slice().sort((a,b)=>a.time.localeCompare(b.time)).map((m,i)=>`
    <article class="medicine">
      <div><h3>💊 ${escapeHtml(m.name)}</h3><div class="meta">${escapeHtml(m.dose)} · ${formatTime(m.time)} · ${foodText(m.food)} · ${m.quantity} ${lang==="bn"?"টি":"units"}</div></div>
      <div class="actions">
        <button class="primary taken" onclick="markTaken('${m.id}')">${m.status==="taken"?"✅ "+(lang==="bn"?"খাওয়া হয়েছে":"Taken"):(lang==="bn"?"খাওয়া হয়েছে":"Taken")}</button>
        <button class="secondary skip" onclick="markSkip('${m.id}')">${lang==="bn"?"স্কিপ":"Skip"}</button>
        <button class="secondary delete" onclick="removeMedicine('${m.id}')">🗑</button>
      </div>
    </article>`).join("");
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function formatTime(t){let [h,m]=t.split(":");h=+h;let ap=h>=12?"PM":"AM";let hh=h%12||12;return `${hh}:${m} ${ap}`}
function foodText(v){return lang==="bn"?({after:"খাবারের পরে",before:"খাবারের আগে",none:"খাবারের সাথে সম্পর্ক নেই"}[v]):({after:"After food",before:"Before food",none:"No food relation"}[v])}
window.markTaken=id=>{let m=medicines.find(x=>x.id===id);if(m&&m.status!=="taken"){m.status="taken";m.quantity=Math.max(0,m.quantity-1);save();render()}}
window.markSkip=id=>{let m=medicines.find(x=>x.id===id);if(m){m.status="skipped";save();render()}}
window.removeMedicine=id=>{if(confirm(lang==="bn"?"এই ওষুধটি মুছে ফেলবেন?":"Delete this medicine?")){medicines=medicines.filter(x=>x.id!==id);save();render()}}
$("addBtn").onclick=()=>{$("medicineDialog").showModal()}
$("medicineForm").addEventListener("submit",e=>{e.preventDefault();medicines.push({id:Date.now().toString(),name:$("name").value.trim(),dose:$("dose").value.trim(),time:$("time").value,food:$("food").value,quantity:+$("quantity").value,date:new Date().toISOString().slice(0,10),status:"pending"});save();$("medicineDialog").close();e.target.reset();$("quantity").value=10;render()})
$("notifyBtn").onclick=async()=>{if(!("Notification"in window)){alert(lang==="bn"?"এই ব্রাউজারে নোটিফিকেশন সাপোর্ট নেই।":"Notifications are not supported.");return}let p=await Notification.requestPermission();alert(p==="granted"?(lang==="bn"?"নোটিফিকেশন চালু হয়েছে।":"Notifications enabled."): (lang==="bn"?"নোটিফিকেশন অনুমতি দেওয়া হয়নি।":"Notification permission was not granted."))}
$("langBtn").onclick=()=>{lang=lang==="bn"?"en":"bn";localStorage.setItem("mrbLang",lang);applyLang();dateText();render()}
$("familyBtn").onclick=()=>alert(lang==="bn"?"Family Member feature-এর পরের ভার্সনে আলাদা প্রোফাইল যোগ করা যাবে।":"Family profiles can be added in the next version.");
$("prescriptionInput").onchange=e=>{$("fileName").textContent=e.target.files[0]?e.target.files[0].name:""}
["navMedicine","navHistory","navFamily","navSettings"].forEach(id=>$(id).onclick=()=>alert(lang==="bn"?"এই section-এর পূর্ণ version পরবর্তী আপডেটে যোগ করা যাবে।":"The full section can be added in the next update."));
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("service-worker.js"));
applyLang();dateText();render();
setInterval(()=>{const now=new Date(), hm=now.toTimeString().slice(0,5);medicines.filter(m=>m.time===hm&&m.status==="pending").forEach(m=>{if("Notification"in window&&Notification.permission==="granted")new Notification("Medicine Reminder BD",{body:`${m.name} — ${m.dose}`})})},30000);