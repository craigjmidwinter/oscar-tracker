(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[769],{7925:(e,s,r)=>{Promise.resolve().then(r.bind(r,4850))},4850:(e,s,r)=>{"use strict";r.r(s),r.d(s,{default:()=>c});var t=r(5155),n=r(2115),i=r(6658),a=r(8994);function c(){let e=(0,i.useRouter)();return(0,n.useEffect)(()=>{let s=!0,r=async()=>{let{data:{user:r},error:t}=await a.ND.auth.getUser();if(r&&s){e.replace("/");return}t&&(console.error("Session error:",t),e.replace("/sign-in?error=session_error"))},{data:{subscription:t}}=a.ND.auth.onAuthStateChange(async(r,t)=>{"SIGNED_IN"===r&&t&&s&&e.replace("/")});return r(),()=>{s=!1,null==t||t.unsubscribe()}},[e]),(0,t.jsx)("div",{className:"flex items-center justify-center min-h-screen",children:(0,t.jsx)("p",{children:"Completing authentication..."})})}},8994:(e,s,r)=>{"use strict";r.d(s,{ND:()=>t});let t=(0,r(5974).UU)("postgresql://postgres:r64hti8SdGpomLe7@db.ekmhsnwsdpjpxznopwkp.supabase.co:5432/postgres","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrbWhzbndzZHBqcHh6bm9wd2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk0NjU3MTUsImV4cCI6MjA1NTA0MTcxNX0.rDW5AjPCD0-xF00F7abJNolEroseW_rO76wZ8wSdB-8",{auth:{storage:localStorage,autoRefreshToken:!0,persistSession:!0,detectSessionInUrl:!0}})}},e=>{var s=s=>e(e.s=s);e.O(0,[736,441,517,358],()=>s(7925)),_N_E=e.O()}]);