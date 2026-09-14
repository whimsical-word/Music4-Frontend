import '../../../core/models/track.dart';
import '../../../core/models/album.dart';
import '../../../core/models/artist.dart';
import '../../../core/network/dio_client.dart';

class SearchResult {
  final List<Track> tracks;
  final List<Album> albums;
  final List<Artist> artists;

  SearchResult({
    this.tracks = const [],
    this.albums = const [],
    this.artists = const [],
  });

  factory SearchResult.fromJson(Map<String, dynamic> json) {
    List<Track> parseTracks(dynamic data) {
      if (data != null && data['content'] is List) {
        return (data['content'] as List).map((i) => Track.fromJson(i)).toList();
      }
      return [];
    }

    List<Album> parseAlbums(dynamic data) {
      if (data != null && data['content'] is List) {
        return (data['content'] as List).map((i) => Album.fromJson(i)).toList();
      }
      return [];
    }

    List<Artist> parseArtists(dynamic data) {
      if (data != null && data['content'] is List) {
        return (data['content'] as List).map((i) => Artist.fromJson(i)).toList();
      }
      return [];
    }

    return SearchResult(
      tracks: parseTracks(json['tracks']),
      albums: parseAlbums(json['albums']),
      artists: parseArtists(json['artists']),
    );
  }
}

class SearchRepository {
  final DioClient _dioClient;

  SearchRepository(this._dioClient);

  Future<SearchResult> search(String query) async {
    try {
      final response = await _dioClient.dio.get('/search', queryParameters: {
        'q': query,
        'type': 'all',
        'size': 20
      });
      return SearchResult.fromJson(response.data);
    } catch (e) {
      throw Exception('Lỗi tìm kiếm: $e');
    }
  }
}

