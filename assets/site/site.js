(function(){
  var ID='G-5LL3J79NRG',KEY='dh-analytics-consent';
  function load(){
    if(window.gtag)return;
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){window.dataLayer.push(arguments)};
    window.gtag('js',new Date());
    window.gtag('config',ID,{anonymize_ip:true});
    var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+ID;document.head.appendChild(s);
  }
  function ev(n,p){if(typeof window.gtag==='function')window.gtag('event',n,p)}
  var c=null;try{c=localStorage.getItem(KEY)}catch(e){}
  if(c==='yes')load();
  var b=document.querySelector('[data-analytics-banner]');
  if(b){
    if(c!=='yes'&&c!=='no')b.hidden=false;
    b.addEventListener('click',function(e){
      var v=e.target&&e.target.getAttribute&&e.target.getAttribute('data-consent');
      if(v!=='yes'&&v!=='no')return;
      try{localStorage.setItem(KEY,v)}catch(e){}
      b.hidden=true;if(v==='yes')load();
    });
  }
  document.addEventListener('submit',function(e){
    var f=e.target;if(!(f instanceof HTMLFormElement))return;
    var err=f.querySelector('.err'),bad=null;
    f.querySelectorAll('[required]').forEach(function(i){if(!bad&&!i.checkValidity())bad=i});
    if(bad){
      e.preventDefault();
      if(err){err.hidden=false;err.textContent=bad.getAttribute('data-msg')||'Please fill in this field.';}
      bad.setAttribute('aria-invalid','true');bad.focus();return;
    }
    ev('form_submit',{form:f.getAttribute('data-form')||'form'});
  });
  document.addEventListener('click',function(e){
    var a=e.target&&e.target.closest?e.target.closest('a,button'):null;if(!a)return;
    if(a.hasAttribute('data-cta'))ev('cta_click',{cta:a.getAttribute('data-cta'),label:(a.textContent||'').trim()});
    if(a.hasAttribute('data-download'))ev('file_download',{file_name:'start-with-one-offer.pdf',link_url:a.href});
    if(a.tagName==='A'&&a.href){try{var u=new URL(a.href,location.origin);if(u.origin!==location.origin&&u.protocol.indexOf('http')===0)ev('outbound_click',{url:u.href,link_text:(a.textContent||'').trim()})}catch(_){}}
  });
})();
