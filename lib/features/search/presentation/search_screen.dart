import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/search_provider.dart';
import '../../player/providers/player_provider.dart';
import '../../../core/models/track.dart';
import '../../../core/models/artist.dart';
import '../../../core/models/album.dart';
import '../../details/presentation/artist_profile_screen.dart';
import '../../details/presentation/album_detail_screen.dart';

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  String _getImageUrl(String? path) {
    if (path == null || path.isEmpty || path == 'null') {
      return 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop';
    }
    if (path.startsWith('http')) return path;
    return 'https://music4-v3-storage-kenz.s3.ap-southeast-1.amazonaws.com/$path';
  }

  @override
  Widget build(BuildContext context) {
    final searchState = ref.watch(searchProvider);

    return SafeArea(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              controller: _searchController,
              onChanged: (val) => ref.read(searchProvider.notifier).search(val),
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Tìm bài hát, nghệ sĩ, album...',
                hintStyle: TextStyle(color: Colors.grey[500]),
                prefixIcon: const Icon(Icons.search, color: Colors.grey),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, color: Colors.grey),
                        onPressed: () {
                          _searchController.clear();
                          ref.read(searchProvider.notifier).search('');
                        },
                      )
                    : null,
                filled: true,
                fillColor: const Color(0xFF1E293B),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),
          Expanded(
            child: searchState.when(
              data: (result) {
                if (_searchController.text.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.search, size: 64, color: Colors.grey[800]),
                        const SizedBox(height: 16),
                        Text('Tìm kiếm mọi thứ', style: TextStyle(color: Colors.grey[600], fontSize: 16)),
                      ],
                    ),
                  );
                }

                if (result.tracks.isEmpty && result.artists.isEmpty && result.albums.isEmpty) {
                  return const Center(child: Text('Không tìm thấy kết quả', style: TextStyle(color: Colors.grey)));
                }

                return ListView(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  children: [
                    if (result.tracks.isNotEmpty) ...[
                      const Text('Bài Hát', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                      const SizedBox(height: 12),
                      ...result.tracks.map((t) => _buildTrackTile(t, result.tracks)),
                      const SizedBox(height: 24),
                    ],
                    if (result.artists.isNotEmpty) ...[
                      const Text('Nghệ Sĩ', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                      const SizedBox(height: 12),

                      ...result.artists.map((a) => _buildArtistTile(a, context)),
                      const SizedBox(height: 24),
                    ],
                    if (result.albums.isNotEmpty) ...[
                      const Text('Album', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                      const SizedBox(height: 12),

                      ...result.albums.map((a) => _buildAlbumTile(a, context)),
                      const SizedBox(height: 24),
                    ],
                  ],
                );
              },
              loading: () => const Center(child: CircularProgressIndicator(color: Colors.blueAccent)),
              error: (err, _) => Center(child: Text('Lỗi: $err', style: const TextStyle(color: Colors.red))),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTrackTile(Track track, List<Track> queue) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: ClipRRect(
        borderRadius: BorderRadius.circular(6),
        child: Image.network(_getImageUrl(track.img), width: 48, height: 48, fit: BoxFit.cover, errorBuilder: (_,__,___) => Container(width: 48, height: 48, color: Colors.grey[900])),
      ),
      title: Text(track.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      subtitle: Text(track.artists.map((a) => a.name).join(', '), maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.grey, fontSize: 12)),
      trailing: const Icon(Icons.more_horiz, color: Colors.grey),
      onTap: () {
        ref.read(playerProvider.notifier).playTrack(track, queue: queue);
      },
    );
  }


  Widget _buildArtistTile(Artist artist, BuildContext context) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: ClipOval(
        child: Image.network(_getImageUrl(artist.img), width: 48, height: 48, fit: BoxFit.cover, errorBuilder: (_,__,___) => Container(width: 48, height: 48, color: Colors.grey[900])),
      ),
      title: Text(artist.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      subtitle: const Text('Nghệ Sĩ', style: TextStyle(color: Colors.grey, fontSize: 12)),
      onTap: () {
        // Mở Artist Detail
        Navigator.push(context, MaterialPageRoute(builder: (_) => ArtistProfileScreen(artistId: artist.id)));
      },
    );
  }


  Widget _buildAlbumTile(Album album, BuildContext context) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: ClipRRect(
        borderRadius: BorderRadius.circular(6),
        child: Image.network(_getImageUrl(album.img), width: 48, height: 48, fit: BoxFit.cover, errorBuilder: (_,__,___) => Container(width: 48, height: 48, color: Colors.grey[900])),
      ),
      title: Text(album.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      subtitle: const Text('Album', style: TextStyle(color: Colors.grey, fontSize: 12)),
      onTap: () {
        // Mở Album Detail
        Navigator.push(context, MaterialPageRoute(builder: (_) => AlbumDetailScreen(album: album)));
      },
    );
  }
}
