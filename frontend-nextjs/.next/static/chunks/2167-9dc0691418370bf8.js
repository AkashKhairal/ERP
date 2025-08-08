(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[2167],{24033:function(e,r,n){e.exports=n(50094)},28712:function(e,r,n){"use strict";n.d(r,{Dx:function(){return ep},VY:function(){return ec},aV:function(){return eu},dk:function(){return ef},fC:function(){return es},h_:function(){return ed},x8:function(){return em},xz:function(){return el}});var l=n(2265),d=n(85744),c=n(42210),f=n(56989),g=n(20966),y=n(73763),b=n(79249),v=n(52759),h=n(52730),w=n(85606),_=n(9381),j=n(31244),k=n(73386),D=n(85859),N=n(67256),E=n(57437),$="Dialog",[I,C]=(0,f.b)($),[R,V]=I($),Dialog=e=>{let{__scopeDialog:r,children:n,open:d,defaultOpen:c,onOpenChange:f,modal:b=!0}=e,v=l.useRef(null),h=l.useRef(null),[w,_]=(0,y.T)({prop:d,defaultProp:c??!1,onChange:f,caller:$});return(0,E.jsx)(R,{scope:r,triggerRef:v,contentRef:h,contentId:(0,g.M)(),titleId:(0,g.M)(),descriptionId:(0,g.M)(),open:w,onOpenChange:_,onOpenToggle:l.useCallback(()=>_(e=>!e),[_]),modal:b,children:n})};Dialog.displayName=$;var P="DialogTrigger",Z=l.forwardRef((e,r)=>{let{__scopeDialog:n,...l}=e,f=V(P,n),g=(0,c.e)(r,f.triggerRef);return(0,E.jsx)(_.WV.button,{type:"button","aria-haspopup":"dialog","aria-expanded":f.open,"aria-controls":f.contentId,"data-state":getState(f.open),...l,ref:g,onClick:(0,d.M)(e.onClick,f.onOpenToggle)})});Z.displayName=P;var O="DialogPortal",[F,z]=I(O,{forceMount:void 0}),DialogPortal=e=>{let{__scopeDialog:r,forceMount:n,children:d,container:c}=e,f=V(O,r);return(0,E.jsx)(F,{scope:r,forceMount:n,children:l.Children.map(d,e=>(0,E.jsx)(w.z,{present:n||f.open,children:(0,E.jsx)(h.h,{asChild:!0,container:c,children:e})}))})};DialogPortal.displayName=O;var S="DialogOverlay",T=l.forwardRef((e,r)=>{let n=z(S,e.__scopeDialog),{forceMount:l=n.forceMount,...d}=e,c=V(S,e.__scopeDialog);return c.modal?(0,E.jsx)(w.z,{present:l||c.open,children:(0,E.jsx)(L,{...d,ref:r})}):null});T.displayName=S;var q=(0,N.Z8)("DialogOverlay.RemoveScroll"),L=l.forwardRef((e,r)=>{let{__scopeDialog:n,...l}=e,d=V(S,n);return(0,E.jsx)(k.Z,{as:q,allowPinchZoom:!0,shards:[d.contentRef],children:(0,E.jsx)(_.WV.div,{"data-state":getState(d.open),...l,ref:r,style:{pointerEvents:"auto",...l.style}})})}),H="DialogContent",B=l.forwardRef((e,r)=>{let n=z(H,e.__scopeDialog),{forceMount:l=n.forceMount,...d}=e,c=V(H,e.__scopeDialog);return(0,E.jsx)(w.z,{present:l||c.open,children:c.modal?(0,E.jsx)(G,{...d,ref:r}):(0,E.jsx)(X,{...d,ref:r})})});B.displayName=H;var G=l.forwardRef((e,r)=>{let n=V(H,e.__scopeDialog),f=l.useRef(null),g=(0,c.e)(r,n.contentRef,f);return l.useEffect(()=>{let e=f.current;if(e)return(0,D.Ry)(e)},[]),(0,E.jsx)(K,{...e,ref:g,trapFocus:n.open,disableOutsidePointerEvents:!0,onCloseAutoFocus:(0,d.M)(e.onCloseAutoFocus,e=>{e.preventDefault(),n.triggerRef.current?.focus()}),onPointerDownOutside:(0,d.M)(e.onPointerDownOutside,e=>{let r=e.detail.originalEvent,n=0===r.button&&!0===r.ctrlKey,l=2===r.button||n;l&&e.preventDefault()}),onFocusOutside:(0,d.M)(e.onFocusOutside,e=>e.preventDefault())})}),X=l.forwardRef((e,r)=>{let n=V(H,e.__scopeDialog),d=l.useRef(!1),c=l.useRef(!1);return(0,E.jsx)(K,{...e,ref:r,trapFocus:!1,disableOutsidePointerEvents:!1,onCloseAutoFocus:r=>{e.onCloseAutoFocus?.(r),r.defaultPrevented||(d.current||n.triggerRef.current?.focus(),r.preventDefault()),d.current=!1,c.current=!1},onInteractOutside:r=>{e.onInteractOutside?.(r),r.defaultPrevented||(d.current=!0,"pointerdown"!==r.detail.originalEvent.type||(c.current=!0));let l=r.target,f=n.triggerRef.current?.contains(l);f&&r.preventDefault(),"focusin"===r.detail.originalEvent.type&&c.current&&r.preventDefault()}})}),K=l.forwardRef((e,r)=>{let{__scopeDialog:n,trapFocus:d,onOpenAutoFocus:f,onCloseAutoFocus:g,...y}=e,h=V(H,n),w=l.useRef(null),_=(0,c.e)(r,w);return(0,j.EW)(),(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(v.M,{asChild:!0,loop:!0,trapped:d,onMountAutoFocus:f,onUnmountAutoFocus:g,children:(0,E.jsx)(b.XB,{role:"dialog",id:h.contentId,"aria-describedby":h.descriptionId,"aria-labelledby":h.titleId,"data-state":getState(h.open),...y,ref:_,onDismiss:()=>h.onOpenChange(!1)})}),(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(TitleWarning,{titleId:h.titleId}),(0,E.jsx)(DescriptionWarning,{contentRef:w,descriptionId:h.descriptionId})]})]})}),Y="DialogTitle",Q=l.forwardRef((e,r)=>{let{__scopeDialog:n,...l}=e,d=V(Y,n);return(0,E.jsx)(_.WV.h2,{id:d.titleId,...l,ref:r})});Q.displayName=Y;var ee="DialogDescription",et=l.forwardRef((e,r)=>{let{__scopeDialog:n,...l}=e,d=V(ee,n);return(0,E.jsx)(_.WV.p,{id:d.descriptionId,...l,ref:r})});et.displayName=ee;var er="DialogClose",eo=l.forwardRef((e,r)=>{let{__scopeDialog:n,...l}=e,c=V(er,n);return(0,E.jsx)(_.WV.button,{type:"button",...l,ref:r,onClick:(0,d.M)(e.onClick,()=>c.onOpenChange(!1))})});function getState(e){return e?"open":"closed"}eo.displayName=er;var ea="DialogTitleWarning",[en,ei]=(0,f.k)(ea,{contentName:H,titleName:Y,docsSlug:"dialog"}),TitleWarning=({titleId:e})=>{let r=ei(ea),n=`\`${r.contentName}\` requires a \`${r.titleName}\` for the component to be accessible for screen reader users.

If you want to hide the \`${r.titleName}\`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/${r.docsSlug}`;return l.useEffect(()=>{if(e){let r=document.getElementById(e);r||console.error(n)}},[n,e]),null},DescriptionWarning=({contentRef:e,descriptionId:r})=>{let n=ei("DialogDescriptionWarning"),d=`Warning: Missing \`Description\` or \`aria-describedby={undefined}\` for {${n.contentName}}.`;return l.useEffect(()=>{let n=e.current?.getAttribute("aria-describedby");if(r&&n){let e=document.getElementById(r);e||console.warn(d)}},[d,e,r]),null},es=Dialog,el=Z,ed=DialogPortal,eu=T,ec=B,ep=Q,ef=et,em=eo},36743:function(e,r,n){"use strict";n.d(r,{f:function(){return g}});var l=n(2265),d=n(9381),c=n(57437),f=l.forwardRef((e,r)=>(0,c.jsx)(d.WV.label,{...e,ref:r,onMouseDown:r=>{let n=r.target;n.closest("button, input, select, textarea")||(e.onMouseDown?.(r),!r.defaultPrevented&&r.detail>1&&r.preventDefault())}}));f.displayName="Label";var g=f},23177:function(e,r,n){"use strict";n.d(r,{fC:function(){return k},z$:function(){return D}});var l=n(2265),d=n(56989),c=n(9381),f=n(57437),g="Progress",[y,b]=(0,d.b)(g),[v,h]=y(g),w=l.forwardRef((e,r)=>{let{__scopeProgress:n,value:l=null,max:d,getValueLabel:g=defaultGetValueLabel,...y}=e;(d||0===d)&&!isValidMaxNumber(d)&&console.error(getInvalidMaxError(`${d}`,"Progress"));let b=isValidMaxNumber(d)?d:100;null===l||isValidValueNumber(l,b)||console.error(getInvalidValueError(`${l}`,"Progress"));let h=isValidValueNumber(l,b)?l:null,w=isNumber(h)?g(h,b):void 0;return(0,f.jsx)(v,{scope:n,value:h,max:b,children:(0,f.jsx)(c.WV.div,{"aria-valuemax":b,"aria-valuemin":0,"aria-valuenow":isNumber(h)?h:void 0,"aria-valuetext":w,role:"progressbar","data-state":getProgressState(h,b),"data-value":h??void 0,"data-max":b,...y,ref:r})})});w.displayName=g;var _="ProgressIndicator",j=l.forwardRef((e,r)=>{let{__scopeProgress:n,...l}=e,d=h(_,n);return(0,f.jsx)(c.WV.div,{"data-state":getProgressState(d.value,d.max),"data-value":d.value??void 0,"data-max":d.max,...l,ref:r})});function defaultGetValueLabel(e,r){return`${Math.round(e/r*100)}%`}function getProgressState(e,r){return null==e?"indeterminate":e===r?"complete":"loading"}function isNumber(e){return"number"==typeof e}function isValidMaxNumber(e){return isNumber(e)&&!isNaN(e)&&e>0}function isValidValueNumber(e,r){return isNumber(e)&&!isNaN(e)&&e<=r&&e>=0}function getInvalidMaxError(e,r){return`Invalid prop \`max\` of value \`${e}\` supplied to \`${r}\`. Only numbers greater than 0 are valid max values. Defaulting to \`100\`.`}function getInvalidValueError(e,r){return`Invalid prop \`value\` of value \`${e}\` supplied to \`${r}\`. The \`value\` prop must be:
  - a positive number
  - less than the value passed to \`max\` (or 100 if no \`max\` prop is set)
  - \`null\` or \`undefined\` if the progress is indeterminate.

Defaulting to \`null\`.`}j.displayName=_;var k=w,D=j},94115:function(e,r,n){"use strict";n.d(r,{Z:function(){return d}});var l=n(17865);let d=(0,l.Z)("AlertCircle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]])},41372:function(e,r,n){"use strict";n.d(r,{Z:function(){return d}});var l=n(17865);let d=(0,l.Z)("ArrowLeft",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]])},11666:function(e,r,n){"use strict";n.d(r,{Z:function(){return d}});var l=n(17865);let d=(0,l.Z)("CheckCircle",[["path",{d:"M22 11.08V12a10 10 0 1 1-5.93-9.14",key:"g774vq"}],["polyline",{points:"22 4 12 14.01 9 11.01",key:"6xbx8j"}]])},27003:function(e,r,n){"use strict";n.d(r,{Z:function(){return d}});var l=n(17865);let d=(0,l.Z)("DollarSign",[["line",{x1:"12",x2:"12",y1:"2",y2:"22",key:"7eqyqh"}],["path",{d:"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",key:"1b0p4s"}]])},66794:function(e,r,n){"use strict";n.d(r,{Z:function(){return d}});var l=n(17865);let d=(0,l.Z)("Loader2",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]])},77013:function(e,r,n){"use strict";n.d(r,{Z:function(){return d}});var l=n(17865);let d=(0,l.Z)("PenSquare",[["path",{d:"M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1qinfi"}],["path",{d:"M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z",key:"w2jsv5"}]])},18652:function(e,r,n){"use strict";n.d(r,{Z:function(){return d}});var l=n(17865);let d=(0,l.Z)("Target",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"12",r:"6",key:"1vlfrh"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]])},22178:function(e,r,n){"use strict";n.d(r,{Z:function(){return d}});var l=n(17865);let d=(0,l.Z)("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]])},4862:function(e,r,n){"use strict";n.d(r,{Z:function(){return d}});var l=n(17865);let d=(0,l.Z)("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]])},5925:function(e,r,n){"use strict";let l,d;n.d(r,{Am:function(){return dist_c}});var c=n(2265);let f={data:""},t=e=>"object"==typeof window?((e?e.querySelector("#_goober"):window._goober)||Object.assign((e||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:e||f,g=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,y=/\/\*[^]*?\*\/|  +/g,b=/\n+/g,o=(e,r)=>{let n="",l="",d="";for(let c in e){let f=e[c];"@"==c[0]?"i"==c[1]?n=c+" "+f+";":l+="f"==c[1]?o(f,c):c+"{"+o(f,"k"==c[1]?"":r)+"}":"object"==typeof f?l+=o(f,r?r.replace(/([^,])+/g,e=>c.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,r=>/&/.test(r)?r.replace(/&/g,e):e?e+" "+r:r)):c):null!=f&&(c=/^--/.test(c)?c:c.replace(/[A-Z]/g,"-$&").toLowerCase(),d+=o.p?o.p(c,f):c+":"+f+";")}return n+(r&&d?r+"{"+d+"}":d)+l},v={},s=e=>{if("object"==typeof e){let r="";for(let n in e)r+=n+s(e[n]);return r}return e},i=(e,r,n,l,d)=>{var c;let f=s(e),h=v[f]||(v[f]=(e=>{let r=0,n=11;for(;r<e.length;)n=101*n+e.charCodeAt(r++)>>>0;return"go"+n})(f));if(!v[h]){let r=f!==e?e:(e=>{let r,n,l=[{}];for(;r=g.exec(e.replace(y,""));)r[4]?l.shift():r[3]?(n=r[3].replace(b," ").trim(),l.unshift(l[0][n]=l[0][n]||{})):l[0][r[1]]=r[2].replace(b," ").trim();return l[0]})(e);v[h]=o(d?{["@keyframes "+h]:r}:r,n?"":"."+h)}let w=n&&v.g?v.g:null;return n&&(v.g=v[h]),c=v[h],w?r.data=r.data.replace(w,c):-1===r.data.indexOf(c)&&(r.data=l?c+r.data:r.data+c),h},p=(e,r,n)=>e.reduce((e,l,d)=>{let c=r[d];if(c&&c.call){let e=c(n),r=e&&e.props&&e.props.className||/^go/.test(e)&&e;c=r?"."+r:e&&"object"==typeof e?e.props?"":o(e,""):!1===e?"":e}return e+l+(null==c?"":c)},"");function u(e){let r=this||{},n=e.call?e(r.p):e;return i(n.unshift?n.raw?p(n,[].slice.call(arguments,1),r.p):n.reduce((e,n)=>Object.assign(e,n&&n.call?n(r.p):n),{}):n,t(r.target),r.g,r.o,r.k)}u.bind({g:1});let h,w,_,j=u.bind({k:1});function m(e,r,n,l){o.p=r,h=e,w=n,_=l}function goober_modern_j(e,r){let n=this||{};return function(){let l=arguments;function a(d,c){let f=Object.assign({},d),g=f.className||a.className;n.p=Object.assign({theme:w&&w()},f),n.o=/ *go\d+/.test(g),f.className=u.apply(n,l)+(g?" "+g:""),r&&(f.ref=c);let y=e;return e[0]&&(y=f.as||e,delete f.as),_&&y[0]&&_(f),h(y,f)}return r?r(a):a}}var W=e=>"function"==typeof e,dist_f=(e,r)=>W(e)?e(r):e,k=(l=0,()=>(++l).toString()),A=()=>{if(void 0===d&&"u">typeof window){let e=matchMedia("(prefers-reduced-motion: reduce)");d=!e||e.matches}return d},U=(e,r)=>{switch(r.type){case 0:return{...e,toasts:[r.toast,...e.toasts].slice(0,20)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===r.toast.id?{...e,...r.toast}:e)};case 2:let{toast:n}=r;return U(e,{type:e.toasts.find(e=>e.id===n.id)?1:0,toast:n});case 3:let{toastId:l}=r;return{...e,toasts:e.toasts.map(e=>e.id===l||void 0===l?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===r.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==r.toastId)};case 5:return{...e,pausedAt:r.time};case 6:let d=r.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+d}))}}},D=[],N={toasts:[],pausedAt:void 0},dist_u=e=>{N=U(N,e),D.forEach(e=>{e(N)})},J=(e,r="blank",n)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:r,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...n,id:(null==n?void 0:n.id)||k()}),x=e=>(r,n)=>{let l=J(r,e,n);return dist_u({type:2,toast:l}),l.id},dist_c=(e,r)=>x("blank")(e,r);dist_c.error=x("error"),dist_c.success=x("success"),dist_c.loading=x("loading"),dist_c.custom=x("custom"),dist_c.dismiss=e=>{dist_u({type:3,toastId:e})},dist_c.remove=e=>dist_u({type:4,toastId:e}),dist_c.promise=(e,r,n)=>{let l=dist_c.loading(r.loading,{...n,...null==n?void 0:n.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let d=r.success?dist_f(r.success,e):void 0;return d?dist_c.success(d,{id:l,...n,...null==n?void 0:n.success}):dist_c.dismiss(l),e}).catch(e=>{let d=r.error?dist_f(r.error,e):void 0;d?dist_c.error(d,{id:l,...n,...null==n?void 0:n.error}):dist_c.dismiss(l)}),e};var E=j`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,$=j`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,I=j`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,C=goober_modern_j("div")`
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
    animation: ${$} 0.15s ease-out forwards;
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
    animation: ${I} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,R=j`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,V=goober_modern_j("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${R} 1s linear infinite;
`,P=j`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,Z=j`
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
}`,O=goober_modern_j("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${P} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${Z} 0.2s ease-out forwards;
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
`,F=goober_modern_j("div")`
  position: absolute;
`,z=goober_modern_j("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,S=j`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,T=goober_modern_j("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${S} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,M=({toast:e})=>{let{icon:r,type:n,iconTheme:l}=e;return void 0!==r?"string"==typeof r?c.createElement(T,null,r):r:"blank"===n?null:c.createElement(z,null,c.createElement(V,{...l}),"loading"!==n&&c.createElement(F,null,"error"===n?c.createElement(C,{...l}):c.createElement(O,{...l})))},ye=e=>`
0% {transform: translate3d(0,${-200*e}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,ge=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*e}%,-1px) scale(.6); opacity:0;}
`,q=goober_modern_j("div")`
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
`,L=goober_modern_j("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,Ae=(e,r)=>{let n=e.includes("top")?1:-1,[l,d]=A()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[ye(n),ge(n)];return{animation:r?`${j(l)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${j(d)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}};c.memo(({toast:e,position:r,style:n,children:l})=>{let d=e.height?Ae(e.position||r||"top-center",e.visible):{opacity:0},f=c.createElement(M,{toast:e}),g=c.createElement(L,{...e.ariaProps},dist_f(e.message,e));return c.createElement(q,{className:e.className,style:{...d,...n,...e.style}},"function"==typeof l?l({icon:f,message:g}):c.createElement(c.Fragment,null,f,g))}),m(c.createElement),u`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`}}]);