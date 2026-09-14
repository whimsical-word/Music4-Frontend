import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/player_provider.dart';

class FullPlayerScreen extends ConsumerWidget {
  const FullPlayerScreen({Key? key}) : super(key: key);

  String _getImageUrl(String? path) {
    if (path == null || path.isEmpty || path == 'null') {
      return 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop';
    }
    if (path.startsWith('http')) return path;
    return 'https://music4-v3-storage-kenz.s3.ap-southeast-1.amazonaws.com/$path';
  }

  String _formatDuration(Duration d) {
    final minutes = d.inMinutes;
    final seconds = d.inSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final playerState = ref.watch(playerProvider);
    final track = playerState.currentTrack;

    if (track == null) return const SizedBox.shrink();

    final position = playerState.position;
    final duration = playerState.duration;
    
    return Container(
      height: MediaQuery.of(context).size.height * 0.95,
      decoration: const BoxDecoration(
        color: Color(0xFF0D131A),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                IconButton(
                  icon: const Icon(Icons.keyboard_arrow_down, color: Colors.white, size: 32),
                  onPressed: () => Navigator.pop(context),
                ),
                const Text(
                  'ĐANG PHÁT',
                  style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.5),
                ),
                IconButton(
                  icon: const Icon(Icons.more_horiz, color: Colors.white),
                  onPressed: () {},
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Artwork
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Image.network(
                  _getImageUrl(track.img),
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(color: Colors.grey[900], child: const Icon(Icons.music_note, size: 100, color: Colors.grey)),
                ),
              ),
            ),
          ),
          
          const SizedBox(height: 32),
          
          // Track Info
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        track.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        track.artists.map((a) => a.name).join(', '),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(fontSize: 16, color: Colors.grey[400]),
                      ),
                    ],
                  ),
                ),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.favorite_border, color: Colors.white, size: 28),
                      onPressed: () {},
                    ),
                    IconButton(
                      icon: const Icon(Icons.comment_outlined, color: Colors.white, size: 28),
                      onPressed: () {},
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Slider
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Column(
              children: [
                SliderTheme(
                  data: SliderTheme.of(context).copyWith(
                    activeTrackColor: Colors.white,
                    inactiveTrackColor: Colors.grey[800],
                    thumbColor: Colors.white,
                    trackHeight: 4,
                    thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
                  ),
                  child: Slider(
                    value: position.inSeconds.toDouble().clamp(0.0, duration.inSeconds.toDouble() > 0 ? duration.inSeconds.toDouble() : 1.0),
                    max: duration.inSeconds.toDouble() > 0 ? duration.inSeconds.toDouble() : 1.0,
                    onChanged: (val) {
                      ref.read(playerProvider.notifier).seek(Duration(seconds: val.toInt()));
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(_formatDuration(position), style: TextStyle(color: Colors.grey[400], fontSize: 12)),
                      Text(_formatDuration(duration), style: TextStyle(color: Colors.grey[400], fontSize: 12)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Controls
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                IconButton(icon: const Icon(Icons.shuffle, color: Colors.grey), onPressed: () {}),
                IconButton(
                  icon: const Icon(Icons.skip_previous, color: Colors.white, size: 36),
                  onPressed: () => ref.read(playerProvider.notifier).previous(),
                ),
                Container(
                  width: 64,
                  height: 64,
                  decoration: const BoxDecoration(color: Colors.blueAccent, shape: BoxShape.circle),
                  child: IconButton(
                    icon: Icon(playerState.isPlaying ? Icons.pause : Icons.play_arrow, color: Colors.white, size: 32),
                    onPressed: () => ref.read(playerProvider.notifier).togglePlayPause(),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.skip_next, color: Colors.white, size: 36),
                  onPressed: () => ref.read(playerProvider.notifier).next(),
                ),
                IconButton(icon: const Icon(Icons.repeat, color: Colors.grey), onPressed: () {}),
              ],
            ),
          ),
          
          const SizedBox(height: 48),
        ],
      ),
    );
  }
}

