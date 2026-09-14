class Album {
  final String id;
  final String name;
  final String? img;

  Album({required this.id, required this.name, this.img});

  factory Album.fromJson(Map<String, dynamic> json) {
    return Album(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? 'Unknown Album',
      img: json['img'],
    );
  }
}

