function _registerEvent (target, eventType, cb) {
  if (target.addEventListener) {
    target.addEventListener(eventType, cb)
    return {
      remove: function () {
        target.removeEventListener(eventType, cb)
      }
    }
  } else {
    target.attachEvent(eventType, cb)
    return {
      remove: function () {
        target.detachEvent(eventType, cb)
      }
    }
  }
}

function disableAppStorage() {
  window.sessionStorage.appBypass = true;
  if (document.getElementById('openInApp').checked) {
    window.localStorage.useApp = false;
  }
  window.location.reload();
}

function openUriWithTimeoutHack (uri, failCb, successCb) {
  var timeout = setTimeout(function () {
    failCb()
    handler.remove()
  }, 75)

  // handle page running in an iframe (blur must be registered with top level window)
  var target = window
  while (target !== target.parent) {
    target = target.parent
  }

  var handler = _registerEvent(target, 'blur', onBlur)

  function onBlur () {
    clearTimeout(timeout)
    handler.remove()
    successCb()
  }

  document.getElementById("l").src = uri

}

function isElectron() {
// Renderer process
if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
    return true;
}

// Main process
if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
    return true;
}

// Detect the user agent when the `nodeIntegration` option is set to true
if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
    return true;
}

return false;
}
