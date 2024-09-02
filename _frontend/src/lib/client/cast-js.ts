//@ts-nocheck
if (window.chrome && !window.chrome.cast) {
  var t = document.createElement("script")
  ;(t.src =
    "https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1"),
    document.head.appendChild(t)
}
class Castjs {
  constructor(t = {}) {
    var e = ["tab_and_origin_scoped", "origin_scoped", "page_scoped"]
    ;(t.joinpolicy && -1 !== e.indexOf(t.joinpolicy)) ||
      (t.joinpolicy = "tab_and_origin_scoped"),
      (t.receiver && "" !== t.receiver) || (t.receiver = "CC1AD845"),
      (this._events = {}),
      (this._player = null),
      (this._controller = null),
      (this.version = "v5.3.0"),
      (this.receiver = t.receiver),
      (this.joinpolicy = t.joinpolicy),
      (this.available = !1),
      (this.connected = !1),
      (this.device = "Chromecast"),
      (this.src = ""),
      (this.title = ""),
      (this.description = ""),
      (this.poster = ""),
      (this.subtitles = []),
      (this.volumeLevel = 1),
      (this.muted = !1),
      (this.paused = !1),
      (this.time = 0),
      (this.timePretty = "00:00:00"),
      (this.duration = 0),
      (this.durationPretty = "00:00:00"),
      (this.progress = 0),
      (this.state = "disconnected"),
      this._init()
  }
  _getBrowser() {
    return navigator.userAgent.toLowerCase().indexOf("firefox") > -1
      ? "Firefox: Please enable casting, click here: https://googlechromecast.com/how-to-cast-firefox-to-tv/"
      : navigator.userAgent.toLowerCase().indexOf("opr/") > -1
        ? "Opera: Please enable casting, click here: https://googlechromecast.com/how-to-cast-opera-browser-to-tv-using-google-chromecast/"
        : navigator.userAgent.toLowerCase().indexOf("iron safari") > -1
          ? "Iron Safari: Please enable casting, click here: https://googlechromecast.com/how-to-cast-opera-browser-to-tv-using-google-chromecast/"
          : navigator.brave
            ? "Brave: Please enable casting, click here: https://googlechromecast.com/how-to-cast-brave-browser-to-chromecast/"
            : "This Browser"
  }
  _init(t = 0) {
    if (
      !window.chrome ||
      !window.chrome.cast ||
      !window.chrome.cast.isAvailable
    )
      return t++ > 20
        ? this.trigger(
            "error",
            "Casting is not enabled in " + this._getBrowser()
          )
        : setTimeout(this._init.bind(this), 250, t)
    clearInterval(this.intervalIsAvailable),
      cast.framework.CastContext.getInstance().setOptions({
        receiverApplicationId: this.receiver,
        autoJoinPolicy: this.joinpolicy,
        language: "en-US",
        resumeSavedSession: !0
      }),
      (this._player = new cast.framework.RemotePlayer()),
      (this._controller = new cast.framework.RemotePlayerController(
        this._player
      )),
      this._controller.addEventListener(
        "isConnectedChanged",
        this._isConnectedChanged.bind(this)
      ),
      this._controller.addEventListener(
        "isMediaLoadedChanged",
        this._isMediaLoadedChanged.bind(this)
      ),
      this._controller.addEventListener(
        "isMutedChanged",
        this._isMutedChanged.bind(this)
      ),
      this._controller.addEventListener(
        "isPausedChanged",
        this._isPausedChanged.bind(this)
      ),
      this._controller.addEventListener(
        "currentTimeChanged",
        this._currentTimeChanged.bind(this)
      ),
      this._controller.addEventListener(
        "durationChanged",
        this._durationChanged.bind(this)
      ),
      this._controller.addEventListener(
        "volumeLevelChanged",
        this._volumeLevelChanged.bind(this)
      ),
      this._controller.addEventListener(
        "playerStateChanged",
        this._playerStateChanged.bind(this)
      ),
      (this.available = !0),
      this.trigger("available")
  }
  _isMediaLoadedChanged() {
    this._player.isMediaLoaded &&
      setTimeout(() => {
        if (this._player.mediaInfo) {
          for (var t in ((this.device =
            cast.framework.CastContext.getInstance()
              .getCurrentSession()
              .getCastDevice().friendlyName || this.device),
          (this.src = this._player.mediaInfo.contentId),
          (this.title = this._player.title || null),
          (this.description = this._player.mediaInfo.metadata.subtitle || null),
          (this.poster = this._player.imageUrl || null),
          (this.subtitles = []),
          (this.volumeLevel = this.volumeLevel =
            Number(this._player.volumeLevel.toFixed(1))),
          (this.muted = this._player.isMuted),
          (this.paused = this._player.isPaused),
          (this.time = Math.round(this._player.currentTime, 1)),
          (this.timePretty = this._controller.getFormattedTime(this.time)),
          (this.duration = this._player.duration),
          (this.durationPretty = this._controller.getFormattedTime(
            this._player.duration
          )),
          (this.progress = this._controller.getSeekPosition(
            this.time,
            this._player.duration
          )),
          (this.state = this._player.playerState.toLowerCase()),
          this._player.mediaInfo.tracks))
            "TEXT" === this._player.mediaInfo.tracks[t].type &&
              this.subtitles.push({
                label: this._player.mediaInfo.tracks[t].name,
                src: this._player.mediaInfo.tracks[t].trackContentId
              })
          var e = cast.framework.CastContext.getInstance()
            .getCurrentSession()
            .getSessionObj().media[0].activeTrackIds
          e &&
            e.length &&
            this.subtitles[e[0]] &&
            (this.subtitles[e[0]].active = !0)
        }
      })
  }
  _isConnectedChanged() {
    ;(this.connected = this._player.isConnected),
      this.connected &&
        (this.device =
          cast.framework.CastContext.getInstance()
            .getCurrentSession()
            .getCastDevice().friendlyName || this.device),
      (this.state = this.connected ? "connected" : "disconnected"),
      this.trigger("statechange"),
      this.trigger(this.connected ? "connect" : "disconnect")
  }
  _currentTimeChanged() {
    var t = this.time
    ;(this.time = Math.round(this._player.currentTime, 1)),
      (this.duration = this._player.duration),
      (this.progress = this._controller.getSeekPosition(
        this.time,
        this.duration
      )),
      (this.timePretty = this._controller.getFormattedTime(this.time)),
      (this.durationPretty = this._controller.getFormattedTime(this.duration)),
      (t != this.time || this._player.isPaused) && this.trigger("timeupdate")
  }
  _durationChanged() {
    this.duration = this._player.duration
  }
  _volumeLevelChanged() {
    ;(this.volumeLevel = Number(this._player.volumeLevel.toFixed(1))),
      this._player.isMediaLoaded && this.trigger("volumechange")
  }
  _isMutedChanged() {
    var t = this.muted
    ;(this.muted = this._player.isMuted),
      t != this.muted && this.trigger(this.muted ? "mute" : "unmute")
  }
  _isPausedChanged() {
    ;(this.paused = this._player.isPaused), this.paused && this.trigger("pause")
  }
  _playerStateChanged() {
    if (((this.connected = this._player.isConnected), this.connected))
      switch (
        ((this.device =
          cast.framework.CastContext.getInstance()
            .getCurrentSession()
            .getCastDevice().friendlyName || this.device),
        (this.state = this._player.playerState.toLowerCase()),
        this.state)
      ) {
        case "idle":
          return (
            (this.state = "ended"),
            this.trigger("statechange"),
            this.trigger("end"),
            this
          )
        case "buffering":
          return (
            (this.time = Math.round(this._player.currentTime, 1)),
            (this.duration = this._player.duration),
            (this.progress = this._controller.getSeekPosition(
              this.time,
              this.duration
            )),
            (this.timePretty = this._controller.getFormattedTime(this.time)),
            (this.durationPretty = this._controller.getFormattedTime(
              this.duration
            )),
            this.trigger("statechange"),
            this.trigger("buffering"),
            this
          )
        case "playing":
          return (
            setTimeout(() => {
              this.trigger("statechange"), this.trigger("playing")
            }),
            this
          )
      }
  }
  on(t, e) {
    return (
      this._events[t] || (this._events[t] = []),
      this._events[t].push(e),
      "available" === t && !0 === this.available && setTimeout(() => e(), 0),
      this
    )
  }
  off(t) {
    return (
      t ? this._events[t] && (this._events[t] = []) : (this._events = {}), this
    )
  }
  trigger(t) {
    var e = Array.prototype.slice.call(arguments, 1)
    for (var i in this._events[t])
      setTimeout(() => {
        this._events[t][i].apply(this, e)
      }, 1)
    if ("error" === t) return this
    for (var i in this._events.event)
      setTimeout(() => {
        this._events.event[i].apply(this, [t])
      }, 1)
    return this
  }
  cast(t, e = {}) {
    if (!t) return this.trigger("error", "No media source specified.")
    for (var i in ((e.src = t), e)) e.hasOwnProperty(i) && (this[i] = e[i])
    if (cast.framework.CastContext.getInstance().getCurrentSession()) {
      var s = new chrome.cast.media.MediaInfo(this.src)
      if (
        ((s.metadata = new chrome.cast.media.GenericMediaMetadata()),
        this.subtitles.length)
      ) {
        ;(s.textTrackStyle = new chrome.cast.media.TextTrackStyle()),
          (s.textTrackStyle.backgroundColor = "#00000000"),
          (s.textTrackStyle.edgeColor = "#00000016"),
          (s.textTrackStyle.edgeType = "DROP_SHADOW"),
          (s.textTrackStyle.fontFamily = "CASUAL"),
          (s.textTrackStyle.fontScale = 1),
          (s.textTrackStyle.foregroundColor = "#FFFFFF"),
          (s.textTrackStyle = { ...s.textTrackStyle, ...this.subtitleStyle })
        var r = []
        for (var a in this.subtitles) {
          var n = new chrome.cast.media.Track(a, "TEXT")
          ;(n.name = this.subtitles[a].label),
            (n.subtype = "CAPTIONS"),
            (n.trackContentId = this.subtitles[a].src),
            (n.trackContentType = "text/vtt"),
            (n.trackId = parseInt(a)),
            r.push(n)
        }
        s.tracks = r
      }
      ;(s.metadata.images = [new chrome.cast.Image(this.poster)]),
        (s.metadata.title = this.title),
        (s.metadata.subtitle = this.description)
      var o = new chrome.cast.media.LoadRequest(s)
      if (
        ((o.currentTime = this.time),
        (o.autoplay = !this.paused),
        this.subtitles.length)
      ) {
        for (var a in this.subtitles)
          if (this.subtitles[a].active) {
            o.activeTrackIds = [parseInt(a)]
            break
          }
      }
      cast.framework.CastContext.getInstance()
        .getCurrentSession()
        .loadMedia(o)
        .then(
          () => (
            (this.device =
              cast.framework.CastContext.getInstance()
                .getCurrentSession()
                .getCastDevice().friendlyName || this.device),
            this.paused && this._controller.playOrPause(),
            this
          ),
          t => this.trigger("error", t)
        )
    } else
      cast.framework.CastContext.getInstance()
        .requestSession()
        .then(
          () => {
            if (!cast.framework.CastContext.getInstance().getCurrentSession())
              return this.trigger(
                "error",
                "Could not connect with the cast device"
              )
            var t = new chrome.cast.media.MediaInfo(this.src)
            if (
              ((t.metadata = new chrome.cast.media.GenericMediaMetadata()),
              this.subtitles.length)
            ) {
              ;(t.textTrackStyle = new chrome.cast.media.TextTrackStyle()),
                (t.textTrackStyle.backgroundColor = "#00000000"),
                (t.textTrackStyle.edgeColor = "#00000016"),
                (t.textTrackStyle.edgeType = "DROP_SHADOW"),
                (t.textTrackStyle.fontFamily = "CASUAL"),
                (t.textTrackStyle.fontScale = 1),
                (t.textTrackStyle.foregroundColor = "#FFFFFF"),
                (t.textTrackStyle = {
                  ...t.textTrackStyle,
                  ...this.subtitleStyle
                })
              var e = []
              for (var i in this.subtitles) {
                var s = new chrome.cast.media.Track(i, "TEXT")
                ;(s.name = this.subtitles[i].label),
                  (s.subtype = "CAPTIONS"),
                  (s.trackContentId = this.subtitles[i].src),
                  (s.trackContentType = "text/vtt"),
                  (s.trackId = parseInt(i)),
                  e.push(s)
              }
              t.tracks = e
            }
            ;(t.metadata.images = [new chrome.cast.Image(this.poster)]),
              (t.metadata.title = this.title),
              (t.metadata.subtitle = this.description)
            var r = new chrome.cast.media.LoadRequest(t)
            if (
              ((r.currentTime = this.time),
              (r.autoplay = !this.paused),
              this.subtitles.length)
            ) {
              for (var i in this.subtitles)
                if (this.subtitles[i].active) {
                  r.activeTrackIds = [parseInt(i)]
                  break
                }
            }
            cast.framework.CastContext.getInstance()
              .getCurrentSession()
              .loadMedia(r)
              .then(
                () => (
                  (this.device =
                    cast.framework.CastContext.getInstance()
                      .getCurrentSession()
                      .getCastDevice().friendlyName || this.device),
                  this.paused && this._controller.playOrPause(),
                  this
                ),
                t => this.trigger("error", t)
              )
          },
          t => ("cancel" !== t && this.trigger("error", t), this)
        )
  }
  seek(t, e) {
    return (
      e && (t = this._controller.getSeekTime(t, this._player.duration)),
      (this._player.currentTime = t),
      this._controller.seek(),
      this
    )
  }
  volume(t) {
    return (
      (this._player.volumeLevel = t), this._controller.setVolumeLevel(), this
    )
  }
  play() {
    return this.paused && this._controller.playOrPause(), this
  }
  pause() {
    return this.paused || this._controller.playOrPause(), this
  }
  mute() {
    return this.muted || this._controller.muteOrUnmute(), this
  }
  unmute() {
    return this.muted && this._controller.muteOrUnmute(), this
  }
  subtitle(t) {
    var e = new chrome.cast.media.EditTracksInfoRequest([parseInt(t)])
    cast.framework.CastContext.getInstance()
      .getCurrentSession()
      .getSessionObj()
      .media[0].editTracksInfo(
        e,
        () => {
          for (var e in this.subtitles)
            delete this.subtitles[e].active,
              e == t && (this.subtitles[e].active = !0)
          return this.trigger("subtitlechange")
        },
        t => this.trigger("error", t)
      )
  }
  disconnect() {
    return (
      cast.framework.CastContext.getInstance().endCurrentSession(!0),
      this._controller.stop(),
      (this.connected = !1),
      (this.device = "Chromecast"),
      (this.src = ""),
      (this.title = ""),
      (this.description = ""),
      (this.poster = ""),
      (this.subtitles = []),
      (this.volumeLevel = 1),
      (this.muted = !1),
      (this.paused = !1),
      (this.time = 0),
      (this.timePretty = "00:00:00"),
      (this.duration = 0),
      (this.durationPretty = "00:00:00"),
      (this.progress = 0),
      (this.state = "disconnected"),
      this.trigger("disconnect"),
      this
    )
  }
}
export default Castjs
