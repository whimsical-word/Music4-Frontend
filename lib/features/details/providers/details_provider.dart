import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/details_repository.dart';
import '../../../core/models/track.dart';
import '../../../core/models/artist.dart';
import '../../../core/models/album.dart';

final detailsRepositoryProvider = Provider((ref) {
  return DetailsRepository(ref.watch(dioClientProvider));
});

// Provider load tracks của một Album
final albumTracksProvider = FutureProvider.family<List<Track>, String>((ref, albumId) async {
  return ref.read(detailsRepositoryProvider).getAlbumTracks(albumId);
});

// Lớp data tổng hợp cho Artist
class ArtistDetailData {
  final Artist artist;
  final List<Album> albums;
  final List<Track> tracks;

  ArtistDetailData({required this.artist, required this.albums, required this.tracks});
}

// Provider load toàn bộ thông tin của Artist (Profile + Albums + Tracks)
final artistDetailProvider = FutureProvider.family<ArtistDetailData, String>((ref, artistId) async {
  final repo = ref.read(detailsRepositoryProvider);
  
  // Gọi API đồng thời
  final results = await Future.wait([
    repo.getArtistInfo(artistId),
    repo.getArtistAlbums(artistId),
    repo.getArtistTracks(artistId),
  ]);
  
  return ArtistDetailData(
    artist: results[0] as Artist,
    albums: results[1] as List<Album>,
    tracks: results[2] as List<Track>,
  );
});

