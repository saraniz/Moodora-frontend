import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { create } from 'zustand';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Canvas as FabricCanvas, FabricImage, Rect, Textbox } from 'fabric';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { clearLocalAssets, createLocalImagePreview, persistLocalImage } from './lib/local-assets';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Bookmark, Check, Copy, Download, FileImage, Grid2X2,
  ImagePlus, LayoutDashboard, MoreHorizontal, MoveUpRight, Plus, Settings as SettingsIcon,
  Sparkles, Trash2, Upload, UserRound, X, ZoomIn, ZoomOut, RotateCcw, RotateCw,
  Type, Square, Circle, Palette, Instagram, FolderOpen, Search, Heart, Pencil
} from 'lucide-react';
import './index.css';

type Project = { id: string; title: string; type: 'feed' | 'collage'; createdAt: string; updatedAt: string; thumbnail: string; content: any };
type PhotoAsset = { id: string; name: string; url: string; width: number; height: number };
type FeedDraft = { id: string; name: string; items: PhotoAsset[] };
type Aesthetic = { id: string; name: string; category: string; description: string; palette: string[]; images: string[]; favorited: boolean };
type Layer = { id: string; kind: 'image' | 'text' | 'shape'; text?: string; src?: string; x: number; y: number; w: number; h: number; color?: string; rotation?: number; opacity?: number };

const photos = [
  'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=700',
  'https://images.pexels.com/photos/1005417/pexels-photo-1005417.jpeg?auto=compress&cs=tinysrgb&w=700',
  'https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=700',
  'https://images.pexels.com/photos/1051075/pexels-photo-1051075.jpeg?auto=compress&cs=tinysrgb&w=700',
  'https://images.pexels.com/photos/1125136/pexels-photo-1125136.jpeg?auto=compress&cs=tinysrgb&w=700',
  'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=700',
  'https://images.pexels.com/photos/1855214/pexels-photo-1855214.jpeg?auto=compress&cs=tinysrgb&w=700',
  'https://images.pexels.com/photos/1586298/pexels-photo-1586298.jpeg?auto=compress&cs=tinysrgb&w=700',
  'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=700',
  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=700',
  'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=700',
  'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=700',
];
const seedAesthetics: Aesthetic[] = [
  { id: 'slow-living', name: 'Slow living', category: 'Cottagecore', description: 'A softer pace, gathered from sunlit kitchens, wild gardens and the little rituals that make a day feel full.', palette: ['#D6C4AA','#89916F','#F0E9DC','#AA7968'], images: [photos[0],photos[3],photos[9]], favorited: true },
  { id: 'quiet-luxury', name: 'Quiet luxury', category: 'Minimalist', description: 'Restrained forms and tactile neutrals. Understated, intentional, and never in a hurry to be noticed.', palette: ['#E5DED1','#9A8D7C','#3D3B37','#B8B5A8'], images: [photos[4],photos[6],photos[8]], favorited: false },
  { id: 'rose-hour', name: 'Rose hour', category: 'Dreamy', description: 'A romantic wash of faded pinks and late afternoon light, with a little softness around the edges.', palette: ['#C99A9B','#E8D99A','#F5ECE5','#89766D'], images: [photos[1],photos[7],photos[11]], favorited: true },
  { id: 'city-notes', name: 'City notes', category: 'Streetwear', description: 'Candid corners, graphic shadows and the beautifully unplanned texture of a city afternoon.', palette: ['#4B5049','#D5C8B5','#C77D61','#EBE6DD'], images: [photos[2],photos[5],photos[10]], favorited: false },
  { id: 'after-hours', name: 'After hours', category: 'Dark Academia', description: 'Ink-dark rooms, old paper and amber light: a thoughtful study in contrast and collected things.', palette: ['#3D3934','#94765B','#C6B79F','#D8D0C3'], images: [photos[8],photos[3],photos[5]], favorited: false },
  { id: 'soft-focus', name: 'Soft focus', category: 'Coquette', description: 'A gentle, playful palette with delicate details and a nostalgic film-like finish.', palette: ['#E2C7C1','#B78E8E','#F1E8DE','#A5A38C'], images: [photos[7],photos[0],photos[9]], favorited: false },
  { id: 'sunwashed', name: 'Sunwashed', category: 'Mediterranean', description: 'Warm stone, blue shadows and the washed-out brightness of a long afternoon by the sea.', palette: ['#DCC5A1','#74878A','#F0E8D6','#B47E62'], images: [photos[10],photos[4],photos[2]], favorited: false },
  { id: 'archival', name: 'Archival', category: 'Vintage', description: 'Found photographs and lived-in color, pulled together with the quiet charm of a family album.', palette: ['#B59677','#66715E','#E5D8C3','#A46E60'], images: [photos[11],photos[6],photos[1]], favorited: false },
  { id: 'clean-lines', name: 'Clean lines', category: 'Clean Girl', description: 'Fresh light, uncluttered frames and an easy palette that gives every image room to breathe.', palette: ['#EAE6DE','#B8AA97','#7D867A','#D3B5A9'], images: [photos[9],photos[4],photos[0]], favorited: false },
  { id: 'monochrome-study', name: 'Monochrome study', category: 'Monochrome', description: 'A tonal exercise in shape and shadow, where texture takes the place of color.', palette: ['#383734','#77746E','#C8C4BB','#E9E6DF'], images: [photos[5],photos[10],photos[8]], favorited: false },
  { id: 'sugar-plum', name: 'Sugar plum', category: 'Soft Girl', description: 'Playful pastels meet quiet vintage details in a mood that feels light without becoming sweet.', palette: ['#D9B7B7','#B6B9A5','#EFE3D3','#BD8C74'], images: [photos[1],photos[7],photos[3]], favorited: false },
  { id: 'pixel-dream', name: 'Pixel dream', category: 'Y2K', description: 'Glossy nostalgia with punchy shapes, playful contrast and just enough digital sparkle.', palette: ['#A4A9A1','#E8C1B6','#E4D88F','#6F756B'], images: [photos[2],photos[11],photos[6]], favorited: false },
  { id: 'morning-pages', name: 'Morning pages', category: 'Light Academia', description: 'Open notebooks, soft window light and the quiet optimism of a fresh page.', palette: ['#E9E0D1','#C6B99E','#89927C','#C6927D'], images: [photos[3],photos[8],photos[0]], favorited: false },
  { id: 'seoul-softness', name: 'Seoul softness', category: 'Korean Aesthetic', description: 'Airy cafes, gentle color and small details gathered from a slow city afternoon.', palette: ['#EFE6DE','#C8B7A8','#8B9280','#C9938F'], images: [photos[4],photos[7],photos[9]], favorited: false },
  { id: 'analog-summer', name: 'Analog summer', category: 'Retro', description: 'Warm film grain, sun-faded color and the easy imperfections of a found photograph.', palette: ['#D7B89A','#A8755B','#E5D7B9','#718071'], images: [photos[10],photos[1],photos[5]], favorited: false },
];
const categories = ['All styles','Minimalist','Coquette','Cottagecore','Dark Academia','Light Academia','Vintage','Dreamy','Clean Girl','Soft Girl','Y2K','Korean Aesthetic','Retro','Monochrome','Mediterranean','Streetwear'];
const id = () => Math.random().toString(36).slice(2, 10);
const read = <T,>(key: string, fallback: T): T => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) as T : fallback; } catch { return fallback; } };
const write = (key: string, value: unknown) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Browser storage may be full. */ } };
const initialProjects: Project[] = read('moodora.projects', []);
const queryClient = new QueryClient();
type StudioStore = {
  projects: Project[];
  aesthetics: Aesthetic[];
  name: string;
  setProjects: (value: Project[] | ((previous: Project[]) => Project[])) => void;
  setAesthetics: (value: Aesthetic[] | ((previous: Aesthetic[]) => Aesthetic[])) => void;
  setName: (value: string) => void;
};
const useStudioStore = create<StudioStore>((set) => ({
  projects: initialProjects,
  aesthetics: read('moodora.aesthetics', seedAesthetics),
  name: read('moodora.name', 'Maya Chen'),
  setProjects: (value) => set((state) => { const projects = typeof value === 'function' ? value(state.projects) : value; write('moodora.projects', projects); return { projects }; }),
  setAesthetics: (value) => set((state) => { const aesthetics = typeof value === 'function' ? value(state.aesthetics) : value; write('moodora.aesthetics', aesthetics); return { aesthetics }; }),
  setName: (name) => set(() => { write('moodora.name', name); return { name }; }),
}));
function useStudio() { return useStudioStore(); }

function AppContent() {
  const studio = useStudio();
  const [toast, setToast] = useState('');
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2600); };
  const [location] = useLocation();
  const isLanding = location === '/';
  const isPublic = location === '/login' || location === '/register';
  return <div className="app-shell">
    {isLanding ? <Switch>
      <Route path="/"><Landing /></Route>
    </Switch> : isPublic ? <Switch>
      <Route path="/login"><AuthPage mode="login" notify={notify} onUser={studio.setName} /></Route>
      <Route path="/register"><AuthPage mode="register" notify={notify} onUser={studio.setName} /></Route>
    </Switch> : <Shell path={location} name={studio.name}>
      <Switch>
        <Route path="/login"><AuthPage mode="login" notify={notify} onUser={studio.setName} /></Route>
        <Route path="/register"><AuthPage mode="register" notify={notify} onUser={studio.setName} /></Route>
        <Route path="/dashboard"><Dashboard studio={studio} notify={notify} /></Route>
        <Route path="/planner"><Planner studio={studio} notify={notify} /></Route>
        <Route path="/collage"><Collage studio={studio} notify={notify} /></Route>
        <Route path="/explore"><Explore studio={studio} notify={notify} /></Route>
        <Route path="/projects"><Projects studio={studio} notify={notify} /></Route>
        <Route path="/profile"><Profile studio={studio} notify={notify} /></Route>
        <Route path="/settings"><Settings studio={studio} notify={notify} /></Route>
        <Route component={NotFound} />
      </Switch>
    </Shell>}
    {toast && <div className="toast-note" role="status">{toast}</div>}
  </div>;
}

const navPrimary = [
  { href: '/dashboard', label: 'Workspace', Icon: LayoutDashboard },
  { href: '/planner', label: 'Feed planner', Icon: Instagram },
  { href: '/collage', label: 'Collage studio', Icon: Grid2X2 },
  { href: '/explore', label: 'Explore aesthetics', Icon: Sparkles },
  { href: '/projects', label: 'My projects', Icon: FolderOpen },
];
function Shell({ children, path, name }: { children: ReactNode; path: string; name: string }) {
  return <div style={{ display: 'flex', minHeight: '100dvh' }}>
    <aside className="side-nav">
      <Link href="/" className="brand"><span className="brand-mark">m</span> moodora</Link>
      <div className="nav-label">Your studio</div>
      <nav style={{ display:'grid', gap:4 }}>{navPrimary.map(({href,label,Icon})=><Link key={href} href={href} className={`nav-link ${path===href?'active':''}`}><Icon size={17} strokeWidth={1.8}/>{label}</Link>)}</nav>
      <div className="nav-label">Account</div>
      <nav style={{ display:'grid', gap:4 }}>
        <Link href="/profile" className={`nav-link ${path==='/profile'?'active':''}`}><UserRound size={17}/>Profile</Link>
        <Link href="/settings" className={`nav-link ${path==='/settings'?'active':''}`}><SettingsIcon size={17}/>Settings</Link>
      </nav>
      <div style={{ marginTop:'auto', padding:'16px 12px 0', borderTop:'1px solid #e8e4dc' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34,height:34,borderRadius:'50%',background:'#c99a9b',display:'grid',placeItems:'center',fontWeight:700,color:'#fff',fontSize:12 }}>{name.split(' ').map(s=>s[0]).join('').slice(0,2)}</div>
          <div style={{ minWidth:0 }}><div style={{ fontSize:13,fontWeight:600 }}>{name}</div><div style={{ fontSize:11,color:'#888' }}>Local workspace</div></div>
        </div>
      </div>
    </aside>
    <main className="main-area">{children}</main>
    <nav className="mobile-bar">{navPrimary.slice(0,5).map(({href,label,Icon})=><Link key={href} href={href} className={path===href?'active':''}><Icon size={18}/><span>{label.split(' ')[0]}</span></Link>)}</nav>
  </div>;
}

function Landing() {
  return <div style={{background:'#f7f5f0',minHeight:'100dvh'}}>
    <header style={{height:78,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 clamp(22px,7vw,110px)',borderBottom:'1px solid #e8e4dc'}}>
      <Link href="/" className="brand"><span className="brand-mark">m</span> moodora</Link>
      <div style={{display:'flex',gap:26,alignItems:'center',fontSize:13,color:'#77736d'}} className="landing-nav">
        <Link href="/explore">Explore</Link><a href="#studio">The studio</a><Link href="/login">Log in</Link><Link href="/register" className="btn btn-dark">Open your studio <ArrowRight size={15}/></Link>
      </div>
    </header>
    <section className="landing-hero" style={{padding:'clamp(48px,8vw,105px) clamp(22px,9vw,140px) 70px',display:'grid',gridTemplateColumns:'minmax(0,1fr) minmax(340px,.95fr)',gap:'5vw',alignItems:'center'}}>
      <div className="fade-in">
        <div className="eyebrow">A visual workspace for the way you see</div>
        <h1 style={{font:'600 clamp(54px,8vw,100px)/.98 Space Grotesk',letterSpacing:'-5px',maxWidth:660,margin:'25px 0 25px'}}>Create.<br/><span className="font-editorial" style={{fontStyle:'italic',fontWeight:500,color:'#78836a'}}>Arrange.</span><br/>Express.</h1>
        <p style={{fontSize:17,lineHeight:1.75,color:'#77736d',maxWidth:410,margin:'0 0 28px'}}>A thoughtful little studio for shaping your feed, making something with your photos, and finding the mood that feels like you.</p>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}><Link href="/dashboard" className="btn btn-dark" style={{padding:'13px 19px'}}>Start creating <ArrowRight size={16}/></Link><Link href="/explore" className="btn" style={{padding:'13px 18px'}}>Explore moods <MoveUpRight size={15}/></Link></div>
        <div style={{display:'flex',gap:15,alignItems:'center',marginTop:34,fontSize:12,color:'#77736d'}}><span style={{display:'flex',gap:5,color:'#78836a'}}><Check size={14}/> Free to explore</span><span>·</span><span>Projects stay on your device</span></div>
      </div>
      <div style={{position:'relative',minHeight:450}}>
        <div style={{position:'absolute',inset:'4% 7% 7% 8%',display:'grid',gridTemplateColumns:'1.1fr .9fr',gridTemplateRows:'1fr .8fr',gap:10,transform:'rotate(2deg)'}}>
          <img src={photos[0]} className="photo" style={{gridRow:'span 2',borderRadius:130,objectPosition:'center'}}/>
          <img src={photos[4]} className="photo" style={{borderRadius:8}}/><img src={photos[7]} className="photo" style={{borderRadius:8}}/>
        </div>
        <div style={{position:'absolute',bottom:0,left:0,background:'#e8d99a',padding:'16px 20px',width:155,transform:'rotate(-4deg)',boxShadow:'0 8px 24px #25252514'}}>
          <div className="eyebrow" style={{color:'#655d44'}}>Mood note 01</div><div className="font-editorial" style={{fontSize:20,lineHeight:1.1,marginTop:8}}>A slower kind<br/>of Sunday.</div>
        </div>
        <span style={{position:'absolute',right:0,top:5,background:'#c99a9b',borderRadius:'50%',width:76,height:76,display:'grid',placeItems:'center',color:'#fff'}}><Sparkles size={24}/></span>
      </div>
    </section>
    <section id="studio" style={{padding:'65px clamp(22px,9vw,140px) 80px',background:'#fff'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'end',gap:20,marginBottom:32}}><div><div className="eyebrow">Room to make things</div><h2 className="page-title" style={{fontSize:36,marginTop:8}}>Your ideas, in good company.</h2></div><span className="subtle" style={{fontSize:13}}>Three ways to get into a creative mood</span></div>
      <div className="feature-grid" style={{display:'grid',gridTemplateColumns:'1.15fr .85fr .85fr',gap:14}}>
        <FeatureCard title="Find your rhythm" text="Arrange the next nine. See the bigger picture before you share." image={photos[6]} href="/planner" tag="01 — Feed planner"/>
        <FeatureCard title="Make a little magic" text="Bring photos, type and shapes together on one canvas." image={photos[1]} href="/collage" tag="02 — Collage studio"/>
        <FeatureCard title="Follow the feeling" text="Collect color stories and visual directions worth keeping." image={photos[10]} href="/explore" tag="03 — Mood library"/>
      </div>
    </section>
   <section className="story-grid" style={{padding:'75px clamp(22px,9vw,140px)',display:'grid',gridTemplateColumns:'1fr 1fr',gap:50,alignItems:'center'}}>
      <div><div className="eyebrow">From first thought to finished frame</div><h2 className="font-display" style={{fontSize:40,lineHeight:1.08,letterSpacing:-1.5,margin:'14px 0'}}>A studio that lets you<br/>stay in the making.</h2><p className="subtle" style={{lineHeight:1.8,maxWidth:420}}>Moodora keeps the process light and your projects close. No account required to try it. Your drafts live right here in your browser.</p><Link href="/register" className="btn btn-olive" style={{marginTop:12}}>Make your first thing <ArrowRight size={15}/></Link></div>
      <div className="card" style={{padding:20,display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,transform:'rotate(-1deg)'}}>{photos.slice(2,8).map((p,i)=><img key={p} src={p} className="photo" style={{aspectRatio:'1',borderRadius:7}}/> )}</div>
    </section>
    <footer style={{padding:'30px clamp(22px,9vw,140px)',borderTop:'1px solid #e8e4dc',display:'flex',justifyContent:'space-between',gap:20,flexWrap:'wrap',fontSize:12,color:'#77736d'}}><Link href="/" className="brand" style={{fontSize:18,color:'#252525'}}><span className="brand-mark">m</span> moodora</Link><span>Create. Arrange. Express.</span><div style={{display:'flex',gap:20}}><a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a><a href="#studio">About</a><a href="mailto:hello@moodora.studio">Contact</a></div></footer>
  </div>;
}
function FeatureCard({title,text,image,href,tag}:{title:string;text:string;image:string;href:string;tag:string}) {
 return <Link href={href} style={{display:'block',padding:14,border:'1px solid #e8e4dc',borderRadius:14,background:'#faf9f6'}}>
   <div style={{height:180,borderRadius:9,overflow:'hidden',marginBottom:18}}><img src={image} className="photo" style={{transition:'transform .35s'}}/></div>
   <div className="eyebrow">{tag}</div><h3 className="font-display" style={{fontSize:21,margin:'8px 0 5px'}}>{title}</h3><p className="subtle" style={{fontSize:13,lineHeight:1.6,margin:'0 0 7px'}}>{text}</p>
 </Link>;
}

const authSchema = z.object({ name: z.string().min(2,'Add your name').optional(), email: z.string().email('Enter a valid email address'), password: z.string().min(6,'Use at least 6 characters') });
function AuthPage({mode,notify,onUser}:{mode:'login'|'register';notify:(s:string)=>void;onUser:(name:string)=>void}) {
  const [,go] = useLocation();
  const {register,handleSubmit,formState:{errors,isSubmitting}} = useForm<{name?:string;email:string;password:string}>({resolver:zodResolver(authSchema),defaultValues:{name:'',email:'',password:''}});
  const submit = handleSubmit((values)=>{ const userName=values.name||values.email.split('@')[0];localStorage.setItem('moodora.session',JSON.stringify({email:values.email,name:userName}));onUser(userName); notify(mode==='login'?'Welcome back to your studio.':'Your studio is ready.'); go('/dashboard'); });
  return <div className="page-wrap auth-layout" style={{maxWidth:1100,minHeight:'100dvh',display:'grid',gridTemplateColumns:'1fr 1fr',alignItems:'center',gap:70}}>
    <div><Link href="/" className="brand"><span className="brand-mark">m</span> moodora</Link><div style={{marginTop:70}}><div className="eyebrow">{mode==='login'?'Back to the making':'A new page to play on'}</div><h1 className="page-title" style={{fontSize:48,marginTop:13}}>{mode==='login'?'Pick up where you left off.':'Make room for your ideas.'}</h1><p className="subtle" style={{lineHeight:1.8,maxWidth:380}}>This is a demo studio. Your projects are saved locally in this browser, not sent to a server.</p></div>
      <div style={{marginTop:38,display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>{photos.slice(0,3).map(p=><img key={p} src={p} className="photo" style={{aspectRatio:'1',borderRadius:9}}/>)}</div>
    </div>
    <div className="card" style={{padding:'clamp(24px,4vw,42px)'}}>
      <h2 className="font-display" style={{fontSize:26,margin:'0 0 6px'}}>{mode==='login'?'Welcome back':'Create a local account'}</h2><p className="subtle" style={{fontSize:13,margin:'0 0 24px'}}>Mock access — choose any valid email and password.</p>
      <form onSubmit={submit} style={{display:'grid',gap:15}}>
        {mode==='register'&&<label style={{fontSize:12,fontWeight:600}}>Display name<input {...register('name')} className="field" placeholder="Your name" style={{marginTop:7}}/>{errors.name&&<small style={{color:'#b35242'}}>{errors.name.message}</small>}</label>}
        <label style={{fontSize:12,fontWeight:600}}>Email address<input {...register('email')} className="field" placeholder="you@example.com" style={{marginTop:7}}/>{errors.email&&<small style={{color:'#b35242'}}>{errors.email.message}</small>}</label>
        <label style={{fontSize:12,fontWeight:600}}>Password<input {...register('password')} type="password" className="field" placeholder="At least 6 characters" style={{marginTop:7}}/>{errors.password&&<small style={{color:'#b35242'}}>{errors.password.message}</small>}</label>
        <button className="btn btn-dark" type="submit" disabled={isSubmitting} style={{marginTop:7,padding:13}}>{mode==='login'?'Enter the studio':'Create my studio'} <ArrowRight size={15}/></button>
      </form>
      <div style={{textAlign:'center',fontSize:12,color:'#77736d',marginTop:20}}>{mode==='login'?'New around here?':'Already have a studio?'} <Link href={mode==='login'?'/register':'/login'} style={{color:'#536047',fontWeight:700}}>{mode==='login'?'Create access':'Log in'}</Link></div>
      <button className="btn" onClick={()=>{localStorage.setItem('moodora.session',JSON.stringify({email:'guest@moodora.local',name:'Guest creator'}));onUser('Guest creator');go('/dashboard');}} style={{width:'100%',marginTop:12}}>Continue as a guest</button>
    </div>
  </div>;
}

function PageHeading({eyebrow,title,description,children}:{eyebrow:string;title:string;description?:string;children?:ReactNode}) {
 return <div className="editor-head"><div><div className="eyebrow">{eyebrow}</div><h1 className="page-title">{title}</h1>{description&&<p className="subtle" style={{margin:'0',fontSize:14,lineHeight:1.6}}>{description}</p>}</div>{children}</div>;
}
type Studio = ReturnType<typeof useStudio>;
function saveProject(studio:Studio,p:Project) { studio.setProjects(prev=>{const found=prev.find(x=>x.id===p.id);return found?prev.map(x=>x.id===p.id?{...p,updatedAt:new Date().toISOString()}:x):[{...p,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()},...prev];}); }
function Dashboard({studio,notify}:{studio:Studio;notify:(s:string)=>void}) {
 const [,go]=useLocation();
 const latest=studio.projects.slice(0,3);
 return <div className="page-wrap fade-in"><PageHeading eyebrow="Your creative corner" title={`Good to see you, ${studio.name.split(' ')[0]}.`} description="A little space to plan, play and collect what feels right.">
   <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><Link href="/planner" className="btn"><Instagram size={15}/> Plan a feed</Link><Link href="/collage" className="btn btn-dark"><Plus size={16}/> New collage</Link></div></PageHeading>
   <section className="dashboard-hero" style={{display:'grid',gridTemplateColumns:'1.4fr .8fr',gap:16,marginBottom:34}}>
    <div className="card" style={{padding:22,display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,alignItems:'center',background:'#ebece5'}}>
      <div><div className="eyebrow">A fresh start</div><h2 className="font-display" style={{fontSize:26,lineHeight:1.16,margin:'9px 0'}}>Your next idea<br/>is already here.</h2><p className="subtle" style={{fontSize:13,lineHeight:1.6}}>Start with a nine-grid, a blank canvas, or an aesthetic you want to explore.</p><Link href="/explore" className="btn btn-olive" style={{marginTop:8}}>Find a mood <ArrowRight size={14}/></Link></div>
      <div style={{height:210,display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,transform:'rotate(2deg)'}}><img className="photo" src={photos[7]} style={{borderRadius:'80px 80px 8px 8px'}}/><img className="photo" src={photos[3]} style={{borderRadius:8,marginTop:23}}/><img className="photo" src={photos[10]} style={{borderRadius:8}}/><img className="photo" src={photos[0]} style={{borderRadius:8,marginTop:-20}}/></div>
    </div>
    <div className="card" style={{padding:22,display:'flex',flexDirection:'column',justifyContent:'space-between'}}><div><div className="eyebrow">Your local studio</div><h3 className="font-display" style={{fontSize:21,margin:'9px 0'}}>Small steps add up.</h3></div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:20}}><Stat label="Projects" value={studio.projects.length}/><Stat label="Saved moods" value={studio.aesthetics.filter(a=>a.favorited).length}/></div><div style={{marginTop:18,fontSize:12,color:'#77736d'}}>Saved privately on this device</div></div>
   </section>
   <section style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}><div><div className="eyebrow">Recently in progress</div><h2 className="font-display" style={{fontSize:23,margin:'5px 0'}}>Back to your projects</h2></div><Link href="/projects" className="btn btn-quiet">All projects <ArrowRight size={14}/></Link></section>
   {latest.length?<div className="recent-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:13}}>{latest.map(p=><ProjectTile key={p.id} project={p} onOpen={()=>{write('moodora.openProject',p);go(p.type==='feed'?'/planner':'/collage')}}/>)}</div>:<div className="card" style={{padding:28,display:'flex',alignItems:'center',justifyContent:'space-between',gap:15,flexWrap:'wrap'}}><div><h3 style={{margin:'0 0 5px',fontSize:17}}>Nothing saved just yet.</h3><p className="subtle" style={{margin:0,fontSize:13}}>Your first feed or collage will show up here.</p></div><Link href="/collage" className="btn btn-dark"><Plus size={15}/> Start a collage</Link></div>}
   <section style={{marginTop:36}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'end',marginBottom:13}}><div><div className="eyebrow">A few directions</div><h2 className="font-display" style={{fontSize:23,margin:'5px 0'}}>Saved for your next spark</h2></div><Link href="/explore" className="btn btn-quiet">Browse all <ArrowRight size={14}/></Link></div>
    <div className="favorites-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:12}}>{studio.aesthetics.filter(a=>a.favorited).slice(0,4).map(a=><div className="card" key={a.id} style={{overflow:'hidden'}}><img src={a.images[0]} className="photo" style={{height:130}}/><div style={{padding:'11px 13px'}}><div style={{fontSize:14,fontWeight:600}}>{a.name}</div><div className="subtle" style={{fontSize:11,marginTop:4}}>{a.category}</div></div></div>)}</div>
   </section>
 </div>;
}
function Stat({label,value}:{label:string;value:number}) {return <div style={{background:'#f7f5f0',padding:14,borderRadius:10}}><div style={{font:'600 26px Space Grotesk'}}>{value}</div><div className="subtle" style={{fontSize:11}}>{label}</div></div>}
function ProjectTile({project,onOpen}:{project:Project;onOpen:()=>void}) {
 return <button onClick={onOpen} className="card" style={{textAlign:'left',padding:10,display:'block',width:'100%'}}><img className="photo" src={project.thumbnail||photos[0]} style={{height:150,borderRadius:8}}/><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 3px 3px'}}><div><div style={{fontSize:13,fontWeight:600}}>{project.title}</div><div className="subtle" style={{fontSize:11,marginTop:4}}>{project.type==='feed'?'Feed planner':'Collage'} · Saved locally</div></div><ArrowRight size={15} color="#77736d"/></div></button>;
}

function SortableFeedItem({asset,index,onReplace,onRemove,onMove}:{asset:PhotoAsset;index:number;onReplace:()=>void;onRemove:()=>void;onMove:(direction:number)=>void}) {
 const {attributes,listeners,setNodeRef,transform,transition,isDragging}=useSortable({id:asset.id});
 return <div ref={setNodeRef} {...attributes} {...listeners} className="photo-tile" style={{aspectRatio:'1',position:'relative',borderRadius:3,transform:CSS.Transform.toString(transform),transition,opacity:isDragging?.45:1,touchAction:'none'}}>
   <img className="photo" src={asset.url} alt={asset.name}/>
   <div className="tile-actions" style={{position:'absolute',inset:0,display:'flex',alignItems:'end',justifyContent:'space-between',padding:4,opacity:0,transition:'opacity .15s'}}>
     <button className="btn" style={{padding:5}} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();onMove(-1)}} aria-label={`Move photo ${index+1} left`}><ArrowLeft size={13}/></button>
     <button className="btn" style={{padding:5}} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();onReplace()}} aria-label="Replace photo"><Pencil size={13}/></button>
     <button className="btn" style={{padding:5}} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();onRemove()}} aria-label="Remove photo"><X size={13}/></button>
     <button className="btn" style={{padding:5}} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();onMove(1)}} aria-label={`Move photo ${index+1} right`}><ArrowRight size={13}/></button>
   </div>
 </div>;
}

function Planner({studio,notify}:{studio:Studio;notify:(s:string)=>void}) {
 const [items,setItems]=useState<PhotoAsset[]>(()=>read('moodora.feed.items',photos.slice(0,6).map((url,i)=>({id:`sample-${i}`,name:`Moodboard ${i+1}`,url,width:900,height:900}))));
 const [feedName,setFeedName]=useState(()=>read('moodora.feed.name','Weekend notes'));
 const [drafts,setDrafts]=useState<FeedDraft[]>(()=>read('moodora.feed.drafts',[]));
 const fileRef=useRef<HTMLInputElement>(null);
 const replaceAt=useRef<number|null>(null);
 const sensors=useSensors(useSensor(PointerSensor,{activationConstraint:{distance:5}}));
 useEffect(()=>{write('moodora.feed.items',items);write('moodora.feed.name',feedName);write('moodora.feed.drafts',drafts)},[items,feedName,drafts]);
 useEffect(()=>{const open=read<Project|null>('moodora.openProject',null);if(open?.type==='feed'){setFeedName(open.title);setItems(open.content?.items||[]);localStorage.removeItem('moodora.openProject')}},[]);
 const upload=(e:ChangeEvent<HTMLInputElement>)=>{const files=Array.from(e.target.files||[]);const target=replaceAt.current;replaceAt.current=null;files.forEach((file,fileIndex)=>{if(!file.type.startsWith('image/'))return;void(async()=>{try{const asset={id:id(),name:file.name,...await createLocalImagePreview(file)};await persistLocalImage(asset.id,file);setItems(prev=>target!==null&&fileIndex===0?prev.map((item,index)=>index===target?asset:item):[...prev,asset])}catch{notify(`Could not open ${file.name}. Choose another image.`)}})()});e.target.value='';if(files.length)notify(`${files.length} photo${files.length>1?'s':''} added to your library.`)};
 const move=(from:number,to:number)=>{if(to<0||to>=items.length)return;setItems(prev=>{const next=[...prev];const [moved]=next.splice(from,1);next.splice(to,0,moved);return next;})};
 const onDragEnd=(event:DragEndEvent)=>{const {active,over}=event;if(!over||active.id===over.id)return;setItems(prev=>arrayMove(prev,prev.findIndex(item=>item.id===active.id),prev.findIndex(item=>item.id===over.id)))};
 const saveDraft=()=>{const d={id:id(),name:feedName,items:[...items]};setDrafts(prev=>[d,...prev.filter(x=>x.name!==feedName)]);saveProject(studio,{id:`feed-${feedName.toLowerCase().replace(/\W+/g,'-')}`,title:feedName,type:'feed',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),thumbnail:items[0]?.url||photos[0],content:{items}});notify('Feed draft saved on this device.')};
 const exportGrid=()=>{const canvas=document.createElement('canvas');canvas.width=900;canvas.height=900;const ctx=canvas.getContext('2d');if(!ctx)return;const cells=items.slice(0,9);let loaded=0;if(!cells.length){notify('Add a few photos before exporting.');return;}cells.forEach((item,i)=>{const img=new Image();img.onload=()=>{const s=300,x=(i%3)*s,y=Math.floor(i/3)*s;ctx.drawImage(img,x,y,s,s);loaded++;if(loaded===cells.length){const a=document.createElement('a');a.download=`${feedName||'moodora-feed'}.png`;a.href=canvas.toDataURL('image/png');a.click();notify('Feed preview exported.')}};img.onerror=()=>{loaded++;};img.src=item.url;});};
 return <div className="page-wrap fade-in"><PageHeading eyebrow="Arrange your next nine" title="Feed planner" description="Try the rhythm before it goes live. Drag photos into a new order or use the arrows for a precise move.">
   <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button className="btn" onClick={()=>fileRef.current?.click()}><Upload size={15}/> Upload photos</button><button className="btn btn-dark" onClick={saveDraft}><Bookmark size={15}/> Save draft</button><button className="btn" onClick={exportGrid}><Download size={15}/> Export preview</button><input ref={fileRef} hidden type="file" accept="image/*" multiple onChange={upload}/></div></PageHeading>
   <div className="planner-layout" style={{display:'grid',gridTemplateColumns:'minmax(220px,.75fr) minmax(360px,1.25fr) minmax(230px,.7fr)',gap:18,alignItems:'start'}}>
    <section className="card" style={{padding:16}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><div className="eyebrow">Your library</div><div style={{fontSize:14,fontWeight:600,marginTop:4}}>Photos <span className="subtle">({items.length})</span></div></div><button className="btn btn-quiet" aria-label="Upload photos" onClick={()=>fileRef.current?.click()}><Plus size={16}/></button></div>
      <p className="subtle" style={{fontSize:11,lineHeight:1.5}}>Select a photo to add it to your grid.</p>
       <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:7}}>{items.map((asset,i)=><button key={`${asset.id}-${i}`} onClick={()=>setItems(prev=>[...prev,{...asset,id:id()}])} title="Add to feed" style={{border:0,padding:0,background:'none',position:'relative'}}><img src={asset.url} className="photo" style={{aspectRatio:'1',borderRadius:7}}/><span style={{position:'absolute',right:5,bottom:5,width:22,height:22,borderRadius:'50%',background:'#ffffffdf',display:'grid',placeItems:'center'}}><Plus size={13}/></span></button>)}</div>
      <button className="btn" onClick={()=>fileRef.current?.click()} style={{width:'100%',marginTop:12}}><ImagePlus size={14}/> Add images</button>
    </section>
    <section className="card" style={{padding:'20px clamp(16px,3vw,30px)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:17,gap:10}}><div style={{display:'flex',gap:10,alignItems:'center'}}><div style={{width:34,height:34,borderRadius:'50%',background:'#d8c9ae',display:'grid',placeItems:'center',fontSize:12,fontWeight:700}}>MC</div><div><input className="field" aria-label="Feed name" value={feedName} onChange={e=>setFeedName(e.target.value)} style={{fontSize:13,fontWeight:600,padding:'5px 8px',width:190}}/><div className="subtle" style={{fontSize:10,margin:'3px 0 0 8px'}}>profile preview · {items.length} posts</div></div></div><button className="btn btn-quiet" onClick={exportGrid} aria-label="Export"><MoreHorizontal size={18}/></button></div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}><SortableContext items={items.map(item=>item.id)} strategy={rectSortingStrategy}><div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:4}}>{Array.from({length:Math.max(9,Math.ceil(items.length/3)*3)}).map((_,i)=>{const item=items[i];return item?<SortableFeedItem key={item.id} asset={item} index={i} onReplace={()=>{replaceAt.current=i;fileRef.current?.click()}} onRemove={()=>setItems(prev=>prev.filter((_,j)=>j!==i))} onMove={direction=>move(i,i+direction)}/>:<div key={`empty-${i}`} className="photo-tile" style={{aspectRatio:'1',border:'1px dashed #d7d1c6',borderRadius:3}}><button onClick={()=>fileRef.current?.click()} style={{width:'100%',height:'100%',border:0,background:'transparent',color:'#aaa'}}><Plus size={20}/></button></div>})}</div></SortableContext></DndContext>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:14,fontSize:11,color:'#77736d'}}><span>Drag and drop to arrange</span><span>Grid preview · 3 × 3</span></div>
    </section>
    <aside style={{display:'grid',gap:14}}>
      <section className="card" style={{padding:16}}><div className="eyebrow">Local drafts</div><h3 className="font-display" style={{fontSize:17,margin:'5px 0 13px'}}>Pick up a saved feed</h3>{drafts.length?drafts.map(d=><div key={d.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 0',borderTop:'1px solid #eeeae3'}}><button onClick={()=>{setFeedName(d.name);setItems(d.items);notify('Draft reopened.')}} style={{border:0,background:'none',textAlign:'left',padding:0}}><div style={{fontSize:12,fontWeight:600}}>{d.name}</div><div className="subtle" style={{fontSize:10}}>{d.items.length} photos</div></button><button className="btn btn-quiet" aria-label="Delete draft" onClick={()=>setDrafts(prev=>prev.filter(x=>x.id!==d.id))}><Trash2 size={14}/></button></div>):<p className="subtle" style={{fontSize:12,lineHeight:1.6}}>Saved drafts will live here, ready for another round.</p>}</section>
      <section className="card" style={{padding:16,background:'#eeeee7'}}><Instagram size={17} color="#78836a"/><h3 className="font-display" style={{fontSize:16,margin:'9px 0 5px'}}>A little note</h3><p className="subtle" style={{fontSize:11,lineHeight:1.6,margin:0}}>Feed drafts are stored in this browser. Your exported preview is a simple image of the first nine posts.</p></section>
    </aside>
   </div>
 </div>;
}

const layoutOptions = ['Balanced grid','Vertical columns','Horizontal rows','Editorial split','Feature top','Mosaic'];
type CanvasFormat = 'Square' | 'Portrait' | 'Story';
const canvasFormats:Record<CanvasFormat,{width:number;height:number}> = {
  Square:{width:1080,height:1080},
  Portrait:{width:1080,height:1350},
  Story:{width:1080,height:1920},
};
function gridCells(count:number,layout:string,spacing:number,margin:number) {
  const edge=100-margin*2;
  if(layout==='Vertical columns') {
    const width=(edge-spacing*(count-1))/count;
    return Array.from({length:count},(_,i)=>({x:margin+i*(width+spacing),y:margin,w:width,h:edge}));
  }
  if(layout==='Horizontal rows') {
    const height=(edge-spacing*(count-1))/count;
    return Array.from({length:count},(_,i)=>({x:margin,y:margin+i*(height+spacing),w:edge,h:height}));
  }
  if(layout==='Editorial split') {
    const small=count-1,columns=small>3?2:1,rows=Math.ceil(small/columns);
    const largeWidth=(edge-spacing)*.56,rightWidth=edge-largeWidth-spacing;
    const width=(rightWidth-spacing*(columns-1))/columns,height=(edge-spacing*(rows-1))/rows;
    return [{x:margin,y:margin,w:largeWidth,h:edge},...Array.from({length:small},(_,i)=>({x:margin+largeWidth+spacing+(i%columns)*(width+spacing),y:margin+Math.floor(i/columns)*(height+spacing),w:width,h:height}))];
  }
  if(layout==='Feature top') {
    const small=count-1,columns=Math.max(1,Math.ceil(Math.sqrt(small))),rows=Math.ceil(small/columns);
    const largeHeight=(edge-spacing)*.55,remainingHeight=edge-largeHeight-spacing;
    const width=(edge-spacing*(columns-1))/columns,height=(remainingHeight-spacing*(rows-1))/rows;
    return [{x:margin,y:margin,w:edge,h:largeHeight},...Array.from({length:small},(_,i)=>({x:margin+(i%columns)*(width+spacing),y:margin+largeHeight+spacing+Math.floor(i/columns)*(height+spacing),w:width,h:height}))];
  }
  const columns=Math.ceil(Math.sqrt(count)),rows=Math.ceil(count/columns);
  const width=(edge-spacing*(columns-1))/columns,height=(edge-spacing*(rows-1))/rows;
  return Array.from({length:count},(_,i)=>({x:margin+(i%columns)*(width+spacing),y:margin+Math.floor(i/columns)*(height+spacing),w:width,h:height}));
}
function Collage({studio,notify}:{studio:Studio;notify:(s:string)=>void}) {
  const canvasElementRef=useRef<HTMLCanvasElement>(null);
  const fabricRef=useRef<FabricCanvas|null>(null);
 const [mode,setMode]=useState<'grid'|'creative'>('grid');
 const [count,setCount]=useState(4);
 const [layout,setLayout]=useState(layoutOptions[0]);
  const [canvasFormat,setCanvasFormat]=useState<CanvasFormat>(()=>read('moodora.collage.format','Square') as CanvasFormat);
  const [spacing,setSpacing]=useState(2);
  const [margin,setMargin]=useState(1);
 const [title,setTitle]=useState('Untitled collage');
 const [layers,setLayers]=useState<Layer[]>(()=>read('moodora.collage.layers',[]));
 const [selected,setSelected]=useState<string|null>(null);
 const [bg,setBg]=useState(()=>read('moodora.collage.bg','#f0ece4'));
 const [zoom,setZoom]=useState(100);
 const [undoStack,setUndoStack]=useState<Layer[][]>([]);
 const [redoStack,setRedoStack]=useState<Layer[][]>([]);
 const fileRef=useRef<HTMLInputElement>(null);
  const replaceLayerRef=useRef<string|null>(null);
 const active=layers.find(l=>l.id===selected);
  const dimensions=canvasFormats[canvasFormat]||canvasFormats.Square;
  const layersRef=useRef(layers);
  const selectedRef=useRef(selected);
  const dimensionsRef=useRef(dimensions);
  layersRef.current=layers;
  selectedRef.current=selected;
  dimensionsRef.current=dimensions;
 const setChange=(next:Layer[])=>{setUndoStack(prev=>[...prev,layers]);setRedoStack([]);setLayers(next);};
 useEffect(()=>write('moodora.collage.layers',layers),[layers]);
 useEffect(()=>write('moodora.collage.bg',bg),[bg]);
  useEffect(()=>write('moodora.collage.format',canvasFormat),[canvasFormat]);
  useEffect(()=>{const open=read<Project|null>('moodora.openProject',null);if(open?.type==='collage'){setTitle(open.title);setLayers(open.content?.layers||[]);setBg(open.content?.bg||'#f0ece4');if(open.content?.canvasFormat in canvasFormats)setCanvasFormat(open.content.canvasFormat);localStorage.removeItem('moodora.openProject');}},[]);
  useEffect(()=>{
    if(!canvasElementRef.current)return;
    const canvas=new FabricCanvas(canvasElementRef.current,{width:1080,height:1080,backgroundColor:bg,preserveObjectStacking:true,selection:true});
    fabricRef.current=canvas;
    const wrapper=canvas.wrapperEl;
    wrapper.style.position='absolute';
    wrapper.style.inset='0';
    wrapper.style.width='100%';
    wrapper.style.height='100%';
    const syncSelection=()=>setSelected((canvas.getActiveObject() as any)?.layerId??null);
    const syncModified=()=>{
      const previous=layersRef.current;
      const next=previous.map(layer=>{
        const object=canvas.getObjects().find((item:any)=>item.layerId===layer.id) as any;
        if(!object)return layer;
       const size=dimensionsRef.current;
       return {...layer,x:object.left/size.width*100,y:object.top/size.height*100,w:object.getScaledWidth()/size.width*100,h:object.getScaledHeight()/size.height*100,rotation:object.angle||0,opacity:object.opacity??1};
      });
      setUndoStack(stack=>[...stack,previous]);
      setRedoStack([]);
      setLayers(next);
    };
    canvas.on('selection:created',syncSelection);
    canvas.on('selection:updated',syncSelection);
    canvas.on('selection:cleared',syncSelection);
    canvas.on('object:modified',syncModified);
    return()=>{
      canvas.off('selection:created',syncSelection);
      canvas.off('selection:updated',syncSelection);
      canvas.off('selection:cleared',syncSelection);
      canvas.off('object:modified',syncModified);
      fabricRef.current=null;
      void canvas.dispose();
    };
  },[]);
  useEffect(()=>{
    const canvas=fabricRef.current;
    if(!canvas)return;
    let cancelled=false;
    const draw=async()=>{
      const restoreSelectionId=selectedRef.current;
      canvas.setDimensions(dimensions);
      canvas.clear();
      canvas.backgroundColor=bg;
      const objects=await Promise.all(layers.map(async layer=>{
        let object:any;
        const common={left:layer.x*dimensions.width/100,top:layer.y*dimensions.height/100,angle:layer.rotation||0,opacity:layer.opacity??1,originX:'left' as const,originY:'top' as const,selectable:true,evented:true};
        if(layer.kind==='image'&&layer.src){
          const image=await FabricImage.fromURL(layer.src,{crossOrigin:'anonymous'});
          image.set({...common,scaleX:layer.w*dimensions.width/100/(image.width||1),scaleY:layer.h*dimensions.height/100/(image.height||1)});
          object=image;
        }else if(layer.kind==='text'){
          object=new Textbox(layer.text||'Text',{...common,width:layer.w*dimensions.width/100,fontSize:Math.max(18,layer.h*dimensions.height/100*.3),fontFamily:'DM Sans',fill:layer.color||'#252525'});
        }else{
          object=new Rect({...common,width:layer.w*dimensions.width/100,height:layer.h*dimensions.height/100,fill:layer.color||'#c77d61'});
        }
        object.layerId=layer.id;
        return object;
      }));
      if(cancelled)return;
      objects.forEach(object=>canvas.add(object));
      const selectedObject=objects.find(object=>object.layerId===restoreSelectionId);
      if(selectedObject)canvas.setActiveObject(selectedObject);
      canvas.requestRenderAll();
    };
    void draw();
    return()=>{cancelled=true;};
  },[layers,bg,dimensions]);
 const addPhotos=(urls:string[],assetIds?:string[])=>{const next=[...layers,...urls.map((src,i)=>({id:assetIds?.[i]||id(),kind:'image' as const,src,x:12+(layers.length%3)*27,y:12+(layers.length%2)*28,w:26,h:31,rotation:mode==='creative'?(i%2?4:-3):0}))];setChange(next);setSelected(next[next.length-1]?.id||null);};
  const handleUpload=(e:ChangeEvent<HTMLInputElement>)=>{const files=Array.from(e.target.files||[]);const replaceId=replaceLayerRef.current;replaceLayerRef.current=null;files.forEach((file,fileIndex)=>{if(!file.type.startsWith('image/'))return;const assetId=replaceId&&fileIndex===0?replaceId:id();void(async()=>{try{const preview=await createLocalImagePreview(file);await persistLocalImage(assetId,file);if(replaceId&&fileIndex===0){const previous=layersRef.current;setUndoStack(stack=>[...stack,previous]);setRedoStack([]);setLayers(current=>current.map(layer=>layer.id===replaceId?{...layer,src:preview.url}:layer));setSelected(replaceId)}else addPhotos([preview.url],[assetId])}catch{notify(`Could not open ${file.name}. Choose another image.`)}})()});e.target.value='';if(files.length)notify(replaceId?'Image replacement started.':'Images added to your canvas.')};
 const addText=()=>{const l:Layer={id:id(),kind:'text',text:'A note to remember',x:32,y:43,w:36,h:14,color:'#252525'};setChange([...layers,l]);setSelected(l.id)};
 const addShape=(kind:'shape')=>{const l:Layer={id:id(),kind,x:40,y:38,w:20,h:20,color:'#c77d61'};setChange([...layers,l]);setSelected(l.id)};
 const changeProp=(key:string,value:string|number)=>{if(!active)return;setChange(layers.map(l=>l.id===active.id?{...l,[key]:value}:l));};
  const save=()=>{saveProject(studio,{id:`collage-${title.toLowerCase().replace(/\W+/g,'-')}`,title,type:'collage',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),thumbnail:layers.find(l=>l.kind==='image')?.src||photos[0],content:{layers,bg,mode,count,layout,canvasFormat}});notify('Collage saved to My projects.')};
  const exportImage=async(type:'png'|'jpeg')=>{try{const size=dimensionsRef.current;const canvas=new FabricCanvas(document.createElement('canvas'),{width:size.width,height:size.height,backgroundColor:bg,renderOnAddRemove:false});for(const layer of layers){if(layer.kind==='image'&&layer.src){const image=await FabricImage.fromURL(layer.src,{crossOrigin:'anonymous'});const iw=image.width||1,ih=image.height||1;image.set({left:layer.x*size.width/100,top:layer.y*size.height/100,scaleX:layer.w*size.width/100/iw,scaleY:layer.h*size.height/100/ih,angle:layer.rotation||0,opacity:layer.opacity??1,originX:'left',originY:'top',selectable:false});canvas.add(image)}else if(layer.kind==='text'){canvas.add(new Textbox(layer.text||'Text',{left:layer.x*size.width/100,top:layer.y*size.height/100,width:layer.w*size.width/100,fontSize:Math.max(18,layer.h*size.height/100*.3),fontFamily:'DM Sans',fill:layer.color||'#252525',angle:layer.rotation||0,opacity:layer.opacity??1,selectable:false}))}else{canvas.add(new Rect({left:layer.x*size.width/100,top:layer.y*size.height/100,width:layer.w*size.width/100,height:layer.h*size.height/100,fill:layer.color||'#c77d61',angle:layer.rotation||0,opacity:layer.opacity??1,selectable:false}))}}canvas.renderAll();const a=document.createElement('a');a.download=`${title.replace(/\s+/g,'-')}.${type}`;a.href=canvas.toDataURL({format:type,quality:.92,multiplier:1});a.click();await canvas.dispose();notify(`Collage exported as ${type.toUpperCase()}.`)}catch{notify('Export could not finish. Check that the image is available and try again.')}};
 const undo=()=>{if(!undoStack.length)return;setRedoStack(prev=>[...prev,layers]);setLayers(undoStack[undoStack.length-1]);setUndoStack(prev=>prev.slice(0,-1))};
 const redo=()=>{if(!redoStack.length)return;setUndoStack(prev=>[...prev,layers]);setLayers(redoStack[redoStack.length-1]);setRedoStack(prev=>prev.slice(0,-1))};
 const remove=()=>{if(!selected)return;setChange(layers.filter(l=>l.id!==selected));setSelected(null)};
 const duplicate=()=>{if(!active)return;const copy={...active,id:id(),x:Math.min(80,active.x+4),y:Math.min(80,active.y+4)};setChange([...layers,copy]);setSelected(copy.id)};
 const moveLayer=(direction:number)=>{if(!active)return;const i=layers.findIndex(l=>l.id===active.id),j=Math.min(layers.length-1,Math.max(0,i+direction));const next=[...layers];next.splice(i,1);next.splice(j,0,active);setChange(next)};
   const createGrid=()=>{const next=gridCells(count,layout,spacing,margin).map((cell,i)=>({id:id(),kind:'image' as const,src:photos[i%photos.length],...cell}));setChange(next);setSelected(null);notify(`${count} photos arranged in ${layout.toLowerCase()}.`)};
  const createCreative=(style:string,total:number)=>{
    const next=Array.from({length:total},(_,i)=>{
      const first=i===0;
       const overlapping=style==='Overlapping';
      const film=style==='Film strip';
       const columns=film?total:2;
       const rows=Math.ceil((total-1)/Math.max(1,columns-1));
       const x=first?8:overlapping?20+(i%3)*20:film?4+i*(92/total):style==='Minimal'?8+((i-1)%2)*43:style==='Pinterest'?8+((i-1)%2)*43:48+((i-1)%2)*24;
       const y=first?10:overlapping?18+Math.floor(i/3)*18:film?18:style==='Magazine'?64:style==='Pinterest'?10+Math.floor((i-1)/2)*34:style==='Minimal'?10+Math.floor((i-1)/2)*40:8+Math.floor((i-1)/2)*(76/Math.max(1,rows));
       return {id:id(),kind:'image' as const,src:photos[i%photos.length],x,y,w:first?style==='Magazine'?84:44:overlapping?38:film?92/total-2:style==='Pinterest'?38:style==='Minimal'?38:21,h:first?style==='Magazine'?48:72:overlapping?45:film?64:style==='Pinterest'?30+(i%2)*10:style==='Minimal'?34:style==='Magazine'?27:34,rotation:style==='Polaroid'||style==='Scrapbook'?(i%2?3:-3):style==='Overlapping'?(i%2?2:-2):0};
    });
    setLayout(style);setMode('creative');setChange(next);setSelected(null);
    setBg(style==='Dark Academia'?'#d8d0c3':style==='Rose hour'?'#f1e8de':'#eeeae2');
    notify(`${style} composition created.`);
  };
 const toolButton=(label:string,Icon:any,onClick:()=>void)=><button className="btn" onClick={onClick} style={{fontSize:11,padding:'8px 10px'}}><Icon size={14}/>{label}</button>;
 return <div className="page-wrap fade-in" style={{maxWidth:1600}}>
   <PageHeading eyebrow="Make a composition" title="Collage studio" description="Bring photos, type and little details into one place. Select a layer to refine it.">
     <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button className="btn" onClick={undo} aria-label="Undo" disabled={!undoStack.length}><RotateCcw size={15}/> Undo</button><button className="btn" onClick={redo} aria-label="Redo" disabled={!redoStack.length}><RotateCw size={15}/> Redo</button><button className="btn btn-dark" onClick={save}><Bookmark size={15}/> Save</button><button className="btn" onClick={()=>void exportImage('png')}><Download size={15}/> Export</button></div>
   </PageHeading>
   <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,marginBottom:15,flexWrap:'wrap'}}>
     <div style={{display:'flex',gap:7}}><button className={`pill ${mode==='grid'?'selected':''}`} onClick={()=>setMode('grid')}>Grid creator</button><button className={`pill ${mode==='creative'?'selected':''}`} onClick={()=>setMode('creative')}>Creative mode</button></div>
    <div style={{display:'flex',gap:9,alignItems:'center',flexWrap:'wrap'}}><input value={title} aria-label="Collage title" onChange={e=>setTitle(e.target.value)} className="field" style={{width:170,padding:'8px 10px',fontSize:12}}/><select aria-label="Canvas size" value={canvasFormat} onChange={e=>setCanvasFormat(e.target.value as CanvasFormat)} className="field" style={{width:125,padding:'8px 10px',fontSize:12}}>{Object.keys(canvasFormats).map(format=><option key={format}>{format}</option>)}</select><button className="btn" onClick={()=>setZoom(Math.max(60,zoom-10))} aria-label="Zoom out"><ZoomOut size={14}/></button><span style={{fontSize:11,color:'#77736d',minWidth:32,textAlign:'center'}}>{zoom}%</span><button className="btn" onClick={()=>setZoom(Math.min(140,zoom+10))} aria-label="Zoom in"><ZoomIn size={14}/></button></div>
   </div>
   <div className="collage-layout" style={{display:'grid',gridTemplateColumns:'220px minmax(360px,1fr) 230px',gap:12,alignItems:'stretch'}}>
     <aside className="card" style={{padding:14,display:'grid',alignContent:'start',gap:15}}>
        <div><div className="eyebrow">Start with</div><div style={{display:'flex',gap:6,marginTop:8}}>{toolButton('Upload',Upload,()=>{replaceLayerRef.current=null;fileRef.current?.click()})}{toolButton('Text',Type,addText)}<input ref={fileRef} hidden type="file" accept="image/*" multiple onChange={handleUpload}/></div></div>
        {mode==='grid'&&<div><div className="eyebrow">Grid setup</div><div style={{fontSize:12,margin:'8px 0 6px'}}>Photo count</div><div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:4}}>{[2,3,4,5,6,7,8,9,10,12].map(n=><button key={n} onClick={()=>setCount(n)} className={`pill ${count===n?'selected':''}`} style={{padding:'6px 0'}}>{n}</button>)}</div><div style={{fontSize:12,margin:'12px 0 6px'}}>Layout</div><select className="field" value={layout} onChange={e=>setLayout(e.target.value)} style={{padding:'8px',fontSize:12}}>{layoutOptions.map(o=><option key={o}>{o}</option>)}</select><label style={{display:'block',fontSize:11,marginTop:10}}>Cell spacing<input className="field" aria-label="Cell spacing" type="range" min="0" max="4" step="1" value={spacing} onChange={e=>setSpacing(Number(e.target.value))}/></label><label style={{display:'block',fontSize:11,marginTop:8}}>Outer margin<input className="field" aria-label="Outer margin" type="range" min="0" max="8" step="1" value={margin} onChange={e=>setMargin(Number(e.target.value))}/></label><button className="btn btn-olive" style={{width:'100%',marginTop:9}} onClick={createGrid}>Arrange {count} frames</button></div>}
        {mode==='creative'&&<div><div className="eyebrow">Creative composition</div><div style={{fontSize:12,margin:'8px 0 6px'}}>Photo count</div><div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:4}}>{[2,3,4,5,6,7,8,9,10,12].map(n=><button key={n} onClick={()=>setCount(n)} className={`pill ${count===n?'selected':''}`} style={{padding:'6px 0'}}>{n}</button>)}</div><button className="btn btn-olive" style={{width:'100%',marginTop:9}} onClick={()=>createCreative(layout,count)}>Generate variation</button><div className="eyebrow" style={{marginTop:16}}>Composition styles</div><div style={{display:'grid',gap:6,marginTop:8}}>{['Asymmetric','Editorial','Magazine','Scrapbook','Polaroid','Overlapping','Film strip','Minimal','Mosaic','Pinterest'].map(s=><button key={s} className={`pill ${layout===s?'selected':''}`} onClick={()=>createCreative(s,count)} style={{textAlign:'left',borderRadius:7}}>{s}</button>)}</div></div>}
       <div><div className="eyebrow">Add to canvas</div><div style={{display:'flex',gap:6,marginTop:8,flexWrap:'wrap'}}>{toolButton('Shape',Square,()=>addShape('shape'))}{toolButton('Circle',Circle,()=>addShape('shape'))}<button className="btn" style={{fontSize:11,padding:'8px 10px'}} onClick={()=>setBg('#e8d99a')}><Palette size={14}/> Paper</button></div></div>
       <div><div className="eyebrow">Image library</div><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:5,marginTop:8}}>{photos.slice(0,9).map((p,i)=><button key={p} onClick={()=>addPhotos([p])} style={{padding:0,border:0,borderRadius:5,overflow:'hidden',aspectRatio:'1'}}><img src={p} className="photo"/></button>)}</div></div>
     </aside>
     <section className="card" style={{padding:'clamp(10px,2vw,24px)',background:'#e9e6df',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:550,overflow:'hidden'}}>
       <div style={{width:`${zoom}%`,maxWidth:'100%',transition:'width .2s'}}>
           <div style={{position:'relative',width:'100%',aspectRatio:`${dimensions.width} / ${dimensions.height}`,background:bg,overflow:'hidden',boxShadow:'0 12px 45px #37352e20',touchAction:'none'}}>
            <canvas ref={canvasElementRef} aria-label="Editable collage canvas" />
            {!layers.length&&<div style={{position:'absolute',inset:0,display:'grid',placeItems:'center',textAlign:'center',padding:25,color:'#888278',pointerEvents:'none'}}><div><div style={{width:50,height:50,border:'1px solid #c8c2b7',borderRadius:'50%',display:'grid',placeItems:'center',margin:'0 auto 12px',color:'#888278'}}><ImagePlus size={20}/></div><div style={{font:'italic 22px Playfair Display',color:'#57554f'}}>A blank canvas, full of possibility.</div><div style={{fontSize:12,marginTop:8}}>Choose a grid layout or add a photo from the left.</div></div></div>}
         </div>
       </div>
        <div style={{display:'flex',justifyContent:'space-between',width:'100%',alignItems:'center',marginTop:12,fontSize:11,color:'#77736d'}}><span>{layers.length} layer{layers.length===1?'':'s'} · {dimensions.width} × {dimensions.height}</span><span>{layout}</span></div>
     </section>
     <aside className="card" style={{padding:14,display:'grid',alignContent:'start',gap:15}}>
        <div>
          <div className="eyebrow">Properties</div>
          {active?<>
            <div style={{fontSize:13,fontWeight:600,margin:'9px 0 10px'}}>{active.kind==='image'?'Image layer':active.kind==='text'?'Text layer':'Shape layer'}</div>
            {active.kind==='text'&&<label style={{fontSize:11}}>Text<input className="field" value={active.text||''} onChange={e=>changeProp('text',e.target.value)} style={{marginTop:5,fontSize:12}}/></label>}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:10}}>
              <label style={{fontSize:10,color:'#77736d'}}>Width %<input className="field" type="number" value={Math.round(active.w)} onChange={e=>changeProp('w',Number(e.target.value))} style={{marginTop:4,padding:7,fontSize:12}}/></label>
              <label style={{fontSize:10,color:'#77736d'}}>Height %<input className="field" type="number" value={Math.round(active.h)} onChange={e=>changeProp('h',Number(e.target.value))} style={{marginTop:4,padding:7,fontSize:12}}/></label>
            </div>
            <label style={{fontSize:10,color:'#77736d',display:'block',marginTop:8}}>Rotation<input className="field" type="range" min="-20" max="20" value={active.rotation||0} onChange={e=>changeProp('rotation',Number(e.target.value))} style={{padding:4,marginTop:4}}/></label>
            <label style={{fontSize:10,color:'#77736d',display:'block',marginTop:8}}>Opacity<input className="field" type="range" min="0.1" max="1" step="0.05" value={active.opacity??1} onChange={e=>changeProp('opacity',Number(e.target.value))} style={{padding:4,marginTop:4}}/></label>
            {active.kind!=='image'&&<label style={{fontSize:10,color:'#77736d',display:'block',marginTop:8}}>Color<input className="field" type="color" value={active.color||'#252525'} onChange={e=>changeProp('color',e.target.value)} style={{height:36,padding:3,marginTop:4}}/></label>}
            <div style={{display:'flex',gap:5,marginTop:10,flexWrap:'wrap'}}>
              {active.kind==='image'&&<button className="btn" onClick={()=>{replaceLayerRef.current=active.id;fileRef.current?.click()}} aria-label="Replace image"><FileImage size={14}/> Replace</button>}
              <button className="btn" onClick={duplicate} aria-label="Duplicate layer"><Copy size={14}/></button>
              <button className="btn" onClick={()=>moveLayer(1)} aria-label="Bring forward"><ArrowUp size={14}/></button>
              <button className="btn" onClick={()=>moveLayer(-1)} aria-label="Send backward"><ArrowDown size={14}/></button>
              <button className="btn" onClick={remove} aria-label="Delete layer"><Trash2 size={14}/></button>
            </div>
          </>:<p className="subtle" style={{fontSize:12,lineHeight:1.6}}>Select an element on the canvas to edit its details.</p>}
        </div>
       <div><div className="eyebrow">Canvas color</div><div style={{display:'flex',gap:7,marginTop:9}}>{['#f0ece4','#ffffff','#e8d99a','#e4e7dd','#ead8d2','#333330'].map(c=><button key={c} onClick={()=>setBg(c)} aria-label={`Set background ${c}`} style={{width:24,height:24,borderRadius:'50%',background:c,border:bg===c?'2px solid #78836a':'1px solid #ccc'}}/>)}</div></div>
       <div><div className="eyebrow">Layers <span className="subtle">({layers.length})</span></div><div style={{marginTop:8,maxHeight:190,overflowY:'auto',display:'grid',gap:4}}>{[...layers].reverse().map((l,i)=><button key={l.id} onClick={()=>setSelected(l.id)} style={{display:'flex',alignItems:'center',gap:8,padding:'8px',borderRadius:7,border:'1px solid '+(selected===l.id?'#c5cbbc':'#eeebe5'),background:selected===l.id?'#eff0e9':'white',textAlign:'left',fontSize:11}}>{l.kind==='image'?<img src={l.src} style={{width:28,height:28,objectFit:'cover',borderRadius:4}}/>:<span style={{width:28,height:28,display:'grid',placeItems:'center',background:'#f2eee8'}}>{l.kind==='text'?<Type size={14}/>:<Square size={14}/>}</span>}<span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.kind==='text'?l.text:`${l.kind} ${layers.length-i}`}</span></button>)}</div></div>
       <div style={{display:'grid',gap:7}}><button className="btn" onClick={()=>void exportImage('png')} style={{width:'100%'}}><Download size={14}/> Export PNG</button><button className="btn" onClick={()=>void exportImage('jpeg')} style={{width:'100%'}}><FileImage size={14}/> Export JPEG</button></div>
     </aside>
   </div>
 </div>;
}

function Explore({studio,notify}:{studio:Studio;notify:(s:string)=>void}) {
 const [,go]=useLocation();
 const [query,setQuery]=useState('');
 const [category,setCategory]=useState('All styles');
 const [selected,setSelected]=useState<Aesthetic|null>(null);
 const list=useMemo(()=>studio.aesthetics.filter(a=>(category==='All styles'||a.category===category)&&`${a.name} ${a.category} ${a.description}`.toLowerCase().includes(query.toLowerCase())),[studio.aesthetics,category,query]);
 const toggle=(a:Aesthetic)=>studio.setAesthetics(prev=>prev.map(x=>x.id===a.id?{...x,favorited:!x.favorited}:x));
 return <div className="page-wrap fade-in"><PageHeading eyebrow="Collect a feeling" title="Explore aesthetics" description="Browse a visual vocabulary, keep the palettes you love, and follow a thread into your next project."/>
   <div className="card featured-mood" style={{padding:18,background:'#ebece5',display:'grid',gridTemplateColumns:'1fr minmax(240px,.75fr)',gap:20,alignItems:'center',marginBottom:27}}>
     <div><div className="eyebrow">Featured collection · Issue 04</div><h2 className="font-editorial" style={{fontSize:33,fontWeight:500,margin:'8px 0'}}>A slower kind of Sunday</h2><p className="subtle" style={{fontSize:13,lineHeight:1.65,maxWidth:390}}>Quiet rooms, market flowers and the warm, unhurried colors of a day with nowhere else to be.</p><button className="btn btn-dark" onClick={()=>setSelected(studio.aesthetics[0])}>Open the collection <ArrowRight size={14}/></button></div>
     <div style={{height:180,display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:7}}>{[photos[0],photos[3],photos[9]].map((p,i)=><img key={p} src={p} className="photo" style={{borderRadius:i===1?'90px 90px 8px 8px':8,marginTop:i===1?14:0}}/>)}</div>
   </div>
   <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap',marginBottom:14}}>
     <div style={{position:'relative',width:'min(100%,330px)'}}><Search size={15} style={{position:'absolute',left:12,top:13,color:'#928c83'}}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search moods and colors" className="field" style={{paddingLeft:36}} aria-label="Search aesthetics"/></div>
     <div style={{fontSize:12,color:'#77736d'}}>{list.length} visual directions</div>
   </div>
   <div style={{display:'flex',gap:7,overflowX:'auto',paddingBottom:12,marginBottom:14}}>{categories.map(c=><button key={c} className={`pill ${category===c?'selected':''}`} onClick={()=>setCategory(c)} style={{whiteSpace:'nowrap'}}>{c}</button>)}</div>
   {list.length?<div className="explore-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:15}}>{list.map((a,i)=><article className="card" key={a.id} style={{overflow:'hidden',animationDelay:`${i*35}ms`}}>
     <div style={{height:210,display:'grid',gridTemplateColumns:'1.1fr .9fr',gap:5,padding:7,position:'relative'}}><img src={a.images[0]} className="photo" style={{borderRadius:8}}/><div style={{display:'grid',gap:5}}><img src={a.images[1]} className="photo" style={{borderRadius:8,minHeight:0}}/><img src={a.images[2]} className="photo" style={{borderRadius:8,minHeight:0}}/></div><button onClick={()=>toggle(a)} aria-label={a.favorited?'Remove favorite':'Add favorite'} style={{position:'absolute',right:14,top:14,width:34,height:34,borderRadius:'50%',background:'#ffffffdf',border:'1px solid #fff',display:'grid',placeItems:'center',color:a.favorited?'#c77d61':'#77736d'}}><Heart size={16} fill={a.favorited?'#c77d61':'none'}/></button></div>
     <div style={{padding:'10px 14px 14px'}}><div className="eyebrow">{a.category}</div><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:4}}><h3 className="font-display" style={{fontSize:19,margin:0}}>{a.name}</h3><button className="btn btn-quiet" onClick={()=>setSelected(a)} aria-label={`View ${a.name}`}><ArrowRight size={15}/></button></div><p className="subtle" style={{fontSize:12,lineHeight:1.55,minHeight:38,margin:'6px 0 11px'}}>{a.description}</p><div style={{display:'flex',gap:5}}>{a.palette.map(color=><span key={color} title={color} style={{width:22,height:22,borderRadius:'50%',background:color,border:'1px solid #0000000b'}}/>)}</div></div>
   </article>)}</div>:<div className="card" style={{padding:35,textAlign:'center'}}><div style={{font:'italic 24px Playfair Display'}}>No moods found.</div><p className="subtle" style={{fontSize:13}}>Try another search or category.</p><button className="btn" onClick={()=>{setQuery('');setCategory('All styles')}}>Clear filters</button></div>}
   {selected&&<div onClick={()=>setSelected(null)} style={{position:'fixed',inset:0,zIndex:80,background:'#25252088',display:'grid',placeItems:'center',padding:18}}><div onClick={e=>e.stopPropagation()} className="card" style={{width:'min(850px,100%)',maxHeight:'90dvh',overflowY:'auto',padding:20,position:'relative'}}>
     <button className="btn btn-quiet" onClick={()=>setSelected(null)} style={{position:'absolute',right:15,top:15,zIndex:1}} aria-label="Close details"><X size={18}/></button>
       <div className="mood-detail" style={{display:'grid',gridTemplateColumns:'1.1fr .9fr',gap:23,alignItems:'center'}}><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>{selected.images.map((p,i)=><img key={p} src={p} className="photo" style={{height:i===0?270:130,borderRadius:8,gridRow:i===0?'span 2':undefined}}/>)}</div>
       <div><div className="eyebrow">{selected.category} · Mood notes</div><h2 className="font-editorial" style={{fontSize:37,fontWeight:500,margin:'9px 0'}}>{selected.name}</h2><p className="subtle" style={{fontSize:13,lineHeight:1.8}}>{selected.description}</p><div style={{fontSize:11,fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginTop:20}}>Palette study</div><div style={{display:'flex',gap:8,marginTop:10}}>{selected.palette.map(c=><div key={c} style={{textAlign:'center'}}><span style={{width:35,height:35,borderRadius:'50%',display:'block',background:c}}/><small className="subtle" style={{fontSize:9}}>{c}</small></div>)}</div><div style={{display:'flex',gap:8,marginTop:22,flexWrap:'wrap'}}><button className="btn" onClick={()=>toggle(selected)}><Heart size={14} fill={selected.favorited?'#c77d61':'none'}/>{selected.favorited?'Saved mood':'Save mood'}</button><button className="btn btn-dark" onClick={()=>{write('moodora.collage.layers',selected.images.map((src,i)=>({id:id(),kind:'image',src,x:10+(i%2)*38,y:10+Math.floor(i/2)*36,w:34,h:30,rotation:i===1?3:0})));write('moodora.collage.bg',selected.palette[2]);setSelected(null);notify(`${selected.name} mood opened in collage studio.`);go('/collage')}}>Apply to collage <ArrowRight size={14}/></button></div></div>
     </div></div></div>}
 </div>;
}

function Projects({studio,notify}:{studio:Studio;notify:(s:string)=>void}) {
 const [,go]=useLocation();
 const [query,setQuery]=useState('');
 const [filter,setFilter]=useState('all');
 const [sort,setSort]=useState('recent');
 const shown=useMemo(()=>studio.projects.filter(p=>(filter==='all'||p.type===filter)&&p.title.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>sort==='recent'?b.updatedAt.localeCompare(a.updatedAt):a.title.localeCompare(b.title)),[studio.projects,filter,query,sort]);
 const open=(p:Project)=>{write('moodora.openProject',p);go(p.type==='feed'?'/planner':'/collage')};
 const rename=(p:Project)=>{const title=window.prompt('Give this project a new name',p.title);if(title?.trim()){studio.setProjects(prev=>prev.map(x=>x.id===p.id?{...x,title:title.trim(),updatedAt:new Date().toISOString()}:x));notify('Project renamed.')}};
 const duplicate=(p:Project)=>{const clone={...p,id:id(),title:`${p.title} copy`,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),content:JSON.parse(JSON.stringify(p.content))};studio.setProjects(prev=>[clone,...prev]);notify('A copy is ready in your projects.')};
 const remove=(p:Project)=>{if(window.confirm(`Delete “${p.title}” from this device?`)){studio.setProjects(prev=>prev.filter(x=>x.id!==p.id));notify('Project deleted.')}};
 return <div className="page-wrap fade-in"><PageHeading eyebrow="Your work, kept close" title="My projects" description="Everything you have made here, saved privately in this browser.">
   <Link href="/collage" className="btn btn-dark"><Plus size={15}/> New project</Link></PageHeading>
   <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap',marginBottom:20}}>
     <div style={{position:'relative',width:'min(100%,320px)'}}><Search size={15} style={{position:'absolute',left:12,top:13,color:'#928c83'}}/><input className="field" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search your projects" style={{paddingLeft:36}}/></div>
     <select className="field" value={filter} onChange={e=>setFilter(e.target.value)} style={{width:150}}><option value="all">All projects</option><option value="feed">Feed planner</option><option value="collage">Collages</option></select>
     <select className="field" value={sort} onChange={e=>setSort(e.target.value)} style={{width:160}}><option value="recent">Recently updated</option><option value="name">Name A–Z</option></select>
     <span className="subtle" style={{fontSize:12,marginLeft:'auto'}}>{shown.length} projects</span>
   </div>
   {shown.length?<div className="project-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:15}}>{shown.map(p=><article className="card" key={p.id} style={{padding:10}}>
     <button onClick={()=>open(p)} style={{display:'block',width:'100%',border:0,padding:0,background:'none',textAlign:'left'}}><div style={{height:190,borderRadius:8,overflow:'hidden',position:'relative'}}><img src={p.thumbnail||photos[0]} className="photo"/><span style={{position:'absolute',left:9,bottom:9,padding:'5px 8px',background:'#ffffffdf',borderRadius:99,fontSize:10,fontWeight:700}}>{p.type==='feed'?'FEED PLAN':'COLLAGE'}</span></div><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 4px 8px'}}><div><div style={{fontSize:14,fontWeight:600}}>{p.title}</div><div className="subtle" style={{fontSize:10,marginTop:4}}>Updated {new Date(p.updatedAt).toLocaleDateString()}</div></div><ArrowRight size={15} color="#77736d"/></div></button>
     <div style={{display:'flex',borderTop:'1px solid #eeeae3',paddingTop:8,gap:5}}><button onClick={()=>rename(p)} className="btn btn-quiet" style={{fontSize:11,padding:'6px 8px'}}><Pencil size={13}/> Rename</button><button onClick={()=>duplicate(p)} className="btn btn-quiet" style={{fontSize:11,padding:'6px 8px'}}><Copy size={13}/> Duplicate</button><button onClick={()=>remove(p)} className="btn btn-quiet" aria-label="Delete project" style={{marginLeft:'auto',padding:'6px 8px',color:'#a45d50'}}><Trash2 size={14}/></button></div>
   </article>)}</div>:<div className="card" style={{padding:'50px 25px',textAlign:'center'}}><div style={{width:50,height:50,borderRadius:'50%',background:'#ebece5',display:'grid',placeItems:'center',margin:'0 auto 15px',color:'#78836a'}}><FolderOpen size={21}/></div><h2 className="font-display" style={{fontSize:22,margin:'0 0 7px'}}>{query||filter!=='all'?'Nothing matches just yet.':'Your project shelf is waiting.'}</h2><p className="subtle" style={{fontSize:13,maxWidth:360,margin:'0 auto 18px',lineHeight:1.6}}>{query||filter!=='all'?'Try a different search or filter.':'Make a feed plan or collage and it will be saved here for next time.'}</p>{query||filter!=='all'?<button className="btn" onClick={()=>{setQuery('');setFilter('all')}}>Clear search</button>:<div style={{display:'flex',justifyContent:'center',gap:8}}><Link href="/planner" className="btn"><Instagram size={14}/> Plan a feed</Link><Link href="/collage" className="btn btn-dark"><Plus size={14}/> Start a collage</Link></div>}</div>}
 </div>;
}

function Profile({studio,notify}:{studio:Studio;notify:(s:string)=>void}) {
 const [email,setEmail]=useState(()=>read('moodora.email','maya.chen@example.com'));
 const [name,setName]=useState(studio.name);
  const [avatar,setAvatar]=useState(()=>read('moodora.avatar',''));
  const avatarFileRef=useRef<HTMLInputElement>(null);
  const updateAvatar=(event:ChangeEvent<HTMLInputElement>)=>{const file=event.target.files?.[0];event.target.value='';if(!file)return;if(!file.type.startsWith('image/')){notify('Choose an image file for your profile photo.');return}void(async()=>{try{const preview=await createLocalImagePreview(file,360);setAvatar(preview.url);write('moodora.avatar',preview.url);notify('Profile photo saved on this device.')}catch{notify('Could not open that profile image. Choose another file.')}})()};
 const save=(e:FormEvent)=>{e.preventDefault();studio.setName(name.trim()||'Creator');write('moodora.email',email);notify('Profile updated on this device.')};
 return <div className="page-wrap fade-in"><PageHeading eyebrow="A little about you" title="Profile" description="Your workspace identity and the moods you have collected."/>
   <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) minmax(280px,.72fr)',gap:16}}>
      <form className="card" onSubmit={save} style={{padding:24}}><div style={{display:'flex',alignItems:'center',gap:16,marginBottom:26}}><div><button type="button" onClick={()=>avatarFileRef.current?.click()} aria-label="Change profile photo" style={{height:68,width:68,borderRadius:'50%',padding:0,border:0,overflow:'hidden',background:'#c99a9b',display:'grid',placeItems:'center',color:'#fff',font:'600 21px Space Grotesk'}}>{avatar?<img src={avatar} alt="Profile" className="photo"/>:name.split(' ').map(x=>x[0]).join('').slice(0,2)}</button><input ref={avatarFileRef} hidden type="file" accept="image/*" onChange={updateAvatar}/></div><div><div style={{fontSize:17,fontWeight:600}}>{name}</div><div className="subtle" style={{fontSize:12}}>Local creator profile</div><button type="button" className="btn btn-quiet" onClick={()=>avatarFileRef.current?.click()} style={{padding:'5px 0',fontSize:11}}>Change photo</button></div></div><label style={{display:'block',fontSize:12,fontWeight:600,marginBottom:15}}>Display name<input className="field" value={name} onChange={e=>setName(e.target.value)} style={{marginTop:7}}/></label><label style={{display:'block',fontSize:12,fontWeight:600}}>Email<input className="field" type="email" value={email} onChange={e=>setEmail(e.target.value)} style={{marginTop:7}}/></label><p className="subtle" style={{fontSize:11,lineHeight:1.6}}>This demo profile is not connected to an account service. Your details stay in local browser storage.</p><button className="btn btn-dark" type="submit"><Check size={14}/> Save profile</button></form>
     <section className="card" style={{padding:22}}><div className="eyebrow">Saved moods</div><h3 className="font-display" style={{fontSize:20,margin:'7px 0 14px'}}>Your favorites</h3>{studio.aesthetics.filter(a=>a.favorited).length?studio.aesthetics.filter(a=>a.favorited).map(a=><div key={a.id} style={{display:'flex',gap:10,alignItems:'center',padding:'9px 0',borderTop:'1px solid #eeeae3'}}><img src={a.images[0]} style={{width:46,height:46,objectFit:'cover',borderRadius:7}}/><div><div style={{fontSize:13,fontWeight:600}}>{a.name}</div><div className="subtle" style={{fontSize:11}}>{a.category}</div></div></div>):<p className="subtle" style={{fontSize:13}}>Save an aesthetic to keep its palette close by.</p>}<Link href="/explore" className="btn" style={{marginTop:10}}>Explore styles <ArrowRight size={14}/></Link></section>
   </div>
 </div>;
}
function Settings({studio,notify}:{studio:Studio;notify:(s:string)=>void}) {
 const [theme,setTheme]=useState(()=>read('moodora.theme','light'));
 const [compact,setCompact]=useState(()=>read('moodora.compact',false));
 const [,go]=useLocation();
 useEffect(()=>{document.documentElement.classList.toggle('dark',theme==='dark');write('moodora.theme',theme)},[theme]);
 const logout=()=>{localStorage.removeItem('moodora.session');notify('You are signed out. Your local projects are still here.');go('/login')};
 const clear=()=>{if(window.confirm('Remove Moodora projects, saved photos, mock access and preferences from this browser?'))void(async()=>{try{await clearLocalAssets();Object.keys(localStorage).filter(key=>key.startsWith('moodora.')).forEach(key=>localStorage.removeItem(key));studio.setProjects([]);studio.setAesthetics(seedAesthetics);studio.setName('Maya Chen');notify('Moodora local data cleared.')}catch(error){notify(error instanceof Error?error.message:'Could not clear local image storage.')}})()};
 return <div className="page-wrap fade-in"><PageHeading eyebrow="Your studio, your way" title="Settings" description="A few preferences for working comfortably."/>
   <div style={{maxWidth:750,display:'grid',gap:13}}>
     <section className="card" style={{padding:21}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:20}}><div><div style={{fontSize:14,fontWeight:600}}>Appearance</div><div className="subtle" style={{fontSize:12,marginTop:4}}>Choose a light or dusk workspace.</div></div><select value={theme} onChange={e=>setTheme(e.target.value)} className="field" style={{width:160}}><option value="light">Warm light</option><option value="dark">Dusk</option></select></div></section>
     <section className="card" style={{padding:21}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:20}}><div><div style={{fontSize:14,fontWeight:600}}>Compact project cards</div><div className="subtle" style={{fontSize:12,marginTop:4}}>A smaller preview for your project shelf.</div></div><button className={`pill ${compact?'selected':''}`} onClick={()=>{setCompact(!compact);write('moodora.compact',!compact);notify('Preference saved.')}}>{compact?'On':'Off'}</button></div></section>
     <section className="card" style={{padding:21}}><div style={{fontSize:14,fontWeight:600}}>Local data</div><p className="subtle" style={{fontSize:12,lineHeight:1.6}}>Projects, preferences and mock access are stored in this browser. There is no remote account or sync.</p><button className="btn" onClick={clear} style={{color:'#a45d50'}}><Trash2 size={14}/> Clear local projects</button></section>
     <section className="card" style={{padding:21,display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><div style={{fontSize:14,fontWeight:600}}>Mock session</div><div className="subtle" style={{fontSize:12,marginTop:4}}>Leave your local studio for now.</div></div><button className="btn" onClick={logout}><ArrowLeft size={14}/> Sign out</button></section>
   </div>
 </div>;
}
function NotFound() {return <div className="page-wrap" style={{textAlign:'center',paddingTop:100}}><div className="eyebrow">404 · Lost in the studio</div><h1 className="page-title">This page wandered off.</h1><Link href="/dashboard" className="btn btn-dark">Back to workspace <ArrowRight size={14}/></Link></div>}

function App() {
 return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/,'')}>
   <ErrorBoundary><AppContent/></ErrorBoundary>
 </WouterRouter><Toaster/></TooltipProvider></QueryClientProvider>;
}

export default App;
