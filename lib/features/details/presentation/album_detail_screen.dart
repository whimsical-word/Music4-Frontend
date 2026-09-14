import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/details_provider.dart';
import '../../player/providers/player_provider.dart';
import '../../../core/models/track.dart';
import '../../../core/models/album.dart';

class AlbumDetailScreen extends ConsumerWidget {
  final Album album; // Hoặc có thể truyền id và fetch lại, nhưng truyền Album để có ảnh bia sẵn

  const AlbumDetailScreen({Key? key, required this.album}) : super(key: key);

  String _getImageUrl(String? path) {
    if (path == null || path.isEmpty || path == 'null') {
      return 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop';
    }
    if (path.startsWith('http')) return path;
    return 'https://music4-v3-storage-kenz.s3.ap-southeast-1.amazonaws.com/$path';
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tracksAsync = ref.watch(albumTracksProvider(album.id));

    return Scaffold(
      backgroundColor: const Color(0xFF0F1722),
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 300,
            pinned: true,
            backgroundColor: const Color(0xFF0F1722),
            flexibleSpace: FlexibleSpaceBar(
              title: Text(album.name, style: const TextStyle(fontWeight: FontWeight.bold)),
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Image.network(_getImageUrl(album.img), fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(color: Colors.grey[900])),
                  // Hiệu ứng mờ dần
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [Colors.transparent, const Color(0xFF0F1722).withValues(alpha: 1.0)],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          tracksAsync.when(
            data: (tracks) {
              if (tracks.isEmpty) {
                return const SliverFillRemaining(
                  child: Center(child: Text('Chưa có bài hát nào trong Album', style: TextStyle(color: Colors.grey))),
                );
              }
              
              return SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    if (index == 0) {
                      // Nút Play All ở đầu danh sách
                      return Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: ElevatedButton.icon(
                          onPressed: () {
                            ref.read(playerProvider.notifier).playTrack(tracks[0], queue: tracks);
                          },
                          icon: const Icon(Icons.play_arrow, color: Colors.white),
                          label: const Text('PHÁT TẤT CẢ', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blueAccent,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                          ),
                        ),
                      );
                    }
                    
                    final track = tracks[index - 1];
                    return ListTile(
                      leading: Text('${index}', style: const TextStyle(color: Colors.grey, fontSize: 16)),
                      title: Text(track.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      subtitle: Text(track.artists.map((a) => a.name).join(', '), maxLines: 1, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                      trailing: const Icon(Icons.more_horiz, color: Colors.grey),
                      onTap: () {
                        ref.read(playerProvider.notifier).playTrack(track, queue: tracks);
                      },
                    );
                  },
                  childCount: tracks.length + 1,
                ),
              );
            },
            loading: () => const SliverFillRemaining(child: Center(child: CircularProgressIndicator(color: Colors.blueAccent))),
            error: (err, _) => SliverFillRemaining(child: Center(child: Text('Lỗi: $err', style: const TextStyle(color: Colors.red)))),
          ),
          
          const SliverPadding(padding: EdgeInsets.only(bottom: 100)), // Tránh MiniPlayer
        ],
      ),
    );
  }
}

