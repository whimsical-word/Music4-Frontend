import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:audioplayers/audioplayers.dart';
import '../../../core/models/track.dart';

class PlayerStateData {
  final Track? currentTrack;
  final bool isPlaying;
  final Duration position;
  final Duration duration;
  final List<Track> queue;

  PlayerStateData({
    this.currentTrack,
    this.isPlaying = false,
    this.position = Duration.zero,
    this.duration = Duration.zero,
    this.queue = const [],
  });

  PlayerStateData copyWith({
    Track? currentTrack,
    bool? isPlaying,
    Duration? position,
    Duration? duration,
    List<Track>? queue,
  }) {
    return PlayerStateData(
      currentTrack: currentTrack ?? this.currentTrack,
      isPlaying: isPlaying ?? this.isPlaying,
      position: position ?? this.position,
      duration: duration ?? this.duration,
      queue: queue ?? this.queue,
    );
  }
}

class PlayerNotifier extends Notifier<PlayerStateData> {
  late final AudioPlayer _audioPlayer;
  StreamSubscription? _positionSub;
  StreamSubscription? _durationSub;
  StreamSubscription? _stateSub;

  @override
  PlayerStateData build() {
    _audioPlayer = AudioPlayer();
    _initStreams();

    ref.onDispose(() {
      _positionSub?.cancel();
      _durationSub?.cancel();
      _stateSub?.cancel();
      _audioPlayer.dispose();
    });

    return PlayerStateData();
  }

  void _initStreams() {
    _positionSub = _audioPlayer.onPositionChanged.listen((p) {
      state = state.copyWith(position: p);
    });
    
    _durationSub = _audioPlayer.onDurationChanged.listen((d) {
      state = state.copyWith(duration: d);
    });
    
    _stateSub = _audioPlayer.onPlayerStateChanged.listen((s) {
      state = state.copyWith(isPlaying: s == PlayerState.playing);
      if (s == PlayerState.completed) {
        // Auto play next if possible
        next();
      }
    });
  }

  String _getAudioUrl(String? path) {
    if (path == null || path.isEmpty) return '';
    if (path.startsWith('http')) return path;
    return 'https://music4-v3-storage-kenz.s3.ap-southeast-1.amazonaws.com/$path';
  }

  Future<void> playTrack(Track track, {List<Track>? queue}) async {
    state = state.copyWith(currentTrack: track, queue: queue ?? state.queue);
    if (track.src != null) {
      await _audioPlayer.play(UrlSource(_getAudioUrl(track.src)));
    }
  }

  Future<void> pause() async {
    await _audioPlayer.pause();
  }

  Future<void> resume() async {
    await _audioPlayer.resume();
  }

  Future<void> togglePlayPause() async {
    if (state.isPlaying) {
      await pause();
    } else if (state.currentTrack != null) {
      await resume();
    }
  }

  Future<void> seek(Duration position) async {
    await _audioPlayer.seek(position);
  }

  Future<void> next() async {
    if (state.queue.isEmpty || state.currentTrack == null) return;
    final currentIndex = state.queue.indexWhere((t) => t.id == state.currentTrack!.id);
    if (currentIndex != -1 && currentIndex + 1 < state.queue.length) {
      await playTrack(state.queue[currentIndex + 1]);
    }
  }

  Future<void> previous() async {
    if (state.position.inSeconds > 3) {
      // If played more than 3 seconds, just restart track
      await seek(Duration.zero);
      return;
    }
    if (state.queue.isEmpty || state.currentTrack == null) return;
    final currentIndex = state.queue.indexWhere((t) => t.id == state.currentTrack!.id);
    if (currentIndex > 0) {
      await playTrack(state.queue[currentIndex - 1]);
    }
  }
}

final playerProvider = NotifierProvider<PlayerNotifier, PlayerStateData>(() {
  return PlayerNotifier();
});

