import 'package:flutter/material.dart';

class AppTheme {
  static final ThemeData darkTheme = ThemeData(
    brightness: Brightness.dark,
    scaffoldBackgroundColor: const Color(0xFF121212),
    primaryColor: Colors.green, // Giả sử màu chủ đạo là xanh lá (giống Spotify) hoặc đổi lại theo màu logo
    colorScheme: const ColorScheme.dark(
      primary: Colors.green,
      secondary: Colors.white,
      surface: Color(0xFF1E1E1E), // Màu nền của card, mini player
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: Color(0xFF121212),
      elevation: 0,
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: Colors.black,
      selectedItemColor: Colors.white,
      unselectedItemColor: Colors.white54,
      type: BottomNavigationBarType.fixed,
    ),
    fontFamily: 'Roboto', // Đổi font nếu có font tuỳ chỉnh
  );
}
