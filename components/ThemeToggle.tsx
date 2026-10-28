'use client';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
const KEY='executive-portfolio-theme';
export default function ThemeToggle(){
 const [dark,setDark]=useState(false);
 useEffect(()=>{
  const root=document.documentElement;const media=window.matchMedia('(prefers-color-scheme: dark)');
  const apply=()=>{const saved=localStorage.getItem(KEY);const next=saved==='light'||saved==='dark'?saved:(media.matches?'dark':'light');root.dataset.theme=next;setDark(next==='dark')};
  apply();media.addEventListener('change',apply);return()=>media.removeEventListener('change',apply);
 },[]);
 const toggle=()=>{const next=dark?'light':'dark';document.documentElement.dataset.theme=next;localStorage.setItem(KEY,next);setDark(next==='dark')};
 return <button type="button" className="theme-toggle" onClick={toggle} aria-label={`Switch to ${dark?'light':'dark'} mode`} title={`Switch to ${dark?'light':'dark'} mode`}>{dark?<Sun size={17}/>:<Moon size={17}/>}<span>{dark?'Light':'Dark'}</span></button>
}
