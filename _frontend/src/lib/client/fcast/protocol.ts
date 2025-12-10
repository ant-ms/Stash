export enum MetadataType {
    Generic = 0
}

export interface MetadataObject {
    type: MetadataType
}

export class GenericMediaMetadata implements MetadataObject {
    readonly type = MetadataType.Generic

    constructor(
        public title: string | null = null,
        public thumbnailUrl: string | null = null,
        public custom: any = null
    ) {}
}

export class PlayMessage {
    constructor(
        public container: string, // The MIME type (video/mp4)
        public url: string | null = null, // The URL to load (optional)
        public content: string | null = null, // The content to load (i.e. a DASH manifest, json content, optional)
        public time: number | null = null, // The time to start playing in seconds
        public volume: number | null = null, // The desired volume (0-1)
        public speed: number | null = null, // The factor to multiply playback speed by (defaults to 1.0)
        public headers: { [key: string]: string } | null = null, // HTTP request headers to add to the play request Map<string, string>
        public metadata: MetadataObject | null = null
    ) {}
}

export enum ContentType {
    Playlist = 0
}

export interface ContentObject {
    contentType: ContentType
}

export class MediaItem {
    constructor(
        public container: string, // The MIME type (video/mp4)
        public url: string | null = null, // The URL to load (optional)
        public content: string | null = null, // The content to load (i.e. a DASH manifest, json content, optional)
        public time: number | null = null, // The time to start playing in seconds
        public volume: number | null = null, // The desired volume (0-1)
        public speed: number | null = null, // The factor to multiply playback speed by (defaults to 1.0)
        public cache: boolean | null = null, // Indicates if the receiver should preload the media item
        public showDuration: number | null = null, // Indicates how long the item content is presented on screen in seconds
        public headers: { [key: string]: string } | null = null, // HTTP request headers to add to the play request Map<string, string>
        public metadata: MetadataObject | null = null
    ) {}
}

export class PlaylistContent implements ContentObject {
    readonly contentType = ContentType.Playlist

    constructor(
        public items: MediaItem[],
        public offset: number | null = null, // Start position of the first item to play from the playlist
        public volume: number | null = null, // The desired volume (0-1)
        public speed: number | null = null, // The factor to multiply playback speed by (defaults to 1.0)
        public forwardCache: number | null = null, // Count of media items should be pre-loaded forward from the current view index
        public backwardCache: number | null = null, // Count of media items should be pre-loaded backward from the current view index
        public metadata: MetadataObject | null = null
    ) {}
}

export class SeekMessage {
    constructor(
        public time: number // The time to seek to in seconds
    ) {}
}

export enum PlaybackState {
    Idle = 0,
    Playing = 1,
    Paused = 2
}

export class PlaybackUpdateMessage {
    constructor(
        public generationTime: number, // The time the packet was generated (unix time milliseconds)
        public state: number, // The playback state
        public time: number | null = null, // The current time playing in seconds
        public duration: number | null = null, // The duration in seconds
        public speed: number | null = null, // The playback speed factor
        public itemIndex: number | null = null // The playlist item index currently being played on receiver
    ) {}
}

export class VolumeUpdateMessage {
    constructor(
        public generationTime: number, // The time the packet was generated (unix time milliseconds)
        public volume: number // The current volume (0-1)
    ) {}
}

export class SetVolumeMessage {
    constructor(
        public volume: number // The desired volume (0-1)
    ) {}
}

export class PlaybackErrorMessage {
    constructor(public message: string) {}
}

export class SetSpeedMessage {
    constructor(
        public speed: number // The factor to multiply playback speed by.
    ) {}
}

export class VersionMessage {
    constructor(
        public version: number // Protocol version number (integer)
    ) {}
}

export class InitialSenderMessage {
    constructor(
        public displayName: string | null = null,
        public appName: string | null = null,
        public appVersion: string | null = null
    ) {}
}

export class InitialReceiverMessage {
    constructor(
        public displayName: string | null = null,
        public appName: string | null = null,
        public appVersion: string | null = null,
        public playData: PlayMessage | null = null
    ) {}
}

export class PlayUpdateMessage {
    constructor(
        public generationTime: number,
        public playData: PlayMessage | null = null
    ) {}
}

export class SetPlaylistItemMessage {
    constructor(
        public itemIndex: number // The playlist item index to play on receiver
    ) {}
}

export interface EventSubscribeObject {
    type: EventType
}

export enum EventType {
    MediaItemStart = 0,
    MediaItemEnd = 1,
    MediaItemChange = 2,
    KeyDown = 3,
    KeyUp = 4
}

// Required supported keys for listener events defined below.
// Optionally supported key values list: https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
export enum KeyNames {
    Left = "ArrowLeft",
    Right = "ArrowRight",
    Up = "ArrowUp",
    Down = "ArrowDown",
    Ok = "Enter"
}

export class MediaItemStartEvent implements EventSubscribeObject {
    readonly type = EventType.MediaItemStart

    constructor() {}
}

export class MediaItemEndEvent implements EventSubscribeObject {
    readonly type = EventType.MediaItemEnd

    constructor() {}
}

export class MediaItemChangeEvent implements EventSubscribeObject {
    readonly type = EventType.MediaItemChange

    constructor() {}
}

export class KeyDownEvent implements EventSubscribeObject {
    readonly type = EventType.KeyDown

    constructor(public keys: string[]) {}
}

export class KeyUpEvent implements EventSubscribeObject {
    readonly type = EventType.KeyUp

    constructor(public keys: string[]) {}
}

export class SubscribeEventMessage {
    constructor(public event: EventSubscribeObject) {}
}

export class UnsubscribeEventMessage {
    constructor(public event: EventSubscribeObject) {}
}

export interface EventObject {
    type: EventType
}

export class MediaItemEvent implements EventObject {
    constructor(
        public type: EventType,
        public item: MediaItem
    ) {}
}

export class KeyEvent implements EventObject {
    constructor(
        public type: EventType,
        public key: string,
        public repeat: boolean,
        public handled: boolean
    ) {}
}

export class EventMessage {
    constructor(
        public generationTime: number,
        public event: EventObject
    ) {}
}

export enum OPCODE {
    None = 0, // Not used
    Play = 1, // Sender message to play media content, body is PlayMessage
    Pause = 2, // Sender message to pause media content, no body
    Resume = 3, // Sender message to resume media content, no body
    Stop = 4, // Sender message to stop media content, no body
    Seek = 5, // Sender message to seek, body is SeekMessage
    PlaybackUpdate = 6, // Receiver message to notify an updated playback state, body is PlaybackUpdateMessage
    VolumeUpdate = 7, // Receiver message to notify when the volume has changed, body is VolumeUpdateMessage
    SetVolume = 8, // Sender message to change volume, body is SetVolumeMessage
    PlaybackError = 9, // Server message to notify the sender a playback error happened, body is PlaybackErrorMessage
    SetSpeed = 10, // Sender message to change playback speed, body is SetSpeedMessage
    Version = 11, // Message to notify the other of the current version, body is VersionMessage
    Ping = 12, // Message to get the other party to pong, no body
    Pong = 13, // Message to respond to a ping from the other party, no body
    Initial = 14, // Message to notify the other party of device information and state, body is InitialSenderMessage if receiver or InitialReceiverMessage if sender
    PlayUpdate = 15, // Receiver message to notify all senders when any device has sent a Play message, body is PlayUpdateMessage
    SetPlaylistItem = 16, // Sender message to set the item index in a playlist to play content from, body is SetPlaylistItemMessage
    SubscribeEvent = 17, // Sender message to subscribe to a receiver event, body is SubscribeEventMessage
    UnsubscribeEvent = 18, // Sender message to unsubscribe to a receiver event, body is UnsubscribeEventMessage
    Event = 19 // Receiver message to notify when a sender subscribed event has occurred, body is EventMessage
}
