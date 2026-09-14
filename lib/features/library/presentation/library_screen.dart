import 'package:flutter/material.dart';

class LibraryScreen extends StatelessWidget {
  const LibraryScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Text(
        'Thư viện',
        style: TextStyle(fontSize: 24, color: Colors.white),
      ),
    );
  }
}

