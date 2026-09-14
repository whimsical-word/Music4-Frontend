import '../../../core/network/dio_client.dart';
import '../../../core/models/track.dart';
import '../../../core/models/artist.dart';
import '../../../core/models/album.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';

class HomeRepository {
  final DioClient _dioClient;
  final FlutterSecureStorage _storage;

  HomeRepository(this._dioClient, this._storage);

  Future<String?> _getUserId() async {
    final token = await _storage.read(key: 'jwt_token');
    if (token == null) return null;
    try {
      final parts = token.split('.');
      if (parts.length != 3) return null;
      final payload = utf8.decode(base64Url.decode(base64Url.normalize(parts[1])));
      final data = jsonDecode(payload);
      // Giả sử userId lưu trong sub hoặc field nào đó tùy token backend,
      // Trong web: actualUserId = useAuthStore.userId hoặc trích xuất từ token
      return data['id']?.toString(); 
    } catch (e) {
      return null;
    }
  }

  Future<List<Track>> getAiRecommendations() async {
    try {
      final userId = await _getUserId();
      if (userId == null) return [];
      
      final response = await _dioClient.dio.get('/recommendations', queryParameters: {'userId': userId});
      final data = response.data;
      if (data is List) {
        return data.map((json) => Track.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      return []; // Fallback empty
    }
  }

  Future<List<Track>> getRandomTracks() async {
    try {
      final response = await _dioClient.dio.get('/tracks/random', queryParameters: {
        'seed': 1234, // Math.random() in dart
        'page': 0,
        'size': 12
      });
      final data = response.data['content'] ?? response.data['data'] ?? response.data;
      if (data is List) {
        return data.map((json) => Track.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  Future<List<Album>> getAlbums() async {
    try {
      final response = await _dioClient.dio.get('/albums');
      final data = response.data['content'] ?? response.data['data'] ?? response.data;
      if (data is List) {
        return data.map((json) => Album.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  Future<List<Artist>> getArtists() async {
    try {
      final response = await _dioClient.dio.get('/artists');
      final data = response.data['content'] ?? response.data['data'] ?? response.data;
      if (data is List) {
        return data.map((json) => Artist.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  Future<List<Track>> getTop5Tracks() async {
    try {
      final response = await _dioClient.dio.get('/tracks/top5-views');
      final data = response.data['content'] ?? response.data['data'] ?? response.data;
      if (data is List) {
        return data.map((json) => Track.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }
}

