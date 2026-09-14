import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/home_provider.dart';
import '../../../core/models/track.dart';
import '../../../core/models/album.dart';
import '../../../core/models/artist.dart';
import '../../auth/providers/auth_provider.dart';
import '../../player/providers/player_provider.dart';
import '../../details/presentation/artist_profile_screen.dart';
import '../../details/presentation/album_detail_screen.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({Key? key}) : super(key: key);

  String _getImageUrl(String? path) {
    if (path == null || path.isEmpty || path == 'null') {
      return 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop';
    }
    if (path.startsWith('http')) {
      return path;
    }
    return 'https://music4-v3-storage-kenz.s3.ap-southeast-1.amazonaws.com/$path';
  }

  Widget _buildSectionTitle(String title, {VoidCallback? onViewAll}) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(width: 4, height: 20, decoration: BoxDecoration(color: Colors.blue[400], borderRadius: BorderRadius.circular(4))),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: -0.5),
              ),
            ],
          ),
          if (onViewAll != null)
            GestureDetector(
              onTap: onViewAll,
              child: const Text(
                'XEM TẤT CẢ',
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildHorizontalList({
    required int itemCount,
    required Widget Function(BuildContext, int) itemBuilder,
  }) {
    return SizedBox(
      height: 200,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 16.0),
        scrollDirection: Axis.horizontal,
        itemCount: itemCount,
        separatorBuilder: (_, __) => const SizedBox(width: 16),
        itemBuilder: itemBuilder,
      ),
    );
  }

  Widget _buildTrackCard(Track track, List<Track> queue, WidgetRef ref) {
    return GestureDetector(
      onTap: () => ref.read(playerProvider.notifier).playTrack(track, queue: queue),
      child: Container(
        width: 140,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFF0F1722),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.network(
                  _getImageUrl(track.img),
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    print('Error loading image: $error');
                    return Container(
                      color: Colors.grey[900],
                      child: const Icon(Icons.music_note, color: Colors.grey),
                    );
                  },
                ),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              track.name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white),
            ),
            const SizedBox(height: 4),
            Text(
              track.artists.map((a) => a.name).join(', '),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 11, color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAlbumCard(Album album, BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.push(context, MaterialPageRoute(builder: (_) => AlbumDetailScreen(album: album)));
      },
      child: Container(
        width: 140,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFF0F1722),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.network(
                  _getImageUrl(album.img),
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => Container(
                    color: Colors.grey[900],
                    child: const Icon(Icons.album, color: Colors.grey),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              album.name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white),
            ),
            const SizedBox(height: 4),
            const Text(
              'ALBUM',
              style: TextStyle(fontSize: 10, color: Colors.grey, letterSpacing: 1),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildArtistCard(Artist artist, BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.push(context, MaterialPageRoute(builder: (_) => ArtistProfileScreen(artistId: artist.id)));
      },
      child: Container(
        width: 140,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFF0F1722),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Expanded(
              child: ClipOval(
                child: Image.network(
                  _getImageUrl(artist.img),
                  width: 116,
                  height: 116,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => Container(
                    width: 116,
                    height: 116,
                    color: Colors.grey[900],
                    child: const Icon(Icons.person, color: Colors.grey),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              artist.name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white),
            ),
            const SizedBox(height: 4),
            const Text(
              'ARTIST',
              style: TextStyle(fontSize: 10, color: Colors.grey, letterSpacing: 1),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTop5List(List<Track> top5, WidgetRef ref) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0F1722),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: Column(
        children: List.generate(top5.length, (index) {
          final track = top5[index];
          Color rankColor = Colors.grey;
          if (index == 0) rankColor = const Color(0xFFFFD700);
          if (index == 1) rankColor = const Color(0xFFC0C0C0);
          if (index == 2) rankColor = const Color(0xFFCD7F32);

          return Padding(
            padding: const EdgeInsets.only(bottom: 12.0),
            child: GestureDetector(
              onTap: () => ref.read(playerProvider.notifier).playTrack(track, queue: top5),
              child: Row(
                children: [
                  SizedBox(
                    width: 30,
                    child: Text(
                      '${index + 1 < 10 ? '0' : ''}${index + 1}',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: rankColor),
                    ),
                  ),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: Image.network(
                      _getImageUrl(track.img),
                      width: 48,
                      height: 48,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) => Container(
                        width: 48,
                        height: 48,
                        color: Colors.grey[900],
                        child: const Icon(Icons.music_note, color: Colors.grey, size: 20),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(track.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white)),
                        Text(track.artists.map((a) => a.name).join(', '), maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                      ],
                    ),
                  ),
                  Text(
                    '${track.viewCount}',
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  const SizedBox(width: 8),
                  const Icon(Icons.more_horiz, color: Colors.grey, size: 20),
                ],
              ),
            ),
          );
        }),
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final homeDataAsync = ref.watch(homeDataProvider);
    final authState = ref.watch(authProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF0D131A),
      body: homeDataAsync.when(
        data: (data) {
          return RefreshIndicator(
            onRefresh: () async => ref.refresh(homeDataProvider),
            child: ListView(
              padding: const EdgeInsets.only(top: 48, bottom: 100),
              children: [
                // Banner
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [Color(0xFF0F1722), Color(0xFF131E2E)]),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      RichText(
                        text: TextSpan(
                          text: 'Chào buổi chiều, ',
                          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
                          children: [
                            TextSpan(
                              text: authState.name ?? 'Listener',
                              style: const TextStyle(color: Colors.blueAccent),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Hệ thống gợi ý đã sẵn sàng. Khám phá những giai điệu dành riêng cho bạn hôm nay.',
                        style: TextStyle(fontSize: 13, color: Colors.grey[400]),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                if (data.aiRecommendations.isNotEmpty) ...[
                  _buildSectionTitle('Gợi Ý Dành Riêng Cho Bạn'),
                  _buildHorizontalList(
                    itemCount: data.aiRecommendations.length,
                    itemBuilder: (context, index) => _buildTrackCard(data.aiRecommendations[index], data.aiRecommendations, ref),
                  ),
                ],

                if (data.albums.isNotEmpty) ...[
                  _buildSectionTitle('Album Nổi Bật', onViewAll: () {}),
                  _buildHorizontalList(
                    itemCount: data.albums.length,

                    itemBuilder: (context, index) => _buildAlbumCard(data.albums[index], context),
                  ),
                ],

                if (data.randomTracks.isNotEmpty) ...[
                  _buildSectionTitle('Khám phá Bài Hát', onViewAll: () {}),
                  _buildHorizontalList(
                    itemCount: data.randomTracks.length,
                    itemBuilder: (context, index) => _buildTrackCard(data.randomTracks[index], data.randomTracks, ref),
                  ),
                ],

                if (data.artists.isNotEmpty) ...[
                  _buildSectionTitle('Nghệ Sĩ Nổi Bật', onViewAll: () {}),
                  _buildHorizontalList(
                    itemCount: data.artists.length,

                    itemBuilder: (context, index) => _buildArtistCard(data.artists[index], context),
                  ),
                ],

                if (data.top5Tracks.isNotEmpty) ...[
                  _buildSectionTitle('Biểu Đồ Top 5 Thịnh Hành'),
                  _buildTop5List(data.top5Tracks, ref),
                ],
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: Colors.blue)),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('Có lỗi xảy ra: $error', style: const TextStyle(color: Colors.red)),
              ElevatedButton(onPressed: () => ref.refresh(homeDataProvider), child: const Text('Thử lại')),
            ],
          ),
        ),
      ),
    );
  }
}
