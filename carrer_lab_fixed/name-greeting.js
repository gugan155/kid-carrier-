(function(){
  try {
    var n = localStorage.getItem('kl_name');
    if (!n) return;
    var safe = n.replace(/</g,'&lt;').replace(/>/g,'&gt;');
    document.querySelectorAll('.career-greeting').forEach(function(el){
      el.innerHTML = 'Привет, <strong>' + safe + '</strong>! 👋';
    });
  } catch(e){}
})();
