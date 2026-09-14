class Artist {
  final String id;
  final String name;
  final String? img;

  Artist({required this.id, required this.name, this.img});

  factory Artist.fromJson(Map<String, dynamic> json) {
    return Artist(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? 'Unknown Artist',
      img: json['img'],
    );
  }
}

