import '../../../core/models/track.dart';
import '../../../core/models/album.dart';
import '../../../core/models/artist.dart';
import '../../../core/network/dio_client.dart';

class DetailsRepository {
  final DioClient _dioClient;

  DetailsRepository(this._dioClient);

  Future<List<Track>> getAlbumTracks(String albumId) async {
    try {
      final response = await _dioClient.dio.get('/tracks/album/$albumId');
      final data = response.data;
      if (data is List) {
        return data.map((i) => Track.fromJson(i)).toList();
      }
      return [];
    } catch (e) {
      throw Exception('Lỗi khi tải bài hát album: $e');
    }
  }

  Future<Artist> getArtistInfo(String artistId) async {
    try {
      final response = await _dioClient.dio.get('/artists/$artistId');
      return Artist.fromJson(response.data);
    } catch (e) {
      throw Exception('Lỗi khi tải thông tin nghệ sĩ: $e');
    }
  }

  Future<List<Album>> getArtistAlbums(String artistId) async {
    try {
      final response = await _dioClient.dio.get('/albums/artist/$artistId');
      final data = response.data;
      if (data is List) {
        return data.map((i) => Album.fromJson(i)).toList();
      }
      return [];
    } catch (e) {
      throw Exception('Lỗi khi tải album nghệ sĩ: $e');
    }
  }

  Future<List<Track>> getArtistTracks(String artistId) async {
    try {
      final response = await _dioClient.dio.get('/tracks/artist/$artistId');
      final data = response.data;
      if (data is List) {
        return data.map((i) => Track.fromJson(i)).toList();
      }
      return [];
    } catch (e) {
      throw Exception('Lỗi khi tải bài hát nghệ sĩ: $e');
    }
  }
}

