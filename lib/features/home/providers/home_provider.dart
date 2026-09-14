import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/home_repository.dart';
import '../../../core/models/track.dart';
import '../../../core/models/artist.dart';
import '../../../core/models/album.dart';

final homeRepositoryProvider = Provider((ref) {
  final dioClient = ref.watch(dioClientProvider);
  final storage = ref.watch(secureStorageProvider);
  return HomeRepository(dioClient, storage);
});

class HomeData {
  final List<Track> aiRecommendations;
  final List<Album> albums;
  final List<Track> randomTracks;
  final List<Artist> artists;
  final List<Track> top5Tracks;

  HomeData({
    required this.aiRecommendations,
    required this.albums,
    required this.randomTracks,
    required this.artists,
    required this.top5Tracks,
  });
}

final homeDataProvider = FutureProvider<HomeData>((ref) async {
  final repo = ref.watch(homeRepositoryProvider);
  
  final aiRecs = await repo.getAiRecommendations();
  final albums = await repo.getAlbums();
  final tracks = await repo.getRandomTracks();
  final artists = await repo.getArtists();
  final top5 = await repo.getTop5Tracks();

  return HomeData(
    aiRecommendations: aiRecs,
    albums: albums,
    randomTracks: tracks,
    artists: artists,
    top5Tracks: top5,
  );
});

