const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/CountryTelephone-hSS-dXJb.js","assets/jsx-runtime-Am8b9ysO.js","assets/Field-CiqmCwdp.js","assets/cx-hZG6twJP.js","assets/Skeleton-uHGQUyB9.js","assets/TextControls-BykiD2ad.js","assets/Combobox-Cv2fcRUo.js","assets/Select-BTFb_aA1.js","assets/ReviewNote-BrxiNxRV.js","assets/styles-Dwl96vYo.js","assets/react-dom-4g9g9jMY.js","assets/scope-K8zQMRhY.js","assets/Button-CDE3YPd-.js","assets/safeUrl-Ci38IGCR.js","assets/legacy-kXMoZwgY.js","assets/ImageBlock-CRbS7pu0.js","assets/preload-helper-CTk6w4mk.js","assets/provider-B-UTSiHV.js","assets/DropZone-BGsgem2Q.js","assets/styles-CCRoiBEC.css","assets/Alert-BaFPLt3s.js","assets/CaptionEditor-Do2-kYBP.js","assets/media-CyqPReiq.js","assets/Demo-CK3YOxY1.js","assets/createCropFormats-DGMqQU1X.js","assets/crop-BrPEdBi6.js","assets/Card-LV6_Jpv9.js","assets/media-BWMbibkE.css","assets/crop-adjustments-CXcRpzOU.css"])))=>i.map(i=>d[i]);
import{n as e,t}from"./jsx-runtime-Am8b9ysO.js";import{_ as n,h as r,r as i,t as a}from"./brandTheme-D2Qgr46P.js";import{t as o}from"./cx-hZG6twJP.js";import{t as s}from"./Alert-BaFPLt3s.js";import{t as c}from"./Skeleton-uHGQUyB9.js";import{n as l,t as u}from"./Badge-Bp1EUs99.js";import{i as d,n as f,r as p,t as m}from"./Button-CDE3YPd-.js";import{n as h,t as g}from"./colourPlates-CLEjdc7i.js";import{n as _,t as v}from"./Combobox-Cv2fcRUo.js";import{n as y,t as b}from"./TextControls-BykiD2ad.js";import{t as x}from"./react-dom-4g9g9jMY.js";import{t as S}from"./scope-K8zQMRhY.js";import{a as C,i as w,n as T,o as E,r as D,s as O,t as k}from"./componentGuides-C_GvVtEE.js";import{a as A,i as ee,n as te,r as j,t as ne}from"./Select-BTFb_aA1.js";import{a as M,c as N,i as P,l as re,n as ie,o as ae,r as oe,s as se,t as F}from"./Card-LV6_Jpv9.js";import{n as I,t as L}from"./Checkbox-Cnxg-bw9.js";import{n as ce,t as R}from"./Field-CiqmCwdp.js";import{n as z,t as le}from"./Carousel-CLtvPzGO.js";import{t as ue}from"./RadioGroup-DvduP-12.js";import{t as B}from"./SaveStatus-BmaEUXuH.js";import{a as de,i as fe,n as pe,r as me,t as he}from"./NotFound-DP0H5L1I.js";import{t as ge}from"./Slider-BDWgUFYM.js";import{a as _e,i as ve,n as ye,r as be,t as xe}from"./Tabs-C97KbHKd.js";import{a as Se,i as Ce,n as we,o as Te,r as V,t as H}from"./Demo-CK3YOxY1.js";import{i as Ee,r as De,t as Oe}from"./styles-CCa5MT4V.js";import{t as ke}from"./preload-helper-CTk6w4mk.js";import{E as Ae,r as je,y as Me}from"./safeUrl-Ci38IGCR.js";import{_ as Ne,s as Pe}from"./legacy-kXMoZwgY.js";import{t as Fe}from"./blocks-sz1CWLom.js";import{i as Ie}from"./palette-BTYVItIu.js";function Le(e){if(/^3[47]/.test(e))return`amex`;if(e.startsWith(`4`))return`visa`;let t=Number(e.slice(0,4));return/^5[1-5]/.test(e)||e.length>=4&&t>=2221&&t<=2720?`mastercard`:`generic`}function Re(e,t){return e.replaceAll(/\D/g,``).slice(0,t)}function ze(e,t){let n=[],r=0;for(let i=0;i<t.length-1;i++){let a=r+t[i];if(a>=e.length)break;n.push(e.slice(r,a)),r=a}return n.push(e.slice(r)),n.join(` `)}var Be={AD:24,AE:23,AL:28,AT:20,AZ:28,BA:20,BE:16,BG:22,BH:22,BI:27,BR:29,BY:28,CH:21,CR:22,CY:28,CZ:24,DE:22,DJ:27,DK:18,DO:28,EE:20,EG:29,ES:24,FI:18,FK:18,FO:18,FR:27,GB:22,GE:22,GI:23,GL:18,GR:27,GT:28,HN:28,HR:21,HU:28,IE:22,IL:23,IQ:23,IS:26,IT:27,JO:30,KW:30,KZ:20,LB:28,LC:32,LI:21,LT:20,LU:20,LV:21,LY:25,MC:27,MD:24,ME:22,MK:19,MN:20,MR:27,MT:31,MU:30,NI:28,NL:18,NO:15,OM:23,PK:24,PL:28,PS:29,PT:25,QA:29,RO:24,RS:22,RU:33,SA:24,SC:31,SD:18,SE:24,SI:19,SK:24,SM:27,SO:23,ST:25,SV:28,TL:23,TN:24,TR:26,UA:29,VA:22,VG:24,XK:20,YE:30},Ve=34;function He(e){let t=Be[e.slice(0,2).toUpperCase()],n=t===void 0?Math.max(8,(Math.floor(e.length/4)+1)*4):Math.max(t,e.length),r=Math.min(n,Ve);return Array.from({length:Math.ceil(r/4)},(e,t)=>Math.min(4,r-t*4))}var Ue={inputMode:`text`,parse:e=>e.replaceAll(/[^A-Za-z0-9]/g,``).slice(0,Ve).toUpperCase(),format:e=>ze(e,He(e)),segments:He},We=[4,6,5],Ge=[4,4,4,4];function Ke(e){return Le(e)===`amex`?e.length>15?[...We,4]:We:e.length>16?[...Ge,3]:Ge}var qe={inputMode:`numeric`,autoComplete:`cc-number`,parse:e=>Re(e,19),format:e=>ze(e,Ke(e)),segments:Ke},Je=[3,3,3],Ye=[...Je,5],Xe={inputMode:`numeric`,parse:e=>Re(e,9),format:e=>ze(e,Je),segments:()=>Je},Ze={inputMode:`numeric`,parse:e=>Re(e,14),format:e=>ze(e,Ye),segments:()=>Ye},U=t(),W=e();function Qe(e,t){let n=0;return t.map(t=>{let r=e.slice(n,n+t);return n+=t,r})}function $e({raw:e}){let t=Le(e),n;return n=t===`mastercard`?(0,U.jsxs)(`g`,{fill:`currentColor`,children:[(0,U.jsx)(`circle`,{cx:`52`,cy:`33`,r:`6`}),(0,U.jsx)(`circle`,{cx:`60`,cy:`33`,r:`6`,opacity:`.65`})]}):t===`generic`?(0,U.jsx)(`path`,{d:`M9 34h7m3 0h7m3 0h7`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`}):(0,U.jsx)(`text`,{x:`66`,y:`38`,textAnchor:`end`,fill:`currentColor`,children:t===`visa`?`VISA`:`AMEX`}),(0,U.jsx)(`span`,{className:`elea-card-mark`,"data-network":t,"aria-hidden":`true`,children:(0,U.jsxs)(`svg`,{viewBox:`0 0 74 46`,fill:`none`,focusable:`false`,children:[(0,U.jsx)(`path`,{className:`elea-card-mark__etch`,d:`M28 52C36 23 51 34 80 4M35 54C45 25 63 35 80 12M44 54C54 31 69 32 80 21`}),(0,U.jsxs)(`g`,{className:`elea-card-mark__chip`,children:[(0,U.jsx)(`rect`,{x:`8`,y:`9`,width:`13`,height:`10`,rx:`2`}),(0,U.jsx)(`path`,{d:`M8 14h4m5 0h4m-8-5v3h3v4h-3v3`})]}),(0,U.jsx)(`path`,{d:`M26 12q2 2 0 4m3-6q4 4 0 8`,stroke:`currentColor`,strokeLinecap:`round`}),n]})})}function et(e,t){let n=t.parse(e),r=t.segments(n);return{blocks:Qe(n,r),widths:r}}function tt(e,{index:t,position:n}){let r=e?.elements.item(t);r&&(r.focus(),n===`select`?r.select():r.setSelectionRange(n,n))}function nt({format:e,firstRef:t,label:n,segmentLabel:r,value:i,defaultValue:a=``,onValueChange:s,id:c,name:l,form:u,autoComplete:d,required:f,disabled:p,readOnly:m,className:h,"aria-describedby":g,"aria-invalid":_}){let[v,y]=(0,W.useState)(()=>et(i??a,e)),{blocks:b,widths:x}=v,S=b.join(``),C=i===void 0?void 0:e.parse(i),w=(0,W.useRef)(null),T=(0,W.useRef)(null);if(C!==void 0&&C!==S){let t=et(C,e),n=w.current?.querySelector(`input[data-segment]:focus`);n&&(T.current={index:Math.min(Number(n.dataset.segment),t.widths.length-1),position:n.selectionStart??0}),y(t)}(0,W.useEffect)(()=>{T.current&&tt(w.current,T.current),T.current=null},[b]),(0,W.useEffect)(()=>{let t=w.current?.form;if(!t||i!==void 0)return;function n(t){queueMicrotask(()=>{t.defaultPrevented||y(et(a,e))})}return t.addEventListener(`reset`,n),()=>t.removeEventListener(`reset`,n)},[u,i,a,e]);function E(t,n){T.current=n??null;let r=t.join(``),i=t[0]??``,a=t.slice(1).join(``),o=!i||i.length<2&&(e===Ue||i===`3`),c=a&&e===qe?i.padEnd(4,`0`)+a:r,l=(a&&o?x:e.segments(c)).slice();e===qe&&l[1]!==x[1]&&(t=[i,...Qe(a,l.slice(1))]),t.forEach((e,t)=>{e&&(l[t]=Math.max(l[t]??4,e.length))}),y({blocks:t,widths:l}),r!==S&&s?.(r)}function D(t){let n=et(t,e),r=n.blocks.filter(Boolean);T.current={index:r.length-1,position:r.at(-1).length},y(n),t!==S&&s?.(t)}function O(t){if(e===Ue){let n=e.segments(t.slice(0,2));return/^[A-Z]{2}\d{2}/.test(t)&&t.length>=Math.max(15,n.reduce((e,t)=>e+t,0))}return e===qe?t.length>=13:t.length===e.segments(t).reduce((e,t)=>e+t,0)}function k(t,n,r,i){let a=b.slice(0,t),o=i+b.slice(t+1).join(``),s=e.segments(a.join(``)+n+r+o).slice(t),c=s.reduce((e,t)=>e+t,0)-n.length-o.length,l=r.slice(0,Math.max(0,c)),u=n+l+o,d=a.concat(Qe(u,s)),f=n.length+l.length,p=0;for(;p<s.length-1&&f>s[p];)f-=s[p++];E(d,{index:t+p,position:f})}function A(t,n,r){if(p||m)return;let i=e.parse(n),a=x[t];if(i.length>a){O(i)?D(i):k(t,``,e.parse(n.slice(0,r)),e.parse(n.slice(r)));return}let o=x.map((e,n)=>n===t?i:b[n]??``),s=o.join(``),c=e.segments(s),l=e.parse(n.slice(0,r)).length;E(o,i.length===a&&l===a&&t+1<c.length?{index:t+1,position:`select`}:{index:t,position:l})}function ee(t,n){if(m||p)return;t.preventDefault();let r=e.parse(t.clipboardData.getData(`text`));if(!r)return;if(O(r)){D(r);return}let i=t.currentTarget,a=i.value.slice(0,i.selectionStart??0),o=i.value.slice(i.selectionEnd??i.value.length),s=a+r+o;s.length<=x[n]?A(n,s,a.length+r.length):k(n,a,r,o)}function te(e,t){if(e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||e.nativeEvent.isComposing)return;let n=e.currentTarget;if(n.selectionStart===n.selectionEnd){if(t>0&&n.selectionStart===0){if(e.key===`Backspace`&&!m&&!n.value){e.preventDefault();let n=b.slice();n[t-1]=(n[t-1]??``).slice(0,-1),E(n,{index:t-1,position:n[t-1].length})}else e.key===`ArrowLeft`&&(e.preventDefault(),tt(w.current,{index:t-1,position:(b[t-1]??``).length}))}e.key===`ArrowRight`&&n.selectionEnd===n.value.length&&t+1<x.length&&(e.preventDefault(),tt(w.current,{index:t+1,position:0}))}}let j=0;return(0,U.jsxs)(`fieldset`,{ref:w,form:u,"aria-label":n,"aria-describedby":g,className:o(`elea-identifier-input`,h),children:[e===qe&&(0,U.jsx)($e,{raw:b[0]??``}),(0,U.jsx)(`div`,{className:`elea-identifier-input__blocks`,dir:`ltr`,children:x.map((n,i)=>{let a=j;return j+=n,(0,U.jsx)(`input`,{"data-segment":i,className:`elea-ui-input elea-identifier-input__block`,type:`text`,size:n,id:i===0?c:void 0,ref:i===0?t:void 0,"aria-label":r(i,x.length),"aria-describedby":g,"aria-invalid":_,inputMode:e.inputMode,autoComplete:i===0?d??e.autoComplete:`off`,autoCapitalize:e===Ue?`characters`:`off`,spellCheck:!1,disabled:p,required:f&&i===0,readOnly:m,form:u,value:b[i]??``,placeholder:`·`.repeat(n),onKeyDown:e=>te(e,i),onPaste:e=>ee(e,i),onChange:e=>A(i,e.currentTarget.value,e.currentTarget.selectionStart??e.currentTarget.value.length)},a)})}),l&&(0,U.jsx)(`input`,{type:`hidden`,name:l,form:u,disabled:p,value:S})]})}var rt=(0,W.forwardRef)(function(e,t){return(0,U.jsx)(nt,{...e,firstRef:t,format:Xe})}),it=(0,W.forwardRef)(function(e,t){return(0,U.jsx)(nt,{...e,firstRef:t,format:Ze})}),at=(0,W.forwardRef)(function(e,t){return(0,U.jsx)(nt,{...e,firstRef:t,format:Ue})}),ot=(0,W.forwardRef)(function(e,t){return(0,U.jsx)(nt,{...e,firstRef:t,format:qe})});function st({items:e,overflowLabel:t,maxItems:n=5,separator:r=`/`,render:i}){let[a,o]=(0,W.useState)(!1),s=(0,W.useId)(),c=Math.max(3,Math.floor(n)),l=e.length>c?e.length-c+1:0,u=(0,U.jsx)(`span`,{"aria-hidden":`true`,className:`elea-breadcrumb__separator`,children:r});function d(e,t){if(t)return(0,U.jsx)(`span`,{"aria-current":`page`,children:e.label});if(e.href===void 0)return e.label;let n={href:e.href,className:`elea-breadcrumb__link`};return i?i({...n,children:e.label}):(0,U.jsx)(`a`,{...n,children:e.label})}return(0,U.jsx)(`ol`,{className:`elea-breadcrumb__list`,id:s,children:e.map((n,r)=>(0,U.jsxs)(`li`,{hidden:!a&&r>0&&r<=l,children:[r>0&&u,d(n,r===e.length-1),r===0&&l>0&&(0,U.jsxs)(U.Fragment,{children:[u,(0,U.jsx)(`button`,{type:`button`,className:`elea-breadcrumb__overflow`,"aria-label":t,"aria-expanded":a,"aria-controls":s,onClick:()=>o(e=>!e),children:`…`})]})]},n.id))})}function ct(e){return e.items.length===0?null:(0,U.jsx)(`nav`,{"aria-label":e.label,className:o(`elea-breadcrumb`,e.className),children:(0,U.jsx)(st,{...e},e.items.at(-1)?.id)})}var G=864e5,lt=Date.parse(`0001-01-01T00:00:00Z`),ut=Date.parse(`9999-12-31T00:00:00Z`);function dt(e){let t=Date.parse(e+`T00:00:00Z`);if(!Number.isFinite(t)||t<lt||t>ut||new Date(t).toISOString().slice(0,10)!==e)throw RangeError(`Expected a Gregorian date in YYYY-MM-DD form.`);return t}function ft(e,t=0){let n=new Date(e);return n.setUTCMonth(n.getUTCMonth()+t,1)}function pt(e,t){let n=ft(e,t)+(new Date(e).getUTCDate()-1)*G;return Math.min(n,ft(e,t+1)-G)}function mt(){let e=new Date;return Date.UTC(e.getFullYear(),e.getMonth(),e.getDate())}function ht({onChange:e,...t}){return(0,U.jsx)(gt,{...t,onSelect:n=>{n!==t.value&&e(n)}})}function gt({value:e,onSelect:t,label:n,labels:r,locale:i,defaultMonth:a,min:s,max:c,weekStartsOn:l=1,className:u,focusOnOpen:d=!1}){let f=e===null?null:dt(e),p=a===void 0?null:dt(a+`-01`),m=s===void 0?lt:dt(s),h=c===void 0?ut:dt(c);if(m>h)throw RangeError(`Calendar min must not exceed max.`);let g=e=>Math.max(m,Math.min(h,e)),[_,v]=(0,W.useState)(null);(0,W.useEffect)(()=>{v(mt())},[]);let[y,b]=(0,W.useState)({value:e,day:f??p});y.value!==e&&b({value:e,day:f??y.day});let x=y.day??_,S=(0,W.useRef)(d),C=(0,W.useId)(),w=(0,W.useMemo)(()=>{let e={timeZone:`UTC`,calendar:`gregory`};return{month:new Intl.DateTimeFormat(i,{...e,month:`long`,year:`numeric`}),weekday:new Intl.DateTimeFormat(i,{...e,weekday:`short`}),weekdayName:new Intl.DateTimeFormat(i,{...e,weekday:`long`}),date:new Intl.DateTimeFormat(i,{...e,dateStyle:`full`}),number:new Intl.NumberFormat(i)}},[i]),T=o(`elea-calendar`,u);if(x===null)return(0,U.jsx)(`fieldset`,{className:T,"aria-label":n,"aria-busy":`true`});let E=g(x),D=ft(E),O=ft(E,1),k=D-(new Date(D).getUTCDay()-l+7)%7*G,A=Array.from({length:7},(e,t)=>k+t*G),ee=Math.ceil((O-k)/(7*G));function te(t,n){if(t.altKey||t.ctrlKey||t.metaKey)return;let r=(new Date(n).getUTCDay()-l+7)%7,i;switch(t.key){case`ArrowLeft`:case`ArrowRight`:{let e=getComputedStyle(t.currentTarget).direction===`rtl`;i=n+(t.key===(e?`ArrowLeft`:`ArrowRight`)?G:-864e5);break}case`ArrowDown`:i=n+7*G;break;case`ArrowUp`:i=n-7*G;break;case`Home`:i=n-r*G;break;case`End`:i=n+(6-r)*G;break;case`PageUp`:i=pt(n,t.shiftKey?-12:-1);break;case`PageDown`:i=pt(n,t.shiftKey?12:1);break;default:return}t.preventDefault(),g(i)!==n&&(S.current=!0,b({value:e,day:g(i)}))}function j(t,n){let r=g(pt(E,t));return(0,U.jsx)(`button`,{type:`button`,className:`elea-calendar__step`,"aria-label":n,disabled:ft(r)===D,onClick:()=>{S.current=ft(r)===ft(t<0?m:h),b({value:e,day:r})},children:(0,U.jsx)(`svg`,{"aria-hidden":`true`,width:`16`,height:`16`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,U.jsx)(`path`,{d:t<0?`m15 6-6 6 6 6`:`m9 6 6 6-6 6`})})})}function ne(n){return n<D||n>=O?(0,U.jsx)(`td`,{role:`gridcell`},n):(0,U.jsx)(`td`,{role:`gridcell`,"aria-selected":n===f,children:(0,U.jsx)(`button`,{type:`button`,className:`elea-calendar__day`,disabled:n<m||n>h,tabIndex:n===E?0:-1,"aria-label":w.date.format(n),"aria-current":n===_?`date`:void 0,"data-elea-focus":d&&n===E?!0:void 0,ref:e=>{e&&n===E&&S.current&&(S.current=!1,e.focus())},onKeyDown:e=>te(e,n),onClick:()=>{b({value:e,day:n}),t(new Date(n).toISOString().slice(0,10))},children:w.number.format(new Date(n).getUTCDate())})},n)}return(0,U.jsxs)(`fieldset`,{className:T,"aria-label":n,lang:i,children:[(0,U.jsxs)(`div`,{className:`elea-calendar__header`,children:[(0,U.jsx)(`span`,{id:C,"aria-live":`polite`,"aria-atomic":`true`,children:w.month.format(D)}),j(-1,r.previousMonth),j(1,r.nextMonth)]}),(0,U.jsxs)(`table`,{role:`grid`,"aria-label":n,"aria-describedby":C,children:[(0,U.jsx)(`thead`,{children:(0,U.jsx)(`tr`,{children:A.map(e=>(0,U.jsx)(`th`,{scope:`col`,abbr:w.weekdayName.format(e),children:w.weekday.format(e)},e))})}),(0,U.jsx)(`tbody`,{children:Array.from({length:ee},(e,t)=>(0,U.jsx)(`tr`,{children:A.map(e=>ne(e+t*7*G))},t))})]})]})}function _t(e){let t=new Map;for(let n of e){let e=t.get(n.group);e?e.push(n):t.set(n.group,[n])}return t}function vt(){return(0,U.jsxs)(`svg`,{"aria-hidden":`true`,viewBox:`0 0 24 24`,width:`1em`,height:`1em`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,children:[(0,U.jsx)(`circle`,{cx:`10.5`,cy:`10.5`,r:`6.5`}),(0,U.jsx)(`path`,{d:`m16 16 4.5 4.5`})]})}function yt({options:e,value:t,onChange:n,label:r,labels:i,placeholder:a,creatable:s,max:c=1/0,renderOption:l,id:d,name:f,className:p,disabled:m,required:h,...g}){let v=(0,W.useId)(),y=d??v,b=`${y}-listbox`,x=(0,W.useRef)(null),S=(0,W.useRef)(null),C=(0,W.useRef)(null),w=(0,W.useRef)(!1),[T,E]=(0,W.useState)(!1),[D,O]=(0,W.useState)(``),[k,j]=(0,W.useState)(null),M=T&&!m,N=new Set(t),P=new Map(e.map(e=>[e.value,e]));for(let e of N)P.has(e)||P.set(e,{label:e,value:e});let re=Array.from(P.values()),ie=D.trim(),ae=ie.toLowerCase(),oe=re.filter(e=>e.label.toLowerCase().includes(ae)||e.value.toLowerCase()===ae),se=s&&ie&&!re.some(e=>[e.label,e.value].some(e=>e.toLowerCase()===ae))?{value:ie,label:i.create?.(ie)??ie}:void 0,F=_t(oe),I=Array.from(F.values()).flat();se&&I.push(se);let L=Math.max(0,Math.floor(c)),ce=e=>!!e.disabled||!N.has(e.value)&&N.size>=L,R=I.filter(e=>!ce(e)),z=R.find(e=>e.value===k)??R[0],le=new Map(I.map((e,t)=>[e.value,t])),ue=z?`${b}-${le.get(z.value)}`:void 0;function B(){E(!1),O(``),j(null)}(0,W.useEffect)(()=>{if(m&&B(),M)return A(S.current,C.current,B)},[m,M]),(0,W.useEffect)(()=>{let e=ue?C.current?.ownerDocument.getElementById(ue):null;e?.parentElement&&ee(C.current,Array.from(e.parentElement.children).indexOf(e),e.parentElement)},[M,ue]);function de(e){m||P.get(e)?.disabled||(x.current?.focus(),n(t.filter(t=>t!==e)))}function fe(e){m||ce(e)||(N.has(e.value)?de(e.value):n([...t,e.value]),O(``),j(e.value),x.current?.focus())}function pe(e){let t=e===1?R[0]:R.at(-1),n=z?R.indexOf(z):-1,r=M&&n>=0?R.at((n+e)%R.length):t;j(r?.value??null),E(!0)}function me(e){S.current?.parentElement?.contains(e.relatedTarget)||(w.current=!1,B())}function he(e){e.key!==`Escape`||!M||w.current||_(e)||(e.preventDefault(),e.stopPropagation(),B(),x.current?.focus())}function ge(e){if(m||w.current||_(e))return;let{key:n}=e;if(n===`ArrowDown`||n===`ArrowUp`)e.preventDefault(),pe(n===`ArrowDown`?1:-1);else if(M&&n===`Enter`)e.preventDefault(),z&&fe(z);else if(n===`Backspace`&&!D){let n=[...t].reverse().find(e=>!P.get(e)?.disabled);n!==void 0&&(e.preventDefault(),de(n))}else he(e)}let _e=e=>{let t=N.has(e.value),n=ce(e);return(0,U.jsx)(te,{id:`${b}-${le.get(e.value)}`,label:e.label,active:e===z,multiple:!0,selected:t,disabled:n,prefix:e===se?(0,U.jsx)(`span`,{"aria-hidden":`true`,children:`+`}):void 0,onActivate:()=>j(e.value),onPick:()=>fe(e),children:e!==se&&l?l(e,{selected:t,disabled:n}):e.label},e.value)},ve=h&&!N.size?{required:!0,pattern:`(?!)`}:{};return(0,U.jsxs)(`div`,{className:o(`elea-ui-select`,`elea-multi-select`,p),children:[(0,U.jsxs)(`div`,{ref:S,className:o(`elea-ui-select__trigger`,`elea-multi-select__trigger`,g[`aria-invalid`]&&g[`aria-invalid`]!==`false`&&`elea-ui-select__trigger--invalid`),"data-disabled":m||void 0,children:[Array.from(N,e=>{let t=P.get(e);return(0,U.jsx)(`button`,{type:`button`,disabled:m||t.disabled,className:`elea-multi-select__tag`,"aria-label":i.remove(t.label),onBlur:me,onKeyDown:he,onClick:()=>de(e),children:(0,U.jsxs)(u,{tone:`primary`,size:`sm`,children:[(0,U.jsx)(`span`,{className:`elea-multi-select__tag-label`,children:t.label}),(0,U.jsx)(`span`,{"aria-hidden":`true`,children:`×`})]})},e)}),(0,U.jsxs)(`label`,{className:`elea-multi-select__search`,htmlFor:y,children:[(0,U.jsx)(vt,{}),(0,U.jsx)(`input`,{...g,ref:x,id:y,role:`combobox`,"aria-label":r,"aria-required":h||void 0,"aria-autocomplete":`list`,"aria-expanded":M,"aria-controls":M?b:void 0,"aria-activedescendant":M?ue:void 0,disabled:m,...ve,placeholder:a??r,value:D,autoComplete:`off`,onClick:()=>E(!0),onChange:e=>{O(e.currentTarget.value),j(null),E(!0)},onCompositionStart:()=>{w.current=!0},onCompositionEnd:()=>{w.current=!1},onBlur:me,onKeyDown:ge})]})]}),M&&(0,U.jsxs)(`div`,{ref:C,className:`elea-ui-select__list`,tabIndex:-1,children:[(0,U.jsxs)(ne,{id:b,"aria-label":r,multiple:!0,children:[Array.from(F,([e,t])=>e===void 0?t.map(_e):(0,U.jsxs)(`fieldset`,{className:`elea-multi-select__group`,children:[(0,U.jsx)(`legend`,{children:e}),t.map(_e)]},`group:${e}`)),se&&_e(se)]}),!I.length&&(0,U.jsx)(`output`,{htmlFor:y,className:`elea-multi-select__empty`,children:i.empty}),!ae&&i.selectGroup&&Array.from(F,([e,r])=>{if(e===void 0)return null;let a=r.filter(e=>!e.disabled&&!N.has(e.value));return(0,U.jsx)(`button`,{type:`button`,className:`elea-multi-select__bulk`,onBlur:me,onKeyDown:he,disabled:!a.length||N.size+a.length>L,onClick:()=>{x.current?.focus(),n([...t,...a.map(e=>e.value)])},children:i.selectGroup(e)},e)})]}),f&&Array.from(N,e=>(0,U.jsx)(`input`,{type:`hidden`,name:f,value:e,disabled:m},e))]})}function bt(e,t,n,r){let i=(0,W.useId)(),a=e?.defaultValue??``,[o,s]=(0,W.useState)(a),[c,l]=(0,W.useState)(t);c!==t&&(l(t),t&&s(a));let u=o.trim(),d=e!==void 0&&(e.required===!0&&u===``||e.expected!==void 0&&u!==e.expected),f=()=>{d||n||(e?r(u):r())},p={onClick:f,disabled:d,"aria-describedby":d?`${i}-label`:void 0};if(!e)return{control:null,button:p};let m=t=>{t.key!==`Enter`||t.nativeEvent.isComposing||e.multiline&&!t.ctrlKey&&!t.metaKey||(t.preventDefault(),f())},h=e.multiline?y:b;return{control:(0,U.jsxs)(`div`,{className:`elea-field`,children:[(0,U.jsxs)(`label`,{id:`${i}-label`,htmlFor:i,className:`elea-field__label`,children:[e.label,e.required&&(0,U.jsx)(`span`,{className:`elea-field__required`,"aria-hidden":`true`,children:`*`})]}),(0,U.jsx)(h,{id:i,value:o,onChange:e=>s(e.target.value),onKeyDown:m,placeholder:e.placeholder,maxLength:e.maxLength,required:e.required,disabled:n,"data-elea-focus":``})]}),button:p}}var xt=x(),St=`a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])`;function Ct(e){return e.querySelector(`[data-elea-focus]:not(:disabled)`)??e.querySelector(`a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])`)??e}function wt(e,t){let n=Array.from(t.querySelectorAll(St)),r=n.at(e.shiftKey?0:-1);(!r||document.activeElement===r||e.shiftKey&&document.activeElement===t)&&(e.preventDefault(),n.at(e.shiftKey?-1:0)?.focus())}var Tt=[],Et=``;function Dt(e,t){let[n,r]=(0,W.useState)(!1),i=(0,W.useRef)(null),a=(0,W.useRef)(t),o=n&&e;return(0,W.useEffect)(()=>{r(!0)},[]),(0,W.useEffect)(()=>{a.current=t},[t]),(0,W.useEffect)(()=>{if(!o)return;let e=i.current,t={opener:document.activeElement};e&&Ct(e).focus();let n=n=>{Tt.at(-1)!==t||n.defaultPrevented||(n.key===`Escape`?(n.preventDefault(),a.current()):n.key===`Tab`&&e&&wt(n,e))};return Tt.length===0&&(Et=document.body.style.overflow),Tt.push(t),document.addEventListener(`keydown`,n),document.body.style.overflow=`hidden`,()=>{let r=Tt.indexOf(t),i=Tt[r+1];i&&e?.contains(i.opener)&&(i.opener=t.opener),Tt.splice(r,1),document.removeEventListener(`keydown`,n),Tt.length===0&&(document.body.style.overflow=Et),i||t.opener?.focus?.()}},[o]),{visible:o,panelRef:i}}var Ot=(0,W.createContext)(null);function kt(){let e=(0,W.useContext)(Ot);if(!e)throw Error(`Dialog parts must be rendered inside <DialogRoot> or <SheetRoot>`);return e}function At({open:e,onClose:t,prefix:n,backdropClassName:r,className:i,dismissOnBackdrop:a=!0,motion:s,children:c}){let{visible:l,panelRef:u}=Dt(e,t),f=(0,W.useId)(),p=(0,W.useId)(),[m,h]=(0,W.useState)(!1),g=(0,W.useMemo)(()=>({prefix:n,titleId:f,descriptionId:p,onClose:t,describe:h}),[n,f,p,t]),[_,v]=(0,W.useState)(!1),[y,b]=S(l||_),x=d(s)??b[`data-elea-motion`],C=!l&&_&&x===`on`,w=(0,W.useRef)(null);(0,W.useEffect)(()=>{l&&x===`on`?w.current={backdropClassName:r,className:i,children:c}:C||(w.current=null)},[l,C,x,r,i,c]),(0,W.useEffect)(()=>{if(l||!C){v(l&&x===`on`);return}let e=(u.current?.parentElement)?.getAnimations?.().find(e=>`transitionProperty`in e&&e.transitionProperty===`opacity`);if(!e){v(!1);return}let t=!0,n=()=>{t&&v(!1)};return e.finished.then(n,n),()=>{t=!1}},[l,C,x,u]);let T=(0,U.jsx)(`template`,{ref:y});if(!l&&!C)return T;let E=C&&w.current?w.current:{backdropClassName:r,className:i,children:c},D=(0,xt.createPortal)((0,U.jsx)(`div`,{className:o(`${n}-backdrop`,E.backdropClassName),...b,"data-elea-motion":x,"data-state":C?`closing`:`open`,"aria-hidden":C||void 0,ref:e=>{e?.toggleAttribute(`inert`,C)},onMouseDown:e=>{l&&a&&e.target===e.currentTarget&&t()},children:(0,U.jsx)(`div`,{ref:u,role:`dialog`,"aria-modal":`true`,"aria-labelledby":f,"aria-describedby":m?p:void 0,className:o(n,E.className),tabIndex:-1,children:(0,U.jsx)(Ot.Provider,{value:g,children:E.children})})}),document.body);return(0,U.jsxs)(U.Fragment,{children:[T,D]})}function jt({size:e=`md`,scroll:t=`surface`,className:n,...r}){return(0,U.jsx)(At,{...r,prefix:`elea-dialog`,className:o(`elea-dialog--${e}`,t===`body`&&`elea-dialog--scroll-body`,n)})}function Mt({className:e,children:t}){let{prefix:n}=kt();return(0,U.jsx)(`div`,{className:o(`${n}__header`,e),children:t})}function Nt({className:e,children:t}){let{prefix:n,titleId:r}=kt();return(0,U.jsx)(`h2`,{id:r,className:o(`${n}__title`,e),children:t})}function Pt({label:e,className:t}){let{prefix:n,onClose:r}=kt();return(0,U.jsx)(`button`,{type:`button`,className:o(`${n}__close`,t),onClick:r,"aria-label":e,title:e,children:(0,U.jsx)(`svg`,{viewBox:`0 0 24 24`,width:`1em`,height:`1em`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,"aria-hidden":`true`,children:(0,U.jsx)(`path`,{d:`M18 6 6 18M6 6l12 12`})})})}function Ft({className:e,children:t}){let{prefix:n,descriptionId:r,describe:i}=kt();return(0,W.useEffect)(()=>(i(!0),()=>i(!1)),[i]),(0,U.jsx)(`p`,{id:r,className:o(`${n}__description`,e),children:t})}function It({className:e,children:t}){let{prefix:n}=kt();return(0,U.jsx)(`div`,{className:o(`${n}__body`,e),children:t})}function Lt({className:e,children:t}){let{prefix:n}=kt();return(0,U.jsx)(`div`,{className:o(`${n}__actions`,e),children:t})}function Rt({title:e,description:t,children:n,actions:r,closeLabel:i,...a}){return(0,U.jsxs)(jt,{...a,children:[(0,U.jsxs)(Mt,{children:[(0,U.jsx)(Nt,{children:e}),(0,U.jsx)(Pt,{label:i})]}),t&&(0,U.jsx)(Ft,{children:t}),n&&(0,U.jsx)(It,{children:n}),r&&(0,U.jsx)(Lt,{children:r})]})}function zt({onConfirm:e,onCancel:t,confirmLabel:n,cancelLabel:r,field:i,tone:a=`primary`,icon:o,loading:s=!1,title:c,...l}){let{control:u,button:d}=bt(i,l.open,s,e);return(0,U.jsx)(Rt,{...l,title:o?(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`span`,{className:`elea-dialog__icon elea-dialog__icon--${a}`,"aria-hidden":`true`,children:o}),c]}):c,onClose:t,actions:(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(m,{variant:`outline`,onClick:t,disabled:s,children:r}),(0,U.jsx)(m,{variant:a,...d,loading:s,children:n})]}),children:u})}function Bt(e,t){return t===void 0?e.parentElement?.querySelector(`[aria-controls="${e.id}"]`)??e.parentElement:t}function Vt({open:e,anchor:t,side:n,align:r,onDismiss:i,modal:a=!1}){let o=(0,W.useRef)(null),s=(0,W.useRef)(null),c=(0,W.useRef)({anchor:t,side:n,align:r,onDismiss:i}),l=e&&t!==null;return(0,W.useEffect)(()=>{c.current={anchor:t,side:n,align:r,onDismiss:i}}),(0,W.useEffect)(()=>{let e=o.current;if(!l||!e)return;Ct(e).focus();let t=t=>{let n=t.target;!e.contains(n)&&!s.current?.contains(n)&&c.current.onDismiss()},n=t=>{let n=Bt(e,c.current.anchor);!n||t&&C(n,t.target)?c.current.onDismiss():E(e,n,c.current.side,c.current.align)},r=typeof ResizeObserver>`u`?void 0:new ResizeObserver(()=>n());return r?.observe(e),document.addEventListener(`mousedown`,t),window.addEventListener(`scroll`,n,!0),window.addEventListener(`resize`,n),()=>{r?.disconnect(),document.removeEventListener(`mousedown`,t),window.removeEventListener(`scroll`,n,!0),window.removeEventListener(`resize`,n);let e=document.activeElement;(!e||e===document.body)&&s.current?.isConnected&&s.current.focus()}},[l]),{shown:l,panel:{ref:e=>{o.current=e;let i=e&&Bt(e,t);e&&i&&(s.current=w(i),E(e,i,n,r))},onClick:e=>e.stopPropagation()},panelRef:o,handlers:{onKeyDown:e=>{l&&(e.key===`Tab`&&a&&o.current&&wt(e,o.current),e.key===`Escape`&&(e.preventDefault(),e.stopPropagation(),i()))},onBlur:e=>{let t=e.relatedTarget;l&&!a&&t&&!e.currentTarget.contains(t)&&!s.current?.contains(t)&&i()}}}}var Ht=(e,t)=>`elea-popover__panel elea-popover__panel--${e} elea-popover__panel--${t}`;function Ut({trigger:e,anchor:t,children:n,label:r,open:i,defaultOpen:a=!1,onOpenChange:s,side:c=`bottom`,align:l=`start`,className:u}){let[d,f]=(0,W.useState)(a),p=(0,W.useId)(),m=i??d,h=e=>{i===void 0&&f(e),s?.(e)},g=()=>h(!1),{shown:_,panel:v,handlers:y}=Vt({open:m,anchor:e?void 0:t??null,side:c,align:l,onDismiss:g}),b=_&&(0,U.jsx)(`div`,{...v,id:p,role:`dialog`,"aria-label":r,tabIndex:-1,className:o(Ht(c,l),!e&&u),...e?{}:y,children:typeof n==`function`?n({close:g}):n});return e?(0,U.jsxs)(`div`,{className:o(`elea-popover`,u),...y,children:[e({"aria-haspopup":`dialog`,"aria-expanded":m,"aria-controls":p,onClick:()=>h(!m)}),b]}):b||null}function Wt({anchor:e,open:t,title:n,description:r,confirmLabel:i,cancelLabel:a,onConfirm:s,onCancel:c,field:l,loading:u=!1,tone:d=`primary`,icon:f,side:p=`bottom`,align:h=`start`,className:g}){let _=(0,W.useId)(),{shown:v,panel:y,panelRef:b,handlers:x}=Vt({open:t,anchor:e,side:p,align:h,onDismiss:c,modal:!0}),{control:S,button:C}=bt(l,v,u,s);return(0,W.useEffect)(()=>{v&&u&&b.current?.focus()},[v,u,b]),v?(0,U.jsxs)(`div`,{...y,id:_,role:`alertdialog`,"aria-modal":`true`,"aria-labelledby":`${_}-title`,"aria-describedby":r?`${_}-description`:void 0,tabIndex:-1,className:o(Ht(p,h),g),...x,children:[(0,U.jsxs)(`p`,{id:`${_}-title`,className:`elea-popover__title`,children:[f&&(0,U.jsx)(`span`,{className:`elea-popover__icon elea-popover__icon--${d}`,"aria-hidden":`true`,children:f}),n]}),r&&(0,U.jsx)(`p`,{id:`${_}-description`,className:`elea-popover__description`,children:r}),S,(0,U.jsxs)(`div`,{className:`elea-popover__actions`,children:[(0,U.jsx)(m,{size:`sm`,variant:`outline`,onClick:c,disabled:u,children:a}),(0,U.jsx)(m,{size:`sm`,variant:d,...C,loading:u,children:i})]})]}):null}var Gt={day:2,month:2,year:4},Kt=e=>e===`day`||e===`month`||e===`year`;function qt(e){return{year:e?.slice(0,4)??``,month:e?.slice(5,7)??``,day:e?.slice(8)??``}}function Jt({day:e,month:t,year:n},r,i){if(n.length!==4||t.length!==2||e.length!==2||n===`0000`)return null;let a=`${n}-${t}-${e}`,o=new Date(a+`T00:00:00Z`);return Number.isNaN(o.getTime())||o.toISOString().slice(0,10)!==a||r&&a<r||i&&a>i?null:a}function Yt(e){let t=new Intl.DateTimeFormat(e,{calendar:`gregory`,timeZone:`UTC`,day:`2-digit`,month:`2-digit`,year:`numeric`}),n=t.formatToParts(0),r=n.map(e=>e.type).filter(Kt),i=new Intl.NumberFormat(e,{useGrouping:!1,numberingSystem:t.resolvedOptions().numberingSystem}),a=Array.from({length:10},(e,t)=>i.format(t));return{parts:n,order:r,digits:a,ascii:e=>Array.from(e,e=>a.includes(e)?String(a.indexOf(e)):e).join(``)}}function Xt(e,t,n,r){let i={day:31,month:12,year:9999}[t],a=Math.min(i,Math.max(1,Number(e[t])+n)),o={...e,[t]:String(a).padStart(Gt[t],`0`)};if(r){let e=new Date(`${o.year}-${o.month}-01T00:00:00Z`);e.setUTCMonth(e.getUTCMonth()+1,0),o.day=String(Math.min(Number(o.day),e.getUTCDate())).padStart(2,`0`)}return o}function Zt(e,t){return n=>(0,U.jsx)(p,{...n,label:e,size:`sm`,disabled:t,children:(0,U.jsxs)(`svg`,{"aria-hidden":`true`,width:`18`,height:`18`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.75`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,U.jsx)(`rect`,{x:`3`,y:`5`,width:`18`,height:`16`,rx:`2`}),(0,U.jsx)(`path`,{d:`M7 3v4m10-4v4M3 11h18`})]})})}var Qt=(0,W.forwardRef)(function({value:e,onChange:t,locale:n,labels:r,label:i,id:a,name:s,min:c,max:l,weekStartsOn:u,required:d,disabled:f,className:p,"aria-describedby":m,"aria-invalid":h},g){let _=(0,W.useId)(),v=a??_,{parts:y,order:b,digits:x,ascii:S}=(0,W.useMemo)(()=>Yt(n),[n]),C=(0,W.useRef)(null),[w,T]=(0,W.useState)(!1);f&&w&&T(!1);let[E,D]=(0,W.useState)(null);E&&e!==null&&D(null);let O=e===null&&E?E:qt(e),k=Object.values(O).some(Boolean),A=Jt(O,c,l),ee=k&&!A,te=ee&&b.every(e=>O[e].length===Gt[e]);function j(n){let r=Jt(n,c,l);D(r?null:n),e!==r&&t(r)}function ne(e,t){let n=b[b.indexOf(e)+t];if(!n)return!1;let r=C.current?.querySelector(`[data-segment="${n}"]`);return r?.focus(),!!r}function M(e,t){if(e.altKey||e.ctrlKey||e.metaKey||e.shiftKey)return;let n=e.currentTarget;if(e.key===`ArrowLeft`||e.key===`ArrowRight`){let r=e.key===`ArrowRight`!=(getComputedStyle(n).direction===`rtl`);(r?n.selectionEnd===n.value.length:n.selectionStart===0)&&ne(t,r?1:-1)&&e.preventDefault();return}if(e.key!==`ArrowUp`&&e.key!==`ArrowDown`)return;e.preventDefault();let r=Xt(O,t,e.key===`ArrowUp`?1:-1,!!A);(!A||Jt(r,c,l))&&(j(r),n.select())}function N(n){D(null),n!==e&&t(n),T(!1)}return(0,U.jsxs)(`fieldset`,{ref:C,"aria-label":i,lang:n,className:o(`elea-date-field`,p),children:[(0,U.jsxs)(`div`,{className:o(`elea-date-field__control`,`elea-ui-input`,!!(te||h===!0||h===`true`)&&`elea-ui-input--invalid`),children:[(0,U.jsx)(`div`,{className:`elea-date-field__segments`,children:y.map(({type:e,value:t},n)=>{if(!Kt(e))return(0,U.jsx)(`span`,{"aria-hidden":`true`,children:t},`${e}-${n}`);let i=e===b[0];return(0,U.jsx)(`input`,{ref:i?g:void 0,id:i?v:`${v}-${e}`,"data-segment":e,"aria-label":r[e],"aria-describedby":m,"aria-invalid":h||te||void 0,inputMode:`numeric`,autoComplete:`off`,required:d,disabled:f,pattern:ee?`(?!)`:void 0,placeholder:`–`.repeat(Gt[e]),value:Array.from(O[e],e=>x[Number(e)]).join(``),onFocus:e=>e.currentTarget.select(),onMouseDown:e=>{e.button===0&&(e.preventDefault(),e.currentTarget.focus(),e.currentTarget.select())},onKeyDown:t=>M(t,e),onBlur:t=>{let n=S(t.currentTarget.value);e!==`year`&&n.length===1&&j({...O,[e]:n.padStart(2,`0`)})},onChange:t=>{let n=S(t.target.value);/\D/u.test(n)||n.length>Gt[e]||(j({...O,[e]:n}),n.length===Gt[e]&&ne(e,1))}},e)})}),(0,U.jsx)(Ut,{align:`end`,open:w,onOpenChange:T,label:r.openCalendar,trigger:Zt(r.openCalendar,f),children:(0,U.jsx)(gt,{focusOnOpen:!0,label:i,locale:n,labels:r,value:e,min:c,max:l,weekStartsOn:u,onSelect:N})})]}),s&&(0,U.jsx)(`input`,{type:`hidden`,name:s,value:A??``,disabled:f})]})});function $t({side:e=`end`,size:t=`md`,className:n,...r}){return(0,U.jsx)(At,{...r,prefix:`elea-sheet`,backdropClassName:`elea-sheet-backdrop--${e}`,className:o(`elea-sheet--${e}`,`elea-sheet--${t}`,n)})}function en({title:e,description:t,children:n,actions:r,closeLabel:i,...a}){return(0,U.jsxs)($t,{...a,children:[(0,U.jsxs)(Mt,{children:[(0,U.jsx)(Nt,{children:e}),(0,U.jsx)(Pt,{label:i})]}),t&&(0,U.jsx)(Ft,{children:t}),(0,U.jsx)(It,{children:n}),r&&(0,U.jsx)(Lt,{children:r})]})}var tn=(0,W.createContext)(null);function nn(){let e=(0,W.useContext)(tn);if(!e)throw Error(`Menu parts must be rendered inside <MenuRoot>`);return e}function rn({className:e,children:t}){let[n,r]=(0,W.useState)(!1),[i,a]=(0,W.useState)(`first`),s=(0,W.useRef)(null),c=(0,W.useId)();(0,W.useEffect)(()=>{if(!n)return;let e=e=>{s.current?.contains(e.target)||r(!1)};return document.addEventListener(`mousedown`,e),()=>document.removeEventListener(`mousedown`,e)},[n]);let l=(0,W.useMemo)(()=>({id:c,open:n,edge:i,show(e){a(e),r(!0)},close(e=!1){r(!1),e&&s.current?.querySelector(`[aria-haspopup="menu"]`)?.focus()}}),[c,n,i]);return(0,U.jsx)(tn.Provider,{value:l,children:(0,U.jsx)(`div`,{ref:s,className:o(`elea-menu`,e),children:t})})}function an({children:e}){let{id:t,open:n,show:r,close:i}=nn();return(0,U.jsx)(U.Fragment,{children:e({"aria-haspopup":`menu`,"aria-expanded":n,"aria-controls":t,onClick:()=>n?i():r(`first`),onKeyDown:e=>{e.key===`ArrowDown`||e.key===`Enter`||e.key===` `?(e.preventDefault(),r(`first`)):e.key===`ArrowUp`&&(e.preventDefault(),r(`last`))}})})}function on({label:e,align:t=`start`,header:n,className:r,children:i}){let{id:a,open:s,edge:c,close:l}=nn(),u=(0,W.useRef)(null),d=()=>Array.from(u.current?.querySelectorAll(`[role="menuitem"]:not(:disabled, [aria-disabled])`)??[]);(0,W.useEffect)(()=>{s&&d().at(c===`first`?0:-1)?.focus()},[s,c]);let f=e=>{if(e.key===`Tab`)return l();let t=d(),n=t.indexOf(document.activeElement),r;if(e.key===`ArrowDown`)r=t[(n+1)%t.length];else if(e.key===`ArrowUp`)r=t.at(n<0?-1:n-1);else if(e.key===`Home`)r=t[0];else if(e.key===`End`)r=t.at(-1);else if(e.key!==`Escape`)return;e.preventDefault(),e.key===`Escape`?l(!0):r?.focus()};if(!s)return null;let p=n==null?void 0:`${a}-header`;return(0,U.jsxs)(`div`,{ref:u,id:a,role:`menu`,"aria-label":e,"aria-describedby":p,className:o(`elea-menu__list`,`elea-menu__list--${t}`,r),onKeyDown:f,children:[p&&(0,U.jsx)(`div`,{id:p,className:`elea-menu__header`,children:n}),i]})}function K({onSelect:e,icon:t,disabled:n,danger:r,className:i,children:a,...s}){let{close:c}=nn(),l=(0,U.jsxs)(U.Fragment,{children:[t&&(0,U.jsx)(`span`,{className:`elea-menu__icon`,"aria-hidden":`true`,children:t}),(0,U.jsx)(`span`,{children:a})]}),u={role:`menuitem`,className:o(`elea-menu__item`,r&&`elea-menu__item--danger`,i),tabIndex:-1,onClick:()=>{c(!0),e?.()}};if(s.href!==void 0){if(n)return(0,U.jsx)(`span`,{role:`menuitem`,className:u.className,"aria-disabled":`true`,children:l});let e={...u,href:s.href,onMouseEnter:e=>e.currentTarget.focus(),onKeyDown:e=>{e.key===` `&&(e.preventDefault(),e.currentTarget.click())}};return s.render?s.render({...e,children:l}):(0,U.jsx)(`a`,{...e,children:l})}return(0,U.jsx)(`button`,{...u,type:`button`,disabled:n,onMouseEnter:e=>e.currentTarget.focus(),children:l})}function sn(){return(0,U.jsx)(`hr`,{className:`elea-menu__separator`})}function cn({label:e,children:t}){return(0,U.jsxs)(`fieldset`,{className:`elea-menu__group`,children:[(0,U.jsx)(`legend`,{className:`elea-menu__group-label`,children:e}),t]})}function ln({trigger:e,items:t,label:n,align:r,header:i,className:a}){return(0,U.jsxs)(rn,{className:a,children:[(0,U.jsx)(an,{children:e}),(0,U.jsx)(on,{label:n,align:r,header:i,children:t.map(({id:e,label:t,...n})=>(0,U.jsx)(K,{...n,children:t},e))})]})}var un=4,dn=8;function fn(e,t){let n=e.parentElement;if(!n)return;`showPopover`in e&&!e.hasAttribute(`popover`)&&(e.setAttribute(`popover`,`manual`),e.showPopover());let r=pn(n,e),{offsetWidth:i,offsetHeight:a}=e,o=r.top-a-un,s=r.bottom+un,c=o>=dn,l=s+a<=window.innerHeight-dn,u=t===`top`?c||!l:c&&!l;e.dataset.side=u?`top`:`bottom`,e.style.top=`${u?o:s}px`,e.style.left=`${Math.max(dn,Math.min((r.left+r.right)/2-i/2,window.innerWidth-i-dn))}px`}function pn(e,t){let n=document.createRange(),r=[...e.childNodes].filter(e=>e!==t).map(e=>e.nodeType===1?e.getBoundingClientRect():(n.selectNodeContents(e),`getBoundingClientRect`in n?n.getBoundingClientRect():void 0)).filter(e=>e&&(e.width||e.height));return r.length?{top:Math.min(...r.map(e=>e.top)),bottom:Math.max(...r.map(e=>e.bottom)),left:Math.min(...r.map(e=>e.left)),right:Math.max(...r.map(e=>e.right))}:e.getBoundingClientRect()}function mn({content:e,children:t,placement:n=`top`,className:r}){let[i,a]=(0,W.useState)(!1),s=(0,W.useId)();(0,W.useEffect)(()=>{if(!i)return;let e=()=>a(!1);window.addEventListener(`scroll`,e,!0),window.addEventListener(`resize`,e);let t=t=>{t.key===`Escape`&&e()};return document.addEventListener(`keydown`,t,!0),()=>{document.removeEventListener(`keydown`,t,!0),window.removeEventListener(`scroll`,e,!0),window.removeEventListener(`resize`,e)}},[i]);let c=t;if(i&&(0,W.isValidElement)(t)&&t.type!==W.Fragment){let e=t.props[`aria-describedby`];c=(0,W.cloneElement)(t,{"aria-describedby":typeof e==`string`&&e?`${e} ${s}`:s})}return(0,U.jsxs)(`span`,{className:o(`elea-tooltip`,r),onMouseEnter:()=>a(!0),onMouseLeave:()=>a(!1),onFocus:()=>a(!0),onBlur:()=>a(!1),children:[c,i&&(0,U.jsx)(`span`,{ref:e=>{e&&fn(e,n)},id:s,role:`tooltip`,className:`elea-tooltip__bubble`,children:e})]})}function hn(e,t){return typeof t==`string`?e.findIndex(e=>e.id===t):Number.isInteger(t)&&t>=0&&t<e.length?t:-1}function gn(e,t){if(e.altKey||e.ctrlKey||e.metaKey||e.shiftKey)return;let n=e.currentTarget,r=Array.from(n.closest(`ol`).querySelectorAll(`:scope > li > .elea-stepper__item > .elea-stepper__body > .elea-stepper__button:enabled`)),i=r.indexOf(n),a=t===`horizontal`&&getComputedStyle(n).direction===`rtl`?-1:1,o=t===`vertical`?`ArrowUp`:`ArrowLeft`,s=t===`vertical`?`ArrowDown`:`ArrowRight`,c;switch(e.key){case`Home`:c=0;break;case`End`:c=r.length-1;break;case o:c=i-a;break;case s:c=i+a;break;default:return}e.preventDefault(),r[c]?.focus()}var _n=(0,W.forwardRef)(function({label:e,steps:t,current:n,onSelect:r,orientation:i=`horizontal`,linear:a=!1,indicator:s,connector:c,className:l,...u},d){let f=(0,W.useId)(),p=hn(t,n);return t.length===0?null:(0,U.jsx)(`nav`,{...u,ref:d,className:o(`elea-stepper`,l),"data-orientation":i,"data-indicator":s,"data-connector":c,"aria-label":e,children:(0,U.jsx)(`ol`,{className:`elea-stepper__list`,children:t.map((e,t)=>{let n=t===p,o=t<p,s=`upcoming`;n?s=`current`:o&&(s=`done`);let c=e.disabled||a&&t>p,l=e.description==null?void 0:`${f}-${t}-description`,u=e.badge==null?void 0:`${f}-${t}-badge`,d=[l,u].filter(Boolean).join(` `)||void 0;return(0,U.jsx)(`li`,{className:`elea-stepper__step`,"data-state":s,"data-disabled":c||void 0,children:(0,U.jsxs)(`div`,{className:`elea-stepper__item`,children:[(0,U.jsx)(`span`,{className:`elea-stepper__indicator`,"aria-hidden":`true`,children:o?(0,U.jsx)(`svg`,{width:`1em`,height:`1em`,viewBox:`0 0 16 16`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,U.jsx)(`path`,{d:`m3 8 3 3 7-7`})}):t+1}),(0,U.jsxs)(`div`,{className:`elea-stepper__body`,children:[(0,U.jsx)(`button`,{type:`button`,className:`elea-stepper__button elea-stepper__label`,disabled:c,"aria-current":n?`step`:void 0,"aria-describedby":d,onClick:()=>r(e),onKeyDown:e=>gn(e,i),children:e.label}),l&&(0,U.jsx)(`span`,{className:`elea-stepper__description`,id:l,children:e.description}),u&&(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`span`,{className:`elea-stepper__badge`,"data-tone":e.badgeTone,id:e.badgeLabel?void 0:u,"aria-hidden":e.badgeLabel?!0:void 0,children:e.badge}),e.badgeLabel&&(0,U.jsx)(`span`,{id:u,hidden:!0,children:e.badgeLabel})]})]})]})},e.id)})})})}),vn=(0,W.forwardRef)(function({steps:e,current:t,onSelect:n,previousLabel:r,nextLabel:i,finish:a,className:s,linear:c,label:l,orientation:u,indicator:d,connector:f,...p},h){let g=hn(e,t);if(g<0)return null;let _=e.slice(0,g).reverse().find(e=>!e.disabled),v=e.slice(g+1).find(e=>!e.disabled);return(0,U.jsxs)(`div`,{...p,ref:h,className:o(`elea-stepper__panel`,s),children:[(0,U.jsx)(m,{variant:`outline`,disabled:!_,onClick:()=>_&&n(_),children:r}),v||a==null?(0,U.jsx)(m,{disabled:!v,onClick:()=>v&&n(v),children:i}):a]})}),yn=(0,W.forwardRef)(function({steps:e=3,orientation:t=`horizontal`,className:n,...r},i){let a=Number.isFinite(e)?Math.floor(e):0;return a<1?null:(0,U.jsx)(`div`,{...r,ref:i,className:o(`elea-stepper`,n),"data-orientation":t,"aria-hidden":`true`,children:(0,U.jsx)(`ol`,{className:`elea-stepper__list`,children:Array.from({length:a},(e,t)=>t+1).map(e=>(0,U.jsx)(`li`,{className:`elea-stepper__step`,children:(0,U.jsxs)(`div`,{className:`elea-stepper__item`,children:[(0,U.jsx)(c,{className:`elea-stepper__indicator`,variant:`circle`}),(0,U.jsx)(`div`,{className:`elea-stepper__body`,children:(0,U.jsx)(c,{width:`6em`})})]})},e))})})});function bn(e){return e!=null&&typeof e!=`boolean`&&e!==``}var xn=(0,W.forwardRef)(function({heading:e,headingLevel:t=`h1`,eyebrow:n,description:r,actions:i,media:a,image:s,layout:c=`stacked`,mediaPosition:l=`end`,className:u,...d},f){let p=(0,W.useId)(),m=d[`aria-labelledby`]??(d[`aria-label`]?void 0:p),h=!!s||bn(a),g=c===`split`&&h;return(0,U.jsx)(`section`,{...d,ref:f,"aria-labelledby":m,className:o(`elea-hero`,g&&`elea-hero--split`,g&&l===`start`&&`elea-hero--media-start`,c===`cover`&&!!s&&`elea-hero--cover`,u),children:(0,U.jsxs)(`div`,{className:`elea-hero__inner`,children:[(0,U.jsxs)(`div`,{className:`elea-hero__copy`,children:[bn(n)&&(0,U.jsx)(`div`,{className:`elea-hero__eyebrow`,children:n}),(0,U.jsx)(t,{className:`elea-hero__heading`,id:p,children:e}),bn(r)&&(0,U.jsx)(`div`,{className:`elea-hero__description`,children:r}),bn(i)&&(0,U.jsx)(`div`,{className:`elea-hero__actions`,children:i})]}),h&&(0,U.jsx)(`div`,{className:`elea-hero__media`,children:s?(0,U.jsx)(re,{...s}):a})]})})});function Sn({group:e,current:t,render:n}){let r=(0,W.useId)(),i=(0,W.useRef)(null),a=fe(e.items,t)?t:void 0,[o]=(0,W.useState)(()=>a!==void 0||e.defaultExpanded!==!1);(0,W.useEffect)(()=>{a!==void 0&&i.current&&(i.current.open=!0)},[a,e.collapsible]);let s=(0,U.jsx)(me,{items:e.items,current:t,render:n,labelledBy:r,revealCurrent:!0});return e.collapsible?(0,U.jsxs)(`details`,{className:`elea-sidebar__group`,ref:i,open:o,children:[(0,U.jsxs)(`summary`,{className:`elea-sidebar__label`,id:r,children:[e.label,(0,U.jsx)(`svg`,{viewBox:`0 0 16 16`,width:`1em`,height:`1em`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,"aria-hidden":`true`,children:(0,U.jsx)(`path`,{d:`m3 6 5 5 5-5`})})]}),s]}):(0,U.jsxs)(`div`,{className:`elea-sidebar__group`,children:[(0,U.jsx)(`p`,{id:r,className:`elea-sidebar__label`,children:e.label}),s]})}var Cn=(0,W.forwardRef)(function({label:e,groups:t,current:n,render:r,header:i,footer:a,className:s,...c},l){return(0,U.jsxs)(`nav`,{...c,ref:l,"aria-label":e,className:o(`elea-sidebar`,s),children:[i!=null&&(0,U.jsx)(`div`,{className:`elea-sidebar__header`,children:i}),t.map(e=>(0,U.jsx)(Sn,{group:e,current:n,render:r},e.id)),a!=null&&(0,U.jsx)(`div`,{className:`elea-sidebar__footer`,children:a})]})});function wn({orientation:e=`horizontal`,decorative:t=!0,className:n,children:r,...i}){return(0,U.jsx)(`div`,{role:t?`none`:`separator`,"aria-orientation":!t&&e===`vertical`?`vertical`:void 0,...i,className:o(`elea-separator`,`elea-separator--${e}`,n),children:r})}function Tn({loading:e,label:t,delay:n=0,className:r,children:i,...a}){let[s,c]=(0,W.useState)(!1);return(0,W.useEffect)(()=>{if(!e)return;let t=setTimeout(()=>c(!0),n);return()=>{clearTimeout(t),c(!1)}},[e,n]),(0,U.jsxs)(`div`,{...a,"aria-busy":e,className:o(`elea-skeleton-region`,e&&n>0&&!s&&`elea-skeleton-region--waiting`,r),children:[(0,U.jsx)(`output`,{className:`elea-skeleton-region__label`,children:e&&s?t:null}),i]})}function En(e){let t=e.trim().split(/\s+/).filter(Boolean);return(t.length>1?[t[0],t.at(-1)]:t).map(e=>Array.from(e??``)[0]??``).join(``).toLocaleUpperCase()}function q({name:e,src:t,size:n=`md`,shape:r=`circle`,tone:i=`neutral`,className:a,children:s,...c}){let[l,u]=(0,W.useState)(),d=t!==void 0&&t!==l;return(0,U.jsx)(`span`,{role:d||!e?void 0:`img`,"aria-label":d||!e?void 0:e,"aria-hidden":!e||void 0,...c,className:o(`elea-avatar`,`elea-avatar--${n}`,`elea-avatar--${r}`,`elea-avatar--${i}`,a),children:d?(0,U.jsx)(`img`,{src:t,alt:e,onError:()=>u(t)}):(0,U.jsx)(`span`,{"aria-hidden":`true`,children:s??En(e)})})}function Dn(e){return(0,U.jsx)(c,{children:(0,U.jsx)(q,{...e,name:``})})}function On({max:e,size:t=`md`,className:n,children:r,...i}){let a=W.Children.toArray(r),s=e===void 0?a:a.slice(0,e),c=a.length-s.length;return(0,U.jsxs)(`div`,{role:`group`,...i,className:o(`elea-avatar-group`,n),children:[s,c>0&&(0,U.jsxs)(`span`,{className:o(`elea-avatar`,`elea-avatar--${t}`),children:[`+`,c]})]})}var kn=(0,W.forwardRef)(function({value:e,max:t=100,label:n,showValue:r=!1,formatValue:i,size:a=`md`,tone:s=`primary`,className:c,...l},u){let d=(0,W.useId)(),f=e===void 0?void 0:Math.min(t,Math.max(0,e)),p=f===void 0?void 0:f/t*100,m=f===void 0?void 0:i?.(f,t),h=r&&p!==void 0?m??`${Math.round(p)}%`:void 0;return(0,U.jsxs)(`div`,{ref:u,className:o(`elea-progress`,`elea-progress--${a}`,`elea-progress--${s}`,c),children:[(n||h)&&(0,U.jsxs)(`div`,{className:`elea-progress__header`,children:[n&&(0,U.jsx)(`span`,{id:d,className:`elea-progress__label`,children:n}),h&&(0,U.jsx)(`span`,{className:`elea-progress__value`,children:h})]}),(0,U.jsx)(`div`,{role:`progressbar`,"aria-labelledby":n?d:void 0,"aria-valuemin":0,"aria-valuemax":t,"aria-valuenow":f,"aria-valuetext":m,...l,className:`elea-progress__track`,children:(0,U.jsx)(`div`,{className:o(`elea-progress__bar`,p===void 0&&`elea-progress__bar--indeterminate`),style:p===void 0?void 0:{inlineSize:`${p}%`}})})]})}),J=(0,W.forwardRef)(function({label:e,density:t,striped:n=!1,hoverable:r=!1,stickyHeader:i=!1,className:a,...s},c){return(0,U.jsx)(`div`,{...e?{role:`region`,"aria-label":e,tabIndex:0}:{},className:o(`elea-table`,`elea-table--${t??`md`}`,n&&`elea-table--striped`,r&&`elea-table--hoverable`,i&&`elea-table--sticky`,a),"data-density":t,children:(0,U.jsx)(`table`,{...s,ref:c})})});function An({className:e,...t}){return(0,U.jsx)(`caption`,{...t,className:o(`elea-table__caption`,e)})}function Y(e){return(0,U.jsx)(`thead`,{...e})}function X(e){return(0,U.jsx)(`tbody`,{...e})}function jn(e){return(0,U.jsx)(`tfoot`,{...e})}function Z({selected:e,...t}){return(0,U.jsx)(`tr`,{"data-selected":e||void 0,...t})}function Q({align:e=`start`,sort:t,onSort:n,scope:r=`col`,className:i,children:a,...s}){return(0,U.jsx)(`th`,{scope:r,"aria-sort":n?t??`none`:t,...s,className:o(e!==`start`&&`elea-table__cell--${e}`,i)||void 0,children:n?(0,U.jsxs)(`button`,{type:`button`,className:`elea-table__sort`,onClick:n,children:[a,(0,U.jsx)(`svg`,{viewBox:`0 0 24 24`,width:`1em`,height:`1em`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,"aria-hidden":`true`,children:(0,U.jsx)(`path`,{d:`M12 5v14M6 11l6-6 6 6`})})]}):a})}function $({align:e,numeric:t=!1,className:n,...r}){let i=e??(t?`end`:`start`);return(0,U.jsx)(`td`,{...r,className:o(i!==`start`&&`elea-table__cell--${i}`,n)||void 0})}function Mn({rows:e=3,columns:t=3,header:n=!0,...r}){let i=Array.from({length:t},(e,t)=>t);return(0,U.jsxs)(J,{...r,"aria-hidden":`true`,children:[n&&(0,U.jsx)(Y,{children:(0,U.jsx)(Z,{children:i.map(e=>(0,U.jsx)(Q,{children:(0,U.jsx)(c,{width:`50%`})},e))})}),(0,U.jsx)(X,{children:Array.from({length:e},(e,t)=>(0,U.jsx)(Z,{children:i.map(e=>(0,U.jsx)($,{children:(0,U.jsx)(c,{width:`75%`})},e))},t))})]})}function Nn(e){if(e.altKey||e.ctrlKey||e.metaKey)return;let t=Array.from(e.currentTarget.closest(`.elea-accordion`)?.querySelectorAll(`:scope > .elea-accordion__item > * > .elea-accordion__trigger:enabled`)??[]),n=t.indexOf(e.currentTarget),r;switch(e.key){case`Home`:r=0;break;case`End`:r=t.length-1;break;case`ArrowDown`:r=(n+1)%t.length;break;case`ArrowUp`:r=(n-1+t.length)%t.length;break;default:return}e.preventDefault(),t[r]?.focus()}function Pn({items:e,value:t,defaultValue:n,onChange:r,multiple:i=!1,headingLevel:a=`h3`,variant:s=`separated`,className:c}){let l=(0,W.useId)(),[u,d]=(0,W.useState)(n??[]),f=t??u;function p(e){let n=i?[...f,e.value]:[e.value],a=f.includes(e.value)?f.filter(t=>t!==e.value):n;t===void 0&&d(a),r?.(a)}return(0,U.jsx)(`div`,{className:o(`elea-accordion`,`elea-accordion--${s}`,c),children:e.map((e,t)=>{let n=f.includes(e.value);return(0,U.jsxs)(`div`,{className:`elea-accordion__item`,"data-open":n||void 0,children:[(0,U.jsx)(a,{className:`elea-accordion__heading`,children:(0,U.jsxs)(`button`,{type:`button`,id:`${l}-trigger-${t}`,"aria-expanded":n,"aria-controls":`${l}-panel-${t}`,disabled:e.disabled,className:`elea-accordion__trigger`,onClick:()=>p(e),onKeyDown:Nn,children:[e.label,(0,U.jsx)(`svg`,{viewBox:`0 0 24 24`,width:`1em`,height:`1em`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,"aria-hidden":`true`,children:(0,U.jsx)(`path`,{d:`m6 9 6 6 6-6`})})]})}),(0,U.jsx)(`div`,{role:`region`,id:`${l}-panel-${t}`,"aria-labelledby":`${l}-trigger-${t}`,className:`elea-accordion__panel`,children:(0,U.jsx)(`div`,{className:`elea-accordion__content`,children:e.panel})})]},e.value)})})}var Fn=200,In=(0,W.createContext)(null);function Ln(){let e=(0,W.useContext)(In);if(!e)throw Error(`useToast needs a ToastProvider above it.`);return e}function Rn(e,t,n){return e.some(e=>e.id===t.id)?e.map(e=>e.id===t.id?t:e):[...e,t].slice(-n)}function zn(e,t){return e.map(e=>t===void 0||e.id===t?{...e,leaving:!0}:e)}function Bn(e,t){return e.filter(e=>!e.leaving||t!==void 0&&e.id!==t)}function Vn({children:e,label:t,dismissLabel:n,position:r=`bottom-end`,duration:i=5e3,max:a=3,motion:s,theme:c,className:l}){let[u,f]=(0,W.useState)(!1),[p,m]=(0,W.useState)([]),[h,g]=(0,W.useState)(!1),[_,v]=(0,W.useState)(!1),y=(0,W.useRef)(null),[b,x]=S(),C=(0,W.useRef)(0),w=h||_;(0,W.useEffect)(()=>{f(!0)},[]),(0,W.useEffect)(()=>{_&&!y.current?.contains(document.activeElement)&&v(!1)},[_,p]);let T=(0,W.useCallback)(e=>{m(t=>zn(t,e)),setTimeout(()=>m(t=>Bn(t,e)),Fn)},[]),E=(0,W.useCallback)(e=>{let t=e.id;t===void 0&&(C.current+=1,t=`toast-${C.current}`);let n={...e,id:t};return m(e=>Rn(e,n,a)),t},[a]),D=(0,W.useMemo)(()=>({toast:E,dismiss:T}),[E,T]);return(0,U.jsxs)(In.Provider,{value:D,children:[e,(0,U.jsx)(`template`,{ref:b}),u&&(0,xt.createPortal)((0,U.jsx)(`div`,{ref:y,role:`region`,"aria-label":t,"aria-live":`polite`,...x,"data-elea-theme":c??x[`data-elea-theme`],"data-elea-motion":d(s)??x[`data-elea-motion`],className:o(`elea-toasts`,`elea-toasts--${r}`,l),onPointerEnter:()=>g(!0),onPointerLeave:()=>g(!1),onFocus:()=>v(!0),onBlur:()=>v(!1),children:p.map(e=>(0,U.jsx)(Hn,{entry:e,lifetime:e.duration??i,paused:w,dismissLabel:n,onDismiss:T},e.id))}),document.body)]})}function Hn({entry:e,lifetime:t,paused:n,dismissLabel:r,onDismiss:i}){let{id:a,title:s,description:c,tone:l=`neutral`,icon:u,action:d,leaving:f}=e;return(0,W.useEffect)(()=>{if(n||f||!Number.isFinite(t))return;let e=setTimeout(()=>i(a),t);return()=>clearTimeout(e)},[e,a,f,t,i,n]),(0,U.jsxs)(`div`,{role:l===`danger`?`alert`:void 0,"aria-atomic":`true`,"data-leaving":f||void 0,className:o(`elea-toast`,`elea-toast--${l}`),children:[u&&(0,U.jsx)(`span`,{className:`elea-toast__icon`,"aria-hidden":`true`,children:u}),(0,U.jsxs)(`div`,{className:`elea-toast__body`,children:[(0,U.jsx)(`p`,{className:`elea-toast__title`,children:s}),c&&(0,U.jsx)(`p`,{className:`elea-toast__description`,children:c})]}),d&&(0,U.jsx)(`div`,{className:`elea-toast__action`,children:d}),(0,U.jsx)(`button`,{type:`button`,className:`elea-toast__dismiss`,onClick:()=>i(a),"aria-label":r,title:r,children:(0,U.jsx)(`svg`,{viewBox:`0 0 24 24`,width:`1em`,height:`1em`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,"aria-hidden":`true`,children:(0,U.jsx)(`path`,{d:`M18 6 6 18M6 6l12 12`})})})]})}var Un=4e6;function Wn(e,t){let n=Array.from({length:e.length+1},()=>new Uint32Array(t.length+1));for(let r=e.length-1;r>=0;--r){let i=n[r],a=n[r+1];for(let n=t.length-1;n>=0;--n)i[n]=e[r]===t[n]?a[n+1]+1:Math.max(a[n],i[n+1])}return n}function Gn(e,t,n,r){let i=e=>({change:`removed`,item:e}),a=e=>({change:`added`,item:e});if(n.length*r.length>Un)return[...e.map(i),...t.map(a)];let o=Wn(n,r),s=[],c=0,l=0;for(;c<n.length&&l<r.length;)n[c]===r[l]?(s.push({change:`same`,item:t[l],previous:e[c]}),c+=1,l+=1):o[c+1][l]>=o[c][l+1]?(s.push(i(e[c])),c+=1):(s.push(a(t[l])),l+=1);return[...s,...e.slice(c).map(i),...t.slice(l).map(a)]}function Kn(e,t,n){let r=e.map(n),i=t.map(n),a=0;for(;a<r.length&&a<i.length&&r[a]===i[a];)a+=1;let o=r.length,s=i.length;for(;o>a&&s>a&&r[o-1]===i[s-1];)--o,--s;return[...t.slice(0,a).map((t,n)=>({change:`same`,item:t,previous:e[n]})),...Gn(e.slice(a,o),t.slice(a,s),r.slice(a,o),i.slice(a,s)),...t.slice(s).map((t,n)=>({change:`same`,item:t,previous:e[o+n]}))]}function qn(e,t,n,r){let i=[],a=[],o=[],s=()=>{let e=0;for(let t of a){let n=o.findIndex((n,i)=>i>=e&&r(t,n));if(n===-1)i.push({change:`removed`,item:t});else{for(let t of o.slice(e,n))i.push({change:`added`,item:t});i.push({change:`changed`,item:o[n],previous:t}),e=n+1}}for(let t of o.slice(e))i.push({change:`added`,item:t});a=[],o=[]};for(let r of Kn(e,t,n))r.change===`removed`?a.push(r.item):r.change===`added`?o.push(r.item):(s(),i.push({change:`same`,item:r.item}));return s(),i}var Jn=new Set([`a`,`b`,`strong`,`i`,`em`,`u`,`s`,`strike`,`del`,`ins`,`mark`,`code`,`span`,`cite`,`sub`,`sup`,`small`]),Yn=new Set([`br`,`img`,`hr`,`input`,`wbr`]),Xn=String.raw`&(?:#x[0-9a-f]+|#\d+|[a-z]+);`,Zn=String.raw`[\p{L}\p{N}_]+(?:['’-][\p{L}\p{N}_]+)*`,Qn=new RegExp(String.raw`${Xn}|${Zn}|\s+|[\s\S]`,`giu`);function $n(e){let t=[],n=0;for(;n<e.length;){let r=e.indexOf(`<`,n),i=r!==-1&&/[a-zA-Z/!]/.test(e[r+1]??``),a=i?e.indexOf(`>`,r):-1;if(a===-1){let a=r===-1||i?e.length:r+1;t.push({kind:`text`,source:e.slice(n,a).replaceAll(`<`,`&lt;`)}),n=a;continue}t.push({kind:`text`,source:e.slice(n,r)});let o=e.slice(r,a+1),s=/^<\/?([a-zA-Z][a-zA-Z0-9]*)/.exec(o)?.[1]?.toLowerCase();s&&t.push({kind:er(o,s),source:o,name:s}),n=a+1}return t}function er(e,t){return e[1]===`/`?`close`:Yn.has(t)||e.endsWith(`/>`)?`void`:`open`}function tr(e,t){let n=t.filter(e=>e.inline);return{html:e,key:`${/^\s+$/.test(e)?` `:e}\u0000${n.map(e=>e.open).join(``)}`,structure:t.filter(e=>!e.inline),inline:n}}function nr(e,t){let n=[],r=[],i=0;for(let a of $n(e))if(a.kind===`text`)for(let[e]of a.source.matchAll(Qn))n.push(tr(e,r));else if(a.kind===`void`)n.push(tr(a.source,r));else if(a.kind===`close`){let e=r.map(e=>e.name).lastIndexOf(a.name);r.length=e===-1?r.length:e}else{let e=Jn.has(a.name);i+=1,r.push({name:a.name,inline:e,identity:e?a.source:`${t}${i}`,open:a.source,close:`</${a.name}>`})}return n}var rr={identity:`+`,open:`<ins class="elea-change elea-change--added">`,close:`</ins>`},ir={identity:`-`,open:`<del class="elea-change elea-change--removed">`,close:`</del>`},ar={added:rr,removed:ir};function or(e){let t=new Map;for(let{item:n,previous:r}of e){let e=r?.structure.at(-1)?.identity;e!==void 0&&!t.has(e)&&t.set(e,n.structure)}return t}function sr(e,t){let n=0;for(;n<e.length&&n<t.length&&e[n]?.identity===t[n]?.identity;)n+=1;let r=``;for(;e.length>n;)r+=e.pop().close;for(let i of t.slice(n))r+=i.open,e.push(i);return r}function cr(e,t){let n=Kn(nr(e,`b`),nr(t,`a`),e=>e.key),r=or(n),i=n.find(e=>e.change!==`removed`)?.item.structure,a=[],o=``;for(let{change:e,item:t}of n){let n=t.structure.at(-1);e===`removed`?n?i=r.get(n.identity)??t.structure:i??=t.structure:i=t.structure;let s=ar[e];o+=sr(a,s?[...i,...t.inline,s]:[...i,...t.inline])+t.html}return o+sr(a,[])}var lr=new Set([`paragraph`,`header`,`quote`]),ur=new Set([`list`,`nestedlist`]),dr=e=>e.split(/\s+/).filter(Boolean);function fr(e,t){let n=dr(e),r=dr(t),i=Math.max(n.length,r.length);return i!==0&&Kn(n,r,e=>e).filter(e=>e.change===`same`).length*2>=i}var pr=e=>typeof e==`string`?e:e.content,mr=e=>typeof e==`string`?[]:e.items??[],hr=(e,t)=>t&&`${e.open}${t}${e.close}`;function gr(e,t){if(typeof e==`string`)return hr(t,e);let n={...e,content:hr(t,e.content)};return e.items&&(n.items=e.items.map(e=>gr(e,t))),n}function _r(e,t){return qn(e,t,e=>JSON.stringify(e),(e,t)=>fr(Ae(pr(e)),Ae(pr(t)))).map(e=>{if(e.change!==`changed`)return e.change===`same`?e.item:gr(e.item,e.change===`added`?rr:ir);let t=cr(pr(e.previous),pr(e.item)),n=_r(mr(e.previous),mr(e.item));if(typeof e.item==`string`&&n.length===0)return t;let r={...typeof e.item==`string`?{}:e.item,content:t};return n.length>0&&(r.items=n),r})}var vr=e=>typeof e==`string`?e:``,yr=e=>Array.isArray(e)?e:[];function br(e,t){return ur.has(t.type)?{...t.data,items:_r(yr(e.data.items),yr(t.data.items))}:{...t.data,text:cr(vr(e.data.text),vr(t.data.text))}}function xr(e,t,n={}){let r=n.registry??Me;return qn(e,t,e=>`${e.type}\u0000${JSON.stringify(e.data)}`,(e,t)=>e.type===t.type&&(lr.has(t.type)||ur.has(t.type))&&fr(r.toText(e),r.toText(t))).map(e=>e.change===`changed`?{change:`changed`,block:{...e.item,data:br(e.previous,e.item)},previous:e.previous}:{change:e.change,block:e.item})}var Sr={same:`div`,changed:`div`,added:`ins`,removed:`del`};function Cr({before:e,after:t,renderers:n,className:r,typography:i,emptyFallback:a},o){let s=(e,t)=>{let n=0;return Ne(e,{registry:o.registry,generateId:()=>(n+=1,`elea-${t}-${n}`)}).blocks},c=xr(s(e,`before`),s(t,`after`),{registry:o.registry});if(c.length===0)return(0,U.jsx)(U.Fragment,{children:a??null});let l=n?{...Fe,...n}:Fe;return(0,U.jsx)(`div`,{className:[`elea-content`,`elea-comparison`,i===`inherit`&&`elea-content--inherit`,r].filter(Boolean).join(` `),children:c.map(({change:e,block:t})=>{let n=Object.hasOwn(l,t.type)?l[t.type]:Pe,r=Sr[e];return(0,U.jsx)(r,{className:`elea-block elea-block--${t.type}`,"data-elea-block-id":t.id,"data-elea-block-type":t.type,"data-elea-change":e,children:(0,U.jsx)(n,{block:t,context:o})},`${e===`removed`?`before`:`after`}:${t.id}`)})})}function wr(e){return Cr(e,je(e))}var Tr=[{id:`calendar`,label:`Calendar`,description:`Forms`,href:`/guides/calendar`},{id:`card`,label:`Card`,description:`Display`,href:`/guides/card`},{id:`carousel`,label:`Carousel`,description:`Navigation`,href:`/guides/carousel`}];function Er(e){return e===0?`No matching guides`:e===1?`1 guide`:`${e} guides`}function Dr({destinations:e=Tr}){let[t,n]=(0,W.useState)(``),r=t.trim().toLowerCase(),i=e.filter(e=>e.label.toLowerCase().includes(r));return(0,U.jsx)(D,{label:`Find a guide`,placeholder:`Calendar, card, carousel`,clearLabel:`Clear query`,value:t,onValueChange:n,results:i,status:Er(i.length),autoSelectFirst:!0})}function Or(){return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(m,{children:`Primary`}),(0,U.jsx)(m,{variant:`secondary`,children:`Secondary`}),(0,U.jsx)(m,{variant:`tertiary`,children:`Tertiary`}),(0,U.jsx)(m,{variant:`outline`,children:`Outline`}),(0,U.jsx)(m,{variant:`ghost`,children:`Ghost`}),(0,U.jsx)(m,{variant:`danger`,children:`Danger`}),(0,U.jsx)(m,{variant:`success`,children:`Success`}),(0,U.jsx)(m,{variant:`info`,children:`Info`}),(0,U.jsx)(m,{variant:`warning`,children:`Warning`})]})}function kr({children:e}){return(0,U.jsx)(`svg`,{viewBox:`0 0 24 24`,width:`1em`,height:`1em`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,"aria-hidden":`true`,children:e})}function Ar(){return(0,U.jsx)(kr,{children:(0,U.jsx)(`path`,{d:`M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3`})})}function jr(){return(0,U.jsx)(kr,{children:(0,U.jsx)(`path`,{d:`M12 5v14M5 12h14`})})}function Mr(){return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(m,{size:`xs`,children:`Extra small`}),(0,U.jsx)(m,{size:`sm`,icon:(0,U.jsx)(jr,{}),children:`Small`}),(0,U.jsx)(m,{icon:(0,U.jsx)(jr,{}),children:`Medium`}),(0,U.jsx)(m,{size:`lg`,trailingIcon:(0,U.jsx)(jr,{}),children:`Large`}),(0,U.jsx)(m,{size:`xl`,children:`Extra large`}),(0,U.jsx)(p,{variant:`disc`,label:`Add`,children:(0,U.jsx)(jr,{})}),(0,U.jsx)(p,{variant:`outline`,radius:`full`,label:`Add item`,children:(0,U.jsx)(jr,{})})]})}function Nr(){return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(m,{children:`Theme default`}),(0,U.jsx)(m,{shadow:`sm`,children:`Small shadow`}),(0,U.jsx)(m,{shadow:`md`,children:`Medium shadow`})]})}function Pr(){let[e,t]=(0,W.useState)(!1);function n(){t(!0),setTimeout(()=>t(!1),2e3)}return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(m,{loading:e,loadingLabel:`Saving`,onClick:n,children:`Save`}),(0,U.jsx)(m,{disabled:!0,children:`Disabled`}),(0,U.jsx)(m,{href:`https://example.org`,variant:`outline`,children:`A link`}),(0,U.jsx)(m,{href:`https://example.org`,variant:`outline`,disabled:!0,children:`Unavailable link`})]})}function Fr(){return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(u,{children:`Neutral`}),(0,U.jsx)(u,{tone:`primary`,children:`Primary`}),(0,U.jsx)(u,{tone:`secondary`,children:`Secondary`}),(0,U.jsx)(u,{tone:`success`,variant:`solid`,children:`Published`}),(0,U.jsx)(u,{tone:`info`,children:`Scheduled`}),(0,U.jsx)(u,{tone:`warning`,variant:`outline`,children:`Pending`}),(0,U.jsx)(u,{tone:`danger`,size:`sm`,children:`3`})]})}function Ir(){return(0,U.jsx)(O,{label:`Search articles`,clearLabel:`Clear article search`,name:`q`})}function Lr(){let[e,t]=(0,W.useState)(!0);return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(I,{checked:e,onCheckedChange:t,label:`Notifications`}),(0,U.jsx)(I,{checked:!1,onCheckedChange:()=>{},label:`Disabled`,disabled:!0})]})}function Rr(){let[e,t]=(0,W.useState)(!1),[n,r]=(0,W.useState)(!1);return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(m,{onClick:()=>t(!0),children:`Share article`}),(0,U.jsx)(m,{variant:`danger`,onClick:()=>r(!0),children:`Delete article`}),(0,U.jsx)(Rt,{open:e,onClose:()=>t(!1),title:`Share this article`,description:`Choose who can read it.`,closeLabel:`Close`,actions:(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(m,{variant:`outline`,onClick:()=>t(!1),children:`Cancel`}),(0,U.jsx)(m,{onClick:()=>t(!1),children:`Share`})]}),children:(0,U.jsx)(R,{label:`Link`,children:e=>(0,U.jsx)(b,{...e,readOnly:!0,value:`https://example.org/a/1`})})}),(0,U.jsx)(zt,{open:n,onConfirm:()=>r(!1),onCancel:()=>r(!1),title:`Delete this article?`,description:`This cannot be undone.`,tone:`danger`,icon:(0,U.jsx)(Ar,{}),confirmLabel:`Delete`,cancelLabel:`Keep`,closeLabel:`Close`})]})}function zr(){let[e,t]=(0,W.useState)(!1);return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(m,{variant:`outline`,onClick:()=>t(!0),children:`Publish article`}),(0,U.jsxs)(jt,{open:e,onClose:()=>t(!1),size:`lg`,children:[(0,U.jsxs)(Mt,{children:[(0,U.jsxs)(Nt,{children:[`Publish this article`,` `,(0,U.jsx)(u,{tone:`primary`,variant:`subtle`,children:`Step 2 of 2`})]}),(0,U.jsx)(Pt,{label:`Close`})]}),(0,U.jsx)(Ft,{children:`Readers see it as soon as you publish.`}),(0,U.jsx)(It,{children:(0,U.jsx)(R,{label:`Summary`,children:e=>(0,U.jsx)(y,{...e,rows:3})})}),(0,U.jsxs)(Lt,{children:[(0,U.jsx)(L,{label:`Notify subscribers`}),(0,U.jsx)(m,{onClick:()=>t(!1),children:`Publish`})]})]})]})}var Br=Array.from({length:32},(e,t)=>t+1);function Vr(){let[e,t]=(0,W.useState)(!1),[n,r]=(0,W.useState)(`xl`);function i(e){r(e),t(!0)}return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(m,{variant:`outline`,onClick:()=>i(`xl`),children:`Read the proof`}),(0,U.jsx)(m,{variant:`outline`,onClick:()=>i(`full`),children:`Read in the full window`}),(0,U.jsx)(Rt,{open:e,onClose:()=>t(!1),size:n,scroll:`body`,title:`Proof of the harbour issue`,description:`The title and the actions stay while the pages scroll.`,closeLabel:`Close`,actions:(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(m,{variant:`outline`,onClick:()=>t(!1),children:`Ask for changes`}),(0,U.jsx)(m,{onClick:()=>t(!1),children:`Approve`})]}),children:(0,U.jsx)(`ol`,{children:Br.map(e=>(0,U.jsxs)(`li`,{children:[`Page `,e,`, set in two columns with its captions and credits.`]},e))})})]})}function Hr(){return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(mn,{content:`Saves a draft without publishing`,children:(0,U.jsx)(m,{variant:`outline`,children:`Save draft`})}),(0,U.jsx)(mn,{content:`Shown below`,placement:`bottom`,children:(0,U.jsx)(p,{label:`Help`,children:`?`})})]})}var Ur=[{value:`details`,label:`Details`,panel:(0,U.jsx)(`p`,{children:`Review the article title, author and publication date.`})},{value:`revisions`,label:`Revisions`,panel:(0,U.jsx)(`p`,{children:`Two revisions are available for this article.`})},{value:`analytics`,label:`Analytics`,panel:null,disabled:!0}];function Wr(){return(0,U.jsx)(ve,{presentation:`segmented`,label:`Article sections`,defaultValue:`details`,items:Ur})}var Gr=`import { Button } from "@alien6-studio/elea-ui";

export function ButtonVariants() {
  return (
    <>
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="tertiary">Tertiary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="success">Success</Button>
      <Button variant="info">Info</Button>
      <Button variant="warning">Warning</Button>
    </>
  );
}
`,Kr=`import { Button } from "@alien6-studio/elea-ui";

const tones = [
  "primary",
  "secondary",
  "tertiary",
  "neutral",
  "danger",
  "warning",
  "success",
  "info",
] as const;
const variants = ["solid", "outline", "ghost"] as const;

export function ActionPalette() {
  return variants.map((variant) => (
    <fieldset key={variant}>
      <legend>{variant}</legend>
      {tones.map((tone) => (
        <Button key={tone} variant={variant} tone={tone}>
          {tone}
        </Button>
      ))}
    </fieldset>
  ));
}
`,qr=`import { Button } from "@alien6-studio/elea-ui";

const css = \`
.teal-info {
  --elea-color-action-info: light-dark(#0e7490, #67e8f9);
  --elea-color-action-info-text: light-dark(white, black);
  --elea-color-action-info-hover: color-mix(
    in srgb,
    var(--elea-color-action-info) 90%,
    light-dark(black, white)
  );
  --elea-color-action-info-pressed: color-mix(
    in srgb,
    var(--elea-color-action-info) 80%,
    light-dark(black, white)
  );
}
\`;

export function TealInfo() {
  return (
    <>
      <style>{css}</style>
      <Button variant="info" className="teal-info">
        Teal info
      </Button>
    </>
  );
}
`,Jr=`import { Button, IconButton } from "@alien6-studio/elea-ui";
import { PlusIcon } from "../icons";

export function ButtonSizes() {
  return (
    <>
      <Button size="xs">Extra small</Button>
      <Button size="sm" icon={<PlusIcon />}>
        Small
      </Button>
      <Button icon={<PlusIcon />}>Medium</Button>
      <Button size="lg" trailingIcon={<PlusIcon />}>
        Large
      </Button>
      <Button size="xl">Extra large</Button>
      <IconButton variant="disc" label="Add">
        <PlusIcon />
      </IconButton>
      <IconButton variant="outline" radius="full" label="Add item">
        <PlusIcon />
      </IconButton>
    </>
  );
}
`,Yr=`import { Button } from "@alien6-studio/elea-ui";

const css = \`
.publication-actions {
  --elea-shape-action: 1.5rem 0.25rem 1rem 0.5rem;
  --elea-button-radius-sm: 0.75rem 0.125rem 0.5rem 0.25rem;
}
.publication-toolbar {
  --elea-control-radius: 0.25rem 1rem 0.5rem 0;
}
\`;

export function PublicationActions() {
  return (
    <section className="publication-actions">
      <style>{css}</style>
      <Button>Publish</Button>
      <Button size="sm" radius="sm">
        Save draft
      </Button>
      <div className="publication-toolbar">
        <Button>Filter</Button>
      </div>
    </section>
  );
}
`,Xr=`import { Button } from "@alien6-studio/elea-ui";

export function ButtonShadows() {
  return (
    <>
      <Button>Theme default</Button>
      <Button shadow="sm">Small shadow</Button>
      <Button shadow="md">Medium shadow</Button>
    </>
  );
}
`,Zr=`import { useState } from "react";
import { Button } from "@alien6-studio/elea-ui";

export function LoadingButton() {
  const [loading, setLoading] = useState(false);

  function save() {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  }

  return (
    <>
      <Button loading={loading} loadingLabel="Saving" onClick={save}>
        Save
      </Button>
      <Button disabled>Disabled</Button>
      <Button href="https://example.org" variant="outline">
        A link
      </Button>
      <Button href="https://example.org" variant="outline" disabled>
        Unavailable link
      </Button>
    </>
  );
}
`,Qr=`import { Button, type ButtonLinkRenderProps } from "@alien6-studio/elea-ui";

type LinkProps = Omit<ButtonLinkRenderProps, "href"> & { to: string };

function Link({ to, ...props }: LinkProps) {
  return <a href={to} {...props} />;
}

const renderLink = ({ href, ...props }: ButtonLinkRenderProps) => (
  <Link {...props} to={href} />
);

export function GuideLinks() {
  return (
    <>
      <Button href="/guides/card" render={renderLink}>
        Open Card guide
      </Button>
      <Button href="/guides/card" render={renderLink} disabled>
        Guide unavailable
      </Button>
    </>
  );
}
`,$r=`import { Button } from "@alien6-studio/elea-ui";

export function ButtonMotion() {
  return (
    <div data-elea-motion="on">
      <Button>Follows the page</Button>
      <Button motion={false}>Always still</Button>
    </div>
  );
}
`,ei=`import { Badge } from "@alien6-studio/elea-ui";

export function BadgeTones() {
  return (
    <>
      <Badge>Neutral</Badge>
      <Badge tone="primary">Primary</Badge>
      <Badge tone="secondary">Secondary</Badge>
      <Badge tone="success" variant="solid">
        Published
      </Badge>
      <Badge tone="info">Scheduled</Badge>
      <Badge tone="warning" variant="outline">
        Pending
      </Badge>
      <Badge tone="danger" size="sm">
        3
      </Badge>
    </>
  );
}
`,ti=`import { useState } from "react";
import { Field, Input } from "@alien6-studio/elea-ui";

export function ValidatedField() {
  const [email, setEmail] = useState("");
  const invalid = email.length > 0 && !email.includes("@");

  return (
    <Field
      label="Email"
      help="We never share it"
      error={invalid ? "Enter a valid address" : undefined}
      required
      requiredMarker="*"
    >
      {(control) => (
        <Input
          {...control}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          invalid={invalid}
        />
      )}
    </Field>
  );
}
`,ni=`import { Input, Textarea } from "@alien6-studio/elea-ui";

export function InputSizes() {
  return (
    <>
      <Input size="sm" placeholder="Small" aria-label="Small" />
      <Input placeholder="Medium" aria-label="Medium" />
      <Input size="lg" placeholder="Large" aria-label="Large" />
      <Textarea placeholder="A longer text" aria-label="A longer text" />
    </>
  );
}
`,ri=`import { SearchField } from "@alien6-studio/elea-ui";

export function ArticleSearch() {
  return (
    <SearchField
      label="Search articles"
      clearLabel="Clear article search"
      name="q"
    />
  );
}
`,ii=`import { useState } from "react";
import { Checkbox } from "@alien6-studio/elea-ui";

export function NewsletterCheckboxes() {
  const [checked, setChecked] = useState(false);

  return (
    <>
      <Checkbox
        label="Send me the newsletter"
        description="Once a month, no more"
        checked={checked}
        onCheckedChange={setChecked}
      />
      <Checkbox label="Partially selected" indeterminate readOnly />
      <Checkbox label="Disabled" disabled />
    </>
  );
}
`,ai=`import { useState } from "react";
import { Toggle } from "@alien6-studio/elea-ui";

export function NotificationToggles() {
  const [on, setOn] = useState(true);

  return (
    <>
      <Toggle checked={on} onCheckedChange={setOn} label="Notifications" />
      <Toggle
        checked={false}
        onCheckedChange={() => {}}
        label="Disabled"
        disabled
      />
    </>
  );
}
`,oi=`import { useState } from "react";
import {
  Button,
  ConfirmDialog,
  Dialog,
  Field,
  Input,
} from "@alien6-studio/elea-ui";
import { TrashIcon } from "../icons";

export function ShareArticle() {
  const [sharing, setSharing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <>
      <Button onClick={() => setSharing(true)}>Share article</Button>
      <Button variant="danger" onClick={() => setDeleting(true)}>
        Delete article
      </Button>
      <Dialog
        open={sharing}
        onClose={() => setSharing(false)}
        title="Share this article"
        description="Choose who can read it."
        closeLabel="Close"
        actions={
          <>
            <Button variant="outline" onClick={() => setSharing(false)}>
              Cancel
            </Button>
            <Button onClick={() => setSharing(false)}>Share</Button>
          </>
        }
      >
        <Field label="Link">
          {(control) => (
            <Input {...control} readOnly value="https://example.org/a/1" />
          )}
        </Field>
      </Dialog>
      <ConfirmDialog
        open={deleting}
        onConfirm={() => setDeleting(false)}
        onCancel={() => setDeleting(false)}
        title="Delete this article?"
        description="This cannot be undone."
        tone="danger"
        icon={<TrashIcon />}
        confirmLabel="Delete"
        cancelLabel="Keep"
        closeLabel="Close"
      />
    </>
  );
}
`,si=`import { useState } from "react";
import { Button, ConfirmDialog } from "@alien6-studio/elea-ui";
import { TrashIcon } from "../icons";

export function DeleteProject() {
  const [open, setOpen] = useState(false);
  const [removed, setRemoved] = useState("nothing yet");

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Delete project
      </Button>
      <p>Deleted: {removed}</p>
      <ConfirmDialog
        open={open}
        tone="danger"
        icon={<TrashIcon />}
        title="Delete this project?"
        description="Type the name of the project to delete it."
        field={{
          label: "Name of the project: field-notes",
          expected: "field-notes",
        }}
        confirmLabel="Delete"
        cancelLabel="Keep"
        closeLabel="Close"
        onConfirm={(value) => {
          setRemoved(value ?? "");
          setOpen(false);
        }}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
`,ci=`import { useState } from "react";
import { Button, Dialog } from "@alien6-studio/elea-ui";

export function ThemedDialog() {
  const [open, setOpen] = useState(false);

  return (
    <section data-elea-theme="editorial">
      <Button onClick={() => setOpen(true)}>Open in Editorial</Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Editorial edition"
        description="The tokens of the container reach this dialog."
        closeLabel="Close"
        actions={<Button onClick={() => setOpen(false)}>Done</Button>}
      />
    </section>
  );
}
`,li=`import { useState } from "react";
import {
  Badge,
  Button,
  Checkbox,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  Field,
  Textarea,
} from "@alien6-studio/elea-ui";

export function PublishArticle() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Publish article
      </Button>
      <DialogRoot open={open} onClose={() => setOpen(false)} size="lg">
        <DialogHeader>
          <DialogTitle>
            Publish this article{" "}
            <Badge tone="primary" variant="subtle">
              Step 2 of 2
            </Badge>
          </DialogTitle>
          <DialogClose label="Close" />
        </DialogHeader>
        <DialogDescription>
          Readers see it as soon as you publish.
        </DialogDescription>
        <DialogBody>
          <Field label="Summary">
            {(control) => <Textarea {...control} rows={3} />}
          </Field>
        </DialogBody>
        <DialogFooter>
          <Checkbox label="Notify subscribers" />
          <Button onClick={() => setOpen(false)}>Publish</Button>
        </DialogFooter>
      </DialogRoot>
    </>
  );
}
`,ui=`import { useState } from "react";
import { Button, Dialog } from "@alien6-studio/elea-ui";

const pages = Array.from({ length: 32 }, (_, index) => index + 1);

export function ProofReading() {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<"xl" | "full">("xl");

  function read(next: "xl" | "full") {
    setSize(next);
    setOpen(true);
  }

  return (
    <>
      <Button variant="outline" onClick={() => read("xl")}>
        Read the proof
      </Button>
      <Button variant="outline" onClick={() => read("full")}>
        Read in the full window
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        size={size}
        scroll="body"
        title="Proof of the harbour issue"
        description="The title and the actions stay while the pages scroll."
        closeLabel="Close"
        actions={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Ask for changes
            </Button>
            <Button onClick={() => setOpen(false)}>Approve</Button>
          </>
        }
      >
        <ol>
          {pages.map((page) => (
            <li key={page}>
              Page {page}, set in two columns with its captions and credits.
            </li>
          ))}
        </ol>
      </Dialog>
    </>
  );
}
`,di=`import { useState } from "react";
import {
  Button,
  type ButtonLinkRenderProps,
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuSeparator,
  MenuTrigger,
} from "@alien6-studio/elea-ui";

type LinkProps = Omit<ButtonLinkRenderProps, "href"> & { to: string };

function Link({ to, children, ...props }: LinkProps) {
  return <a href={to} {...props}>{children}</a>;
}

const renderLink = ({ href, ...props }: ButtonLinkRenderProps) => (
  <Link {...props} to={href} />
);

export function AccountMenu() {
  const [signedIn, setSignedIn] = useState(true);

  if (!signedIn) {
    return <Button onClick={() => setSignedIn(true)}>Sign in</Button>;
  }

  return (
    <MenuRoot>
      <MenuTrigger>
        {(props) => (
          <Button variant="outline" {...props}>
            Account
          </Button>
        )}
      </MenuTrigger>
      <MenuContent
        label="Account"
        header={
          <>
            <strong>Maya Okafor</strong>
            <br />
            Harbour Press
          </>
        }
      >
        <MenuItem href="/typography" render={renderLink}>
          Typography
        </MenuItem>
        <MenuItem href="/colours" render={renderLink}>
          Colours
        </MenuItem>
        <MenuItem href="/billing" render={renderLink} disabled>
          Billing
        </MenuItem>
        <MenuSeparator />
        <MenuItem onSelect={() => setSignedIn(false)}>Sign out</MenuItem>
      </MenuContent>
    </MenuRoot>
  );
}
`,fi=`import { useState } from "react";
import { Button, Menu } from "@alien6-studio/elea-ui";

export function ArticleActions() {
  const [last, setLast] = useState("nothing yet");

  return (
    <>
      <Menu
        label="Article actions"
        items={[
          { id: "edit", label: "Edit", onSelect: () => setLast("edit") },
          { id: "share", label: "Share", onSelect: () => setLast("share") },
          {
            id: "archive",
            label: "Archive",
            disabled: true,
            onSelect: () => setLast("archive"),
          },
          {
            id: "delete",
            label: "Delete",
            danger: true,
            onSelect: () => setLast("delete"),
          },
        ]}
        trigger={(props) => (
          <Button variant="outline" {...props}>
            Actions
          </Button>
        )}
      />
      <p>Last action: {last}</p>
    </>
  );
}
`,pi=`import { useState } from "react";
import {
  Button,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuRoot,
  MenuSeparator,
  MenuTrigger,
} from "@alien6-studio/elea-ui";

export function MoreActions() {
  const [last, setLast] = useState("nothing yet");

  return (
    <>
      <MenuRoot>
        <MenuTrigger>
          {(props) => (
            <Button variant="outline" {...props}>
              More
            </Button>
          )}
        </MenuTrigger>
        <MenuContent label="More actions">
          <MenuItem onSelect={() => setLast("rename")}>Rename</MenuItem>
          <MenuItem onSelect={() => setLast("duplicate")}>Duplicate</MenuItem>
          <MenuSeparator />
          <MenuGroup label="Share">
            <MenuItem onSelect={() => setLast("copy link")}>Copy link</MenuItem>
            <MenuItem onSelect={() => setLast("send by mail")} disabled>
              Send by mail
            </MenuItem>
          </MenuGroup>
          <MenuSeparator />
          <MenuItem onSelect={() => setLast("delete")} danger>
            Delete
          </MenuItem>
        </MenuContent>
      </MenuRoot>
      <p>Last action: {last}</p>
    </>
  );
}
`,mi=`import { Button, IconButton, Tooltip } from "@alien6-studio/elea-ui";

export function SaveDraftTooltips() {
  return (
    <>
      <Tooltip content="Saves a draft without publishing">
        <Button variant="outline">Save draft</Button>
      </Tooltip>
      <Tooltip content="Shown below" placement="bottom">
        <IconButton label="Help">?</IconButton>
      </Tooltip>
    </>
  );
}
`,hi=`import { Tooltip } from "@alien6-studio/elea-ui";

export function TruncatedTitle() {
  return (
    <>
      <div className="report-title">
        <Tooltip content="Quarterly revenue by region">
          <span className="report-title__text">
            Quarterly revenue by region
          </span>
        </Tooltip>
      </div>
      <span>
        <Tooltip content="Bare text takes a hint too">Plain text</Tooltip>
      </span>
    </>
  );
}
`,gi=`import { useState } from "react";
import { Pagination } from "@alien6-studio/elea-ui";

const labels = {
  navigation: "Pagination",
  previous: "Previous page",
  next: "Next page",
  page: "Page {page}",
  summary: "{from}–{to} of {total}",
};

export function ArticlePages() {
  const [page, setPage] = useState(3);

  return (
    <Pagination
      page={page}
      pageCount={12}
      onPageChange={setPage}
      totalItems={115}
      pageSize={10}
      labels={labels}
    />
  );
}
`,_i=`import { useState } from "react";
import { Pagination } from "@alien6-studio/elea-ui";

const labels = {
  navigation: "Pagination",
  previous: "Previous",
  next: "Next",
  page: "Page {page}",
};

export function PageLabels() {
  const [page, setPage] = useState(3);

  return (
    <Pagination
      showLabels
      page={page}
      pageCount={12}
      onPageChange={setPage}
      labels={labels}
    />
  );
}
`,vi=`import { useState } from "react";
import { Select } from "@alien6-studio/elea-ui";

const languages = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch", disabled: true },
  { value: "es", label: "Español" },
];

export function LanguageSelect() {
  const [language, setLanguage] = useState<string | null>("fr");

  return (
    <>
      <Select
        label="Language"
        value={language}
        onChange={setLanguage}
        placeholder="Pick a language"
        options={languages}
      />
      <Select
        size="sm"
        label="Language, small"
        value={language}
        onChange={setLanguage}
        options={languages}
      />
      <Select
        label="Disabled"
        value="fr"
        onChange={() => {}}
        options={languages}
        disabled
      />
      <p>Selected: {language ?? "none"}</p>
    </>
  );
}
`,yi=`import { useState } from "react";
import { Select } from "@alien6-studio/elea-ui";

const week = [
  { value: "mon", label: "Monday" },
  { value: "tue", label: "Tuesday" },
  { value: "wed", label: "Wednesday" },
  { value: "thu", label: "Thursday" },
  { value: "fri", label: "Friday" },
];

export function DaysSelect() {
  const [days, setDays] = useState<string[]>(["mon", "wed"]);

  return (
    <>
      <Select
        multiple
        label="Days"
        value={days}
        onChange={setDays}
        placeholder="Pick days"
        summary={(values) => \`\${values.length} day(s)\`}
        options={week}
      />
      <Select
        multiple
        label="Days, labels joined"
        value={days}
        onChange={setDays}
        placeholder="Pick days"
        options={week}
      />
      <p>Selected: {days.join(", ") || "none"}</p>
    </>
  );
}
`,bi=`import { useState } from "react";
import { Field, Select } from "@alien6-studio/elea-ui";

const languages = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch", disabled: true },
  { value: "es", label: "Español" },
];

export function PublicationLanguage() {
  const [language, setLanguage] = useState<string | null>(null);

  return (
    <Field
      label="Publication language"
      required
      help="Used for publication labels."
      error={language === null ? "Choose a language." : undefined}
    >
      {({ id, required, ...accessibility }) => (
        <Select
          id={id}
          triggerProps={{ ...accessibility, "aria-required": required }}
          value={language}
          onChange={setLanguage}
          placeholder="Pick a language"
          options={languages}
        />
      )}
    </Field>
  );
}
`,xi=`import { useState, type SubmitEvent } from "react";
import { Button, RadioGroup } from "@alien6-studio/elea-ui";

const options = [
  {
    value: "daily",
    label: "Daily digest",
    description: "Receive a summary each morning.",
  },
  {
    value: "weekly",
    label: "Weekly digest",
    description: "Receive one summary on Monday.",
  },
  { value: "instant", label: "Every update", disabled: true },
];

export function EmailDelivery() {
  const [saved, setSaved] = useState<string>();

  function save(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const delivery = new FormData(event.currentTarget).get("delivery");
    if (typeof delivery === "string") setSaved(delivery);
  }

  return (
    <form onSubmit={save}>
      <RadioGroup
        label="Email delivery"
        name="delivery"
        defaultValue="weekly"
        options={options}
      />
      <Button type="submit">Save preferences</Button>
      <output aria-live="polite">{saved && \`Saved delivery: \${saved}\`}</output>
    </form>
  );
}
`,Si=`import { Tabs } from "@alien6-studio/elea-ui";

const tabs = [
  {
    value: "details",
    label: "Details",
    panel: <p>Review the article title, author and publication date.</p>,
  },
  {
    value: "revisions",
    label: "Revisions",
    panel: <p>Two revisions are available for this article.</p>,
  },
  { value: "analytics", label: "Analytics", panel: null, disabled: true },
];

export function DocumentInspector() {
  return (
    <Tabs label="Article information" defaultValue="details" items={tabs} />
  );
}
`,Ci=`import { Tabs } from "@alien6-studio/elea-ui";

const tabs = [
  {
    value: "details",
    label: "Details",
    panel: <p>Review the article title, author and publication date.</p>,
  },
  {
    value: "revisions",
    label: "Revisions",
    panel: <p>Two revisions are available for this article.</p>,
  },
  { value: "analytics", label: "Analytics", panel: null, disabled: true },
];

export function SegmentedTabs() {
  return (
    <Tabs
      presentation="segmented"
      label="Article sections"
      defaultValue="details"
      items={tabs}
    />
  );
}
`,wi=`import {
  Badge,
  Tab,
  TabList,
  TabPanel,
  TabsRoot,
} from "@alien6-studio/elea-ui";

export function CommentsRail() {
  return (
    <TabsRoot defaultValue="open">
      <TabList label="Comments" presentation="rail">
        <Tab value="open">
          Open{" "}
          <Badge tone="primary" variant="subtle">
            3
          </Badge>
        </Tab>
        <Tab value="resolved">
          Resolved <Badge variant="subtle">12</Badge>
        </Tab>
      </TabList>
      <p>
        <strong>Comments on “Field notes”</strong>
      </p>
      <TabPanel value="open">Three comments wait for an answer.</TabPanel>
      <TabPanel value="resolved">
        Twelve comments were resolved this month.
      </TabPanel>
    </TabsRoot>
  );
}
`,Ti=`import { Footer } from "@alien6-studio/elea-ui";

const groups = [
  {
    label: "Resources",
    links: [{ label: "Documentation", href: "/docs/getting-started/" }],
  },
];

export function ProductFooter() {
  return (
    <Footer brand={<strong>Field notes</strong>} groups={groups}>
      Editorial workspace
    </Footer>
  );
}
`,Ei=`import { Button } from "@alien6-studio/elea-ui";

export function ButtonEffects() {
  return (
    <>
      <Button effect="lift">Lift</Button>
      <Button effect="scale">Scale</Button>
      <Button effect="push">Push</Button>
      <Button effect="shine">Shine</Button>
      <Button effect="ripple">Ripple</Button>
      <Button effect="spotlight">Spotlight</Button>
      <Button effect="magnetic">Magnetic</Button>
      <Button effect="tilt">Tilt</Button>
    </>
  );
}
`,Di=`import { Button } from "@alien6-studio/elea-ui";

export function ButtonRadii() {
  return (
    <>
      <Button>Publish</Button>
      <Button radius="none">Publish</Button>
      <Button radius="sm">Publish</Button>
      <Button radius="md">Publish</Button>
      <Button radius="lg">Publish</Button>
      <Button radius="full">Publish</Button>
    </>
  );
}
`,Oi=`import { useState } from "react";
import { SearchAutocomplete } from "@alien6-studio/elea-ui";

type Destination = {
  id: string;
  label: string;
  description: string;
  href: string;
};

const guides: readonly Destination[] = [
  {
    id: "calendar",
    label: "Calendar",
    description: "Forms",
    href: "/guides/calendar",
  },
  {
    id: "card",
    label: "Card",
    description: "Display",
    href: "/guides/card",
  },
  {
    id: "carousel",
    label: "Carousel",
    description: "Navigation",
    href: "/guides/carousel",
  },
];

function statusFor(count: number) {
  if (count === 0) return "No matching guides";
  return count === 1 ? "1 guide" : \`\${count} guides\`;
}

export function GuideSearch({
  destinations = guides,
}: Readonly<{
  destinations?: readonly Destination[];
}>) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const results = destinations.filter((item) =>
    item.label.toLowerCase().includes(needle),
  );

  return (
    <SearchAutocomplete
      label="Find a guide"
      placeholder="Calendar, card, carousel"
      clearLabel="Clear query"
      value={query}
      onValueChange={setQuery}
      results={results}
      status={statusFor(results.length)}
      autoSelectFirst
    />
  );
}
`,ki=(e,t)=>`Group ${e+1} of ${t}`;function Ai(){return(0,U.jsxs)(`form`,{"aria-label":`Bank and business identifiers`,onSubmit:e=>e.preventDefault(),className:`identifier-form`,children:[(0,U.jsx)(R,{label:`IBAN`,children:e=>(0,U.jsx)(at,{...e,label:`IBAN`,name:`iban`,segmentLabel:ki})}),(0,U.jsx)(R,{label:`Test card number`,help:`Try 4242 4242 4242 4242.`,children:e=>(0,U.jsx)(ot,{...e,label:`Test card number`,name:`card`,segmentLabel:ki,autoComplete:`off`})}),(0,U.jsxs)(`div`,{className:`identifier-form__business`,children:[(0,U.jsx)(R,{label:`SIREN`,help:`Nine digits identify a French business.`,children:e=>(0,U.jsx)(rt,{...e,label:`SIREN`,name:`siren`,segmentLabel:ki})}),(0,U.jsx)(R,{label:`SIRET`,help:`The last five digits identify its establishment.`,children:e=>(0,U.jsx)(it,{...e,label:`SIRET`,name:`siret`,segmentLabel:ki})})]})]})}var ji=`import {
  CardNumberInput,
  Field,
  IbanInput,
  SirenInput,
  SiretInput,
} from "@alien6-studio/elea-ui";

const segmentLabel = (index: number, count: number) =>
  \`Group \${index + 1} of \${count}\`;

export function IdentifierFields() {
  return (
    <form
      aria-label="Bank and business identifiers"
      onSubmit={(event) => event.preventDefault()}
      className="identifier-form"
    >
      <Field label="IBAN">
        {(control) => (
          <IbanInput
            {...control}
            label="IBAN"
            name="iban"
            segmentLabel={segmentLabel}
          />
        )}
      </Field>
      <Field label="Test card number" help="Try 4242 4242 4242 4242.">
        {(control) => (
          <CardNumberInput
            {...control}
            label="Test card number"
            name="card"
            segmentLabel={segmentLabel}
            autoComplete="off"
          />
        )}
      </Field>
      <div className="identifier-form__business">
        <Field label="SIREN" help="Nine digits identify a French business.">
          {(control) => (
            <SirenInput
              {...control}
              label="SIREN"
              name="siren"
              segmentLabel={segmentLabel}
            />
          )}
        </Field>
        <Field
          label="SIRET"
          help="The last five digits identify its establishment."
        >
          {(control) => (
            <SiretInput
              {...control}
              label="SIRET"
              name="siret"
              segmentLabel={segmentLabel}
            />
          )}
        </Field>
      </div>
    </form>
  );
}
`,Mi=`import { useState } from "react";
import { Field } from "@alien6-studio/elea-ui";
import {
  PhoneInput,
  phoneToE164,
  type CountryCode,
} from "@alien6-studio/elea-ui/phone";

export function CountryTelephone() {
  const [country, setCountry] = useState<CountryCode>("FR");
  const [value, setValue] = useState("0199000123");
  const international = phoneToE164(value, country);

  return (
    <div className="telephone-form">
      <Field label="Telephone number">
        {(control) => (
          <PhoneInput
            {...control}
            name="telephone"
            locale="en"
            country={country}
            onCountryChange={setCountry}
            value={value}
            onValueChange={setValue}
            labels={{
              country: "Country or region",
              countryPlaceholder: "Find a country or calling code",
              empty: "No matching countries",
            }}
          />
        )}
      </Field>
      <Field label="International number (E.164)">
        {({ id }) => (
          <output id={id}>{international ?? "Enter a complete number"}</output>
        )}
      </Field>
    </div>
  );
}
`,Ni=`import { useState } from "react";
import { blocksToHtml, htmlToBlocks } from "@alien6-studio/elea-content";
import { ContentEditor } from "@alien6-studio/elea-content-editor";
import { Button } from "@alien6-studio/elea-ui";
import "@alien6-studio/elea-content-editor/styles.css";

const savedCaption = "<p>Evening light on the <em>glacier</em>.</p>";

export function CaptionEditor() {
  const [blocks, setBlocks] = useState(() => htmlToBlocks(savedCaption));
  const [submitted, setSubmitted] = useState<string>();
  return (
    <form
      aria-label="Exhibition caption"
      className="caption-form"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(blocksToHtml(blocks));
      }}
    >
      <ContentEditor
        mode="classic"
        width="full"
        blockTypes={["paragraph"]}
        blocks={blocks}
        onBlocksChange={setBlocks}
        maxLength={140}
      />
      <div>
        <Button type="submit" size="sm">
          Save caption
        </Button>
      </div>
      {submitted !== undefined && (
        <output aria-label="Saved HTML">
          <code>{submitted || "Empty caption"}</code>
        </output>
      )}
    </form>
  );
}
`,Pi=`import { useState } from "react";
import type { EleaBlock } from "@alien6-studio/elea-content";
import { ContentEditor } from "@alien6-studio/elea-content-editor";
import { Alert } from "@alien6-studio/elea-ui";
import "@alien6-studio/elea-content-editor/styles.css";

const savedNote: EleaBlock[] = [
  { id: "title", type: "header", data: { text: "Cover", level: 2 } },
  { id: "rule", type: "delimiter", data: {} },
  {
    id: "note",
    type: "paragraph",
    data: {
      text: 'Crop as in the <a href="https://example.org/brief">brief</a>.',
    },
  },
];

export function ReviewNote() {
  const [blocks, setBlocks] = useState(savedNote);
  const [leftOut, setLeftOut] = useState(0);

  return (
    <div className="review-note">
      <ContentEditor
        mode="classic"
        width="full"
        blockTypes={["paragraph", "list"]}
        marks={["bold", "italic", "link"]}
        blocks={blocks}
        onBlocksChange={setBlocks}
        onBlocksLeftOut={(left) => setLeftOut(left.length)}
      />
      {leftOut > 0 && (
        <Alert
          tone="warning"
          role="status"
          title="Part of the note is left out"
        >
          Blocks without text this field cannot store: {leftOut}.
        </Alert>
      )}
    </div>
  );
}
`,Fi=`import { Field, Textarea } from "@alien6-studio/elea-ui";

export function PhotoCaption() {
  return (
    <Field label="Photo caption">
      {(control) => (
        <Textarea
          {...control}
          defaultValue="Ice at dawn"
          counter={{ max: 80 }}
        />
      )}
    </Field>
  );
}
`,Ii=`import { Field, Input } from "@alien6-studio/elea-ui";

export function ArchiveNumber() {
  return (
    <Field label="Archive number" help="Nine digits in groups of three.">
      {(control) => (
        <Input
          {...control}
          name="archive"
          inputMode="numeric"
          mask="### ### ###"
          placeholder="123 456 789"
        />
      )}
    </Field>
  );
}
`,Li=(0,W.lazy)(()=>ke(()=>import(`./CountryTelephone-hSS-dXJb.js`).then(e=>({default:e.CountryTelephone})),__vite__mapDeps([0,1,2,3,4,5,6,7]))),Ri=(0,W.lazy)(()=>ke(()=>import(`./ReviewNote-BrxiNxRV.js`).then(e=>({default:e.ReviewNote})),__vite__mapDeps([8,1,9,10,11,12,3,4,7,13,14,15,16,17,18,19,20]))),zi=(0,W.lazy)(()=>ke(()=>import(`./CaptionEditor-Do2-kYBP.js`).then(e=>({default:e.CaptionEditor})),__vite__mapDeps([21,1,9,10,11,12,3,4,7,13,14,15,16,17,18,19])));function Bi(){return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(H,{title:`Character counter`,description:`A soft limit lets writers paste a draft and shorten it. Set maxLength as well when the form requires a hard limit.`,code:Fi,children:(0,U.jsx)(`div`,{style:{width:`min(100%, 24rem)`},children:(0,U.jsx)(R,{label:`Photo caption`,children:e=>(0,U.jsx)(y,{...e,defaultValue:`Ice at dawn`,counter:{max:80}})})})}),(0,U.jsx)(H,{title:`Grouped input mask`,description:`Each # takes one digit. Type or paste the archive number. The native input and its change event carry the formatted value.`,code:Ii,children:(0,U.jsx)(`div`,{style:{width:`min(100%, 24rem)`},children:(0,U.jsx)(R,{label:`Archive number`,help:`Nine digits in groups of three.`,children:e=>(0,U.jsx)(b,{...e,name:`archive`,inputMode:`numeric`,mask:`### ### ###`,placeholder:`123 456 789`})})})}),(0,U.jsx)(H,{title:`Bank and business identifiers`,description:`Paste a whole identifier or edit a single group. Each field submits one value with the spaces removed.`,code:ji,children:(0,U.jsx)(Ai,{})}),(0,U.jsx)(H,{title:`Telephone numbers by country`,description:`Choose a country for a national number, or paste a number starting with +. An E.164 value appears when the number has a possible length for its numbering plan.`,code:Mi,children:(0,U.jsx)(W.Suspense,{fallback:(0,U.jsx)(ce,{}),children:(0,U.jsx)(Li,{})})}),(0,U.jsx)(H,{title:`Formatted caption`,description:`Edit a caption of up to 140 characters, then save it to see the HTML your form can store.`,code:Ni,children:(0,U.jsx)(W.Suspense,{fallback:(0,U.jsx)(ce,{}),children:(0,U.jsx)(zi,{})})}),(0,U.jsx)(H,{title:`A field that accepts part of the editor`,description:(0,U.jsxs)(U.Fragment,{children:[`This note accepts paragraphs and lists, with bold, italic and links. The saved heading is shown as a paragraph, its rule is left out and reported through `,(0,U.jsx)(`code`,{children:`onBlocksLeftOut`}),`. Place the caret in the link and use the link control to change, remove or open its address.`]}),code:Pi,children:(0,U.jsx)(W.Suspense,{fallback:(0,U.jsx)(ce,{}),children:(0,U.jsx)(Ri,{})})})]})}var Vi=[`lift`,`scale`,`push`,`shine`,`ripple`,`spotlight`,`magnetic`,`tilt`],Hi=e=>e[0].toUpperCase()+e.slice(1),Ui=[`primary`,`secondary`,`tertiary`,`neutral`,`danger`,`warning`,`success`,`info`],Wi=[`solid`,`outline`,`ghost`],Gi={"--elea-shape-action":`1.5rem 0.25rem 1rem 0.5rem`,"--elea-button-radius-sm":`0.75rem 0.125rem 0.5rem 0.25rem`},Ki={"--elea-control-radius":`0.25rem 1rem 0.5rem 0`};function qi({to:e,...t}){return(0,U.jsx)(`a`,{href:e,...t})}var Ji=({href:e,...t})=>(0,U.jsx)(qi,{...t,to:e}),Yi=[{label:`Inherited`,radius:void 0},{label:`None`,radius:`none`},{label:`Small`,radius:`sm`},{label:`Medium`,radius:`md`},{label:`Large`,radius:`lg`},{label:`Full`,radius:`full`}],Xi={"--elea-color-action-info":`light-dark(#0e7490, #67e8f9)`,"--elea-color-action-info-text":`light-dark(white, black)`,"--elea-color-action-info-hover":`color-mix(in srgb, var(--elea-color-action-info) 90%, light-dark(black, white))`,"--elea-color-action-info-pressed":`color-mix(in srgb, var(--elea-color-action-info) 80%, light-dark(black, white))`};function Zi({brand:e=i}){let t=e.buttonRadiusScale===`profile`&&e.shape&&!e.radius?`Small and Medium tighten each curve of the theme’s silhouette and Large matches Inherited. None gives square corners and Full gives a pill.`:`Inherited follows the current theme. Small, Medium and Large use its corner radius values. None gives square corners and Full gives a pill.`;return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`h1`,{children:`Button`}),(0,U.jsx)(`p`,{className:`lead`,children:`A button inherits its shape and palette from the active theme. Choose its tone for meaning, its variant for emphasis and its size for the layout.`}),(0,U.jsx)(H,{title:`Variants`,description:(0,U.jsxs)(U.Fragment,{children:[`A plain `,(0,U.jsx)(`code`,{children:`<Button>`}),` uses the primary colour at medium size. Each variant below draws from the same theme and inherits its action shape.`]}),code:Gr,children:(0,U.jsx)(Or,{})}),(0,U.jsx)(H,{title:`Tone and emphasis`,description:(0,U.jsxs)(U.Fragment,{children:[`Each row uses the same eight colour roles. Compare a tone across solid, outline and ghost, then switch the theme in the navbar. `,(0,U.jsx)(`code`,{children:`variant="danger"`}),` is shorthand for `,(0,U.jsx)(`code`,{children:`variant="solid" tone="danger"`}),`.`]}),code:Kr,children:(0,U.jsx)(`div`,{style:{display:`grid`,gap:`var(--elea-space-5)`,width:`100%`},children:Wi.map(e=>(0,U.jsxs)(`div`,{role:`group`,"aria-label":e,children:[(0,U.jsx)(`strong`,{children:e.charAt(0).toUpperCase()+e.slice(1)}),(0,U.jsx)(`div`,{style:{display:`flex`,flexWrap:`wrap`,gap:`var(--elea-space-2)`,marginTop:`var(--elea-space-2)`},children:Ui.map(t=>(0,U.jsx)(m,{variant:e,tone:t,"aria-label":`${t} ${e}`,children:t},t))})]},e))})}),(0,U.jsx)(H,{title:`An info colour of its own`,description:`The Info button above uses the active theme. This example gives one button a teal fill and defines its text, hover and pressed colours for light and dark appearances.`,code:qr,children:(0,U.jsx)(m,{variant:`info`,style:Xi,children:`Teal info`})}),(0,U.jsx)(H,{title:`Sizes and icons`,description:`Five sizes, from a compact toolbar action to a landing page call to action.`,code:Jr,children:(0,U.jsx)(Mr,{})}),(0,U.jsx)(H,{title:`Radius`,description:t,code:Di,children:(0,U.jsx)(`div`,{className:`catalog-button-radii`,children:Yi.map(({label:e,radius:t})=>(0,U.jsxs)(`figure`,{children:[(0,U.jsx)(m,{radius:t,"aria-label":`Publish (${e})`,children:`Publish`}),(0,U.jsx)(`figcaption`,{children:e})]},e))})}),(0,U.jsx)(H,{title:`Asymmetric corners`,description:`Read the four corners clockwise from the top left. Publish uses the theme silhouette. Save draft has an explicit small radius. Filter inherits the toolbar’s control radius.`,code:Yr,children:(0,U.jsxs)(`div`,{className:`catalog-button-radii`,style:Gi,children:[(0,U.jsxs)(`figure`,{children:[(0,U.jsx)(m,{children:`Publish`}),(0,U.jsx)(`figcaption`,{children:`Action silhouette`})]}),(0,U.jsxs)(`figure`,{children:[(0,U.jsx)(m,{size:`sm`,radius:`sm`,children:`Save draft`}),(0,U.jsx)(`figcaption`,{children:`Small radius`})]}),(0,U.jsxs)(`figure`,{style:Ki,children:[(0,U.jsx)(m,{children:`Filter`}),(0,U.jsx)(`figcaption`,{children:`Toolbar override`})]})]})}),(0,U.jsx)(H,{title:`Shadow`,description:`The default follows the theme. An explicit shadow adds elevation on a busy surface.`,code:Xr,children:(0,U.jsx)(Nr,{})}),(0,U.jsx)(H,{title:`Loading and disabled`,description:`Save shows a pending state for two seconds.`,code:Zr,children:(0,U.jsx)(Pr,{})}),(0,U.jsxs)(H,{title:`Router links`,description:(0,U.jsxs)(U.Fragment,{children:[`The first link opens the Card guide. Pass the button’s children and event handlers to your router link, mapping `,(0,U.jsx)(`code`,{children:`href`}),` to `,(0,U.jsx)(`code`,{children:`to`}),`. When disabled or loading, ELEA renders an unfocusable anchor with `,(0,U.jsx)(`code`,{children:`aria-disabled`}),` and no destination.`]}),code:Qr,children:[(0,U.jsx)(m,{href:a(`ui/card`,e),render:Ji,children:`Open Card guide`}),(0,U.jsx)(m,{href:a(`ui/card`,e),render:Ji,disabled:!0,children:`Guide unavailable`})]}),(0,U.jsxs)(H,{title:`Motion`,description:`Hover or press these two buttons. The first follows the gallery’s Expressive motion switch. The second stays still. Both respect the visitor’s reduced-motion preference.`,code:$r,children:[(0,U.jsx)(m,{children:`Follows the page`}),(0,U.jsx)(m,{motion:!1,children:`Always still`})]}),(0,U.jsx)(H,{title:`Effects`,description:`Try each gesture on the same primary button. All eight share the theme’s colour, shape and size. With expressive motion on, Push has a raised edge that sinks when pressed.`,code:Ei,children:(0,U.jsx)(`div`,{className:`catalog-button-effects`,children:Vi.map(e=>(0,U.jsx)(m,{effect:e,children:Hi(e)},e))})}),(0,U.jsx)(`h2`,{children:`Props`}),(0,U.jsx)(V,{rows:[{name:`variant`,type:`"solid" | "outline" | "ghost" | "primary" | "secondary" | "tertiary" | "danger" | "success" | "info" | "warning"`,defaultValue:`"primary"`,description:`Surface treatment. Colour variants are shorthands for solid buttons.`},{name:`tone`,type:`"primary" | "secondary" | "tertiary" | "neutral" | "danger" | "warning" | "success" | "info"`,description:`Colour role for the surface. An explicit tone takes precedence over a colour variant.`},{name:`size`,type:`"xs" | "sm" | "md" | "lg" | "xl"`,defaultValue:`"md"`,description:`Height and type size.`},{name:`radius`,type:`"none" | "sm" | "md" | "lg" | "full"`,defaultValue:`Theme shape`,description:`Override the inherited action shape with an explicit corner radius.`},{name:`shadow`,type:`"none" | "sm" | "md"`,defaultValue:`"none"`,description:`A resting shadow that lifts the button off the surface.`},{name:`effect`,type:`"lift" | "scale" | "push" | "shine" | "ripple" | "spotlight" | "magnetic" | "tilt"`,defaultValue:`"lift"`,description:`The gesture played under expressive motion. It does nothing while motion is off.`},{name:`icon, trailingIcon`,type:`ReactNode`,description:`Icons before and after the label, hidden from assistive technology.`},{name:`loading`,type:`boolean`,defaultValue:`false`,description:`Shows a spinner, keeps the label for layout, blocks interaction.`},{name:`loadingLabel`,type:`string`,description:`Accessible name while loading.`},{name:`href`,type:`string`,description:`Renders an anchor styled as a button.`},{name:`render`,type:`(props: ButtonLinkRenderProps) => ReactElement`,description:`Renders the active link through a host router. Requires href.`},{name:`fullWidth`,type:`boolean`,defaultValue:`false`,description:`Stretches to the container.`},{name:`motion`,type:`boolean`,description:`Turns expressive motion on or off for this button. By default it follows the nearest data-elea-motion container.`}]})]})}function Qi(){return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`h1`,{children:`Badge`}),(0,U.jsx)(`p`,{className:`lead`,children:`A small label for a status or a count.`}),(0,U.jsx)(H,{title:`Tones`,code:ei,children:(0,U.jsx)(Fr,{})}),(0,U.jsx)(`h2`,{children:`Props`}),(0,U.jsx)(V,{rows:[{name:`tone`,type:`"neutral" | "primary" | "secondary" | "success" | "info" | "warning" | "danger"`,defaultValue:`"neutral"`,description:`Color meaning.`},{name:`variant`,type:`"subtle" | "solid" | "outline"`,defaultValue:`"subtle"`,description:`Fill style.`},{name:`size`,type:`"sm" | "md"`,defaultValue:`"md"`,description:`Compact or regular.`},{name:`icon`,type:`ReactNode`,description:`Icon before the text.`}]})]})}var $i=[{id:`calendar`,label:`Calendar`,description:`Forms`,href:`#/ui/calendar`},{id:`card`,label:`Card`,description:`Display`,href:`#/ui/card`},{id:`carousel`,label:`Carousel`,description:`Navigation`,href:`#/ui/carousel`}];function ea(){let[e,t]=(0,W.useState)(``),n=e.length>0&&!e.includes(`@`);return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`h1`,{children:`Field, Input, Textarea`}),(0,U.jsx)(`p`,{className:`lead`,children:`Pair a native control with its label, help and validation message. Spread the provided control props to associate all three.`}),(0,U.jsx)(H,{title:`A validated field`,description:`Type something without an @ to see the error.`,code:ti,children:(0,U.jsx)(`div`,{style:{width:`20rem`},children:(0,U.jsx)(R,{label:`Email`,help:`We never share it`,error:n?`Enter a valid address`:void 0,required:!0,requiredMarker:`*`,children:r=>(0,U.jsx)(b,{...r,type:`email`,value:e,onChange:e=>t(e.target.value),invalid:n})})})}),(0,U.jsx)(H,{title:`Textarea and sizes`,code:ni,children:(0,U.jsxs)(`div`,{style:{display:`grid`,gap:`var(--elea-space-3)`,width:`20rem`},children:[(0,U.jsx)(b,{size:`sm`,placeholder:`Small`,"aria-label":`Small`}),(0,U.jsx)(b,{placeholder:`Medium`,"aria-label":`Medium`}),(0,U.jsx)(b,{size:`lg`,placeholder:`Large`,"aria-label":`Large`}),(0,U.jsx)(y,{placeholder:`A longer text`,"aria-label":`A longer text`})]})}),(0,U.jsx)(Bi,{}),(0,U.jsx)(H,{title:`SearchField`,description:`Type a query and use the clear button to start again. Pass value and onValueChange to filter a collection as you type.`,code:ri,children:(0,U.jsx)(Ir,{})}),(0,U.jsx)(H,{title:`SearchAutocomplete`,description:`Type to find a destination. Use the arrow keys to explore matches and Enter to follow a link.`,code:Oi,children:(0,U.jsx)(Dr,{destinations:$i})}),(0,U.jsx)(`h2`,{children:`Props of Field`}),(0,U.jsx)(V,{rows:[{name:`label`,type:`ReactNode`,description:`Visible label, linked to the control.`},{name:`help, error`,type:`ReactNode`,description:`Texts under the control; the error is announced as an alert.`},{name:`required, requiredMarker`,type:`boolean, ReactNode`,description:`Marks the field required; the marker is visual only.`},{name:`children`,type:`(control) => ReactNode`,description:`Renders the control with id, aria-describedby, aria-invalid and required.`}]}),(0,U.jsx)(`h2`,{children:`Props of Input and Textarea`}),(0,U.jsx)(V,{rows:[{name:`counter`,type:`{ max: number }`,description:`Show a live character count and flag overflow. Use native maxLength for a hard limit.`},{name:`format`,type:`InputFormat (Input)`,description:`Format bank details, business identifiers or telephone numbers while editing. The preset parses display text into a compact value.`},{name:`mask`,type:`string (Input)`,description:`Use # for a digit and literals for separators, such as ### ### ###.`},{name:`invalid`,type:`boolean`,description:`Paints the error state and sets aria-invalid.`},{name:`size`,type:`"sm" | "md" | "lg"`,description:`Height and type size of an Input.`},{name:`ref`,type:`Ref<HTMLInputElement | HTMLTextAreaElement>`,description:`Reaches the native control, so register() from a form library spreads onto it.`},{name:`className`,type:`string`,description:`Added after Elea’s classes; see UI integration for the order to keep with Tailwind utilities.`}]})]})}function ta(){let[e,t]=(0,W.useState)(!1);return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`h1`,{children:`Checkbox and Toggle`}),(0,U.jsx)(`p`,{className:`lead`,children:`Use a checkbox for an independent choice and a toggle for an on/off setting. Both use native form controls.`}),(0,U.jsx)(H,{title:`Checkbox`,code:ii,children:(0,U.jsxs)(`div`,{style:{display:`grid`,gap:`var(--elea-space-3)`},children:[(0,U.jsx)(L,{label:`Send me the newsletter`,description:`Once a month, no more`,checked:e,onCheckedChange:t}),(0,U.jsx)(L,{label:`Partially selected`,indeterminate:!0,readOnly:!0}),(0,U.jsx)(L,{label:`Disabled`,disabled:!0})]})}),(0,U.jsx)(H,{title:`Toggle`,code:ai,children:(0,U.jsx)(Lr,{})}),(0,U.jsx)(`h2`,{children:`Props`}),(0,U.jsx)(V,{rows:[{name:`label`,type:`ReactNode`,description:`Visible name for either control.`},{name:`checked, onCheckedChange`,type:`boolean, (checked: boolean) => void`,description:`Connect the state to your form. Toggle requires both props.`},{name:`defaultChecked`,type:`boolean`,description:`Initial state for an uncontrolled Checkbox.`},{name:`indeterminate`,type:`boolean`,defaultValue:`false`,description:`Display a Checkbox with a mixed state.`},{name:`disabled`,type:`boolean`,description:`Prevent the control from changing or participating in form submission.`}]})]})}function na({brand:e}){let t=e?`brand`:`editorial`,n=e?`Open themed dialog`:`Open in Editorial`,r=e?`Themed dialog`:`Editorial edition`,[i,o]=(0,W.useState)(!1),[s,c]=(0,W.useState)(!1),[l,u]=(0,W.useState)(`nothing yet`);return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`h1`,{children:`Dialog`}),(0,U.jsx)(`p`,{className:`lead`,children:`Bring a decision into focus. Ask someone to share an article or confirm its deletion before they return to the page.`}),(0,U.jsx)(H,{title:`Dialog and ConfirmDialog`,code:oi,children:(0,U.jsx)(Rr,{})}),(0,U.jsxs)(H,{title:`A typed confirmation`,description:`Deleted: ${l}. ConfirmDialog takes the same field as ConfirmPopover. With expected, the confirm button stays disabled until the text matches exactly, and it is described by the label of the field.`,code:si,children:[(0,U.jsx)(m,{variant:`danger`,onClick:()=>c(!0),children:`Delete project`}),(0,U.jsx)(zt,{open:s,tone:`danger`,icon:(0,U.jsx)(Ar,{}),title:`Delete this project?`,description:`Type the name of the project to delete it.`,field:{label:`Name of the project: field-notes`,expected:`field-notes`},confirmLabel:`Delete`,cancelLabel:`Keep`,closeLabel:`Close`,onConfirm:e=>{u(e??``),c(!1)},onCancel:()=>c(!1)})]}),(0,U.jsx)(H,{title:`Inside a themed container`,description:`A dialog leaves its container for the end of the page and keeps the theme it was opened from: it copies the nearest data-elea-theme.`,code:ci,children:(0,U.jsxs)(`section`,{"data-elea-theme":t,children:[(0,U.jsx)(m,{onClick:()=>o(!0),children:n}),(0,U.jsx)(Rt,{open:i,onClose:()=>o(!1),title:r,description:`The tokens of the container reach this dialog.`,closeLabel:`Close`,actions:(0,U.jsx)(m,{onClick:()=>o(!1),children:`Done`})})]})}),(0,U.jsx)(H,{title:`Composed from its parts`,description:`DialogRoot keeps the focus trap, Escape and the backdrop; the parts give the header, the body and the footer another shape.`,code:li,children:(0,U.jsx)(zr,{})}),(0,U.jsx)(H,{title:`Wide content and a scrolling body`,description:(0,U.jsxs)(U.Fragment,{children:[`The `,(0,U.jsx)(`code`,{children:`xl`}),` size gives a long document room, and `,(0,U.jsx)(`code`,{children:`full`}),` takes the window less its margin. With `,(0,U.jsx)(`code`,{children:`scroll="body"`}),` the title and the actions stay in place while the content scrolls.`]}),code:ui,children:(0,U.jsx)(Vr,{})}),(0,U.jsx)(`h2`,{children:`Props`}),(0,U.jsx)(V,{rows:[{name:`open, onClose`,type:`boolean, () => void`,description:`Controlled visibility.`},{name:`title, description`,type:`ReactNode`,description:`Named and described through ARIA.`},{name:`closeLabel`,type:`string`,description:`Accessible name of the close control.`},{name:`actions`,type:`ReactNode`,description:`Footer buttons.`},{name:`size`,type:`"sm" | "md" | "lg" | "xl" | "full"`,defaultValue:`"md"`,description:`Maximum width. full takes the window, less its margin.`},{name:`scroll`,type:`"surface" | "body"`,defaultValue:`"surface"`,description:`What scrolls when the content outgrows the window. With body, the header and the actions stay in place.`},{name:`dismissOnBackdrop`,type:`boolean`,defaultValue:`true`,description:`A click outside closes the dialog.`},{name:`motion`,type:`boolean`,description:`Turns the entrance on or off for this dialog. A dialog is rendered in a portal, so by default it follows data-elea-motion on the page, not on its container.`}]}),(0,U.jsxs)(`p`,{children:[`ConfirmDialog adds `,(0,U.jsx)(`code`,{children:`onConfirm`}),`, `,(0,U.jsx)(`code`,{children:`onCancel`}),`, the two labels, `,(0,U.jsx)(`code`,{children:`tone`}),`, `,(0,U.jsx)(`code`,{children:`icon`}),`, `,(0,U.jsx)(`code`,{children:`loading`}),` and an optional `,(0,U.jsx)(`code`,{children:`field`}),` that collects a value with the answer: see `,(0,U.jsx)(`a`,{href:a(`ui/popover`,e),children:`ConfirmField`}),`.`]}),(0,U.jsx)(`h2`,{children:`Parts`}),(0,U.jsx)(V,{parts:!0,rows:[{name:`DialogRoot`,type:`open, onClose, size, scroll, dismissOnBackdrop, motion`,description:`The modal surface alone. Its DialogTitle names it.`},{name:`DialogHeader`,type:`children`,description:`The row that holds the title and the close control.`},{name:`DialogTitle`,type:`children`,description:`The heading that names the dialog.`},{name:`DialogClose`,type:`label: string`,description:`The close control, with its accessible name.`},{name:`DialogDescription`,type:`children`,description:`Describes the dialog through ARIA while it is rendered.`},{name:`DialogBody, DialogFooter`,type:`children`,description:`The content and the row of actions.`}]})]})}function ra(){let[e,t]=(0,W.useState)(`nothing yet`);return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`h1`,{children:`Menu`}),(0,U.jsx)(`p`,{className:`lead`,children:`Group related article actions under one control. Keep destructive choices identifiable and disable actions that are unavailable.`}),(0,U.jsx)(H,{title:`Actions menu`,description:`Last action: ${e}`,code:fi,children:(0,U.jsx)(ln,{label:`Article actions`,items:[{id:`edit`,label:`Edit`,onSelect:()=>t(`edit`)},{id:`share`,label:`Share`,onSelect:()=>t(`share`)},{id:`archive`,label:`Archive`,disabled:!0,onSelect:()=>t(`archive`)},{id:`delete`,label:`Delete`,danger:!0,onSelect:()=>t(`delete`)}],trigger:e=>(0,U.jsx)(m,{variant:`outline`,...e,children:`Actions`})})}),(0,U.jsx)(H,{title:`Separators and groups`,description:`Compose the menu from its parts when the actions need sorting. The arrow keys cross the groups and skip what is disabled.`,code:pi,children:(0,U.jsxs)(rn,{children:[(0,U.jsx)(an,{children:e=>(0,U.jsx)(m,{variant:`outline`,...e,children:`More`})}),(0,U.jsxs)(on,{label:`More actions`,children:[(0,U.jsx)(K,{onSelect:()=>t(`rename`),children:`Rename`}),(0,U.jsx)(K,{onSelect:()=>t(`duplicate`),children:`Duplicate`}),(0,U.jsx)(sn,{}),(0,U.jsxs)(cn,{label:`Share`,children:[(0,U.jsx)(K,{onSelect:()=>t(`copy link`),children:`Copy link`}),(0,U.jsx)(K,{onSelect:()=>t(`send by mail`),disabled:!0,children:`Send by mail`})]}),(0,U.jsx)(sn,{}),(0,U.jsx)(K,{onSelect:()=>t(`delete`),danger:!0,children:`Delete`})]})]})}),(0,U.jsx)(H,{title:`Links and a header`,description:(0,U.jsxs)(U.Fragment,{children:[`An item with `,(0,U.jsx)(`code`,{children:`href`}),` is a link: here the first two open the Typography and Colours pages of this site. Pass `,(0,U.jsx)(`code`,{children:`render`}),` to hand it to your router link, as with Button. The header names the account and describes the menu to assistive technology.`]}),code:di,children:(0,U.jsxs)(rn,{children:[(0,U.jsx)(an,{children:e=>(0,U.jsx)(m,{variant:`outline`,...e,children:`Account`})}),(0,U.jsxs)(on,{label:`Account`,header:(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`strong`,{children:`Maya Okafor`}),(0,U.jsx)(`br`,{}),`Harbour Press`]}),children:[(0,U.jsx)(K,{href:`/typography/`,render:Ji,children:`Typography`}),(0,U.jsx)(K,{href:`/playground/#/colours`,render:Ji,children:`Colours`}),(0,U.jsx)(K,{href:`/playground/#/colours`,render:Ji,disabled:!0,children:`Billing`}),(0,U.jsx)(sn,{}),(0,U.jsx)(K,{onSelect:()=>t(`sign out`),children:`Sign out`})]})]})}),(0,U.jsx)(`h2`,{children:`Props`}),(0,U.jsx)(V,{rows:[{name:`label`,type:`string`,description:`Accessible name of the menu.`},{name:`trigger`,type:`(props) => ReactNode`,description:`Render the trigger and spread its keyboard, click and ARIA props.`},{name:`items`,type:`MenuItemData[]`,description:`Each item has an id and a label, then an onSelect callback for an action or an href for a link, with an optional render for your router. It may also be destructive or disabled.`},{name:`header`,type:`ReactNode`,description:`Content above the items, such as a name and a company. It describes the menu.`},{name:`align`,type:`"start" | "end"`,defaultValue:`"start"`,description:`Align the menu to an edge of its trigger.`}]}),(0,U.jsx)(`h2`,{children:`Parts`}),(0,U.jsx)(V,{parts:!0,rows:[{name:`MenuRoot`,type:`children`,description:`Holds the open state; a click outside closes the menu.`},{name:`MenuTrigger`,type:`(props) => ReactNode`,description:`Render the trigger and spread its keyboard, click and ARIA props.`},{name:`MenuContent`,type:`label, align, header`,description:`The list, present while the menu is open.`},{name:`MenuItem`,type:`onSelect, href, render, icon, disabled, danger`,description:`One action, or a link when href is given. Choosing it closes the menu and returns the focus to the trigger.`},{name:`MenuSeparator`,type:`—`,description:`A line between two sets of actions.`},{name:`MenuGroup`,type:`label: ReactNode`,description:`Actions that belong together, under the heading that names them.`}]})]})}function ia(){return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`h1`,{children:`Tooltip`}),(0,U.jsx)(`p`,{className:`lead`,children:`A short hint on hover and focus, described to assistive technology.`}),(0,U.jsx)(H,{title:`On a button`,code:mi,children:(0,U.jsx)(Hr,{})}),(0,U.jsxs)(H,{title:`Over truncated text`,code:hi,children:[(0,U.jsx)(`div`,{style:{width:`7.5rem`,overflow:`hidden`,border:`1px solid var(--elea-color-border-default)`,borderRadius:`var(--elea-radius-md)`,padding:`0.25rem 0.5rem`},children:(0,U.jsx)(mn,{content:`Quarterly revenue by region`,children:(0,U.jsx)(`span`,{style:{display:`block`,overflow:`hidden`,textOverflow:`ellipsis`,whiteSpace:`nowrap`},children:`Quarterly revenue by region`})})}),(0,U.jsx)(`span`,{children:(0,U.jsx)(mn,{content:`Bare text takes a hint too`,children:`Plain text`})})]}),(0,U.jsx)(`p`,{children:`The pointer can move onto the hint, and Escape dismisses it. The hint is rendered only while it shows, above any container that clips its content, and it flips or shifts to stay inside the viewport. The wrapper generates no box, so the trigger keeps its own layout.`}),(0,U.jsx)(`h2`,{children:`Props`}),(0,U.jsx)(V,{rows:[{name:`content`,type:`ReactNode`,description:`Short hint associated with the trigger.`},{name:`children`,type:`ReactNode`,description:`Text, an element or a component. A single element gets aria-describedby while the hint shows.`},{name:`placement`,type:`"top" | "bottom"`,defaultValue:`"top"`,description:`Preferred side of the hint, which moves to the other one when this one lacks room.`}]})]})}function aa(){let[e,t]=(0,W.useState)(3),[n,r]=(0,W.useState)(3),[i,a]=(0,W.useState)(3),o={navigation:`Pagination`,previous:`Previous`,next:`Next`,page:`Page {page}`};return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`h1`,{children:`Pagination`}),(0,U.jsx)(`p`,{className:`lead`,children:`Help readers browse a long list. Show the pages around their current position, with an optional count of the results in view.`}),(0,U.jsx)(H,{title:`Twelve pages`,code:gi,children:(0,U.jsx)(`div`,{style:{width:`100%`},children:(0,U.jsx)(z,{page:e,pageCount:12,onPageChange:t,totalItems:115,pageSize:10,labels:{navigation:`Pagination`,previous:`Previous page`,next:`Next page`,page:`Page {page}`,summary:`{from}–{to} of {total}`}})})}),(0,U.jsxs)(H,{title:`Previous and next with their labels`,description:`With showLabels the two buttons show labels.previous and labels.next beside an arrow the component draws, mirrors in right-to-left and hides from assistive technology. In a narrow container, like the second one, the text gives way to the arrows and the accessible names stay.`,code:_i,children:[(0,U.jsx)(`div`,{style:{width:`100%`},children:(0,U.jsx)(z,{showLabels:!0,page:n,pageCount:12,onPageChange:r,labels:o})}),(0,U.jsx)(`div`,{style:{width:`100%`,maxWidth:`24rem`},children:(0,U.jsx)(z,{showLabels:!0,page:i,pageCount:12,onPageChange:a,labels:{...o,navigation:`Pagination in a narrow container`}})})]}),(0,U.jsx)(`h2`,{children:`Props`}),(0,U.jsx)(V,{rows:[{name:`page, pageCount`,type:`number`,description:`Current page, starting at one, and the total number of pages.`},{name:`onPageChange`,type:`(page: number) => void`,description:`Update the page and its results.`},{name:`labels`,type:`PaginationLabels`,description:`Names for navigation and buttons, plus an optional summary template.`},{name:`totalItems, pageSize`,type:`number`,description:`Use these to calculate the visible range in the summary.`},{name:`window`,type:`number`,defaultValue:`5`,description:`Size of the page window around the current page.`},{name:`showLabels`,type:`boolean`,defaultValue:`false`,description:`Show labels.previous and labels.next as text beside the arrows. The navigation then measures its own width, so give it a container to fill.`}]})]})}function oa(){let[e,t]=(0,W.useState)(`fr`),[n,r]=(0,W.useState)([`mon`,`wed`]),[i,a]=(0,W.useState)(null),o=[{value:`fr`,label:`Français`},{value:`en`,label:`English`},{value:`de`,label:`Deutsch`,disabled:!0},{value:`es`,label:`Español`}],s=[{value:`mon`,label:`Monday`},{value:`tue`,label:`Tuesday`},{value:`wed`,label:`Wednesday`},{value:`thu`,label:`Thursday`},{value:`fri`,label:`Friday`}];return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`h1`,{children:`Select`}),(0,U.jsxs)(`p`,{className:`lead`,children:[`Offer a compact list of options. Choose a single language, or enable `,(0,U.jsx)(`code`,{children:`multiple`}),` to pick several days of the week.`]}),(0,U.jsxs)(H,{title:`Single value`,description:`Selected: ${e??`none`}`,code:vi,children:[(0,U.jsx)(j,{label:`Language`,value:e,onChange:t,placeholder:`Pick a language`,options:o}),(0,U.jsx)(j,{size:`sm`,label:`Language, small`,value:e,onChange:t,options:o}),(0,U.jsx)(j,{label:`Disabled`,value:`fr`,onChange:()=>{},options:o,disabled:!0})]}),(0,U.jsxs)(H,{title:`Checklist`,description:`Selected: ${n.join(`, `)||`none`}`,code:yi,children:[(0,U.jsx)(j,{multiple:!0,label:`Days`,value:n,onChange:r,placeholder:`Pick days`,summary:e=>`${e.length} day(s)`,options:s}),(0,U.jsx)(j,{multiple:!0,label:`Days, labels joined`,value:n,onChange:r,placeholder:`Pick days`,options:s})]}),(0,U.jsx)(H,{title:`In a field`,code:bi,children:(0,U.jsx)(`div`,{style:{width:`16rem`},children:(0,U.jsx)(R,{label:`Publication language`,required:!0,help:`Used for publication labels.`,error:i===null?`Choose a language.`:void 0,children:({id:e,required:t,...n})=>(0,U.jsx)(j,{id:e,triggerProps:{...n,"aria-required":t},value:i,onChange:a,placeholder:`Pick a language`,options:o})})})}),(0,U.jsx)(`h2`,{children:`Props`}),(0,U.jsx)(V,{rows:[{name:`options`,type:`{ value, label, disabled? }[]`,description:`The choices; labels can be any content.`},{name:`value, onChange`,type:`string | null, (value) => void`,description:`Controlled value; with multiple, a string array both ways.`},{name:`multiple`,type:`boolean`,defaultValue:`false`,description:`A checklist: the list stays open, each option toggles.`},{name:`summary`,type:`(values) => ReactNode`,description:`What the trigger shows for several values; labels joined by default.`},{name:`label, labelledBy`,type:`string`,description:`Accessible name, or the id of a visible label.`},{name:`placeholder, size, disabled, invalid, name`,type:`…`,description:`As on a field; name adds hidden inputs for forms.`}]})]})}var sa=[{value:`daily`,label:`Daily digest`,description:`Receive a summary each morning.`},{value:`weekly`,label:`Weekly digest`,description:`Receive one summary on Monday.`},{value:`instant`,label:`Every update`,disabled:!0}];function ca(){let[e,t]=(0,W.useState)();return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`h1`,{children:`RadioGroup`}),(0,U.jsx)(`p`,{className:`lead`,children:`Let people compare a short list of mutually exclusive choices. Each option can include a description.`}),(0,U.jsx)(H,{title:`Notification preferences`,description:`Choose a delivery schedule and save to read the submitted form value.`,code:xi,children:(0,U.jsxs)(`form`,{className:`catalog-form`,onSubmit:e=>{e.preventDefault();let n=new FormData(e.currentTarget).get(`delivery`);typeof n==`string`&&t(n)},children:[(0,U.jsx)(ue,{label:`Email delivery`,name:`delivery`,defaultValue:`weekly`,options:sa}),(0,U.jsx)(m,{type:`submit`,children:`Save preferences`}),(0,U.jsx)(`output`,{"aria-live":`polite`,children:e&&`Saved delivery: ${e}`})]})}),(0,U.jsx)(`h2`,{children:`Props`}),(0,U.jsx)(V,{rows:[{name:`label, name`,type:`ReactNode, string`,description:`Visible group name and the form key shared by its radios.`},{name:`options`,type:`readonly RadioOption[]`,description:`Each option has a unique value, label and optional description or disabled state.`},{name:`defaultValue`,type:`string`,description:`Initial choice for an uncontrolled form.`},{name:`value, onChange`,type:`string | null, (value: string) => void`,description:`Keep the selection in your application state.`},{name:`help, error`,type:`ReactNode`,description:`Attach instructions or validation to the group.`},{name:`required, disabled`,type:`boolean`,description:`Applies to the group as a whole.`}]})]})}var la=[{value:`details`,label:`Details`,panel:(0,U.jsx)(`p`,{children:`Review the article title, author and publication date.`})},{value:`revisions`,label:`Revisions`,panel:(0,U.jsx)(`p`,{children:`Two revisions are available for this article.`})},{value:`analytics`,label:`Analytics`,panel:null,disabled:!0}];function ua(){return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`h1`,{children:`Tabs`}),(0,U.jsx)(`p`,{className:`lead`,children:`Switch between related views of a document while keeping the surrounding page in place.`}),(0,U.jsx)(H,{title:`Document inspector`,description:`The theme chooses the presentation. Use the arrow keys to move between tabs.`,code:Si,children:(0,U.jsx)(ve,{className:`catalog-tabs`,label:`Article information`,defaultValue:`details`,items:la})}),(0,U.jsx)(H,{title:`Segmented tabs`,description:`The selected view is inset from the border of the list.`,code:Ci,children:(0,U.jsx)(Wr,{})}),(0,U.jsx)(H,{title:`Composed rail`,description:`The selected view has a top border. The list and panels can sit where the layout needs them.`,code:wi,children:(0,U.jsxs)(_e,{className:`catalog-tabs`,defaultValue:`open`,children:[(0,U.jsxs)(ye,{label:`Comments`,presentation:`rail`,children:[(0,U.jsxs)(xe,{value:`open`,children:[`Open `,(0,U.jsx)(u,{tone:`primary`,variant:`subtle`,children:`3`})]}),(0,U.jsxs)(xe,{value:`resolved`,children:[`Resolved `,(0,U.jsx)(u,{variant:`subtle`,children:`12`})]})]}),(0,U.jsx)(`p`,{children:(0,U.jsx)(`strong`,{children:`Comments on “Field notes”`})}),(0,U.jsx)(be,{value:`open`,children:`Three comments wait for an answer.`}),(0,U.jsx)(be,{value:`resolved`,children:`Twelve comments were resolved this month.`})]})}),(0,U.jsx)(`h2`,{children:`Props`}),(0,U.jsx)(V,{rows:[{name:`label`,type:`string`,description:`Accessible name for the tab list.`},{name:`items`,type:`readonly TabItem[]`,description:`Tabs with a unique value, label, panel and optional disabled state.`},{name:`defaultValue`,type:`string`,description:`Initial selection when the tab set manages its own state.`},{name:`value, onChange`,type:`string, (value: string) => void`,description:`Connect the active view to application state.`},{name:`keepMounted`,type:`boolean`,description:`Keep inactive panels mounted to retain their local state.`},{name:`presentation`,type:`"underline" | "segmented" | "rail"`,defaultValue:`Theme`,description:`Set a presentation explicitly to override the theme. Standalone tabs use an underline.`}]}),(0,U.jsx)(`h2`,{children:`Parts`}),(0,U.jsx)(V,{parts:!0,rows:[{name:`TabsRoot`,type:`value, defaultValue, onChange, keepMounted`,description:`Holds the selection. Without value or defaultValue, no tab starts selected.`},{name:`TabList`,type:`label: string, presentation`,description:`The row of tabs and its keyboard navigation.`},{name:`Tab`,type:`value: string, disabled`,description:`One tab; its children are free.`},{name:`TabPanel`,type:`value: string, keepMounted`,description:`The content of the tab with the same value.`}]})]})}function da(){return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`h1`,{children:`Footer`}),(0,U.jsx)(`p`,{className:`lead`,children:`Bring product identity, grouped navigation and a studio signature together at the end of a page.`}),(0,U.jsx)(H,{title:`Product footer`,code:Ti,children:(0,U.jsx)(de,{brand:(0,U.jsx)(`strong`,{children:`Field notes`}),groups:[{label:`Resources`,links:[{label:`Documentation`,href:`/getting-started/`}]}],children:`Editorial workspace`})}),(0,U.jsx)(`h2`,{children:`Props`}),(0,U.jsx)(V,{rows:[{name:`brand`,type:`ReactNode`,description:`Product identity or a short description in the leading column.`},{name:`groups`,type:`readonly FooterGroup[]`,description:`Named navigation groups containing links with labels and hrefs.`},{name:`children`,type:`ReactNode`,description:`A signature or legal links in the lower row.`}]})]})}var fa=`import { Carousel } from "@alien6-studio/elea-ui";

const plates = [
  { src: "/plates/primary.webp", alt: "Primary colours" },
  { src: "/plates/secondary.webp", alt: "Secondary colours" },
  { src: "/plates/tertiary.webp", alt: "Tertiary colours" },
  { src: "/plates/complements.webp", alt: "Complementary pairs" },
];

export function SinglePlate() {
  return (
    <Carousel
      items={plates}
      itemKey={(plate) => plate.src}
      loop
      label="Single plate"
      roleDescription="carousel"
      previousLabel="Previous plate"
      nextLabel="Next plate"
      navigation="arrows"
      getDotLabel={(index) => \`Show plate \${index + 1}\`}
      renderItem={(plate) => (
        <img src={plate.src} alt={plate.alt} width={840} height={560} />
      )}
    />
  );
}
`,pa=`import { Carousel } from "@alien6-studio/elea-ui";

const plates = [
  { src: "/plates/primary.webp", alt: "Primary colours" },
  { src: "/plates/secondary.webp", alt: "Secondary colours" },
  { src: "/plates/tertiary.webp", alt: "Tertiary colours" },
  { src: "/plates/complements.webp", alt: "Complementary pairs" },
];

export function ContactSheet() {
  return (
    <Carousel
      items={plates}
      itemKey={(plate) => plate.src}
      loop
      label="Contact sheet"
      roleDescription="carousel"
      previousLabel="Previous plate"
      nextLabel="Next plate"
      defaultIndex={1}
      itemsPerView={2}
      minItemWidth={100}
      gap="sm"
      navigation="dots"
      controlsPosition="bottom"
      controlsAlign="center"
      getDotLabel={(index) => \`Show plate \${index + 1}\`}
      renderItem={(plate) => (
        <img src={plate.src} alt={plate.alt} width={840} height={560} />
      )}
    />
  );
}
`,ma=`import { Carousel } from "@alien6-studio/elea-ui";

const plates = [
  { src: "/plates/primary.webp", alt: "Primary colours" },
  { src: "/plates/secondary.webp", alt: "Secondary colours" },
  { src: "/plates/tertiary.webp", alt: "Tertiary colours" },
  { src: "/plates/complements.webp", alt: "Complementary pairs" },
];

export function Filmstrip() {
  return (
    <Carousel
      items={plates}
      itemKey={(plate) => plate.src}
      loop
      label="Filmstrip"
      roleDescription="carousel"
      previousLabel="Previous plate"
      nextLabel="Next plate"
      defaultIndex={3}
      itemsPerView={3}
      minItemWidth={72}
      gap="none"
      navigation="both"
      controlsPosition="bottom"
      controlsAlign="start"
      showCounter
      getDotLabel={(index) => \`Show plate \${index + 1}\`}
      renderItem={(plate) => (
        <img src={plate.src} alt={plate.alt} width={840} height={560} />
      )}
    />
  );
}
`,ha=`import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardImage,
  CardTitle,
} from "@alien6-studio/elea-ui";

export function EditorialCard() {
  return (
    <Card>
      <CardImage
        src="/images/glacier.webp"
        alt="Blue crevasses and white ridges seen from above a glacier"
        width={1050}
        height={525}
      />
      <CardHeader>
        <CardTitle>The glacier notebook</CardTitle>
        <CardDescription>
          Field notes on the shapes that ice leaves behind.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Badge tone="warning">In review</Badge>
      </CardContent>
      <CardFooter>
        <Button href="/notebooks/glacier" size="sm">
          Open notebook
        </Button>
      </CardFooter>
    </Card>
  );
}
`,ga=`import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@alien6-studio/elea-ui";

export function CardVariants() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Outline</CardTitle>
          <CardDescription>A border on the page surface.</CardDescription>
        </CardHeader>
      </Card>
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Elevated</CardTitle>
          <CardDescription>A shadow lifts it off the page.</CardDescription>
        </CardHeader>
      </Card>
      <Card variant="subtle">
        <CardHeader>
          <CardTitle>Subtle</CardTitle>
          <CardDescription>A quiet fill, without a border.</CardDescription>
        </CardHeader>
      </Card>
    </>
  );
}
`,_a=`import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@alien6-studio/elea-ui";

export function GuideCard() {
  return (
    <Card interactive>
      <CardHeader>
        <CardTitle>
          <a href="/guides/button">Button</a>
        </CardTitle>
        <CardDescription>
          Trigger an action or lead to another page.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
`,va=`import { Card } from "@alien6-studio/elea-ui";

export function CardPadding() {
  return (
    <>
      <Card padding="sm">Small</Card>
      <Card>Medium</Card>
      <Card padding="lg">Large</Card>
    </>
  );
}
`,ya=`import { Button, Separator } from "@alien6-studio/elea-ui";

export function SignInChoice() {
  return (
    <>
      <Button variant="outline">Continue with a passkey</Button>
      <Separator>or</Separator>
      <Button>Sign in with email</Button>
    </>
  );
}
`,ba=`import { Separator } from "@alien6-studio/elea-ui";

export function ArticleFacts() {
  return (
    <>
      <span>Draft</span>
      <Separator orientation="vertical" />
      <span>1 240 words</span>
      <Separator orientation="vertical" />
      <span>6 min read</span>
    </>
  );
}
`,xa=`import { useState } from "react";
import { Avatar, Skeleton, Toggle } from "@alien6-studio/elea-ui";

export function LoadingArticle() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <Toggle label="Loading" checked={loading} onCheckedChange={setLoading} />
      <article aria-busy={loading}>
        {loading ? (
          <>
            <Skeleton variant="circle" width={40} height={40} />
            <Skeleton width="40%" />
            <Skeleton lines={3} />
          </>
        ) : (
          <>
            <Avatar name="Ada Lovelace" />
            <strong>Ada Lovelace</strong>
            <p>Cranes crossed the valley at dawn, earlier than any year.</p>
          </>
        )}
      </article>
    </>
  );
}
`,Sa=`import { Skeleton } from "@alien6-studio/elea-ui";

export function SkeletonShapes() {
  return (
    <>
      <Skeleton variant="circle" width={48} height={48} />
      <Skeleton variant="rect" width={160} height={96} />
      <Skeleton width={180} />
    </>
  );
}
`,Ca=`import { Skeleton } from "@alien6-studio/elea-ui";

export function ListRows() {
  return <Skeleton variant="rect" height={44} count={3} />;
}
`,wa=`import { Skeleton } from "@alien6-studio/elea-ui";

// In the stylesheet of the application:
//
// .brand-placeholder {
//   background-color: color-mix(
//     in srgb,
//     var(--elea-color-primary-500) 30%,
//     transparent
//   );
//   border-radius: var(--elea-radius-full);
// }

export function BrandPlaceholders() {
  return (
    <>
      <Skeleton
        variant="rect"
        height={28}
        count={3}
        blockClassName="brand-placeholder"
      />
      <Skeleton lines={3} blockClassName="brand-placeholder" />
    </>
  );
}
`,Ta=`import { useState } from "react";
import { Avatar, Button, Skeleton, Toggle } from "@alien6-studio/elea-ui";

export function ProfileHeader() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <Toggle
        label="Loading the profile"
        checked={loading}
        onCheckedChange={setLoading}
      />
      <Skeleton loading={loading}>
        <Avatar name="Ada Lovelace" />
      </Skeleton>
      <Skeleton loading={loading}>
        <strong>Ada Lovelace</strong>
      </Skeleton>
      <Skeleton loading={loading}>Member since 2019</Skeleton>
      <Skeleton loading={loading}>
        <Button variant="secondary">Follow</Button>
      </Skeleton>
    </>
  );
}
`,Ea=`import {
  AvatarSkeleton,
  BadgeSkeleton,
  ButtonSkeleton,
  CardSkeleton,
  FieldSkeleton,
  TableSkeleton,
} from "@alien6-studio/elea-ui";

export function Companions() {
  return (
    <>
      <AvatarSkeleton size="lg" />
      <ButtonSkeleton>Save changes</ButtonSkeleton>
      <BadgeSkeleton>Draft</BadgeSkeleton>
      <FieldSkeleton help />
      <CardSkeleton
        description
        lines={2}
        footer={<ButtonSkeleton size="sm">Open</ButtonSkeleton>}
      />
      <TableSkeleton rows={2} columns={3} />
    </>
  );
}
`,Da=`import { useState } from "react";
import {
  Button,
  SkeletonRegion,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableSkeleton,
} from "@alien6-studio/elea-ui";

const orders = [
  { id: "#1042", status: "Shipped" },
  { id: "#1043", status: "Packed" },
];

export function OrdersRegion() {
  const [fetching, setFetching] = useState(false);

  function reload(duration: number) {
    setFetching(true);
    setTimeout(() => setFetching(false), duration);
  }

  return (
    <>
      <Button disabled={fetching} onClick={() => reload(1500)}>
        Reload slowly
      </Button>
      <Button disabled={fetching} onClick={() => reload(150)}>
        Reload fast
      </Button>
      <SkeletonRegion loading={fetching} label="Loading orders" delay={300}>
        {fetching ? (
          <TableSkeleton rows={2} columns={2} />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Order</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SkeletonRegion>
    </>
  );
}
`,Oa=`import { Avatar } from "@alien6-studio/elea-ui";

export function PictureAndInitials() {
  return (
    <>
      <Avatar name="Ada Lovelace" src="/people/ada.jpg" />
      <Avatar name="Ada Lovelace" />
      <Avatar name="Grace Hopper" tone="primary" />
      <Avatar name="Alan Turing" tone="secondary" />
      <Avatar name="Field notes" shape="square" />
    </>
  );
}
`,ka=`import { Avatar } from "@alien6-studio/elea-ui";

export function AvatarSizes() {
  return (
    <>
      <Avatar size="xs" name="Ada Lovelace" />
      <Avatar size="sm" name="Ada Lovelace" />
      <Avatar name="Ada Lovelace" />
      <Avatar size="lg" name="Ada Lovelace" />
      <Avatar size="xl" name="Ada Lovelace" />
    </>
  );
}
`,Aa=`import { Avatar, AvatarGroup } from "@alien6-studio/elea-ui";

export function Editors() {
  return (
    <AvatarGroup aria-label="Editors" max={3}>
      <Avatar name="Ada Lovelace" tone="primary" />
      <Avatar name="Grace Hopper" />
      <Avatar name="Alan Turing" tone="secondary" />
      <Avatar name="Katherine Johnson" />
      <Avatar name="Hedy Lamarr" />
    </AvatarGroup>
  );
}
`,ja=`import { Alert } from "@alien6-studio/elea-ui";
import { InfoIcon } from "../icons";

export function AlertTones() {
  return (
    <>
      <Alert title="Draft saved">Your changes are kept on this device.</Alert>
      <Alert
        tone="primary"
        icon={<InfoIcon />}
        title="A new version is available"
      />
      <Alert tone="success" title="Article published">
        It is now visible to everyone.
      </Alert>
      <Alert
        tone="info"
        icon={<InfoIcon />}
        title="Maintenance is planned for Sunday"
      />
      <Alert tone="warning" title="Your session ends in five minutes" />
      <Alert tone="danger" title="The article could not be saved">
        Check your connection and try again.
      </Alert>
    </>
  );
}
`,Ma=`import { useState } from "react";
import { Alert, Button } from "@alien6-studio/elea-ui";
import { InfoIcon } from "../icons";

export function EditingNotice() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <Alert
      variant="outline"
      tone="primary"
      icon={<InfoIcon />}
      title="Two people are editing this article"
      actions={
        <Button size="sm" variant="outline">
          See who
        </Button>
      }
      onDismiss={() => setDismissed(true)}
      dismissLabel="Dismiss"
    >
      Your changes merge as you type.
    </Alert>
  );
}
`,Na=`
.house-alerts {
  display: grid;
  gap: 0.65rem;
  --elea-alert-success-surface: light-dark(#e3f1e7, #12301f);
  --elea-alert-success-border: light-dark(#2f7d4f, #62b884);
  --elea-alert-success-text: light-dark(#133d26, #d3efdd);
  --elea-alert-danger-surface: light-dark(#fbe9e6, #3a1613);
  --elea-alert-danger-border: light-dark(#b3261e, #ee8a82);
  --elea-alert-danger-text: light-dark(#5a1410, #fad7d3);
}
`;function Pa(){return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`style`,{children:Na}),(0,U.jsxs)(`div`,{className:`house-alerts`,children:[(0,U.jsx)(s,{tone:`success`,title:`Article published`,children:`It is now visible to everyone.`}),(0,U.jsx)(s,{tone:`danger`,title:`The article could not be saved`,children:`Check your connection and try again.`}),(0,U.jsx)(s,{tone:`info`,title:`Maintenance is planned for Sunday`})]})]})}var Fa=`import { Alert } from "@alien6-studio/elea-ui";

const css = \`
.house-alerts {
  display: grid;
  gap: 0.65rem;
  --elea-alert-success-surface: light-dark(#e3f1e7, #12301f);
  --elea-alert-success-border: light-dark(#2f7d4f, #62b884);
  --elea-alert-success-text: light-dark(#133d26, #d3efdd);
  --elea-alert-danger-surface: light-dark(#fbe9e6, #3a1613);
  --elea-alert-danger-border: light-dark(#b3261e, #ee8a82);
  --elea-alert-danger-text: light-dark(#5a1410, #fad7d3);
}
\`;

export function HouseAlerts() {
  return (
    <>
      <style>{css}</style>
      <div className="house-alerts">
        <Alert tone="success" title="Article published">
          It is now visible to everyone.
        </Alert>
        <Alert tone="danger" title="The article could not be saved">
          Check your connection and try again.
        </Alert>
        <Alert tone="info" title="Maintenance is planned for Sunday" />
      </div>
    </>
  );
}
`,Ia=`import { useState } from "react";
import { Button, Progress } from "@alien6-studio/elea-ui";

const total = 8;

export function UploadProgress() {
  const [files, setFiles] = useState(3);

  return (
    <>
      <Progress
        label="Uploading images"
        value={files}
        max={total}
        showValue
        formatValue={(value, max) => \`\${value} of \${max} files\`}
      />
      <Button
        size="sm"
        variant="outline"
        onClick={() => setFiles((count) => (count >= total ? 0 : count + 1))}
      >
        {files >= total ? "Start again" : "Upload next file"}
      </Button>
    </>
  );
}
`,La=`import { Progress } from "@alien6-studio/elea-ui";

export function ExportProgress() {
  return <Progress label="Preparing the export" />;
}
`,Ra=`import { Progress } from "@alien6-studio/elea-ui";

export function ProgressTones() {
  return (
    <>
      <Progress size="sm" value={30} aria-label="Storage used" />
      <Progress tone="success" value={100} label="Published" showValue />
      <Progress tone="info" value={45} label="Import" showValue />
      <Progress tone="warning" value={82} label="Storage" showValue />
      <Progress size="lg" tone="danger" value={96} label="Quota" showValue />
    </>
  );
}
`,za=`data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2064%2064'%3e%3crect%20width='64'%20height='64'%20fill='%23c7d2fe'/%3e%3ccircle%20cx='32'%20cy='25'%20r='12'%20fill='%234338ca'/%3e%3cpath%20d='M8%2064c2-16%2012-24%2024-24s22%208%2024%2024z'%20fill='%234338ca'/%3e%3c/svg%3e`,Ba=()=>(0,U.jsxs)(`svg`,{viewBox:`0 0 24 24`,width:`1em`,height:`1em`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,"aria-hidden":`true`,children:[(0,U.jsx)(`circle`,{cx:`12`,cy:`12`,r:`9`}),(0,U.jsx)(`path`,{d:`M12 11v5M12 7.5v.5`})]}),Va=Object.values(g),Ha=[{title:`Single plate`,code:fa,layout:{navigation:`arrows`}},{title:`Contact sheet`,code:pa,layout:{defaultIndex:1,itemsPerView:2,minItemWidth:100,gap:`sm`,navigation:`dots`,controlsPosition:`bottom`,controlsAlign:`center`}},{title:`Filmstrip`,code:ma,layout:{defaultIndex:3,itemsPerView:3,minItemWidth:72,gap:`none`,navigation:`both`,controlsPosition:`bottom`,controlsAlign:`start`,showCounter:!0}}];function Ua({label:e=`Exhibition plates`,...t}){return(0,U.jsx)(le,{items:Va,itemKey:e=>e.src,loop:!0,className:`catalog-plate-carousel`,label:e,roleDescription:`carousel`,previousLabel:`Previous plate`,nextLabel:`Next plate`,getDotLabel:e=>`Show plate ${e+1}`,...t,renderItem:e=>(0,U.jsx)(`img`,{src:e.src,alt:e.alt,width:840,height:e.height??560,loading:`lazy`})})}function Wa(){return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`h1`,{children:`Carousel`}),(0,U.jsx)(`p`,{className:`lead`,children:`Browse the plates from the colour atlas one at a time, in pairs or as a continuous strip.`}),(0,U.jsx)(`div`,{className:`carousel-gallery`,children:Ha.map(({title:e,code:t,layout:n})=>(0,U.jsx)(H,{title:e,code:t,children:(0,U.jsx)(Ua,{label:e,...n})},e))}),(0,U.jsx)(`h2`,{children:`Props`}),(0,U.jsx)(V,{rows:[{name:`items, itemKey, renderItem`,type:`Array and render callbacks`,description:`Provide the collection, a stable key and the content of each slide.`},{name:`label, previousLabel, nextLabel`,type:`string`,description:`Name the collection and its two navigation actions.`},{name:`navigation, getDotLabel`,type:`"arrows" | "dots" | "both", (index: number) => string`,description:`Choose the navigation controls and give each dot a localised accessible name.`},{name:`controlsPosition, controlsAlign`,type:`"top" | "bottom", "start" | "center" | "end"`,description:`Place the controls above or below the slides and align them along the row.`},{name:`showCounter`,type:`boolean`,description:`Display the visible slide numbers and collection size.`},{name:`itemsPerView, minItemWidth`,type:`number`,description:`Set a slide count. Add a minimum width in pixels to fit fewer slides in narrower containers.`},{name:`gap`,type:`"none" | "sm" | "md" | "lg"`,description:`Set the spacing between visible slides.`},{name:`index, onIndexChange`,type:`number, (index: number) => void`,description:`Control the first visible item using a zero-based index.`},{name:`defaultIndex`,type:`number`,defaultValue:`0`,description:`Choose the starting item in an uncontrolled carousel.`},{name:`loop`,type:`boolean`,defaultValue:`false`,description:`Continue at the opposite end when reaching a boundary.`}]})]})}function Ga({brand:e}){return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`h1`,{children:`Card`}),(0,U.jsx)(`p`,{className:`lead`,children:`Group related content on one surface. Use an image, a heading and a footer action when they help someone decide what to open.`}),(0,U.jsx)(H,{title:`Editorial card`,code:ha,children:(0,U.jsxs)(F,{className:`catalog-card-demo`,children:[(0,U.jsx)(ae,{src:Oe.data.file.url,alt:Oe.data.alt,width:1050,height:525}),(0,U.jsxs)(M,{children:[(0,U.jsx)(N,{children:Ee}),(0,U.jsx)(oe,{children:De})]}),(0,U.jsx)(ie,{children:(0,U.jsx)(u,{tone:`warning`,children:`In review`})}),(0,U.jsx)(P,{children:(0,U.jsx)(m,{href:a(`playground`,e),size:`sm`,children:`Open notebook`})})]})}),(0,U.jsx)(H,{title:`Variants`,description:`An outline for lists, an elevation for content that floats, a subtle fill for secondary information.`,code:ga,children:(0,U.jsxs)(`div`,{className:`catalog-cards`,children:[(0,U.jsx)(F,{children:(0,U.jsxs)(M,{children:[(0,U.jsx)(N,{children:`Outline`}),(0,U.jsx)(oe,{children:`A border on the page surface.`})]})}),(0,U.jsx)(F,{variant:`elevated`,children:(0,U.jsxs)(M,{children:[(0,U.jsx)(N,{children:`Elevated`}),(0,U.jsx)(oe,{children:`A shadow lifts it off the page.`})]})}),(0,U.jsx)(F,{variant:`subtle`,children:(0,U.jsxs)(M,{children:[(0,U.jsx)(N,{children:`Subtle`}),(0,U.jsx)(oe,{children:`A quiet fill, without a border.`})]})})]})}),(0,U.jsx)(H,{title:`Interactive card`,description:`The link in the title covers the whole card. Under expressive motion the card lifts on hover.`,code:_a,children:(0,U.jsxs)(`div`,{className:`catalog-cards`,children:[(0,U.jsx)(F,{interactive:!0,children:(0,U.jsxs)(M,{children:[(0,U.jsx)(N,{children:(0,U.jsx)(`a`,{href:a(`ui/button`,e),children:`Button`})}),(0,U.jsx)(oe,{children:`Trigger an action or lead to another page.`})]})}),(0,U.jsx)(F,{interactive:!0,children:(0,U.jsxs)(M,{children:[(0,U.jsx)(N,{children:(0,U.jsx)(`a`,{href:a(`ui/alert`,e),children:`Alert`})}),(0,U.jsx)(oe,{children:`Tell people what happened and what to do next.`})]})})]})}),(0,U.jsxs)(H,{title:`Padding`,code:va,children:[(0,U.jsx)(F,{padding:`sm`,children:`Small`}),(0,U.jsx)(F,{children:`Medium`}),(0,U.jsx)(F,{padding:`lg`,children:`Large`})]}),(0,U.jsx)(`h2`,{children:`Props`}),(0,U.jsx)(V,{rows:[{name:`variant`,type:`"outline" | "elevated" | "subtle"`,defaultValue:`"outline"`,description:`How the surface stands out from the page.`},{name:`padding`,type:`"none" | "sm" | "md" | "lg"`,defaultValue:`"md"`,description:`Space around the parts; none lets an image reach the edges.`},{name:`interactive`,type:`boolean`,defaultValue:`false`,description:`The link in CardTitle covers the card, which answers hover and focus.`},{name:`CardImage`,type:`Native image props`,description:`Set alt and the intrinsic width and height. Use srcSet and sizes for responsive sources.`},{name:`CardHeader, CardContent, CardFooter`,type:`children`,description:`Group the heading, body and actions. Each part is optional.`},{name:`CardTitle as`,type:`"h2" … "h6"`,defaultValue:`"h3"`,description:`Heading level that fits the outline of the page.`},{name:`className, ref`,type:`string, Ref<HTMLDivElement>`,description:`Every part takes className; Card forwards its ref.`}]})]})}function Ka(){return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`h1`,{children:`Separator`}),(0,U.jsx)(`p`,{className:`lead`,children:`Draw a line between two groups of content, across the page or between inline items, with an optional label.`}),(0,U.jsx)(H,{title:`Horizontal, with a label`,code:ya,children:(0,U.jsxs)(`div`,{className:`catalog-stack catalog-fill`,children:[(0,U.jsx)(m,{variant:`outline`,children:`Continue with a passkey`}),(0,U.jsx)(wn,{children:`or`}),(0,U.jsx)(m,{children:`Sign in with email`})]})}),(0,U.jsx)(H,{title:`Vertical`,description:`A vertical separator takes the height of its row.`,code:ba,children:(0,U.jsxs)(`div`,{className:`catalog-row`,children:[(0,U.jsx)(`span`,{children:`Draft`}),(0,U.jsx)(wn,{orientation:`vertical`}),(0,U.jsx)(`span`,{children:`1 240 words`}),(0,U.jsx)(wn,{orientation:`vertical`}),(0,U.jsx)(`span`,{children:`6 min read`})]})}),(0,U.jsx)(`h2`,{children:`Props`}),(0,U.jsx)(V,{rows:[{name:`orientation`,type:`"horizontal" | "vertical"`,defaultValue:`"horizontal"`,description:`Direction of the line.`},{name:`decorative`,type:`boolean`,defaultValue:`true`,description:`Set to false where the line separates content, to expose it as a separator.`},{name:`children`,type:`ReactNode`,description:`A short label in the middle of a horizontal line.`}]})]})}function qa(){let[e,t]=(0,W.useState)(!0),[n,r]=(0,W.useState)(!0),[i,a]=(0,W.useState)(!1),[o,s]=(0,W.useState)(1500);function d(e){s(e),a(!0),setTimeout(()=>a(!1),e)}return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`h1`,{children:`Skeleton`}),(0,U.jsx)(`p`,{className:`lead`,children:`Hold the shape of content while it loads, so the page does not jump when it arrives.`}),(0,U.jsx)(H,{title:`Loading an article`,description:`Under expressive motion a light sweeps across the placeholders; otherwise they pulse gently.`,code:xa,children:(0,U.jsxs)(`div`,{className:`catalog-stack catalog-fill`,children:[(0,U.jsx)(I,{label:`Loading`,checked:e,onCheckedChange:t}),(0,U.jsx)(`article`,{className:`catalog-loading`,"aria-busy":e,"aria-label":`Article preview`,children:e?(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(c,{variant:`circle`,width:40,height:40}),(0,U.jsxs)(`div`,{className:`catalog-stack`,children:[(0,U.jsx)(c,{width:`40%`}),(0,U.jsx)(c,{lines:3})]})]}):(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(q,{name:`Ada Lovelace`}),(0,U.jsxs)(`div`,{className:`catalog-stack`,children:[(0,U.jsx)(`strong`,{children:`Ada Lovelace`}),(0,U.jsx)(`span`,{children:`Cranes crossed the valley at dawn, earlier than any year on record. The count reached four hundred before noon.`})]})]})})]})}),(0,U.jsxs)(H,{title:`Shapes`,code:Sa,children:[(0,U.jsx)(c,{variant:`circle`,width:48,height:48}),(0,U.jsx)(c,{variant:`rect`,width:160,height:96}),(0,U.jsx)(c,{width:180})]}),(0,U.jsx)(H,{title:`A count of blocks`,description:`Stack the same placeholder for the rows of a list.`,code:Ca,children:(0,U.jsx)(`div`,{className:`catalog-fill`,"data-demo":`count`,children:(0,U.jsx)(c,{variant:`rect`,height:44,count:3})})}),(0,U.jsx)(H,{title:`A class on every placeholder`,description:`className names what holds the blocks or the lines; blockClassName reaches each placeholder, so a class of your theme colours and shapes all of them.`,code:wa,children:(0,U.jsxs)(`div`,{className:`catalog-fill catalog-stack`,"data-demo":`block-class`,children:[(0,U.jsx)(c,{variant:`rect`,height:28,count:3,blockClassName:`catalog-skeleton-brand`}),(0,U.jsx)(c,{lines:3,blockClassName:`catalog-skeleton-brand`})]})}),(0,U.jsx)(H,{title:`Around the real content`,description:`With children, the skeleton takes no size of its own: each child stays in the layout, hidden from sight and from assistive technology, and is painted as the placeholder. Nothing moves when the content arrives.`,code:Ta,children:(0,U.jsxs)(`div`,{className:`catalog-stack catalog-fill`,children:[(0,U.jsx)(I,{label:`Loading the profile`,checked:n,onCheckedChange:r}),(0,U.jsxs)(`div`,{className:`catalog-row`,"data-demo":`wrap`,children:[(0,U.jsx)(c,{loading:n,children:(0,U.jsx)(q,{name:`Ada Lovelace`})}),(0,U.jsxs)(`div`,{className:`catalog-stack`,children:[(0,U.jsx)(c,{loading:n,children:(0,U.jsx)(`strong`,{children:`Ada Lovelace`})}),(0,U.jsx)(c,{loading:n,children:`Member since 2019`})]}),(0,U.jsx)(c,{loading:n,children:(0,U.jsx)(m,{variant:`secondary`,children:`Follow`})})]})]})}),(0,U.jsx)(H,{title:`Companions`,description:`A component with a stable shape exports its skeleton, built from the component itself: on each line the skeleton, then the loaded component, with the same box.`,code:Ea,children:(0,U.jsxs)(`div`,{className:`catalog-pairs`,children:[(0,U.jsxs)(`div`,{className:`catalog-pair`,"data-pair":`avatar`,children:[(0,U.jsx)(Dn,{size:`lg`}),(0,U.jsx)(q,{name:`Ada Lovelace`,size:`lg`})]}),(0,U.jsxs)(`div`,{className:`catalog-pair`,"data-pair":`button`,children:[(0,U.jsx)(f,{children:`Save changes`}),(0,U.jsx)(m,{children:`Save changes`})]}),(0,U.jsxs)(`div`,{className:`catalog-pair`,"data-pair":`badge`,children:[(0,U.jsx)(l,{children:`Draft`}),(0,U.jsx)(u,{children:`Draft`})]}),(0,U.jsxs)(`div`,{className:`catalog-pair catalog-pair--wide`,"data-pair":`field`,children:[(0,U.jsx)(ce,{help:!0}),(0,U.jsx)(R,{label:`Email`,help:`We never share it.`,children:e=>(0,U.jsx)(b,{...e,placeholder:`ada@example.org`})})]}),(0,U.jsxs)(`div`,{className:`catalog-pair catalog-pair--wide`,"data-pair":`card`,children:[(0,U.jsx)(se,{description:!0,lines:2,footer:(0,U.jsx)(f,{size:`sm`,children:`Open`})}),(0,U.jsxs)(F,{children:[(0,U.jsxs)(M,{children:[(0,U.jsx)(N,{children:`Weekly report`}),(0,U.jsx)(oe,{children:`Updated today`})]}),(0,U.jsxs)(ie,{children:[`Four hundred cranes by noon.`,(0,U.jsx)(`br`,{}),`Earlier than any year on record.`]}),(0,U.jsx)(P,{children:(0,U.jsx)(m,{size:`sm`,children:`Open`})})]})]}),(0,U.jsxs)(`div`,{className:`catalog-pair catalog-pair--wide`,"data-pair":`table`,children:[(0,U.jsx)(Mn,{rows:2,columns:3}),(0,U.jsxs)(J,{children:[(0,U.jsx)(Y,{children:(0,U.jsxs)(Z,{children:[(0,U.jsx)(Q,{children:`Name`}),(0,U.jsx)(Q,{children:`Role`}),(0,U.jsx)(Q,{children:`Joined`})]})}),(0,U.jsxs)(X,{children:[(0,U.jsxs)(Z,{children:[(0,U.jsx)($,{children:`Ada`}),(0,U.jsx)($,{children:`Engineer`}),(0,U.jsx)($,{children:`2019`})]}),(0,U.jsxs)(Z,{children:[(0,U.jsx)($,{children:`Grace`}),(0,U.jsx)($,{children:`Admiral`}),(0,U.jsx)($,{children:`2021`})]})]})]})]})]})}),(0,U.jsx)(H,{title:`A region that loads`,description:`The region is busy while it loads and announces one label for every placeholder inside. With a delay, a fast load never flashes the placeholders, and their space is kept all along.`,code:Da,children:(0,U.jsxs)(`div`,{className:`catalog-stack catalog-fill`,children:[(0,U.jsxs)(`div`,{className:`catalog-row`,children:[(0,U.jsx)(m,{variant:`secondary`,disabled:i,onClick:()=>d(1500),children:`Reload slowly`}),(0,U.jsx)(m,{variant:`secondary`,disabled:i,onClick:()=>d(150),children:`Reload fast`})]}),(0,U.jsx)(Tn,{loading:i,label:`Loading orders`,delay:300,"data-demo":`region`,"data-wait":o,children:i?(0,U.jsx)(Mn,{rows:2,columns:2}):(0,U.jsxs)(J,{children:[(0,U.jsx)(Y,{children:(0,U.jsxs)(Z,{children:[(0,U.jsx)(Q,{children:`Order`}),(0,U.jsx)(Q,{children:`Status`})]})}),(0,U.jsxs)(X,{children:[(0,U.jsxs)(Z,{children:[(0,U.jsx)($,{children:`#1042`}),(0,U.jsx)($,{children:`Shipped`})]}),(0,U.jsxs)(Z,{children:[(0,U.jsx)($,{children:`#1043`}),(0,U.jsx)($,{children:`Packed`})]})]})]})})]})}),(0,U.jsx)(`h2`,{children:`The rule`}),(0,U.jsx)(`p`,{children:`Components ship their skeleton, pages compose them. A companion is built from the markup of its component, so the two cannot drift apart; a page lays the companions out the way it lays out the loaded components. The library holds no page-level skeleton: the shape of a page belongs to the application.`}),(0,U.jsx)(`h2`,{children:`Props`}),(0,U.jsx)(V,{rows:[{name:`variant`,type:`"text" | "rect" | "circle"`,defaultValue:`"text"`,description:`Text follows the surrounding type size, rect holds a block, circle an avatar.`},{name:`width, height`,type:`string | number`,description:`A CSS length; numbers are pixels.`},{name:`lines`,type:`number`,defaultValue:`1`,description:`Lines of text to hold; the last one is shorter.`},{name:`count`,type:`number`,defaultValue:`1`,description:`Placeholders to stack, such as the rows of a list.`},{name:`className`,type:`string`,description:`A class for the element itself: the placeholder, or what holds the lines or the stacked blocks.`},{name:`blockClassName`,type:`string`,description:`A class for every placeholder: each block of a count, each of the lines.`},{name:`children`,type:`ReactNode`,description:`The real content: it keeps its place and its size while the placeholder covers it.`},{name:`loading`,type:`boolean`,defaultValue:`true`,description:`With children, whether they are still loading.`}]}),(0,U.jsx)(`h3`,{children:`Companions`}),(0,U.jsx)(V,{rows:[{name:`AvatarSkeleton`,type:`size, shape`,description:`The box of an avatar.`},{name:`ButtonSkeleton`,type:`size, radius, fullWidth, children`,description:`The box of a button; pass the label as children when it is known, for the exact width.`},{name:`BadgeSkeleton`,type:`size, children`,description:`The box of a badge; pass the label when it is known.`},{name:`FieldSkeleton`,type:`size, help`,description:`A label, an input and, with help, a line of help.`},{name:`CardSkeleton`,type:`variant, padding, media, title, description, lines, footer`,description:`A card with the parts asked for; media and footer take other skeletons.`},{name:`TableSkeleton`,type:`rows, columns, header, density, striped`,description:`A table of rows by columns, with a header by default.`}]}),(0,U.jsx)(`h3`,{children:`SkeletonRegion`}),(0,U.jsx)(V,{rows:[{name:`loading`,type:`boolean`,description:`Sets aria-busy on the region.`},{name:`label`,type:`string`,description:`Announced once to assistive technology when the placeholders show.`},{name:`delay`,type:`number`,defaultValue:`0`,description:`Milliseconds before the placeholders show and the label is announced.`}]})]})}function Ja(){return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`h1`,{children:`Avatar`}),(0,U.jsx)(`p`,{className:`lead`,children:`Show who wrote, edited or owns something. An avatar shows a picture and falls back to initials when there is none or when it fails to load.`}),(0,U.jsxs)(H,{title:`Picture and initials`,code:Oa,children:[(0,U.jsx)(q,{name:`Ada Lovelace`,src:za}),(0,U.jsx)(q,{name:`Ada Lovelace`}),(0,U.jsx)(q,{name:`Grace Hopper`,tone:`primary`}),(0,U.jsx)(q,{name:`Alan Turing`,tone:`secondary`}),(0,U.jsx)(q,{name:`Field notes`,shape:`square`})]}),(0,U.jsxs)(H,{title:`Sizes`,code:ka,children:[(0,U.jsx)(q,{size:`xs`,name:`Ada Lovelace`}),(0,U.jsx)(q,{size:`sm`,name:`Ada Lovelace`}),(0,U.jsx)(q,{name:`Ada Lovelace`}),(0,U.jsx)(q,{size:`lg`,name:`Ada Lovelace`}),(0,U.jsx)(q,{size:`xl`,name:`Ada Lovelace`})]}),(0,U.jsx)(H,{title:`Group`,description:`Past max, the rest is counted.`,code:Aa,children:(0,U.jsxs)(On,{"aria-label":`Editors`,max:3,children:[(0,U.jsx)(q,{name:`Ada Lovelace`,tone:`primary`}),(0,U.jsx)(q,{name:`Grace Hopper`}),(0,U.jsx)(q,{name:`Alan Turing`,tone:`secondary`}),(0,U.jsx)(q,{name:`Katherine Johnson`}),(0,U.jsx)(q,{name:`Hedy Lamarr`})]})}),(0,U.jsx)(`h2`,{children:`Props`}),(0,U.jsx)(V,{rows:[{name:`name`,type:`string`,description:`Accessible name and source of the initials. Leave it empty where the name is written beside the avatar.`},{name:`src`,type:`string`,description:`Picture; the initials take over when it is missing or fails to load.`},{name:`size`,type:`"xs" | "sm" | "md" | "lg" | "xl"`,defaultValue:`"md"`,description:`From a dense list to a profile header.`},{name:`shape`,type:`"circle" | "square"`,defaultValue:`"circle"`,description:`A square suits a product or an organisation.`},{name:`tone`,type:`"neutral" | "primary" | "secondary"`,defaultValue:`"neutral"`,description:`Colour behind the initials.`},{name:`children`,type:`ReactNode`,description:`Replaces the initials, for example with an icon.`},{name:`AvatarGroup max, size`,type:`number, AvatarSize`,description:`Avatars shown before the rest is counted, and the size of that count.`}]})]})}function Ya(){let[e,t]=(0,W.useState)(!1);return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`h1`,{children:`Alert`}),(0,U.jsx)(`p`,{className:`lead`,children:`Tell people what happened and what they can do about it, in the flow of the page. Warnings and errors are announced at once, the other tones politely.`}),(0,U.jsx)(H,{title:`Tones`,code:ja,children:(0,U.jsxs)(`div`,{className:`catalog-stack catalog-fill`,children:[(0,U.jsx)(s,{title:`Draft saved`,children:`Your changes are kept on this device.`}),(0,U.jsx)(s,{tone:`primary`,icon:(0,U.jsx)(Ba,{}),title:`A new version is available`}),(0,U.jsx)(s,{tone:`success`,title:`Article published`,children:`It is now visible to everyone.`}),(0,U.jsx)(s,{tone:`info`,icon:(0,U.jsx)(Ba,{}),title:`Maintenance is planned for Sunday`}),(0,U.jsx)(s,{tone:`warning`,role:`status`,title:`Your session ends in five minutes`}),(0,U.jsx)(s,{tone:`danger`,role:`status`,title:`The article could not be saved`,children:`Check your connection and try again.`})]})}),(0,U.jsx)(H,{title:`Actions and dismissal`,description:`A dismissible alert names its close button.`,code:Ma,children:(0,U.jsx)(`div`,{className:`catalog-stack catalog-fill`,children:e?(0,U.jsx)(m,{variant:`outline`,size:`sm`,onClick:()=>t(!1),children:`Show the alert again`}):(0,U.jsx)(s,{variant:`outline`,tone:`primary`,icon:(0,U.jsx)(Ba,{}),title:`Two people are editing this article`,actions:(0,U.jsx)(m,{size:`sm`,variant:`outline`,children:`See who`}),onDismiss:()=>t(!0),dismissLabel:`Dismiss`,children:`Your changes merge as you type.`})})}),(0,U.jsx)(H,{title:`Host colours per tone`,description:(0,U.jsxs)(U.Fragment,{children:[`Each tone reads `,(0,U.jsx)(`code`,{children:`--elea-alert-<tone>-surface`}),`, `,(0,U.jsx)(`code`,{children:`-border`}),` and `,(0,U.jsx)(`code`,{children:`-text`}),`. Success and danger take the colours of the host here; info keeps the theme. The host keeps the contrast between surface and text.`]}),code:Fa,children:(0,U.jsx)(`div`,{className:`catalog-fill`,children:(0,U.jsx)(Pa,{})})}),(0,U.jsx)(`h2`,{children:`Props`}),(0,U.jsx)(V,{rows:[{name:`tone`,type:`"neutral" | "primary" | "success" | "info" | "warning" | "danger"`,defaultValue:`"neutral"`,description:`Meaning of the message. Warning and danger take role alert, the others role status.`},{name:`variant`,type:`"subtle" | "outline"`,defaultValue:`"subtle"`,description:`A tinted fill or a border on the page surface.`},{name:`title, children`,type:`ReactNode`,description:`A short heading and the message under it.`},{name:`icon, actions`,type:`ReactNode`,description:`A leading icon, and buttons or links under the message.`},{name:`onDismiss, dismissLabel`,type:`() => void, string`,description:`Adds a close button; its label is required with it.`},{name:`role`,type:`string`,description:`Overrides how the message is announced.`}]})]})}function Xa(){let[e,t]=(0,W.useState)(3);return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`h1`,{children:`Progress`}),(0,U.jsx)(`p`,{className:`lead`,children:`Show how far a task has come, or that work is under way when the amount is unknown.`}),(0,U.jsx)(H,{title:`Measured progress`,description:`Upload the next file to move the bar.`,code:Ia,children:(0,U.jsxs)(`div`,{className:`catalog-stack catalog-fill`,children:[(0,U.jsx)(kn,{label:`Uploading images`,value:e,max:8,showValue:!0,formatValue:(e,t)=>`${e} of ${t} files`}),(0,U.jsx)(`div`,{children:(0,U.jsx)(m,{size:`sm`,variant:`outline`,onClick:()=>t(e=>e>=8?0:e+1),children:e>=8?`Start again`:`Upload next file`})})]})}),(0,U.jsx)(H,{title:`Indeterminate`,description:`Without a value, the bar travels along its track.`,code:La,children:(0,U.jsx)(`div`,{className:`catalog-fill`,children:(0,U.jsx)(kn,{label:`Preparing the export`})})}),(0,U.jsx)(H,{title:`Sizes and tones`,code:Ra,children:(0,U.jsxs)(`div`,{className:`catalog-stack catalog-fill`,children:[(0,U.jsx)(kn,{size:`sm`,value:30,"aria-label":`Storage used`}),(0,U.jsx)(kn,{tone:`success`,value:100,label:`Published`,showValue:!0}),(0,U.jsx)(kn,{tone:`info`,value:45,label:`Import`,showValue:!0}),(0,U.jsx)(kn,{tone:`warning`,value:82,label:`Storage`,showValue:!0}),(0,U.jsx)(kn,{size:`lg`,tone:`danger`,value:96,label:`Quota`,showValue:!0})]})}),(0,U.jsx)(`h2`,{children:`Props`}),(0,U.jsx)(V,{rows:[{name:`value, max`,type:`number`,defaultValue:`—, 100`,description:`Work done between 0 and max. Leave value out while the amount is unknown.`},{name:`label`,type:`ReactNode`,description:`Visible name of the task; without one, name the bar with aria-label.`},{name:`showValue`,type:`boolean`,defaultValue:`false`,description:`Shows the value beside the label, as a percentage unless formatValue words it.`},{name:`formatValue`,type:`(value: number, max: number) => string`,description:`Words the value for the eye and for assistive technology.`},{name:`size`,type:`"sm" | "md" | "lg"`,defaultValue:`"md"`,description:`Thickness of the track.`},{name:`tone`,type:`"primary" | "success" | "info" | "warning" | "danger"`,defaultValue:`"primary"`,description:`Colour of the bar.`}]})]})}var Za=`import { useState } from "react";
import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  type TableSort,
} from "@alien6-studio/elea-ui";

type Column = "title" | "words" | "readers";
type Direction = Exclude<TableSort, "none">;

const articles = [
  {
    title: "Autumn field notes",
    status: "Published",
    words: 1240,
    readers: 3812,
  },
  {
    title: "Cranes over the valley",
    status: "In review",
    words: 860,
    readers: 0,
  },
  {
    title: "A winter herbarium",
    status: "Draft",
    words: 2105,
    readers: 0,
  },
];

export function SortableArticles() {
  const [column, setColumn] = useState<Column>("words");
  const [direction, setDirection] = useState<Direction>("descending");

  const sorted = [...articles].sort((a, b) => {
    const result =
      column === "title"
        ? a.title.localeCompare(b.title)
        : a[column] - b[column];
    return direction === "ascending" ? result : -result;
  });

  const sortBy = (name: Column) => ({
    sort: column === name ? direction : ("none" as const),
    onSort: () => {
      const ascending = column === name && direction === "ascending";
      setColumn(name);
      setDirection(ascending ? "descending" : "ascending");
    },
  });

  return (
    <Table label="Articles" hoverable>
      <TableHead>
        <TableRow>
          <TableHeaderCell {...sortBy("title")}>Article</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell align="end" {...sortBy("words")}>
            Words
          </TableHeaderCell>
          <TableHeaderCell align="end" {...sortBy("readers")}>
            Readers
          </TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {sorted.map((article) => (
          <TableRow key={article.title}>
            <TableHeaderCell scope="row">{article.title}</TableHeaderCell>
            <TableCell>
              <Badge variant="subtle">{article.status}</Badge>
            </TableCell>
            <TableCell numeric>{article.words}</TableCell>
            <TableCell numeric>{article.readers}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
`,Qa=`import { useState } from "react";
import {
  Button,
  Dialog,
  Field,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@alien6-studio/elea-ui";

const articles = [
  { title: "Autumn field notes", words: 1240 },
  { title: "Cranes over the valley", words: 860 },
  { title: "A winter herbarium", words: 2105 },
];

export function ArticleWorkspace() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = articles.filter((article) =>
    article.title.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const total = results.reduce((sum, article) => sum + article.words, 0);

  return (
    <section aria-label="Article workspace" data-elea-density="compact">
      <Field label="Filter articles" help="Search by title.">
        {(control) => (
          <Input
            {...control}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        )}
      </Field>
      <Table label="Search results">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Article</TableHeaderCell>
            <TableHeaderCell align="end">Words</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {results.map((article) => (
            <TableRow key={article.title}>
              <TableHeaderCell scope="row">{article.title}</TableHeaderCell>
              <TableCell numeric>{article.words}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={() => setOpen(true)}>Word count</Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Word count"
        closeLabel="Close word count"
        actions={<Button onClick={() => setOpen(false)}>Done</Button>}
      >
        {total} words across {results.length} articles.
      </Dialog>
    </section>
  );
}
`,$a=`import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFoot,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@alien6-studio/elea-ui";

const articles = [
  { author: "Ada Lovelace", title: "Autumn field notes", words: 1240 },
  { author: "Grace Hopper", title: "Cranes over the valley", words: 860 },
  { author: "Alan Turing", title: "A winter herbarium", words: 2105 },
];
const selected = "Cranes over the valley";
const total = articles.reduce((sum, article) => sum + article.words, 0);

export function WeeklyWords() {
  return (
    <Table density="sm" striped>
      <TableCaption>Words written this week</TableCaption>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Author</TableHeaderCell>
          <TableHeaderCell>Article</TableHeaderCell>
          <TableHeaderCell align="end">Words</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {articles.map((article) => (
          <TableRow key={article.title} selected={article.title === selected}>
            <TableHeaderCell scope="row">{article.author}</TableHeaderCell>
            <TableCell>{article.title}</TableCell>
            <TableCell numeric>{article.words}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFoot>
        <TableRow>
          <TableHeaderCell scope="row" colSpan={2}>
            Total
          </TableHeaderCell>
          <TableCell numeric>{total}</TableCell>
        </TableRow>
      </TableFoot>
    </Table>
  );
}
`,eo=`import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@alien6-studio/elea-ui";

// In the stylesheet of the application:
//
// .revisions {
//   max-block-size: 14rem;
// }

const editors = ["Ada Lovelace", "Grace Hopper", "Alan Turing"];
const revisions = Array.from({ length: 14 }, (_, index) => ({
  number: 14 - index,
  editor: editors[index % editors.length],
  words: 2105 - index * 37,
}));

export function RevisionHistory() {
  return (
    <Table label="Revisions" stickyHeader density="sm" className="revisions">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Revision</TableHeaderCell>
          <TableHeaderCell>Editor</TableHeaderCell>
          <TableHeaderCell align="end">Words</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {revisions.map((revision) => (
          <TableRow key={revision.number}>
            <TableHeaderCell scope="row">
              Revision {revision.number}
            </TableHeaderCell>
            <TableCell>{revision.editor}</TableCell>
            <TableCell numeric>{revision.words}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
`,to=`import { Accordion } from "@alien6-studio/elea-ui";

const questions = [
  {
    value: "publish",
    label: "Who can publish an article?",
    panel: "Editors and owners publish. Writers submit their draft for review.",
  },
  {
    value: "history",
    label: "How long are revisions kept?",
    panel: "Every revision of the last ninety days is kept.",
  },
  {
    value: "export",
    label: "Can I export my articles?",
    panel: "Yes, as Markdown or HTML, one article at a time or all of them.",
  },
];

export function PublishingQuestions() {
  return <Accordion defaultValue={["publish"]} items={questions} />;
}
`,no=`import { useState } from "react";
import { Accordion } from "@alien6-studio/elea-ui";

const sections = [
  {
    value: "members",
    label: "Members",
    panel: "Five people write for this publication.",
  },
  {
    value: "billing",
    label: "Billing",
    panel: "The plan renews on the first of each month.",
  },
  {
    value: "archive",
    label: "Archive",
    panel: "Nothing is archived.",
    disabled: true,
  },
];

export function PublicationSettings() {
  const [open, setOpen] = useState(["members"]);

  return (
    <>
      <Accordion
        variant="contained"
        multiple
        value={open}
        onChange={setOpen}
        items={sections}
      />
      <p role="status">
        {open.length ? \`Open: \${open.join(", ")}\` : "Everything is closed"}
      </p>
    </>
  );
}
`,ro=`import { Slider } from "@alien6-studio/elea-ui";

export function Volume() {
  return <Slider label="Volume" showValue defaultValue={40} />;
}
`,io=`import { useState } from "react";
import { Slider } from "@alien6-studio/elea-ui";

export function ReadingWidth() {
  const [width, setWidth] = useState(68);

  return (
    <Slider
      label="Reading width"
      min={48}
      max={96}
      step={4}
      value={width}
      onChange={setWidth}
      showValue
      formatValue={(value) => \`\${value} characters\`}
    />
  );
}
`,ao=`import { Slider } from "@alien6-studio/elea-ui";

export function SliderStates() {
  return (
    <>
      <Slider size="sm" aria-label="Zoom" defaultValue={25} />
      <Slider label="Brightness" defaultValue={70} />
      <Slider label="Locked" defaultValue={55} disabled />
    </>
  );
}
`,oo=`import { Button, useToast } from "@alien6-studio/elea-ui";
import { CheckIcon } from "../icons";

export function PublishButton() {
  const { toast } = useToast();

  return (
    <Button
      variant="success"
      icon={<CheckIcon />}
      onClick={() =>
        toast({
          tone: "success",
          title: "Article published",
          description: "It is now visible to everyone.",
          icon: <CheckIcon />,
        })
      }
    >
      Publish
    </Button>
  );
}
`,so=`import { Button, useToast } from "@alien6-studio/elea-ui";
import { ArchiveIcon } from "../icons";

export function ArchiveButton() {
  const { toast, dismiss } = useToast();

  function archive() {
    const id = toast({
      title: "Article moved to the archive",
      icon: <ArchiveIcon />,
      duration: Infinity,
      action: (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            dismiss(id);
            toast({ tone: "success", title: "Article restored" });
          }}
        >
          Undo
        </Button>
      ),
    });
  }

  return (
    <>
      <Button variant="secondary" onClick={archive}>
        Archive the article
      </Button>
      <Button variant="ghost" onClick={() => dismiss()}>
        Dismiss all
      </Button>
    </>
  );
}
`,co=`import { Button, useToast } from "@alien6-studio/elea-ui";

async function exportArticles() {
  await fetch("/api/articles/export", { method: "POST" });
}

export function ExportButton() {
  const { toast } = useToast();

  async function run() {
    toast({ id: "export", title: "Preparing the export", duration: Infinity });
    await exportArticles();
    toast({ id: "export", tone: "success", title: "Export ready" });
  }

  return (
    <Button variant="secondary" onClick={run}>
      Export the articles
    </Button>
  );
}
`,lo=`import type { ReactNode } from "react";
import { ToastProvider } from "@alien6-studio/elea-ui";

export function Notifications({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <ToastProvider
      label="Notifications"
      dismissLabel="Dismiss"
      position="top-center"
    >
      {children}
    </ToastProvider>
  );
}
`,uo=[{title:`Autumn field notes`,author:`Ada Lovelace`,status:`Published`,words:1240,readers:3812},{title:`Cranes over the valley`,author:`Grace Hopper`,status:`In review`,words:860,readers:0},{title:`A winter herbarium`,author:`Alan Turing`,status:`Draft`,words:2105,readers:0},{title:`Letters from the marsh`,author:`Hedy Lamarr`,status:`Published`,words:1530,readers:9406}],fo={Published:`success`,"In review":`warning`,Draft:`neutral`},po=e=>e.toLocaleString(`en-GB`);function mo(){let[e,t]=(0,W.useState)(`standard`),[n,r]=(0,W.useState)(``),[i,a]=(0,W.useState)(!1),o=uo.filter(e=>e.title.toLowerCase().includes(n.trim().toLowerCase())),s=o.reduce((e,t)=>e+t.words,0);return(0,U.jsxs)(`section`,{"aria-label":`Article workspace`,"data-elea-density":e,className:`catalog-fill catalog-stack`,style:{gap:`var(--elea-density-action-gap)`},children:[(0,U.jsx)(R,{label:`Region density`,children:({id:n})=>(0,U.jsx)(j,{id:n,value:e,onChange:t,options:[{value:`compact`,label:`Compact`},{value:`standard`,label:`Standard`},{value:`comfortable`,label:`Comfortable`}]})}),(0,U.jsx)(R,{label:`Filter articles`,help:`Search by title.`,children:e=>(0,U.jsx)(b,{...e,type:`search`,value:n,onChange:e=>r(e.target.value)})}),(0,U.jsxs)(J,{label:`Search results`,children:[(0,U.jsx)(Y,{children:(0,U.jsxs)(Z,{children:[(0,U.jsx)(Q,{children:`Article`}),(0,U.jsx)(Q,{align:`end`,children:`Words`})]})}),(0,U.jsxs)(X,{children:[o.map(e=>(0,U.jsxs)(Z,{children:[(0,U.jsx)(Q,{scope:`row`,children:e.title}),(0,U.jsx)($,{numeric:!0,children:po(e.words)})]},e.title)),!o.length&&(0,U.jsx)(Z,{children:(0,U.jsx)($,{colSpan:2,children:`No matching articles`})})]})]}),(0,U.jsx)(`div`,{children:(0,U.jsx)(m,{onClick:()=>a(!0),children:`Word count`})}),(0,U.jsxs)(Rt,{open:i,onClose:()=>a(!1),title:`Word count`,closeLabel:`Close word count`,actions:(0,U.jsx)(m,{onClick:()=>a(!1),children:`Done`}),children:[po(s),` words across `,o.length,` `,o.length===1?`article`:`articles`,`.`]})]})}function ho(){let[e,t]=(0,W.useState)({column:`words`,direction:`descending`}),n=(0,W.useMemo)(()=>[...uo].sort((t,n)=>{let r=e.column===`title`?t.title.localeCompare(n.title):t[e.column]-n[e.column];return e.direction===`ascending`?r:-r}),[e]),r=n=>({sort:e.column===n?e.direction:`none`,onSort:()=>t(e=>({column:n,direction:e.column===n&&e.direction===`ascending`?`descending`:`ascending`}))});return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`h1`,{children:`Table`}),(0,U.jsx)(`p`,{className:`lead`,children:`Lay out records in rows and columns people can scan and compare. The table scrolls sideways inside its own region, so it never widens the page.`}),(0,U.jsx)(H,{title:`Sortable columns`,description:`A sortable heading is a button; the column states its direction. Sorting the rows stays with you.`,code:Za,children:(0,U.jsxs)(J,{label:`Articles`,hoverable:!0,className:`catalog-fill`,children:[(0,U.jsx)(Y,{children:(0,U.jsxs)(Z,{children:[(0,U.jsx)(Q,{...r(`title`),children:`Article`}),(0,U.jsx)(Q,{children:`Status`}),(0,U.jsx)(Q,{align:`end`,...r(`words`),children:`Words`}),(0,U.jsx)(Q,{align:`end`,...r(`readers`),children:`Readers`})]})}),(0,U.jsx)(X,{children:n.map(e=>(0,U.jsxs)(Z,{children:[(0,U.jsx)(Q,{scope:`row`,children:e.title}),(0,U.jsx)($,{children:(0,U.jsx)(u,{tone:fo[e.status],variant:`subtle`,children:e.status})}),(0,U.jsx)($,{numeric:!0,children:po(e.words)}),(0,U.jsx)($,{numeric:!0,children:po(e.readers)})]},e.title))})]})}),(0,U.jsx)(H,{title:`Regional density`,description:`Change the spacing of the field, table and actions together. Open the word count to see the same density in a dialog.`,code:Qa,children:(0,U.jsx)(mo,{})}),(0,U.jsx)(H,{title:`Dense, striped, with a caption and a footer`,description:`A caption names the table for everyone; the footer carries the totals.`,code:$a,children:(0,U.jsxs)(J,{density:`sm`,striped:!0,className:`catalog-fill`,children:[(0,U.jsx)(An,{children:`Words written this week`}),(0,U.jsx)(Y,{children:(0,U.jsxs)(Z,{children:[(0,U.jsx)(Q,{children:`Author`}),(0,U.jsx)(Q,{children:`Article`}),(0,U.jsx)(Q,{align:`end`,children:`Words`})]})}),(0,U.jsx)(X,{children:uo.map((e,t)=>(0,U.jsxs)(Z,{selected:t===1,children:[(0,U.jsx)(Q,{scope:`row`,children:e.author}),(0,U.jsx)($,{children:e.title}),(0,U.jsx)($,{numeric:!0,children:po(e.words)})]},e.title))}),(0,U.jsx)(jn,{children:(0,U.jsxs)(Z,{children:[(0,U.jsx)(Q,{scope:`row`,colSpan:2,children:`Total`}),(0,U.jsx)($,{numeric:!0,children:po(uo.reduce((e,t)=>e+t.words,0))})]})})]})}),(0,U.jsx)(H,{title:`Sticky header`,description:`Give the table a height and its header stays in view while the rows scroll.`,code:eo,children:(0,U.jsxs)(J,{label:`Revisions`,stickyHeader:!0,density:`sm`,className:`catalog-fill catalog-table-scroll`,children:[(0,U.jsx)(Y,{children:(0,U.jsxs)(Z,{children:[(0,U.jsx)(Q,{children:`Revision`}),(0,U.jsx)(Q,{children:`Editor`}),(0,U.jsx)(Q,{align:`end`,children:`Words`})]})}),(0,U.jsx)(X,{children:Array.from({length:14},(e,t)=>{let n=uo[t%uo.length];return(0,U.jsxs)(Z,{children:[(0,U.jsxs)(Q,{scope:`row`,children:[`Revision `,14-t]}),(0,U.jsx)($,{children:n.author}),(0,U.jsx)($,{numeric:!0,children:po(n.words-t*37)})]},t)})})]})}),(0,U.jsx)(`h2`,{children:`Props`}),(0,U.jsx)(V,{rows:[{name:`label`,type:`string`,description:`Names the scrolling region and lets the keyboard reach it; pass it for any table that may overflow.`},{name:`density`,type:`"sm" | "md"`,defaultValue:`"md"`,description:`Set the row padding explicitly, or omit to inherit the regional density.`},{name:`striped, hoverable`,type:`boolean`,defaultValue:`false`,description:`Tints every other row; rows answer the pointer.`},{name:`stickyHeader`,type:`boolean`,defaultValue:`false`,description:`Keeps the header in view; give the table a height through className.`},{name:`TableRow selected`,type:`boolean`,defaultValue:`false`,description:`Tints the row. State the selection through the row's own control, such as a checkbox.`},{name:`TableHeaderCell sort, onSort`,type:`"ascending" | "descending" | "none", () => void`,description:`With onSort the heading becomes a button and the column states its direction.`},{name:`TableHeaderCell scope`,type:`"col" | "row"`,defaultValue:`"col"`,description:`Use row for the cell that names a row.`},{name:`align, TableCell numeric`,type:`"start" | "center" | "end", boolean`,description:`Alignment of a cell; numeric aligns figures to the end.`}]})]})}var go=[{value:`publish`,label:`Who can publish an article?`,panel:`Editors and owners publish. Writers submit their draft for review, and are told when it goes live.`},{value:`history`,label:`How long are revisions kept?`,panel:`Every revision of the last ninety days is kept. Older ones are thinned to one a week.`},{value:`export`,label:`Can I export my articles?`,panel:`Yes, as Markdown or HTML, one article at a time or the whole publication.`}];function _o(){let[e,t]=(0,W.useState)([`members`]);return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`h1`,{children:`Accordion`}),(0,U.jsx)(`p`,{className:`lead`,children:`Fold long content under headings people can scan, and open only what they need. Under expressive motion a section unfolds; otherwise it opens at once.`}),(0,U.jsx)(H,{title:`One section at a time`,description:`Opening a section closes the other; the open one can be closed again.`,code:to,children:(0,U.jsx)(Pn,{className:`catalog-fill`,defaultValue:[`publish`],items:go})}),(0,U.jsx)(H,{title:`Several sections, contained`,description:`With multiple, sections open independently. A controlled accordion reports the open sections.`,code:no,children:(0,U.jsxs)(`div`,{className:`catalog-stack catalog-fill`,children:[(0,U.jsx)(Pn,{variant:`contained`,multiple:!0,value:e,onChange:t,headingLevel:`h3`,items:[{value:`members`,label:`Members`,panel:`Five people write for this publication. Invite more from the team page.`},{value:`billing`,label:`Billing`,panel:`The plan renews on the first of each month.`},{value:`archive`,label:`Archive`,panel:`Nothing is archived.`,disabled:!0}]}),(0,U.jsx)(`p`,{className:`catalog-note`,role:`status`,children:e.length?`Open: ${e.join(`, `)}`:`Everything is closed`})]})}),(0,U.jsx)(`h2`,{children:`Props`}),(0,U.jsx)(V,{rows:[{name:`items`,type:`AccordionItem[]`,description:`Sections with a unique value, a label, a panel and an optional disabled flag.`},{name:`value, defaultValue`,type:`string[]`,description:`The open sections, controlled or as a starting point.`},{name:`onChange`,type:`(value: string[]) => void`,description:`Called with the open sections after each change.`},{name:`multiple`,type:`boolean`,defaultValue:`false`,description:`Lets several sections stay open at once.`},{name:`headingLevel`,type:`"h2" … "h6"`,defaultValue:`"h3"`,description:`Heading level that fits the outline of the page.`},{name:`variant`,type:`"separated" | "contained"`,defaultValue:`"separated"`,description:`Lines between the sections, or one bordered surface.`}]})]})}function vo(){let[e,t]=(0,W.useState)(68);return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`h1`,{children:`Slider`}),(0,U.jsx)(`p`,{className:`lead`,children:`Pick a value along a range where the feel matters more than the exact figure. It is a native range input, so the keyboard, touch and forms work as the platform does.`}),(0,U.jsx)(H,{title:`Label and value`,description:`The value shows beside the label and follows the thumb.`,code:ro,children:(0,U.jsx)(`div`,{className:`catalog-fill`,children:(0,U.jsx)(ge,{label:`Volume`,showValue:!0,defaultValue:40})})}),(0,U.jsx)(H,{title:`Steps and a worded value`,description:`formatValue words the value for the eye and for assistive technology.`,code:io,children:(0,U.jsxs)(`div`,{className:`catalog-stack catalog-fill`,children:[(0,U.jsx)(ge,{label:`Reading width`,min:48,max:96,step:4,value:e,onChange:t,showValue:!0,formatValue:e=>`${e} characters`}),(0,U.jsx)(`p`,{className:`catalog-measure`,style:{maxInlineSize:`${e}ch`},children:`Cranes crossed the valley at dusk, calling to one another above the reeds while the light went from the water.`})]})}),(0,U.jsx)(H,{title:`Sizes and states`,code:ao,children:(0,U.jsxs)(`div`,{className:`catalog-stack catalog-fill`,children:[(0,U.jsx)(ge,{size:`sm`,"aria-label":`Zoom`,defaultValue:25}),(0,U.jsx)(ge,{label:`Brightness`,defaultValue:70}),(0,U.jsx)(ge,{label:`Locked`,defaultValue:55,disabled:!0})]})}),(0,U.jsx)(`h2`,{children:`Props`}),(0,U.jsx)(V,{rows:[{name:`value, defaultValue`,type:`number`,description:`The value, controlled or as a starting point; min by default.`},{name:`onChange`,type:`(value: number) => void`,description:`Called with the number while the thumb moves.`},{name:`min, max, step`,type:`number`,defaultValue:`0, 100, 1`,description:`Bounds of the range and distance between two values.`},{name:`label`,type:`ReactNode`,description:`Visible label; without one, name the slider with aria-label.`},{name:`showValue`,type:`boolean`,defaultValue:`false`,description:`Shows the value beside the label.`},{name:`formatValue`,type:`(value: number) => string`,description:`Words the value, such as “68 characters”.`},{name:`size`,type:`"sm" | "md"`,defaultValue:`"md"`,description:`Thickness of the track and size of the thumb.`},{name:`name, disabled, ref…`,type:`input attributes`,description:`The native input takes them, and the ref.`}]})]})}var yo={archive:(0,U.jsx)(`path`,{d:`M4 4h16v5H4zM6 9v11h12V9m-8 4h4`}),neutral:(0,U.jsx)(`path`,{d:`M6 3h8l4 4v14H6zM14 3v5h4M9 13h6m-6 4h6`}),success:(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`circle`,{cx:`12`,cy:`12`,r:`9`}),(0,U.jsx)(`path`,{d:`m8.5 12.5 2.5 2.5 4.5-5.5`})]}),info:(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`circle`,{cx:`12`,cy:`12`,r:`9`}),(0,U.jsx)(`path`,{d:`M12 11v5m0-8.5v.5`})]}),warning:(0,U.jsx)(`path`,{d:`M12 3 22 20H2zM12 9v4m0 3v.5`}),danger:(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`circle`,{cx:`12`,cy:`12`,r:`9`}),(0,U.jsx)(`path`,{d:`m9 9 6 6m0-6-6 6`})]})};function bo({name:e}){return(0,U.jsx)(`svg`,{viewBox:`0 0 24 24`,width:`1em`,height:`1em`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,"aria-hidden":`true`,children:yo[e]})}var xo=[{label:`Neutral`,tone:`neutral`,title:`Draft saved`},{label:`Success`,tone:`success`,title:`Article published`,description:`It is now visible to everyone.`},{label:`Info`,tone:`info`,title:`Maintenance is planned for Sunday`},{label:`Warning`,tone:`warning`,title:`Your session ends in five minutes`},{label:`Danger`,tone:`danger`,title:`The article could not be saved`,description:`Check your connection and try again.`}];function So({position:e,onPosition:t}){let{toast:n,dismiss:r}=Ln();return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(H,{title:`Tones`,description:`A toast confirms what just happened and leaves by itself. Errors are announced at once, the others politely.`,code:oo,children:xo.map(({label:e,...t})=>{let r=(0,U.jsx)(bo,{name:t.tone});return(0,U.jsx)(m,{size:`sm`,variant:t.tone===`neutral`?`outline`:t.tone,icon:r,onClick:()=>n({...t,icon:r}),children:e},t.tone)})}),(0,U.jsxs)(H,{title:`An action, and a toast that stays`,description:`A lifetime of Infinity keeps the toast until it is dismissed. Its timer also waits while the pointer or the focus is on the toasts.`,code:so,children:[(0,U.jsx)(m,{size:`sm`,variant:`secondary`,onClick:()=>{let e=n({id:`archive`,title:`Article moved to the archive`,icon:(0,U.jsx)(bo,{name:`archive`}),duration:1/0,action:(0,U.jsx)(m,{size:`sm`,variant:`ghost`,onClick:()=>{r(e),n({tone:`success`,icon:(0,U.jsx)(bo,{name:`success`}),title:`Article restored`})},children:`Undo`})})},children:`Archive the article`}),(0,U.jsx)(m,{size:`sm`,variant:`ghost`,onClick:()=>r(),children:`Dismiss all`})]}),(0,U.jsx)(H,{title:`Replace a toast`,description:`A toast shown under the id of a visible one takes its place, to follow a task from start to end.`,code:co,children:(0,U.jsx)(m,{size:`sm`,variant:`secondary`,onClick:()=>{n({id:`export`,title:`Preparing the export…`,duration:1/0}),setTimeout(()=>n({id:`export`,tone:`success`,icon:(0,U.jsx)(bo,{name:`success`}),title:`Export ready`,description:`42 articles as Markdown.`}),1500)},children:`Export the articles`})}),(0,U.jsx)(H,{title:`Position`,description:`The provider places the stack in a corner or the middle of an edge; it follows the reading direction.`,code:lo,children:[`top-start`,`top-center`,`top-end`,`bottom-start`,`bottom-center`,`bottom-end`].map(r=>(0,U.jsx)(m,{size:`sm`,variant:r===e?`primary`:`outline`,"aria-pressed":r===e,onClick:()=>{t(r),n({id:`position`,tone:`info`,icon:(0,U.jsx)(bo,{name:`info`}),title:`Toasts appear ${r.replace(`-`,` `)}`})},children:r},r))})]})}function Co(){let[e,t]=(0,W.useState)(`bottom-end`);return(0,U.jsxs)(Vn,{label:`Notifications`,dismissLabel:`Dismiss`,position:e,children:[(0,U.jsx)(`h1`,{children:`Toast`}),(0,U.jsx)(`p`,{className:`lead`,children:`Confirm an action with a brief message above the page, without taking the focus. Wrap the application in a ToastProvider once, then call useToast wherever something happens.`}),(0,U.jsx)(So,{position:e,onPosition:t}),(0,U.jsx)(`h2`,{children:`Props`}),(0,U.jsx)(V,{rows:[{name:`ToastProvider label`,type:`string`,description:`Accessible name of the region that holds the toasts, such as “Notifications”.`},{name:`ToastProvider dismissLabel`,type:`string`,description:`Accessible name of the close button of a toast.`},{name:`position`,type:`"top-start" … "bottom-end"`,defaultValue:`"bottom-end"`,description:`Where the stack sits on the page.`},{name:`duration`,type:`number`,defaultValue:`5000`,description:`Default lifetime of a toast in milliseconds.`},{name:`max`,type:`number`,defaultValue:`3`,description:`Toasts shown at once; the oldest leave first.`},{name:`motion`,type:`boolean`,description:`Expressive motion for the toasts; follows the page when omitted.`},{name:`toast(options)`,type:`(options: ToastOptions) => string`,description:`Shows a toast and returns its id. Options: title, description, tone, icon, action, duration, id.`},{name:`dismiss(id?)`,type:`(id?: string) => void`,description:`Dismisses one toast, or all of them without an id.`}]})]})}var wo=`import { useState } from "react";
import { Button, Field, Input, Popover } from "@alien6-studio/elea-ui";

export function InviteReader() {
  const [email, setEmail] = useState("");
  const [invited, setInvited] = useState("nobody yet");

  return (
    <>
      <Popover
        label="Invite a reader"
        trigger={(props) => (
          <Button variant="outline" {...props}>
            Invite
          </Button>
        )}
      >
        {({ close }) => (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setInvited(email);
              setEmail("");
              close();
            }}
          >
            <Field label="Email">
              {(control) => (
                <Input
                  {...control}
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              )}
            </Field>
            <Button variant="ghost" size="sm" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Send
            </Button>
          </form>
        )}
      </Popover>
      <p>Last invitation: {invited}</p>
    </>
  );
}
`,To=`import { Button, Popover } from "@alien6-studio/elea-ui";

export function ReadingDetails() {
  return (
    <>
      <Popover
        label="Reading time"
        trigger={(props) => (
          <Button variant="outline" size="sm" {...props}>
            Bottom start
          </Button>
        )}
      >
        About six minutes.
      </Popover>
      <Popover
        label="Word count"
        align="center"
        trigger={(props) => (
          <Button variant="outline" size="sm" {...props}>
            Bottom centre
          </Button>
        )}
      >
        1,240 words.
      </Popover>
      <Popover
        label="Last revision"
        side="top"
        align="end"
        trigger={(props) => (
          <Button variant="outline" size="sm" {...props}>
            Top end
          </Button>
        )}
      >
        Saved on Monday.
      </Popover>
    </>
  );
}
`,Eo=`import { useState } from "react";
import { Button, Checkbox, Popover } from "@alien6-studio/elea-ui";

export function ArticleFilters() {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({ drafts: true, published: false });

  return (
    <>
      <Popover
        label="Filters"
        open={open}
        onOpenChange={setOpen}
        trigger={(props) => (
          <Button variant="outline" {...props}>
            Filters
          </Button>
        )}
      >
        <Checkbox
          label="Drafts"
          checked={filters.drafts}
          onCheckedChange={(drafts) => setFilters({ ...filters, drafts })}
        />
        <Checkbox
          label="Published"
          checked={filters.published}
          onCheckedChange={(published) => setFilters({ ...filters, published })}
        />
      </Popover>
      <p>The popover is {open ? "open" : "closed"}.</p>
    </>
  );
}
`,Do=`import { useState } from "react";
import { Button, Field, Input, Popover } from "@alien6-studio/elea-ui";

export function RenameInRow() {
  const [heading, setHeading] = useState("Cranes over the valley");
  const [visits, setVisits] = useState(0);

  return (
    <>
      <div onClick={() => setVisits((count) => count + 1)}>
        <span>{heading}</span>
        <Popover
          label="Rename"
          align="end"
          trigger={(props) => (
            <Button
              variant="outline"
              size="sm"
              {...props}
              onClick={(event) => {
                // The row must not open when its own button is pressed.
                event.stopPropagation();
                props.onClick();
              }}
            >
              Rename
            </Button>
          )}
        >
          {({ close }) => (
            <>
              <Field label="Title">
                {(control) => (
                  <Input
                    {...control}
                    value={heading}
                    onChange={(event) => setHeading(event.target.value)}
                  />
                )}
              </Field>
              <Button size="sm" onClick={close}>
                Done
              </Button>
            </>
          )}
        </Popover>
      </div>
      <p>The row was opened {visits} times.</p>
    </>
  );
}
`,Oo=`import { useState } from "react";
import { Button, ConfirmPopover } from "@alien6-studio/elea-ui";
import { TrashIcon } from "../icons";

const drafts = ["Field notes", "Release plan", "Style guide"];

interface Row {
  name: string;
  anchor: HTMLElement;
}

export function DeleteArticles() {
  const [articles, setArticles] = useState(drafts);
  const [row, setRow] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    setDeleting(true);
    await new Promise((done) => setTimeout(done, 900));
    setArticles((all) => all.filter((name) => name !== row?.name));
    setDeleting(false);
    setRow(null);
  }

  return (
    <>
      <ul>
        {articles.map((name) => (
          <li key={name}>
            {name}
            <Button
              variant="ghost"
              size="sm"
              aria-haspopup="dialog"
              aria-label={\`Delete \${name}\`}
              onClick={(event) => setRow({ name, anchor: event.currentTarget })}
            >
              Delete
            </Button>
          </li>
        ))}
      </ul>
      <ConfirmPopover
        anchor={row?.anchor ?? null}
        open={row !== null}
        tone="danger"
        icon={<TrashIcon />}
        loading={deleting}
        title={\`Delete \${row?.name ?? "it"}?\`}
        description="This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Keep"
        onConfirm={remove}
        onCancel={() => setRow(null)}
      />
    </>
  );
}
`,ko=`import { useState } from "react";
import { Button, ConfirmPopover } from "@alien6-studio/elea-ui";
import { CheckIcon } from "../icons";

export function ApproveArticle() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [answer, setAnswer] = useState("nothing yet");

  function answerWith(value: string) {
    setAnswer(value);
    setAnchor(null);
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        aria-haspopup="dialog"
        onClick={(event) => setAnchor(event.currentTarget)}
      >
        Approve
      </Button>
      <ConfirmPopover
        anchor={anchor}
        open={anchor !== null}
        tone="success"
        icon={<CheckIcon />}
        title="Approve this article?"
        confirmLabel="Approve"
        cancelLabel="Cancel"
        onConfirm={() => answerWith("approved")}
        onCancel={() => answerWith("cancelled")}
      />
      <p>Last answer: {answer}</p>
    </>
  );
}
`,Ao=`import { useState } from "react";
import { Button, ConfirmPopover } from "@alien6-studio/elea-ui";

export function RejectArticle() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [reason, setReason] = useState("nothing yet");

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        aria-haspopup="dialog"
        onClick={(event) => setAnchor(event.currentTarget)}
      >
        Reject
      </Button>
      <ConfirmPopover
        anchor={anchor}
        open={anchor !== null}
        tone="danger"
        title="Reject this article?"
        confirmLabel="Reject"
        cancelLabel="Cancel"
        field={{ label: "Reason", placeholder: "Optional" }}
        onConfirm={(value) => {
          setReason(value || "no reason");
          setAnchor(null);
        }}
        onCancel={() => setAnchor(null)}
      />
      <p>Received: {reason}</p>
    </>
  );
}
`,jo=`import { useState } from "react";
import { Button, ConfirmPopover } from "@alien6-studio/elea-ui";

export function RefuseRequest() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [comment, setComment] = useState("nothing yet");

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        aria-haspopup="dialog"
        onClick={(event) => setAnchor(event.currentTarget)}
      >
        Refuse
      </Button>
      <ConfirmPopover
        anchor={anchor}
        open={anchor !== null}
        title="Refuse the request"
        confirmLabel="Refuse"
        cancelLabel="Cancel"
        field={{
          label: "Comment",
          required: true,
          multiline: true,
          maxLength: 280,
        }}
        onConfirm={(value) => {
          setComment(value ?? "");
          setAnchor(null);
        }}
        onCancel={() => setAnchor(null)}
      />
      <p>Received: {comment}</p>
    </>
  );
}
`,Mo=`import { useState } from "react";
import { Popover, type PopoverAnchor } from "@alien6-studio/elea-ui";

export function ClickPosition() {
  const [point, setPoint] = useState<PopoverAnchor | null>(null);

  return (
    <>
      <button
        type="button"
        onClick={({ clientX, clientY }) =>
          setPoint({
            getBoundingClientRect: () => new DOMRect(clientX, clientY, 0, 0),
          })
        }
      >
        Click anywhere in this area
      </button>
      <Popover
        label="Position"
        anchor={point}
        open={point !== null}
        onOpenChange={() => setPoint(null)}
      >
        Opened where you clicked.
      </Popover>
    </>
  );
}
`,No=`import { useState } from "react";
import { Button, Field, Input, Sheet, Textarea } from "@alien6-studio/elea-ui";

export function ArticleDetails() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Edit details</Button>
      <Sheet
        open={open}
        onClose={close}
        title="Article details"
        description="Shown on the article page and in search results."
        closeLabel="Close"
        actions={
          <>
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button onClick={close}>Save</Button>
          </>
        }
      >
        <Field label="Title">
          {(control) => (
            <Input {...control} defaultValue="Cranes over the valley" />
          )}
        </Field>
        <Field label="Summary">
          {(control) => <Textarea {...control} rows={4} />}
        </Field>
        <Field label="Author">
          {(control) => <Input {...control} defaultValue="Grace Hopper" />}
        </Field>
      </Sheet>
    </>
  );
}
`,Po=`import { useState } from "react";
import { Button, Sheet, type SheetProps } from "@alien6-studio/elea-ui";

type Side = NonNullable<SheetProps["side"]>;

const sides: Side[] = ["start", "end", "top", "bottom"];
const revisions = Array.from({ length: 14 }, (_, index) => 14 - index);

export function Revisions() {
  const [side, setSide] = useState<Side | null>(null);

  return (
    <>
      {sides.map((name) => (
        <Button
          key={name}
          variant="outline"
          size="sm"
          onClick={() => setSide(name)}
        >
          {name}
        </Button>
      ))}
      <Sheet
        open={side !== null}
        onClose={() => setSide(null)}
        side={side ?? "end"}
        size="sm"
        title="Revisions"
        closeLabel="Close"
      >
        <ol>
          {revisions.map((revision) => (
            <li key={revision}>Revision {revision}</li>
          ))}
        </ol>
      </Sheet>
    </>
  );
}
`,Fo=()=>(0,U.jsx)(`svg`,{viewBox:`0 0 24 24`,width:`1em`,height:`1em`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,"aria-hidden":`true`,children:(0,U.jsx)(`path`,{d:`M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3`})}),Io=()=>(0,U.jsxs)(`svg`,{viewBox:`0 0 24 24`,width:`1em`,height:`1em`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,"aria-hidden":`true`,children:[(0,U.jsx)(`circle`,{cx:`12`,cy:`12`,r:`9`}),(0,U.jsx)(`path`,{d:`m8 12 3 3 5-6`})]}),Lo=[`Field notes`,`Release plan`,`Style guide`,`Reading list`,`Interview`,`Changelog`],Ro=[{tone:`danger`,action:`Delete`,title:`Delete this article?`},{tone:`primary`,action:`Publish`,title:`Publish this article?`},{tone:`success`,action:`Approve`,title:`Approve this article?`},{tone:`info`,action:`Archive`,title:`Archive this article?`}];function zo(){let[e,t]=(0,W.useState)(Lo),[n,r]=(0,W.useState)(null),[i,a]=(0,W.useState)(!1);function o(){t(e=>e.filter(e=>e!==n?.name)),a(!1),r(null)}let[s,c]=(0,W.useState)(null),[l,u]=(0,W.useState)(null),[d,f]=(0,W.useState)(`nothing yet`),[p,h]=(0,W.useState)(null),[g,_]=(0,W.useState)(`nothing yet`),[v,y]=(0,W.useState)(null),[x,S]=(0,W.useState)(`nothing yet`),[C,w]=(0,W.useState)(`nobody yet`),[T,E]=(0,W.useState)(``),[D,O]=(0,W.useState)(!1),[k,A]=(0,W.useState)(0),[ee,te]=(0,W.useState)(`Cranes over the valley`),[j,ne]=(0,W.useState)({drafts:!0,published:!1});return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`h1`,{children:`Popover`}),(0,U.jsx)(`p`,{className:`lead`,children:`Anchor a short form, filters or details to the control that opens them. A popover leaves the page usable: use a dialog when the task must be finished first, and a menu for a plain list of actions.`}),(0,U.jsx)(H,{title:`A short form`,description:`Last invitation: ${C}`,code:wo,children:(0,U.jsx)(Ut,{label:`Invite a reader`,trigger:e=>(0,U.jsx)(m,{variant:`outline`,...e,children:`Invite`}),children:({close:e})=>(0,U.jsxs)(`form`,{className:`catalog-popover-form`,onSubmit:t=>{t.preventDefault(),w(T),E(``),e()},children:[(0,U.jsx)(R,{label:`Email`,children:e=>(0,U.jsx)(b,{...e,type:`email`,required:!0,value:T,onChange:e=>E(e.target.value)})}),(0,U.jsxs)(`div`,{className:`catalog-popover-actions`,children:[(0,U.jsx)(m,{variant:`ghost`,size:`sm`,onClick:e,children:`Cancel`}),(0,U.jsx)(m,{type:`submit`,size:`sm`,children:`Send`})]})]})})}),(0,U.jsxs)(H,{title:`Side and alignment`,description:`The panel opens under or above its anchor, against its start, its centre or its end. When that side has no room it flips to the other one, and it shifts to stay inside the viewport.`,code:To,children:[(0,U.jsx)(Ut,{label:`Reading time`,trigger:e=>(0,U.jsx)(m,{variant:`outline`,size:`sm`,...e,children:`Bottom start`}),children:`About six minutes.`}),(0,U.jsx)(Ut,{label:`Word count`,align:`center`,trigger:e=>(0,U.jsx)(m,{variant:`outline`,size:`sm`,...e,children:`Bottom centre`}),children:`1,240 words.`}),(0,U.jsx)(Ut,{label:`Last revision`,side:`top`,align:`end`,trigger:e=>(0,U.jsx)(m,{variant:`outline`,size:`sm`,...e,children:`Top end`}),children:`Saved on Monday.`})]}),(0,U.jsx)(H,{title:`Controlled`,description:`The popover is ${D?`open`:`closed`}. Showing: ${Object.entries(j).filter(([,e])=>e).map(([e])=>e).join(`, `)||`nothing`}`,code:Eo,children:(0,U.jsx)(Ut,{label:`Filters`,open:D,onOpenChange:O,trigger:e=>(0,U.jsx)(m,{variant:`outline`,...e,children:`Filters`}),children:(0,U.jsxs)(`div`,{className:`catalog-stack`,children:[(0,U.jsx)(L,{label:`Drafts`,checked:j.drafts,onCheckedChange:e=>ne({...j,drafts:e})}),(0,U.jsx)(L,{label:`Published`,checked:j.published,onCheckedChange:e=>ne({...j,published:e})})]})})}),(0,U.jsx)(H,{title:`Inside a clickable row`,description:`The row was opened ${k} times. A click in the panel stops there, so a popover declared in a row or a card that is itself clickable does not activate it. The trigger is yours: stop its click if it should not open the row either.`,code:Do,children:(0,U.jsxs)(`div`,{className:`catalog-popover-row`,"data-demo":`row`,onClick:()=>A(e=>e+1),children:[(0,U.jsx)(`span`,{children:ee}),(0,U.jsx)(Ut,{label:`Rename`,align:`end`,trigger:e=>(0,U.jsx)(m,{variant:`outline`,size:`sm`,...e,onClick:t=>{t.stopPropagation(),e.onClick()},children:`Rename`}),children:({close:e})=>(0,U.jsxs)(`div`,{className:`catalog-popover-form`,children:[(0,U.jsx)(R,{label:`Title`,children:e=>(0,U.jsx)(b,{...e,value:ee,onChange:e=>te(e.target.value)})}),(0,U.jsx)(`div`,{className:`catalog-popover-actions`,children:(0,U.jsx)(m,{size:`sm`,onClick:e,children:`Done`})})]})})]})}),(0,U.jsxs)(H,{title:`One confirmation for a list`,description:`${e.length} articles. One ConfirmPopover serves every row: the row button becomes its anchor. The panel sits in the top layer, so the scrolling container does not cut it.`,code:Oo,children:[(0,U.jsx)(`div`,{className:`catalog-popover-scroll`,children:(0,U.jsxs)(J,{label:`Articles`,density:`sm`,children:[(0,U.jsx)(Y,{children:(0,U.jsxs)(Z,{children:[(0,U.jsx)(Q,{children:`Article`}),(0,U.jsx)(Q,{align:`end`,children:`Action`})]})}),(0,U.jsx)(X,{children:e.map(e=>(0,U.jsxs)(Z,{children:[(0,U.jsx)($,{children:e}),(0,U.jsx)($,{align:`end`,children:(0,U.jsx)(m,{variant:`ghost`,size:`sm`,"aria-haspopup":`dialog`,"aria-label":`Delete ${e}`,onClick:t=>r({name:e,anchor:t.currentTarget}),children:`Delete`})})]},e))})]})}),(0,U.jsx)(m,{variant:`outline`,size:`sm`,onClick:()=>t(Lo),children:`Restore the list`}),(0,U.jsx)(Wt,{anchor:n?.anchor??null,open:n!==null,tone:`danger`,icon:(0,U.jsx)(Fo,{}),loading:i,align:`end`,title:`Delete ${n?.name??`it`}?`,description:`This cannot be undone.`,confirmLabel:`Delete`,cancelLabel:`Keep`,onConfirm:()=>{a(!0),setTimeout(o,900)},onCancel:()=>r(null)})]}),(0,U.jsxs)(H,{title:`Tones and icon`,description:`Last answer: ${d}. ConfirmPopover and ConfirmDialog take the same tone values and the same optional icon.`,code:ko,children:[Ro.map(({tone:e,action:t,title:n})=>(0,U.jsx)(m,{variant:`outline`,size:`sm`,"aria-haspopup":`dialog`,onClick:r=>u({tone:e,title:n,action:t,anchor:r.currentTarget}),children:t},e)),(0,U.jsx)(Wt,{anchor:l?.anchor??null,open:l!==null,tone:l?.tone,icon:l?.tone===`danger`?(0,U.jsx)(Fo,{}):(0,U.jsx)(Io,{}),title:l?.title,confirmLabel:l?.action??`Confirm`,cancelLabel:`Cancel`,onConfirm:()=>{f(`${l?.action} confirmed`),u(null)},onCancel:()=>{f(`${l?.action} cancelled`),u(null)}})]}),(0,U.jsxs)(H,{title:`An optional reason`,description:`Received: ${g}. With field, the confirmation shows a labelled input and hands its trimmed text to onConfirm. Focus opens in the field and Enter confirms.`,code:Ao,children:[(0,U.jsx)(m,{variant:`outline`,size:`sm`,"aria-haspopup":`dialog`,onClick:e=>h(e.currentTarget),children:`Reject`}),(0,U.jsx)(Wt,{anchor:p,open:p!==null,tone:`danger`,title:`Reject this article?`,confirmLabel:`Reject`,cancelLabel:`Cancel`,field:{label:`Reason`,placeholder:`Optional`},onConfirm:e=>{_(e?`"${e}"`:`no reason`),h(null)},onCancel:()=>h(null)})]}),(0,U.jsxs)(H,{title:`A required comment`,description:`Received: ${x}. A required field keeps the confirm button disabled while it is empty, and the button is described by the label of the field. In a multiline field Enter adds a line: Ctrl or Cmd with Enter confirms.`,code:jo,children:[(0,U.jsx)(m,{variant:`outline`,size:`sm`,"aria-haspopup":`dialog`,onClick:e=>y(e.currentTarget),children:`Refuse`}),(0,U.jsx)(Wt,{anchor:v,open:v!==null,title:`Refuse the request`,confirmLabel:`Refuse`,cancelLabel:`Cancel`,field:{label:`Comment`,required:!0,multiline:!0,maxLength:280},onConfirm:e=>{S(`"${e}"`),y(null)},onCancel:()=>y(null)})]}),(0,U.jsxs)(H,{title:`Virtual anchor`,description:`A host that only kept the coordinates of a click passes an object with getBoundingClientRect. Focus is not returned to it: there is no element to return to.`,code:Mo,children:[(0,U.jsx)(`button`,{type:`button`,className:`catalog-popover-zone`,onClick:e=>{let{clientX:t,clientY:n}=e;c({getBoundingClientRect:()=>new DOMRect(t,n,0,0)})},children:`Click anywhere in this area`}),(0,U.jsx)(Ut,{label:`Position`,anchor:s,open:s!==null,onOpenChange:()=>c(null),children:`Opened where you clicked.`})]}),(0,U.jsx)(`h2`,{children:`Props`}),(0,U.jsxs)(`p`,{children:[`A popover is anchored either to the `,(0,U.jsx)(`code`,{children:`trigger`}),` it renders, or to an `,(0,U.jsx)(`code`,{children:`anchor`}),` the host hands it together with `,(0,U.jsx)(`code`,{children:`open`}),`.`]}),(0,U.jsx)(V,{rows:[{name:`trigger`,type:`(props) => ReactNode`,description:`Render the trigger and spread its click and ARIA props.`},{name:`anchor`,type:`HTMLElement | { getBoundingClientRect(): DOMRect } | null`,description:`Instead of trigger: the element, or the virtual rectangle, the panel is placed against. Requires open; nothing shows while it is null. Focus returns to it when it is an element.`},{name:`children`,type:`ReactNode | ({ close }) => ReactNode`,description:`The panel content; the function form receives close, which also returns focus to the trigger.`},{name:`label`,type:`string`,description:`Accessible name of the panel.`},{name:`open, defaultOpen`,type:`boolean`,defaultValue:`false`,description:`Visibility, controlled or as a starting point.`},{name:`onOpenChange`,type:`(open: boolean) => void`,description:`Called when the popover asks to open or close.`},{name:`side`,type:`"bottom" | "top"`,defaultValue:`"bottom"`,description:`Preferred side; the panel flips when it has no room there.`},{name:`align`,type:`"start" | "center" | "end"`,defaultValue:`"start"`,description:`Edge of the anchor the panel lines up with.`}]}),(0,U.jsx)(`h2`,{children:`ConfirmPopover props`}),(0,U.jsxs)(`p`,{children:[`An alert dialog anchored to a control: focus opens on the cancel button, or in the `,(0,U.jsx)(`code`,{children:`field`}),` when there is one, and stays inside, `,(0,U.jsx)(`kbd`,{children:`Escape`}),` and an outside click cancel, and focus returns to the anchor.`]}),(0,U.jsx)(V,{rows:[{name:`anchor`,type:`HTMLElement | { getBoundingClientRect(): DOMRect } | null`,description:`What the confirmation is placed against, usually the button that asked.`},{name:`open`,type:`boolean`,description:`Visibility; the host owns it.`},{name:`title`,type:`ReactNode`,description:`The question, which names the panel.`},{name:`description`,type:`ReactNode`,description:`The consequence, read after the title.`},{name:`confirmLabel, cancelLabel`,type:`string`,description:`Text of the two buttons.`},{name:`onConfirm`,type:`(value?: string) => void`,description:`Called by the confirm button, with the trimmed text of the field when there is one and with no argument otherwise.`},{name:`onCancel`,type:`() => void`,description:`Called by the cancel button; Escape and an outside click cancel.`},{name:`field`,type:`ConfirmField`,description:`Collects a value with the answer, between the description and the buttons. ConfirmDialog takes the same one.`},{name:`loading`,type:`boolean`,defaultValue:`false`,description:`Disables both buttons and the field, and shows progress on the confirm button.`},{name:`tone`,type:`"danger" | "primary" | "success" | "info"`,defaultValue:`"primary"`,description:`Colour of the confirm button and of the icon.`},{name:`icon`,type:`ReactNode`,description:`Shown before the title, hidden from assistive technology.`},{name:`side, align`,type:`"bottom" | "top", "start" | "center" | "end"`,defaultValue:`"bottom", "start"`,description:`Preferred place; it flips and shifts to stay in the viewport.`}]}),(0,U.jsx)(`h2`,{children:`ConfirmField`}),(0,U.jsxs)(`p`,{children:[`The `,(0,U.jsx)(`code`,{children:`field`}),` of ConfirmPopover and ConfirmDialog. Its value starts over each time the confirmation opens. With per-component style sheets, load `,(0,U.jsx)(`code`,{children:`css/field.css`}),` too.`]}),(0,U.jsx)(V,{rows:[{name:`label`,type:`string`,description:`Visible label, tied to the input. It also describes the confirm button while the field keeps it disabled.`},{name:`placeholder`,type:`string`,description:`Hint shown while the field is empty.`},{name:`required`,type:`boolean`,defaultValue:`false`,description:`Keeps the confirm button disabled while the field is empty, and marks the input as required.`},{name:`multiline`,type:`boolean`,defaultValue:`false`,description:`A textarea: Enter adds a line, Ctrl or Cmd with Enter confirms.`},{name:`maxLength`,type:`number`,description:`Longest value the input accepts.`},{name:`defaultValue`,type:`string`,description:`Text the field opens with.`},{name:`expected`,type:`string`,description:`Keeps the confirm button disabled until the trimmed value matches exactly, case included.`}]})]})}var Bo=[`start`,`end`,`top`,`bottom`];function Vo(){let[e,t]=(0,W.useState)(!1),[n,r]=(0,W.useState)(null);return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`h1`,{children:`Sheet`}),(0,U.jsx)(`p`,{className:`lead`,children:`Dock a form, filters or details to an edge of the viewport while the page stays in sight behind. A sheet is a dialog: it keeps the focus until it is closed.`}),(0,U.jsxs)(H,{title:`A form beside the page`,description:`The body scrolls; the title and the actions stay in place.`,code:No,children:[(0,U.jsx)(m,{onClick:()=>t(!0),children:`Edit details`}),(0,U.jsx)(en,{open:e,onClose:()=>t(!1),title:`Article details`,description:`Shown on the article page and in search results.`,closeLabel:`Close`,actions:(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(m,{variant:`outline`,onClick:()=>t(!1),children:`Cancel`}),(0,U.jsx)(m,{onClick:()=>t(!1),children:`Save`})]}),children:(0,U.jsxs)(`div`,{className:`catalog-stack`,children:[(0,U.jsx)(R,{label:`Title`,children:e=>(0,U.jsx)(b,{...e,defaultValue:`Cranes over the valley`})}),(0,U.jsx)(R,{label:`Summary`,children:e=>(0,U.jsx)(y,{...e,rows:4,defaultValue:`Cranes crossed the valley at dusk, calling to one another above the reeds.`})}),(0,U.jsx)(R,{label:`Author`,children:e=>(0,U.jsx)(b,{...e,defaultValue:`Grace Hopper`})})]})})]}),(0,U.jsxs)(H,{title:`Sides and sizes`,description:`A side sheet takes its size as a width, a top or bottom sheet as a share of the height.`,code:Po,children:[Bo.map(e=>(0,U.jsx)(m,{variant:`outline`,size:`sm`,onClick:()=>r(e),children:e},e)),(0,U.jsx)(en,{open:n!==null,onClose:()=>r(null),side:n??`end`,size:`sm`,title:`Revisions`,closeLabel:`Close`,children:(0,U.jsx)(`ol`,{className:`catalog-revisions`,children:Array.from({length:14},(e,t)=>(0,U.jsxs)(`li`,{children:[`Revision `,14-t]},t))})})]}),(0,U.jsx)(`h2`,{children:`Props`}),(0,U.jsx)(V,{rows:[{name:`open, onClose`,type:`boolean, () => void`,description:`Controlled visibility.`},{name:`title, description`,type:`ReactNode`,description:`Named and described through ARIA.`},{name:`closeLabel`,type:`string`,description:`Accessible name of the close control.`},{name:`side`,type:`"start" | "end" | "top" | "bottom"`,defaultValue:`"end"`,description:`Edge of the viewport the sheet is docked to.`},{name:`size`,type:`"sm" | "md" | "lg"`,defaultValue:`"md"`,description:`Width of a side sheet, height of a top or bottom one.`},{name:`actions`,type:`ReactNode`,description:`Buttons pinned under the body.`},{name:`dismissOnBackdrop`,type:`boolean`,defaultValue:`true`,description:`A click outside closes the sheet.`},{name:`motion`,type:`boolean`,description:`Turns the slide on or off for this sheet. A sheet is rendered in a portal, so by default it follows data-elea-motion on the page, not on its container.`}]})]})}var Ho=`import { useState } from "react";
import { Button, Calendar } from "@alien6-studio/elea-ui";

const labels = { previousMonth: "Previous month", nextMonth: "Next month" };

export function PublicationCalendar() {
  const [date, setDate] = useState<string | null>(null);

  return (
    <>
      <Calendar
        label="Publication date"
        labels={labels}
        locale="en-GB"
        defaultMonth="2028-02"
        min="2028-02-20"
        max="2028-03-10"
        value={date}
        onChange={setDate}
      />
      <output>{date ?? "No date selected"}</output>
      <Button
        variant="ghost"
        size="sm"
        disabled={date === null}
        onClick={() => setDate(null)}
      >
        Clear date
      </Button>
    </>
  );
}
`,Uo=`import { useState } from "react";
import { Combobox, Field } from "@alien6-studio/elea-ui";

const collections = [
  { value: "field", label: "Field notes" },
  { value: "ice", label: "Glacier notebooks" },
  { value: "archive", label: "Glacier survey archive", disabled: true },
  { value: "marine", label: "Marine habitats" },
];

export function CollectionPicker() {
  const [collection, setCollection] = useState<string | null>(null);

  return (
    <Field label="Collection">
      {(control) => (
        <Combobox
          {...control}
          label="Collection"
          name="collection"
          options={collections}
          value={collection}
          onChange={setCollection}
          placeholder="Search collections…"
          emptyMessage="No matching collections"
        />
      )}
    </Field>
  );
}
`,Wo=`import { useState } from "react";
import { ColorPicker } from "@alien6-studio/elea-ui";

export function CoverInk() {
  const [ink, setInk] = useState("#047857");

  return (
    <ColorPicker
      label="Ink colour"
      hexLabel="Ink hex"
      value={ink}
      onChange={setInk}
      invalidMessage="Enter a six-digit hex colour."
    />
  );
}
`,Go={previousMonth:`Previous month`,nextMonth:`Next month`},Ko=[{value:`field`,label:`Field notes`},{value:`flora`,label:`Flora and fauna`},{value:`ice`,label:`Glacier notebooks`},{value:`archive`,label:`Glacier survey archive`,disabled:!0},{value:`marine`,label:`Marine habitats`},{value:`polar`,label:`Polar expeditions`}];function qo(){let[e,t]=(0,W.useState)(null);return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`h1`,{children:`Calendar`}),(0,U.jsx)(`p`,{className:`lead`,children:`Choose a day in a monthly grid. The application receives a calendar date that stays the same across time zones.`}),(0,U.jsx)(H,{title:`Schedule a publication`,description:`Choose a date between 20 February and 10 March 2028.`,code:Ho,children:(0,U.jsxs)(`div`,{className:`catalog-stack catalog-card-demo`,children:[(0,U.jsx)(ht,{label:`Publication date`,labels:Go,locale:`en-GB`,defaultMonth:`2028-02`,min:`2028-02-20`,max:`2028-03-10`,value:e,onChange:t}),(0,U.jsxs)(`div`,{className:`catalog-row`,children:[(0,U.jsx)(`output`,{children:e??`No date selected`}),(0,U.jsx)(m,{variant:`ghost`,size:`sm`,disabled:e===null,onClick:()=>t(null),children:`Clear date`})]})]})}),(0,U.jsx)(`h2`,{children:`Props`}),(0,U.jsx)(V,{rows:[{name:`value, onChange`,type:`string | null, (date: string) => void`,description:`Selected Gregorian date in YYYY-MM-DD format and its change handler.`},{name:`label, labels`,type:`string, { previousMonth, nextMonth }`,description:`Accessible names for the calendar and both month controls.`},{name:`locale`,type:`string`,description:`Language used to format month and weekday names.`},{name:`defaultMonth`,type:`string`,description:`Initial YYYY-MM when there is no selection.`},{name:`min, max`,type:`string`,description:`First and last selectable dates, inclusive.`},{name:`weekStartsOn`,type:`0 through 6`,defaultValue:`1`,description:`First weekday. Sunday is 0.`}]})]})}function Jo(){let[e,t]=(0,W.useState)(null);return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`h1`,{children:`Combobox`}),(0,U.jsx)(`p`,{className:`lead`,children:`Filter a list by typing, then choose a match. The form stores the selected option’s value.`}),(0,U.jsx)(H,{title:`Choose a collection`,description:`Try “glacier” to find the current and archived collections.`,code:Uo,children:(0,U.jsx)(`div`,{className:`catalog-card-demo`,children:(0,U.jsx)(R,{label:`Collection`,children:n=>(0,U.jsx)(v,{...n,label:`Collection`,name:`collection`,options:Ko,value:e,onChange:t,placeholder:`Search collections…`,emptyMessage:`No matching collections`})})})}),(0,U.jsx)(`h2`,{children:`Props`}),(0,U.jsx)(V,{rows:[{name:`value, onChange`,type:`string | null, (value: string) => void`,description:`Controlled selection and the callback for a confirmed choice.`},{name:`options`,type:`readonly ComboboxOption[]`,description:`Each option has a string value, a searchable label and optional disabled state.`},{name:`label, emptyMessage`,type:`string`,description:`Accessible control name and the message shown when a search has no matches.`},{name:`placeholder`,type:`string`,defaultValue:`label`,description:`Hint shown while the field is empty. Pass a localized search prompt.`},{name:`name`,type:`string`,description:`Form field name for the selected value.`},{name:`disabled`,type:`boolean`,description:`Disable input and selection.`}]})]})}function Yo({brand:e}){let[t,n]=(0,W.useState)(e?.seed??r.Emerald.seed);return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`h1`,{children:`ColorPicker`}),(0,U.jsx)(`p`,{className:`lead`,children:`Choose a colour from the system picker or enter an exact hex value.`}),(0,U.jsx)(H,{title:`Cover ink`,code:Wo,children:(0,U.jsx)(`div`,{className:`catalog-card-demo`,children:(0,U.jsx)(h,{label:`Ink colour`,hexLabel:`Ink hex`,value:t,onChange:n,invalidMessage:`Enter a six-digit hex colour.`})})}),(0,U.jsx)(`h2`,{children:`Props`}),(0,U.jsx)(V,{rows:[{name:`value, onChange`,type:`string, (hex: string) => void`,description:`Controlled sRGB colour. A confirmed edit returns six lowercase hex digits prefixed with #.`},{name:`label, hexLabel`,type:`string`,description:`Names for the colour swatch and its text input.`},{name:`invalidMessage`,type:`string`,description:`Feedback for an incomplete or invalid hex value.`},{name:`disabled`,type:`boolean`,description:`Disable both inputs.`}]})]})}var Xo=[{id:`details`,label:`Details`,description:`Name the issue`},{id:`audience`,label:`Audience`,description:`Choose its readers`},{id:`proof`,label:`Proof`,description:`Check the draft`}],Zo=[{value:`members`,label:`Members`},{value:`everyone`,label:`Everyone`}];function Qo(){let[e,t]=(0,W.useState)(`details`),[n,r]=(0,W.useState)(`The harbour issue`),[i,a]=(0,W.useState)(`members`),[o,s]=(0,W.useState)(!1),c=n.trim()||`Untitled issue`,l=Zo.find(e=>e.value===i).label;function u(e){t(e.id),s(!1)}return(0,U.jsxs)(`div`,{className:`issue-workflow`,children:[(0,U.jsx)(_n,{label:`Issue preparation`,steps:Xo,current:e,onSelect:u,orientation:`vertical`,linear:!0}),(0,U.jsxs)(`div`,{className:`issue-workflow__step`,children:[e===`details`&&(0,U.jsx)(R,{label:`Issue title`,children:e=>(0,U.jsx)(b,{...e,value:n,onChange:e=>r(e.currentTarget.value)})}),e===`audience`&&(0,U.jsx)(j,{label:`Readers`,value:i,options:Zo,onChange:a}),e===`proof`&&(0,U.jsxs)(`section`,{"aria-label":`Issue proof`,children:[(0,U.jsx)(`h3`,{children:c}),(0,U.jsxs)(`p`,{children:[`Audience · `,l]})]}),(0,U.jsx)(vn,{steps:Xo,current:e,onSelect:u,previousLabel:`Previous`,nextLabel:`Next`,finish:(0,U.jsx)(m,{onClick:()=>s(!0),children:`Save draft`})}),(0,U.jsx)(`output`,{children:o&&`Draft saved for ${l.toLowerCase()}.`})]})]})}var $o=`import { useState } from "react";
import {
  Button,
  Field,
  Input,
  Select,
  Stepper,
  StepperPanel,
  type StepperStep,
} from "@alien6-studio/elea-ui";

const steps = [
  { id: "details", label: "Details", description: "Name the issue" },
  { id: "audience", label: "Audience", description: "Choose its readers" },
  { id: "proof", label: "Proof", description: "Check the draft" },
];
const audiences = [
  { value: "members", label: "Members" },
  { value: "everyone", label: "Everyone" },
];

export function IssueWorkflow() {
  const [current, setCurrent] = useState("details");
  const [title, setTitle] = useState("The harbour issue");
  const [audience, setAudience] = useState("members");
  const [saved, setSaved] = useState(false);
  const issueTitle = title.trim() || "Untitled issue";
  const readers = audiences.find((option) => option.value === audience)!.label;

  function select(step: StepperStep) {
    setCurrent(step.id);
    setSaved(false);
  }

  return (
    <div className="issue-workflow">
      <Stepper
        label="Issue preparation"
        steps={steps}
        current={current}
        onSelect={select}
        orientation="vertical"
        linear
      />
      <div className="issue-workflow__step">
        {current === "details" && (
          <Field label="Issue title">
            {(control) => (
              <Input
                {...control}
                value={title}
                onChange={(event) => setTitle(event.currentTarget.value)}
              />
            )}
          </Field>
        )}
        {current === "audience" && (
          <Select
            label="Readers"
            value={audience}
            options={audiences}
            onChange={setAudience}
          />
        )}
        {current === "proof" && (
          <section aria-label="Issue proof">
            <h3>{issueTitle}</h3>
            <p>Audience · {readers}</p>
          </section>
        )}
        <StepperPanel
          steps={steps}
          current={current}
          onSelect={select}
          previousLabel="Previous"
          nextLabel="Next"
          finish={<Button onClick={() => setSaved(true)}>Save draft</Button>}
        />
        <output>{saved && \`Draft saved for \${readers.toLowerCase()}.\`}</output>
      </div>
    </div>
  );
}
`,es=[{id:`copy`,label:`Copy`,notes:[`Check the harbour name in the opening paragraph.`,`Expand the initials in the byline.`]},{id:`images`,label:`Images`,notes:[`Confirm the credit for the cover photograph.`]},{id:`credits`,label:`Credits`,notes:[]}];function ts(e){return`${e} open ${e===1?`note`:`notes`}`}var ns=es.map(e=>({id:e.id,label:e.label,badge:e.notes.length,badgeLabel:ts(e.notes.length)}));function rs(){let[e,t]=(0,W.useState)(`images`),n=es.find(t=>t.id===e);return(0,U.jsxs)(`div`,{className:`proof-review`,children:[(0,U.jsx)(_n,{label:`Proof sections`,steps:ns,current:e,onSelect:e=>t(e.id)}),(0,U.jsxs)(`section`,{"aria-label":`Proof notes`,children:[(0,U.jsx)(`h3`,{children:n.label}),n.notes.length?(0,U.jsx)(`ul`,{children:n.notes.map(e=>(0,U.jsx)(`li`,{children:e},e))}):(0,U.jsx)(`p`,{children:`All credits have been checked.`})]})]})}var is=`import { useState } from "react";
import { Stepper } from "@alien6-studio/elea-ui";

const sections = [
  {
    id: "copy",
    label: "Copy",
    notes: [
      "Check the harbour name in the opening paragraph.",
      "Expand the initials in the byline.",
    ],
  },
  {
    id: "images",
    label: "Images",
    notes: ["Confirm the credit for the cover photograph."],
  },
  { id: "credits", label: "Credits", notes: [] },
];

function openNotes(count: number) {
  return \`\${count} open \${count === 1 ? "note" : "notes"}\`;
}

export const reviewSteps = sections.map((section) => ({
  id: section.id,
  label: section.label,
  badge: section.notes.length,
  badgeLabel: openNotes(section.notes.length),
}));

export function ReviewSteps() {
  const [current, setCurrent] = useState("images");
  const section = sections.find((item) => item.id === current)!;

  return (
    <div className="proof-review">
      <Stepper
        label="Proof sections"
        steps={reviewSteps}
        current={current}
        onSelect={(step) => setCurrent(step.id)}
      />
      <section aria-label="Proof notes">
        <h3>{section.label}</h3>
        {section.notes.length ? (
          <ul>
            {section.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        ) : (
          <p>All credits have been checked.</p>
        )}
      </section>
    </div>
  );
}
`,as=`import { StepperSkeleton } from "@alien6-studio/elea-ui";

export function LoadingIssue() {
  return <StepperSkeleton steps={3} />;
}
`,os=[{id:`copy`,label:`Copy`},{id:`images`,label:`Images`,badge:2,badgeLabel:`2 points to fix`,badgeTone:`danger`},{id:`credits`,label:`Credits`},{id:`print`,label:`Print`}];function ss(){let[e,t]=(0,W.useState)(`images`);return(0,U.jsx)(_n,{label:`Correction round`,steps:os,current:e,onSelect:e=>t(e.id),indicator:`solid`,connector:`dotted`})}var cs=`import { useState } from "react";
import { Stepper, type StepperStep } from "@alien6-studio/elea-ui";

const steps: StepperStep[] = [
  { id: "copy", label: "Copy" },
  {
    id: "images",
    label: "Images",
    badge: 2,
    badgeLabel: "2 points to fix",
    badgeTone: "danger",
  },
  { id: "credits", label: "Credits" },
  { id: "print", label: "Print" },
];

export function CorrectionRound() {
  const [current, setCurrent] = useState("images");

  return (
    <Stepper
      label="Correction round"
      steps={steps}
      current={current}
      onSelect={(step) => setCurrent(step.id)}
      indicator="solid"
      connector="dotted"
    />
  );
}
`;function ls(){return(0,U.jsxs)(`div`,{className:`stepper-guide`,children:[(0,U.jsx)(`h1`,{children:`Stepper`}),(0,U.jsx)(`p`,{className:`lead`,children:`Show where someone is in a sequence. Let them revisit a section or guide them through a task in order.`}),(0,U.jsx)(H,{title:`Free navigation`,description:`Open any section of the proof. Each badge counts its outstanding notes.`,code:is,children:(0,U.jsx)(rs,{})}),(0,U.jsx)(H,{title:`Linear workflow`,description:`Prepare an issue from details to proof. The final step replaces Next with the action that saves the draft.`,code:$o,children:(0,U.jsx)(Qo,{})}),(0,U.jsx)(H,{title:`Drawing options`,description:`Fill the markers and dot the line towards the steps still to come. A badge takes a tone: here the two points to fix on the images.`,code:cs,children:(0,U.jsx)(`div`,{className:`catalog-fill`,children:(0,U.jsx)(ss,{})})}),(0,U.jsx)(H,{title:`Loading`,description:`Reserve space for the steps while the issue loads.`,code:as,children:(0,U.jsx)(`div`,{className:`catalog-fill`,children:(0,U.jsx)(yn,{steps:3})})}),(0,U.jsx)(`h2`,{children:`Parts`}),(0,U.jsx)(V,{parts:!0,rows:[{name:`Stepper`,type:`label, steps, current, onSelect, orientation, linear, indicator, connector`,description:`Supply ordered steps with stable IDs. Store the selected step in the host and pass it back through current. indicator="solid" fills the markers and connector="dotted" dots the line towards steps not yet completed.`},{name:`StepperStep`,type:`id, label, description, badge, badgeLabel, badgeTone, disabled`,description:`Describe each step and give a badge a spoken label when its value needs context. badgeTone colours the badge; the label still carries the meaning.`},{name:`StepperPanel`,type:`steps, current, onSelect, previousLabel, nextLabel, finish`,description:`Move to the previous or next enabled step. Supply the final action and manage its result in your application.`},{name:`StepperSkeleton`,type:`steps, orientation`,description:`Match the step count and direction of the navigation being loaded.`}]})]})}var us={blocks:[{type:`header`,data:{text:`Three winters on the ice`,level:2}},{type:`paragraph`,data:{text:`The survey began in <strong>January</strong>, when the glacier was still closed to visitors.`}},{type:`list`,data:{style:`unordered`,items:[`Twelve stakes along the tongue`,`One reading a week`,`A camera at the foot of the icefall`]}},{type:`paragraph`,data:{text:`Results will follow in the autumn issue.`}}]},ds={blocks:[{type:`header`,data:{text:`Three winters on the ice`,level:2}},{type:`paragraph`,data:{text:`The survey began in <strong>February</strong>, when the glacier was still closed to <em>most</em> visitors.`}},{type:`list`,data:{style:`unordered`,items:[`Twelve stakes along the tongue`,`Two readings a week`,`A weather mast on the moraine`]}},{type:`quote`,data:{text:`The tongue lost four metres in a single summer.`,caption:`Field notebook, August`}}]};function fs(){let[e,t]=(0,W.useState)(!1);return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(m,{variant:`outline`,onClick:()=>t(!0),children:`Compare with the published version`}),(0,U.jsx)(Rt,{open:e,onClose:()=>t(!1),size:`xl`,scroll:`body`,title:`Draft and published version`,description:`Underlined words are new; struck words are gone.`,closeLabel:`Close`,actions:(0,U.jsx)(m,{onClick:()=>t(!1),children:`Publish`}),children:(0,U.jsx)(wr,{before:us,after:ds})})]})}var ps={blocks:[{type:`header`,data:{text:`Colophon`,level:3}},{type:`paragraph`,data:{text:`Set in <em>Garamond</em> and printed in Lyon on <a href="/papers/munken">Munken paper</a>.`}},{type:`paragraph`,data:{text:`First printing: 800 copies.`}}]},ms={blocks:[{type:`header`,data:{text:`Colophon`,level:3}},{type:`paragraph`,data:{text:`Set in <em>Garamond</em> and <strong>bound</strong> in Lyon on <a href="/papers/munken">Munken paper</a>.`}},{type:`list`,data:{style:`ordered`,items:[`First printing: 800 copies`,`Second printing: 1,200`]}}]};function hs(){return(0,U.jsx)(F,{padding:`lg`,children:(0,U.jsx)(wr,{before:ps,after:ms})})}var gs=new Intl.DateTimeFormat(`en-GB`,{hour:`2-digit`,minute:`2-digit`});function _s(){let[e,t]=(0,W.useState)(`idle`),[n,r]=(0,W.useState)(``),[i,a]=(0,W.useState)(!1),o=(0,W.useRef)(void 0);(0,W.useEffect)(()=>()=>clearTimeout(o.current),[]);function s(){clearTimeout(o.current),t(`saving`),o.current=setTimeout(()=>{if(i)return t(`error`);r(gs.format(new Date)),t(`saved`)},900)}let c={idle:`No changes yet`,saving:`Saving`,saved:`Saved at ${n}`,error:`Not saved`}[e];return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(R,{label:`Standfirst`,children:e=>(0,U.jsx)(y,{...e,rows:3,defaultValue:`Three winters on the ice, told by its surveyors.`,onChange:s})}),(0,U.jsx)(B,{state:e,onRetry:s,retryLabel:`Retry`,children:c}),(0,U.jsx)(I,{checked:i,onCheckedChange:a,label:`Lose the connection`})]})}function vs(){return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(B,{state:`idle`,children:`Draft`}),(0,U.jsx)(B,{state:`saving`,children:`Saving`}),(0,U.jsx)(B,{state:`saved`,children:`Saved at 12:12`}),(0,U.jsx)(B,{state:`error`,onRetry:()=>{},retryLabel:`Retry`,children:`Not saved`})]})}var ys=`import { useState } from "react";
import { ContentComparison } from "@alien6-studio/elea-content-viewer";
import { Button, Dialog } from "@alien6-studio/elea-ui";
import "@alien6-studio/elea-content-viewer/styles.css";

const published = {
  blocks: [
    { type: "header", data: { text: "Three winters on the ice", level: 2 } },
    {
      type: "paragraph",
      data: {
        text: "The survey began in <strong>January</strong>, when the"
          + " glacier was still closed to visitors.",
      },
    },
    {
      type: "list",
      data: {
        style: "unordered",
        items: [
          "Twelve stakes along the tongue",
          "One reading a week",
          "A camera at the foot of the icefall",
        ],
      },
    },
    {
      type: "paragraph",
      data: { text: "Results will follow in the autumn issue." },
    },
  ],
};

const draft = {
  blocks: [
    { type: "header", data: { text: "Three winters on the ice", level: 2 } },
    {
      type: "paragraph",
      data: {
        text: "The survey began in <strong>February</strong>, when the"
          + " glacier was still closed to <em>most</em> visitors.",
      },
    },
    {
      type: "list",
      data: {
        style: "unordered",
        items: [
          "Twelve stakes along the tongue",
          "Two readings a week",
          "A weather mast on the moraine",
        ],
      },
    },
    {
      type: "quote",
      data: {
        text: "The tongue lost four metres in a single summer.",
        caption: "Field notebook, August",
      },
    },
  ],
};

export function DraftAgainstPublished() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Compare with the published version
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        size="xl"
        scroll="body"
        title="Draft and published version"
        description="Underlined words are new; struck words are gone."
        closeLabel="Close"
        actions={<Button onClick={() => setOpen(false)}>Publish</Button>}
      >
        <ContentComparison before={published} after={draft} />
      </Dialog>
    </>
  );
}
`,bs=`import { ContentComparison } from "@alien6-studio/elea-content-viewer";
import { Card } from "@alien6-studio/elea-ui";
import "@alien6-studio/elea-content-viewer/styles.css";

const first = {
  blocks: [
    { type: "header", data: { text: "Colophon", level: 3 } },
    {
      type: "paragraph",
      data: {
        text: "Set in <em>Garamond</em> and printed in Lyon on"
          + ' <a href="/papers/munken">Munken paper</a>.',
      },
    },
    { type: "paragraph", data: { text: "First printing: 800 copies." } },
  ],
};

const second = {
  blocks: [
    { type: "header", data: { text: "Colophon", level: 3 } },
    {
      type: "paragraph",
      data: {
        text: "Set in <em>Garamond</em> and <strong>bound</strong> in Lyon"
          + ' on <a href="/papers/munken">Munken paper</a>.',
      },
    },
    {
      type: "list",
      data: {
        style: "ordered",
        items: ["First printing: 800 copies", "Second printing: 1,200"],
      },
    },
  ],
};

export function RevisedColophon() {
  return (
    <Card padding="lg">
      <ContentComparison before={first} after={second} />
    </Card>
  );
}
`,xs=`import { useEffect, useRef, useState } from "react";
import {
  Field, SaveStatus, Textarea, Toggle, type SaveState,
} from "@alien6-studio/elea-ui";

const clock = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
});

export function DraftAutosave() {
  const [state, setState] = useState<SaveState>("idle");
  const [savedAt, setSavedAt] = useState("");
  const [offline, setOffline] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Stands for the request an application sends to its own server
  function save() {
    clearTimeout(timer.current);
    setState("saving");
    timer.current = setTimeout(() => {
      if (offline) return setState("error");
      setSavedAt(clock.format(new Date()));
      setState("saved");
    }, 900);
  }

  const text = {
    idle: "No changes yet",
    saving: "Saving",
    saved: \`Saved at \${savedAt}\`,
    error: "Not saved",
  }[state];

  return (
    <>
      <Field label="Standfirst">
        {(control) => (
          <Textarea
            {...control}
            rows={3}
            defaultValue="Three winters on the ice, told by its surveyors."
            onChange={save}
          />
        )}
      </Field>
      <SaveStatus state={state} onRetry={save} retryLabel="Retry">
        {text}
      </SaveStatus>
      <Toggle
        checked={offline}
        onCheckedChange={setOffline}
        label="Lose the connection"
      />
    </>
  );
}
`,Ss=`import { SaveStatus } from "@alien6-studio/elea-ui";

export function SaveStates() {
  return (
    <>
      <SaveStatus state="idle">Draft</SaveStatus>
      <SaveStatus state="saving">Saving</SaveStatus>
      <SaveStatus state="saved">Saved at 12:12</SaveStatus>
      <SaveStatus state="error" onRetry={() => {}} retryLabel="Retry">
        Not saved
      </SaveStatus>
    </>
  );
}
`;function Cs(){return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`h1`,{children:`Save status`}),(0,U.jsx)(`p`,{className:`lead`,children:`Say where an automatic save stands beside an editor or a form: under way, done, or failed with a way to try again.`}),(0,U.jsx)(H,{title:`Autosave`,description:`Type in the field to save. Lose the connection, type again, then retry once it is back.`,code:xs,children:(0,U.jsx)(`div`,{className:`catalog-stack catalog-fill`,children:(0,U.jsx)(_s,{})})}),(0,U.jsx)(H,{title:`States`,description:`The text is yours, so it carries the time, the language and the wording of your product.`,code:Ss,children:(0,U.jsx)(`div`,{className:`catalog-stack`,children:(0,U.jsx)(vs,{})})}),(0,U.jsx)(`h2`,{children:`Props`}),(0,U.jsx)(V,{rows:[{name:`state`,type:`"idle" | "saving" | "saved" | "error"`,description:`Where the save stands. It sets the icon and the colour; idle shows the text alone.`},{name:`children`,type:`ReactNode`,description:`What the state says, such as “Saved at 12:12”. Each change is announced politely.`},{name:`onRetry, retryLabel`,type:`() => void, string`,description:`Given together, they add a retry button in the error state.`}]})]})}function ws(){return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`h1`,{children:`Content comparison`}),(0,U.jsx)(`p`,{className:`lead`,children:`Show two versions of a document as one. Words and blocks that came are underlined, those that went are struck through, and rich text keeps its formatting.`}),(0,U.jsx)(H,{title:`Draft against published`,description:`The comparison reads the same block documents as the viewer and the editor.`,code:ys,children:(0,U.jsx)(`div`,{className:`catalog-row`,children:(0,U.jsx)(fs,{})})}),(0,U.jsx)(H,{title:`Changed, added and removed blocks`,description:`An edited paragraph is shown once with both versions. A block that has no earlier or later version is shown whole.`,code:bs,children:(0,U.jsx)(`div`,{className:`catalog-fill`,children:(0,U.jsx)(hs,{})})}),(0,U.jsx)(`h2`,{children:`Props`}),(0,U.jsxs)(`p`,{children:[(0,U.jsx)(`code`,{children:`ContentComparison`}),` is exported by `,(0,U.jsx)(`code`,{children:`@alien6-studio/elea-content-viewer`}),` and takes the options of `,(0,U.jsx)(`code`,{children:`ContentView`}),`, such as `,(0,U.jsx)(`code`,{children:`messages`}),`, `,(0,U.jsx)(`code`,{children:`registry`}),` and `,(0,U.jsx)(`code`,{children:`siteHostnames`}),`.`]}),(0,U.jsx)(V,{rows:[{name:`before, after`,type:`unknown`,description:`The earlier and the later version: a document object, its JSON string, plain text or HTML.`},{name:`renderers`,type:`BlockRendererMap`,description:`Renderers by block type, merged over the built-in ones.`},{name:`typography`,type:`"elea" | "inherit"`,defaultValue:`"elea"`,description:`inherit takes the family, size, leading and colour of the host page.`},{name:`emptyFallback`,type:`ReactNode`,description:`Shown when neither version has a block.`}]}),(0,U.jsx)(`h2`,{children:`As data`}),(0,U.jsxs)(`p`,{children:[(0,U.jsx)(`code`,{children:`compareBlocks(before, after)`}),` and `,(0,U.jsx)(`code`,{children:`compareHtml(before, after)`}),` in `,(0,U.jsx)(`code`,{children:`@alien6-studio/elea-content`}),` return the same comparison without rendering it. Blocks are matched by content, not by id; a paragraph, heading, quote or list that kept half of its words counts as changed.`]})]})}var Ts=[`Library`,`Periodicals`,`Art`,`Volume one`,`Spring`,`Proof`].map((e,t)=>({label:e,id:String(t),href:`#`+t}));function Es(){let[e,t]=(0,W.useState)(Ts.length);function n(e,n){e.preventDefault(),t(Number(n.slice(1))+1)}return(0,U.jsxs)(`div`,{className:`archive-location`,children:[(0,U.jsx)(ct,{items:Ts.slice(0,e),label:`Archive location`,overflowLabel:`Earlier sections`,maxItems:4,render:({href:e,...t})=>(0,U.jsx)(`a`,{...t,href:e,onClick:t=>n(t,e)})}),e<Ts.length&&(0,U.jsx)(m,{variant:`ghost`,size:`sm`,onClick:()=>t(Ts.length),children:`Return to proof`})]})}var Ds=`import { useState, type MouseEvent } from "react";
import { Breadcrumb, Button } from "@alien6-studio/elea-ui";

const sections = [
  "Library",
  "Periodicals",
  "Art",
  "Volume one",
  "Spring",
  "Proof",
];
const trail = sections.map((label, index) => ({
  label,
  id: String(index),
  href: "#" + index,
}));

export function ArchiveBreadcrumb() {
  const [depth, setDepth] = useState(trail.length);
  function navigate(event: MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();
    setDepth(Number(href.slice(1)) + 1);
  }

  return (
    <div className="archive-location">
      <Breadcrumb
        items={trail.slice(0, depth)}
        label="Archive location"
        overflowLabel="Earlier sections"
        maxItems={4}
        render={({ href, ...link }) => (
          <a {...link} href={href} onClick={(event) => navigate(event, href)} />
        )}
      />
      {depth < trail.length && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDepth(trail.length)}
        >
          Return to proof
        </Button>
      )}
    </div>
  );
}
`,Os=`import { Breadcrumb } from "@alien6-studio/elea-ui";

const trail = [
  { id: "components", label: "Components", href: "/components" },
  { id: "breadcrumb", label: "Breadcrumb" },
];

export function ComponentTrail() {
  return (
    <Breadcrumb
      label="Component location"
      overflowLabel="Earlier pages"
      separator="›"
      items={trail}
    />
  );
}
`;function ks(){return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`h1`,{children:`Breadcrumb`}),(0,U.jsx)(`p`,{className:`lead`,children:`Show where a page sits in a collection and give each parent a direct link.`}),(0,U.jsx)(H,{title:`Component trail`,code:Os,children:(0,U.jsx)(ct,{label:`Component location`,overflowLabel:`Earlier pages`,separator:`›`,items:[{id:`ui`,label:`Components`,href:`#/ui`},{id:`breadcrumb`,label:`Breadcrumb`}]})}),(0,U.jsx)(H,{title:`A longer trail`,description:`Expand the ellipsis to reveal earlier sections. Follow an ancestor to shorten the trail.`,code:Ds,children:(0,U.jsx)(Es,{})}),(0,U.jsx)(`h2`,{children:`Props`}),(0,U.jsx)(V,{rows:[{name:`items`,type:`readonly BreadcrumbItem[]`,description:`Ordered entries with a stable id, a label and an optional href. The last entry names the current page.`},{name:`label, overflowLabel`,type:`string`,description:`Translated names for the navigation landmark and the disclosure button.`},{name:`maxItems`,type:`number`,defaultValue:`5`,description:`Maximum visible entries, including the disclosure. At least the first and last entries are shown.`},{name:`separator`,type:`ReactNode`,defaultValue:`/`,description:`Decoration between entries, hidden from assistive technology.`},{name:`render`,type:`(props: ButtonLinkRenderProps) => ReactElement`,description:`Render ancestor links using the same router adapter as Button.`}]})]})}var As=`import { useState } from "react";
import { DateField, Field } from "@alien6-studio/elea-ui";

const labels = {
  day: "Day",
  month: "Month",
  year: "Year",
  openCalendar: "Open calendar",
  previousMonth: "Previous month",
  nextMonth: "Next month",
};

export function PublicationDate() {
  const [date, setDate] = useState<string | null>("2028-02-28");

  return (
    <>
      <Field label="Publication date" help="20 February to 10 March 2028">
        {(control) => (
          <DateField
            {...control}
            name="publishedOn"
            label="Publication date"
            locale="en-GB"
            labels={labels}
            min="2028-02-20"
            max="2028-03-10"
            value={date}
            onChange={setDate}
          />
        )}
      </Field>
      <output aria-label="ISO date">{date ?? "No date selected"}</output>
    </>
  );
}
`,js={day:`Day`,month:`Month`,year:`Year`,openCalendar:`Open calendar`,previousMonth:`Previous month`,nextMonth:`Next month`};function Ms(){let[e,t]=(0,W.useState)(`2028-02-28`);return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`h1`,{children:`DateField`}),(0,U.jsx)(`p`,{className:`lead`,children:`Type a date in local order or choose a day from the calendar. Both methods produce the same ISO date.`}),(0,U.jsx)(H,{title:`Schedule a publication`,code:As,children:(0,U.jsxs)(`div`,{className:`catalog-stack catalog-card-demo`,children:[(0,U.jsx)(R,{label:`Publication date`,help:`20 February to 10 March 2028`,children:n=>(0,U.jsx)(Qt,{...n,name:`publishedOn`,label:`Publication date`,locale:`en-GB`,labels:js,min:`2028-02-20`,max:`2028-03-10`,value:e,onChange:t})}),(0,U.jsx)(`output`,{"aria-label":`ISO date`,children:e??`No date selected`})]})}),(0,U.jsx)(`h2`,{children:`Props`}),(0,U.jsx)(V,{rows:[{name:`value, onChange`,type:`string | null, (date: string | null) => void`,description:`A Gregorian date in YYYY-MM-DD form. Clearing a segment, entering an impossible date or leaving the allowed range clears the selection.`},{name:`locale, labels, label`,type:`string, DateFieldLabels, string`,description:`The locale sets segment order, separators, digits and calendar names. Supply translated segment and button labels, plus an accessible name for the field group.`},{name:`min, max`,type:`string`,description:`Inclusive ISO date limits shared by typing and the calendar.`},{name:`weekStartsOn`,type:`0 | 1 | 2 | 3 | 4 | 5 | 6`,description:`Calendar’s first weekday, starting with Sunday at zero.`,defaultValue:`1`},{name:`name, required, disabled`,type:`string, boolean, boolean`,description:`Supply a name to submit the ISO date. Required and disabled follow native form behaviour.`}]})]})}var Ns=[{value:`dk`,label:`Denmark`,group:`Nordic`},{value:`is`,label:`Iceland`,group:`Nordic`},{value:`no`,label:`Norway`,group:`Nordic`},{value:`ee`,label:`Estonia`,group:`Baltic`},{value:`lv`,label:`Latvia`,group:`Baltic`,disabled:!0}];function Ps(){let[e,t]=(0,W.useState)([`is`]);return(0,U.jsx)(R,{label:`Territories`,help:`Choose up to three territories.`,children:n=>(0,U.jsx)(yt,{...n,label:`Territories`,name:`territory`,options:Ns,value:e,onChange:t,max:3,placeholder:`Search territories…`,labels:{empty:`No matching territories`,remove:e=>`Remove ${e}`,selectGroup:e=>`Select all ${e} territories`},renderOption:e=>(0,U.jsxs)(U.Fragment,{children:[e.label,` `,(0,U.jsxs)(`small`,{children:[`(`,e.value.toUpperCase(),`)`]})]})})})}var Fs=`import { useState } from "react";
import { Field, MultiSelect } from "@alien6-studio/elea-ui";

const territories = [
  { value: "dk", label: "Denmark", group: "Nordic" },
  { value: "is", label: "Iceland", group: "Nordic" },
  { value: "no", label: "Norway", group: "Nordic" },
  { value: "ee", label: "Estonia", group: "Baltic" },
  { value: "lv", label: "Latvia", group: "Baltic", disabled: true },
];

export function TerritoryPicker() {
  const [territory, setTerritory] = useState<string[]>(["is"]);
  return (
    <Field label="Territories" help="Choose up to three territories.">
      {(control) => (
        <MultiSelect
          {...control}
          label="Territories"
          name="territory"
          options={territories}
          value={territory}
          onChange={setTerritory}
          max={3}
          placeholder="Search territories…"
          labels={{
            empty: "No matching territories",
            remove: (label) => \`Remove \${label}\`,
            selectGroup: (group) => \`Select all \${group} territories\`,
          }}
          renderOption={(option) => (
            <>
              {option.label} <small>({option.value.toUpperCase()})</small>
            </>
          )}
        />
      )}
    </Field>
  );
}
`,Is=[{value:`landscape`,label:`Landscape`},{value:`architecture`,label:`Architecture`},{value:`portraiture`,label:`Portraiture`}];function Ls(){let[e,t]=(0,W.useState)([]);return(0,U.jsx)(R,{label:`Subjects`,help:`Choose a subject or type a new one.`,children:n=>(0,U.jsx)(yt,{...n,label:`Subjects`,name:`subject`,options:Is,value:e,onChange:t,creatable:!0,placeholder:`Find or add a subject…`,labels:{empty:`No matching subjects`,remove:e=>`Remove ${e}`,create:e=>`Add “${e}”`}})})}var Rs=`import { useState } from "react";
import { Field, MultiSelect } from "@alien6-studio/elea-ui";

const subjects = [
  { value: "landscape", label: "Landscape" },
  { value: "architecture", label: "Architecture" },
  { value: "portraiture", label: "Portraiture" },
];

export function SubjectTags() {
  const [tags, setTags] = useState<string[]>([]);
  return (
    <Field label="Subjects" help="Choose a subject or type a new one.">
      {(control) => (
        <MultiSelect
          {...control}
          label="Subjects"
          name="subject"
          options={subjects}
          value={tags}
          onChange={setTags}
          creatable
          placeholder="Find or add a subject…"
          labels={{
            empty: "No matching subjects",
            remove: (label) => \`Remove \${label}\`,
            create: (text) => \`Add “\${text}”\`,
          }}
        />
      )}
    </Field>
  );
}
`;function zs(){return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`h1`,{children:`MultiSelect`}),(0,U.jsx)(`p`,{className:`lead`,children:`Search a list and keep several choices as removable tags.`}),(0,U.jsx)(H,{title:`Distribution territories`,description:`Add territories individually or select a region in one action. Each selected territory contributes one value to the form.`,code:Fs,children:(0,U.jsx)(`div`,{className:`catalog-card-demo`,children:(0,U.jsx)(Ps,{})})}),(0,U.jsx)(H,{title:`Subject tags`,description:`Choose an existing subject or add your own with Enter. Press Backspace in the empty search field to remove the last editable tag.`,code:Rs,children:(0,U.jsx)(`div`,{className:`catalog-card-demo`,children:(0,U.jsx)(Ls,{})})}),(0,U.jsx)(`h2`,{children:`Props`}),(0,U.jsx)(V,{rows:[{name:`options, value, onChange`,type:`MultiSelectOption[], string[], (value: string[]) => void`,description:`Each option has a unique string value, a plain-text label and optional group and disabled fields. Pass the new array back to commit a change.`},{name:`label, labels, placeholder`,type:`string, MultiSelectLabels, string`,description:`Supply the field name, empty-state message and remove action label. Add selectGroup to offer bulk selection in the unfiltered list.`},{name:`creatable, max`,type:`boolean, number`,description:`Allow new values and optionally limit the selection count. Use labels.create for a localized creation action. A whole group must fit in the remaining space.`},{name:`renderOption`,type:`(option, { selected, disabled }) => ReactNode`,description:`Customize a row’s visual content. The option label continues to name the row for assistive technology.`},{name:`name, required, disabled`,type:`string, boolean, boolean`,description:`Submit each selected value under the same field name. A required field needs a committed value. Spread the Field control props to associate help and errors.`}]})]})}function Bs(){let[e,t]=(0,W.useState)(!1),n=(0,W.useId)();return(0,U.jsx)(xn,{headingLevel:`h3`,heading:`The colour atlas`,description:(0,U.jsxs)(U.Fragment,{children:[`Three palettes drawn from painting and photography.`,(0,U.jsx)(`div`,{id:n,hidden:!e,children:(0,U.jsx)(`dl`,{style:{display:`flex`,flexWrap:`wrap`,gap:`var(--elea-space-5)`},children:[`rasance`,`reserve`,`braise`].map(e=>{let t=Ie[e];return(0,U.jsxs)(`div`,{children:[(0,U.jsx)(`dt`,{children:t.name}),(0,U.jsx)(`dd`,{style:{display:`flex`,margin:0},children:[`primary`,`secondary`,`tertiary`].map(e=>(0,U.jsx)(`span`,{role:`img`,"aria-label":e+` `+t.colours[e],style:{width:`1.75rem`,height:`1rem`,backgroundColor:t.colours[e]}},e))})]},e)})})})]}),actions:(0,U.jsx)(m,{variant:`outline`,"aria-expanded":e,"aria-controls":n,onClick:()=>t(!e),children:e?`Close the palettes`:`Explore the palettes`})})}function Vs(){let[e,t]=(0,W.useState)(!1),n=(0,W.useId)();return(0,U.jsx)(xn,{layout:`cover`,headingLevel:`h3`,eyebrow:`Field notes`,heading:`The glacier notebook`,description:(0,U.jsxs)(U.Fragment,{children:[`An aerial study of the ridges and crevasses that ice leaves behind.`,(0,U.jsx)(`p`,{id:n,hidden:!e,children:`From above, the ice reads like a map. Fine blue lines gather into deep folds where the glacier bends around the rock.`})]}),actions:(0,U.jsx)(m,{"aria-expanded":e,"aria-controls":n,onClick:()=>t(!e),children:e?`Close the notebook`:`Open the notebook`}),image:{src:`/assets/glacier.webp`,srcSet:`/assets/glacier-560.webp 560w, /assets/glacier.webp 1050w`,sizes:`(min-width: 75rem) 52rem, (min-width: 55rem) 65vw, 100vw`,alt:`Deep blue crevasses crossing the white surface of a glacier`,width:1050,height:525,loading:`lazy`}})}function Hs(){let[e,t]=(0,W.useState)(!1);return(0,U.jsx)(xn,{layout:`split`,mediaPosition:`start`,headingLevel:`h3`,eyebrow:`Photographic composition`,heading:`Harbour light`,description:`A red beacon interrupts the long line of the sea. Where you place the horizon changes the weight of the photograph.`,actions:(0,U.jsx)(m,{variant:`outline`,"aria-pressed":e,onClick:()=>t(!e),children:`Compare crops`}),image:{src:`/assets/harbour-light.webp`,sources:[{media:e?`(width > 40rem)`:`(max-width: 40rem)`,srcSet:`/assets/harbour-light-square.webp`,width:600,height:600}],alt:`A red lighthouse on the far end of a breakwater under an overcast sky`,width:1536,height:1024,loading:`lazy`}})}function Us(e,t){let[n,r]=(0,W.useState)(e);function i(e){r(e),t?.()}function a({href:e,onClick:t,...n}){return(0,U.jsx)(`a`,{...n,href:e,onClick:n=>{t?.(n),n.defaultPrevented||(n.preventDefault(),i(e.slice(1)))}})}return{current:n,select:i,render:a}}var Ws=[{id:`hero`,label:`Hero`,description:`Pair a lead image with a headline to open a story.`},{id:`navbar`,label:`Navbar`,description:`Give the publication a masthead and a route to each collection.`},{id:`sidebar`,label:`Sidebar`,description:`Keep chapters and their neighbouring pages within reach.`}],Gs=[`rasance`,`reserve`,`braise`];function Ks({study:e}){let t=Ie[e].colours;return(0,U.jsx)(`span`,{"aria-hidden":`true`,style:{display:`flex`,flex:1},children:[`primary`,`secondary`,`tertiary`].map(e=>(0,U.jsx)(`span`,{style:{flex:1,background:t[e]}},e))})}function qs({artworks:e={}}){let t=Us(`colours`),n=Gs.find(e=>e===t.current),r=Ws.find(e=>e.id===t.current),i=t.current===`colours`||n!==void 0,a=`Design handbook`,o=`Field guides to the shapes, colours and layouts of a publication.`;return r?(a=r.label,o=r.description):t.current===`studio`?(a=`Theme studio`,o=`Primary, secondary and tertiary colours from the three studies.`):i&&(a=n?Ie[n].name:`Colour studies`,o=n?Ie[n].style:``),(0,U.jsxs)(`div`,{style:{width:`100%`,background:`var(--elea-color-surface-default)`},children:[(0,U.jsx)(pe,{label:`Design handbook`,menuLabel:`Menu`,brand:t.render({href:`#home`,"aria-current":t.current===`home`?`page`:void 0,children:(0,U.jsx)(`strong`,{children:`Design handbook`})}),items:[{id:`guides`,label:`Guides`,disclosureLabel:`Browse guides`,children:Ws.map(({id:e,label:t})=>({id:e,label:t,href:`#`+e}))},{id:`colours`,label:`Colour atlas`,href:`#colours`}],current:i?`colours`:t.current,render:t.render,persistentActions:(0,U.jsx)(m,{href:`#studio`,render:t.render,"aria-current":t.current===`studio`?`page`:void 0,variant:`outline`,size:`sm`,children:`Studio`})}),(0,U.jsxs)(`section`,{"aria-label":`Handbook preview`,style:{padding:`var(--elea-space-5)`,minBlockSize:`11rem`},children:[(0,U.jsx)(`h3`,{"aria-live":`polite`,style:{margin:0,fontSize:`var(--elea-font-size-2xl)`},children:a}),o&&(0,U.jsx)(`p`,{children:o}),(i||t.current===`studio`)&&(0,U.jsx)(`div`,{style:{display:`grid`,gridTemplateColumns:`repeat(3, minmax(0, 1fr))`,gap:`var(--elea-space-3)`,marginBlockStart:`var(--elea-space-4)`},children:Gs.map(r=>{let i=e[r];return(0,U.jsxs)(m,{size:`sm`,variant:r===n?`outline`:`ghost`,"aria-pressed":r===n,onClick:()=>t.select(r===n?`colours`:r),style:{display:`grid`,gridTemplateColumns:`minmax(0, 1fr)`,height:`auto`,padding:`var(--elea-space-1)`,minWidth:0},children:[(0,U.jsx)(`span`,{style:{display:`flex`,aspectRatio:`4 / 3`,marginBlockEnd:`var(--elea-space-2)`},children:i&&t.current!==`studio`?(0,U.jsx)(re,{src:i.src,alt:``,loading:`lazy`,style:{width:`100%`,height:`100%`,objectFit:`cover`}}):(0,U.jsx)(Ks,{study:r})}),Ie[r].name]},r)})})]})]})}var Js=[{id:`crop`,label:`Image crop`,description:`The cover is framed at 16:9, ready for a 1600 × 900 export.`},{id:`theme`,label:`Theme studio`,description:`The notebook uses the Réserve palette and ELEA Sans.`},{id:`publishing`,label:`Publishing`,description:`The glacier notebook is a draft visible to its editors.`}];function Ys(){let e=Us(`editor`),t=Js.find(t=>t.id===e.current);return(0,U.jsxs)(`div`,{style:{width:`100%`},children:[(0,U.jsx)(pe,{label:`Editorial tools`,menuLabel:`Menu`,collapse:`never`,submenuLayout:`columns`,items:[{id:`editor`,label:`Editor`,href:`#editor`},{id:`tools`,label:`Tools`,children:Js.map(({id:e,label:t})=>({id:e,label:t,href:`#`+e}))}],current:e.current,render:e.render}),(0,U.jsxs)(`section`,{"aria-label":`Tool preview`,style:{padding:`var(--elea-space-5)`,minBlockSize:`7rem`},children:[(0,U.jsx)(`h3`,{"aria-live":`polite`,style:{margin:0,fontSize:`var(--elea-font-size-2xl)`},children:t?.label??`Editor`}),(0,U.jsx)(`p`,{children:t?.description??`The glacier notebook · Cover, introduction and field notes.`})]})]})}var Xs=`"use client";

import { useId, useState } from "react";
import { Button, Hero } from "@alien6-studio/elea-ui";

export function NotebookHero() {
  const [open, setOpen] = useState(false);
  const excerpt = useId();

  return (
    <Hero
      layout="cover"
      eyebrow="Field notes"
      heading="The glacier notebook"
      description={
        <>
          An aerial study of the ridges and crevasses that ice leaves behind.
          <p id={excerpt} hidden={!open}>
            From above, the ice reads like a map. Fine blue lines gather into
            deep folds where the glacier bends around the rock.
          </p>
        </>
      }
      actions={
        <Button
          aria-expanded={open}
          aria-controls={excerpt}
          onClick={() => setOpen(!open)}
        >
          {open ? "Close the notebook" : "Open the notebook"}
        </Button>
      }
      image={{
        src: "/images/glacier.webp",
        srcSet: "/images/glacier-560.webp 560w, /images/glacier.webp 1050w",
        sizes: "(min-width: 75rem) 52rem, (min-width: 55rem) 65vw, 100vw",
        alt: "Deep blue crevasses crossing the white surface of a glacier",
        width: 1050,
        height: 525,
      }}
    />
  );
}`,Zs=`import { Button, Hero } from "@alien6-studio/elea-ui";

const description =
  "A red beacon interrupts the long line of the sea. " +
  "Where you place the horizon changes the weight of the photograph.";
const alt =
  "A red lighthouse on the far end of a breakwater under an overcast sky";

export function HarbourHero() {
  return (
    <Hero
      layout="split"
      mediaPosition="start"
      eyebrow="Photographic composition"
      heading="Harbour light"
      description={description}
      actions={
        <Button href="/harbour-light/crops" variant="outline">
          Compare crops
        </Button>
      }
      image={{
        src: "/images/harbour-light.webp",
        alt,
        width: 1536,
        height: 1024,
        sources: [
          {
            media: "(max-width: 40rem)",
            srcSet: "/images/harbour-light-square.webp",
            width: 600,
            height: 600,
          },
        ],
      }}
    />
  );
}`,Qs=`"use client";

import { useId, useState } from "react";
import { Button, Hero } from "@alien6-studio/elea-ui";
import { PaletteList } from "./PaletteList";

export function AtlasHero() {
  const [open, setOpen] = useState(false);
  const palettes = useId();

  return (
    <Hero
      heading="The colour atlas"
      description={
        <>
          Three palettes drawn from painting and photography.
          <PaletteList id={palettes} hidden={!open} />
        </>
      }
      actions={
        <Button
          variant="outline"
          aria-expanded={open}
          aria-controls={palettes}
          onClick={() => setOpen(!open)}
        >
          {open ? "Close the palettes" : "Explore the palettes"}
        </Button>
      }
    />
  );
}`,$s=`import { Button, Navbar, type NavigationItem } from "@alien6-studio/elea-ui";

const items: NavigationItem[] = [
  {
    id: "guides",
    label: "Guides",
    disclosureLabel: "Browse guides",
    children: [
      { id: "hero", label: "Hero", href: "/guides/hero" },
      { id: "navbar", label: "Navbar", href: "/guides/navbar" },
      { id: "sidebar", label: "Sidebar", href: "/guides/sidebar" },
    ],
  },
  { id: "colours", label: "Colour atlas", href: "/colours" },
];

export function HandbookNavbar({ current }: { current: string }) {
  return (
    <Navbar
      label="Design handbook"
      menuLabel="Menu"
      brand={
        <a href="/">
          <strong>Design handbook</strong>
        </a>
      }
      items={items}
      current={current}
      persistentActions={
        <Button href="/studio" variant="outline" size="sm">
          Studio
        </Button>
      }
    />
  );
}`,ec=`import { Navbar, type NavigationItem } from "@alien6-studio/elea-ui";

const items: NavigationItem[] = [
  { id: "editor", label: "Editor", href: "/editor" },
  {
    id: "tools",
    label: "Tools",
    children: [
      { id: "crop", label: "Image crop", href: "/tools/crop" },
      { id: "theme", label: "Theme studio", href: "/tools/theme" },
      { id: "publishing", label: "Publishing", href: "/tools/publishing" },
    ],
  },
];

export function ToolsNavbar({ current }: { current: string }) {
  return (
    <Navbar
      label="Editorial tools"
      menuLabel="Menu"
      collapse="never"
      submenuLayout="columns"
      items={items}
      current={current}
    />
  );
}`,tc=`import { Sidebar, type SidebarGroup } from "@alien6-studio/elea-ui";

const groups: SidebarGroup[] = [
  {
    id: "foundations",
    label: "Foundations",
    items: [
      {
        id: "type",
        label: "Typography",
        href: "/typography",
        disclosureLabel: "Browse typography",
        children: [
          {
            id: "letterforms",
            label: "Letterforms",
            href: "/typography/letterforms",
          },
          { id: "sizes", label: "Text sizes", href: "/typography/sizes" },
        ],
      },
      { id: "colours", label: "Colour atlas", href: "/colours" },
    ],
  },
  {
    id: "layout",
    label: "Page layout",
    collapsible: true,
    defaultExpanded: false,
    items: [
      { id: "hero", label: "Hero", href: "/layout/hero" },
      { id: "footer", label: "Footer", href: "/layout/footer" },
    ],
  },
];

export function HandbookSidebar({ current }: { current: string }) {
  return (
    <Sidebar
      label="Library sections"
      header={<strong>Contents</strong>}
      groups={groups}
      current={current}
      footer={<a href="/guides">All chapters</a>}
    />
  );
}`,nc=`"use client";

import { useState } from "react";
import { Button, Sheet } from "@alien6-studio/elea-ui";
import { HandbookSidebar } from "./HandbookSidebar";

export function NavigationDrawer({ current }: { current: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        Contents
      </Button>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        side="start"
        size="sm"
        title="Handbook contents"
        closeLabel="Close contents"
      >
        <HandbookSidebar current={current} />
      </Sheet>
    </>
  );
}`,rc=[{id:`foundations`,label:`Foundations`,items:[{id:`type`,label:`Typography`,href:`#type`,disclosureLabel:`Browse typography`,children:[{id:`letterforms`,label:`Letterforms`,href:`#letterforms`},{id:`sizes`,label:`Text sizes`,href:`#sizes`}]},{id:`colours`,label:`Colour atlas`,href:`#colours`}]},{id:`layout`,label:`Page layout`,collapsible:!0,defaultExpanded:!1,items:[{id:`hero`,label:`Hero`,href:`#hero`},{id:`footer`,label:`Footer`,href:`#footer`}]}],ic={guides:{title:`Design handbook`,text:`The handbook covers type, colour and page composition. Choose a chapter from the contents.`},type:{title:`Typography`,text:`Start with the shapes of the letters, then compare the type at reading and display sizes.`},letterforms:{title:`ELEA Sans`,text:`Roman and italic, regular weight`},sizes:{title:`Text sizes`,text:`Set a comfortable size for the body before deciding how far the headline should stand above it.`},colours:{title:`Colour atlas`,text:`Réserve pairs an ultramarine primary with a pale secondary. Braise brings the same roles into warmer colours.`},hero:{title:`Hero`,text:`Start the story with a headline and a single action. Use a lead photograph when the setting is part of the story.`},footer:{title:`Footer`,text:`At the end of the page, group links by destination so readers can find a related story or return to the publication.`}};function ac({navigation:e}){return(0,U.jsx)(Cn,{label:`Library sections`,header:(0,U.jsx)(`strong`,{children:`Contents`}),groups:rc,current:e.current,render:e.render,footer:e.render({href:`#guides`,children:`All chapters`})})}function oc({navigation:e}){let t=ic[e.current];return t?(0,U.jsxs)(`article`,{"aria-live":`polite`,style:{flex:`1 1 15rem`,minWidth:0,padding:`var(--elea-space-4)`},children:[(0,U.jsx)(`h3`,{style:{margin:0,fontSize:`var(--elea-font-size-2xl)`},children:t.title}),e.current===`letterforms`&&(0,U.jsxs)(`div`,{"aria-hidden":`true`,style:{marginBlockStart:`var(--elea-space-5)`,fontFamily:`"ELEA Sans", sans-serif`,fontSize:`clamp(3rem, 7vw, 5rem)`,lineHeight:1.1},children:[`Aa `,(0,U.jsx)(`em`,{children:`Aa`})]}),(0,U.jsx)(`p`,{children:t.text}),e.current===`sizes`&&(0,U.jsxs)(`div`,{style:{fontFamily:`"ELEA Sans", sans-serif`},children:[(0,U.jsx)(`p`,{style:{fontSize:`1rem`},children:`Body copy`}),(0,U.jsx)(`p`,{style:{fontSize:`2rem`},children:`Headline`})]}),e.current===`letterforms`&&(0,U.jsx)(m,{size:`sm`,variant:`outline`,onClick:()=>e.select(`sizes`),children:`Compare text sizes`})]}):null}function sc(){let e=Us(`letterforms`),t=`guides`;return[`type`,`letterforms`,`sizes`].includes(e.current)?t=`type`:e.current===`colours`&&(t=`colours`),(0,U.jsxs)(`div`,{style:{width:`100%`,background:`var(--elea-color-surface-default)`},children:[(0,U.jsx)(pe,{label:`Design handbook`,menuLabel:`Handbook menu`,brand:(0,U.jsx)(`strong`,{children:`Design handbook`}),items:[{id:`guides`,label:`Guides`,href:`#guides`},{id:`type`,label:`Typography`,href:`#type`},{id:`colours`,label:`Colour atlas`,href:`#colours`}],current:t,render:e.render}),(0,U.jsxs)(`div`,{style:{display:`flex`,flexWrap:`wrap`,gap:`var(--elea-space-4)`,padding:`var(--elea-space-4)`},children:[(0,U.jsx)(oc,{navigation:e}),(0,U.jsx)(ac,{navigation:e})]})]})}function cc(){let[e,t]=(0,W.useState)(!1),n=()=>t(!1),r=Us(`letterforms`,n);return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsxs)(`div`,{style:{width:`100%`,background:`var(--elea-color-surface-default)`},children:[(0,U.jsxs)(`header`,{style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,gap:`var(--elea-space-3)`,padding:`var(--elea-space-3) var(--elea-space-4)`},children:[(0,U.jsx)(`strong`,{children:`Design handbook`}),(0,U.jsx)(m,{variant:`outline`,size:`sm`,"aria-haspopup":`dialog`,onClick:()=>t(!0),children:`Contents`})]}),(0,U.jsx)(oc,{navigation:r})]}),(0,U.jsx)(en,{open:e,onClose:n,side:`start`,size:`sm`,title:`Handbook contents`,closeLabel:`Close contents`,children:(0,U.jsx)(ac,{navigation:r})})]})}function lc(){return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`h1`,{children:`Hero`}),(0,U.jsx)(`p`,{className:`lead`,children:`Introduce a publication or collection with a headline, a lead image and a route into the story.`}),(0,U.jsxs)(`div`,{className:`layout-sample`,children:[(0,U.jsx)(H,{title:`Photographic cover`,description:`Set a headline directly on the photograph. The browser chooses between two image widths, and the cover keeps the text legible over the ice.`,code:Xs,children:(0,U.jsx)(Vs,{})}),(0,U.jsx)(H,{title:`Image-led feature`,description:`Show the full horizon alongside the story. On a phone, a square crop keeps the lighthouse in view beneath the introduction.`,code:Zs,children:(0,U.jsx)(Hs,{})}),(0,U.jsx)(H,{title:`Text opening`,description:`Open the atlas to see the primary, secondary and tertiary colours of three palettes.`,code:Qs,children:(0,U.jsx)(Bs,{})})]}),(0,U.jsx)(`h2`,{children:`Props`}),(0,U.jsx)(V,{rows:[{name:`heading`,type:`ReactNode`,description:`The headline for the section.`},{name:`headingLevel`,type:`"h1" … "h6"`,defaultValue:`"h1"`,description:`Choose the level that follows the surrounding page structure.`},{name:`layout`,type:`"stacked" | "split" | "cover"`,defaultValue:`"stacked"`,description:`Place media below the copy, beside it or behind it on a photographic cover.`},{name:`image`,type:`ResponsiveImageProps`,description:`Supply src, alt and intrinsic dimensions. Optional srcSet, sizes and picture sources support different crops by viewport.`},{name:`mediaPosition`,type:`"start" | "end"`,defaultValue:`"end"`,description:`Choose which edge carries the image in a split layout.`},{name:`eyebrow, description`,type:`ReactNode`,description:`Optional publication name and introductory copy.`},{name:`actions, media`,type:`ReactNode`,description:`Supply links or buttons and an image, picture or figure with its own text alternative.`}]})]})}function uc(){return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`h1`,{children:`Navbar`}),(0,U.jsx)(`p`,{className:`lead`,children:`Give readers direct access to the main destinations in a site.`}),(0,U.jsxs)(`div`,{className:`layout-sample`,children:[(0,U.jsx)(H,{title:`Publication masthead`,description:`Open Guides for a vertical list of chapters. Choose a chapter or a colour study to read it in this preview.`,code:$s,children:(0,U.jsx)(qs,{artworks:g})}),(0,U.jsx)(H,{title:`Column menu`,description:`Open Tools to see destinations arranged in columns on a wide screen. Selecting one shows that part of the notebook here.`,code:ec,children:(0,U.jsx)(Ys,{})})]}),(0,U.jsx)(`h2`,{children:`Props`}),(0,U.jsx)(V,{rows:[{name:`label, menuLabel`,type:`string`,description:`Translated names for the navigation landmark and its compact menu button.`},{name:`items`,type:`readonly NavigationItem[]`,description:`Give destinations an id, label and href. A group with children can omit href so its label opens the list.`},{name:`current`,type:`string`,description:`The id of the active link, announced as the current page.`},{name:`submenuLayout`,type:`"list" | "columns"`,defaultValue:`"list"`,description:`Stack child links beneath their group or arrange them in columns across a wide navbar.`},{name:`collapse`,type:`"auto" | "never"`,defaultValue:`"auto"`,description:`Collapse into a disclosure in narrow containers, or keep a short list of links in view.`},{name:`persistentActions`,type:`ReactNode`,description:`Keep a utility such as search or account access visible on both wide and narrow screens.`},{name:`brand, actions`,type:`ReactNode`,description:`Place a home link before the destinations and account or utility controls after them.`},{name:`render`,type:`(props: ButtonLinkRenderProps) => ReactElement`,description:`Forward the link props to your router’s link component.`}]})]})}function dc(){return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`h1`,{children:`Sidebar`}),(0,U.jsx)(`p`,{className:`lead`,children:`Organise a collection into named groups and keep the current page in view.`}),(0,U.jsxs)(`div`,{className:`layout-sample`,children:[(0,U.jsx)(H,{title:`Site and section navigation`,description:`Choose a chapter in the contents to read it beside the sidebar. The top bar follows its collection.`,code:tc,children:(0,U.jsx)(sc,{})}),(0,U.jsx)(H,{title:`Navigation drawer`,description:`Open Contents and choose a chapter. The drawer closes and the article shows your selection.`,code:nc,children:(0,U.jsx)(cc,{})})]}),(0,U.jsx)(`h2`,{children:`Props`}),(0,U.jsx)(V,{rows:[{name:`label`,type:`string`,description:`Accessible name for this navigation landmark.`},{name:`groups`,type:`readonly SidebarGroup[]`,description:`Named groups of links. Items can include children; the ancestors of the current item open automatically.`},{name:`collapsible, defaultExpanded`,type:`boolean (per group)`,description:`Allow a group to fold and choose whether it starts open.`},{name:`current`,type:`string`,description:`The id of the current destination across all groups.`},{name:`header, footer`,type:`ReactNode`,description:`Add a collection title above the groups and a return link or account action below them.`},{name:`render`,type:`(props: ButtonLinkRenderProps) => ReactElement`,description:`Supply the same router-link adapter as Navbar and Button.`}]})]})}var fc=(0,W.lazy)(async()=>({default:(await ke(async()=>{let{MediaPage:e}=await import(`./media-CyqPReiq.js`);return{MediaPage:e}},__vite__mapDeps([22,23,1,12,3,4,24,16,25,18,26,27,28]))).MediaPage})),pc={button:{page:Zi,interaction:(0,U.jsxs)(U.Fragment,{children:[`Use `,(0,U.jsx)(`kbd`,{children:`Enter`}),` or `,(0,U.jsx)(`kbd`,{children:`Space`}),` on a button. A link styled as a button follows its destination with `,(0,U.jsx)(`kbd`,{children:`Enter`}),`. Give an icon-only action a descriptive label.`]}),preview:(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(m,{size:`sm`,children:`Publish`}),(0,U.jsx)(m,{variant:`outline`,size:`sm`,children:`Save draft`})]})},badge:{page:Qi,interaction:(0,U.jsx)(U.Fragment,{children:`Give each state a short, meaningful name such as “Published”. A badge is read with the surrounding content and stays outside the tab order.`}),preview:(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(u,{tone:`success`,children:`Published`}),(0,U.jsx)(u,{tone:`warning`,children:`In review`}),(0,U.jsx)(u,{children:`Draft`})]})},field:{page:ea,interaction:(0,U.jsxs)(U.Fragment,{children:[`Pass the field render props to the input so its label, help text and error are announced together. `,(0,U.jsx)(`kbd`,{children:`Tab`}),` moves between controls.`]}),preview:(0,U.jsx)(R,{label:`Article title`,children:e=>(0,U.jsx)(b,{...e,readOnly:!0,value:Ee})})},select:{workspace:!0,page:oa,interaction:(0,U.jsxs)(U.Fragment,{children:[`Open the list and move with the arrow keys. Type a letter to jump to a matching option, choose with `,(0,U.jsx)(`kbd`,{children:`Enter`}),` or `,(0,U.jsx)(`kbd`,{children:`Space`}),`, and close with `,(0,U.jsx)(`kbd`,{children:`Escape`}),`.`]}),preview:(0,U.jsx)(j,{label:`Language`,value:`en`,onChange:()=>{},options:[{value:`en`,label:`English`},{value:`fr`,label:`Français`}]})},calendar:{page:qo,interaction:(0,U.jsxs)(U.Fragment,{children:[`Arrow keys move by day or week. `,(0,U.jsx)(`kbd`,{children:`Page Up`}),` and `,(0,U.jsx)(`kbd`,{children:`Page Down`}),` change the month. Press `,(0,U.jsx)(`kbd`,{children:`Enter`}),` or `,(0,U.jsx)(`kbd`,{children:`Space`}),` to select the focused date.`]}),preview:(0,U.jsx)(ht,{className:`gallery__calendar`,label:`Publication date`,labels:Go,locale:`en-GB`,value:`2028-02-29`,onChange:()=>{}})},"date-field":{page:Ms,interaction:(0,U.jsx)(U.Fragment,{children:`Tab between the date segments and the calendar button. The calendar supports arrow keys and returns focus when you choose a day.`}),preview:(0,U.jsx)(Qt,{label:`Publication date`,value:`2028-03-01`,onChange:()=>{},locale:`en-GB`,labels:{...Go,day:`Day`,month:`Month`,year:`Year`,openCalendar:`Open calendar`}})},"multi-select":{page:zs,interaction:(0,U.jsxs)(U.Fragment,{children:[`Type to filter and use the arrow keys to browse. Press `,(0,U.jsx)(`kbd`,{children:`Enter`}),` to toggle a result or `,(0,U.jsx)(`kbd`,{children:`Backspace`}),` in the empty search field to remove the last tag.`]}),preview:(0,U.jsx)(yt,{label:`Collections`,options:Ko,value:[`ice`],onChange:()=>{},labels:{empty:`No collections found`,remove:e=>`Remove `+e}})},combobox:{page:Jo,interaction:(0,U.jsxs)(U.Fragment,{children:[`Type to filter and use the arrow keys to explore matches. `,(0,U.jsx)(`kbd`,{children:`Enter`}),` selects an option. `,(0,U.jsx)(`kbd`,{children:`Escape`}),` restores the previous choice.`]}),preview:(0,U.jsx)(v,{options:Ko,value:null,onChange:()=>{},label:`Collection`,placeholder:`Search collections…`,emptyMessage:`No matching collections`})},"color-picker":{page:Yo,interaction:(0,U.jsxs)(U.Fragment,{children:[`Use `,(0,U.jsx)(`kbd`,{children:`Tab`}),` to reach the swatch or the hex input. Press `,(0,U.jsx)(`kbd`,{children:`Enter`}),` to apply a typed value, or `,(0,U.jsx)(`kbd`,{children:`Escape`}),` to restore the last colour.`]}),preview:(0,U.jsx)(h,{label:`Ink colour`,hexLabel:`Ink hex`,invalidMessage:`Enter a six-digit hex colour.`,value:r.Emerald.seed,onChange:()=>{}})},media:{page:fc,interaction:(0,U.jsxs)(U.Fragment,{children:[`Use the arrow keys on the frame to move it or on a corner to resize it. Hold `,(0,U.jsx)(`kbd`,{children:`Shift`}),` for larger steps. Open Adjust crop to return to a saved composition.`]}),preview:(0,U.jsx)(`img`,{className:`gallery__crop`,src:`/assets/harbour-light.webp`,alt:``,loading:`lazy`})},choice:{page:ta,interaction:(0,U.jsxs)(U.Fragment,{children:[`Use `,(0,U.jsx)(`kbd`,{children:`Tab`}),` to reach each enabled control and `,(0,U.jsx)(`kbd`,{children:`Space`}),` to toggle it. A mixed checkbox can represent a partially selected group.`]}),preview:(0,U.jsxs)(`div`,{className:`catalog-stack`,children:[(0,U.jsx)(L,{label:`Include cover`,checked:!0,readOnly:!0}),(0,U.jsx)(I,{label:`Allow comments`,checked:!0,onCheckedChange:()=>{}})]})},"radio-group":{page:ca,interaction:(0,U.jsxs)(U.Fragment,{children:[`Use `,(0,U.jsx)(`kbd`,{children:`Tab`}),` to enter the group and arrow keys to change the checked option. The checked radio contributes its value to the form under the group name.`]}),preview:(0,U.jsx)(ue,{label:`Audience`,name:`preview-audience`,defaultValue:`team`,options:[{value:`team`,label:`Team`},{value:`public`,label:`Public`}]})},dialog:{page:na,interaction:(0,U.jsxs)(U.Fragment,{children:[`Open the dialog and use `,(0,U.jsx)(`kbd`,{children:`Tab`}),` or `,(0,U.jsx)(`kbd`,{children:`Shift`}),` + `,(0,U.jsx)(`kbd`,{children:`Tab`}),` to move inside it. `,(0,U.jsx)(`kbd`,{children:`Escape`}),` closes the dialog and returns focus to the opener.`]}),preview:(0,U.jsxs)(`div`,{className:`gallery__dialog`,children:[(0,U.jsx)(`strong`,{children:`Publish article?`}),(0,U.jsx)(`span`,{children:`Visible to everyone in your workspace.`}),(0,U.jsx)(m,{size:`sm`,children:`Publish`})]})},sheet:{page:Vo,interaction:(0,U.jsxs)(U.Fragment,{children:[`A sheet is a modal dialog: `,(0,U.jsx)(`kbd`,{children:`Tab`}),` stays inside it, `,(0,U.jsx)(`kbd`,{children:`Escape`}),` or the backdrop closes it and focus returns to the opener. Its body scrolls between the title and the actions.`]}),preview:(0,U.jsxs)(`div`,{className:`catalog-sheet-preview`,children:[(0,U.jsx)(`span`,{}),(0,U.jsxs)(`div`,{children:[(0,U.jsx)(`strong`,{children:`Article details`}),(0,U.jsx)(`span`,{children:`Title, summary, author`}),(0,U.jsx)(m,{size:`sm`,children:`Save`})]})]})},popover:{page:zo,interaction:(0,U.jsxs)(U.Fragment,{children:[`The trigger opens the panel and focus moves into it. `,(0,U.jsx)(`kbd`,{children:`Escape`}),` closes it and returns to the trigger; a click outside or `,(0,U.jsx)(`kbd`,{children:`Tab`}),` past its last control closes it too. The page behind stays usable. A confirmation keeps `,(0,U.jsx)(`kbd`,{children:`Tab`}),` inside until it is answered.`]}),preview:(0,U.jsxs)(`div`,{className:`catalog-popover-preview`,children:[(0,U.jsx)(m,{variant:`outline`,size:`sm`,children:`Invite`}),(0,U.jsxs)(`div`,{className:`elea-popover__panel`,children:[(0,U.jsx)(`strong`,{children:`Invite a reader`}),(0,U.jsx)(`span`,{children:`They can read, not edit.`})]})]})},menu:{page:ra,interaction:(0,U.jsxs)(U.Fragment,{children:[`Open with `,(0,U.jsx)(`kbd`,{children:`↓`}),` or `,(0,U.jsx)(`kbd`,{children:`↑`}),`, then move between enabled items with the arrows. `,(0,U.jsx)(`kbd`,{children:`Home`}),` and `,(0,U.jsx)(`kbd`,{children:`End`}),` jump to the first and last. `,(0,U.jsx)(`kbd`,{children:`Escape`}),` dismisses the list.`]}),preview:(0,U.jsxs)(`div`,{className:`elea-menu__list catalog-menu`,children:[(0,U.jsx)(`div`,{className:`elea-menu__item elea-menu__item--active`,children:`Edit article`}),(0,U.jsx)(`div`,{className:`elea-menu__item`,children:`Duplicate`}),(0,U.jsx)(`div`,{className:`elea-menu__item elea-menu__item--danger`,children:`Delete`})]})},tooltip:{page:ia,interaction:(0,U.jsxs)(U.Fragment,{children:[`Focus the trigger with `,(0,U.jsx)(`kbd`,{children:`Tab`}),` to reveal the hint. Keep the trigger’s accessible name meaningful on its own.`]}),preview:(0,U.jsxs)(`div`,{className:`catalog-tooltip`,children:[(0,U.jsx)(`span`,{className:`elea-tooltip__bubble`,"data-side":`top`,children:`Save without publishing`}),(0,U.jsx)(m,{variant:`outline`,size:`sm`,children:`Save draft`})]})},slider:{page:vo,interaction:(0,U.jsxs)(U.Fragment,{children:[`The slider is a native range input. `,(0,U.jsx)(`kbd`,{children:`←`}),` and `,(0,U.jsx)(`kbd`,{children:`→`}),` move by one step, `,(0,U.jsx)(`kbd`,{children:`Page Up`}),` and `,(0,U.jsx)(`kbd`,{children:`Page Down`}),` by a larger one, `,(0,U.jsx)(`kbd`,{children:`Home`}),` and `,(0,U.jsx)(`kbd`,{children:`End`}),` reach the bounds. A worded value is read in place of the number.`]}),preview:(0,U.jsx)(`div`,{className:`catalog-fill`,children:(0,U.jsx)(ge,{label:`Volume`,showValue:!0,defaultValue:40})})},alert:{page:Ya,interaction:(0,U.jsxs)(U.Fragment,{children:[`Warnings and errors use `,(0,U.jsx)(`code`,{children:`role="alert"`}),` and are announced at once; the other tones use `,(0,U.jsx)(`code`,{children:`role="status"`}),`. The close button is reached with `,(0,U.jsx)(`kbd`,{children:`Tab`}),` and carries the label you pass.`]}),preview:(0,U.jsx)(s,{role:`note`,tone:`success`,title:`Article published`,children:`Visible to everyone.`})},toast:{page:Co,interaction:(0,U.jsxs)(U.Fragment,{children:[`Toasts sit in a named region that is announced politely, and an error at once. They never take the focus; `,(0,U.jsx)(`kbd`,{children:`Tab`}),` reaches their action and close button, and their timer waits while the pointer or the focus is on them. Keep anything people must act on in the page.`]}),preview:(0,U.jsxs)(`div`,{className:`elea-toast elea-toast--success catalog-fill`,children:[(0,U.jsx)(`span`,{className:`elea-toast__icon`,"aria-hidden":`true`,children:(0,U.jsx)(bo,{name:`success`})}),(0,U.jsxs)(`div`,{className:`elea-toast__body`,children:[(0,U.jsx)(`p`,{className:`elea-toast__title`,children:`Article published`}),(0,U.jsx)(`p`,{className:`elea-toast__description`,children:`Visible to everyone.`})]})]})},progress:{page:Xa,interaction:(0,U.jsxs)(U.Fragment,{children:[`The bar is a `,(0,U.jsx)(`code`,{children:`progressbar`}),` named by its label. Word the value with `,(0,U.jsx)(`code`,{children:`formatValue`}),` when a percentage says too little, such as “3 of 8 files”.`]}),preview:(0,U.jsx)(`div`,{className:`catalog-fill`,children:(0,U.jsx)(kn,{label:`Uploading`,value:62,showValue:!0})})},"save-status":{page:Cs,interaction:(0,U.jsxs)(U.Fragment,{children:[`The text sits in a `,(0,U.jsx)(`code`,{children:`status`}),` region that stays mounted, so each change is announced without taking focus. The retry button is outside it and is reached with `,(0,U.jsx)(`kbd`,{children:`Tab`}),`.`]}),preview:(0,U.jsx)(B,{state:`saved`,children:`Saved at 12:12`})},"content-comparison":{page:ws,interaction:(0,U.jsxs)(U.Fragment,{children:[`Insertions are `,(0,U.jsx)(`code`,{children:`ins`}),` elements and deletions `,(0,U.jsx)(`code`,{children:`del`}),` elements, underlined and struck through, so the difference does not rest on colour.`]}),preview:(0,U.jsxs)(`p`,{className:`elea-content elea-comparison`,children:[`Printed on `,(0,U.jsx)(`del`,{className:`elea-change elea-change--removed`,children:`Monday`}),(0,U.jsx)(`ins`,{className:`elea-change elea-change--added`,children:`Tuesday`})]})},skeleton:{page:qa,interaction:(0,U.jsxs)(U.Fragment,{children:[`Placeholders are hidden from assistive technology. Mark the region that loads with `,(0,U.jsx)(`code`,{children:`aria-busy`}),` so its state is announced.`]}),preview:(0,U.jsxs)(`div`,{className:`catalog-loading catalog-fill`,children:[(0,U.jsx)(c,{variant:`circle`,width:36,height:36}),(0,U.jsxs)(`div`,{className:`catalog-stack`,children:[(0,U.jsx)(c,{width:`50%`}),(0,U.jsx)(c,{lines:2})]})]})},card:{page:Ga,interaction:(0,U.jsx)(U.Fragment,{children:`Give the title the heading level that fits the page. In an interactive card the title link is the only tab stop and covers the whole surface.`}),preview:(0,U.jsxs)(F,{padding:`sm`,className:`gallery__notebook`,children:[(0,U.jsx)(ae,{src:Oe.data.file.url,alt:``,width:1050,height:525,loading:`lazy`}),(0,U.jsx)(M,{children:(0,U.jsx)(N,{children:Ee})})]})},avatar:{page:Ja,interaction:(0,U.jsxs)(U.Fragment,{children:[`An avatar is announced by its `,(0,U.jsx)(`code`,{children:`name`}),`. Leave the name empty when it is already written beside the avatar, and name a group with `,(0,U.jsx)(`code`,{children:`aria-label`}),`.`]}),preview:(0,U.jsxs)(On,{"aria-label":`Editors`,max:3,children:[(0,U.jsx)(q,{name:`Ada Lovelace`,tone:`primary`}),(0,U.jsx)(q,{name:`Grace Hopper`}),(0,U.jsx)(q,{name:`Alan Turing`,tone:`secondary`}),(0,U.jsx)(q,{name:`Hedy Lamarr`})]})},table:{page:ho,interaction:(0,U.jsxs)(U.Fragment,{children:[`A table with a `,(0,U.jsx)(`code`,{children:`label`}),` scrolls inside a named region that `,(0,U.jsx)(`kbd`,{children:`Tab`}),` reaches, then the arrow keys scroll it. A sortable heading is a button, and its column states the direction with `,(0,U.jsx)(`code`,{children:`aria-sort`}),`.`]}),preview:(0,U.jsxs)(J,{density:`sm`,className:`catalog-fill`,children:[(0,U.jsx)(Y,{children:(0,U.jsxs)(Z,{children:[(0,U.jsx)(Q,{children:`Article`}),(0,U.jsx)(Q,{align:`end`,children:`Words`})]})}),(0,U.jsxs)(X,{children:[(0,U.jsxs)(Z,{children:[(0,U.jsx)($,{children:`Field notes`}),(0,U.jsx)($,{numeric:!0,children:`1,240`})]}),(0,U.jsxs)(Z,{children:[(0,U.jsx)($,{children:`Herbarium`}),(0,U.jsx)($,{numeric:!0,children:`2,105`})]})]})]})},navbar:{page:uc,interaction:(0,U.jsxs)(U.Fragment,{children:[`Use `,(0,U.jsx)(`kbd`,{children:`Tab`}),` to visit the links. In compact layouts, activate the menu button with `,(0,U.jsx)(`kbd`,{children:`Enter`}),` or `,(0,U.jsx)(`kbd`,{children:`Space`}),`. `,(0,U.jsx)(`kbd`,{children:`Escape`}),` closes it and returns focus to the button.`]}),preview:(0,U.jsx)(`div`,{className:`gallery__navbar`,children:(0,U.jsx)(qs,{artworks:g})})},sidebar:{page:dc,interaction:(0,U.jsxs)(U.Fragment,{children:[`Tab through group headings and links. Press `,(0,U.jsx)(`kbd`,{children:`Enter`}),` or `,(0,U.jsx)(`kbd`,{children:`Space`}),` on a collapsible heading to show or hide its links. The active link identifies the current page.`]}),preview:(0,U.jsx)(`div`,{className:`gallery__sidebar`,children:(0,U.jsx)(sc,{})})},carousel:{page:Wa,interaction:(0,U.jsxs)(U.Fragment,{children:[`Use the arrow keys to browse. `,(0,U.jsx)(`kbd`,{children:`Home`}),` and `,(0,U.jsx)(`kbd`,{children:`End`}),` reach the ends. On a touch screen, swipe horizontally.`]}),preview:(0,U.jsx)(Ua,{})},pagination:{page:aa,interaction:(0,U.jsxs)(U.Fragment,{children:[`Move between available page buttons with `,(0,U.jsx)(`kbd`,{children:`Tab`}),`. `,(0,U.jsx)(`kbd`,{children:`Enter`}),` or `,(0,U.jsx)(`kbd`,{children:`Space`}),` changes the page. The current page is exposed to assistive technology.`]}),preview:(0,U.jsx)(z,{page:2,pageCount:3,onPageChange:()=>{},labels:{navigation:`Preview pages`,previous:`Previous`,next:`Next`,page:`Page {page}`}})},breadcrumb:{page:ks,interaction:(0,U.jsxs)(U.Fragment,{children:[`Tab to an ancestor and press `,(0,U.jsx)(`kbd`,{children:`Enter`}),` to follow it. On a long trail, expand the ellipsis to bring earlier links into the tab order.`]}),preview:(0,U.jsx)(ct,{label:`Publication location`,overflowLabel:`Earlier pages`,items:[{id:`library`,label:`Library`,href:`#/ui`},{id:`issue`,label:`Spring issue`}]})},stepper:{page:ls,interaction:(0,U.jsxs)(U.Fragment,{children:[`Use the arrow keys to focus available steps. `,(0,U.jsx)(`kbd`,{children:`Home`}),` and `,(0,U.jsx)(`kbd`,{children:`End`}),` move to the ends. Activate a step with `,(0,U.jsx)(`kbd`,{children:`Enter`}),` or `,(0,U.jsx)(`kbd`,{children:`Space`}),`. The current step is announced to screen readers.`]}),preview:(0,U.jsx)(_n,{label:`Proof sections`,steps:ns,current:`images`,onSelect:()=>{}})},tabs:{workspace:!0,page:ua,interaction:(0,U.jsxs)(U.Fragment,{children:[`Use `,(0,U.jsx)(`kbd`,{children:`←`}),` and `,(0,U.jsx)(`kbd`,{children:`→`}),` to switch views. `,(0,U.jsx)(`kbd`,{children:`Home`}),` and `,(0,U.jsx)(`kbd`,{children:`End`}),` activate the first and last enabled tabs. `,(0,U.jsx)(`kbd`,{children:`Tab`}),` moves from the selected tab into its panel.`]}),preview:(0,U.jsx)(ve,{label:`Preview views`,items:[{value:`article`,label:`Article`,panel:(0,U.jsx)(`span`,{children:`Publication details`})},{value:`revisions`,label:`Revisions`,panel:(0,U.jsx)(`span`,{children:`Version history`})}]})},hero:{page:lc,interaction:(0,U.jsx)(U.Fragment,{children:`Choose a heading level that fits the document. Describe meaningful images with alt text and give each action a label that names its destination.`}),preview:(0,U.jsx)(`div`,{className:`gallery__hero`,children:(0,U.jsx)(Vs,{})})},accordion:{page:_o,interaction:(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`kbd`,{children:`Enter`}),` or `,(0,U.jsx)(`kbd`,{children:`Space`}),` opens and closes a section. `,(0,U.jsx)(`kbd`,{children:`↓`}),` and `,(0,U.jsx)(`kbd`,{children:`↑`}),` move between the headings, `,(0,U.jsx)(`kbd`,{children:`Home`}),` and `,(0,U.jsx)(`kbd`,{children:`End`}),` reach the first and last. Each panel is a region named by its heading.`]}),preview:(0,U.jsx)(Pn,{className:`catalog-fill`,variant:`contained`,defaultValue:[`publish`],items:[{value:`publish`,label:`Who can publish?`,panel:`Editors and owners.`},{value:`export`,label:`Can I export?`,panel:`Yes, as Markdown.`}]})},separator:{page:Ka,interaction:(0,U.jsxs)(U.Fragment,{children:[`A separator is decorative by default and skipped by assistive technology. Pass `,(0,U.jsx)(`code`,{children:`decorative={false}`}),` where the line carries the structure.`]}),preview:(0,U.jsxs)(`div`,{className:`catalog-stack catalog-fill`,children:[(0,U.jsx)(`span`,{children:`Sign in with a passkey`}),(0,U.jsx)(wn,{children:`or`}),(0,U.jsx)(`span`,{children:`Sign in with email`})]})},footer:{page:da,interaction:(0,U.jsxs)(U.Fragment,{children:[`Group related links under a descriptive heading. Preserve a logical reading order so `,(0,U.jsx)(`kbd`,{children:`Tab`}),` moves through the footer links in sequence.`]}),preview:(0,U.jsxs)(`div`,{className:`catalog-footer-preview`,children:[(0,U.jsx)(`strong`,{children:`Field notes`}),(0,U.jsxs)(`span`,{children:[`Resources`,(0,U.jsx)(`br`,{}),`Documentation`]}),(0,U.jsx)(`small`,{children:`Editorial workspace`})]})}},mc=T.map(e=>({...e,...pc[e.slug]})),hc=`elea-gallery-motion`;function gc(){try{return localStorage.getItem(hc)!==`off`}catch{return!0}}function _c({brand:e}){return(0,U.jsxs)(`nav`,{"aria-label":`Composed examples`,className:`col-lg-4 catalog-examples`,children:[(0,U.jsxs)(`a`,{href:a(`theme`,e),children:[(0,U.jsxs)(`span`,{children:[`Edit theme in Theme Studio `,(0,U.jsx)(`span`,{"aria-hidden":`true`,children:`→`})]}),(0,U.jsx)(`small`,{children:`Colour, typography and density`})]}),(0,U.jsxs)(`a`,{href:a(`playground`,e),children:[(0,U.jsxs)(`span`,{children:[`Explore the editorial workspace `,(0,U.jsx)(`span`,{"aria-hidden":`true`,children:`→`})]}),(0,U.jsx)(`small`,{children:`Select, Tabs, Button`})]})]})}function vc({brand:e,motionSwitch:t}){let[n,r]=(0,W.useState)(``),[i,o]=(0,W.useState)(`All`),s=(0,W.useRef)(null),c=n.trim().toLowerCase().split(/\s+/u),l=mc.filter(e=>{let t=e.sections?.map(e=>`${e.title} ${e.keywords??``}`).join(` `)??``,n=`${e.name} ${e.category} ${e.summary} ${e.slug} ${t}`.toLowerCase();return(i===`All`||e.category===i)&&c.every(e=>n.includes(e))});function u(){r(``),o(`All`),s.current?.focus()}return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsxs)(`div`,{className:`grid catalog-head`,children:[(0,U.jsx)(xn,{className:`col-lg-8 catalog-hero`,heading:`Components`,description:`Explore the building blocks behind Elea’s publication forms and editorial tools. Each guide includes a live example and its React code.`}),(0,U.jsx)(_c,{brand:e})]}),(0,U.jsxs)(`div`,{className:`catalog-tools`,children:[(0,U.jsx)(O,{className:`catalog-search`,ref:s,label:`Search components`,clearLabel:`Clear component search`,value:n,onValueChange:r}),(0,U.jsx)(`div`,{className:`catalog-filters`,role:`group`,"aria-label":`Filter by category`,children:[`All`,...k].map(e=>(0,U.jsx)(`button`,{type:`button`,"aria-pressed":i===e,onClick:()=>o(e),children:e},e))}),t]}),(0,U.jsxs)(`p`,{className:`catalog-results`,role:`status`,children:[l.length,` component `,l.length===1?`guide`:`guides`]}),l.length>0?(0,U.jsx)(`div`,{className:`grid gallery`,children:l.map(t=>(0,U.jsxs)(`article`,{className:`col-md-4 gallery__card`,children:[(0,U.jsx)(`div`,{className:`gallery__preview`,"data-elea-theme":e&&`brand`,inert:!0,children:t.preview}),(0,U.jsxs)(`div`,{className:`catalog-card__body`,children:[(0,U.jsx)(`span`,{className:`catalog-category`,children:t.category}),(0,U.jsx)(`h2`,{children:(0,U.jsx)(`a`,{className:`gallery__name`,href:a(`ui/${t.slug}`,e),children:t.name})}),(0,U.jsx)(`p`,{children:t.summary})]})]},t.slug))}):(0,U.jsxs)(`section`,{className:`catalog-empty`,children:[(0,U.jsx)(`h2`,{children:`No components found`}),(0,U.jsx)(`p`,{children:`Try another name or choose a different category.`}),(0,U.jsx)(m,{variant:`outline`,size:`sm`,onClick:u,children:`Clear filters`})]})]})}function yc({entry:e,brand:t,motionSwitch:n,section:r}){let i=e.page,o=a(`ui/${e.slug}`,t),s=(0,W.useRef)(null),c=(0,W.useRef)(null),[l,u]=(0,W.useState)(!1),[d,f]=(0,W.useState)([]);return(0,W.useLayoutEffect)(()=>{let e=s.current?.querySelectorAll(`.catalog-demos h2:not(.demo__stage h2), .catalog-interaction > h2`);f(Array.from(e??[],e=>{let t=e.textContent.trim();return e.id||=Se(t),e.tabIndex=-1,{id:e.id,label:t}}))},[e]),(0,W.useLayoutEffect)(()=>{if(!r)return;let e=document.getElementById(r);e&&s.current?.contains(e)&&d.some(e=>e.id===r)&&Te(e)},[r,d]),(0,U.jsxs)(`div`,{className:`grid catalog-layout`,children:[(0,U.jsxs)(`aside`,{className:`elea-grid__rail col-md-2 catalog-index`,children:[(0,U.jsx)(m,{className:`catalog-index__toggle`,variant:`outline`,size:`sm`,"aria-expanded":l,"aria-controls":`guide-component-index`,onClick:()=>u(e=>!e),children:`Browse components`}),(0,U.jsx)(Cn,{id:`guide-component-index`,label:`Component index`,current:e.slug,header:(0,U.jsx)(`a`,{className:`catalog-index__all`,href:a(`ui`,t),children:`All components`}),groups:k.map(e=>({id:e,label:e,items:mc.filter(t=>t.category===e).map(e=>({id:e.slug,label:e.name,href:a(`ui/${e.slug}`,t)}))}))})]}),(0,U.jsxs)(`article`,{ref:s,className:`start-md-3 catalog-guide`,children:[(0,U.jsxs)(`div`,{className:`catalog-guide__bar`,children:[(0,U.jsx)(ct,{label:`Breadcrumb`,overflowLabel:`Earlier pages`,items:[{id:`ui`,label:`Components`,href:a(`ui`,t)},{id:e.category,label:e.category},{id:e.slug,label:e.name}]}),(0,U.jsxs)(`div`,{className:`catalog-guide__actions`,children:[(0,U.jsx)(`a`,{href:a(`theme`,t),children:`Edit theme`}),n]})]}),(0,U.jsxs)(`details`,{className:`catalog-contents`,ref:c,children:[(0,U.jsx)(`summary`,{children:`On this page`}),(0,U.jsx)(`nav`,{"aria-label":`On this page`,children:d.map(e=>(0,U.jsx)(`a`,{href:Ce(o,e.id),"aria-current":r===e.id?`location`:void 0,onClick:t=>{if(t.metaKey||t.ctrlKey||t.shiftKey||t.altKey)return;c.current&&(c.current.open=!1);let n=document.getElementById(e.id);t.currentTarget.hash===location.hash&&n&&Te(n)},children:e.label},e.id))})]}),(0,U.jsx)(we.Provider,{value:o,children:(0,U.jsx)(`div`,{className:`catalog-demos`,"data-elea-theme":t&&`brand`,children:(0,U.jsx)(i,{brand:t})})}),(0,U.jsxs)(`section`,{className:`catalog-interaction`,children:[(0,U.jsx)(`h2`,{children:`Keyboard and accessibility`}),(0,U.jsx)(`p`,{children:e.interaction})]}),e.workspace&&(0,U.jsxs)(`a`,{className:`catalog-guide__example`,href:a(`playground`,t),children:[`Try this component in the editorial workspace `,(0,U.jsx)(`span`,{"aria-hidden":`true`,children:`→`})]})]})]})}function bc({route:e,brand:t}){let[,r,i]=e.split(`/`),a=mc.find(e=>r===e.slug);(0,W.useEffect)(()=>{document.title=`${a?.name??(r?`Page not found`:`Components`)} · Elea`},[a,r]);let[o,s]=(0,W.useState)(gc),c=(0,W.useMemo)(()=>t&&n(t).css,[t]);(0,W.useEffect)(()=>{try{localStorage.setItem(hc,o?`on`:`off`)}catch{}},[o]);let l=(0,U.jsx)(I,{className:`catalog-motion`,checked:o,onCheckedChange:s,label:`Expressive motion`});return(0,U.jsxs)(`div`,{className:`catalog`,"data-elea-motion":o?`on`:`off`,children:[c&&(0,U.jsx)(`style`,{children:c}),a&&(0,U.jsx)(yc,{entry:a,brand:t,motionSwitch:l,section:i},a.slug),!a&&r&&(0,U.jsx)(he,{}),!a&&!r&&(0,U.jsx)(vc,{brand:t,motionSwitch:l})]})}export{bc as default};