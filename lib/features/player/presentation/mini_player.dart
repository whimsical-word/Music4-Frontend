import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/player_provider.dart';

import 'full_player_screen.dart';

class MiniPlayer extends ConsumerWidget {
  const MiniPlayer({Key? key}) : super(key: key);

  String _getImageUrl(String? path) {
    if (path == null || path.isEmpty || path == 'null') {
      return 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop';
    }
    if (path.startsWith('http')) return path;
    return 'https://music4-v3-storage-kenz.s3.ap-southeast-1.amazonaws.com/$path';
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final playerState = ref.watch(playerProvider);
    final currentTrack = playerState.currentTrack;

    if (currentTrack == null) return const SizedBox.shrink();

    final progress = playerState.duration.inMilliseconds > 0 
        ? playerState.position.inMilliseconds / playerState.duration.inMilliseconds
        : 0.0;

    return GestureDetector(
      onTap: () {
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          backgroundColor: Colors.transparent,
          builder: (context) => const FullPlayerScreen(),
        );
      },
      child: Container(
        height: 64,
        margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: const Color(0xFF1C2533),
          borderRadius: BorderRadius.circular(8),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.5),
              blurRadius: 10,
              offset: const Offset(0, 4),
            )
          ]
        ),
        child: Column(
          children: [
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(6),
                      child: Image.network(
                        _getImageUrl(currentTrack.img),
                        width: 44,
                        height: 44,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(
                          width: 44,
                          height: 44,
                          color: Colors.grey[800],
                          child: const Icon(Icons.music_note, color: Colors.grey),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            currentTrack.name,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white),
                          ),
                          Text(
                            currentTrack.artists.map((a) => a.name).join(', '),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(fontSize: 12, color: Colors.grey[400]),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.favorite_border, color: Colors.grey),
                      onPressed: () {},
                    ),
                    IconButton(
                      icon: Icon(playerState.isPlaying ? Icons.pause : Icons.play_arrow, color: Colors.white),
                      onPressed: () {
                        ref.read(playerProvider.notifier).togglePlayPause();
                      },
                    ),
                  ],
                ),
              ),
            ),
            // Progress bar mỏng
            LinearProgressIndicator(
              value: progress.clamp(0.0, 1.0),
              backgroundColor: Colors.transparent,
              valueColor: const AlwaysStoppedAnimation<Color>(Colors.blueAccent),
              minHeight: 2,
            ),
          ],
        ),
      ),
    );
  }
}
