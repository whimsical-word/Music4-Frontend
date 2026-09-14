import 'artist.dart';

class Track {
  final String id;
  final String name;
  final String? img;
  final String? src;
  final int viewCount;
  final List<Artist> artists;

  Track({
    required this.id,
    required this.name,
    this.img,
    this.src,
    this.viewCount = 0,
    this.artists = const [],
  });

  factory Track.fromJson(Map<String, dynamic> json) {
    List<Artist> artists = [];
    if (json['artists'] is List) {
      artists = (json['artists'] as List).map((i) => Artist.fromJson(i)).toList();
    }

    return Track(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? 'Unknown Track',
      img: json['img'],
      src: json['filePath'] ?? json['previewPath'] ?? json['src'],
      viewCount: json['viewCount'] ?? 0,
      artists: artists,
    );
  }
}

