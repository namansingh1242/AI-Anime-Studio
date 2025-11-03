// frontend-only demo logic
const promptEl = document.getElementById('prompt');
const generateBtn = document.getElementById('generateBtn');
const speakBtn = document.getElementById('speakBtn');
const resultImg = document.getElementById('resultImg');
const sceneJson = document.getElementById('sceneJson');
const sceneData = document.getElementById('sceneData');

const modal = document.getElementById('modal');
const aboutBtn = document.getElementById('aboutBtn');
const closeModal = document.getElementById('closeModal');

aboutBtn.addEventListener('click', e => { e.preventDefault(); modal.hidden = false; });
closeModal && closeModal.addEventListener('click', ()=> modal.hidden = true);

function seedFromPrompt(p){
  // simple hash -> seed
  let h=0; for(let i=0;i<p.length;i++) h=(h<<5)-h + p.charCodeAt(i)|0;
  return Math.abs(h);
}

async function fetchDemoImage(prompt, style){
  // demo: use Unsplash featured with keywords (may vary)
  const q = encodeURIComponent(`anime ${style} ${prompt}`);
  // Unsplash featured endpoint (works without API but not guaranteed). Fallback to picsum.
  const url = `https://source.unsplash.com/featured/?${q}`;
  try{
    // set a loading placeholder
    resultImg.src = 'https://via.placeholder.com/720x400?text=Generating...';
    // fetch by assigning src (browser will load)
    // to force unique image, add seed param (not supported by unsplash, but still ok)
    resultImg.src = url + '&' + Date.now();
    // optional: wait small time
    await new Promise(r=>setTimeout(r,1000));
    return resultImg.src;
  }catch(e){
    // fallback
    const fallback = `https://picsum.photos/seed/${seedFromPrompt(prompt)}/800/450`;
    resultImg.src = fallback;
    return fallback;
  }
}

function speakText(text){
  if(!window.speechSynthesis) return alert('Speech not supported in this browser');
  const u = new SpeechSynthesisUtterance(text);
  // choose voice roughly
  const voices = window.speechSynthesis.getVoices();
  if(voices && voices.length) u.voice = voices.find(v=>v.lang.includes('en')) || voices[0];
  u.rate = 1;
  u.pitch = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

generateBtn.addEventListener('click', async ()=>{
  const prompt = promptEl.value.trim() || 'A moody cyberpunk rooftop at night, neon lights';
  const style = document.getElementById('styleSelect').value;
  generateBtn.disabled = true;
  generateBtn.textContent = 'Generating...';
  try{
    const imgUrl = await fetchDemoImage(prompt, style);
    // create demo scene JSON (frontend-simulated)
    const scene = {
      scene_name: "Demo Scene",
      description: `Prompt: ${prompt}`,
      camera: "Wide cinematic shot",
      dialogue: [{speaker:"AI", text: prompt, emotion:"calm"}]
    };
    sceneJson.textContent = JSON.stringify(scene, null, 2);
    sceneData.hidden = false;
    // show label
    document.getElementById('imgLabel').textContent = 'Generated (demo)';
    // speak the first line
    speakText(prompt);
  }catch(err){
    alert('Generate failed — demo mode. Check network.');
    console.error(err);
  }finally{
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate';
  }
});

speakBtn.addEventListener('click', ()=>{
  const txt = promptEl.value.trim();
  if(!txt) return alert('Enter a prompt first');
  speakText(txt);
});
