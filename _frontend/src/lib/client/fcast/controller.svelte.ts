import {
    InitialSenderMessage,
    OPCODE,
    PlaybackState,
    PlayMessage,
    SeekMessage,
    SetSpeedMessage,
    SetVolumeMessage,
    SubscribeEventMessage,
    UnsubscribeEventMessage,
    VersionMessage,
    type EventSubscribeObject,
    type InitialReceiverMessage,
    type PlaybackErrorMessage,
    type PlaybackUpdateMessage,
    type PlayUpdateMessage,
    type VolumeUpdateMessage
} from "./protocol.js"
import {
    WebSocketController,
    type WebSocketEventHandler
} from "./websocket-controller.svelte.js"

export class FCastController {
    private webSocketController: WebSocketController | null = null
    public connected: boolean = $state(false)
    private protocolVersion: number = 3
    private deviceInfo: InitialSenderMessage

    // playback states
    public playbackState: PlaybackState | undefined = $state(undefined)
    public playbackTime: number | undefined = $state(undefined)
    public playbackDuration: number | undefined = $state(undefined)
    public playbackSpeed: number | undefined = $state(undefined)
    public playbackItemIndex: number | undefined = $state(undefined)
    public playbackVolume: number | undefined = $state(undefined)

    // current play data
    public currentPlayData: PlayMessage | undefined = $state(undefined)

    /**
     * Creates a new FCastController instance and establishes WebSocket connection.
     * @param deviceInfo - Optional device information for initial handshake
     */
    constructor(
        ip: string,
        port: number,
        deviceInfo?: Partial<InitialSenderMessage>
    ) {
        this.deviceInfo = {
            displayName: deviceInfo?.displayName || "FCast Remote",
            appName: deviceInfo?.appName || "fcast-svelte-remote",
            appVersion: deviceInfo?.appVersion || "0.0.1"
        }
        const eventHandlers: WebSocketEventHandler = {
            onOpen: this.onWebSocketOpen,
            onError: this.onWebSocketError,
            onClose: this.onWebSocketClose,
            onPacketReceived: this.onPacketReceived
        }

        this.webSocketController = new WebSocketController(
            ip,
            port,
            eventHandlers
        )
    }

    /**
     * Disconnects from the current WebSocket connection.
     */
    public disconnect = (): void => {
        this.webSocketController?.disconnect()
    }

    /**
     * Plays the specified URL on the connected FCast receiver.
     * @param url - The direct URL to the media file
     * @param type - The media container type
     */
    public play = (url: string, type: string): void => {
        this.webSocketController?.sendPacket(
            OPCODE.Play,
            new PlayMessage(type, url)
        )
    }

    public pause = (): void => {
        this.webSocketController?.sendPacket(OPCODE.Pause)
    }

    public resume = (): void => {
        this.webSocketController?.sendPacket(OPCODE.Resume)
    }

    public stop = (): void => {
        this.webSocketController?.sendPacket(OPCODE.Stop)
    }

    /**
     * Seeks to a specific time position in the current media.
     * @param time - The time position to seek to in seconds
     */
    public seek = (time: number): void => {
        this.webSocketController?.sendPacket(OPCODE.Seek, new SeekMessage(time))
    }

    /**
     * Sets the volume level on the receiver.
     * @param volume - Volume level between 0 and 1
     */
    public setVolume = (volume: number): void => {
        this.webSocketController?.sendPacket(
            OPCODE.SetVolume,
            new SetVolumeMessage(volume)
        )
    }

    /**
     * Sets the playback speed on the receiver.
     * @param speed - Speed multiplier (1.0 = normal speed)
     */
    public setSpeed = (speed: number): void => {
        this.webSocketController?.sendPacket(
            OPCODE.SetSpeed,
            new SetSpeedMessage(speed)
        )
    }

    /**
     * Subscribes to receiver events.
     * @param event - The event to subscribe to
     */
    public subscribeEvent = (event: EventSubscribeObject): void => {
        this.webSocketController?.sendPacket(
            OPCODE.SubscribeEvent,
            new SubscribeEventMessage(event)
        )
    }

    /**
     * Unsubscribes from receiver events.
     * @param event - The event to unsubscribe from
     */
    public unsubscribeEvent = (event: EventSubscribeObject): void => {
        this.webSocketController?.sendPacket(
            OPCODE.UnsubscribeEvent,
            new UnsubscribeEventMessage(event)
        )
    }

    private onWebSocketOpen = (): void => {
        console.log("[fcast] WebSocket connection opened")
        this.connected = true

        // Send version message as required by protocol v3
        this.webSocketController?.sendPacket(
            OPCODE.Version,
            new VersionMessage(this.protocolVersion)
        )
    }

    private onWebSocketError = (error: Event): void => {
        console.error("[fcast] WebSocket error:", error)
    }

    private onWebSocketClose = (event: CloseEvent): void => {
        console.log("[fcast] WebSocket connection closed:", event.reason)
        this.connected = false
    }

    private onPacketReceived = (opcode: number, body: object | null): void => {
        switch (opcode) {
            // PlaybackUpdate = 6 => Receiver message to notify an updated playback state, body is PlaybackUpdateMessage
            case OPCODE.PlaybackUpdate:
                this.handlePlaybackUpdate(body)
                break

            // VolumeUpdate = 7 => Receiver message to notify when the volume has changed, body is VolumeUpdateMessage
            case OPCODE.VolumeUpdate:
                this.handleVolumeUpdate(body)
                break

            // PlaybackError = 9 => Server message to notify the sender a playback error happened, body is PlaybackErrorMessage
            case OPCODE.PlaybackError:
                this.onPlaybackError(
                    (body as PlaybackErrorMessage)?.message ||
                        "Unknown playback error"
                )
                break

            // Version = 11 => Message to notify the other of the current version, body is VersionMessage
            case OPCODE.Version:
                this.handleVersion(body)
                break

            // Ping = 12 => Message to get the other party to pong, no body
            case OPCODE.Ping:
                this.webSocketController?.sendPacket(OPCODE.Pong)
                break

            // Pong = 13 => Message to respond to a ping from the other party, no body
            case OPCODE.Pong:
                console.debug("[fcast] received pong")
                break

            // Initial = 14 => Message to notify the other party of device information and state
            case OPCODE.Initial:
                this.handleInitial(body)
                break

            // PlayUpdate = 15 => Receiver message to notify all senders when any device has sent a Play message, body is PlayUpdateMessage
            case OPCODE.PlayUpdate:
                this.handlePlayUpdate(body)
                break

            default:
                console.warn("[fcast] Unhandled opcode:", opcode)
                break
        }
    }

    private handleVersion = (body: object | null) => {
        if (!body) return

        const data = body as VersionMessage
        console.debug("[fcast] received version package", data)

        // Send initial message after version handshake
        this.webSocketController?.sendPacket(
            OPCODE.Initial,
            new InitialSenderMessage(
                this.deviceInfo.displayName,
                this.deviceInfo.appName,
                this.deviceInfo.appVersion
            )
        )
    }

    private handlePlaybackUpdate = (body: object | null): void => {
        if (!body) return

        const data = body as PlaybackUpdateMessage
        console.debug("[fcast] received PlaybackUpdate package", data)

        this.playbackState = data.state
        this.playbackTime = data.time ?? undefined
        this.playbackDuration = data.duration ?? undefined
        this.playbackSpeed = data.speed ?? undefined
        this.playbackItemIndex = data.itemIndex ?? undefined
    }

    private handleVolumeUpdate = (body: object | null): void => {
        if (!body) return

        const data = body as VolumeUpdateMessage
        console.debug("[fcast] received VolumeUpdate package", data)

        this.playbackVolume = data.volume
    }

    private handleInitial = (body: object | null): void => {
        if (!body) return

        const data = body as InitialReceiverMessage
        console.debug("[fcast] received Initial package", data)

        if (data.playData) {
            this.currentPlayData = data.playData
        }
    }

    private handlePlayUpdate = (body: object | null): void => {
        if (!body) return

        const data = body as PlayUpdateMessage
        console.debug("[fcast] received PlayUpdate package", data)

        if (data.playData) {
            this.currentPlayData = data.playData
        }
    }

    private onPlaybackError = (error: string): void => {
        console.error("[fcast] Playback error:", error)
    }
}
