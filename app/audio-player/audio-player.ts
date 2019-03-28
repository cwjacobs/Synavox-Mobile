import { TNSPlayer } from 'nativescript-audio';

export class AudioPlayer {
    private static _player: TNSPlayer;

    constructor(audioPath?: string) {
        AudioPlayer._player = new TNSPlayer();
        AudioPlayer._player.debug = true; // set true to enable TNSPlayer console logs for debugging.
    }

    public static useAudio(audioPath: string) {
        AudioPlayer._player
            .initFromFile({
                audioFile: audioPath, // ~ = app directory
                loop: false,
                completeCallback: AudioPlayer._trackComplete.bind(this),
                errorCallback: AudioPlayer._trackError.bind(this)
            })
            .then(() => {
                AudioPlayer._player.getAudioTrackDuration().then(duration => {
                    // iOS: duration is in seconds
                    // Android: duration is in milliseconds
                    // console.log(`audio duration:`, duration);
                    // alert("Audio duration: " + duration);
                });
            });
    }

    public static play() {
        AudioPlayer._player.play();
    }

    public static pause() {
        AudioPlayer._player.pause();
    }

    public static togglePlay() {
        if (AudioPlayer._player.isAudioPlaying()) {
            AudioPlayer._player.pause();
        } else {
            AudioPlayer._player.play();
        }
    }

    private static _trackComplete(args: any) {
        console.log('reference back to player:', args.player);
        // iOS only: flag indicating if completed succesfully
        console.log('whether song play completed successfully:', args.flag);
    }

    private static _trackError(args: any) {
        console.log('reference back to player:', args.player);
        console.log('the error:', args.error);
        // Android only: extra detail on error
        console.log('extra info on the error:', args.extra);
    }
}