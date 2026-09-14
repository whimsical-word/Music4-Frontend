import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:music4_mobile/features/details/providers/details_provider.dart';

void main() async {
  final container = ProviderContainer();
  final repo = container.read(detailsRepositoryProvider);

  try {
    print('Testing getAlbumTracks...');
    final tracks = await repo.getAlbumTracks('2');
    print('Album Tracks: ${tracks.length}');

    print('Testing getArtistInfo...');
    final artist = await repo.getArtistInfo('3');
    print('Artist Name: ${artist.name}');

    print('Testing getArtistAlbums...');
    final albums = await repo.getArtistAlbums('3');
    print('Artist Albums: ${albums.length}');
  } catch (e) {
    print('Error: $e');
  }
}

