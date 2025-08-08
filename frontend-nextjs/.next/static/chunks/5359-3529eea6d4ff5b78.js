(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[5359],{24033:function(e,r,n){e.exports=n(50094)},36743:function(e,r,n){"use strict";n.d(r,{f:function(){return g}});var l=n(2265),c=n(9381),d=n(57437),f=l.forwardRef((e,r)=>(0,d.jsx)(c.WV.label,{...e,ref:r,onMouseDown:r=>{let n=r.target;n.closest("button, input, select, textarea")||(e.onMouseDown?.(r),!r.defaultPrevented&&r.detail>1&&r.preventDefault())}}));f.displayName="Label";var g=f},17094:function(e,r,n){"use strict";n.d(r,{VY:function(){return ei},aV:function(){return eo},fC:function(){return ea},xz:function(){return en}});var l=n(2265),c=n(85744),d=n(56989),f=n(27733),g=n(42210),b=n(20966),y=n(9381),v=n(16459),h=n(73763),w=n(65400),_=n(57437),k="rovingFocusGroup.onEntryFocus",j={bubbles:!1,cancelable:!0},I="RovingFocusGroup",[F,E,D]=(0,f.B)(I),[C,T]=(0,d.b)(I,[D]),[$,R]=C(I),z=l.forwardRef((e,r)=>(0,_.jsx)(F.Provider,{scope:e.__scopeRovingFocusGroup,children:(0,_.jsx)(F.Slot,{scope:e.__scopeRovingFocusGroup,children:(0,_.jsx)(V,{...e,ref:r})})}));z.displayName=I;var V=l.forwardRef((e,r)=>{let{__scopeRovingFocusGroup:n,orientation:d,loop:f=!1,dir:b,currentTabStopId:F,defaultCurrentTabStopId:D,onCurrentTabStopIdChange:C,onEntryFocus:T,preventScrollOnEntryFocus:R=!1,...z}=e,V=l.useRef(null),S=(0,g.e)(r,V),Z=(0,w.gm)(b),[N,K]=(0,h.T)({prop:F,defaultProp:D??null,onChange:C,caller:I}),[L,P]=l.useState(!1),q=(0,v.W)(T),H=E(n),O=l.useRef(!1),[G,B]=l.useState(0);return l.useEffect(()=>{let e=V.current;if(e)return e.addEventListener(k,q),()=>e.removeEventListener(k,q)},[q]),(0,_.jsx)($,{scope:n,orientation:d,dir:Z,loop:f,currentTabStopId:N,onItemFocus:l.useCallback(e=>K(e),[K]),onItemShiftTab:l.useCallback(()=>P(!0),[]),onFocusableItemAdd:l.useCallback(()=>B(e=>e+1),[]),onFocusableItemRemove:l.useCallback(()=>B(e=>e-1),[]),children:(0,_.jsx)(y.WV.div,{tabIndex:L||0===G?-1:0,"data-orientation":d,...z,ref:S,style:{outline:"none",...e.style},onMouseDown:(0,c.M)(e.onMouseDown,()=>{O.current=!0}),onFocus:(0,c.M)(e.onFocus,e=>{let r=!O.current;if(e.target===e.currentTarget&&r&&!L){let r=new CustomEvent(k,j);if(e.currentTarget.dispatchEvent(r),!r.defaultPrevented){let e=H().filter(e=>e.focusable),r=e.find(e=>e.active),n=e.find(e=>e.id===N),l=[r,n,...e].filter(Boolean),c=l.map(e=>e.ref.current);focusFirst(c,R)}}O.current=!1}),onBlur:(0,c.M)(e.onBlur,()=>P(!1))})})}),S="RovingFocusGroupItem",Z=l.forwardRef((e,r)=>{let{__scopeRovingFocusGroup:n,focusable:d=!0,active:f=!1,tabStopId:g,children:v,...h}=e,w=(0,b.M)(),k=g||w,j=R(S,n),I=j.currentTabStopId===k,D=E(n),{onFocusableItemAdd:C,onFocusableItemRemove:T,currentTabStopId:$}=j;return l.useEffect(()=>{if(d)return C(),()=>T()},[d,C,T]),(0,_.jsx)(F.ItemSlot,{scope:n,id:k,focusable:d,active:f,children:(0,_.jsx)(y.WV.span,{tabIndex:I?0:-1,"data-orientation":j.orientation,...h,ref:r,onMouseDown:(0,c.M)(e.onMouseDown,e=>{d?j.onItemFocus(k):e.preventDefault()}),onFocus:(0,c.M)(e.onFocus,()=>j.onItemFocus(k)),onKeyDown:(0,c.M)(e.onKeyDown,e=>{if("Tab"===e.key&&e.shiftKey){j.onItemShiftTab();return}if(e.target!==e.currentTarget)return;let r=getFocusIntent(e,j.orientation,j.dir);if(void 0!==r){if(e.metaKey||e.ctrlKey||e.altKey||e.shiftKey)return;e.preventDefault();let n=D().filter(e=>e.focusable),l=n.map(e=>e.ref.current);if("last"===r)l.reverse();else if("prev"===r||"next"===r){"prev"===r&&l.reverse();let n=l.indexOf(e.currentTarget);l=j.loop?wrapArray(l,n+1):l.slice(n+1)}setTimeout(()=>focusFirst(l))}}),children:"function"==typeof v?v({isCurrentTabStop:I,hasTabStop:null!=$}):v})})});Z.displayName=S;var N={ArrowLeft:"prev",ArrowUp:"prev",ArrowRight:"next",ArrowDown:"next",PageUp:"first",Home:"first",PageDown:"last",End:"last"};function getDirectionAwareKey(e,r){return"rtl"!==r?e:"ArrowLeft"===e?"ArrowRight":"ArrowRight"===e?"ArrowLeft":e}function getFocusIntent(e,r,n){let l=getDirectionAwareKey(e.key,n);if(!("vertical"===r&&["ArrowLeft","ArrowRight"].includes(l))&&!("horizontal"===r&&["ArrowUp","ArrowDown"].includes(l)))return N[l]}function focusFirst(e,r=!1){let n=document.activeElement;for(let l of e)if(l===n||(l.focus({preventScroll:r}),document.activeElement!==n))return}function wrapArray(e,r){return e.map((n,l)=>e[(r+l)%e.length])}var K=n(85606),L="Tabs",[P,q]=(0,d.b)(L,[T]),H=T(),[O,G]=P(L),B=l.forwardRef((e,r)=>{let{__scopeTabs:n,value:l,onValueChange:c,defaultValue:d,orientation:f="horizontal",dir:g,activationMode:v="automatic",...k}=e,j=(0,w.gm)(g),[I,F]=(0,h.T)({prop:l,onChange:c,defaultProp:d??"",caller:L});return(0,_.jsx)(O,{scope:n,baseId:(0,b.M)(),value:I,onValueChange:F,orientation:f,dir:j,activationMode:v,children:(0,_.jsx)(y.WV.div,{dir:j,"data-orientation":f,...k,ref:r})})});B.displayName=L;var X="TabsList",Y=l.forwardRef((e,r)=>{let{__scopeTabs:n,loop:l=!0,...c}=e,d=G(X,n),f=H(n);return(0,_.jsx)(z,{asChild:!0,...f,orientation:d.orientation,dir:d.dir,loop:l,children:(0,_.jsx)(y.WV.div,{role:"tablist","aria-orientation":d.orientation,...c,ref:r})})});Y.displayName=X;var Q="TabsTrigger",ee=l.forwardRef((e,r)=>{let{__scopeTabs:n,value:l,disabled:d=!1,...f}=e,g=G(Q,n),b=H(n),v=makeTriggerId(g.baseId,l),h=makeContentId(g.baseId,l),w=l===g.value;return(0,_.jsx)(Z,{asChild:!0,...b,focusable:!d,active:w,children:(0,_.jsx)(y.WV.button,{type:"button",role:"tab","aria-selected":w,"aria-controls":h,"data-state":w?"active":"inactive","data-disabled":d?"":void 0,disabled:d,id:v,...f,ref:r,onMouseDown:(0,c.M)(e.onMouseDown,e=>{d||0!==e.button||!1!==e.ctrlKey?e.preventDefault():g.onValueChange(l)}),onKeyDown:(0,c.M)(e.onKeyDown,e=>{[" ","Enter"].includes(e.key)&&g.onValueChange(l)}),onFocus:(0,c.M)(e.onFocus,()=>{let e="manual"!==g.activationMode;w||d||!e||g.onValueChange(l)})})})});ee.displayName=Q;var et="TabsContent",er=l.forwardRef((e,r)=>{let{__scopeTabs:n,value:c,forceMount:d,children:f,...g}=e,b=G(et,n),v=makeTriggerId(b.baseId,c),h=makeContentId(b.baseId,c),w=c===b.value,k=l.useRef(w);return l.useEffect(()=>{let e=requestAnimationFrame(()=>k.current=!1);return()=>cancelAnimationFrame(e)},[]),(0,_.jsx)(K.z,{present:d||w,children:({present:n})=>(0,_.jsx)(y.WV.div,{"data-state":w?"active":"inactive","data-orientation":b.orientation,role:"tabpanel","aria-labelledby":v,hidden:!n,id:h,tabIndex:0,...g,ref:r,style:{...e.style,animationDuration:k.current?"0s":void 0},children:n&&f})})});function makeTriggerId(e,r){return`${e}-trigger-${r}`}function makeContentId(e,r){return`${e}-content-${r}`}er.displayName=et;var ea=B,eo=Y,en=ee,ei=er},94892:function(e,r,n){"use strict";n.d(r,{Z:function(){return c}});var l=n(17865);let c=(0,l.Z)("Camera",[["path",{d:"M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",key:"1tc9qg"}],["circle",{cx:"12",cy:"13",r:"3",key:"1vg3eu"}]])},77013:function(e,r,n){"use strict";n.d(r,{Z:function(){return c}});var l=n(17865);let c=(0,l.Z)("PenSquare",[["path",{d:"M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1qinfi"}],["path",{d:"M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z",key:"w2jsv5"}]])},59809:function(e,r,n){"use strict";n.d(r,{Z:function(){return c}});var l=n(17865);let c=(0,l.Z)("Save",[["path",{d:"M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z",key:"1owoqh"}],["polyline",{points:"17 21 17 13 7 13 7 21",key:"1md35c"}],["polyline",{points:"7 3 7 8 15 8",key:"8nz8an"}]])},88971:function(e,r,n){"use strict";n.d(r,{Z:function(){return c}});var l=n(17865);let c=(0,l.Z)("Settings",[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]])},47730:function(e,r,n){"use strict";n.d(r,{Z:function(){return c}});var l=n(17865);let c=(0,l.Z)("Shield",[["path",{d:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",key:"3xmgem"}]])},99839:function(e,r,n){"use strict";n.d(r,{Z:function(){return c}});var l=n(17865);let c=(0,l.Z)("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]])},4862:function(e,r,n){"use strict";n.d(r,{Z:function(){return c}});var l=n(17865);let c=(0,l.Z)("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]])},5925:function(e,r,n){"use strict";let l,c;n.d(r,{Am:function(){return dist_c}});var d=n(2265);let f={data:""},t=e=>"object"==typeof window?((e?e.querySelector("#_goober"):window._goober)||Object.assign((e||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:e||f,g=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,b=/\/\*[^]*?\*\/|  +/g,y=/\n+/g,o=(e,r)=>{let n="",l="",c="";for(let d in e){let f=e[d];"@"==d[0]?"i"==d[1]?n=d+" "+f+";":l+="f"==d[1]?o(f,d):d+"{"+o(f,"k"==d[1]?"":r)+"}":"object"==typeof f?l+=o(f,r?r.replace(/([^,])+/g,e=>d.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,r=>/&/.test(r)?r.replace(/&/g,e):e?e+" "+r:r)):d):null!=f&&(d=/^--/.test(d)?d:d.replace(/[A-Z]/g,"-$&").toLowerCase(),c+=o.p?o.p(d,f):d+":"+f+";")}return n+(r&&c?r+"{"+c+"}":c)+l},v={},s=e=>{if("object"==typeof e){let r="";for(let n in e)r+=n+s(e[n]);return r}return e},i=(e,r,n,l,c)=>{var d;let f=s(e),h=v[f]||(v[f]=(e=>{let r=0,n=11;for(;r<e.length;)n=101*n+e.charCodeAt(r++)>>>0;return"go"+n})(f));if(!v[h]){let r=f!==e?e:(e=>{let r,n,l=[{}];for(;r=g.exec(e.replace(b,""));)r[4]?l.shift():r[3]?(n=r[3].replace(y," ").trim(),l.unshift(l[0][n]=l[0][n]||{})):l[0][r[1]]=r[2].replace(y," ").trim();return l[0]})(e);v[h]=o(c?{["@keyframes "+h]:r}:r,n?"":"."+h)}let w=n&&v.g?v.g:null;return n&&(v.g=v[h]),d=v[h],w?r.data=r.data.replace(w,d):-1===r.data.indexOf(d)&&(r.data=l?d+r.data:r.data+d),h},p=(e,r,n)=>e.reduce((e,l,c)=>{let d=r[c];if(d&&d.call){let e=d(n),r=e&&e.props&&e.props.className||/^go/.test(e)&&e;d=r?"."+r:e&&"object"==typeof e?e.props?"":o(e,""):!1===e?"":e}return e+l+(null==d?"":d)},"");function u(e){let r=this||{},n=e.call?e(r.p):e;return i(n.unshift?n.raw?p(n,[].slice.call(arguments,1),r.p):n.reduce((e,n)=>Object.assign(e,n&&n.call?n(r.p):n),{}):n,t(r.target),r.g,r.o,r.k)}u.bind({g:1});let h,w,_,k=u.bind({k:1});function m(e,r,n,l){o.p=r,h=e,w=n,_=l}function goober_modern_j(e,r){let n=this||{};return function(){let l=arguments;function a(c,d){let f=Object.assign({},c),g=f.className||a.className;n.p=Object.assign({theme:w&&w()},f),n.o=/ *go\d+/.test(g),f.className=u.apply(n,l)+(g?" "+g:""),r&&(f.ref=d);let b=e;return e[0]&&(b=f.as||e,delete f.as),_&&b[0]&&_(f),h(b,f)}return r?r(a):a}}var W=e=>"function"==typeof e,dist_f=(e,r)=>W(e)?e(r):e,j=(l=0,()=>(++l).toString()),A=()=>{if(void 0===c&&"u">typeof window){let e=matchMedia("(prefers-reduced-motion: reduce)");c=!e||e.matches}return c},U=(e,r)=>{switch(r.type){case 0:return{...e,toasts:[r.toast,...e.toasts].slice(0,20)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===r.toast.id?{...e,...r.toast}:e)};case 2:let{toast:n}=r;return U(e,{type:e.toasts.find(e=>e.id===n.id)?1:0,toast:n});case 3:let{toastId:l}=r;return{...e,toasts:e.toasts.map(e=>e.id===l||void 0===l?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===r.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==r.toastId)};case 5:return{...e,pausedAt:r.time};case 6:let c=r.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+c}))}}},I=[],F={toasts:[],pausedAt:void 0},dist_u=e=>{F=U(F,e),I.forEach(e=>{e(F)})},J=(e,r="blank",n)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:r,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...n,id:(null==n?void 0:n.id)||j()}),x=e=>(r,n)=>{let l=J(r,e,n);return dist_u({type:2,toast:l}),l.id},dist_c=(e,r)=>x("blank")(e,r);dist_c.error=x("error"),dist_c.success=x("success"),dist_c.loading=x("loading"),dist_c.custom=x("custom"),dist_c.dismiss=e=>{dist_u({type:3,toastId:e})},dist_c.remove=e=>dist_u({type:4,toastId:e}),dist_c.promise=(e,r,n)=>{let l=dist_c.loading(r.loading,{...n,...null==n?void 0:n.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let c=r.success?dist_f(r.success,e):void 0;return c?dist_c.success(c,{id:l,...n,...null==n?void 0:n.success}):dist_c.dismiss(l),e}).catch(e=>{let c=r.error?dist_f(r.error,e):void 0;c?dist_c.error(c,{id:l,...n,...null==n?void 0:n.error}):dist_c.dismiss(l)}),e};var E=k`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,D=k`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,C=k`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,T=goober_modern_j("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${E} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${D} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${C} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,$=k`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,R=goober_modern_j("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${$} 1s linear infinite;
`,z=k`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,V=k`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,S=goober_modern_j("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${z} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${V} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,Z=goober_modern_j("div")`
  position: absolute;
`,N=goober_modern_j("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,K=k`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,L=goober_modern_j("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${K} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,M=({toast:e})=>{let{icon:r,type:n,iconTheme:l}=e;return void 0!==r?"string"==typeof r?d.createElement(L,null,r):r:"blank"===n?null:d.createElement(N,null,d.createElement(R,{...l}),"loading"!==n&&d.createElement(Z,null,"error"===n?d.createElement(T,{...l}):d.createElement(S,{...l})))},ye=e=>`
0% {transform: translate3d(0,${-200*e}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,ge=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*e}%,-1px) scale(.6); opacity:0;}
`,P=goober_modern_j("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,q=goober_modern_j("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,Ae=(e,r)=>{let n=e.includes("top")?1:-1,[l,c]=A()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[ye(n),ge(n)];return{animation:r?`${k(l)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${k(c)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}};d.memo(({toast:e,position:r,style:n,children:l})=>{let c=e.height?Ae(e.position||r||"top-center",e.visible):{opacity:0},f=d.createElement(M,{toast:e}),g=d.createElement(q,{...e.ariaProps},dist_f(e.message,e));return d.createElement(P,{className:e.className,style:{...c,...n,...e.style}},"function"==typeof l?l({icon:f,message:g}):d.createElement(d.Fragment,null,f,g))}),m(d.createElement),u`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`}}]);