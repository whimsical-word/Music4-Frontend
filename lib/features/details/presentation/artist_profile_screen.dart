import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/details_provider.dart';
import '../../player/providers/player_provider.dart';
import '../../../core/models/track.dart';
import '../../../core/models/album.dart';
import 'album_detail_screen.dart';

class ArtistProfileScreen extends ConsumerWidget {
  final String artistId;

  const ArtistProfileScreen({super.key, required this.artistId});

  String _getImageUrl(String? path) {
    if (path == null || path.isEmpty || path == 'null') {
      return 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop';
    }
    if (path.startsWith('http')) return path;
    return 'https://music4-v3-storage-kenz.s3.ap-southeast-1.amazonaws.com/$path';
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final detailAsync = ref.watch(artistDetailProvider(artistId));

    return Scaffold(
      backgroundColor: const Color(0xFF0F1722),
      body: detailAsync.when(
        data: (data) {
          final artist = data.artist;
          final tracks = data.tracks;
          final albums = data.albums;

          return CustomScrollView(
            slivers: [
              SliverAppBar(
                expandedHeight: 320,
                pinned: true,
                backgroundColor: const Color(0xFF0F1722),
                flexibleSpace: FlexibleSpaceBar(
                  title: Text(artist.name, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                  titlePadding: const EdgeInsets.only(left: 16, bottom: 16),
                  background: Stack(
                    fit: StackFit.expand,
                    children: [
                      Image.network(_getImageUrl(artist.img), fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(color: Colors.grey[900])),
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

              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Row(
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            '1.2M người theo dõi',
                            style: TextStyle(color: Colors.grey, fontSize: 13),
                          ),
                          const SizedBox(height: 12),
                          ElevatedButton.icon(
                            onPressed: () {},
                            icon: const Icon(Icons.person_add, color: Colors.white, size: 16),
                            label: const Text('THEO DÕI', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.transparent,
                              side: const BorderSide(color: Colors.grey),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                            ),
                          ),
                        ],
                      ),
                      const Spacer(),
                      if (tracks.isNotEmpty)
                        IconButton(
                          onPressed: () {
                            ref.read(playerProvider.notifier).playTrack(tracks[0], queue: tracks);
                          },
                          icon: const Icon(Icons.play_circle_fill, color: Colors.green, size: 56),
                        ),
                    ],
                  ),
                ),
              ),

              if (tracks.isNotEmpty) ...[
                const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.fromLTRB(16, 24, 16, 8),
                    child: Text('Bài Hát Phổ Biến', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                  ),
                ),
                SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final track = tracks[index];
                      return ListTile(
                        leading: ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: Image.network(_getImageUrl(track.img), width: 48, height: 48, fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => Container(width: 48, height: 48, color: Colors.grey[900])),
                        ),
                        title: Text(track.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        subtitle: Text('${track.viewCount} lượt nghe', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                        trailing: const Icon(Icons.more_horiz, color: Colors.grey),
                        onTap: () {
                          ref.read(playerProvider.notifier).playTrack(track, queue: tracks);
                        },
                      );
                    },
                    childCount: tracks.length > 5 ? 5 : tracks.length, // Chỉ hiện 5 bài
                  ),
                ),
              ],

              if (albums.isNotEmpty) ...[
                const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.fromLTRB(16, 32, 16, 16),
                    child: Text('Album', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                  ),
                ),
                SliverToBoxAdapter(
                  child: SizedBox(
                    height: 180,
                    child: ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      scrollDirection: Axis.horizontal,
                      itemCount: albums.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 16),
                      itemBuilder: (context, index) {
                        final album = albums[index];
                        return GestureDetector(
                          onTap: () {
                            Navigator.push(context, MaterialPageRoute(builder: (_) => AlbumDetailScreen(album: album)));
                          },
                          child: SizedBox(
                            width: 140,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Expanded(
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(8),
                                    child: Image.network(_getImageUrl(album.img), width: double.infinity, fit: BoxFit.cover,
                                        errorBuilder: (_, __, ___) => Container(color: Colors.grey[900])),
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(album.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ),
              ],

              const SliverPadding(padding: EdgeInsets.only(bottom: 100)),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: Colors.blueAccent)),
        error: (err, _) => Center(child: Text('Lỗi: $err', style: const TextStyle(color: Colors.red))),
      ),
    );
  }
}
