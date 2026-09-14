import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../player/presentation/mini_player.dart';

class MainShellScreen extends StatelessWidget {
  final Widget child;

  const MainShellScreen({Key? key, required this.child}) : super(key: key);

  int _calculateSelectedIndex(BuildContext context) {
    final String location = GoRouterState.of(context).uri.toString();
    if (location.startsWith('/search')) return 1;
    if (location.startsWith('/library')) return 2;
    return 0; // Trang chủ
  }

  void _onItemTapped(int index, BuildContext context) {
    switch (index) {
      case 0:
        context.go('/');
        break;
      case 1:
        context.go('/search');
        break;
      case 2:
        context.go('/library');
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child, // Hiển thị nội dung của tab tương ứng
      bottomNavigationBar: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const MiniPlayer(), // Mini Player hiển thị phía trên thanh điều hướng
          BottomNavigationBar(
            currentIndex: _calculateSelectedIndex(context),
            onTap: (index) => _onItemTapped(index, context),
            items: const [
              BottomNavigationBarItem(
                icon: Icon(Icons.home_outlined),
                label: 'Trang chủ',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.search_outlined),
                label: 'Tìm kiếm',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.library_music_outlined),
                label: 'Thư viện',
              ),
            ],
          ),
        ],
      ),
    );
  }
}

