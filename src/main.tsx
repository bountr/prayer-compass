import React from "react";
import { createRoot } from "react-dom/client";
import { createRootRoute,createRoute,createRouter,RouterProvider,Outlet,Link,Navigate } from "@tanstack/react-router";
import { I18nProvider,useI18n } from "@/hooks/useI18n";
import { DhikrProvider } from "@/hooks/useDhikr";
import { ZikirSayfasi } from "@/routes/zikir.index";
import { ZikirDetay } from "@/routes/zikir.$id";
import { ZikirGecmis } from "@/routes/zikir.gecmis";
import { LOCALES,LOCALE_META } from "@/lib/i18n";
import { BookOpen,History,Settings } from "lucide-react";
import "./styles.css";
function Shell(){const {t,locale,setLocale}=useI18n();return <div className="min-h-dvh overflow-x-clip pb-24"><div className="mx-auto max-w-md px-4 pt-6"><Outlet /></div><nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"><div className="mx-auto grid max-w-md grid-cols-3 gap-2 p-2"><Link to="/zikir" className="flex flex-col items-center gap-1 rounded-xl p-2 text-xs text-muted-foreground" activeProps={{className:"!text-primary"}}><BookOpen size={20}/>{t("nav.dhikr")}</Link><Link to="/zikir/gecmis" className="flex flex-col items-center gap-1 rounded-xl p-2 text-xs text-muted-foreground" activeProps={{className:"!text-primary"}}><History size={20}/>{t("dhikr.history")}</Link><Link to="/ayarlar" className="flex flex-col items-center gap-1 rounded-xl p-2 text-xs text-muted-foreground" activeProps={{className:"!text-primary"}}><Settings size={20}/>{t("nav.settings")}</Link></div></nav></div>}
function Preferences(){const {locale,setLocale,t}=useI18n();const [theme,setTheme]=React.useState(localStorage.getItem("zikir:theme")||"system");React.useEffect(()=>{const apply=()=>document.documentElement.classList.toggle("light",theme==="light"||(theme==="system"&&matchMedia("(prefers-color-scheme: light)").matches));apply();localStorage.setItem("zikir:theme",theme);const media=matchMedia("(prefers-color-scheme: light)");media.addEventListener("change",apply);return()=>media.removeEventListener("change",apply)},[theme]);return <main><h1 className="font-display text-3xl">{t("nav.settings")}</h1><section className="surface-card mt-5 rounded-3xl p-5"><label className="block text-sm font-semibold">{t("settings.language")}</label><select className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-transparent p-3" value={locale} onChange={e=>setLocale(e.target.value as typeof locale)}>{LOCALES.map(code=><option key={code} value={code}>{t(LOCALE_META[code].labelKey)}</option>)}</select><label className="mt-5 block text-sm font-semibold">{t("settings.theme")}</label><select className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-transparent p-3" value={theme} onChange={e=>setTheme(e.target.value)}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></section><p className="mt-5 text-sm text-muted-foreground">Zikir kayıtları yalnızca bu cihazda saklanır.</p></main>}
function ProInfo(){return <main><h1 className="text-xl font-bold">PRO</h1><p className="mt-4 text-sm text-muted-foreground">Bağımsız sürümde mağaza içi satın alma henüz etkinleştirilmemiştir.</p><Link className="mt-5 inline-block text-primary" to="/zikir/gecmis">Geri dön</Link></main>}
const rootRoute=createRootRoute({component:Shell});
const home=createRoute({getParentRoute:()=>rootRoute,path:"/",component:()=> <Navigate to="/zikir" />});
const zikir=createRoute({getParentRoute:()=>rootRoute,path:"zikir",component:Outlet});
const index=createRoute({getParentRoute:()=>zikir,path:"/",component:ZikirSayfasi});
const history=createRoute({getParentRoute:()=>zikir,path:"gecmis",component:ZikirGecmis});
const detail=createRoute({getParentRoute:()=>zikir,path:"$id",component:ZikirDetay});
const ayarlar=createRoute({getParentRoute:()=>rootRoute,path:"ayarlar",component:Preferences});
const pro=createRoute({getParentRoute:()=>rootRoute,path:"ayarlar/pro",component:ProInfo});
const tree=rootRoute.addChildren([home,zikir.addChildren([index,history,detail]),ayarlar,pro]);
const router=createRouter({routeTree:tree,defaultPreload:"intent"});
function App(){return <I18nProvider><DhikrProvider><RouterProvider router={router}/></DhikrProvider></I18nProvider>}
createRoot(document.getElementById("root")!).render(<React.StrictMode><App/></React.StrictMode>);
