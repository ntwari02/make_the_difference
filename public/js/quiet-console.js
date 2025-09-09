(function(){
    try {
        var host = String(location.hostname || '').toLowerCase();
        var isLocal = /localhost|127\.0\.0\.1|::1/.test(host);
        var debugParam = /[?&]debug=1(?!\d)/.test(location.search);
        var debugFlag = (localStorage.getItem('debug') === '1');

        if (!isLocal && !debugParam && !debugFlag) {
            var noop = function(){};
            var methods = ['log','info','warn','error','debug','trace','table','group','groupCollapsed','groupEnd'];
            for (var i=0;i<methods.length;i++) {
                try { console[methods[i]] = noop; } catch(e) {}
            }

            // Prevent default console error spam for unhandled errors in prod
            window.addEventListener('error', function(e){ try { e.preventDefault(); } catch(_){} }, true);
            window.addEventListener('unhandledrejection', function(e){ try { e.preventDefault(); } catch(_){} }, true);
        }
    } catch (e) {
        // If anything goes wrong here, fail silently
    }
})();


